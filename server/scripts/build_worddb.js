/**
 * build_worddb.js — Vocatopia 2000 字資料庫建置腳本
 *
 * 資料來源：劍橋字典繁體中文版（Cambridge Dictionary Traditional Chinese）
 * 備援音標：Free Dictionary API（dictionaryapi.dev）
 * 快取檔：supabase/words_cache.json（可中斷後繼續執行）
 *
 * 用法：
 *   node server/scripts/build_worddb.js             # 爬取 + 匯入
 *   node server/scripts/build_worddb.js --import-only  # 只匯入（用快取）
 *   node server/scripts/build_worddb.js --reset        # 清空快取重頭爬
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const cheerio  = require('cheerio');
const https    = require('https');
const http     = require('http');
const fs       = require('fs');
const path     = require('path');
const supabase = require('../db/supabase');

// ── 路徑設定 ────────────────────────────────────────────────
const WORD_FILE  = path.join(__dirname, '../../official_with_pos.txt');
const CACHE_FILE = path.join(__dirname, '../../supabase/words_cache.json');

// ── 常數 ────────────────────────────────────────────────────
const DELAY_MIN  = 1200;   // 每次請求最短間隔 ms
const DELAY_RAND = 800;    // 隨機額外延遲 ms
const PAUSE_EVERY = 50;    // 每 N 個請求額外暫停
const PAUSE_MS   = 8000;   // 額外暫停時間 ms
const BATCH_SIZE = 80;     // Supabase 每批寫入筆數

const POS_MAP = {
  'n.':    '名詞',
  'v.':    '動詞',
  'adj.':  '形容詞',
  'adv.':  '副詞',
  'conj.': '連接詞',
  'prep.': '介系詞',
  'pron.': '代名詞',
  'aux.':  '助動詞',
  'int.':  '感嘆詞',
  'det.':  '限定詞',
  'num.':  '數詞',
};

// ── 工具函式 ─────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

function getLevel(rank) {
  if (rank <= 400)  return 1;
  if (rank <= 800)  return 2;
  if (rank <= 1200) return 3;
  if (rank <= 1600) return 4;
  return 5;
}

/** 解析 official_with_pos.txt → [{word, pos, rank}] */
function parseWordList() {
  const POS_RE = /^(.+?)\s+(n\.|v\.|adj\.|adv\.|conj\.|prep\.|pron\.|aux\.|int\.|det\.|num\.)\s*$/;
  const lines  = fs.readFileSync(WORD_FILE, 'utf-8').split('\n');
  const result = [];
  let rank = 1;
  for (const line of lines) {
    const m = line.trim().match(POS_RE);
    if (m) {
      result.push({
        word: m[1].trim().toLowerCase(),
        pos:  POS_MAP[m[2].trim()] || m[2].trim(),
        rank: rank++,
      });
    }
  }
  return result;
}

/** 通用 HTTP GET（自動跟隨 301/302 重導向） */
function httpGet(url, headers = {}, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const opts = {
      headers: {
        'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'identity',
        ...headers,
      },
      timeout: 15000,
    };
    const req = mod.get(url, opts, res => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
        if (maxRedirects <= 0) return reject(new Error('重導向次數過多'));
        const loc = res.headers.location;
        if (!loc) return reject(new Error('重導向無目標'));
        res.resume();
        return httpGet(loc.startsWith('http') ? loc : new URL(loc, url).href, headers, maxRedirects - 1)
          .then(resolve).catch(reject);
      }
      if (res.statusCode === 429) return reject(new Error('429 Too Many Requests'));
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('請求逾時')); });
  });
}

/** 劍橋字典繁體中文版 */
async function fetchCambridge(word) {
  const url = `https://dictionary.cambridge.org/dictionary/english-chinese-traditional/${encodeURIComponent(word)}`;
  return httpGet(url);
}

