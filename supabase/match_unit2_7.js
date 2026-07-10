require('dotenv').config({ path: 'C:\\Users\\qaz10\\Desktop\\claude agent\\vocatopia\\.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const units = JSON.parse(fs.readFileSync(
  'C:\\Users\\qaz10\\AppData\\Local\\Temp\\claude\\C--Users-qaz10-Desktop-claude-agent\\2fdc488b-2054-4240-9431-0285927f5ed7\\scratchpad\\vocab_unit\\units_2_7.json',
  'utf8'
));

async function fetchAllWords() {
  let all = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase.from('words').select('id, word, tags').range(from, from + pageSize - 1);
    if (error) throw error;
    all = all.concat(data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

async function main() {
  const allWords = await fetchAllWords();
  console.log(`資料庫共 ${allWords.length} 筆字`);
  const map = new Map();
  for (const w of allWords) {
    const key = w.word.trim().toLowerCase();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(w);
  }

  const report = {};
  for (const unitNum of Object.keys(units)) {
    const u = units[unitNum];
    const list = [
      ...u.basic.map(w => ({ word: w, tier: '基礎' })),
      ...u.adv.map(w => ({ word: w, tier: '進階' })),
    ];
    const matched = [];
    const missing = [];
    for (const { word, tier } of list) {
      const key = word.trim().toLowerCase();
      if (map.has(key)) {
        matched.push({ word, tier, records: map.get(key) });
      } else {
        missing.push({ word, tier });
      }
    }
    report[unitNum] = { title: u.title, total: list.length, matched, missing };
    console.log(`\nUnit${unitNum} ${u.title}: 書上共 ${list.length} 字，已有 ${matched.length}，缺少 ${missing.length}`);
    if (missing.length) {
      console.log('缺少：' + missing.map(m => `${m.word}(${m.tier})`).join(', '));
    }
  }

  fs.writeFileSync(
    'C:\\Users\\qaz10\\AppData\\Local\\Temp\\claude\\C--Users-qaz10-Desktop-claude-agent\\2fdc488b-2054-4240-9431-0285927f5ed7\\scratchpad\\vocab_unit\\match_report.json',
    JSON.stringify(report, null, 2)
  );
}

main().catch(err => { console.error(err); process.exit(1); });
