/**
 * sync_question_bank_new_words.js
 * 把 scripts/_new_word_entries2.json（600題新題庫稽核出的缺漏單字）upsert 進 Supabase words 表。
 * 用字串比對避免重複插入（word 已存在就跳過），一次性腳本。
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY
);

const entries = JSON.parse(fs.readFileSync(path.join(__dirname, '_new_word_entries2.json'), 'utf8'));
const words = Object.keys(entries);

async function main() {
  console.log(`[*] 準備新增 ${words.length} 個單字`);

  const { data: maxRow } = await supabase
    .from('words')
    .select('frequency_rank')
    .order('frequency_rank', { ascending: false })
    .limit(1);
  let nextRank = (maxRow?.[0]?.frequency_rank || 5000) + 1;

  const { data: existing } = await supabase
    .from('words')
    .select('word')
    .in('word', words);
  const existingSet = new Set((existing || []).map(r => r.word));

  const toInsert = words.filter(w => !existingSet.has(w));
  console.log(`[*] 已存在（跳過）: ${existingSet.size}，需新增: ${toInsert.length}`);

  const rows = toInsert.map(w => {
    const c = entries[w];
    return {
      word: w,
      pos: c.pos || '名詞',
      definition: c.definition || '',
      definition_zh: c.definition || '',
      phonetic: c.phonetic || '',
      example_en: c.example_en || '',
      example_zh: c.example_zh || '',
      tags: ['question_bank_2026_07_b2'],
      level: 1,
      frequency_rank: nextRank++,
    };
  });

  const BATCH = 50;
  let ok = 0, fail = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from('words').insert(batch);
    if (error) {
      console.error(`  [FAIL] 批次 ${Math.floor(i / BATCH) + 1}:`, error.message);
      fail += batch.length;
    } else {
      ok += batch.length;
      console.log(`  ✓ 插入 ${ok}/${rows.length}`);
    }
  }

  console.log(`\n[完成] 新增 ${ok} 字，失敗 ${fail} 字`);

  const { count } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .contains('tags', ['question_bank_2026_07_b2']);
  console.log(`[驗證] Supabase question_bank_2026_07_b2 標籤共 ${count} 字`);
}

main().catch(console.error);
