/**
 * Unit 2-7（家人家庭/職業/人物和稱呼/外表特徵/人格特質/情緒）
 * 對資料庫已有的字：加上 unitN 標籤（保留原有 tags），並修正 user_lookup/user_custom 標籤升格問題。
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const report = JSON.parse(fs.readFileSync(
  'C:\\Users\\qaz10\\AppData\\Local\\Temp\\claude\\C--Users-qaz10-Desktop-claude-agent\\2fdc488b-2054-4240-9431-0285927f5ed7\\scratchpad\\vocab_unit\\match_report.json',
  'utf8'
));

async function main() {
  for (const unitNum of Object.keys(report)) {
    const u = report[unitNum];
    let tagged = 0, promoted = 0, alreadyOk = 0;
    for (const m of u.matched) {
      // records could theoretically have >1 row (duplicate word); update all
      for (const rec of m.records) {
        const tags = rec.tags || [];
        const hadBad = tags.includes('user_lookup') || tags.includes('user_custom');
        let newTags = Array.from(new Set([...tags, `unit${unitNum}`]));
        if (hadBad) {
          newTags = Array.from(new Set(
            newTags.filter(t => t !== 'user_lookup' && t !== 'user_custom').concat('cap_2000')
          ));
        }
        const changed = newTags.length !== tags.length || !tags.every(t => newTags.includes(t)) || hadBad;
        if (!changed) { alreadyOk++; continue; }
        const { error } = await supabase.from('words').update({ tags: newTags }).eq('id', rec.id);
        if (error) { console.error(`  ❌ ${rec.word} 更新失敗:`, error.message); continue; }
        tagged++;
        if (hadBad) promoted++;
      }
    }
    console.log(`Unit${unitNum} ${u.title}: 已標記 ${tagged} 字（其中升格修正 ${promoted} 字），本來就有標籤略過 ${alreadyOk} 字`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
