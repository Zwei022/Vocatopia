require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function run() {
  console.log('▶ Testing Supabase connection...');

  const { data, error } = await supabase.from('words').select('word, def_zh').limit(5);

  if (error) {
    if (error.code === '42P01') {
      console.log('\n⚠  資料表不存在，請先在 Supabase SQL Editor 執行：');
      console.log('   1. supabase/schema.sql');
      console.log('   2. supabase/seed.sql\n');
    } else {
      console.error('✗ 連線錯誤:', error.message, `(code: ${error.code})`);
    }
    process.exit(1);
  }

  console.log('✓ 連線成功！words 資料表已存在，抽樣資料：');
  data.forEach(w => console.log(`  ${w.word.padEnd(12)} ${w.def_zh}`));
}

run();
