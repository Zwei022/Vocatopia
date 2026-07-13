require('dotenv').config({ quiet: true });
const path = require('path');
const supabase = require('../db/supabase');
const fs = require('fs');

// Usage: node server/scripts/check_exam_vocab.js server/data/gsat_sim_2023_reading_1.json
const examPath = process.argv[2];
if (!examPath) {
  console.error('請提供考卷 JSON 檔路徑，例如: node server/scripts/check_exam_vocab.js server/data/xxx.json');
  process.exit(1);
}
const exam = JSON.parse(fs.readFileSync(path.resolve(examPath), 'utf-8'));

// 基礎功能詞（代名詞/冠詞/助動詞等）——這些是任何國中英文程度都假定已具備的
// 文法詞彙，不算「單字庫難度」範疇的考核對象，比對時直接排除。
const FUNCTION_WORDS = new Set([
  'a','an','the','i','you','he','she','it','we','they','me','him','her','us','them',
  'my','your','his','its','our','their','mine','yours','hers','ours','theirs',
  'this','that','these','those','who','whom','whose','which','what',
  'is','am','are','was','were','be','been','being','do','does','did','have','has','had',
  'will','would','shall','should','can','could','may','might','must',
  'and','or','but','so','if','because','than','as','of','to','in','on','at','by','for',
  'with','from','up','down','out','about','into','over','after','before','not','no',
  'yes','let','lets',
]);

function isProperNounLike(original) {
  // 首字母大寫（且不是句首）通常是人名/地名/專有名詞，不列入單字庫難度計算
  return /^[A-Z][a-z]+$/.test(original);
}

// 沿用 server/routes/words.js 的字尾還原邏輯
function lemmaCandidates(w) {
  const c = [w];
  if (w.endsWith('ies') && w.length > 4) c.push(w.slice(0, -3) + 'y');
  if (w.endsWith('ied') && w.length > 4) c.push(w.slice(0, -3) + 'y');
  if (w.endsWith('ier') && w.length > 4) c.push(w.slice(0, -3) + 'y');
  if (w.endsWith('iest') && w.length > 5) c.push(w.slice(0, -4) + 'y');
  if (w.endsWith('ing') && w.length > 5) { c.push(w.slice(0, -3)); c.push(w.slice(0, -3) + 'e'); c.push(w.slice(0, -4)); }
  if (w.endsWith('ed') && w.length > 4) { c.push(w.slice(0, -2)); c.push(w.slice(0, -1)); c.push(w.slice(0, -3)); }
  if (w.endsWith('es') && w.length > 4) { c.push(w.slice(0, -2)); c.push(w.slice(0, -1)); }
  if (w.endsWith('s') && w.length > 3 && !w.endsWith('ss')) c.push(w.slice(0, -1));
  if (w.endsWith('er') && w.length > 4) c.push(w.slice(0, -2));
  if (w.endsWith('est') && w.length > 5) c.push(w.slice(0, -3));
  if (w.endsWith('ly') && w.length > 4) c.push(w.slice(0, -2));
  if (w.endsWith("'s")) c.push(w.slice(0, -2));
  return [...new Set(c)];
}

let allText = [];
function walk(obj) {
  if (Array.isArray(obj)) { obj.forEach(walk); return; }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (['stem', 'passage', 'title'].includes(k) && typeof v === 'string') allText.push(v);
      if (k === 'options' && Array.isArray(v)) v.forEach(o => { if (typeof o === 'string') allText.push(o); });
      walk(v);
    }
  }
}
walk(exam);

const text = allText.join(' ');
const rawTokens = text.match(/[A-Za-z']+/g) || [];

// 保留原始大小寫用於專有名詞判斷，另外做小寫版本用於比對
const tokenPairs = rawTokens.map(t => ({ original: t, lower: t.toLowerCase() }));
const uniqueByLower = new Map();
for (const t of tokenPairs) {
  if (!uniqueByLower.has(t.lower)) uniqueByLower.set(t.lower, t.original);
}

const candidates = [];
for (const [lower, original] of uniqueByLower) {
  if (lower.length <= 1) continue;
  if (FUNCTION_WORDS.has(lower)) continue;
  if (isProperNounLike(original)) continue; // 專有名詞不計入難度分析
  candidates.push(lower);
}

console.log(`原始唯一token數: ${uniqueByLower.size}, 排除功能詞/專有名詞後納入分析: ${candidates.length}`);

(async () => {
  // 一次抓出所有可能用得到的 lemma 候選字
  const allLemmaCandidates = new Set();
  const lemmaMap = new Map(); // word -> candidates[]
  for (const w of candidates) {
    const cands = lemmaCandidates(w);
    lemmaMap.set(w, cands);
    cands.forEach(c => allLemmaCandidates.add(c));
  }

  const { data: rows, error } = await supabase
    .from('words')
    .select('word, tags')
    .in('word', [...allLemmaCandidates]);
  if (error) { console.error(error); return; }

  const dbMap = new Map(rows.map(r => [r.word.toLowerCase(), r.tags || []]));

  let inCap2000 = [], inHs7000 = [], inOther = [], notInDb = [];
  for (const w of candidates) {
    const cands = lemmaMap.get(w);
    let matchedTags = null;
    for (const c of cands) {
      if (dbMap.has(c)) { matchedTags = dbMap.get(c); break; }
    }
    if (!matchedTags) { notInDb.push(w); continue; }
    if (matchedTags.includes('cap_2000')) inCap2000.push(w);
    else if (matchedTags.includes('hs7000')) inHs7000.push(w);
    else inOther.push(w);
  }

  const total = candidates.length;
  console.log(`\n=== 字彙難度分布（已排除功能詞/專有名詞，已做字尾還原）===`);
  console.log(`會考核心2000字 (cap_2000): ${inCap2000.length} (${(inCap2000.length/total*100).toFixed(1)}%)`);
  console.log(`高中延伸字庫 (hs7000):     ${inHs7000.length} (${(inHs7000.length/total*100).toFixed(1)}%)`);
  console.log(`其他標籤 (其他來源):        ${inOther.length} (${(inOther.length/total*100).toFixed(1)}%)`);
  console.log(`完全不在資料庫 (真正的超綱疑慮): ${notInDb.length} (${(notInDb.length/total*100).toFixed(1)}%)`);
  console.log(`\n真正需要複核的超綱字清單:`, notInDb);
})();
