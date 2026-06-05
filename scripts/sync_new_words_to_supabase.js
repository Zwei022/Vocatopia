/**
 * sync_new_words_to_supabase.js
 * 將 target_2000_words.json 中的新字批次 upsert 到 Supabase words 表
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY
);

const cache  = JSON.parse(fs.readFileSync(path.join(__dirname, '../supabase/words_cache.json'), 'utf8'));
const target = JSON.parse(fs.readFileSync(path.join(__dirname, '../target_2000_words.json'), 'utf8'));

async function main() {
  // 取得目前最大 frequency_rank
  const { data: maxRow } = await supabase
    .from('words')
    .select('frequency_rank')
    .order('frequency_rank', { ascending: false })
    .limit(1);
  let nextRank = (maxRow?.[0]?.frequency_rank || 5000) + 1;

  // 取得已存在的單字
  const { data: existing } = await supabase
    .from('words')
    .select('word')
    .in('word', target.need_data);
  const existingSet = new Set((existing || []).map(r => r.word));

  const toInsert = target.need_data.filter(w => !existingSet.has(w) && cache[w]);
  console.log(`[*] 需新增: ${toInsert.length} 字（已存在: ${existingSet.size}）`);

  // 組裝資料
  const rows = toInsert.map(w => {
    const c = cache[w];
    return {
      word:         w,
      pos:          c.pos || '名詞',
      definition:   c.definition || c.definition_zh || '',
      definition_zh: c.definition_zh || '',
      phonetic:     c.phonetic || '',
      example_en:   c.example_en || '',
      example_zh:   c.example_zh || '',
      tags:         ['cap_2000'],
      level:        1,
      frequency_rank: nextRank++
    };
  });

  // 批次 insert（每批 50 筆）
  const BATCH = 50;
  let ok = 0, fail = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from('words').insert(batch);
    if (error) {
      console.error(`  [FAIL] 批次 ${Math.floor(i/BATCH)+1}:`, error.message);
      fail += batch.length;
    } else {
      ok += batch.length;
      console.log(`  ✓ 插入 ${ok}/${rows.length}`);
    }
  }

  console.log(`\n[完成] 新增 ${ok} 字，失敗 ${fail} 字`);

  // 驗證
  const { count } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .contains('tags', ['cap_2000']);
  console.log(`[驗證] Supabase cap_2000 標籤共 ${count} 字`);
}

main().catch(console.error);
