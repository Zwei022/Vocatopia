require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const EXPECTED = { 15: 24, 16: 71, 17: 29, 18: 73, 19: 29, 20: 56 };

async function main() {
  for (const [n, expected] of Object.entries(EXPECTED)) {
    const tag = `unit${n}`;
    const { data, error } = await supabase.from('words').select('id, word, tags').contains('tags', [tag]);
    if (error) { console.error(tag, error.message); continue; }
    const ok = data.length === expected ? '✅' : '❌';
    console.log(`${ok} unit${n}: 資料庫 ${data.length} 筆 vs 書上 ${expected} 字`);
    if (data.length !== expected) {
      console.log('   目前資料庫內容:', data.map(d => d.word).sort().join(', '));
    }
  }
}
main().catch(err => { console.error(err); process.exit(1); });
