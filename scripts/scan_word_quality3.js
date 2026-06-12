/** 深度分析：垃圾資料分類 × 官方字表交叉 × pdf 資料源覆蓋率 */
const fs = require('fs');
const path = require('path');
(async () => {
  const ROOT = path.join(__dirname, '..');
  const official = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'target_2000_words.json'), 'utf8')).words.map(w => w.toLowerCase().trim()));
  const pdf = JSON.parse(fs.readFileSync(path.join(ROOT, 'pdf_words_with_def.json'), 'utf8'));
  const pdfKeys = new Set(Object.keys(pdf).map(w => w.toLowerCase().trim()));

  const all = [];
  for (let off = 0; off < 4000; off += 500) {
    const res = await fetch('http://localhost:3000/api/words?limit=500&offset=' + off);
    const batch = await res.json();
    if (!batch.length) break;
    all.push(...batch);
    if (batch.length < 500) break;
  }
  const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const hasCJK = s => /[一-鿿]/.test(s || '');

  const rows = [];
  for (const w of all) {
    const word = (w.word || '').toLowerCase().trim();
    const def = (w.definition || '').trim();
    const pos = (w.pos || '').trim();
    const junkDef =
      new RegExp('^' + escapeRe(w.word) + '\\s*[:：]\\s*a word or term', 'i').test(def) ||
      /definition: a proper complete definition/i.test(def) ||
      (def.split(/\s+/).length >= 4 && !/[.,:;]/.test(def) && def === def.toLowerCase()); // 純單字列表
    const fakePhon = /[A-Z]/.test(w.phonetic || '');
    const noPos = !pos || pos === '—' || pos === '-';
    const fakeEx = new RegExp('^' + escapeRe(w.word) + '\\s*[:：]', 'i').test((w.example_en || '').trim());
    const badZh = !hasCJK(w.definition_zh || '');
    if (junkDef || fakePhon || noPos || fakeEx || badZh) {
      rows.push({ id: w.id, word: w.word, junkDef, fakePhon, noPos, fakeEx, badZh,
        official: official.has(word), pdf: pdfKeys.has(word) });
    }
  }
  const c = k => rows.filter(r => r[k]).length;
  console.log('問題列總數:', rows.length, '/', all.length);
  console.log('垃圾定義:', c('junkDef'), '| 假音標:', c('fakePhon'), '| 無詞性:', c('noPos'), '| 假例句:', c('fakeEx'), '| 中文定義異常:', c('badZh'));
  console.log('在官方字表:', rows.filter(r => r.official).length, '| 在pdf資料源:', rows.filter(r => r.pdf).length);
  console.log();
  // 關鍵分組
  const fixableLight = rows.filter(r => !r.junkDef && !r.fakeEx);          // 只需修 pos/音標
  const needContent  = rows.filter(r => r.junkDef || r.fakeEx);            // 需要重寫內容
  console.log('A. 只缺詞性/音標（定義例句完好）:', fixableLight.length);
  console.log('B. 內容是垃圾需重寫:', needContent.length);
  console.log('   B 且在官方字表（值得救）:', needContent.filter(r => r.official).length);
  console.log('   B 且不在官方字表（候選刪除）:', needContent.filter(r => !r.official).length);
  console.log();
  console.log('=== B 不在官方字表（前 60，候選刪除）===');
  console.log(needContent.filter(r => !r.official).slice(0, 60).map(r => r.word).join(', '));
  console.log();
  console.log('=== B 在官方字表（需重寫，前 60）===');
  console.log(needContent.filter(r => r.official).slice(0, 60).map(r => r.word).join(', '));
  fs.writeFileSync(path.join(ROOT, 'scripts', 'quality_report.json'), JSON.stringify(rows, null, 1));
  console.log();
  console.log('完整報告: scripts/quality_report.json');
})();
