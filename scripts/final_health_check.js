/** 字庫最終健檢：彙整本日所有偵測規則 */
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
  const hasCJK = s => /[一-鿿]/.test(s || '');
  const FUNC_WORDS = /\b(a|an|the|to|of|or|in|on|for|with|that|who|is|are|was|you|your|it|its|something|someone|when|by|at|from|not|and)\b/;

  const counters = { 編碼損壞: 0, 佔位符: 0, 垃圾定義: 0, 假音標: 0, 無詞性: 0, 假例句: 0, 缺音標: 0, 缺中文定義: 0, 缺英文定義: 0, 缺例句: 0 };
  const dup = {};
  const flagged = [];
  for (const w of all) {
    const issues = [];
    const def = (w.definition || '').trim();
    const pos = (w.pos || '').trim();
    if (/�/.test(JSON.stringify(w)) || /\?/.test(w.phonetic || '') || (w.definition_zh && !hasCJK(w.definition_zh))) issues.push('編碼損壞');
    if (/\(restored\)/i.test(def) || /已恢復/.test(w.definition_zh || '')) issues.push('佔位符');
    if (new RegExp('^' + escapeRe(w.word) + '\\s*[:：]\\s*a word or term', 'i').test(def) ||
        /definition: a proper complete definition/i.test(def) ||
        (def.split(/\s+/).length >= 5 && !/[.,:;()]/.test(def) && def === def.toLowerCase() && !FUNC_WORDS.test(def))) issues.push('垃圾定義');
    if (/[A-Z]/.test(w.phonetic || '')) issues.push('假音標');
    if (!pos || pos === '—' || pos === '-' || pos === 'null') issues.push('無詞性');
    if (new RegExp('^' + escapeRe(w.word) + '\\s*[:：]', 'i').test((w.example_en || '').trim())) issues.push('假例句');
    if (!(w.phonetic || '').trim()) issues.push('缺音標');
    if (!(w.definition_zh || '').trim()) issues.push('缺中文定義');
    if (!def) issues.push('缺英文定義');
    if (!(w.example_en || '').trim()) issues.push('缺例句');
    issues.forEach(i => counters[i]++);
    if (issues.length) flagged.push(w.word + '(' + issues.join(',') + ')');
    const key = (w.word || '').toLowerCase().trim();
    (dup[key] = dup[key] || []).push(w.id);
  }
  const dups = Object.entries(dup).filter(([, ids]) => ids.length > 1);
  console.log('總字數:', all.length, '| 重複:', dups.length);
  console.log(JSON.stringify(counters));
  if (flagged.length) { console.log('問題列:', flagged.length); console.log(flagged.slice(0, 40).join(', ')); }
  else console.log('✅ 全部通過');
})();
