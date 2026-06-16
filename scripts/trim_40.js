require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const s = require('../server/db/supabase');

const REMOVE = ['bye','donut','hi','hey','bike','chopsticks','math','be','been','mailman','salesman','nice-looking','hard-working','china','secondary','saucer','sneaky','overpass','underpass','valentine','wok','tub','softball','backward','koala','recorder'];

(async () => {
  let deleted = 0;
  for (const word of REMOVE) {
    const { error } = await s.from('words').delete().ilike('word', word);
    if (!error) { deleted++; console.log(`✓ ${word}`); }
    else console.log(`✗ ${word}: ${error.message}`);
  }
  const { count } = await s.from('words').select('*', { count: 'exact', head: true });
  console.log(`\n✅ 刪除 ${deleted} 字，DB 現在：${count} 字`);
})();
