// target_2000_words.json 舊版是靜態檔案，經稽核發現缺了一批基礎字（teacher/student/water/
// school/time 等），推測是先前用 gsat-vocabulary-auditor 審核瘦身時被誤刪。
// 這支腳本改成直接從 Supabase words 表（gsat_core 標籤，跟主字庫列表 GET /api/words
// 用同一套權威來源）重新產生，之後單字卡組異動就是唯一該信的字彙範圍依據。
// 用法：node scripts/regen_target_2000_words.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
const OUT_FILE = path.join(__dirname, '..', 'target_2000_words.json');

(async () => {
  const words = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('words').select('word').contains('tags', ['gsat_core']).range(from, from + PAGE - 1);
    if (error) { console.error('查詢失敗：', error.message); process.exit(1); }
    words.push(...data.map(r => r.word));
    if (data.length < PAGE) break;
  }
  words.sort();
  fs.writeFileSync(OUT_FILE, JSON.stringify({ words }, null, 2) + '\n', 'utf8');
  console.log(`已重新產生 target_2000_words.json，共 ${words.length} 字（來源：words 表 gsat_core 標籤）`);
})();
