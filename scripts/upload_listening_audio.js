// 把本機 cache/listening/*.mp3 裡「Supabase Storage 上還沒有」的檔案上傳到 listening-audio public bucket。
// 跟 server/routes/listening_audio.js 用同一套 md5(dialogue) 檔名規則，上傳後正式站
// checkSupabaseListeningAudio() 就能直接查到，不需要正式站裝 Python/Kokoro。
// 用法：node scripts/upload_listening_audio.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
const CACHE_DIR = path.join(__dirname, '..', 'cache', 'listening');
const BUCKET = 'listening-audio';

(async () => {
  const files = fs.readdirSync(CACHE_DIR).filter(f => f.endsWith('.mp3'));
  console.log(`本機共 ${files.length} 個音檔，逐一檢查是否已在 Supabase Storage`);

  let uploaded = 0, skipped = 0, failed = 0;
  for (const file of files) {
    const { data: existing } = await supabase.storage.from(BUCKET).list('', { search: file });
    if (existing && existing.some(f => f.name === file)) { skipped++; continue; }

    const filePath = path.join(CACHE_DIR, file);
    const buffer = fs.readFileSync(filePath);
    const { error } = await supabase.storage.from(BUCKET).upload(file, buffer, {
      contentType: 'audio/mpeg',
      upsert: false,
    });
    if (error) {
      console.error(`  [FAIL] ${file}: ${error.message}`);
      failed++;
    } else {
      console.log(`  [OK] ${file}`);
      uploaded++;
    }
  }
  console.log(`\n完成：${uploaded} 上傳、${skipped} 已存在跳過、${failed} 失敗`);
})();
