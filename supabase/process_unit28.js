/**
 * Unit 28（Be動詞、助動詞 Be & Auxiliaries）完整處理
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const UNIT = 'unit28';
const BASIC = `am are be been can could did do does done had has have is may might must shall should was were will would`.split(/\s+/);
const ADV = [];

const MISSING_ENTRIES = [
  { word: 'am', pos: 'v.', phonetic: '/æm/', definition: 'the form of "be" used with "I"', definition_zh: '是（用於I）', example_en: 'I am so excited about the trip.', example_zh: '我對這趟旅行感到很興奮。', tier: '基礎' },
  { word: 'are', pos: 'v.', phonetic: '/ɑr/', definition: 'the form of "be" used with "you", "we", "they"', definition_zh: '是（用於you/we/they）', example_en: 'You are the best singer in our class.', example_zh: '你是我們班上最棒的歌手。', tier: '基礎' },
  { word: 'be', pos: 'v.', phonetic: '/bi/', definition: 'to exist or have a certain quality', definition_zh: '是；存在', example_en: 'I want to be a doctor someday.', example_zh: '我希望有天能成為醫生。', tier: '基礎' },
  { word: 'been', pos: 'v.', phonetic: '/bɪn/', definition: 'the past participle of "be"', definition_zh: '（be的過去分詞）', example_en: 'We have been friends since kindergarten.', example_zh: '我們從幼稚園就是朋友了。', tier: '基礎' },
  { word: 'could', pos: 'aux.', phonetic: '/kʊd/', definition: 'the past form of "can", used to say something was possible', definition_zh: '能夠（can的過去式）', example_en: 'When I was five, I could swim well.', example_zh: '我五歲時就很會游泳了。', tier: '基礎' },
  { word: 'did', pos: 'aux.', phonetic: '/dɪd/', definition: 'the past form of "do", used to make questions or negatives', definition_zh: '（do的過去式）', example_en: 'Did you finish your homework last night?', example_zh: '你昨晚做完功課了嗎？', tier: '基礎' },
  { word: 'do', pos: 'aux.', phonetic: '/du/', definition: 'used with a verb to make questions or negatives', definition_zh: '（助動詞，用於問句/否定句）', example_en: 'Do you like eating spicy food?', example_zh: '你喜歡吃辣的食物嗎？', tier: '基礎' },
  { word: 'done', pos: 'aux.', phonetic: '/dʌn/', definition: 'the past participle of "do"', definition_zh: '（do的過去分詞）', example_en: 'She has done all her chores already.', example_zh: '她已經把所有家事都做完了。', tier: '基礎' },
  { word: 'had', pos: 'aux.', phonetic: '/hæd/', definition: 'the past form of "have", used before a past participle', definition_zh: '（have的過去式）', example_en: 'They had already left when I arrived.', example_zh: '我到的時候他們已經離開了。', tier: '基礎' },
  { word: 'have', pos: 'aux.', phonetic: '/hæv/', definition: 'used with a past participle to form the perfect tense', definition_zh: '（助動詞，構成完成式）', example_en: 'We have lived in Taipei for ten years.', example_zh: '我們住在台北已經十年了。', tier: '基礎' },
  { word: 'is', pos: 'v.', phonetic: '/ɪz/', definition: 'the form of "be" used with "he", "she", "it"', definition_zh: '是（用於he/she/it）', example_en: 'My sister is taller than me now.', example_zh: '我妹妹現在比我高了。', tier: '基礎' },
  { word: 'shall', pos: 'aux.', phonetic: '/ʃæl/', definition: 'used to talk about the future or make a suggestion', definition_zh: '將；該', example_en: 'Shall we go to the park this afternoon?', example_zh: '我們今天下午要去公園嗎？', tier: '基礎' },
  { word: 'was', pos: 'v.', phonetic: '/wʌz/', definition: 'the past form of "is" and "am"', definition_zh: '是（is/am的過去式）', example_en: 'The weather was terrible last weekend.', example_zh: '上週末天氣很糟糕。', tier: '基礎' },
  { word: 'would', pos: 'aux.', phonetic: '/wʊd/', definition: 'the past form of "will", used for polite requests or possibility', definition_zh: '將；會（will的過去式）', example_en: 'Would you like some tea or coffee?', example_zh: '你想喝點茶還是咖啡？', tier: '基礎' },
];

async function main() {
  const allWords = [...BASIC.map(w => ({ word: w, tier: '基礎' })), ...ADV.map(w => ({ word: w, tier: '進階' }))];
  console.log(`Unit 28 書上共 ${allWords.length} 字（基礎 ${BASIC.length} + 進階 ${ADV.length}）`);

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
    if (tags.includes('user_lookup') || tags.includes('user_custom')) {
      tags = Array.from(new Set(tags.filter(t => t !== 'user_lookup' && t !== 'user_custom').concat('cap_2000')));
      promoted++;
    }
    if (tags.length === (m.tags || []).length && tags.every(t => (m.tags || []).includes(t))) continue;
    const { error } = await supabase.from('words').update({ tags }).eq('id', m.id);
    if (error) console.error('更新失敗:', m.word, error.message);
    else tagged++;
  }
  console.log(`已為 ${tagged} 個字加上/更新 ${UNIT} 標籤（其中 ${promoted} 個做了 user_lookup/user_custom 升格）`);

  let inserted = 0, skipped = 0, failed = 0;
  for (const e of MISSING_ENTRIES) {
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

  const { data: finalData, error: finalErr } = await supabase.from('words').select('id').contains('tags', [UNIT]);
  if (finalErr) console.error('驗證查詢失敗:', finalErr.message);
  else console.log(`\n驗證：資料庫內 ${UNIT} 標籤總數 = ${finalData.length}，書上清單總數 = ${allWords.length}，${finalData.length === allWords.length ? '✅ 一致' : '❌ 不一致，需檢查'}`);
}

main().catch(err => { console.error(err); process.exit(1); });
