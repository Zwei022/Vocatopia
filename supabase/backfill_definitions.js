/**
 * Vocatopia — 補充字典資料腳本
 *
 * 針對 DB 中定義欄位為空或佔位符的單字，
 * 用 Free Dictionary API 取得音標 + 英文定義 + 例句，
 * 再用 Gemini (批次翻譯) 產生繁中定義 + 例句翻譯。
 *
 * 用法：
 *   node supabase/backfill_definitions.js           # 補全所有缺資料的單字
 *   node supabase/backfill_definitions.js --limit 100  # 只處理前 100 筆
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient }        = require('@supabase/supabase-js');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const supabase   = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
const genAI      = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const CACHE_FILE = path.join(__dirname, 'backfill_cache.json');
const LIMIT_ARG  = (() => {
  const idx = process.argv.indexOf('--limit');
  return idx !== -1 ? parseInt(process.argv[idx + 1]) : Infinity;
})();

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function loadCache() {
  if (!fs.existsSync(CACHE_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8')); }
  catch { return {}; }
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

// ── Free Dictionary API ───────────────────────────────────────────────
function fetchDictionary(word) {
  return new Promise((resolve) => {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (!Array.isArray(json) || json.length === 0) { resolve(null); return; }
          const entry = json[0];
          // phonetic
          const phonetic = entry.phonetic ||
            (entry.phonetics || []).find(p => p.text)?.text || '';
          // first definition + example
          const meaning = (entry.meanings || [])[0];
          const defEntry = (meaning?.definitions || [])[0];
          const def_en  = defEntry?.definition || '';
          const ex_en   = defEntry?.example    || '';
          resolve({ phonetic, def_en, ex_en });
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

// ── Gemini 批次翻譯 ───────────────────────────────────────────────────
async function translateBatch(model, items) {
  // items: [{word, def_en, ex_en}]
  const input = items.map(it =>
    `${it.word}|定義:${it.def_en}|例句:${it.ex_en}`
  ).join('\n');

  const prompt = `你是台灣國中英語教材設計師。
請將以下英文單字的定義和例句翻譯成繁體中文（10字以內定義，20字以內例句翻譯）。
若 def_en 或 ex_en 為空，請自行補充合適的繁中定義和例句翻譯。

格式（每行一筆）：word|繁中定義|例句中文翻譯

輸入：
${input}

只輸出轉換後的格式，不要多餘說明。`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (attempt > 1) await sleep(5000 * attempt);
      const result = await model.generateContent(prompt);
      const text   = result.response.text().trim();
      const map    = {};
      text.split('\n').forEach(line => {
        const parts = line.split('|');
        if (parts.length >= 3) {
          map[parts[0].trim()] = {
            definition: parts[1].trim(),
            example_zh: parts[2].trim(),
          };
        }
      });
      return map;
    } catch (err) {
      if (attempt === 3) throw err;
      console.warn(`  ↻ 翻譯重試 ${attempt}`);
    }
  }
}

// ── 主流程 ────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🔧 Vocatopia 字典資料補充腳本');

  // 1. 取得 DB 中缺少定義的單字
  const { data: rows, error } = await supabase
    .from('words')
    .select('id, word, pos')
    .or('definition.is.null,definition.eq.,phonetic.is.null,phonetic.eq.')
    .order('frequency_rank', { ascending: true });

  if (error) { console.error('✗ DB 讀取失敗:', error.message); process.exit(1); }

  const targets = (rows || []).slice(0, LIMIT_ARG);
  console.log(`   待補充：${targets.length} 筆 (DB 共 ${(rows||[]).length} 筆缺資料)`);
  if (targets.length === 0) { console.log('✅ 所有單字已有完整資料！'); return; }

  // 2. 載入 cache
  const cache = loadCache();
  console.log(`   快取：${Object.keys(cache).length} 筆\n`);

  // 3. 從 Free Dictionary API 取得英文資料
  const dictResults = {};
  let dictHit = 0, dictMiss = 0;
  console.log('📖 從 Free Dictionary API 取得英文資料...');

  for (let i = 0; i < targets.length; i++) {
    const { word } = targets[i];
    if (cache[word]?.def_en) { dictResults[word] = cache[word]; dictHit++; continue; }

    const result = await fetchDictionary(word);
    if (result && result.def_en) {
      dictResults[word] = result;
      cache[word] = { ...cache[word], ...result };
      dictHit++;
    } else {
      dictResults[word] = { phonetic: '', def_en: '', ex_en: '' };
      dictMiss++;
    }

    if (i % 50 === 49) {
      saveCache(cache);
      process.stdout.write(`  [${i + 1}/${targets.length}] ✓${dictHit} ✗${dictMiss}\r`);
    }
    await sleep(120); // gentle rate limit
  }
  saveCache(cache);
  console.log(`\n   ✓ 字典命中 ${dictHit} 筆，未找到 ${dictMiss} 筆\n`);

  // 4. Gemini 批次翻譯 (50 個/批)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',   // 免費層配額較 2.5-flash 寬鬆
    generationConfig: { temperature: 0.3, maxOutputTokens: 8192 },
  });

  const TRANS_BATCH = 50;
  const needTranslation = targets.filter(t => !cache[t.word]?.definition);
  const batches = [];
  for (let i = 0; i < needTranslation.length; i += TRANS_BATCH) {
    batches.push(needTranslation.slice(i, i + TRANS_BATCH));
  }

  console.log(`🈶 翻譯 ${needTranslation.length} 筆（${batches.length} 批次）...`);
  for (let bi = 0; bi < batches.length; bi++) {
    const batch = batches[bi];
    const items = batch.map(t => ({
      word:   t.word,
      def_en: dictResults[t.word]?.def_en || '',
      ex_en:  dictResults[t.word]?.ex_en  || '',
    }));

    process.stdout.write(`  批次 [${bi + 1}/${batches.length}] ...`);
    try {
      const map = await translateBatch(model, items);
      batch.forEach(t => {
        if (map[t.word]) {
          cache[t.word] = { ...cache[t.word], ...map[t.word] };
        }
      });
      console.log(` ✓`);
    } catch (err) {
      console.log(` ✗ ${err.message.slice(0, 60)}`);
    }

    if ((bi + 1) % 3 === 0) saveCache(cache);
    if (bi < batches.length - 1) await sleep(8000);
  }
  saveCache(cache);

  // 5. 寫回 DB
  console.log(`\n💾 更新 DB...`);
  let updated = 0, failed = 0;

  for (const { id, word } of targets) {
    const c = cache[word] || {};
    const d = dictResults[word] || {};
    const updateData = {};
    if (d.phonetic)      updateData.phonetic    = d.phonetic;
    if (c.definition)    updateData.definition  = c.definition;
    if (d.ex_en)         updateData.example_en  = d.ex_en;
    if (c.example_zh)    updateData.example_zh  = c.example_zh;
    if (Object.keys(updateData).length === 0) { failed++; continue; }

    const { error: upErr } = await supabase
      .from('words').update(updateData).eq('id', id);
    if (upErr) { failed++; }
    else { updated++; }

    if (updated % 50 === 0) process.stdout.write(`  ✓ ${updated}/${targets.length}\r`);
    await sleep(50);
  }

  console.log(`\n\n🎉 補充完成！更新 ${updated} 筆，失敗 ${failed} 筆`);
}

main().catch(err => {
  console.error('\n❌ 錯誤：', err.message);
  process.exit(1);
});
