require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const s = require('../server/db/supabase');

(async () => {
  const check = ['be','been','much','person','such','somebody','everybody','everyone','excited','exciting','boring','socks','sports','stairs','forward','cross','crowd','cloudy','foggy','sneaky','stormy','swimsuit','workbook','bookstore','drugstore','overpass','underpass','railway','raincoat','postcard','recorder'];
  for (const w of check) {
    const { data } = await s.from('words').select('word,definition').ilike('word', w);
    console.log(w.padEnd(14), data && data.length ? 'FOUND: ' + (data[0].definition || '').slice(0, 35) : 'NOT IN DB');
  }
})();
