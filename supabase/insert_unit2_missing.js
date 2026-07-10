/**
 * 補齊 Unit 2（家人、家庭）在 words 表裡缺少的 14 個字。
 * 內容依 cambridge-style-examples 技能規範原創生成，欄位對齊現有 words 表格式，
 * 加上 tags: ['cap_2000','unit2', 基礎/進階]。
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const ENTRIES = [
  // ── 基礎學習篇 ──
  { word: 'husband', pos: 'n.', phonetic: '/ˈhʌzbənd/', definition: 'the man that a woman is married to', definition_zh: '丈夫', example_en: 'Her husband cooks dinner every Friday night.', example_zh: '她丈夫每個星期五晚上煮晚餐。', tier: '基礎' },
  { word: 'parent', pos: 'n.', phonetic: '/ˈpɛrənt/', definition: 'a mother or father of a person', definition_zh: '父親或母親', example_en: 'Both of my parents work at the same school.', example_zh: '我的父母都在同一所學校工作。', tier: '基礎' },
  { word: 'son', pos: 'n.', phonetic: '/sʌn/', definition: 'a male child of a parent', definition_zh: '兒子', example_en: 'Their son just started junior high school this year.', example_zh: '他們的兒子今年剛上國中。', tier: '基礎' },
  { word: 'uncle', pos: 'n.', phonetic: '/ˈʌŋkəl/', definition: "the brother of your father or mother, or your aunt's husband", definition_zh: '叔叔；伯伯；舅舅；姑丈；姨丈', example_en: 'My uncle taught me how to ride a bike.', example_zh: '我叔叔教我怎麼騎腳踏車。', tier: '基礎' },
  // ── 進階學習篇 ──
  { word: 'generation', pos: 'n.', phonetic: '/ˌdʒɛnəˈreɪʃən/', definition: 'all the people who were born around the same time', definition_zh: '世代；一代', example_en: 'Grandpa says young generations use phones too much.', example_zh: '爺爺說年輕世代用手機太多了。', tier: '進階' },
  { word: 'granddaughter', pos: 'n.', phonetic: '/ˈgrænˌdɔtər/', definition: "the daughter of your son or daughter", definition_zh: '孫女；外孫女', example_en: 'Grandma always saves candy for her granddaughter.', example_zh: '奶奶總是留糖果給她的孫女。', tier: '進階' },
  { word: 'growth', pos: 'n.', phonetic: '/groʊθ/', definition: 'the process of getting bigger or developing', definition_zh: '成長；發育', example_en: 'Sunlight is important for the growth of plants.', example_zh: '陽光對植物的生長很重要。', tier: '進階' },
  { word: 'marriage', pos: 'n.', phonetic: '/ˈmærɪdʒ/', definition: 'the relationship between a husband and a wife', definition_zh: '婚姻', example_en: 'Their marriage has lasted for over twenty years.', example_zh: '他們的婚姻已經維持超過二十年了。', tier: '進階' },
  { word: 'marry', pos: 'v.', phonetic: '/ˈmæri/', definition: 'to become someone’s husband or wife', definition_zh: '結婚', example_en: 'My sister plans to marry her boyfriend next spring.', example_zh: '我姊姊打算明年春天跟她男友結婚。', tier: '進階' },
  { word: 'nephew', pos: 'n.', phonetic: '/ˈnɛfju/', definition: 'the son of your brother or sister', definition_zh: '姪子；外甥', example_en: 'I bought a toy car for my little nephew.', example_zh: '我買了一台玩具車給我的小姪子。', tier: '進階' },
  { word: 'niece', pos: 'n.', phonetic: '/nis/', definition: 'the daughter of your brother or sister', definition_zh: '姪女；外甥女', example_en: 'My niece drew a picture of our whole family.', example_zh: '我姪女畫了一張我們全家人的畫。', tier: '進階' },
  { word: 'relation', pos: 'n.', phonetic: '/rɪˈleɪʃən/', definition: 'the way two people or things are connected', definition_zh: '關係；親戚', example_en: 'She has a close relation with her grandmother.', example_zh: '她跟祖母的關係很親近。', tier: '進階' },
  { word: 'relative', pos: 'n.', phonetic: '/ˈrɛlətɪv/', definition: 'a member of your family', definition_zh: '親戚', example_en: 'Many relatives came to visit us during New Year.', example_zh: '過年期間很多親戚來拜訪我們。', tier: '進階' },
  { word: 'tradition', pos: 'n.', phonetic: '/trəˈdɪʃən/', definition: 'a custom that a family or group has followed for a long time', definition_zh: '傳統；習俗', example_en: 'It is a family tradition to make dumplings together.', example_zh: '一起包水餃是我們家的傳統。', tier: '進階' },
];

async function main() {
  console.log(`準備寫入 ${ENTRIES.length} 個新字（Unit2）...`);
  let inserted = 0, skipped = 0, failed = 0;

  for (const e of ENTRIES) {
    const { data: existing } = await supabase.from('words').select('id').ilike('word', e.word).limit(1);
    if (existing && existing.length) {
      console.log(`  ⏭️  ${e.word} 已存在，跳過新增，改為補上 unit2 標籤`);
      const { data: row } = await supabase.from('words').select('tags').eq('id', existing[0].id).single();
      const newTags = Array.from(new Set([...(row?.tags || []), 'unit2']));
      await supabase.from('words').update({ tags: newTags }).eq('id', existing[0].id);
      skipped++;
      continue;
    }
    const { error } = await supabase.from('words').insert({
      word: e.word,
      pos: e.pos,
      phonetic: e.phonetic,
      definition: e.definition,
      definition_zh: e.definition_zh,
      example_en: e.example_en,
      example_zh: e.example_zh,
      tags: ['cap_2000', 'unit2', e.tier],
      level: 1,
    });
    if (error) { console.error(`  ❌ ${e.word} 寫入失敗:`, error.message); failed++; }
    else { console.log(`  ✅ ${e.word}`); inserted++; }
  }

  console.log(`\n完成：新增 ${inserted} 筆、跳過(已存在) ${skipped} 筆、失敗 ${failed} 筆`);
}

main().catch(err => { console.error(err); process.exit(1); });
