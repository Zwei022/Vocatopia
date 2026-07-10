/**
 * 補齊 Unit 11（房子、家電、電器設備）在 words 表裡缺少的 39 個字，原創生成內容。
 * 註：書上 "coach" 疑似 "couch"（沙發）的誤植，因本單元家具已有 sofa 一詞，"coach"(教練/長途巴士)
 * 在此語境不合理，故以 couch 處理。
 */
require('dotenv').config({ path: 'C:\\Users\\qaz10\\Desktop\\claude agent\\vocatopia\\.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const ENTRIES = [
  { word: 'couch', pos: 'n.', phonetic: '/kaʊtʃ/', definition: 'a long soft seat for more than one person', definition_zh: '沙發', example_en: 'The whole family sat on the couch to watch TV.', example_zh: '全家人坐在沙發上一起看電視。', tier: '基礎' },
  { word: 'dining room', pos: 'n.', phonetic: '/ˈdaɪnɪŋ rum/', definition: 'a room in a house used for eating meals', definition_zh: '飯廳', example_en: 'We eat dinner together in the dining room every night.', example_zh: '我們每晚都在飯廳一起吃晚餐。', tier: '基礎' },
  { word: 'living room', pos: 'n.', phonetic: '/ˈlɪvɪŋ rum/', definition: 'a room in a house used for relaxing or watching TV', definition_zh: '客廳', example_en: 'The children play games in the living room after school.', example_zh: '孩子們放學後在客廳玩遊戲。', tier: '基礎' },
  { word: 'mat', pos: 'n.', phonetic: '/mæt/', definition: 'a flat piece of material placed on the floor', definition_zh: '墊子', example_en: 'Please wipe your shoes on the mat before entering.', example_zh: '進門前請在墊子上擦擦鞋子。', tier: '基礎' },
  { word: 'pipe', pos: 'n.', phonetic: '/paɪp/', definition: 'a long tube that carries water or gas', definition_zh: '管子；水管', example_en: 'Water ran out from a broken pipe under the sink.', example_zh: '水從水槽下方破裂的水管流出來。', tier: '基礎' },
  { word: 'rope', pos: 'n.', phonetic: '/roʊp/', definition: 'a thick strong string made of twisted material', definition_zh: '繩子', example_en: 'He tied the boxes together with a long rope.', example_zh: '他用一條長繩把箱子綁在一起。', tier: '基礎' },
  { word: 'sofa', pos: 'n.', phonetic: '/ˈsoʊfə/', definition: 'a long soft seat for two or more people', definition_zh: '沙發', example_en: 'She fell asleep on the sofa while reading.', example_zh: '她看書看到一半在沙發上睡著了。', tier: '基礎' },
  { word: 'stairs', pos: 'n.', phonetic: '/stɛrz/', definition: 'a set of steps that go from one floor to another', definition_zh: '樓梯', example_en: 'He ran down the stairs when he heard the doorbell.', example_zh: '他聽到門鈴聲就跑下樓梯。', tier: '基礎' },
  { word: 'tape', pos: 'n.', phonetic: '/teɪp/', definition: 'a thin strip of sticky material used to join things', definition_zh: '膠帶', example_en: 'She used tape to fix the torn poster.', example_zh: '她用膠帶修補了破損的海報。', tier: '基礎' },
  { word: 'tape recorder', pos: 'n.', phonetic: '/teɪp rɪˈkɔrdər/', definition: 'a machine that records and plays back sound', definition_zh: '錄音機', example_en: 'The teacher used a tape recorder in English class.', example_zh: '老師在英文課上用了錄音機。', tier: '基礎' },
  { word: 'television', pos: 'n.', phonetic: '/ˈtɛləˌvɪʒən/', definition: 'a machine used for watching programs with pictures and sound', definition_zh: '電視', example_en: 'We watched the baseball game on television last night.', example_zh: '我們昨晚在電視上看了棒球比賽。', tier: '基礎' },
  { word: 'tidy', pos: 'adj.', phonetic: '/ˈtaɪdi/', definition: 'neat and in good order', definition_zh: '整齊的', example_en: 'Her room is always tidy and clean.', example_zh: '她的房間總是整齊又乾淨。', tier: '基礎' },
  { word: 'towel', pos: 'n.', phonetic: '/ˈtaʊəl/', definition: 'a piece of cloth used to dry your body', definition_zh: '毛巾', example_en: 'He dried his hair with a soft towel.', example_zh: '他用一條柔軟的毛巾擦乾頭髮。', tier: '基礎' },
  { word: 'tub', pos: 'n.', phonetic: '/tʌb/', definition: 'a large container, especially one used for washing your body', definition_zh: '浴缸；桶', example_en: 'She filled the tub with warm water for a bath.', example_zh: '她把浴缸裝滿溫水準備洗澡。', tier: '基礎' },
  { word: 'yard', pos: 'n.', phonetic: '/jɑrd/', definition: 'an area of ground next to a house', definition_zh: '院子', example_en: 'The children played tag in the front yard.', example_zh: '孩子們在前院玩鬼抓人。', tier: '基礎' },
  { word: 'air conditioner', pos: 'n.', phonetic: '/ɛr kənˈdɪʃənər/', definition: 'a machine that cools the air in a room', definition_zh: '冷氣機', example_en: 'We turned on the air conditioner because it was so hot.', example_zh: '因為太熱了，我們把冷氣機打開。', tier: '進階' },
  { word: 'closet', pos: 'n.', phonetic: '/ˈklɑzɪt/', definition: 'a small room or space for storing clothes', definition_zh: '衣櫃；儲藏室', example_en: 'She hung her school uniform in the closet.', example_zh: '她把校服掛在衣櫃裡。', tier: '進階' },
  { word: 'downstairs', pos: 'adv.', phonetic: '/ˌdaʊnˈstɛrz/', definition: 'on or to a lower floor of a building', definition_zh: '在樓下；到樓下', example_en: 'Mom called us downstairs for dinner.', example_zh: '媽媽叫我們下樓吃晚餐。', tier: '進階' },
  { word: 'freezer', pos: 'n.', phonetic: '/ˈfrizər/', definition: 'a part of a refrigerator, or a separate machine, that keeps food frozen', definition_zh: '冷凍庫', example_en: 'He put the ice cream back in the freezer.', example_zh: '他把冰淇淋放回冷凍庫。', tier: '進階' },
  { word: 'hall', pos: 'n.', phonetic: '/hɔl/', definition: 'a passage inside a building that leads to other rooms', definition_zh: '走廊；大廳', example_en: 'The students lined up in the hall before class.', example_zh: '學生們上課前在走廊排隊。', tier: '進階' },
  { word: 'hanger', pos: 'n.', phonetic: '/ˈhæŋər/', definition: 'a curved piece of wood or plastic used to hang clothes', definition_zh: '衣架', example_en: 'She hung her jacket on a hanger in the closet.', example_zh: '她把外套掛在衣櫃裡的衣架上。', tier: '進階' },
  { word: 'heater', pos: 'n.', phonetic: '/ˈhitər/', definition: 'a machine that makes a room warm', definition_zh: '暖氣機', example_en: 'They turned on the heater during the cold winter night.', example_zh: '寒冷的冬夜他們打開了暖氣機。', tier: '進階' },
  { word: 'microwave', pos: 'n.', phonetic: '/ˈmaɪkroʊweɪv/', definition: 'a machine that cooks or heats food quickly using waves of energy', definition_zh: '微波爐', example_en: 'He heated the leftover rice in the microwave.', example_zh: '他用微波爐加熱剩下的飯。', tier: '進階' },
  { word: 'mirror', pos: 'n.', phonetic: '/ˈmɪrər/', definition: 'a piece of glass that shows your reflection', definition_zh: '鏡子', example_en: 'She checked her hair in the mirror before school.', example_zh: '她上學前在鏡子前檢查頭髮。', tier: '進階' },
  { word: 'needle', pos: 'n.', phonetic: '/ˈnidəl/', definition: 'a thin sharp metal tool used for sewing', definition_zh: '針', example_en: 'Grandma used a needle and thread to fix my shirt.', example_zh: '奶奶用針線幫我修補了襯衫。', tier: '進階' },
  { word: 'oven', pos: 'n.', phonetic: '/ˈʌvən/', definition: 'a closed box used for baking or cooking food', definition_zh: '烤箱', example_en: 'She baked cookies in the oven for the party.', example_zh: '她用烤箱烤了餅乾要帶去派對。', tier: '進階' },
  { word: 'pillow', pos: 'n.', phonetic: '/ˈpɪloʊ/', definition: 'a soft object used to rest your head on when sleeping', definition_zh: '枕頭', example_en: 'He hugged his pillow and fell asleep quickly.', example_zh: '他抱著枕頭很快就睡著了。', tier: '進階' },
  { word: 'printer', pos: 'n.', phonetic: '/ˈprɪntər/', definition: 'a machine connected to a computer that prints documents', definition_zh: '印表機', example_en: 'The printer in the office ran out of paper.', example_zh: '辦公室的印表機沒紙了。', tier: '進階' },
  { word: 'receiver', pos: 'n.', phonetic: '/rɪˈsivər/', definition: 'the part of a telephone that you hold to your ear', definition_zh: '（電話）聽筒', example_en: 'She picked up the receiver when the phone rang.', example_zh: '電話響時她拿起了聽筒。', tier: '進階' },
  { word: 'repair', pos: 'v.', phonetic: '/rɪˈpɛr/', definition: 'to fix something that is broken', definition_zh: '修理', example_en: 'His father repaired the broken chair last weekend.', example_zh: '他爸爸上週末修理了那張壞掉的椅子。', tier: '進階' },
  { word: 'roof', pos: 'n.', phonetic: '/ruf/', definition: 'the covering on top of a building', definition_zh: '屋頂', example_en: 'Rain fell loudly on the metal roof last night.', example_zh: '昨晚雨落在鐵皮屋頂上發出很大聲響。', tier: '進階' },
  { word: 'sheet', pos: 'n.', phonetic: '/ʃit/', definition: 'a large piece of cloth used to cover a bed', definition_zh: '床單；（紙）一張', example_en: 'She changed the sheets on her bed every week.', example_zh: '她每星期都會換床單。', tier: '進階' },
  { word: 'sink', pos: 'n.', phonetic: '/sɪŋk/', definition: 'a container in a kitchen or bathroom used for washing things', definition_zh: '水槽', example_en: 'He washed the dishes in the kitchen sink.', example_zh: '他在廚房水槽洗碗。', tier: '進階' },
  { word: 'soap', pos: 'n.', phonetic: '/soʊp/', definition: 'a substance used with water for washing', definition_zh: '肥皂', example_en: 'Wash your hands with soap before eating.', example_zh: '吃飯前要用肥皂洗手。', tier: '進階' },
  { word: 'speaker', pos: 'n.', phonetic: '/ˈspikər/', definition: 'a piece of equipment that makes sound louder', definition_zh: '喇叭；揚聲器', example_en: 'He connected his phone to a small speaker.', example_zh: '他把手機連接到一個小喇叭上。', tier: '進階' },
  { word: 'sweep', pos: 'v.', phonetic: '/swip/', definition: 'to clean a floor using a brush', definition_zh: '掃（地）', example_en: 'She swept the kitchen floor after dinner.', example_zh: '她晚餐後掃了廚房的地板。', tier: '進階' },
  { word: 'toilet', pos: 'n.', phonetic: '/ˈtɔɪlɪt/', definition: 'a bathroom fixture used for getting rid of body waste', definition_zh: '馬桶；廁所', example_en: 'Please remember to flush the toilet.', example_zh: '請記得沖馬桶。', tier: '進階' },
  { word: 'toothbrush', pos: 'n.', phonetic: '/ˈtuθbrʌʃ/', definition: 'a small brush used for cleaning your teeth', definition_zh: '牙刷', example_en: 'He packed his toothbrush for the school trip.', example_zh: '他為校外教學打包了牙刷。', tier: '進階' },
  { word: 'tube', pos: 'n.', phonetic: '/tub/', definition: 'a long round container or pipe, often holding soft substances', definition_zh: '管子；軟管', example_en: 'She squeezed toothpaste from the tube.', example_zh: '她從軟管裡擠出牙膏。', tier: '進階' },
  { word: 'upstairs', pos: 'adv.', phonetic: '/ˌʌpˈstɛrz/', definition: 'on or to a higher floor of a building', definition_zh: '在樓上；到樓上', example_en: 'He went upstairs to study in his room.', example_zh: '他上樓到房間唸書。', tier: '進階' },
  { word: 'wok', pos: 'n.', phonetic: '/wɑk/', definition: 'a round deep pan used in Chinese cooking', definition_zh: '炒菜鍋', example_en: 'Mom stir-fried the vegetables in a hot wok.', example_zh: '媽媽用熱鍋快炒了蔬菜。', tier: '進階' },
];

async function main() {
  console.log(`準備寫入 Unit11 共 ${ENTRIES.length} 個新字...`);
  let inserted = 0, skipped = 0, failed = 0;
  for (const e of ENTRIES) {
    const { data: existing } = await supabase.from('words').select('id, tags').ilike('word', e.word).limit(1);
    if (existing && existing.length) {
      console.log(`  ⏭️  ${e.word} 已存在，跳過新增，改為補上 unit11 標籤`);
      const newTags = Array.from(new Set([...(existing[0].tags || []), 'unit11']));
      await supabase.from('words').update({ tags: newTags }).eq('id', existing[0].id);
      skipped++;
      continue;
    }
    const { error } = await supabase.from('words').insert({
      word: e.word, pos: e.pos, phonetic: e.phonetic,
      definition: e.definition, definition_zh: e.definition_zh,
      example_en: e.example_en, example_zh: e.example_zh,
      tags: ['cap_2000', 'unit11', e.tier],
      level: 1,
    });
    if (error) { console.error(`  ❌ ${e.word} 寫入失敗:`, error.message); failed++; }
    else { console.log(`  ✅ ${e.word}`); inserted++; }
  }
  console.log(`\n完成：新增 ${inserted} 筆、跳過(已存在) ${skipped} 筆、失敗 ${failed} 筆`);
}

main().catch(err => { console.error(err); process.exit(1); });
