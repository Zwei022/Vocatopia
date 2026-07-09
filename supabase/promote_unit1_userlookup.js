/**
 * 修正：Unit1 裡有 22 個字之前是透過「查詢單字」功能被加進資料庫的（tags 含 user_lookup），
 * /api/words 正式清單 API 會排除 user_lookup 標籤的字，導致這些字雖然在資料庫裡、
 * 卻不會出現在 Unit1 卡組。這裡把它們「升格」為正式 cap_2000 字，拿掉 user_lookup 標籤。
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

async function main() {
  const { data, error } = await supabase.from('words').select('id, word, tags').contains('tags', ['unit1']);
  if (error) { console.error(error.message); process.exit(1); }

  const toFix = data.filter(w => w.tags.includes('user_lookup') || w.tags.includes('user_custom'));
  console.log(`找到 ${toFix.length} 個需要升格的字`);

  let fixed = 0;
  for (const w of toFix) {
    const newTags = Array.from(new Set(
      w.tags.filter(t => t !== 'user_lookup' && t !== 'user_custom').concat('cap_2000')
    ));
    const { error: updErr } = await supabase.from('words').update({ tags: newTags }).eq('id', w.id);
    if (updErr) console.error(`  ❌ ${w.word} 更新失敗:`, updErr.message);
    else { console.log(`  ✅ ${w.word}: ${JSON.stringify(w.tags)} → ${JSON.stringify(newTags)}`); fixed++; }
  }
  console.log(`\n完成，共修正 ${fixed} 個字`);
}

main().catch(err => { console.error(err); process.exit(1); });
