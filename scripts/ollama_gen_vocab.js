/**
 * 用本機 Ollama (qwen3.5:9b) 依會考難度校準批次生成單字選擇題，
 * 輸出 schema 與 server/data/question_bank_vocab.json 完全相容。
 *
 * 難度校準來源：000_Agent/skills/exam-question-generator 的
 * references/calibration/vocabulary.json + sample_questions/vocabulary_samples.json
 * （會考 108-115 年單字選擇題歷屆分析），已內嵌於本檔避免跨資料夾依賴。
 *
 * 用法：
 *   node scripts/ollama_gen_vocab.js --count 1                 # 先產 1 題看品質，只寫 staging 檔
 *   node scripts/ollama_gen_vocab.js --count 100 --merge        # 產 100 題並直接併入正式題庫
 */

const fs = require('fs');
const path = require('path');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'qwen3.5:9b';
const BATCH_SIZE = 5;
const MAX_RETRIES_PER_BATCH = 3;

const BANK_PATH = path.resolve(__dirname, '../server/data/question_bank_vocab.json');
const STAGING_PATH = path.resolve(__dirname, '../server/data/question_bank_vocab_generated.json');

// ---- 難度校準表（source: exam-question-generator/references/calibration/vocabulary.json + vocab_tiers.json）----
// tier_examples 取自 vocab_tiers.json 教育部核心2000字彙表分層範例，作為「用字register」錨點，
// 避免模型自行發揮選到機械/科技術語等偏離真實會考語域的字。
const DIFFICULTY_SPEC = {
  1: { label: '基礎（七上）',   vocab_tier: 'T1',    pos: 'noun / basic verb',            words: '8-12',  clue: '明確線索（explicit）：句中直接說明原因或結果', distractor: '形似詞干擾',
       tier_examples: 'go, come, make, good, big, day, time, people, school, happy（rank 1-500，最高頻日常用詞）' },
  2: { label: '初級（七下-八）', vocab_tier: 'T1-T2', pos: 'noun / basic verb / adjective', words: '10-15', clue: '隱含線索（implicit）：需連結前後句意',        distractor: '同類詞干擾',
       tier_examples: 'environment, culture, experience, improve, achieve, comfortable, similar, recently（rank 501-1200，標準會考詞彙）' },
  3: { label: '中等（會考B級）', vocab_tier: 'T2',    pos: 'adjective / adverb / basic verb', words: '13-18', clue: '隱含線索，句子含一個子句',                    distractor: '語意相近詞干擾',
       tier_examples: 'environment, culture, experience, improve, achieve, comfortable, similar, recently（rank 501-1200，標準會考詞彙）' },
  4: { label: '進階（會考B+）',  vocab_tier: 'T2-T3', pos: 'adverb / phrasal verb / adjective', words: '15-20', clue: '線索極少，需推理',                          distractor: '常見易混淆詞',
       tier_examples: 'demonstrate, significant, consequence, elaborate, sufficient, perspective（rank 1201-1800，會考進階詞彙，B+~A-）' },
  5: { label: '困難（會考A級）', vocab_tier: 'T3-T4', pos: 'phrasal verb / adverb / basic verb', words: '18-24', clue: '線索極少，句子含兩個子句',                 distractor: '語意相近詞（高辨析度）',
       tier_examples: 'contemporary, phenomenon, controversy, inevitable, sophisticated（rank 1801-2000，核心2000字末段，會考最難詞彙）' },
  6: { label: '挑戰（高中入門）', vocab_tier: 'T4-T5', pos: 'idiom / phrasal verb / preposition collocation', words: '20-28', clue: '幾乎無線索，純慣用語判斷', distractor: '語意相近詞（極高辨析度）',
       tier_examples: 'anthropology, paradox, pragmatic, deteriorate, proliferate（rank 2000+，超綱詞彙，高中程度——僅供register參考，實際出題仍須是「抽象概念/人文社會」類詞而非罕見專業術語）' },
};

// 常見簡體專用字（繁體中文不會出現的寫法），用於偵測模型混入簡體字——
// 專案 CLAUDE.md 絕對規則：全站一律繁體中文（台灣用語），偵測到即整題丟棄重生。
const SIMPLIFIED_ONLY_CHARS = '达义无会为学说现时长门问间关还这个来从让应该号电车华国图书见买卖认识语词汇头觉变员众医药儿边连严归导层团标准济术业产权价单简历运动气约资谈论证';

function containsSimplified(text) {
  if (!text) return false;
  return [...SIMPLIFIED_ONLY_CHARS].some((ch) => text.includes(ch));
}

