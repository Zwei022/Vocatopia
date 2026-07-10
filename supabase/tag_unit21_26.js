/**
 * Unit 21-26 主題式分類作業：比對資料庫 → 標記 unitN → 修正 user_lookup/user_custom 升格 → 回報缺字清單
 * 這是「比對+標記+升格」腳本，缺字生成寫入交給 insert_unit21_26_missing.js（依本腳本印出的缺字清單編寫)
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
    basic: `all another any anybody anyone anything both each every everybody everyone everything many most nobody none nothing other part some somebody someone something such that the these this those`.split(/\s+/),
    adv: [],
    special: ['a/an'], // 特殊：a/an 用 a 和 an 分開比對
  },
  25: {
    name: '疑問詞、感嘆詞 (Wh-words & Interjections)',
    basic: `good-bye hello hey hi how what when where whether which who whose why`.split(/\s+/),
    adv: `whatever while whom`.split(/\s+/),
  },
  26: {
    name: '連接詞 (Conjunctions)',
    basic: `and as because but however if or since than that`.split(/\s+/),
    adv: `though`.split(/\s+/),
    special: ['neither...nor'], // 特殊片語連接詞，需個別比對 neither / nor
  },
};

async function findWord(word) {
  const { data, error } = await supabase.from('words').select('id, word, tags').ilike('word', word).limit(1);
  if (error) { console.error('查詢失敗:', word, error.message); return null; }
  return data && data.length ? data[0] : null;
}

async function main() {
  const report = {};
  for (const [unitNum, spec] of Object.entries(UNITS)) {
    const unitTag = `unit${unitNum}`;
    const wordList = [
      ...spec.basic.map(w => ({ word: w, tier: '基礎' })),
      ...spec.adv.map(w => ({ word: w, tier: '進階' })),
      ...(spec.special || []).map(w => ({ word: w, tier: '基礎' })),
    ];
    console.log(`\n===== Unit ${unitNum} ${spec.name} =====`);
    console.log(`書上單字總數: ${wordList.length}（基礎 ${spec.basic.length} + 進階 ${spec.adv.length}）`);

    const matched = [];
    const missing = [];

    for (const { word, tier } of wordList) {
      let row = await findWord(word);
      if (!row && word === 'a/an') {
        row = await findWord('a');
        if (!row) row = await findWord('an');
      }
      if (!row && word === 'neither...nor') {
        row = await findWord('neither');
        if (!row) row = await findWord('nor');
      }
      if (row) matched.push({ ...row, tier, sourceWord: word });
      else missing.push({ word, tier });
    }

    console.log(`資料庫已有 ${matched.length} 字，缺少 ${missing.length} 字`);
    if (missing.length) {
      console.log('缺少的字（待生成寫入）:');
      console.log(missing.map(m => `  - ${m.word} (${m.tier})`).join('\n'));
    }

    // 標記 unitN tag，並修正 user_lookup/user_custom 升格
    let tagged = 0, promoted = 0;
    for (const m of matched) {
      let tags = [...(m.tags || [])];
      const hadUnitTag = tags.includes(unitTag);
      let needsPromote = tags.includes('user_lookup') || tags.includes('user_custom');

      if (needsPromote) {
        tags = tags.filter(t => t !== 'user_lookup' && t !== 'user_custom');
        tags.push('cap_2000');
      }
      if (!hadUnitTag) tags.push(unitTag);
      tags = Array.from(new Set(tags));

      const changed = JSON.stringify(tags.sort()) !== JSON.stringify((m.tags || []).slice().sort());
      if (!changed) continue;

      const { error } = await supabase.from('words').update({ tags }).eq('id', m.id);
      if (error) { console.error('更新失敗:', m.word, error.message); continue; }
      if (!hadUnitTag) tagged++;
      if (needsPromote) promoted++;
    }

    console.log(`新標記 unitN 標籤: ${tagged} 字；升格修正(user_lookup/user_custom → cap_2000): ${promoted} 字`);

    report[unitNum] = {
      name: spec.name,
      total: wordList.length,
      existing: matched.length,
      missing,
      tagged,
      promoted,
    };
  }

  console.log('\n\n===== 摘要 =====');
  console.log(JSON.stringify(report, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
