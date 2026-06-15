require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const s = require('../server/db/supabase');

(async () => {
  // 讀取 official_with_pos.txt（最權威來源）
  const posLines = fs.readFileSync(path.join(__dirname, '../official_with_pos.txt'), 'utf-8').split('\n');
  const officialPos = new Set();
  const POS_RE = /^(.+?)\s+(n\.|v\.|adj\.|adv\.|conj\.|prep\.|pron\.|aux\.|int\.|det\.|num\.)/;
  for (const line of posLines) {
    const m = line.trim().match(POS_RE);
    if (m) officialPos.add(m[1].trim().toLowerCase());
  }

  // 讀取 official_2000_full.txt（LearnThat 來源）
  const fullLines = fs.readFileSync(path.join(__dirname, '../official_2000_full.txt'), 'utf-8').split('\n');
  const officialFull = new Set();
  for (const line of fullLines) {
    const w = line.trim().toLowerCase();
    if (!w || w.includes(' ') || w.includes('.') || w.includes("'")) continue;
    if (/^[A-Z]/.test(line.trim())) continue;
    officialFull.add(w);
  }

  // 全部 DB 字
  const dbAll = [];
  let from = 0;
  while (true) {
    const { data } = await s.from('words').select('id,word,pos,definition,frequency_rank').range(from, from + 999);
    if (!data || !data.length) break;
    dbAll.push(...data);
    if (data.length < 1000) break;
    from += 1000;
  }

  const total = dbAll.length;
  const need  = total - 2000;
  console.log(`DB 字數：${total}，需刪除：${need} 字\n`);

  // 找出不在任何官方來源的字
  const notInAny   = dbAll.filter(w => !officialPos.has(w.word.toLowerCase()) && !officialFull.has(w.word.toLowerCase()));

  // 重複字對（保留一個，刪另一個）
  const dupRemove  = [];
  const dbMap      = new Map(dbAll.map(w => [w.word.toLowerCase(), w]));
  const dupPairs   = [
    ['mathematics', 'math'],           // 刪 math，保留 mathematics
    ['doughnut',   'donut'],           // 刪 donut，保留 doughnut
    ['hello',      'hi'],              // 刪 hi，保留 hello
    ['hello',      'hey'],             // 刪 hey，保留 hello
    ['goodbye',    'bye'],             // 刪 bye，保留 goodbye
    ['bicycle',    'bike'],            // 刪 bike，保留 bicycle
    ['chopsticks', 'chopstick'],       // 刪 chopstick，保留 chopsticks
    ['email',      'e-mail'],          // 刪 e-mail，保留 email（若有）
  ];
  for (const [keep, remove] of dupPairs) {
    if (dbMap.has(keep) && dbMap.has(remove)) {
      dupRemove.push(remove);
    } else if (dbMap.has(remove)) {
      // keep 不在DB，改刪 remove 前先確認
      console.log(`  注意："${keep}" 不在 DB，跳過刪 "${remove}"`);
    }
  }

  console.log(`=== 重複字（建議刪 ${dupRemove.length} 個）===`);
  dupRemove.forEach(w => console.log(`  ✗ ${w}`));

  console.log(`\n=== 不在任何官方清單（${notInAny.length} 字）===`);
  notInAny.slice(0, 50).forEach(w =>
    console.log(`  ? ${w.word.padEnd(20)} ${(w.definition || '').slice(0, 30)}`)
  );

  // 組合刪除清單
  const toDelete = new Set([
    ...dupRemove,
    ...notInAny.map(w => w.word.toLowerCase()).slice(0, need - dupRemove.length),
  ]);

  console.log(`\n=== 最終刪除清單（${toDelete.size} 字）→ 剩 ${total - toDelete.size} 字 ===`);
  [...toDelete].sort().forEach(w => console.log(`  ✗ ${w}`));

  // ── 執行刪除 ─────────────────────────────────────────────────
  if (process.argv.includes('--execute')) {
    let deleted = 0;
    for (const word of toDelete) {
      const { error } = await s.from('words').delete().eq('word', word);
      if (error) console.log(`  ✗ 刪除 ${word} 失敗: ${error.message}`);
      else { deleted++; process.stdout.write(`\r  已刪: ${deleted}`); }
    }
    const { count } = await s.from('words').select('*', { count: 'exact', head: true });
    console.log(`\n\n✅ 刪除完成！DB 現在：${count} 字`);
  } else {
    console.log('\n→ 加上 --execute 參數執行實際刪除');
  }
})();
