require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function run() {
  console.log('▶ Supabase 連線成功！\n');

  // 列出 words 表的前 3 筆資料（抓所有欄位）
  const { data, error } = await supabase.from('words').select('*').limit(3);

  if (error) {
    console.log('words 表狀態:', error.message, `(code: ${error.code})`);
  } else if (data.length === 0) {
    console.log('words 表存在但是空的');
  } else {
    console.log('words 表現有欄位：', Object.keys(data[0]).join(', '));
    console.log('樣本資料：', JSON.stringify(data[0], null, 2));
  }

  // 列出 articles 表
  const { data: arts, error: artErr } = await supabase.from('articles').select('*').limit(1);
  if (artErr) console.log('\narticles 表狀態:', artErr.message);
  else console.log('\narticles 表現有欄位：', arts.length ? Object.keys(arts[0]).join(', ') : '空的');

  // 列出 profiles 表
  const { data: prof, error: profErr } = await supabase.from('profiles').select('*').limit(1);
  if (profErr) console.log('profiles 表狀態:', profErr.message);
  else console.log('profiles 表現有欄位：', prof.length ? Object.keys(prof[0]).join(', ') : '空的');
}

run();
