/**
 * regenerate_examples_claude.js
 * 用 Claude API + cambridge-style-examples skill 邏輯
 * 為 Vocatopia 全部 2000 字生成原創例句（不侵權）
 *
 * 執行：node server/scripts/regenerate_examples_claude.js
 * 繼續：重新執行即可（checkpoint 自動跳過已完成）
 * 只同步DB：node server/scripts/regenerate_examples_claude.js --supabase-only
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const Anthropic = require('@anthropic-ai/sdk');
const fs        = require('fs');
const path      = require('path');
const supabase  = require('../db/supabase');

const CACHE_FILE      = path.join(__dirname, '../../supabase/words_cache.json');
const CHECKPOINT_FILE = path.join(__dirname, '../../supabase/examples_checkpoint.json');

const BATCH_SIZE  = 20;
const DELAY_MS    = 500;
const MAX_RETRIES = 3;

const isSupabaseOnly = process.argv.includes('--supabase-only');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Cambridge-style prompt（直接從 skill 移植）────────────────
function buildPrompt(words) {
  const list = words
    .map(({ word, pos, definition }) =>
      `- ${word}${pos ? ` (${pos})` : ''}${definition ? `：${definition}` : ''}`)
    .join('\n');

  return `You are generating original, non-copyrighted English example sentences with Traditional Chinese translations for a Taiwanese middle school vocabulary app (Vocatopia).

Style guide (Cambridge Dictionary style):
- Context reveals meaning: a reader unfamiliar with the word can infer it from context
- Everyday relatable situations: school, family, food, travel, weather, sports
- One clear focus: the target word appears once and is the natural center
- Natural spoken English, not grammar-exercise language

Quality rules:
- English: 8–14 words, B1–B2 level, grammatically correct
- MUST be 100% original — NOT copied or paraphrased from any dictionary (Cambridge, Oxford, Merriam-Webster, Longman, etc.)
- Chinese: natural 繁體中文, reads like a Taiwanese textbook sentence, not word-for-word

Words to process:
${list}

Respond ONLY with a JSON object (no prose, no explanation):
{
  "word1": { "example_en": "...", "example_zh": "..." },
  "word2": { "example_en": "...", "example_zh": "..." }
}`;
}

// ── 生成一批 ─────────────────────────────────────────────────
async function generateBatch(words, attempt = 1) {
  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: buildPrompt(words) }],
    });

    const text = message.content[0]?.text || '';
    let parsed;
    try {
      parsed = JSON.parse(text.trim());
    } catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('無法解析 JSON');
      parsed = JSON.parse(m[0]);
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
    const msg = err.message || '';
    // 429 rate limit → 等待後重試
    if ((msg.includes('429') || msg.includes('rate_limit') || msg.includes('overloaded')) && attempt < MAX_RETRIES) {
      const wait = Math.pow(2, attempt) * 5000;
      process.stdout.write(`\n  ⚠ ${msg.slice(0, 60)}，等 ${wait/1000}s 重試… `);
      await sleep(wait);
      return generateBatch(words, attempt + 1);
    }
    if (attempt < MAX_RETRIES) {
      await sleep(2000);
      return generateBatch(words, attempt + 1);
    }
    throw err;
  }
}

// ── 同步到 Supabase ───────────────────────────────────────────
async function syncToSupabase(checkpoint) {
  const words = Object.keys(checkpoint);
  console.log(`\n[Supabase] 同步 ${words.length} 字…`);
  let ok = 0, fail = 0;
  for (let i = 0; i < words.length; i += 100) {
    const chunk = words.slice(i, i + 100);
    await Promise.all(chunk.map(async word => {
      const { example_en, example_zh } = checkpoint[word];
      const { error } = await supabase
        .from('words').update({ example_en, example_zh }).eq('word', word);
      error ? fail++ : ok++;
    }));
    process.stdout.write(`\r  進度 ${Math.min(i + 100, words.length)}/${words.length}`);
    await sleep(150);
  }
  console.log(`\n  成功 ${ok}，失敗 ${fail}`);
}

// ── 主程式 ────────────────────────────────────────────────────
async function main() {
  console.log('\n════════════════════════════════════════════════');
  console.log('  Vocatopia 例句原創化 (Claude API)');
  console.log('════════════════════════════════════════════════\n');

  const cache    = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
  const allWords = Object.entries(cache).map(([word, d]) => ({
    word, pos: d.pos || '', definition: d.definition || '',
  }));
  console.log(`[讀取] ${allWords.length} 字\n`);

  let checkpoint = {};
  if (fs.existsSync(CHECKPOINT_FILE)) {
    checkpoint = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf-8'));
    console.log(`[Checkpoint] 已完成 ${Object.keys(checkpoint).length} 字\n`);
  }

  if (isSupabaseOnly) {
    await syncToSupabase(checkpoint);
    console.log('✅ 完成');
    return;
  }

  const pending = allWords.filter(({ word }) => !checkpoint[word]);
  console.log(`[待生成] ${pending.length} 字\n`);
  if (!pending.length) {
    console.log('全部已完成！執行 --supabase-only 同步到 DB。');
    return;
  }

  const batches = [];
  for (let i = 0; i < pending.length; i += BATCH_SIZE)
    batches.push(pending.slice(i, i + BATCH_SIZE));

  console.log(`[批次] ${batches.length} 批 × ${BATCH_SIZE} 字\n`);

  let totalDone = Object.keys(checkpoint).length;
  let totalFail = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    process.stdout.write(
      `[${i+1}/${batches.length}] ${batch[0].word} ~ ${batch[batch.length-1].word}… `
    );

    try {
      const result = await generateBatch(batch);
      const got    = Object.keys(result).length;
      Object.assign(checkpoint, result);
      fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2), 'utf-8');
      totalDone += got;
      totalFail += batch.length - got;
      console.log(`✓ ${got}/${batch.length}（累計 ${totalDone}/${allWords.length}）`);
    } catch (err) {
      totalFail += batch.length;
      console.error(`✗ ${err.message.slice(0, 80)}`);
    }

    if (i < batches.length - 1) await sleep(DELAY_MS);
  }

  // 更新 words_cache.json
  console.log('\n[更新] words_cache.json…');
  for (const [word, ex] of Object.entries(checkpoint)) {
    if (cache[word]) { cache[word].example_en = ex.example_en; cache[word].example_zh = ex.example_zh; }
  }
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');

  // 同步 Supabase
  await syncToSupabase(checkpoint);

  const remaining = allWords.length - Object.keys(checkpoint).length;
  console.log('\n════════════════════════════════════════════════');
  console.log(`  完成：${Object.keys(checkpoint).length} 字`);
  console.log(`  失敗：${totalFail} 字`);
  if (remaining > 0) console.log(`  剩餘：${remaining} 字（重跑可繼續）`);
  console.log('════════════════════════════════════════════════\n');
}

main().catch(err => { console.error('\n❌', err.message); process.exit(1); });
