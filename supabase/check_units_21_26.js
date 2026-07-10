/**
 * Unit 21-26 步驟1-2：比對書上單字清單與資料庫，找出已有/缺少的字。
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const UNITS = {
  21: {
    name: '法律 (Law)',
    basic: `attack power right`.split(/\s+/),
    adv: `bomb contract crime crisis democracy democratic document duty effective elect election equal form freedom government gun image law lawful legal organization organize policy pollute pollution population powerful prison protect protection respondent shoot shot society system trial vote war weapon`.split(/\s+/),
  },
  22: {
    name: '動物、昆蟲 (Animals & Insects)',
    basic: `animal ant bat bear bee bird bite bug butterfly cat chicken cow dog dragon duck elephant fish fox frog goat goose hen hippo horse insect kangaroo koala lion monkey mouse ox pet pig puppy rabbit rat shark snake spider tail tiger turkey turtle whale zebra`.split(/\s+/),
    adv: `bark cage cockroach crab deer dinosaur dolphin donkey eagle kitten lamb monster mosquito nest panda parrot pigeon sheep shrimp snail swallow swan wild wing wolf worm`.split(/\s+/),
  },
  23: {
    name: '地理、天氣、自然界 (Geography, Weather & Nature)',
    basic: `air bank beach blow clear cloudy cold cool dry earth flower grass hill hot island lake moon mountain mud nature plant pond pool rain rainbow rainy river rock rose sea seed shine sky snow snowman snowy spring star sun sunny tree typhoon warm weather wet wind windy`.split(/\s+/),
    adv: `area branch climate cloud coast countryside creature current degree desert dirt environment fog foggy forest freezing humid leaf lightning natural ocean plain planet root sand scene scenery scenic shore shower stone storm stormy stream temperature thunder universe valley village waterfall wood wooden woods`.split(/\s+/),
  },
  24: {
    name: '冠詞、代名詞、限定詞 (Articles, Pronouns & Determiners)',
    basic: `a/an all another any anybody anyone anything both each every everybody everyone everything many most nobody none nothing other part some somebody someone something such that the these this those`.split(/\s+/),
    adv: [],
  },
  25: {
    name: '疑問詞、感嘆詞 (Wh-words & Interjections)',
    basic: `good-bye hello hey hi how what when where whether which who whose why`.split(/\s+/),
    adv: `whatever while whom`.split(/\s+/),
  },
  26: {
    name: '連接詞 (Conjunctions)',
    basic: `and as because but however if or since than that`.split(/\s+/),
    adv: `neither...nor though`.split(/\s+/),
  },
};

async function main() {
  for (const [num, unit] of Object.entries(UNITS)) {
    console.log(`\n========== Unit ${num}: ${unit.name} ==========`);
    const all = [...unit.basic.map(w => ({ word: w, tier: '基礎' })), ...unit.adv.map(w => ({ word: w, tier: '進階' }))];
    console.log(`書上共 ${all.length} 字（基礎 ${unit.basic.length} + 進階 ${unit.adv.length}）`);

    const matched = [];
    const missing = [];
    for (const { word, tier } of all) {
      const { data, error } = await supabase.from('words').select('id, word, tags').ilike('word', word).limit(1);
      if (error) { console.error('查詢失敗:', word, error.message); continue; }
      if (data && data.length) matched.push({ ...data[0], tier });
      else missing.push({ word, tier });
    }
    console.log(`資料庫已有 ${matched.length} 字，缺少 ${missing.length} 字`);
    if (missing.length) {
      console.log('缺少的字：');
      console.log(missing.map(m => `  - ${m.word} (${m.tier})`).join('\n'));
    }
    const needPromote = matched.filter(m => (m.tags || []).includes('user_lookup') || (m.tags || []).includes('user_custom'));
    if (needPromote.length) {
      console.log(`需要升格的字（含 user_lookup/user_custom）：${needPromote.length}`);
      console.log(needPromote.map(m => `  - ${m.word}: ${JSON.stringify(m.tags)}`).join('\n'));
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
