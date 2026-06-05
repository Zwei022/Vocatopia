/**
 * fill_new_words.js
 * 為 target_2000_words.json 中 need_data 的字補齊完整資料
 * 流程：
 *   1. Free Dictionary API → phonetic + raw english definition
 *   2. claude CLI + cambridge-style-examples skill → chinese_definition + english_definition + example_en + example_zh
 *   3. 寫入 words_cache.json（checkpoint 機制，中斷可繼續）
 */

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

const ROOT         = path.resolve(__dirname, '..');
const TARGET_FILE  = path.join(ROOT, 'target_2000_words.json');
const CACHE_FILE   = path.join(ROOT, 'supabase', 'words_cache.json');
const PDF_DEF_FILE = path.join(ROOT, 'pdf_words_with_def.json');
const SKILL_PATH   = 'C:\\Users\\qaz10\\.claude\\skills\\cambridge-style-examples\\SKILL.md';
const CHECKPOINT   = path.join(ROOT, 'scripts', 'fill_new_words_checkpoint.json');

const target  = JSON.parse(fs.readFileSync(TARGET_FILE, 'utf8'));
const cache   = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
const pdfDefs = JSON.parse(fs.readFileSync(PDF_DEF_FILE, 'utf8'));

// 載入 skill prompt
const skillPrompt = fs.readFileSync(SKILL_PATH, 'utf8');
const SKILL_TMP   = path.join(ROOT, 'scripts', '_skill_tmp.txt');
fs.writeFileSync(SKILL_TMP, skillPrompt, 'utf8');

// 載入 checkpoint
let done = {};
if (fs.existsSync(CHECKPOINT)) {
  done = JSON.parse(fs.readFileSync(CHECKPOINT, 'utf8'));
}

// 需要處理的字
const needData = target.need_data.filter(w => !done[w]);
console.log(`[*] 需補資料: ${target.need_data.length} 字，尚未處理: ${needData.length} 字`);

// ── Free Dictionary API ─────────────────────────────
function fetchFreeDict(word) {
  return new Promise((resolve) => {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    https.get(url, { timeout: 8000 }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (!Array.isArray(data) || !data[0]) return resolve(null);
          const entry = data[0];
          const phonetic = entry.phonetic || entry.phonetics?.find(p => p.text)?.text || '';
          const meaning  = entry.meanings?.[0];
          const pos      = meaning?.partOfSpeech || '';
          const rawDef   = meaning?.definitions?.[0]?.definition || '';
          resolve({ phonetic, pos, rawDef });
        } catch { resolve(null); }
      });
    }).on('error', () => resolve(null)).on('timeout', () => resolve(null));
  });
}

// ── Claude CLI 生成定義+例句 ────────────────────────
function generateWithClaude(batch) {
  // batch: [{word, pos, rawDef, pdfDef}]
  const input = batch.map(item => ({
    word: item.word,
    pos: item.pos || '',
    raw_data: item.rawDef || item.pdfDef || item.word
  }));

  const prompt = `請用 Mode 1（例句生成）+ Mode 2（定義改寫）同時處理以下單字，輸出完整 JSON。
每個單字包含：chinese_definition、english_definition、example_en、example_zh。
pure JSON only, no markdown.

${JSON.stringify(input)}`;

  const tmpInput = path.join(ROOT, 'scripts', '_claude_input.txt');
  fs.writeFileSync(tmpInput, prompt, 'utf8');

  try {
    const out = execSync(
      `claude -p "${tmpInput.replace(/\\/g,'\\\\')}" --system-prompt-file "${SKILL_TMP.replace(/\\/g,'\\\\')}" --model claude-haiku-4-5-20251001`,
      { encoding: 'utf8', timeout: 120000 }
    );
    // 提取 JSON
    const match = out.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch (e) {
    console.error('  [Claude Error]', e.message?.slice(0, 100));
    return null;
  }
}

// ── pos 標準化 ──────────────────────────────────────
function normPos(pos, pdfDef) {
  if (!pos && pdfDef) {
    if (/\(n\)/.test(pdfDef))   return '名詞';
    if (/\(v[it]?\)/.test(pdfDef)) return '動詞';
    if (/\(adj\)/.test(pdfDef)) return '形容詞';
    if (/\(adv\)/.test(pdfDef)) return '副詞';
    if (/\(prep\)/.test(pdfDef)) return '介系詞';
    if (/\(片\)/.test(pdfDef))  return '片語';
    if (/\[名詞\]/.test(pdfDef)) return '名詞';
    if (/\[動詞\]/.test(pdfDef)) return '動詞';
    if (/\[形容詞\]/.test(pdfDef)) return '形容詞';
    if (/\[副詞\]/.test(pdfDef)) return '副詞';
  }
  const map = { noun:'名詞', verb:'動詞', adjective:'形容詞', adverb:'副詞',
                preposition:'介系詞', conjunction:'連接詞', pronoun:'代名詞',
                exclamation:'感嘆詞', abbreviation:'縮寫' };
  return map[pos?.toLowerCase()] || pos || '名詞';
}

// ── 主流程 ──────────────────────────────────────────
const BATCH_SIZE = 10;

async function main() {
  let processed = 0;
  const total = needData.length;

  for (let i = 0; i < needData.length; i += BATCH_SIZE) {
    const batch = needData.slice(i, i + BATCH_SIZE);
    console.log(`\n[批次 ${Math.floor(i/BATCH_SIZE)+1}/${Math.ceil(total/BATCH_SIZE)}] 處理: ${batch.join(', ')}`);

    // Step 1: 抓 Free Dictionary
    const dictData = {};
    for (const word of batch) {
      const d = await fetchFreeDict(word);
      dictData[word] = d;
      await new Promise(r => setTimeout(r, 200)); // 限速
    }

    // Step 2: 組合 batch 資料
    const claudeBatch = batch.map(word => ({
      word,
      pos: dictData[word]?.pos || '',
      rawDef: dictData[word]?.rawDef || '',
      pdfDef: pdfDefs[word] || ''
    }));

    // Step 3: Claude 生成
    const generated = generateWithClaude(claudeBatch);

    // Step 4: 寫入 cache
    for (const word of batch) {
      const gen  = generated?.[word] || {};
      const dict = dictData[word];
      const pdf  = pdfDefs[word] || '';

      cache[word] = {
        pos:        normPos(dict?.pos, pdf),
        phonetic:   dict?.phonetic || '',
        definition: dict?.rawDef || pdf || word,
        definition_zh: gen.chinese_definition || pdf || '',
        example_en: gen.example_en || '',
        example_zh: gen.example_zh || '',
        done: true
      };

      done[word] = true;
    }

    // 每批存一次 checkpoint + cache
    fs.writeFileSync(CHECKPOINT, JSON.stringify(done, null, 2), 'utf8');
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');

    processed += batch.length;
    console.log(`  ✓ 完成 ${processed}/${total}`);
  }

  // 清理暫存
  if (fs.existsSync(SKILL_TMP)) fs.unlinkSync(SKILL_TMP);
  if (fs.existsSync(path.join(ROOT,'scripts','_claude_input.txt')))
    fs.unlinkSync(path.join(ROOT,'scripts','_claude_input.txt'));

  console.log(`\n[完成] 全部 ${total} 字已補齊，寫入 words_cache.json`);
}

main().catch(console.error);
