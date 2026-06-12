/** 檢查 words_cache.json 與 backup 對問題字的覆蓋率 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
(async () => {
  const report = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/quality_report.json'), 'utf8'));
  const cache = JSON.parse(fs.readFileSync(path.join(ROOT, 'supabase/words_cache.json'), 'utf8'));
  const backup = JSON.parse(fs.readFileSync(path.join(ROOT, 'backups/cap2000_2026-06-01.json'), 'utf8'));
  const cacheKeys = new Map(Object.entries(cache).map(([k, v]) => [k.toLowerCase().trim(), v]));
  const backupMap = new Map(backup.map(b => [b.word.toLowerCase().trim(), b]));

  let inCache = 0, cacheFull = 0, needEnDef = 0, enDefFromBackup = 0, uncovered = [];
  for (const r of report) {
    const key = r.word.toLowerCase().trim();
    const c = cacheKeys.get(key);
    if (c) {
      inCache++;
      if (c.pos && c.phonetic && c.example_en && c.example_zh) cacheFull++;
    }
    if (r.junkDef) {
      needEnDef++;
      if (backupMap.get(key)?.definition) enDefFromBackup++;
    }
    if (!c) uncovered.push(r.word + (r.junkDef ? '(垃圾定義)' : '') + (r.noPos ? '(無詞性)' : ''));
  }
  console.log('問題字總數:', report.length);
  console.log('words_cache 覆蓋:', inCache, '（欄位齊全:', cacheFull + '）');
  console.log('垃圾英文定義需重寫:', needEnDef, '（backup 可還原:', enDefFromBackup + '）');
  console.log('cache 完全未覆蓋:', uncovered.length);
  console.log();
  console.log(uncovered.join(', '));
})();
