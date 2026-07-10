require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const UNIT27_BASIC = `about above across after along around at before behind below beside between by down during except for from in in-back-of in-front-of inside into like near next-to of off on out out-of outside over since than to under until up with without`.split(/\s+/);
const UNIT27_ADV = `against among besides beyond concerning including through throughout till toward upon within`.split(/\s+/);

const UNIT28_BASIC = `am are be been can could did do does done had has have is may might must shall should was were will would`.split(/\s+/);

const UNIT29_BASIC = `able best better common convenient dangerous dark dear different else enough foreign free helpful loud lucky magic modern only other possible public ready real same sorry sure wonderful`.split(/\s+/);
const UNIT29_ADV = `accidental actual additional advanced advantageous advisory alike alive alone ancient artistic asleep available aware brief casual certain classic classical comparative concerned continual creative criminal cultural desirous double doubtful dramatic educational elective electrical electronic empty encouraging entire eventual fair fancy fantastic following formal former general grand historic horrible imaginary impossible inclusive indicative individual industrial informative insistent instant instrumental lacking latest latter likely main major marvelous meaningful minor missing musical necessary negative numerous objective operational partial particular peaceful periodical personal positive practical precious primary private productive professional progressive promising protective rapid reasonable recent respective royal satisfactory scientific secondary selective separate silent similar skilled soft speedy spiritual sticky stressful sudden suggestive super symbolic tearful universal useless usual valuable whole willing worthy`.split(/\s+/);

const UNITS = {
  unit27: { name: '介系詞 (Prepositions)', basic: UNIT27_BASIC, adv: UNIT27_ADV },
  unit28: { name: 'Be動詞、助動詞 (Be & Auxiliaries)', basic: UNIT28_BASIC, adv: [] },
  unit29: { name: '其他形容詞 (Other Adjectives)', basic: UNIT29_BASIC, adv: UNIT29_ADV },
};

async function main() {
  for (const [unitKey, info] of Object.entries(UNITS)) {
    const allWords = [
      ...info.basic.map(w => ({ word: w.replace(/-/g, ' '), tier: '基礎' })),
      ...info.adv.map(w => ({ word: w.replace(/-/g, ' '), tier: '進階' })),
    ];
    console.log(`\n=== ${unitKey} ${info.name}：書上共 ${allWords.length} 字（基礎 ${info.basic.length} + 進階 ${info.adv.length}）===`);

    const matched = [];
    const missing = [];
    for (const { word, tier } of allWords) {
      const { data, error } = await supabase.from('words').select('id, word, tags').ilike('word', word).limit(1);
      if (error) { console.error('查詢失敗:', word, error.message); continue; }
      if (data && data.length) matched.push({ ...data[0], tier });
      else missing.push({ word, tier });
    }
    console.log(`比對結果：資料庫已有 ${matched.length} 字，缺少 ${missing.length} 字`);
    if (missing.length) {
      console.log('缺少的字：');
      console.log(missing.map(m => `  - ${m.word} (${m.tier})`).join('\n'));
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
