// 用本機 Ollama 批量生成缺字的字典資料（pos/phonetic/definition/definition_zh/example_en/example_zh），
// 跟 server/routes/words.js 的 generateDictEntry() 使用同一套 JSON 格式與規則，
// 生成結果直接寫入 Supabase words 表（tags: ['user_lookup']），跟 /api/words/search 共用同一份快取。
//
// 用法：
//   node scripts/batch_generate_words.js --test 50        只生成前 50 字，存到本地檔案，不寫入資料庫
//   node scripts/batch_generate_words.js                   正式跑：生成全部缺字並寫入 Supabase，可中斷續跑
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const supabase = require('../server/db/supabase');

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'qwen3.5:9b';
const MISSING_FILE = path.join(__dirname, 'missing_words.json');
const PROGRESS_FILE = path.join(__dirname, 'batch_progress.json');
const TEST_OUTPUT_FILE = path.join(__dirname, 'generated_words_test.json');

function buildPrompt(word) {
  return `You are a dictionary editor for Taiwanese junior high school English learners.
For the English word or phrase "${word}", return ONLY a JSON object:
{
 "valid": true or false,
 "pos": "名詞|動詞|形容詞|副詞|片語|介系詞|連接詞|代名詞|感嘆詞",
 "phonetic": "/IPA/",
 "definition": "ORIGINAL English definition, A2 level, simple words, NOT copied from any dictionary",
 "definition_zh": "繁體中文短語式定義，分號分隔多義，不寫完整句，不超過20字",
 "example_en": "ORIGINAL example sentence, 8-14 words, everyday situation for a Taiwanese teen",
 "example_zh": "自然的繁體中文翻譯"
}
Rules: definitions and examples must be entirely original wording (no copying from Cambridge/Oxford etc.). Traditional Chinese only (no simplified characters). definition_zh must not exceed 20 characters.`;
}

async function generateOne(word) {
  const res = await fetch(OLLAMA_URL, {
    method: 'POST',
    body: JSON.stringify({
      model: MODEL,
      format: 'json',
      stream: false,
      think: false,
      prompt: buildPrompt(word),
    }),
  });
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
  const data = await res.json();
  const parsed = JSON.parse(data.response);
  if (!parsed.valid) return null;
  const need = ['pos', 'phonetic', 'definition', 'definition_zh', 'example_en', 'example_zh'];
  for (const k of need) {
    if (!parsed[k] || typeof parsed[k] !== 'string') throw new Error(`生成欄位缺失: ${k}`);
  }
  return parsed;
}

function loadProgress() {
  try { return new Set(JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'))); }
  catch { return new Set(); }
}
function saveProgress(done) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify([...done]));
}

async function main() {
  const args = process.argv.slice(2);
  const testIdx = args.indexOf('--test');
  const testLimit = testIdx >= 0 ? parseInt(args[testIdx + 1], 10) : null;

  const allWords = JSON.parse(fs.readFileSync(MISSING_FILE, 'utf-8'));
  const words = testLimit ? allWords.slice(0, testLimit) : allWords;

  const done = testLimit ? new Set() : loadProgress();
  const remaining = words.filter(w => !done.has(w));
  console.log(`[開始] 共 ${words.length} 字，已完成 ${done.size}，待處理 ${remaining.length}`);

  const results = [];
  let ok = 0, skipped = 0, failed = 0;
  const t0 = Date.now();

  for (let i = 0; i < remaining.length; i++) {
    const word = remaining[i];
    try {
      const entry = await generateOne(word);
      if (!entry) { skipped++; console.log(`[${i+1}/${remaining.length}] ${word} → 判定非有效單字，略過`); }
      else {
        ok++;
        const row = {
          word,
          pos: entry.pos,
          phonetic: entry.phonetic,
          definition: entry.definition,
          definition_zh: entry.definition_zh,
          example_en: entry.example_en,
          example_zh: entry.example_zh,
          tags: ['user_lookup'],
          level: 1,
        };
        results.push(row);
        console.log(`[${i+1}/${remaining.length}] ${word} → ${entry.definition_zh}`);

        if (!testLimit) {
          const { error } = await supabase.from('words').insert([row]);
          if (error) console.error(`  寫入失敗 (${word}):`, error.message);
        }
      }
    } catch (err) {
      failed++;
      console.error(`[${i+1}/${remaining.length}] ${word} → 失敗: ${err.message}`);
    }
    done.add(word);
    if (!testLimit && (i + 1) % 10 === 0) saveProgress(done);
  }
  if (!testLimit) saveProgress(done);

  const mins = ((Date.now() - t0) / 60000).toFixed(1);
  console.log(`\n[完成] 成功 ${ok}　略過(非有效字) ${skipped}　失敗 ${failed}　耗時 ${mins} 分鐘`);

  if (testLimit) {
    fs.writeFileSync(TEST_OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`[測試模式] 結果已存到 ${TEST_OUTPUT_FILE}，未寫入資料庫`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
