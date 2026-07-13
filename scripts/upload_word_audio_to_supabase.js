/**
 * upload_word_audio_to_supabase.js
 *
 * 通用批次上傳工具：把本機 mp3 資料夾上傳到 Supabase Storage 的 public bucket。
 * 取代原本依賴 Railway 本機磁碟（每次部署會被清空）的做法。
 *
 * 用法：
 *   node scripts/upload_word_audio_to_supabase.js --bucket word-audio --dir public/audio/words
 *   node scripts/upload_word_audio_to_supabase.js --bucket sentence-audio --dir public/audio/sentences/words  --prefix words/
 *   node scripts/upload_word_audio_to_supabase.js --bucket sentence-audio --dir public/audio/sentences/grammar --prefix grammar/
 *   加 --rebuild 全部覆蓋重傳
 */
require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : def;
}

const BUCKET    = arg('bucket', 'word-audio');
const AUDIO_DIR = path.resolve(__dirname, '..', arg('dir', 'public/audio/words'));
const PREFIX    = arg('prefix', '');
const rebuild   = process.argv.includes('--rebuild');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

async function ensureBucket() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw error;
  if (buckets.some(b => b.name === BUCKET)) {
    console.log(`[*] Bucket "${BUCKET}" 已存在`);
    return;
  }
  const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: '2MB',
  });
  if (createErr) throw createErr;
  console.log(`[*] 已建立 public bucket "${BUCKET}"`);
}

async function listExisting(prefix) {
  const existing = new Set();
  let offset = 0;
  const limit = 1000;
  for (;;) {
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit, offset });
    if (error) throw error;
    if (!data.length) break;
    data.forEach(f => existing.add(f.name));
    if (data.length < limit) break;
    offset += limit;
  }
  return existing;
}

async function main() {
  await ensureBucket();

  if (!fs.existsSync(AUDIO_DIR)) {
    console.log(`[!] 目錄不存在：${AUDIO_DIR}，跳過`);
    return;
  }
  const files = fs.readdirSync(AUDIO_DIR).filter(f => f.endsWith('.mp3'));
  console.log(`[*] ${AUDIO_DIR} 共有 ${files.length} 個 mp3 檔，目標 bucket="${BUCKET}" prefix="${PREFIX}"`);

  const existing = rebuild ? new Set() : await listExisting(PREFIX.replace(/\/$/, ''));
  const todo = files.filter(f => !existing.has(f));
  console.log(`[*] 需要上傳：${todo.length}（已存在跳過：${files.length - todo.length}）`);

  let ok = 0, fail = 0;
  const t0 = Date.now();
  for (let i = 0; i < todo.length; i++) {
    const name = todo[i];
    const buf = fs.readFileSync(path.join(AUDIO_DIR, name));
    const { error } = await supabase.storage.from(BUCKET).upload(PREFIX + name, buf, {
      contentType: 'audio/mpeg',
      cacheControl: '86400',
      upsert: true,
    });
    if (error) {
      console.error(`  [FAIL] ${name}: ${error.message}`);
      fail++;
    } else {
      ok++;
    }
    if ((i + 1) % 100 === 0 || i === todo.length - 1) {
      const elapsed = (Date.now() - t0) / 1000;
      console.log(`  [${i + 1}/${todo.length}] ${ok} OK / ${fail} fail | ${elapsed.toFixed(0)}s elapsed`);
    }
  }
  console.log(`\n[*] 完成：${ok} 成功、${fail} 失敗`);
  if (files.length) {
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(PREFIX + files[0]);
    console.log(`[*] 公開 URL 範例：${pub.publicUrl}`);
  }
}

main().catch(err => { console.error('[FATAL]', err); process.exit(1); });
