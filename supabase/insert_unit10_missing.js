/**
 * 補齊 Unit 10（顏色、衣服）在 words 表裡缺少的字，原創生成內容。
 * 注意：shoe(s)/sock(s)/slipper(s)/sneaker(s) 在資料庫裡已以複數形式存在（shoes/socks/slippers/sneakers），
 * 已另外用腳本補上 unit10 標籤與標籤升格，不在此重複新增。
 * earring(s) 資料庫完全沒有，以 "earrings" 形式新增。
 */
require('dotenv').config({ path: 'C:\\Users\\qaz10\\Desktop\\claude agent\\vocatopia\\.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const ENTRIES = [
  { word: 'comb', pos: 'n.', phonetic: '/koʊm/', definition: 'a flat tool with thin teeth used to make your hair neat', definition_zh: '梳子', example_en: 'She keeps a small comb in her school bag.', example_zh: '她的書包裡放著一把小梳子。', tier: '基礎' },
  { word: 'glove', pos: 'n.', phonetic: '/glʌv/', definition: 'a piece of clothing worn on the hand to keep it warm', definition_zh: '手套', example_en: 'He wore gloves to keep his hands warm in winter.', example_zh: '他冬天戴手套讓雙手保暖。', tier: '基礎' },
  { word: 'gray', pos: 'adj.', phonetic: '/greɪ/', definition: 'having a color between black and white', definition_zh: '灰色的', example_en: 'My uncle wore a gray jacket to the meeting.', example_zh: '我叔叔穿了一件灰色外套去開會。', tier: '基礎' },
  { word: 'jeans', pos: 'n.', phonetic: '/dʒinz/', definition: 'pants made from strong blue cotton cloth', definition_zh: '牛仔褲', example_en: 'She likes to wear jeans and a T-shirt on weekends.', example_zh: '她週末喜歡穿牛仔褲配T恤。', tier: '基礎' },
  { word: 'mask', pos: 'n.', phonetic: '/mæsk/', definition: 'a covering worn over the face', definition_zh: '面罩；口罩', example_en: 'Everyone wore a mask when they had a cold.', example_zh: '大家感冒時都會戴口罩。', tier: '基礎' },
  { word: 'pink', pos: 'adj.', phonetic: '/pɪŋk/', definition: 'having a light red color', definition_zh: '粉紅色的', example_en: 'She chose a pink dress for the party.', example_zh: '她為派對挑了一件粉紅色的洋裝。', tier: '基礎' },
  { word: 'purple', pos: 'adj.', phonetic: '/ˈpɜrpəl/', definition: 'having a color between red and blue', definition_zh: '紫色的', example_en: 'He painted the wall of his room purple.', example_zh: '他把房間的牆漆成了紫色。', tier: '基礎' },
  { word: 'skirt', pos: 'n.', phonetic: '/skɜrt/', definition: 'a piece of clothing worn by women that hangs from the waist', definition_zh: '裙子', example_en: 'She wore a blue skirt for the school photo.', example_zh: '她拍學校照片時穿了藍色的裙子。', tier: '基礎' },
  { word: 'sweater', pos: 'n.', phonetic: '/ˈswɛtər/', definition: 'a warm piece of clothing worn on the upper body', definition_zh: '毛衣', example_en: 'He put on a thick sweater before going outside.', example_zh: '他出門前穿上了一件厚毛衣。', tier: '基礎' },
  { word: 'tie', pos: 'n.', phonetic: '/taɪ/', definition: 'a long thin piece of cloth worn around the neck with a shirt', definition_zh: '領帶', example_en: 'Her father wears a tie to work every day.', example_zh: '她爸爸每天上班都打領帶。', tier: '基礎' },
  { word: 'T-shirt', pos: 'n.', phonetic: '/ˈtiʃɜrt/', definition: 'a simple shirt with short sleeves and no collar', definition_zh: 'T恤', example_en: 'He bought a new T-shirt for the summer trip.', example_zh: '他為暑假旅行買了一件新T恤。', tier: '基礎' },
  { word: 'contact lens', pos: 'n.', phonetic: '/ˈkɑntækt lɛnz/', definition: 'a small round piece of plastic worn on the eye to help you see', definition_zh: '隱形眼鏡', example_en: 'She started wearing contact lenses in junior high.', example_zh: '她國中就開始戴隱形眼鏡了。', tier: '進階' },
  { word: 'earrings', pos: 'n.', phonetic: '/ˈɪrˌrɪŋz/', definition: 'jewelry worn on the ears', definition_zh: '耳環', example_en: 'She wore small silver earrings to the party.', example_zh: '她戴著小小的銀色耳環去參加派對。', tier: '進階' },
  { word: 'handkerchief', pos: 'n.', phonetic: '/ˈhæŋkərtʃɪf/', definition: 'a small piece of cloth used to clean your nose or face', definition_zh: '手帕', example_en: 'He always keeps a handkerchief in his pocket.', example_zh: '他總是在口袋裡放一條手帕。', tier: '進階' },
  { word: 'iron', pos: 'n.', phonetic: '/ˈaɪərn/', definition: 'a device used to make clothes smooth by heating them', definition_zh: '熨斗', example_en: 'She used an iron to smooth her school uniform.', example_zh: '她用熨斗把校服燙平了。', tier: '進階' },
  { word: 'metal', pos: 'n.', phonetic: '/ˈmɛtəl/', definition: 'a hard material such as iron or gold', definition_zh: '金屬', example_en: 'The bridge is made of strong metal.', example_zh: '那座橋是用堅固的金屬建成的。', tier: '進階' },
  { word: 'necklace', pos: 'n.', phonetic: '/ˈnɛklɪs/', definition: 'jewelry worn around the neck', definition_zh: '項鍊', example_en: 'Her mother gave her a gold necklace for her birthday.', example_zh: '她媽媽送她一條金項鍊當生日禮物。', tier: '進階' },
  { word: 'pajamas', pos: 'n.', phonetic: '/pəˈdʒɑməz/', definition: 'loose clothes worn for sleeping', definition_zh: '睡衣', example_en: 'He put on his pajamas before going to bed.', example_zh: '他睡覺前換上了睡衣。', tier: '進階' },
  { word: 'powder', pos: 'n.', phonetic: '/ˈpaʊdər/', definition: 'a substance made of very small dry pieces', definition_zh: '粉末', example_en: 'She used baby powder to keep her skin dry.', example_zh: '她用爽身粉讓皮膚保持乾爽。', tier: '進階' },
  { word: 'purse', pos: 'n.', phonetic: '/pɜrs/', definition: 'a small bag used to carry money and small items', definition_zh: '手提包；錢包', example_en: 'She keeps her phone and keys in her purse.', example_zh: '她把手機和鑰匙放在手提包裡。', tier: '進階' },
  { word: 'raincoat', pos: 'n.', phonetic: '/ˈreɪnkoʊt/', definition: 'a coat worn to keep dry in the rain', definition_zh: '雨衣', example_en: 'He wore a yellow raincoat to school in the storm.', example_zh: '暴風雨中他穿著黃色雨衣去上學。', tier: '進階' },
  { word: 'scarf', pos: 'n.', phonetic: '/skɑrf/', definition: 'a piece of cloth worn around the neck for warmth or style', definition_zh: '圍巾', example_en: 'She wrapped a warm scarf around her neck.', example_zh: '她把一條保暖的圍巾繞在脖子上。', tier: '進階' },
  { word: 'silver', pos: 'adj.', phonetic: '/ˈsɪlvər/', definition: 'having a shiny gray-white color like the metal silver', definition_zh: '銀色的', example_en: 'She won a silver medal in the swimming race.', example_zh: '她在游泳比賽中贏得了銀牌。', tier: '進階' },
  { word: 'style', pos: 'n.', phonetic: '/staɪl/', definition: 'a particular way of dressing or doing something', definition_zh: '風格；款式', example_en: 'He likes to dress in a simple style.', example_zh: '他喜歡穿著簡單的風格。', tier: '進階' },
  { word: 'suit', pos: 'n.', phonetic: '/sut/', definition: 'a set of clothes made from the same cloth, worn for formal events', definition_zh: '西裝；套裝', example_en: 'Her father wore a black suit to the wedding.', example_zh: '她爸爸穿黑色西裝去參加婚禮。', tier: '進階' },
  { word: 'swimsuit', pos: 'n.', phonetic: '/ˈswɪmsut/', definition: 'clothing worn for swimming', definition_zh: '泳衣', example_en: 'She packed her swimsuit for the beach trip.', example_zh: '她為海邊之旅準備了泳衣。', tier: '進階' },
  { word: 'treasure', pos: 'n.', phonetic: '/ˈtrɛʒər/', definition: 'a collection of valuable things such as gold or jewels', definition_zh: '寶藏；珍寶', example_en: 'The children looked for hidden treasure on the island.', example_zh: '孩子們在島上尋找隱藏的寶藏。', tier: '進階' },
  { word: 'trousers', pos: 'n.', phonetic: '/ˈtraʊzərz/', definition: 'a piece of clothing covering the legs, worn from the waist down', definition_zh: '長褲', example_en: 'He wore black trousers for the school ceremony.', example_zh: '他穿黑色長褲參加學校典禮。', tier: '進階' },
  { word: 'underwear', pos: 'n.', phonetic: '/ˈʌndərwɛr/', definition: 'clothes worn under other clothes, next to the skin', definition_zh: '內衣褲', example_en: 'She packed clean underwear for the school trip.', example_zh: '她為校外教學準備了乾淨的內衣褲。', tier: '進階' },
];

async function main() {
  console.log(`準備寫入 Unit10 共 ${ENTRIES.length} 個新字...`);
  let inserted = 0, skipped = 0, failed = 0;
  for (const e of ENTRIES) {
    const { data: existing } = await supabase.from('words').select('id, tags').ilike('word', e.word).limit(1);
    if (existing && existing.length) {
      console.log(`  ⏭️  ${e.word} 已存在，跳過新增，改為補上 unit10 標籤`);
      const newTags = Array.from(new Set([...(existing[0].tags || []), 'unit10']));
      await supabase.from('words').update({ tags: newTags }).eq('id', existing[0].id);
      skipped++;
      continue;
    }
    const { error } = await supabase.from('words').insert({
      word: e.word, pos: e.pos, phonetic: e.phonetic,
      definition: e.definition, definition_zh: e.definition_zh,
      example_en: e.example_en, example_zh: e.example_zh,
      tags: ['cap_2000', 'unit10', e.tier],
      level: 1,
    });
    if (error) { console.error(`  ❌ ${e.word} 寫入失敗:`, error.message); failed++; }
    else { console.log(`  ✅ ${e.word}`); inserted++; }
  }
  console.log(`\n完成：新增 ${inserted} 筆、跳過(已存在) ${skipped} 筆、失敗 ${failed} 筆`);
}

main().catch(err => { console.error(err); process.exit(1); });
