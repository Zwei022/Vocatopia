/**
 * patch_words.js — 快速補齊2000字資料
 *
 * 步驟：
 *   1. 從 official_with_pos.txt 讀取全部 1935 字作為基準
 *   2. 比對 Supabase，找出缺失的字和缺失欄位
 *   3. 用 Free Dictionary API 批次補齊音標、英文例句（10 字並發）
 *   4. 對於 DB 中完全缺失的字，直接 INSERT
 *   5. 對於有缺失欄位的字，UPDATE
 *
 * 執行：node server/scripts/patch_words.js
 * 預估時間：~10-15 分鐘
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const https    = require('https');
const fs       = require('fs');
const path     = require('path');
const supabase = require('../db/supabase');

const WORD_FILE   = path.join(__dirname, '../../official_with_pos.txt');
const CONCURRENCY = 8;   // 並發請求數
const DELAY_MS    = 200; // 每批之間的等待

const POS_MAP = {
  'n.': '名詞', 'v.': '動詞', 'adj.': '形容詞', 'adv.': '副詞',
  'conj.': '連接詞', 'prep.': '介系詞', 'pron.': '代名詞',
  'aux.': '助動詞', 'int.': '感嘆詞', 'det.': '限定詞', 'num.': '數詞',
};

// ── 工具 ──────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

function getLevel(rank) {
  if (rank <= 400)  return 1;
  if (rank <= 800)  return 2;
  if (rank <= 1200) return 3;
  if (rank <= 1600) return 4;
  return 5;
}

function parseWordList() {
  const POS_RE = /^(.+?)\s+(n\.|v\.|adj\.|adv\.|conj\.|prep\.|pron\.|aux\.|int\.|det\.|num\.)\s*$/;
  const lines  = fs.readFileSync(WORD_FILE, 'utf-8').split('\n');
  const result = [];
  let rank = 1;
  for (const line of lines) {
    const m = line.trim().match(POS_RE);
    if (m) result.push({
      word: m[1].trim().toLowerCase(),
      pos:  POS_MAP[m[2].trim()] || m[2].trim(),
      rank: rank++,
    });
  }
  return result;
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      },
      timeout: 8000,
    }, res => {
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(`HTTP ${res.statusCode}`)); }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch(e) { reject(e); }
      });
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function fetchFreeDict(word) {
  return httpGet(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
}

function extractData(json) {
  if (!Array.isArray(json) || !json.length) return null;
  const entry = json[0];

  // 音標（優先美式）
  let phonetic = '';
  if (entry.phonetics?.length) {
    const us  = entry.phonetics.find(p => (p.audio || '').includes('-us') || (p.audio || '').includes('en-us'));
    const any = entry.phonetics.find(p => p.text);
    phonetic  = us?.text || entry.phonetic || any?.text || '';
    if (phonetic && !phonetic.startsWith('/')) phonetic = `/${phonetic}/`;
    if (phonetic.endsWith('//')) phonetic = phonetic.slice(0, -1);
  }

  // 英文例句（從所有 meanings 取第一個有 example 的 definition）
  let example_en = '';
  for (const m of (entry.meanings || [])) {
    for (const d of (m.definitions || [])) {
      if (d.example) { example_en = d.example; break; }
    }
    if (example_en) break;
  }

  return { phonetic, example_en };
}

// ── 主程式 ────────────────────────────────────────────────────
async function main() {
  console.log('\n═══════════════════════════════════════════');
  console.log('  Vocatopia 單字資料補齊工具');
  console.log('═══════════════════════════════════════════\n');

  // 1. 讀字表
  const wordList = parseWordList();
  console.log(`[字表] ${wordList.length} 個單字\n`);

  // 2. 從 Supabase 讀取現有資料
  console.log('[Supabase] 讀取現有資料...');
  const { data: dbWords, error: dbErr } = await supabase
    .from('words')
    .select('id, word, phonetic, example_en, example_zh, definition, pos');
  if (dbErr) throw new Error('讀取 DB 失敗：' + dbErr.message);

  const dbMap = new Map(dbWords.map(w => [w.word, w]));
  console.log(`  DB 現有：${dbWords.length} 字\n`);

  // 3. 分類：新字 vs 待補齊
  const toInsert = [];   // 完全不在 DB
  const toPatch  = [];   // 在 DB 但缺音標或例句

  for (const { word, pos, rank } of wordList) {
    const existing = dbMap.get(word);
    if (!existing) {
      toInsert.push({ word, pos, rank });
    } else if (!existing.phonetic || !existing.example_en) {
      toPatch.push({ id: existing.id, word, rank, existing });
    }
  }

  console.log(`[分類] 需新增：${toInsert.length} 字，需補齊：${toPatch.length} 字\n`);

  // 4. 並發批次抓資料
  async function fetchBatch(items, label, fn) {
    let done = 0, failed = 0;
    for (let i = 0; i < items.length; i += CONCURRENCY) {
      const batch = items.slice(i, i + CONCURRENCY);
      await Promise.all(batch.map(async item => {
        try {
          const json = await fetchFreeDict(item.word);
          const d    = extractData(json);
          if (d) { await fn(item, d); done++; }
          else failed++;
        } catch { failed++; }
      }));
      process.stdout.write(`\r  ${label}：${Math.min(i + CONCURRENCY, items.length)} / ${items.length}（✓${done} ✗${failed}）`);
      await sleep(DELAY_MS);
    }
    console.log();
  }

  // 5. 補齊現有資料
  if (toPatch.length > 0) {
    console.log('[補齊] 抓取缺失音標 + 例句...');
    await fetchBatch(toPatch, '補齊', async (item, d) => {
      const updates = {};
      if (!item.existing.phonetic  && d.phonetic)   updates.phonetic   = d.phonetic;
      if (!item.existing.example_en && d.example_en) updates.example_en = d.example_en;
      if (Object.keys(updates).length === 0) return;
      const { error } = await supabase.from('words').update(updates).eq('id', item.id);
      if (error) throw error;
    });
    console.log('  ✓ 補齊完成\n');
  }

  // 6. 新增缺失的字
  if (toInsert.length > 0) {
    console.log('[新增] 抓取新字資料...');
    const newRows = [];

    await fetchBatch(toInsert, '新增', async (item, d) => {
      newRows.push({
        word:        item.word,
        pos:         item.pos,
        definition:  '',            // 中文解釋需之後用 build_worddb.js 補
        phonetic:    d.phonetic   || '',
        example_en:  d.example_en || '',
        example_zh:  '',
        tags:        ['cap_2000'],
        level:       getLevel(item.rank),
        frequency_rank: item.rank,
      });
    });

    // 批次 INSERT
    const BATCH = 100;
    for (let i = 0; i < newRows.length; i += BATCH) {
      const slice = newRows.slice(i, i + BATCH);
      const { error } = await supabase.from('words').insert(slice);
      if (error) console.error(`  ✗ 插入失敗（${i}-${i + slice.length}）：${error.message}`);
      process.stdout.write(`\r  寫入：${Math.min(i + BATCH, newRows.length)} / ${newRows.length}`);
    }
    console.log('\n  ✓ 新字新增完成\n');
  }

  // 7. 驗收
  const { data: finalCheck } = await supabase
    .from('words')
    .select('id, phonetic, example_en, definition', { count: 'exact' });

  const total = finalCheck.length;
  const wPhon = finalCheck.filter(w => w.phonetic).length;
  const wExEn = finalCheck.filter(w => w.example_en).length;
  const wDef  = finalCheck.filter(w => w.definition).length;

  console.log('═══════════════════════════════════════════');
  console.log(`  完成統計（共 ${total} 字）`);
  console.log(`  有音標：${wPhon}（${Math.round(wPhon/total*100)}%）`);
  console.log(`  有英文例句：${wExEn}（${Math.round(wExEn/total*100)}%）`);
  console.log(`  有中文解釋：${wDef}（${Math.round(wDef/total*100)}%）`);
  console.log('═══════════════════════════════════════════');
  console.log('\n✅ 完成！');
  console.log('💡 提示：執行 node server/scripts/build_worddb.js 可補齊中文解釋和例句翻譯\n');
}

main().catch(err => {
  console.error('\n❌', err.message);
  process.exit(1);
});
