/**
 * 補齊 Unit 1（身體部位和相關動詞）在 words 表裡缺少的 29 個字。
 * 內容依 cambridge-style-examples 技能規範原創生成（非抄書），
 * 欄位對齊現有 words 表格式，並加上 tags: ['cap_2000','unit1', 基礎/進階]。
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const ENTRIES = [
  // ── 基礎學習篇 ──
  { word: 'hand', pos: 'n.', phonetic: '/hænd/', definition: 'the part of your body at the end of your arm, used for holding things', definition_zh: '手', example_en: "She held her little brother's hand at the zoo.", example_zh: '她在動物園牽著弟弟的手。', tier: '基礎' },
  { word: 'hop', pos: 'v.', phonetic: '/hɑp/', definition: 'to jump on one foot or with both feet together', definition_zh: '單腳跳；輕快地跳躍', example_en: 'The rabbit hopped across the garden toward the fence.', example_zh: '那隻兔子跳過花園朝著籬笆前進。', tier: '基礎' },
  { word: 'knock', pos: 'v.', phonetic: '/nɑk/', definition: 'to hit something firmly, especially a door, to make a sound', definition_zh: '敲；敲打', example_en: 'Someone knocked on the door during dinner last night.', example_zh: '昨晚吃飯時有人敲門。', tier: '基礎' },
  { word: 'laugh', pos: 'v.', phonetic: '/læf/', definition: 'to make sounds and movements with your face that show you think something is funny', definition_zh: '笑；大笑', example_en: "The whole class laughed at the teacher's funny joke.", example_zh: '全班同學都被老師的笑話逗笑了。', tier: '基礎' },
  { word: 'lie', pos: 'v.', phonetic: '/laɪ/', definition: 'to put your body in a flat position on a surface', definition_zh: '躺；平躺', example_en: 'He was too tired and just lay down on the sofa.', example_zh: '他太累了，直接躺在沙發上。', tier: '基礎' },
  { word: 'lip', pos: 'n.', phonetic: '/lɪp/', definition: 'one of the two soft edges around your mouth', definition_zh: '嘴唇', example_en: 'Her lips turned blue because the water was freezing.', example_zh: '因為水太冰，她的嘴唇變得發青。', tier: '基礎' },
  { word: 'mouth', pos: 'n.', phonetic: '/maʊθ/', definition: 'the part of your face used for eating and speaking', definition_zh: '嘴巴；口', example_en: "Don't talk with food still in your mouth.", example_zh: '嘴巴裡還有食物時不要說話。', tier: '基礎' },
  { word: 'nail', pos: 'n.', phonetic: '/neɪl/', definition: 'the hard flat part covering the end of a finger or toe', definition_zh: '指甲；釘子', example_en: 'She painted her nails pink before the school dance.', example_zh: '她在學校舞會前把指甲塗成粉紅色。', tier: '基礎' },
  { word: 'nod', pos: 'v.', phonetic: '/nɑd/', definition: 'to move your head down and up quickly to show you agree', definition_zh: '點頭（表示同意）', example_en: 'My mom nodded when I asked to join the trip.', example_zh: '我問能不能參加旅行時，媽媽點了點頭。', tier: '基礎' },
  { word: 'nose', pos: 'n.', phonetic: '/noʊz/', definition: 'the part of your face used for smelling and breathing', definition_zh: '鼻子', example_en: 'His nose turned red from the cold winter wind.', example_zh: '他的鼻子被冬天的冷風吹得發紅。', tier: '基礎' },
  { word: 'point', pos: 'v.', phonetic: '/pɔɪnt/', definition: 'to hold out a finger to show where something is', definition_zh: '指；指向', example_en: 'She pointed at the map to show us the way.', example_zh: '她指著地圖告訴我們該怎麼走。', tier: '基礎' },
  { word: 'pull', pos: 'v.', phonetic: '/pʊl/', definition: 'to hold something and move it toward yourself', definition_zh: '拉；拖', example_en: 'We had to pull the heavy box up the stairs.', example_zh: '我們必須把沉重的箱子拉上樓梯。', tier: '基礎' },
  { word: 'shoulder', pos: 'n.', phonetic: '/ˈʃoʊldər/', definition: 'the part of your body between your neck and your arm', definition_zh: '肩膀', example_en: 'She carried her backpack on one shoulder to school.', example_zh: '她把背包背在一邊肩膀上去上學。', tier: '基礎' },
  { word: 'sight', pos: 'n.', phonetic: '/saɪt/', definition: 'the ability to see, or something that you see', definition_zh: '視力；景象；視野', example_en: 'The mountain view was an amazing sight at sunset.', example_zh: '夕陽下的山景真是壯觀的景象。', tier: '基礎' },
  { word: 'stand', pos: 'v.', phonetic: '/stænd/', definition: 'to be on your feet in an upright position', definition_zh: '站立', example_en: 'All the students stood up when the principal entered.', example_zh: '校長走進來時全班學生都站了起來。', tier: '基礎' },
  { word: 'throat', pos: 'n.', phonetic: '/θroʊt/', definition: 'the front part of your neck, or the passage inside it', definition_zh: '喉嚨', example_en: 'My throat felt sore after singing for three hours.', example_zh: '唱了三個小時的歌後我的喉嚨很痛。', tier: '基礎' },
  { word: 'toe', pos: 'n.', phonetic: '/toʊ/', definition: 'one of the five separate parts at the end of your foot', definition_zh: '腳趾', example_en: 'I hurt my toe when I kicked the chair.', example_zh: '我踢到椅子時傷到了腳趾。', tier: '基礎' },
  { word: 'wave', pos: 'v.', phonetic: '/weɪv/', definition: 'to move your hand from side to side as a greeting', definition_zh: '揮手；（水）波浪', example_en: 'She waved to her friends from across the street.', example_zh: '她從街道對面向朋友們揮手。', tier: '基礎' },
  // ── 進階學習篇 ──
  { word: 'hug', pos: 'v.', phonetic: '/hʌg/', definition: 'to put your arms around someone to show love or comfort', definition_zh: '擁抱', example_en: 'Grandma gave me a warm hug at the airport.', example_zh: '奶奶在機場給了我一個溫暖的擁抱。', tier: '進階' },
  { word: 'joint', pos: 'n.', phonetic: '/dʒɔɪnt/', definition: 'a place in your body where two bones meet and can bend', definition_zh: '關節', example_en: 'His knee joint hurt after the long soccer game.', example_zh: '那場長時間的足球賽後他的膝關節很痛。', tier: '進階' },
  { word: 'lick', pos: 'v.', phonetic: '/lɪk/', definition: 'to move your tongue across something', definition_zh: '舔', example_en: 'The puppy licked my hand when I fed it.', example_zh: '我餵那隻小狗時牠舔了我的手。', tier: '進階' },
  { word: 'motion', pos: 'n.', phonetic: '/ˈmoʊʃən/', definition: 'the act of moving, or a particular movement', definition_zh: '動作；移動；運動', example_en: "The dancer's smooth motions amazed everyone in the hall.", example_zh: '舞者流暢的動作讓禮堂裡的每個人都驚豔。', tier: '進階' },
  { word: 'print', pos: 'v.', phonetic: '/prɪnt/', definition: 'to put words or pictures onto paper using a machine', definition_zh: '印刷；列印；（書）印刷字體', example_en: 'Please print the report before the meeting starts.', example_zh: '請在會議開始前把報告印出來。', tier: '進階' },
  { word: 'rub', pos: 'v.', phonetic: '/rʌb/', definition: 'to move your hand firmly across a surface again and again', definition_zh: '摩擦；擦；搓', example_en: 'He rubbed his eyes because he felt so sleepy.', example_zh: '他因為很想睡而揉了揉眼睛。', tier: '進階' },
  { word: 'skin', pos: 'n.', phonetic: '/skɪn/', definition: "the outer layer that covers a person's or animal's body", definition_zh: '皮膚', example_en: 'Remember to protect your skin from the strong sun.', example_zh: '記得保護你的皮膚不要曬到強烈的陽光。', tier: '進階' },
  { word: 'slip', pos: 'v.', phonetic: '/slɪp/', definition: 'to slide by accident and lose your balance', definition_zh: '滑倒；滑落', example_en: 'Be careful, the floor is wet and you might slip.', example_zh: '小心，地板濕濕的你可能會滑倒。', tier: '進階' },
  { word: 'thumb', pos: 'n.', phonetic: '/θʌm/', definition: 'the short thick finger at the side of your hand', definition_zh: '拇指', example_en: 'The baby liked to suck her thumb before sleeping.', example_zh: '那個嬰兒睡前喜歡吸吮她的拇指。', tier: '進階' },
  { word: 'waist', pos: 'n.', phonetic: '/weɪst/', definition: 'the narrow middle part of your body above your hips', definition_zh: '腰；腰部', example_en: 'He wrapped a belt tightly around his waist.', example_zh: '他把皮帶緊緊地繫在腰上。', tier: '進階' },
  { word: 'wrist', pos: 'n.', phonetic: '/rɪst/', definition: 'the joint that connects your hand to your arm', definition_zh: '手腕', example_en: 'She wore a pink watch on her left wrist.', example_zh: '她左手腕戴著一支粉紅色的手錶。', tier: '進階' },
];

async function main() {
  console.log(`準備寫入 ${ENTRIES.length} 個新字...`);
  let inserted = 0, skipped = 0, failed = 0;

  for (const e of ENTRIES) {
    // 防呆：避免萬一資料庫在這之間已經有這個字，造成重複
    const { data: existing } = await supabase.from('words').select('id').ilike('word', e.word).limit(1);
    if (existing && existing.length) {
      console.log(`  ⏭️  ${e.word} 已存在，跳過新增，改為補上 unit1 標籤`);
      const { data: row } = await supabase.from('words').select('tags').eq('id', existing[0].id).single();
      const newTags = Array.from(new Set([...(row?.tags || []), 'unit1']));
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
      tags: ['cap_2000', 'unit1', e.tier],
      level: 1,
    });
    if (error) { console.error(`  ❌ ${e.word} 寫入失敗:`, error.message); failed++; }
    else { console.log(`  ✅ ${e.word}`); inserted++; }
  }

  console.log(`\n完成：新增 ${inserted} 筆、跳過(已存在) ${skipped} 筆、失敗 ${failed} 筆`);
}

main().catch(err => { console.error(err); process.exit(1); });
