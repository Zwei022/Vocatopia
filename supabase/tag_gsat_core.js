/**
 * 把 unit1~unit32 標籤涵蓋的 2468 字（前端 BUILTIN_DECKS 'cap2000' 卡組已經在用的定義），
 * 統一疊加一個 gsat_core 標籤，讓伺服器端 /api/words 可以用單一標籤過濾出乾淨的
 * 會考預設字庫，不用再靠「排除 user_lookup/user_custom」這種容易漏抓題庫附帶字的舊邏輯。
 * 不動 unit1~32 原本的標籤，只是疊加。
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const UNIT_TAGS = Array.from({ length: 32 }, (_, i) => 'unit' + (i + 1));

async function main() {
  const orFilter = UNIT_TAGS.map(t => `tags.cs.{${t}}`).join(',');

  // PostgREST 預設單次查詢上限 1000 筆，分頁抓完整份 unit1~32 清單
  const data = [];
  const PAGE = 1000;
  for (let offset = 0; ; offset += PAGE) {
    const { data: page, error } = await supabase
      .from('words')
      .select('id, word, tags')
      .or(orFilter)
      .range(offset, offset + PAGE - 1);
    if (error) { console.error('查詢失敗:', error.message); process.exit(1); }
    data.push(...page);
    if (page.length < PAGE) break;
  }

  console.log(`比對到 ${data.length} 個屬於 unit1~32 的字，開始加上 gsat_core 標籤...`);

  let tagged = 0, skipped = 0, failed = 0;
  for (const row of data) {
    const newTags = Array.from(new Set([...(row.tags || []), 'gsat_core']));
    if (newTags.length === (row.tags || []).length) { skipped++; continue; }
    const { error: updErr } = await supabase.from('words').update({ tags: newTags }).eq('id', row.id);
    if (updErr) { console.error('更新失敗:', row.word, updErr.message); failed++; }
    else tagged++;
  }

  console.log(`\n完成：新增標籤 ${tagged} 筆，已有標籤跳過 ${skipped} 筆，失敗 ${failed} 筆`);
}

main().catch(err => { console.error(err); process.exit(1); });
