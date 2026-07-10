/**
 * Unit 27（介系詞 Prepositions）完整處理：標記已存在字 + 補齊缺字 + user_lookup/user_custom 升格 + 驗證
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const UNIT = 'unit27';

const BASIC = `about above across after along around at before behind below beside between by down during except for from in "in back of" "in front of" inside into like near "next to" of off on out "out of" outside over since than to under until up with without`;
const ADV = `against among besides beyond concerning including through throughout till toward upon within`;

function parseList(str) {
  const re = /"([^"]+)"|(\S+)/g;
  const out = [];
  let m;
  while ((m = re.exec(str))) out.push(m[1] || m[2]);
  return out;
}

const BASIC_WORDS = parseList(BASIC);
const ADV_WORDS = parseList(ADV);

const MISSING_ENTRIES = [
  { word: 'in front of', pos: 'prep.', phonetic: '/ɪn frʌnt ʌv/', definition: 'in a position ahead of something', definition_zh: '在…前面', example_en: 'The bus stop is in front of the library.', example_zh: '公車站在圖書館前面。', tier: '基礎' },
  { word: 'in back of', pos: 'prep.', phonetic: '/ɪn bæk ʌv/', definition: 'in a position behind something', definition_zh: '在…後面', example_en: 'My bike is parked in back of the school.', example_zh: '我的腳踏車停在學校後面。', tier: '基礎' },
  { word: 'next to', pos: 'prep.', phonetic: '/nɛkst tu/', definition: 'very close to something, with nothing between', definition_zh: '在…旁邊', example_en: 'She sat next to her best friend in class.', example_zh: '她在班上坐在她最好朋友旁邊。', tier: '基礎' },
  { word: 'off', pos: 'prep.', phonetic: '/ɔf/', definition: 'away from a place or position', definition_zh: '離開；脫離', example_en: 'He jumped off the bus before it stopped.', example_zh: '公車停下前他就跳下車了。', tier: '基礎' },
  { word: 'out of', pos: 'prep.', phonetic: '/aʊt ʌv/', definition: 'moving away from the inside of a place', definition_zh: '從…裡面出來', example_en: 'The cat ran out of the room quickly.', example_zh: '那隻貓很快地跑出房間。', tier: '基礎' },
  { word: 'concerning', pos: 'prep.', phonetic: '/kənˈsɜrnɪŋ/', definition: 'about a particular subject', definition_zh: '關於', example_en: "I have a question concerning tomorrow's test.", example_zh: '我有一個關於明天考試的問題。', tier: '進階' },
  { word: 'including', pos: 'prep.', phonetic: '/ɪnˈkludɪŋ/', definition: 'having something as part of a group', definition_zh: '包括', example_en: 'Five students, including me, joined the club.', example_zh: '包括我在內的五個學生加入了社團。', tier: '進階' },
  { word: 'toward', pos: 'prep.', phonetic: '/tɔrd/', definition: 'in the direction of someone or something', definition_zh: '朝向；向', example_en: 'The children ran toward the ice cream truck.', example_zh: '孩子們朝著冰淇淋車跑去。', tier: '進階' },
  { word: 'within', pos: 'prep.', phonetic: '/wɪˈðɪn/', definition: 'inside a particular period of time or distance', definition_zh: '在…之內', example_en: 'Please finish the quiz within ten minutes.', example_zh: '請在十分鐘內完成這個小測驗。', tier: '進階' },
];

async function main() {
  const allWords = [
    ...BASIC_WORDS.map(w => ({ word: w, tier: '基礎' })),
    ...ADV_WORDS.map(w => ({ word: w, tier: '進階' })),
  ];
  console.log(`Unit 27 書上共 ${allWords.length} 字（基礎 ${BASIC_WORDS.length} + 進階 ${ADV_WORDS.length}）`);

  // 步驟 2+3：比對並標記已存在字
  const matched = [];
  const missing = [];
  for (const { word, tier } of allWords) {
    const { data, error } = await supabase.from('words').select('id, word, tags').ilike('word', word).limit(1);
    if (error) { console.error('查詢失敗:', word, error.message); continue; }
    if (data && data.length) matched.push({ ...data[0], tier });
    else missing.push({ word, tier });
  }
  console.log(`已有 ${matched.length} 字，缺少 ${missing.length} 字`);

  let tagged = 0, promoted = 0;
  for (const m of matched) {
    let tags = Array.from(new Set([...(m.tags || []), UNIT]));
    const hadUserTag = tags.includes('user_lookup') || tags.includes('user_custom');
    if (hadUserTag) {
      tags = Array.from(new Set(tags.filter(t => t !== 'user_lookup' && t !== 'user_custom').concat('cap_2000')));
      promoted++;
    }
    if (tags.length === (m.tags || []).length && tags.every(t => (m.tags || []).includes(t))) continue;
    const { error } = await supabase.from('words').update({ tags }).eq('id', m.id);
    if (error) console.error('更新失敗:', m.word, error.message);
    else tagged++;
  }
  console.log(`已為 ${tagged} 個字加上/更新 ${UNIT} 標籤（其中 ${promoted} 個做了 user_lookup/user_custom 升格）`);

  // 步驟 4：補齊缺字
  let inserted = 0, skipped = 0, failed = 0;
  const missingWordsLower = missing.map(m => m.word.toLowerCase());
  for (const e of MISSING_ENTRIES) {
    if (!missingWordsLower.includes(e.word.toLowerCase())) {
      console.log(`  ⚠️ ${e.word} 不在缺字清單中（可能書上清單解析有誤），仍嘗試處理`);
    }
    const { data: existing } = await supabase.from('words').select('id, tags').ilike('word', e.word).limit(1);
    if (existing && existing.length) {
      console.log(`  ⏭️  ${e.word} 已存在，跳過新增，改為補上 ${UNIT} 標籤`);
      let tags = Array.from(new Set([...(existing[0].tags || []), UNIT]));
      if (tags.includes('user_lookup') || tags.includes('user_custom')) {
        tags = Array.from(new Set(tags.filter(t => t !== 'user_lookup' && t !== 'user_custom').concat('cap_2000')));
      }
      await supabase.from('words').update({ tags }).eq('id', existing[0].id);
      skipped++;
      continue;
    }
    const { error } = await supabase.from('words').insert({
      word: e.word, pos: e.pos, phonetic: e.phonetic, definition: e.definition,
      definition_zh: e.definition_zh, example_en: e.example_en, example_zh: e.example_zh,
      tags: ['cap_2000', UNIT, e.tier], level: 1,
    });
    if (error) { console.error(`  ❌ ${e.word} 寫入失敗:`, error.message); failed++; }
    else { console.log(`  ✅ ${e.word}`); inserted++; }
  }
  console.log(`補字完成：新增 ${inserted}、跳過(已存在) ${skipped}、失敗 ${failed}`);

  // 步驟 5：驗證
  const { data: finalData, error: finalErr } = await supabase.from('words').select('id').contains('tags', [UNIT]);
  if (finalErr) console.error('驗證查詢失敗:', finalErr.message);
  else console.log(`\n驗證：資料庫內 ${UNIT} 標籤總數 = ${finalData.length}，書上清單總數 = ${allWords.length}，${finalData.length === allWords.length ? '✅ 一致' : '❌ 不一致，需檢查'}`);
}

main().catch(err => { console.error(err); process.exit(1); });
