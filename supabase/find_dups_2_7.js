const fs = require('fs');
const units = JSON.parse(fs.readFileSync(
  'C:\\Users\\qaz10\\AppData\\Local\\Temp\\claude\\C--Users-qaz10-Desktop-claude-agent\\2fdc488b-2054-4240-9431-0285927f5ed7\\scratchpad\\vocab_unit\\units_2_7.json',
  'utf8'
));
const wordUnits = {};
for (const n of Object.keys(units)) {
  const all = [...units[n].basic, ...units[n].adv];
  for (const w of all) {
    const key = w.trim().toLowerCase();
    if (!wordUnits[key]) wordUnits[key] = [];
    wordUnits[key].push(n);
  }
}
const dups = Object.entries(wordUnits).filter(([k, v]) => v.length > 1);
console.log('跨 unit(2-7) 重複字:', JSON.stringify(dups, null, 2));