// qwen3.5 偶爾會把內部推理過程直接寫進 explanation（英文碎念、猶豫、自我修正），
// 用「過長 + 大量英文字母 + 推理關鍵字」偵測並整題丟棄重生，避免污染題庫。
function looksLikeLeakedReasoning(text) {
  if (!text) return true;
  if (text.length > 220) return true;
  const asciiLetters = (text.match(/[A-Za-z]/g) || []).length;
  if (asciiLetters > 90) return true;
  if (/\b(let'?s|wait,|re-?evaluate|regenerate|strict rules?|rule \d|must not|i (?:think|believe)|hmm)\b/i.test(text)) return true;
  return false;
}

// target_word 不可原形直接出現在空格以外的句子中，否則等於把答案寫在題目裡。
function targetWordLeaked(sentence, targetWord) {
  const rest = sentence.replace(/_+/g, ' ');
  const bare = targetWord.trim().toLowerCase().split(/\s+/)[0]; // 片語只檢查第一個字避免誤判
  if (!bare) return false;
  const escaped = bare.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\w*\\b`, 'i').test(rest);
}

// optionsZh 只能是純翻譯，不可含括號註記（如「(錯)」）或刪節號等模型自語痕跡。
function optionsZhMalformed(arr) {
  return arr.some((s) => /[（(]|\.\.\./.test(s) || s.trim().length < 1);
}

const GSAT_TOPICS = [
  '環境保護 (environment/recycle/pollution/energy)',
  '科技與網路 (technology/internet/smartphone/social media)',
  '健康生活 (health/exercise/diet/lifestyle)',
  '台灣文化 (tradition/festival/culture/local)',
  '學校與人際 (school/friend/relationship/community)',
  '旅遊與地理 (travel/country/city/transportation)',
  '動物與自然 (animal/nature/habitat/species)',
];

// 依歷屆會考單字題實際佔比抽樣難度（3 級最多，兩端最少）
const DIFFICULTY_WEIGHTS = [1, 2, 2, 3, 3, 3, 3, 4, 4, 5, 5, 6];

const FEW_SHOT = [
  {
    sentence: "Tina is very _____ about the trip to Japan. She has been talking about it all day.",
    options: ["(A) bored", "(B) excited", "(C) tired", "(D) worried"],
    optionsZh: ["無聊的", "興奮的", "疲倦的", "擔心的"],
    answer: 1,
    explanation: "從 'has been talking about it all day' 可知 Tina 非常期待，選 (B) excited（興奮的）。bored 無聊、tired 疲倦、worried 擔心都與語境不符。",
    pos: "形容詞",
    target_word: "excited",
    difficulty: 1,
  },
  {
    sentence: "The scientist's theory was considered _____ at first, but later experiments proved it to be correct.",
    options: ["(A) reasonable", "(B) ridiculous", "(C) remarkable", "(D) relevant"],
    optionsZh: ["合理的", "荒謬的", "卓越的", "相關的"],
    answer: 1,
    explanation: "轉折詞 'but later proved correct' 暗示最初的評價是負面的，選 (B) ridiculous（荒謬的）。四個選項都是 r 開頭的形容詞，是難度較高的形近詞干擾題。",
    pos: "形容詞",
    target_word: "ridiculous",
    difficulty: 5,
  },
];

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sentence: { type: 'string' },
          options: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
          optionsZh: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
          answer: { type: 'integer' },
          explanation: { type: 'string' },
          pos: { type: 'string' },
          target_word: { type: 'string' },
          difficulty: { type: 'integer' },
        },
        required: ['sentence', 'options', 'optionsZh', 'answer', 'explanation', 'pos', 'target_word', 'difficulty'],
      },
    },
  },
  required: ['questions'],
};

function pickDifficulties(n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push(DIFFICULTY_WEIGHTS[Math.floor(Math.random() * DIFFICULTY_WEIGHTS.length)]);
  }
  return out;
}

function buildPrompt(difficulties, avoidWords) {
  const specLines = [...new Set(difficulties)].map((d) => {
    const s = DIFFICULTY_SPEC[d];
    return `- 難度 ${d}（${s.label}）：詞彙分級 ${s.vocab_tier}，詞性偏好 ${s.pos}，句長 ${s.words} 字，語境線索：${s.clue}，干擾選項策略：${s.distractor}\n  同分層真實會考用字範例（僅供register/難度感參考，不可直接抄用）：${s.tier_examples}`;
  }).join('\n');

  const avoidLine = avoidWords.length
    ? `\n以下單字最近已出過，禁止再作為 target_word：${avoidWords.slice(-60).join(', ')}`
    : '';

  return `你是台灣國中教育會考（GSAT）英文科單字選擇題出題專家。請依照以下規格產生 ${difficulties.length} 題單字選擇題（vocabulary multiple choice），難度依序為：[${difficulties.join(', ')}]。

## 難度校準規格
${specLines}

## 用字語域鐵則（非常重要）
- 即使是最高難度（5-6），target_word 也必須是「教育部國中核心2000字彙表」內或其臨近延伸的字，屬於**抽象概念/人文社會/日常學術**類詞彙（如 contemporary、phenomenon、controversy、inevitable、sophisticated、anthropology、paradox），**絕對不可選機械、程式、醫學、法律等專業技術術語**（例如 autonomously、algorithm、diagnosis 這類字不合適）。
- **難度與字彙稀有度必須成正比**：難度 1-2 才可用 happy/angry/discuss/successful 這類高頻基礎字；難度 3 以上禁止使用這些過於基礎的字，必須換成對應 tier_examples 稀有度等級的字（例如難度4要用 demonstrate/significant/elaborate 這個級別的字，而不是 discuss/successful）。生成前請先確認 target_word 的常見程度與指定難度相符。
- 句子主題只能從以下七大會考常考主題中選：
  ${GSAT_TOPICS.map((t) => `- ${t}`).join('\n  ')}
- 難度越高，句中線索必須越隱晦、越需要「排除法」或「上下文語氣推理」才能作答，**絕不可在空格前後直接用同義詞或字面解釋洩漏答案**（例如 "without any external power source" 之類直接定義答案的寫法在難度4以上禁止使用）。

## 語言規則（絕對規則）
- explanation、pos、optionsZh 一律使用**繁體中文（台灣用語）**，嚴禁出現任何簡體字或大陸用語。
- explanation 引用句子線索時，只能逐字引用句子中「實際存在」的字句，不可轉述、改寫或杜撰句子裡沒有的句型。

## 出題規則
1. 每題是一個含空格的英文句子，空格用 5 個底線 "_____" 表示，句意須讓空格處唯一合理答案明確可推。
2. 每題 4 個選項，格式必須是 "(A) word"、"(B) word"、"(C) word"、"(D) word"（含括號字母前綴）。
3. optionsZh 是對應 4 個選項「該單字本身」的繁體中文翻譯，只翻譯單字/片語本身，禁止附加句中名詞或組成短語（例如 controversial 只能翻「具爭議的」，不可寫成「具爭議的議題」）。
4. answer 是正確選項的 index（0=A, 1=B, 2=C, 3=D）。
5. explanation 是 50-80 字繁體中文詳解，引用句中關鍵線索時必須是句子裡「原文實際出現的字句」，不可轉述成句子裡沒有的句型或片語；並簡短說明為何其餘 3 個選項不對。
6. pos 是該單字的中文詞性（例如：名詞、動詞、形容詞、副詞、片語動詞）。
7. target_word 是正確答案的原形單字或片語（不含括號字母）。
8. 4 個選項須同詞性、長度相近，避免「最長的就是答案」這種明顯提示。
9. 每題單字不可重複，且不可與下列已出現單字重複。${avoidLine}
10. 句子主題多元，同一批題目不可有兩題以上使用相同主題類別。

## 範例（格式參考，難度僅供對照，不可照抄內容）
${JSON.stringify(FEW_SHOT, null, 2)}

請只輸出符合 schema 的 JSON，不要輸出任何額外說明文字。`;
}

async function callOllama(prompt) {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false,
      think: false,
      format: RESPONSE_SCHEMA,
      options: { temperature: 0.65, num_predict: 4096 },
    }),
  });
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  if (!data.response || !data.response.trim()) {
    throw new Error(`Ollama returned empty response (done_reason: ${data.done_reason})`);
  }
  return JSON.parse(data.response);
}

function validateItem(item, avoidWordsSet) {
  if (!item || typeof item !== 'object') return 'not an object';
  if (typeof item.sentence !== 'string' || !/_{3,}/.test(item.sentence)) return 'sentence missing blank';
  if (!Array.isArray(item.options) || item.options.length !== 4) return 'options must have 4 items';
  if (!Array.isArray(item.optionsZh) || item.optionsZh.length !== 4) return 'optionsZh must have 4 items';
  if (!Number.isInteger(item.answer) || item.answer < 0 || item.answer > 3) return 'answer must be 0-3';
  if (typeof item.explanation !== 'string' || item.explanation.length < 10) return 'explanation too short';
  if (typeof item.pos !== 'string' || !item.pos) return 'pos missing';
  if (typeof item.target_word !== 'string' || !item.target_word) return 'target_word missing';
  const key = item.target_word.trim().toLowerCase();
  if (avoidWordsSet.has(key)) return `duplicate target_word: ${item.target_word}`;
  if (containsSimplified(item.explanation) || containsSimplified(item.pos) || (item.optionsZh || []).some(containsSimplified)) {
    return 'contains simplified Chinese characters (violates 繁體中文 rule)';
  }
  if (looksLikeLeakedReasoning(item.explanation)) return 'explanation looks like leaked reasoning/CoT';
  if (targetWordLeaked(item.sentence, item.target_word)) return 'target word leaked directly in sentence text';
  if (optionsZhMalformed(item.optionsZh)) return 'optionsZh contains malformed annotation';
  return null;
}

function normalizeBlank(sentence) {
  return sentence.replace(/_{3,}/g, '_____');
}

function normalizeOptions(options) {
  const letters = ['A', 'B', 'C', 'D'];
  return options.map((opt, i) => {
    const trimmed = String(opt).trim();
    return /^\([A-D]\)/.test(trimmed) ? trimmed : `(${letters[i]}) ${trimmed}`;
  });
}

async function generateBatch(count, avoidWordsSet) {
  const difficulties = pickDifficulties(count);
  let lastErr = null;
  for (let attempt = 1; attempt <= MAX_RETRIES_PER_BATCH; attempt++) {
    try {
      const prompt = buildPrompt(difficulties, [...avoidWordsSet]);
      const parsed = await callOllama(prompt);
      const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
      const valid = [];
      for (const item of questions) {
        const err = validateItem(item, avoidWordsSet);
        if (err) {
          console.warn(`  [略過] ${err} — ${JSON.stringify(item)}`);
          continue;
        }
        item.sentence = normalizeBlank(item.sentence);
        item.options = normalizeOptions(item.options);
        valid.push(item);
        avoidWordsSet.add(item.target_word.trim().toLowerCase());
      }
      if (valid.length > 0) return valid;
      lastErr = new Error('batch produced 0 valid items');
    } catch (e) {
      lastErr = e;
      console.warn(`  [重試 ${attempt}/${MAX_RETRIES_PER_BATCH}] ${e.message}`);
    }
  }
  throw lastErr || new Error('batch failed with unknown error');
}

function loadExistingBank() {
  if (!fs.existsSync(BANK_PATH)) return [];
  return JSON.parse(fs.readFileSync(BANK_PATH, 'utf8'));
}

function nextIdStart(existingBank, stagingExisting) {
  const all = [...existingBank, ...stagingExisting];
  let max = -1;
  for (const q of all) {
    const m = /^vocab_(\d+)$/.exec(q.id || '');
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max + 1;
}

async function main() {
  const args = process.argv.slice(2);
  const getArg = (name, def) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : def;
  };
  const count = parseInt(getArg('count', '1'), 10);
  const doMerge = args.includes('--merge');

  const existingBank = loadExistingBank();
  const stagingExisting = fs.existsSync(STAGING_PATH) ? JSON.parse(fs.readFileSync(STAGING_PATH, 'utf8')) : [];
  const avoidWordsSet = new Set();
  for (const q of [...existingBank, ...stagingExisting]) {
    // 舊資料沒有 target_word 欄位，退而求其次用 pos+sentence 前幾字避免完全雷同判斷失效即可略過
    if (q.target_word) avoidWordsSet.add(String(q.target_word).trim().toLowerCase());
  }

  console.log(`使用模型：${MODEL}｜目標題數：${count}｜現有題庫：${existingBank.length} 題（+staging ${stagingExisting.length} 題）`);

  const generated = [];
  let idCounter = nextIdStart(existingBank, stagingExisting);

  while (generated.length < count) {
    const remain = count - generated.length;
    const batchSize = Math.min(BATCH_SIZE, remain);
    console.log(`\n生成批次：${batchSize} 題（累計 ${generated.length}/${count}）...`);
    const batch = await generateBatch(batchSize, avoidWordsSet);
    for (const item of batch) {
      generated.push({
        id: `vocab_${idCounter++}`,
        sentence: item.sentence,
        options: item.options,
        answer: item.answer,
        explanation: item.explanation,
        pos: item.pos,
        optionsZh: item.optionsZh,
        target_word: item.target_word,
        difficulty: item.difficulty,
      });
    }
    console.log(`  本批有效題數：${batch.length}`);
  }

  const combinedStaging = [...stagingExisting, ...generated];
  fs.writeFileSync(STAGING_PATH, JSON.stringify(combinedStaging, null, 2), 'utf8');
  console.log(`\n已寫入 staging 檔：${STAGING_PATH}（共 ${combinedStaging.length} 題）`);

  if (doMerge) {
    const merged = [...existingBank, ...generated];
    fs.writeFileSync(BANK_PATH, JSON.stringify(merged, null, 2), 'utf8');
    console.log(`已併入正式題庫：${BANK_PATH}（共 ${merged.length} 題）`);
  }

  console.log('\n=== 本次新生成的題目 ===');
  console.log(JSON.stringify(generated, null, 2));
}

main().catch((e) => {
  console.error('生成失敗：', e);
  process.exit(1);
});
