/**
 * 字庫資料機械式修復管線
 * 來源優先序：
 *   pos      ← words_cache → pdf_words_with_def 標記 → 英文定義推斷
 *   phonetic ← words_cache → CMUdict 轉 IPA
 *   example  ← words_cache（6/4 原創例句成品）
 *   def(en)  ← backups/cap2000（與庫內既有風格一致）
 * 修不到的列輸出 scripts/needs_author.json 待人工撰寫
 * 用法：node -r dotenv/config scripts/fix_word_data_pipeline.js [--apply]
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const APPLY = process.argv.includes('--apply');

// ── CMUdict ARPABET → IPA ────────────────────────────────────
const A2I = { AA:'ɑː', AE:'æ', AH:'ʌ', AO:'ɔː', AW:'aʊ', AY:'aɪ', B:'b', CH:'tʃ', D:'d', DH:'ð',
  EH:'e', ER:'ɝː', EY:'eɪ', F:'f', G:'ɡ', HH:'h', IH:'ɪ', IY:'iː', JH:'dʒ', K:'k', L:'l', M:'m',
  N:'n', NG:'ŋ', OW:'oʊ', OY:'ɔɪ', P:'p', R:'r', S:'s', SH:'ʃ', T:'t', TH:'θ', UH:'ʊ', UW:'uː',
  V:'v', W:'w', Y:'j', Z:'z', ZH:'ʒ' };
const A2I_UNSTRESSED = { AH: 'ə', ER: 'ɚ' };

function loadCmu() {
  const map = new Map();
  const lines = fs.readFileSync(path.join(__dirname, 'cmudict.dict'), 'utf8').split('\n');
  for (const line of lines) {
    const sp = line.indexOf(' ');
    if (sp < 1) continue;
    let w = line.slice(0, sp);
    if (w.includes('(')) continue; // 只取第一發音
    map.set(w.toLowerCase(), line.slice(sp + 1).trim().split(/\s+/));
  }
  return map;
}

function arpaToIpa(phones) {
  let out = '', stressMark = '';
  for (const p of phones) {
    const m = p.match(/^([A-Z]+)([012])?$/);
    if (!m) continue;
    const [, base, stress] = m;
    let ipa = (stress === '0' && A2I_UNSTRESSED[base]) || A2I[base];
    if (!ipa) continue;
    if (stress === '1') out += 'ˈ';
    else if (stress === '2') out += 'ˌ';
    out += ipa;
  }
  return out ? `/${out}/` : null;
}

// ── 詞性推斷（由英文定義）────────────────────────────────────
function inferPos(def) {
  const d = (def || '').trim().toLowerCase();
  if (!d) return null;
  if (/^to\s/.test(d)) return '動詞';
  if (/^(in a .+ way|in an? .+ manner|more than)/.test(d)) return '副詞';
  if (/^(a|an|the|one|someone|somebody|something|people|us spelling|uk spelling|a person|a group|a place|a piece|money|food|water|thick|short for)\b/.test(d)) {
    if (/^(thick|short for)/.test(d)) return null;
    return '名詞';
  }
  if (/^(having|describing|able to|not |very |extremely |full of|covered|easy |difficult |pleasant|popular|feeling|relating to|of or relating)/.test(d)) {
    if (/^of or relating/.test(d)) return null;
    return '形容詞';
  }
  return null;
}

const PDF_POS = { n: '名詞', v: '動詞', adj: '形容詞', adv: '副詞', '片': '片語', prep: '介系詞', conj: '連接詞', pron: '代名詞', int: '感嘆詞', aux: '助動詞' };

(async () => {
  const supabase = require(path.join(ROOT, 'server/db/supabase'));
  const cacheRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'supabase/words_cache.json'), 'utf8'));
  const cache = new Map(Object.entries(cacheRaw).map(([k, v]) => [k.toLowerCase().trim(), v]));
  const backup = new Map(JSON.parse(fs.readFileSync(path.join(ROOT, 'backups/cap2000_2026-06-01.json'), 'utf8'))
    .map(b => [b.word.toLowerCase().trim(), b]));
  const pdfRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'pdf_words_with_def.json'), 'utf8'));
  const pdf = new Map(Object.entries(pdfRaw).map(([k, v]) => [k.toLowerCase().trim(), v]));
  const cmu = loadCmu();

  const all = [];
  for (let off = 0; off < 4000; off += 500) {
    const res = await fetch('http://localhost:3000/api/words?limit=500&offset=' + off);
    const batch = await res.json();
    if (!batch.length) break;
    all.push(...batch);
    if (batch.length < 500) break;
  }

  const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const FUNC_WORDS = /\b(a|an|the|to|of|or|in|on|for|with|that|who|is|are|was|you|your|it|its|something|someone|when|by|at|from|not|and)\b/;

  const patches = [];   // { id, word, patch, sources }
  const needsAuthor = [];
  let stats = { pos: 0, phon: 0, ex: 0, def: 0 };

  for (const w of all) {
    const key = (w.word || '').toLowerCase().trim();
    const c = cache.get(key);
    const patch = {};
    const missing = [];

    // 1) 詞性
    const pos = (w.pos || '').trim();
    const badPos = !pos || pos === '—' || pos === '-' || pos === 'null';
    if (badPos) {
      let newPos = c?.pos || null;
      if (!newPos) {
        const pdfDef = pdf.get(key);
        const m = pdfDef && pdfDef.match(/\(([a-z片介連代感助]+)\)/i);
        if (m && PDF_POS[m[1].toLowerCase()]) newPos = PDF_POS[m[1].toLowerCase()];
      }
      if (!newPos) newPos = inferPos(w.definition);
      if (newPos) { patch.pos = newPos; stats.pos++; }
      else missing.push('pos');
    }

    // 2) 音標（假音標含大寫，或缺）
    const fakePhon = /[A-Z]/.test(w.phonetic || '') || !(w.phonetic || '').trim();
    if (fakePhon) {
      let newPhon = c?.phonetic || null;
      if (newPhon && !newPhon.startsWith('/')) newPhon = `/${newPhon}/`;
      if (!newPhon) {
        const phones = cmu.get(key);
        if (phones) newPhon = arpaToIpa(phones);
      }
      if (newPhon) { patch.phonetic = newPhon; stats.phon++; }
      else missing.push('phonetic');
    }

    // 3) 例句（"word: xxx" 假例句）
    const fakeEx = new RegExp('^' + escapeRe(w.word) + '\\s*[:：]', 'i').test((w.example_en || '').trim());
    if (fakeEx) {
      if (c?.example_en && c?.example_zh) {
        patch.example_en = c.example_en;
        patch.example_zh = c.example_zh;
        stats.ex++;
      } else missing.push('example');
    }

    // 4) 英文定義（"word: a word or term" / 純單字列表 / 佔位句）
    const def = (w.definition || '').trim();
    const junkDef =
      new RegExp('^' + escapeRe(w.word) + '\\s*[:：]\\s*a word or term', 'i').test(def) ||
      /definition: a proper complete definition/i.test(def) ||
      (def.split(/\s+/).length >= 5 && !/[.,:;()]/.test(def) && def === def.toLowerCase() && !FUNC_WORDS.test(def));
    if (junkDef) {
      const b = backup.get(key);
      if (b?.definition) { patch.definition = b.definition; stats.def++; }
      else missing.push('definition');
    }

    if (Object.keys(patch).length) patches.push({ id: w.id, word: w.word, patch });
    if (missing.length) needsAuthor.push({ id: w.id, word: w.word, missing: missing.join('|'), definition_zh: w.definition_zh });
  }

  console.log('可機械修復列數:', patches.length, '| 修復欄位統計:', JSON.stringify(stats));
  console.log('仍需人工撰寫:', needsAuthor.length);
  fs.writeFileSync(path.join(__dirname, 'needs_author.json'), JSON.stringify(needsAuthor, null, 1));

  if (!APPLY) { console.log('（試跑模式，加 --apply 寫入）'); return; }

  let done = 0;
  for (const p of patches) {
    const { error } = await supabase.from('words').update(p.patch).eq('id', p.id);
    if (error) { console.error('FAIL', p.word, error.message); process.exit(1); }
    if (++done % 100 === 0) console.log('已寫入', done, '/', patches.length);
  }
  console.log('完成寫入:', done, '列');
})();
