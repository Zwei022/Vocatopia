require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

async function main() {
  for (const u of [27, 28, 29]) {
    const { data, error, count } = await supabase
      .from('words')
      .select('id', { count: 'exact' })
      .contains('tags', [`unit${u}`]);
    if (error) { console.error(error.message); continue; }
    console.log(`unit${u}: ${count ?? data.length} 筆`);
  }
}
main();
