/**
 * regenerate_with_skill.js
 * 用 claude -p CLI + cambridge-style-examples skill
 * 為 Vocatopia 全部 2000 字生成原創例句
 *
 * 執行：node server/scripts/regenerate_with_skill.js
 * 繼續：重新執行即可（checkpoint 自動跳過已完成）
 * 只同步DB：node server/scripts/regenerate_with_skill.js --supabase-only
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { execFile } = require('child_process');
const fs       = require('fs');
const path     = require('path');
const supabase = require('../db/supabase');

const CACHE_FILE      = path.join(__dirname, '../../supabase/words_cache.json');
const CHECKPOINT_FILE = path.join(__dirname, '../../supabase/examples_checkpoint.json');
const SKILL_FILE      = path.join(
  process.env.USERPROFILE || process.env.HOME,
  '.claude/skills/cambridge-style-examples/SKILL.md'
);

const BATCH_SIZE  = 20;
const DELAY_MS    = 800;
const MAX_RETRIES = 3;
const isSupabaseOnly = process.argv.includes('--supabase-only');

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── 讀取 Skill 內容 ──────────────────────────────────────────
function loadSkill() {
  if (!fs.existsSync(SKILL_FILE)) {
    throw new Error(`找不到 skill 檔案：${SKILL_FILE}`);
  }
  const raw  = fs.readFileSync(SKILL_FILE, 'utf-8');
  // 去掉 YAML frontmatter
  const body = raw.replace(/^---[\s\S]*?---\n/, '').trim();
  return body;
}

// ── Skill 暫存檔路徑 ─────────────────────────────────────────
const SKILL_TEMP = path.join(require('os').tmpdir(), 'cambridge_skill_system_prompt.txt');

// ── 呼叫 claude -p ───────────────────────────────────────────
function runClaude(userPrompt, attempt = 1) {
  return new Promise((resolve, reject) => {
    const args = [
      '-p', userPrompt,
      '--system-prompt-file', SKILL_TEMP,
      '--output-format', 'text',
      '--model', 'claude-haiku-4-5-20251001',
    ];

    execFile('claude', args, { timeout: 120_000, maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
      if (err) {
        if (attempt < MAX_RETRIES) {
          const wait = attempt * 3000;
          setTimeout(() => runClaude(userPrompt, attempt + 1).then(resolve).catch(reject), wait);
        } else {
          reject(new Error(stderr || err.message));
        }
        return;
      }
      resolve(stdout.trim());
    });
  });
}

// ── 生成一批 ─────────────────────────────────────────────────
async function generateBatch(words, systemPrompt) {
  const list = words
    .map(({ word, pos, definition }) =>
      `- ${word}${pos ? ` (${pos})` : ''}${definition ? `：${definition}` : ''}`)
    .join('\n');

  const userPrompt =
    `Generate example sentences for these words in batch JSON format:\n${list}\n\nRespond ONLY with a JSON object, no other text.`;

  const raw = await runClaude(userPrompt);

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('無法解析 JSON：' + raw.slice(0, 100));
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
    await sleep(200);
  }
  console.log(`\n  成功 ${ok}，失敗 ${fail}`);
}

// ── 主程式 ────────────────────────────────────────────────────
async function main() {
  console.log('\n════════════════════════════════════════════════');
  console.log('  Vocatopia 例句原創化 (cambridge-style-examples skill)');
  console.log('════════════════════════════════════════════════\n');

  // 載入 skill → 寫入暫存檔（避免命令列長度限制）
  const systemPrompt = loadSkill();
  fs.writeFileSync(SKILL_TEMP, systemPrompt, 'utf-8');
  console.log(`[Skill] cambridge-style-examples 已載入（${systemPrompt.length} chars → ${SKILL_TEMP}）\n`);

  const cache    = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
  const allWords = Object.entries(cache).map(([word, d]) => ({
    word, pos: d.pos || '', definition: d.definition || '',
  }));
  console.log(`[讀取] ${allWords.length} 字\n`);

  let checkpoint = {};
  if (fs.existsSync(CHECKPOINT_FILE)) {
    checkpoint = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf-8'));
    console.log(`[Checkpoint] 已完成 ${Object.keys(checkpoint).length} 字，繼續未完成部分\n`);
  }

  if (isSupabaseOnly) {
    await syncToSupabase(checkpoint);
    console.log('✅ Supabase 同步完成');
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
    const label = `[${String(i + 1).padStart(3)}/${batches.length}] ${batch[0].word} ~ ${batch[batch.length - 1].word}`;
    process.stdout.write(`${label}… `);

    try {
      const result = await generateBatch(batch, systemPrompt);
      const got    = Object.keys(result).length;
      Object.assign(checkpoint, result);
      fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2), 'utf-8');
      totalDone += got;
      totalFail += batch.length - got;
      console.log(`OK ${got}/${batch.length}  (累計 ${totalDone}/${allWords.length})`);
    } catch (err) {
      totalFail += batch.length;
      console.error(`FAIL ${err.message.slice(0, 80)}`);
    }

    if (i < batches.length - 1) await sleep(DELAY_MS);
  }

  // 更新 words_cache.json
  console.log('\n[更新] words_cache.json…');
  for (const [word, ex] of Object.entries(checkpoint)) {
    if (cache[word]) {
      cache[word].example_en = ex.example_en;
      cache[word].example_zh = ex.example_zh;
    }
  }
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
  console.log('  完成\n');

  // 同步 Supabase
  await syncToSupabase(checkpoint);

  const remaining = allWords.length - Object.keys(checkpoint).length;
  console.log('\n════════════════════════════════════════════════');
  console.log(`  完成：${Object.keys(checkpoint).length} 字`);
  console.log(`  失敗：${totalFail} 字`);
  if (remaining > 0) console.log(`  剩餘：${remaining} 字（重跑可繼續）`);
  console.log('════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('\n[FATAL]', err.message);
  process.exit(1);
});
