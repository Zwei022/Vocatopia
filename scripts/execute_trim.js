/**
 * 從 2040 字精準刪減到 2000 字
 * 刪除標準：
 *   A. 有更標準形式的重複字
 *   B. 極基礎助動詞（is/am/are 已涵蓋）
 *   C. 性別偏見舊式用法
 *   D. 不在 official_with_pos.txt 且教育價值較低的字
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const s = require('../server/db/supabase');

const REMOVE_40 = [
  // A. 重複字（保留更標準形式）
  'bye',          // → goodbye
  'donut',        // → doughnut（MOE 官方拼寫）
  'hi',           // → hello
  'hey',          // → hello
  'bike',         // → bicycle（MOE 官方）
  'chopsticks',   // → chopstick（MOE 官方）
  'math',         // → mathematics（正式學科名）

  // B. 極基礎，is/am/are/was/were 已涵蓋
  'be',
  'been',

  // C. 性別偏見舊式用法
  'mailman',      // → mail carrier
  'salesman',     // → salesperson

  // D. 非 official_with_pos.txt，教育價值較低
  'nice-looking', // 口語化合字
  'hard-working', // 合字，diligent 更學術
  'china',        // 小寫瓷器義極少考
  'secondary',    // junior/senior high school 已涵蓋語境
  'saucer',       // 罕見考題
  'sneaky',       // 口語化
  'overpass',     // 較少考
  'underpass',    // 較少考
  'valentine',    // 單字較少單獨考
  'wok',          // 特定廚具，較少考
  'tub',          // bathtub 更常見
  'softball',     // 在台灣較少考
  'backward',     // 較少單獨考
  'koala',        // 動物，較少考
  'recorder',     // 樂器，較少考
  'stormy',       // storm 已在清單
  'foggy',        // fog 已在清單
  'crowded',      // crowd 已在清單
  'scared',       // afraid/frighten 已在清單
  'pleased',      // please/pleasure 已在清單
  'snowman',      // snow+man，複合較少考
  'haircut',      // hair+cut，複合較少考
  'homesick',     // home+sick，複合較少考
  'bookstore',    // book+store，複合較少考
  'drugstore',    // drug+store，複合較少考
  'earrings',     // 較少單獨考
  'fashionable',  // fashion 不在主清單
  'freezing',     // freeze 已在清單
  'granddaughter',// grandfather/grandmother/grandson 已在清單
];

(async () => {
  // 先確認 DB 中哪些真的存在
  const dbAll = [];
  let from = 0;
  while (true) {
    const { data } = await s.from('words').select('id,word').range(from, from + 999);
    if (!data || !data.length) break;
    dbAll.push(...data);
    if (data.length < 1000) break;
    from += 1000;
  }
  const dbMap = new Map(dbAll.map(w => [w.word.toLowerCase(), w]));

  const toDelete = REMOVE_40.filter(w => {
    if (!dbMap.has(w.toLowerCase())) {
      console.log(`  跳過（不在DB）: ${w}`);
      return false;
    }
    return true;
  });

  console.log(`\n準備刪除 ${toDelete.length} 字，DB 現有 ${dbAll.length} 字\n`);
  toDelete.forEach((w, i) => console.log(`  ${String(i+1).padStart(2)}. ${w}`));

  if (!process.argv.includes('--execute')) {
    console.log('\n→ 加上 --execute 執行實際刪除');
    return;
  }

  console.log('\n執行刪除...');
  let deleted = 0;
  for (const word of toDelete) {
    const row = dbMap.get(word.toLowerCase());
    const { error } = await s.from('words').delete().eq('id', row.id);
    if (error) console.log(`  ✗ ${word}: ${error.message}`);
    else { deleted++; process.stdout.write(`\r  已刪：${deleted}/${toDelete.length}`); }
  }

  const { count } = await s.from('words').select('*', { count: 'exact', head: true });
  console.log(`\n\n✅ 完成！DB 現在：${count} 字`);
})();
