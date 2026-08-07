const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dataDir = path.join(root, 'server', 'data');
const requested = [
  'question_bank_vocab_practice.json', 'question_bank_grammar.json', 'question_bank_cloze.json',
  'question_bank_reading.json', 'question_bank_phrase.json', 'question_bank_listening.json',
  ...[2023, 2024, 2025, 2026].flatMap(y => [`gsat_exam_${y}_reading.json`, `gsat_exam_${y}_listening.json`]),
  ...Array.from({ length: 10 }, (_, i) => `gsat_sim_2023_reading_${i + 1}.json`),
  'grammar_lessons.json',
];
const issues = [];
const stats = {};
const add = (file, locator, type, severity, found, suggestion) => issues.push({ file, locator, type, severity, found, suggestion });
const suspiciousVariants = new Map(Object.entries({
  '値':'值（日文異體）','働':'動（日文漢字）','內':'內（此字合法，僅作人工提醒）','里':'裡／里（需依語境）',
  '汉':'漢','语':'語','发':'發／髮','后':'後（「皇后」除外）','这':'這','为':'為','与':'與','从':'從','书':'書',
  '们':'們','国':'國','学':'學','会':'會','进':'進','过':'過','对':'對','说':'說','个':'個','时':'時',
  '题':'題','选':'選','项':'項','难':'難','听':'聽','读':'讀','写':'寫','见':'見','长':'長','气':'氣',
}));

function scanText(file, locator, value) {
  if (typeof value !== 'string') return;
  for (const [char, label] of suspiciousVariants) {
    if (!value.includes(char)) continue;
    if (char === '后' && /皇后|王后|太后/.test(value)) continue;
    if (char === '里' && /公里|英里|里程/.test(value)) continue;
    if (char === '內') continue;
    add(file, locator, '疑似簡體字或日文漢字變體', '中', `含「${char}」：${value.slice(0, 120)}`, `依語境確認並改為${label}`);
  }
}

function walk(file, node, locator = '$', ids = new Map()) {
  if (Array.isArray(node)) return node.forEach((v, i) => walk(file, v, `${locator}[${i}]`, ids));
  if (!node || typeof node !== 'object') return;
  if (typeof node.id === 'string') {
    if (ids.has(node.id)) add(file, `${locator}.id`, '重複 id', '高', node.id, `改成唯一 id；首次出現在 ${ids.get(node.id)}`);
    else ids.set(node.id, `${locator}.id`);
  }
  if ('options' in node || 'answer' in node) {
    stats[file].answerUnits++;
    if (!Array.isArray(node.options)) add(file, locator, '格式錯誤', '高', 'options 不是陣列', '改為選項陣列');
    else {
      if (!Number.isInteger(node.answer) || node.answer < 0 || node.answer >= node.options.length) add(file, locator, '答案 index 錯誤', '高', node.answer, `answer 必須介於 0～${node.options.length - 1}`);
      const normalized = node.options.map(x => String(x).replace(/^\s*\([A-D]\)\s*/i, '').trim().toLowerCase());
      if (new Set(normalized).size !== normalized.length) add(file, locator, '重複選項', '高', JSON.stringify(node.options), '四個選項需互不相同');
      if ('optionsZh' in node && (!Array.isArray(node.optionsZh) || node.optionsZh.length !== node.options.length)) add(file, locator, 'optionsZh 數量錯誤', '高', JSON.stringify(node.optionsZh), '與 options 一一對應');
    }
    if (!('explanation' in node)) add(file, locator, '缺少詳解', '中', '沒有 explanation', '補上與正解一致的繁體中文詳解');
  }
  for (const [key, value] of Object.entries(node)) {
    if (['definition','definition_zh','example_zh','explanation','optionsZh','teaching','zh'].includes(key)) {
      if (Array.isArray(value)) value.forEach((v, i) => scanText(file, `${locator}.${key}[${i}]`, v));
      else if (typeof value !== 'object') scanText(file, `${locator}.${key}`, value);
    }
    if (value && typeof value === 'object') walk(file, value, `${locator}.${key}`, ids);
  }
}

for (const file of requested) {
  const filename = path.join(dataDir, file);
  stats[file] = { exists: fs.existsSync(filename), answerUnits: 0 };
  if (!fs.existsSync(filename)) { add(file, '$', '缺少檔案', '高', '檔案不存在', '確認檔名與審查範圍'); continue; }
  try { walk(file, JSON.parse(fs.readFileSync(filename, 'utf8'))); }
  catch (error) { add(file, '$', 'JSON 格式錯誤', '高', error.message, '修正 JSON 語法'); }
}

const target = JSON.parse(fs.readFileSync(path.join(root, 'target_2000_words.json'), 'utf8')).words.map(x => String(x).trim().toLowerCase());
const words = JSON.parse(fs.readFileSync(path.join(root, 'supabase', 'words_cache.json'), 'utf8'));
stats['supabase/words_cache.json'] = { entries: Object.keys(words).length, targetEntries: target.length };
const targetSet = new Set(target), wordKeys = Object.keys(words).map(x => x.toLowerCase()), wordSet = new Set(wordKeys);
for (const word of targetSet) if (!wordSet.has(word)) add('supabase/words_cache.json', word, '目標缺字', '高', 'target 有、cache 無', '補齊該字資料');
for (const word of wordSet) if (!targetSet.has(word)) add('supabase/words_cache.json', word, '目標外多餘字', '低', 'cache 有、target 無', '確認是否應移至額外字庫；不要混入核心2000');
for (const [word, row] of Object.entries(words)) {
  for (const field of ['pos','phonetic','definition','example_en','example_zh','done','definition_zh']) if (!(field in row)) add('supabase/words_cache.json', word, '缺少欄位', '高', field, `補上 ${field}`);
  if (row.done !== true) add('supabase/words_cache.json', word, '未完成資料', '高', `done=${JSON.stringify(row.done)}`, '完成校對前不可當成正式資料');
  if (typeof row.phonetic !== 'string' || !/^\/(?!\/).+\/$/.test(row.phonetic.trim())) add('supabase/words_cache.json', word, 'IPA 格式錯誤', '中', String(row.phonetic), '使用 /.../ 包住合法 IPA');
  scanText('supabase/words_cache.json', `${word}.definition`, row.definition);
  scanText('supabase/words_cache.json', `${word}.definition_zh`, row.definition_zh);
  scanText('supabase/words_cache.json', `${word}.example_zh`, row.example_zh);
}

const result = { generatedAt: new Date().toISOString(), stats, issueCount: issues.length, issues };
fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
fs.writeFileSync(path.join(root, 'reports', 'audit_structural.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ stats, issueCount: issues.length }, null, 2));
