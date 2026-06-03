/**
 * regenerate_examples.js — 用 Gemini 生成全部 2000 字的原創例句
 *
 * 目的：替換從劍橋字典爬取的有版權例句，改用 AI 生成的原創內容
 *
 * 執行：
 *   node server/scripts/regenerate_examples.js            # 完整執行
 *   node server/scripts/regenerate_examples.js --dry-run  # 僅測試前 3 批
 *   node server/scripts/regenerate_examples.js --supabase-only  # 跳過生成，只同步 DB
 *
 * 進度快取：supabase/examples_checkpoint.json（中斷後可繼續）
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs       = require('fs');
const path     = require('path');
const supabase = require('../db/supabase');

// ── 路徑 ─────────────────────────────────────────────────────
const CACHE_FILE      = path.join(__dirname, '../../supabase/words_cache.json');
const CHECKPOINT_FILE = path.join(__dirname, '../../supabase/examples_checkpoint.json');

// ── 設定 ─────────────────────────────────────────────────────
const BATCH_SIZE   = 20;   // 每批單字數
const DELAY_MS     = 3000; // 批次間隔（避免 RPM rate limit）
const MAX_RETRIES  = 4;    // 每批最大重試次數

const isDryRun      = process.argv.includes('--dry-run');
const isSupabaseOnly = process.argv.includes('--supabase-only');

// ── Gemini 初始化 ─────────────────────────────────────────────
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 模型優先順序：配額耗盡時自動切換
const MODEL_LIST = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-flash-lite-latest',
];
let currentModelIdx = 0;

function getModel() {
  return genai.getGenerativeModel({
    model: MODEL_LIST[currentModelIdx],
    generationConfig: {
      temperature: 0.7,
      responseMimeType: 'application/json',
    },
  });
}

// 從 429 錯誤訊息提取 retryDelay（秒）
function extractRetryDelay(errMsg) {
  const match = errMsg.match(/"retryDelay":"(\d+)s"/);
  return match ? parseInt(match[1]) * 1000 + 2000 : DELAY_MS * 4;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Prompt ────────────────────────────────────────────────────
function buildPrompt(words) {
  const list = words
    .map(({ word, pos, definition }) => `- ${word} (${pos})：${definition}`)
    .join('\n');

  return `You are an English teacher creating original example sentences for a Taiwanese middle school vocabulary app.

For each word below, write ONE original example sentence in English and its Traditional Chinese translation.

Requirements:
- English sentence: 8-14 words, natural everyday language, B1 level
- The sentence must clearly show the word's meaning in context
- Do NOT copy from any dictionary (Cambridge, Merriam-Webster, Oxford, etc.)
- Do NOT use the word's definition as the sentence
- Chinese translation: accurate 繁體中文, natural and readable for middle school students
- Each sentence must be completely original

Words:
${list}

Respond with a JSON object where each key is the word and value is an object with "example_en" and "example_zh":
{
  "word1": { "example_en": "...", "example_zh": "..." },
  "word2": { "example_en": "...", "example_zh": "..." }
}`;
}

// ── 生成單批 ─────────────────────────────────────────────────
async function generateBatch(words, attempt = 1) {
  try {
    const model  = getModel();
    const prompt = buildPrompt(words);
    const result = await model.generateContent(prompt);
    const text   = result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('無法解析 JSON 回應');
      parsed = JSON.parse(match[0]);
    }

    const valid = {};
    for (const { word } of words) {
      const entry = parsed[word];
      if (entry?.example_en && entry?.example_zh) {
        valid[word] = {
          example_en: entry.example_en.trim(),
          example_zh: entry.example_zh.trim(),
        };
      }
    }
    return valid;
  } catch (err) {
    const errMsg = err.message || '';

    // 429：配額超限 → 判斷類型再決定處理方式
    if (errMsg.includes('429') || errMsg.includes('Too Many Requests')) {
      const waitMs = extractRetryDelay(errMsg);

      // 日配額耗盡（PerDay）→ 立即切換模型，不重試
      const isDailyExhausted = errMsg.includes('PerDay') || errMsg.includes('limit: 0');
      if (isDailyExhausted && currentModelIdx < MODEL_LIST.length - 1) {
        currentModelIdx++;
        console.warn(`\n  ⚠ 日配額耗盡，切換模型 → ${MODEL_LIST[currentModelIdx]}`);
        await sleep(2000);
        return generateBatch(words, attempt);
      }

      // 分鐘配額（RPM）→ 等待後重試
      if (!isDailyExhausted && attempt < MAX_RETRIES) {
        const waitSec = Math.round(waitMs / 1000);
        process.stdout.write(`\n  ⚠ 429 Rate limit，等待 ${waitSec}s 後重試（${attempt}/${MAX_RETRIES}）… `);
        await sleep(waitMs);
        return generateBatch(words, attempt + 1);
      }

      // 日配額耗盡且無模型可切換 → 拋出錯誤
      if (isDailyExhausted) {
        throw new Error(`所有模型日配額耗盡，請等明天重置或開啟 Gemini API 帳單`);
      }
    }

    if (attempt < MAX_RETRIES) {
      console.warn(`\n  ⚠ 第 ${attempt} 次失敗（${errMsg.slice(0, 60)}），重試…`);
      await sleep(DELAY_MS * 2);
      return generateBatch(words, attempt + 1);
    }
    throw err;
  }
}

// ── 同步到 Supabase ───────────────────────────────────────────
async function syncToSupabase(checkpoint) {
  const words = Object.keys(checkpoint);
  console.log(`\n[Supabase] 同步 ${words.length} 字例句到資料庫…`);

  let ok = 0, fail = 0;
  const CHUNK = 100;

  for (let i = 0; i < words.length; i += CHUNK) {
    const chunk = words.slice(i, i + CHUNK);
    await Promise.all(chunk.map(async word => {
      const { example_en, example_zh } = checkpoint[word];
      const { error } = await supabase
        .from('words')
        .update({ example_en, example_zh })
        .eq('word', word);
      if (error) { fail++; console.error(`  ✗ ${word}: ${error.message}`); }
      else ok++;
    }));
    process.stdout.write(`\r  進度：${Math.min(i + CHUNK, words.length)} / ${words.length}`);
    await sleep(200);
  }

  console.log(`\n  ✓ 成功 ${ok}，失敗 ${fail}\n`);
}

// ── 主程式 ────────────────────────────────────────────────────
async function main() {
  console.log('\n══════════════════════════════════════════════════');
  console.log('  Vocatopia 例句原創化工具');
  if (isDryRun)       console.log('  [DRY RUN] 僅處理前 3 批');
  if (isSupabaseOnly) console.log('  [SUPABASE-ONLY] 跳過生成，直接同步 DB');
  console.log('══════════════════════════════════════════════════\n');

  // 讀取全部單字
  const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
  const allWords = Object.entries(cache).map(([word, data]) => ({
    word,
    pos: data.pos || '',
    definition: data.definition || '',
  }));
  console.log(`[讀取] words_cache.json：${allWords.length} 字\n`);

  // 讀取 checkpoint（已完成的字）
  let checkpoint = {};
  if (fs.existsSync(CHECKPOINT_FILE)) {
    checkpoint = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf-8'));
    console.log(`[Checkpoint] 已完成 ${Object.keys(checkpoint).length} 字，繼續未完成部分\n`);
  }

  // ── 僅同步到 Supabase（不重新生成）
  if (isSupabaseOnly) {
    if (Object.keys(checkpoint).length === 0) {
      console.error('❌ Checkpoint 是空的，請先執行生成步驟');
      process.exit(1);
    }
    await syncToSupabase(checkpoint);
    console.log('✅ Supabase 同步完成！');
    return;
  }

  // ── 篩選尚未生成的字
  const pending = allWords.filter(({ word }) => !checkpoint[word]);
  console.log(`[待生成] ${pending.length} 字（已完成 ${allWords.length - pending.length} 字）\n`);

  if (pending.length === 0) {
    console.log('✅ 所有例句已生成！執行 --supabase-only 同步到 DB。');
    return;
  }

  // ── 分批生成
  const batches = [];
  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    batches.push(pending.slice(i, i + BATCH_SIZE));
  }

  const maxBatches = isDryRun ? 3 : batches.length;
  console.log(`[批次] ${batches.length} 批 × ${BATCH_SIZE} 字，本次處理 ${maxBatches} 批\n`);

  let totalDone = Object.keys(checkpoint).length;
  let totalFail = 0;

  for (let i = 0; i < maxBatches; i++) {
    const batch     = batches[i];
    const batchNum  = i + 1;
    const firstWord = batch[0].word;
    const lastWord  = batch[batch.length - 1].word;

    process.stdout.write(`[批次 ${batchNum}/${maxBatches}] ${firstWord} ~ ${lastWord}… `);

    try {
      const result = await generateBatch(batch);
      const got    = Object.keys(result).length;

      // 合併到 checkpoint
      Object.assign(checkpoint, result);

      // 儲存 checkpoint（每批）
      fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2), 'utf-8');

      totalDone += got;
      const missed = batch.length - got;
      if (missed > 0) totalFail += missed;

      console.log(`✓ ${got}/${batch.length} 字（累計 ${totalDone}/${allWords.length}）`);
    } catch (err) {
      totalFail += batch.length;
      console.error(`✗ 失敗：${err.message}`);
    }

    if (i < maxBatches - 1) await sleep(DELAY_MS);
  }

  // ── 更新 words_cache.json
  console.log('\n[更新] words_cache.json…');
  for (const [word, examples] of Object.entries(checkpoint)) {
    if (cache[word]) {
      cache[word].example_en = examples.example_en;
      cache[word].example_zh = examples.example_zh;
    }
  }
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
  console.log('  ✓ words_cache.json 已更新\n');

  // ── 同步到 Supabase
  if (!isDryRun) {
    await syncToSupabase(checkpoint);
  }

  // ── 最終統計
  const remaining = allWords.length - Object.keys(checkpoint).length;
  console.log('══════════════════════════════════════════════════');
  console.log(`  完成：${Object.keys(checkpoint).length} 字`);
  console.log(`  失敗：${totalFail} 字`);
  console.log(`  剩餘：${remaining} 字`);
  if (remaining > 0) console.log('  💡 再次執行即可繼續未完成部分');
  console.log('══════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('\n❌ 致命錯誤：', err.message);
  process.exit(1);
});
