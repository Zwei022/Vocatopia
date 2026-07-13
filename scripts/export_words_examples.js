/**
 * export_words_examples.js
 * 把 Supabase words 表的 word + example_en 全部撈出來，存成本機 JSON，
 * 給 Python 端的 Kokoro TTS 批次生成腳本讀取用（避免在 Python 端另外裝 supabase client）。
 */
require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const supabase = require('../server/db/supabase');

async function main() {
  const out = {};
  const PAGE = 1000;
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from('words')
      .select('word, example_en')
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data.length) break;
    for (const row of data) {
      if (row.word && row.example_en && row.example_en.trim()) {
        out[row.word.toLowerCase()] = row.example_en.trim();
      }
    }
    if (data.length < PAGE) break;
    from += PAGE;
  }
  const outPath = path.join(__dirname, '..', 'public', 'audio', 'sentences', 'words_examples.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 0), 'utf-8');
  console.log(`[*] 匯出 ${Object.keys(out).length} 個單字例句 → ${outPath}`);
}

main().catch(err => { console.error('[FATAL]', err); process.exit(1); });
