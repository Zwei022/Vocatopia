/** 問題類型統計 + 無詞性字的定義樣本 */
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
  let noPos = [], fakePhon = [], phDef = [], fakeEx = [];
  for (const w of all) {
    const pos = (w.pos || '').trim();
    if (!pos || pos === '—' || pos === '-') noPos.push(w);
    if (/[A-Z]/.test(w.phonetic || '')) fakePhon.push(w);
    if (/definition: a proper complete definition/i.test(w.definition || '')) phDef.push(w);
    if (new RegExp('^' + escapeRe(w.word) + '\\s*[:：]', 'i').test((w.example_en || '').trim())) fakeEx.push(w);
  }
  console.log('無詞性:', noPos.length, '| 假音標:', fakePhon.length, '| 佔位定義:', phDef.length, '| 假例句:', fakeEx.length);
  console.log();
  console.log('=== 假音標清單 ===');
  fakePhon.forEach(w => console.log(w.id, w.word, w.phonetic, '| pos:', w.pos, '| def:', (w.definition || '').slice(0, 50)));
  console.log();
  console.log('=== 假例句清單 ===');
  fakeEx.forEach(w => console.log(w.id, w.word, '| ex:', (w.example_en || '').slice(0, 60)));
  console.log();
  console.log('=== 無詞性字的英文定義樣本（前 20）===');
  noPos.slice(0, 20).forEach(w => console.log(w.id, w.word, '| def:', (w.definition || '').slice(0, 60)));
  console.log();
  const ids = noPos.map(w => w.id).sort((a, b) => a - b);
  console.log('無詞性 id 範圍:', ids[0], '~', ids[ids.length - 1]);
})();