/** Free Dictionary API（備援音標） */
async function fetchFreeDict(word) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
  try {
    const raw  = await httpGet(url, { 'Accept': 'application/json' });
    const json = JSON.parse(raw);
    if (!Array.isArray(json) || !json.length) return null;
    return json[0];
  } catch {
    return null;
  }
}

/** 解析劍橋 HTML → {phonetic, definition, example_en, example_zh} */
function parseCambridge(html) {
  const $ = cheerio.load(html);

  // ── 音標（優先 US） ─────────────────────────────────────────
  let phonetic = '';
  const usCandidates = [
    '.us.dpron-i .ipa',
    '.pron-info.pron-us .ipa',
    '[data-wl-lang="us"] .ipa',
    '.us .ipa',
  ];
  for (const sel of usCandidates) {
    const t = $(sel).first().text().trim();
    if (t) { phonetic = `/${t}/`; break; }
  }
  if (!phonetic) {
    const ukCandidates = ['.uk.dpron-i .ipa', '.pron-info.pron-uk .ipa', '.uk .ipa'];
    for (const sel of ukCandidates) {
      const t = $(sel).first().text().trim();
      if (t) { phonetic = `/${t}/`; break; }
    }
  }

  // ── 中文解釋（排除例句內的 .trans，只取定義本身） ──────────────
  let definition = '';
  const defContainers = [
    '.entry-body__el .def-body',
    '.entry-body__el .ddef_b',
  ];
  outer: for (const sel of defContainers) {
    $(sel).each(function () {
      $(this).find('.trans, .dtrans').each(function () {
        // 跳過隸屬於例句塊的翻譯
        if ($(this).parents('.examp, .dexamp, .eg').length > 0) return;
        const t = $(this).text().trim();
        if (t && t.length >= 2) { definition = t; return false; }
      });
      if (definition) return false;
    });
    if (definition) break outer;
  }

  // ── 英文例句 + 中文翻譯 ─────────────────────────────────────
  let example_en = '', example_zh = '';
  const firstEntry = $('.entry-body__el').first();
  const exampSel   = ['.examp', '.dexamp'];
  for (const sel of exampSel) {
    const ex = firstEntry.find(sel).first();
    if (!ex.length) continue;
    const en = ex.find('.eg, .deg').first().text().trim();
    const zh = ex.find('.trans, .dtrans').first().text().trim();
    if (en) { example_en = en; example_zh = zh; break; }
  }

  return { phonetic, definition, example_en, example_zh };
}

/** 解析 Free Dictionary API JSON → 音標 */
function parseFreeDictPhonetic(json) {
  if (!json?.phonetics?.length) return '';
  // 優先找美式
  const us = json.phonetics.find(p =>
    (p.audio || '').includes('-us') || (p.audio || '').includes('en-us')
  );
  const phon = us?.text || json.phonetics.find(p => p.text)?.text || json.phonetic || '';
  return phon ? `/${phon.replace(/^\/|\/$/g, '')}/` : '';
}

// ── 主爬蟲 ────────────────────────────────────────────────────
async function scrapeAll(words, cache) {
  const total   = words.length;
  const todo    = words.filter(w => !cache[w.word]?.done);
  let fetched = 0, failed = 0;

  console.log(`[爬取] 待爬 ${todo.length} 字，已快取 ${total - todo.length} 字\n`);
  if (todo.length === 0) { console.log('全部已快取，跳過爬取\n'); return; }

  for (let i = 0; i < todo.length; i++) {
    const { word, pos } = todo[i];

    // 大型暫停（避免被封）
    if (i > 0 && i % PAUSE_EVERY === 0) {
      process.stdout.write(`\n  [暫停 ${PAUSE_MS / 1000}s 避免限速...]\n`);
      await sleep(PAUSE_MS);
    }

    process.stdout.write(`\r  [${i + 1}/${todo.length}] ${word.padEnd(22)}`);

    let data = { phonetic: '', definition: '', example_en: '', example_zh: '' };

    try {
      const html = await fetchCambridge(word);
      data = parseCambridge(html);
    } catch (err) {
      process.stdout.write(`✗ Cambridge(${err.message.slice(0, 20)})`);
    }

    // 備援：Free Dictionary API 補音標
    if (!data.phonetic) {
      try {
        const fd = await fetchFreeDict(word);
        if (fd) data.phonetic = parseFreeDictPhonetic(fd);
      } catch {}
    }

    const ok = !!(data.phonetic || data.definition);
    cache[word] = { pos, ...data, done: ok };

    if (ok) {
      fetched++;
      process.stdout.write(`✓ ${(data.phonetic || '—').padEnd(20)} ${(data.definition || '—').slice(0, 18)}`);
    } else {
      failed++;
      process.stdout.write(`✗ 資料為空`);
    }

    // 每 10 字存一次快取
    if ((i + 1) % 10 === 0) {
      fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
    }

    await sleep(DELAY_MIN + Math.random() * DELAY_RAND);
  }

  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
  console.log(`\n\n[爬取完成] ✓ ${fetched}  ✗ ${failed}\n`);
}

