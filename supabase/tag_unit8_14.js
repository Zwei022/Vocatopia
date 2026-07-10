/**
 * 對 Unit 8-14 已存在資料庫的字，加上 unitN 標籤，並修正 user_lookup/user_custom 標籤升格問題。
 */
require('dotenv').config({ path: 'C:\\Users\\qaz10\\Desktop\\claude agent\\vocatopia\\.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const report = JSON.parse(fs.readFileSync(
  'C:\\Users\\qaz10\\AppData\\Local\\Temp\\claude\\C--Users-qaz10-Desktop-claude-agent\\2fdc488b-2054-4240-9431-0285927f5ed7\\scratchpad\\vocab_unit\\match_report_8_14.json',
  'utf8'
));

async function main() {
  for (const unitNum of Object.keys(report)) {
    const u = report[unitNum];
    const unitTag = `unit${unitNum}`;
    let tagged = 0, promoted = 0;
    // dedupe by id (some words share the same db row, e.g. 'orange' appears in two units)
    const seen = new Set();
    for (const m of u.matched) {
      for (const rec of m.records) {
        if (seen.has(rec.id)) continue;
        seen.add(rec.id);
        let tags = Array.from(new Set([...(rec.tags || []), unitTag]));
        const hadUserTag = tags.includes('user_lookup') || tags.includes('user_custom');
        if (hadUserTag) {
          tags = tags.filter(t => t !== 'user_lookup' && t !== 'user_custom');
          if (!tags.includes('cap_2000')) tags.push('cap_2000');
        }
        const changed = JSON.stringify(tags.sort()) !== JSON.stringify((rec.tags || []).slice().sort());
        if (!changed) continue;
        const { error } = await supabase.from('words').update({ tags }).eq('id', rec.id);
        if (error) { console.error(`  ❌ ${rec.word} 更新失敗:`, error.message); continue; }
        tagged++;
        if (hadUserTag) promoted++;
      }
    }
    console.log(`Unit${unitNum} ${u.title}: 標記 ${tagged} 筆（其中升格修正 ${promoted} 筆）`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
