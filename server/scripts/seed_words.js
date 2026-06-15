/**
 * 會考 2000 字匯入腳本
 * 來源：official_with_pos.txt（每行格式：word pos.）
 * 流程：讀檔 → 比對 DB 現有字 → 批次呼叫 Gemini 1.5 Flash 取中文定義 → 寫入 DB
 *
 * 執行：node server/scripts/seed_words.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const fs       = require('fs');
const path     = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const supabase = require('../db/supabase');

const SOURCE_FILE = path.join(__dirname, '../../official_with_pos.txt');
const BATCH_SIZE  = 50;  // 每批送 Gemini 的單字數
const DELAY_MS    = 1200; // 批次間延遲（ms），避免速率限制

const POS_MAP = {
  'n.':     '名詞',
  'v.':     '動詞',
  'adj.':   '形容詞',
  'adv.':   '副詞',
  'conj.':  '連接詞',
  'prep.':  '介系詞',
  'pron.':  '代名詞',
  'aux.':   '助動詞',
  'int.':   '感嘆詞',
  'det.':   '限定詞',
  'num.':   '數詞',
};

// ── 1. 解析 official_with_pos.txt ──────────────────────────────
function parseSourceFile() {
  const raw   = fs.readFileSync(SOURCE_FILE, 'utf-8');
  const lines = raw.split('\n');
  const words = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // 格式：word pos.  或  multi word n.
    const match = line.match(/^(.+?)\s+(n\.|v\.|adj\.|adv\.|conj\.|prep\.|pron\.|aux\.|int\.|det\.|num\.)\s*$/);
    if (!match) continue;

    const word = match[1].trim().toLowerCase();
    const pos  = POS_MAP[match[2]] || match[2];

    if (word && pos) {
      words.push({ word, pos, frequency_rank: words.length + 1 });
    }
  }

  return words;
}

// ── 2. 取得 DB 現有單字與最大 ID ───────────────────────────────
async function getExistingWords() {
  const { data, error } = await supabase
    .from('words')
    .select('word');
  if (error) throw new Error(`DB 查詢失敗：${error.message}`);
  return new Set(data.map(r => r.word.toLowerCase()));
}

async function getMaxId() {
  const { data, error } = await supabase
    .from('words')
    .select('id')
    .order('id', { ascending: false })
    .limit(1);
  if (error) throw new Error(`取得 max id 失敗：${error.message}`);
  return data?.[0]?.id || 0;
}

// ── 3a. Gemini 取中文定義 ───────────────────────────────────────
function buildDefinitionPrompt(wordList) {
  const list = wordList.map(w => `${w.word} (${w.pos})`).join('\n');
  return `你是台灣國中英語教材編輯。請為以下英文單字提供簡短繁體中文釋義（5–12字，符合國中生理解程度）。

只輸出 JSON 陣列，格式如下：
[{"word":"able","definition":"有能力的；能夠"},{"word":"about","definition":"關於；大約"}]

單字清單：
${list}`;
}

async function getDefinitionsGemini(model, wordBatch) {
  try {
    const result  = await model.generateContent(buildDefinitionPrompt(wordBatch));
    const text    = result.response.text();
    const cleaned = text.replace(/```(?:json)?\s*/g, '').replace(/```/g, '').trim();
    const arr     = JSON.parse(cleaned);
    return Object.fromEntries(arr.map(r => [r.word.toLowerCase(), r.definition]));
  } catch {
    return null; // 讓呼叫端 fallback
  }
}

// ── 3b. 免費英文字典 API（fallback）────────────────────────────
async function getDefinitionFreeDict(word) {
  try {
    const res  = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!res.ok) return null;
    const data = await res.json();
    const def  = data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition;
    return def ? def.slice(0, 80) : null;
  } catch {
    return null;
  }
}

async function getDefinitions(model, wordBatch) {
  // 優先嘗試 Gemini（中文定義）
  if (model) {
    const defs = await getDefinitionsGemini(model, wordBatch);
    if (defs && Object.keys(defs).length > 0) return defs;
    process.stdout.write('(Gemini 失敗，改用英文字典) ');
  }

  // Fallback：逐字查免費英文字典
  const defs = {};
  for (const w of wordBatch) {
    defs[w.word] = (await getDefinitionFreeDict(w.word)) || `（${w.pos}）`;
    await delay(120);
  }
  return defs;
}

// ── 4. 批次寫入 DB ──────────────────────────────────────────────
async function insertBatch(words, startId) {
  const rows = words.map((w, i) => ({
    id:             startId + i,
    word:           w.word,
    pos:            w.pos,
    definition:     w.definition || '',
    phonetic:       '',
    example_en:     '',
    example_zh:     '',
    tags:           ['cap_2000'],
    level:          1,
    frequency_rank: w.frequency_rank,
  }));

  const { error } = await supabase
    .from('words')
    .insert(rows);

  if (error) throw new Error(`DB 寫入失敗：${error.message}`);
}

// ── 工具 ────────────────────────────────────────────────────────
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// ── 主程式 ──────────────────────────────────────────────────────
async function main() {
  console.log('=== Vocatopia 單字匯入腳本 ===\n');

  // 初始化 Gemini（若 key 不存在則跳過，改用免費字典）
  let model = null;
  if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
    });
  }

  // Step 1：解析來源檔
  console.log('[1/4] 解析 official_with_pos.txt ...');
  const allWords = parseSourceFile();
  console.log(`      解析完成：${allWords.length} 筆`);

  // Step 2：比對 DB 現有字
  console.log('[2/4] 查詢 DB 現有單字 ...');
  const existing = await getExistingWords();
  console.log(`      DB 現有：${existing.size} 筆`);

  const newWords = allWords.filter(w => !existing.has(w.word));
  console.log(`      待新增：${newWords.length} 筆\n`);

  if (newWords.length === 0) {
    console.log('✅ 所有單字已在 DB 中，無需匯入。');
    return;
  }

  // 取得目前 DB 最大 ID，新字從 maxId+1 開始
  const maxId = await getMaxId();
  console.log(`      ID 從 ${maxId + 1} 開始\n`);

  // Step 3：批次取定義並寫入
  console.log(`[3/4] 批次取得定義並寫入（每批 ${BATCH_SIZE} 字）...`);
  const batches = chunk(newWords, BATCH_SIZE);
  let totalSaved = 0;
  let nextId = maxId + 1;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    process.stdout.write(`  批次 ${i + 1}/${batches.length}（${batch[0].word} … ${batch[batch.length - 1].word}）... `);

    const defs = await getDefinitions(model, batch);

    // 將定義附回單字
    const enriched = batch.map(w => ({
      ...w,
      definition: defs[w.word] || `（${w.pos}）`,
    }));

    await insertBatch(enriched, nextId);
    nextId += batch.length;
    totalSaved += batch.length;
    console.log(`✓ ${batch.length} 字已存入`);

    if (i < batches.length - 1) await delay(DELAY_MS);
  }

  // Step 4：統計
  console.log(`\n[4/4] 完成！`);
  const { count } = await supabase.from('words').select('*', { count: 'exact', head: true });
  console.log(`  本次新增：${totalSaved} 筆`);
  console.log(`  DB 總計：${count} 筆`);
}

main().catch(err => {
  console.error('\n❌ 匯入失敗：', err.message);
  process.exit(1);
});
