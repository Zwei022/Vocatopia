require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const s = require('../server/db/supabase');

(async () => {
  const raw = fs.readFileSync(path.join(__dirname, '../official_2000_full.txt'), 'utf-8').split('\n');
  const official = new Set();

  for (const line of raw) {
    const w = line.trim().toLowerCase();
    if (!w) continue;
    if (w.includes(' ')) continue;       // phrases
    if (w.includes('.')) continue;       // a.m., Mr.
    if (w.includes("'")) continue;       // ma'am, o'clock
    if (/^[A-Z]/.test(line.trim())) continue;  // proper nouns
    official.add(w);
  }

  // All DB words with pagination
  const dbWords = new Set();
  let from = 0;
  while (true) {
    const { data } = await s.from('words').select('word').range(from, from + 999);
    if (!data || data.length === 0) break;
    data.forEach(w => dbWords.add(w.word.toLowerCase()));
    if (data.length < 1000) break;
    from += 1000;
  }

  const missing = [...official].filter(w => !dbWords.has(w)).sort();
  const extra   = [...dbWords].filter(w => !official.has(w)).sort();

  console.log('官方清單（單字）:', official.size);
  console.log('DB 字數:', dbWords.size);
  console.log('\n缺少（官方有 DB 無）:', missing.length);
  missing.forEach(w => console.log(' ', w));
  console.log('\nDB 多餘（DB 有官方無）:', extra.length);
  if (extra.length <= 30) extra.forEach(w => console.log(' ', w));
  else console.log(' 前30:', extra.slice(0, 30).join(', '));
})().catch(e => { console.error(e.message); process.exit(1); });
