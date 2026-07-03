// 掃描 server/data/*.json 題庫，抽取題幹/選項/詳解裡所有像英文單字的 token，
// 跟 Supabase words 表比對，找出字庫沒有的字（用於批量預生成字典資料）。
// 過濾規則：
//   1. 常見虛詞（stopwords）不需要字卡
//   2. 長度 <= 2 的破碎 token 不需要字卡
//   3. 只在「句中大寫」出現、從未以小寫出現過的字 → 極可能是人名/專有名詞，排除
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const supabase = require('../server/db/supabase');

const DATA_DIR = path.join(__dirname, '..', 'server', 'data');

const STOPWORDS = new Set(`
a an and are aren as at am be been being but by can could couldn did didn do
does doesn doing don done for from had hasn have haven having he her here
hers herself him himself his how i if in into is isn it its itself just let
lets ll may me might must my no nor not now of off on once only onto or other
our ours ourselves out over own re same shan she should shouldn so some such
than that the their theirs them themselves then there these they this those
through to too under until up us usual ve very was wasn we were weren what
when where which while who whom why will with within without won would
wouldn you your yours yourself yourselves ing er sth sb nt tw ys yyy pm am
cm cd id ok dr mr mrs ms tv uk usa ed
`.trim().split(/\s+/));

function extractWords(obj, info) {
  if (obj == null) return;
  if (typeof obj === 'string') {
    scanText(obj, info);
    return;
  }
  if (Array.isArray(obj)) { obj.forEach(v => extractWords(v, info)); return; }
  if (typeof obj === 'object') {
    for (const k of Object.keys(obj)) {
      if (/zh$|^image$|^audio$|^id$|^answer$|^n$/i.test(k)) continue;
      extractWords(obj[k], info);
    }
  }
}

// 逐字掃描，記錄每個字（小寫）是否曾以小寫出現、是否曾在「非句首」位置以大寫出現
function scanText(text, info) {
  const tokens = text.match(/[a-zA-Z]+|[.!?\n]/g) || [];
  let atSentenceStart = true;
  for (const t of tokens) {
    if (/^[.!?\n]$/.test(t)) { atSentenceStart = true; continue; }
    const lower = t.toLowerCase();
    if (!info.has(lower)) info.set(lower, { sawLower: false, sawCapMid: false });
    const rec = info.get(lower);
    const isCap = /^[A-Z]/.test(t);
    if (isCap && !atSentenceStart) rec.sawCapMid = true;
    if (!isCap) rec.sawLower = true;
    atSentenceStart = false;
  }
}

async function main() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  const info = new Map(); // word -> {sawLower, sawCapMid}
  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf-8'));
    extractWords(data, info);
  }
  console.log(`[掃描] ${files.length} 個檔案，共 ${info.size} 個不重複 token`);

  let dropStop = 0, dropShort = 0, dropProper = 0;
  const candidates = [];
  for (const [word, rec] of info) {
    if (STOPWORDS.has(word)) { dropStop++; continue; }
    if (word.length <= 2) { dropShort++; continue; }
    if (rec.sawCapMid && !rec.sawLower) { dropProper++; continue; } // 只在句中大寫出現過 → 疑似人名
    candidates.push(word);
  }
  console.log(`[過濾] 虛詞 -${dropStop}　短字 -${dropShort}　疑似人名 -${dropProper}　剩 ${candidates.length} 個候選字`);

  const existing = new Set();
  const BATCH = 500;
  for (let i = 0; i < candidates.length; i += BATCH) {
    const batch = candidates.slice(i, i + BATCH);
    const { data, error } = await supabase.from('words').select('word').in('word', batch);
    if (error) { console.error('查詢失敗:', error.message); process.exit(1); }
    data.forEach(r => existing.add(r.word.toLowerCase()));
  }

  const missing = candidates.filter(w => !existing.has(w));
  console.log(`[比對] 字庫已有 ${existing.size} 個，缺少 ${missing.length} 個`);

  fs.writeFileSync(
    path.join(__dirname, 'missing_words.json'),
    JSON.stringify(missing.sort(), null, 2)
  );
  console.log('[輸出] 已寫入 scripts/missing_words.json');
}

main().catch(e => { console.error(e); process.exit(1); });
