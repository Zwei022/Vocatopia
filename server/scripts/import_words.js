/**
 * 步驟 2：清空舊資料，匯入 Gemini 生成的單字 JSON
 * 執行：node server/scripts/import_words.js
 * 前提：gemini_batches/responses/ 內有所有 batch_XX.json
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const fs       = require('fs');
const path     = require('path');
const supabase = require('../db/supabase');

const SOURCE       = path.join(__dirname, '../../official_with_pos.txt');
const RESPONSES    = path.join(__dirname, '../../gemini_batches/responses');
const INSERT_BATCH = 100;

// ── 從原始字表重建 frequency_rank 對照表 ──
function buildRankMap() {
  const POS_RE = /^(.+?)\s+(n\.|v\.|adj\.|adv\.|conj\.|prep\.|pron\.|aux\.|int\.|det\.|num\.)\s*$/;
  const map = {};
  let rank = 1;
  for (const line of fs.readFileSync(SOURCE, 'utf-8').split('\n')) {
    const m = line.trim().match(POS_RE);
    if (m) map[m[1].trim().toLowerCase()] = rank++;
  }
  return map;
}

function getLevel(rank) {
  if (rank <= 400)  return 1;
  if (rank <= 800)  return 2;
  if (rank <= 1200) return 3;
  if (rank <= 1600) return 4;
  return 5;
}

function parseJSON(raw) {
  const cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
  try { return JSON.parse(cleaned); } catch {
    const s = cleaned.indexOf('['), e = cleaned.lastIndexOf(']');
    if (s !== -1 && e !== -1) return JSON.parse(cleaned.slice(s, e + 1));
    throw new Error('無法解析 JSON');
  }
}

async function main() {
  console.log('=== Vocatopia 單字重新匯入 ===\n');

  // 1. 讀 response 檔案
  if (!fs.existsSync(RESPONSES)) {
    console.error(`❌ 找不到 ${RESPONSES}\n請先完成 Gemini 對話並儲存 JSON。`);
    process.exit(1);
  }
  const files = fs.readdirSync(RESPONSES).filter(f => f.endsWith('.json')).sort();
  if (files.length === 0) {
    console.error('❌ responses/ 資料夾內沒有 .json 檔案。');
    process.exit(1);
  }
  console.log(`[1/4] 讀取 ${files.length} 個 response 檔案...`);

  const rankMap  = buildRankMap();
  let allWords   = [];
  const errors   = [];

  for (const file of files) {
    try {
      const raw  = fs.readFileSync(path.join(RESPONSES, file), 'utf-8');
      const arr  = parseJSON(raw);
      allWords   = allWords.concat(arr);
      console.log(`  ✓ ${file}: ${arr.length} 字`);
    } catch (e) {
      errors.push(`  ✗ ${file}: ${e.message}`);
    }
  }
  if (errors.length) { errors.forEach(e => console.warn(e)); }
  console.log(`  合計：${allWords.length} 字\n`);

  // 2. 資料驗證與清理
  console.log('[2/4] 驗證與清理資料...');
  const seen = new Set();
  const rows = [];
  let skipped = 0;

  for (const w of allWords) {
    const word = (w.word || '').toLowerCase().trim();
    if (!word || seen.has(word)) { skipped++; continue; }
    seen.add(word);
    const rank = rankMap[word] || (rows.length + 1);
    rows.push({
      word,
      pos:            w.pos            || '',
      definition:     w.definition     || '',
      phonetic:       w.phonetic       || '',
      example_en:     w.example_en     || '',
      example_zh:     w.example_zh     || '',
      tags:           ['cap_2000'],
      level:          getLevel(rank),
      frequency_rank: rank,
    });
  }
  console.log(`  有效：${rows.length} 字，略過重複：${skipped} 字\n`);

  // 3. 清空舊資料
  console.log('[3/4] 清空舊 words 資料...');
  const { error: delErr } = await supabase.from('words').delete().gte('id', 0);
  if (delErr) throw new Error('清空失敗: ' + delErr.message);
  console.log('  ✓ 舊資料已清空\n');

  // 4. 分批寫入
  console.log(`[4/4] 寫入 ${rows.length} 筆（每批 ${INSERT_BATCH} 筆）...`);
  for (let i = 0; i < rows.length; i += INSERT_BATCH) {
    const batch = rows.slice(i, i + INSERT_BATCH);
    const { error } = await supabase.from('words').insert(batch);
    if (error) throw new Error(`寫入失敗（第 ${i + 1}–${i + batch.length} 筆）：${error.message}`);
    process.stdout.write(`\r  進度：${Math.min(i + INSERT_BATCH, rows.length)} / ${rows.length}`);
  }

  const { count } = await supabase.from('words').select('*', { count: 'exact', head: true });
  console.log(`\n\n✅ 完成！DB 現有 ${count} 筆單字。`);
}

main().catch(err => {
  console.error('\n❌ 匯入失敗：', err.message);
  process.exit(1);
});
