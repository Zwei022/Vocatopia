require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const s = require('../server/db/supabase');

(async () => {
  // 讀取官方清單
  const posLines = fs.readFileSync(path.join(__dirname, '../official_with_pos.txt'), 'utf-8').split('\n');
  const officialPos = new Set();
  for (const line of posLines) {
    const m = line.trim().match(/^(.+?)\s+(n\.|v\.|adj\.|adv\.|conj\.|prep\.|pron\.|aux\.|int\.|det\.|num\.)/);
    if (m) officialPos.add(m[1].trim().toLowerCase());
  }

  const fullLines = fs.readFileSync(path.join(__dirname, '../official_2000_full.txt'), 'utf-8').split('\n');
  const officialFull = new Set();
  for (const line of fullLines) {
    const w = line.trim().toLowerCase();
    if (!w || w.includes(' ') || w.includes('.') || w.includes("'")) continue;
    if (/^[A-Z]/.test(line.trim())) continue;
    officialFull.add(w);
  }

  // 所有 DB 字
  const dbAll = [];
  let from = 0;
  while (true) {
    const { data } = await s.from('words').select('id,word,definition,frequency_rank').range(from, from + 999);
    if (!data || !data.length) break;
    dbAll.push(...data);
    if (data.length < 1000) break;
    from += 1000;
  }

  console.log('DB 總字數:', dbAll.length);
  console.log('官方 pos 清單:', officialPos.size, '| 官方 full 清單:', officialFull.size);

  // 分類
  const inNeither  = [];  // 不在任何官方清單（最優先刪）
  const inFullOnly = [];  // 只在 full 清單（可考慮刪）
  const duplicates = [];  // 疑似重複

  const dupPairs = [
    ['math', 'mathematics'],
    ['donut', 'doughnut'],
    ['e-mail', 'email'],
    ['bike', 'bicycle'],
    ['chopstick', 'chopsticks'],
    ['bye', 'goodbye'],
    ['hi', 'hello'],
    ['hey', 'hello'],
    ['be', 'is'],   // be 很基礎，DB 已有 is/are
    ['been', 'be'],
  ];

  const dbWordMap = new Map(dbAll.map(w => [w.word.toLowerCase(), w]));

  for (const [keep, remove] of dupPairs) {
    if (dbWordMap.has(remove) && dbWordMap.has(keep)) {
      duplicates.push({ remove, keep, reason: `與 "${keep}" 重複` });
    } else if (dbWordMap.has(keep) && dbWordMap.has(remove.replace(/-/g, ''))) {
      duplicates.push({ remove, keep, reason: `與 "${keep}" 重複` });
    }
  }

  for (const row of dbAll) {
    const w = row.word.toLowerCase();
    const inPos  = officialPos.has(w);
    const inFull = officialFull.has(w);
    const isDup  = duplicates.some(d => d.remove === w);
    if (isDup) continue;
    if (!inPos && !inFull) inNeither.push({ word: w, def: (row.definition || '').slice(0, 30) });
    else if (!inPos && inFull) inFullOnly.push({ word: w, def: (row.definition || '').slice(0, 30) });
  }

  console.log('\n=== 優先刪除：重複字 (' + duplicates.length + ') ===');
  duplicates.forEach(d => console.log(` ✗ ${d.remove.padEnd(16)} → ${d.reason}`));

  console.log('\n=== 次優先：不在任何官方清單 (' + inNeither.length + ') — 前 30 ===');
  inNeither.slice(0, 30).forEach(w => console.log(` ? ${w.word.padEnd(16)} ${w.def}`));

  console.log('\n=== 刪除小計 ===');
  console.log('重複字:', duplicates.length);
  console.log('不在官方清單（前30）建議刪: 至多', Math.max(0, 40 - duplicates.length));
  console.log('\n→ 刪除重複字後預計字數:', dbAll.length - duplicates.length);
})();
