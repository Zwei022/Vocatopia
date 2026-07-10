/**
 * 補齊 Unit 5（外表特徵）在 words 表裡缺少的 11 個字。
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const ENTRIES = [
  // ── 基礎學習篇 ──
  { word: 'slim', pos: 'adj.', phonetic: '/slɪm/', definition: 'thin in an attractive way', definition_zh: '苗條的；纖細的', example_en: 'She stayed slim by jogging every morning.', example_zh: '她每天早上慢跑，維持苗條的身材。', tier: '基礎' },
  { word: 'tall', pos: 'adj.', phonetic: '/tɔl/', definition: 'having a greater than average height', definition_zh: '高的', example_en: 'My brother is the tallest player on the team.', example_zh: '我哥哥是隊上最高的球員。', tier: '基礎' },
  { word: 'thin', pos: 'adj.', phonetic: '/θɪn/', definition: 'not fat; having little space between two sides', definition_zh: '瘦的；薄的', example_en: 'The thin ice cracked when he stepped on it.', example_zh: '他踩上去時薄冰裂開了。', tier: '基礎' },
  // ── 進階學習篇 ──
  { word: 'chubby', pos: 'adj.', phonetic: '/ˈtʃʌbi/', definition: 'slightly fat in a pleasant way, especially a baby or child', definition_zh: '圓潤的；胖嘟嘟的', example_en: 'The chubby baby laughed and clapped his hands.', example_zh: '那個胖嘟嘟的寶寶又笑又拍手。', tier: '進階' },
  { word: 'haircut', pos: 'n.', phonetic: '/ˈhɛrˌkʌt/', definition: 'the act of cutting hair, or the style it is cut into', definition_zh: '理髮；髮型', example_en: 'He got a short haircut before summer vacation.', example_zh: '他在暑假前剪了個短髮。', tier: '進階' },
  { word: 'nice-looking', pos: 'adj.', phonetic: '/naɪs ˈlʊkɪŋ/', definition: 'attractive in appearance', definition_zh: '好看的；漂亮的', example_en: 'That is a nice-looking jacket you are wearing.', example_zh: '你穿的那件外套很好看。', tier: '進階' },
  { word: 'over-weight', pos: 'adj.', phonetic: '/ˈoʊvərˌweɪt/', definition: 'weighing more than is healthy', definition_zh: '過重的', example_en: 'The doctor said the dog was a little over-weight.', example_zh: '醫生說這隻狗有點過重。', tier: '進階' },
  { word: 'skinny', pos: 'adj.', phonetic: '/ˈskɪni/', definition: 'very thin, often in a way that seems unhealthy', definition_zh: '骨瘦如柴的', example_en: 'He looked skinny after being sick for two weeks.', example_zh: '生病兩星期後他看起來骨瘦如柴。', tier: '進階' },
  { word: 'slender', pos: 'adj.', phonetic: '/ˈslɛndər/', definition: 'thin in a graceful and attractive way', definition_zh: '苗條優美的；細長的', example_en: 'The dancer has long, slender arms and legs.', example_zh: '那位舞者有著修長優美的手臂和雙腿。', tier: '進階' },
  { word: 'ugly', pos: 'adj.', phonetic: '/ˈʌgli/', definition: 'very unattractive in appearance', definition_zh: '醜陋的', example_en: 'The old, ugly building was finally torn down.', example_zh: '那棟又老又醜的建築終於被拆除了。', tier: '進階' },
  { word: 'under-weight', pos: 'adj.', phonetic: '/ˈʌndərˌweɪt/', definition: 'weighing less than is healthy or normal', definition_zh: '過輕的；體重不足的', example_en: 'The nurse said the puppy was slightly under-weight.', example_zh: '護理人員說這隻小狗的體重有點過輕。', tier: '進階' },
  { word: 'youthful', pos: 'adj.', phonetic: '/ˈjuθfəl/', definition: 'looking or behaving young and energetic', definition_zh: '年輕有活力的；青春的', example_en: 'Grandma still has a youthful smile at seventy.', example_zh: '奶奶七十歲了，笑容依然充滿青春活力。', tier: '進階' },
];

async function main() {
  console.log(`準備寫入 ${ENTRIES.length} 個新字（Unit5）...`);
  let inserted = 0, skipped = 0, failed = 0;

  for (const e of ENTRIES) {
    const { data: existing } = await supabase.from('words').select('id').ilike('word', e.word).limit(1);
    if (existing && existing.length) {
      console.log(`  ⏭️  ${e.word} 已存在，跳過新增，改為補上 unit5 標籤`);
      const { data: row } = await supabase.from('words').select('tags').eq('id', existing[0].id).single();
      const newTags = Array.from(new Set([...(row?.tags || []), 'unit5']));
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
      tags: ['cap_2000', 'unit5', e.tier],
      level: 1,
    });
    if (error) { console.error(`  ❌ ${e.word} 寫入失敗:`, error.message); failed++; }
    else { console.log(`  ✅ ${e.word}`); inserted++; }
  }

  console.log(`\n完成：新增 ${inserted} 筆、跳過(已存在) ${skipped} 筆、失敗 ${failed} 筆`);
}

main().catch(err => { console.error(err); process.exit(1); });
