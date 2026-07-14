/**
 * export_all_words.js
 * 匯出 Supabase words 表全部不重複單字（含 user_lookup/user_custom），
 * 供 generate_all_word_audio.py 讀取比對，補生成新加入、還沒有發音的字。
 *
 * 用法：
 *   node scripts/export_all_words.js
 */
require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const supabase = require('../server/db/supabase');

async function main() {
  const words = new Set();
  const PAGE = 1000;
  let from = 0;
  for (;;) {
    const { data, error } = await supabase.from('words').select('word').range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data.length) break;
    data.forEach(r => { if (r.word && r.word.trim()) words.add(r.word.trim().toLowerCase()); });
    if (data.length < PAGE) break;
    from += PAGE;
  }
  const list = [...words].sort();
  const outPath = path.join(__dirname, '..', 'public', 'audio', 'sentences', 'all_words_for_audio.json');
  fs.writeFileSync(outPath, JSON.stringify(list));
  console.log(`[*] 全字庫共 ${list.length} 個不重複單字 → ${outPath}`);
}

main().catch(err => { console.error('[FATAL]', err); process.exit(1); });
