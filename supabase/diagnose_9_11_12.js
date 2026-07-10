require('dotenv').config({ path: 'C:\\Users\\qaz10\\Desktop\\claude agent\\vocatopia\\.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
const units = JSON.parse(fs.readFileSync(
  'C:\\Users\\qaz10\\AppData\\Local\\Temp\\claude\\C--Users-qaz10-Desktop-claude-agent\\2fdc488b-2054-4240-9431-0285927f5ed7\\scratchpad\\vocab_unit\\units_8_14.json',
  'utf8'
));

async function main() {
  for (const n of ['9', '11', '12']) {
    const list = [...units[n].basic, ...units[n].adv];
    const seen = {};
    const dups = [];
    for (const w of list) { const k = w.toLowerCase(); seen[k] = (seen[k] || 0) + 1; }
    for (const k in seen) if (seen[k] > 1) dups.push(k + 'x' + seen[k]);
    console.log(`unit${n} list len ${list.length} dups within list: ${dups.join(',') || 'none'}`);

    const missingTag = [];
    for (const w of list) {
      const { data } = await supabase.from('words').select('id,word,tags').ilike('word', w);
      if (!data || !data.length) { missingTag.push(`${w}(NOT IN DB)`); continue; }
      const anyTagged = data.some(r => (r.tags || []).includes('unit' + n));
      if (!anyTagged) missingTag.push(`${w}(no unit tag, rows=${data.length})`);
    }
    console.log(`unit${n} words without unit tag: ${missingTag.join(', ') || 'none'}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