// ── Supabase 匯入 ──────────────────────────────────────────────
async function importToSupabase(words, cache) {
  console.log('[匯入] 準備資料列...');

  const rows = words.map(({ word, pos, rank }) => {
    const d = cache[word] || {};
    return {
      word,
      pos:            d.pos || pos,
      definition:     d.definition || '',
      phonetic:       d.phonetic   || '',
      example_en:     d.example_en || '',
      example_zh:     d.example_zh || '',
      tags:           ['cap_2000'],
      level:          getLevel(rank),
      frequency_rank: rank,
    };
  });

  const withDef  = rows.filter(r => r.definition).length;
  const withPhon = rows.filter(r => r.phonetic).length;
  console.log(`  總計 ${rows.length} 筆，有解釋 ${withDef}，有音標 ${withPhon}\n`);

  console.log('[匯入] 清空舊 words 資料...');
  const { error: delErr } = await supabase.from('words').delete().gte('id', 0);
  if (delErr) throw new Error('清空失敗：' + delErr.message);
  console.log('  ✓ 已清空\n');

  console.log(`[匯入] 寫入（每批 ${BATCH_SIZE} 筆）...`);
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('words').insert(batch);
    if (error) {
      console.error(`  ✗ 批次 ${i}–${i + batch.length - 1}：${error.message}`);
    } else {
      inserted += batch.length;
    }
    process.stdout.write(`\r  進度：${Math.min(i + BATCH_SIZE, rows.length)} / ${rows.length}`);
  }

  const { count } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true });

  console.log(`\n\n✅ 完成！Supabase 現有 ${count} 筆單字`);
}

// ── 入口 ──────────────────────────────────────────────────────
async function main() {
  const importOnly = process.argv.includes('--import-only');
  const reset      = process.argv.includes('--reset');

  console.log('\n═══════════════════════════════════════════');
  console.log('  Vocatopia 2000 字資料庫建置');
  console.log('═══════════════════════════════════════════\n');

  // 清空快取
  if (reset) {
    fs.writeFileSync(CACHE_FILE, '{}', 'utf-8');
    console.log('[reset] 快取已清空\n');
  }

  // 讀取字表
  const words = parseWordList();
  console.log(`[字表] 解析到 ${words.length} 個單字\n`);

  // 讀取快取
  let cache = {};
  if (fs.existsSync(CACHE_FILE)) {
    try {
      cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
      const done = Object.values(cache).filter(v => v.done).length;
      console.log(`[快取] ${done} / ${Object.keys(cache).length} 筆已完成\n`);
    } catch {
      console.warn('[快取] 讀取失敗，從頭開始\n');
    }
  }

  // 爬取
  if (!importOnly) {
    await scrapeAll(words, cache);
  } else {
    console.log('[模式] 只匯入，跳過爬取\n');
  }

  // 匯入
  await importToSupabase(words, cache);
}

main().catch(err => {
  console.error('\n❌ 失敗：', err.message);
  process.exit(1);
});
