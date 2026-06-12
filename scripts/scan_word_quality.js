/** 字庫品質掃描：無詞性 / 假音標 / 佔位定義 / 假例句 */
(async () => {
  const all = [];
  for (let off = 0; off < 4000; off += 500) {
    const res = await fetch('http://localhost:3000/api/words?limit=500&offset=' + off);
    const batch = await res.json();
    if (!batch.length) break;
    all.push(...batch);
    if (batch.length < 500) break;
  }
  const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const problems = [];
  for (const w of all) {
    const issues = [];
    const pos = (w.pos || '').trim();
    if (!pos || pos === '—' || pos === '-') issues.push('無詞性');
    if (/[A-Z]/.test(w.phonetic || '')) issues.push('假音標:' + w.phonetic);
    if (/definition: a proper complete definition/i.test(w.definition || '')) issues.push('佔位定義');
    if (new RegExp('^' + escapeRe(w.word) + '\\s*[:：]', 'i').test((w.example_en || '').trim())) issues.push('假例句:' + w.example_en);
    if (issues.length) problems.push({ id: w.id, word: w.word, pos, def_zh: w.definition_zh, issues: issues.join(' | ') });
  }
  console.log('總字數:', all.length, '| 問題字數:', problems.length);
  problems.forEach(p => console.log(p.id, p.word, '[' + p.pos + ']', p.def_zh, '→', p.issues));
})();
