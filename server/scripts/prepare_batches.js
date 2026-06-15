/**
 * 步驟 1：產生 Gemini prompt 批次檔
 * 執行：node server/scripts/prepare_batches.js
 * 輸出：gemini_batches/batch_01_of_10.txt … batch_10_of_10.txt
 */
const fs   = require('fs');
const path = require('path');

const SOURCE  = path.join(__dirname, '../../official_with_pos.txt');
const OUT_DIR = path.join(__dirname, '../../gemini_batches');

const POS_MAP = {
  'n.': '名詞', 'v.': '動詞', 'adj.': '形容詞', 'adv.': '副詞',
  'conj.': '連接詞', 'prep.': '介系詞', 'pron.': '代名詞',
  'aux.': '助動詞', 'int.': '感嘆詞', 'det.': '限定詞', 'num.': '數詞',
};

const lines = fs.readFileSync(SOURCE, 'utf-8').split('\n');
const words = [];

for (const line of lines) {
  const m = line.trim().match(/^(.+?)\s+(n\.|v\.|adj\.|adv\.|conj\.|prep\.|pron\.|aux\.|int\.|det\.|num\.)\s*$/);
  if (!m) continue;
  words.push({ word: m[1].trim().toLowerCase(), pos: POS_MAP[m[2]] || m[2], rank: words.length + 1 });
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
const responsesDir = path.join(OUT_DIR, 'responses');
if (!fs.existsSync(responsesDir)) fs.mkdirSync(responsesDir);

const BATCH = 200;
const batches = [];
for (let i = 0; i < words.length; i += BATCH) batches.push(words.slice(i, i + BATCH));
const total = batches.length;

batches.forEach((batch, idx) => {
  const start = idx * BATCH + 1;
  const end   = start + batch.length - 1;
  const list  = batch.map(w => `${w.word} (${w.pos})`).join('\n');

  const prompt = `你是台灣國中英語教材設計師，負責製作108課綱會考備考單字資料庫。

請為以下 ${batch.length} 個英文單字，逐一生成完整學習資料。

【欄位規格】
- word：英文單字（原樣保留，小寫）
- pos：詞性（中文，如「名詞」「動詞」等，原樣保留）
- definition：繁體中文釋義，5–12字，國中生能理解，多義以「；」分隔
- phonetic：IPA 音標，格式為 /音標/（例：/ˈeɪbəl/）
- example_en：一句 CEFR A2–B1 英文例句，10–15字，使用常見單字
- example_zh：上述例句的自然繁體中文翻譯

【輸出格式】
只輸出 JSON 陣列，不要 markdown code block，不要任何說明文字：
[{"word":"able","pos":"形容詞","definition":"有能力的；能夠","phonetic":"/ˈeɪbəl/","example_en":"She is able to speak three languages.","example_zh":"她能說三種語言。"}]

【單字清單】第 ${start}–${end} 筆，共 ${batch.length} 個：
${list}`;

  const filename = `batch_${String(idx + 1).padStart(2, '0')}_of_${total}.txt`;
  fs.writeFileSync(path.join(OUT_DIR, filename), prompt, 'utf-8');
  console.log(`✓ ${filename}  (${batch[0].word} … ${batch[batch.length - 1].word})`);
});

console.log(`
完成！共產生 ${total} 個批次。

下一步：
1. 到 gemini_batches/ 資料夾，依序開啟每個 .txt 檔
2. 將內容貼到 Gemini 對話框（建議用 aistudio.google.com 以避免截斷）
3. 將 Gemini 回應的 JSON 儲存為：
   gemini_batches/responses/batch_01.json
   gemini_batches/responses/batch_02.json
   …
4. 全部完成後執行：node server/scripts/import_words.js
`);
