/**
 * 補齊 Unit 9（食物、飲料、餐具）在 words 表裡缺少的 48 個字，原創生成內容。
 */
require('dotenv').config({ path: 'C:\\Users\\qaz10\\Desktop\\claude agent\\vocatopia\\.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const ENTRIES = [
  { word: 'bun', pos: 'n.', phonetic: '/bʌn/', definition: 'a small round piece of bread', definition_zh: '小圓麵包', example_en: 'She bought two buns for breakfast this morning.', example_zh: '她今天早上買了兩個小圓麵包當早餐。', tier: '基礎' },
  { word: 'chopsticks', pos: 'n.', phonetic: '/ˈtʃɑpstɪks/', definition: 'a pair of thin sticks used for eating food, especially in Asia', definition_zh: '筷子', example_en: 'He learned to use chopsticks when he was five.', example_zh: '他五歲時就學會用筷子了。', tier: '基礎' },
  { word: 'fast food', pos: 'n.', phonetic: '/fæst fud/', definition: 'food that is prepared and served quickly at a restaurant', definition_zh: '速食', example_en: 'They often eat fast food after basketball practice.', example_zh: '他們打完籃球後常常吃速食。', tier: '基礎' },
  { word: 'French fries', pos: 'n.', phonetic: '/frɛntʃ fraɪz/', definition: 'long thin pieces of potato cooked in hot oil', definition_zh: '薯條', example_en: 'My little brother always orders French fries with ketchup.', example_zh: '我弟弟總是點薯條配番茄醬。', tier: '基礎' },
  { word: 'fry', pos: 'v.', phonetic: '/fraɪ/', definition: 'to cook food in hot oil', definition_zh: '油炸；油煎', example_en: 'Mom fried the eggs for our breakfast this morning.', example_zh: '媽媽今天早上煎了蛋當我們的早餐。', tier: '基礎' },
  { word: 'hamburger', pos: 'n.', phonetic: '/ˈhæmˌbɜrgər/', definition: 'a round piece of cooked meat served inside bread', definition_zh: '漢堡', example_en: 'He ordered a hamburger and a cup of juice.', example_zh: '他點了一個漢堡和一杯果汁。', tier: '基礎' },
  { word: 'hot dog', pos: 'n.', phonetic: '/hɑt dɔg/', definition: 'a long piece of cooked meat served inside a piece of bread', definition_zh: '熱狗', example_en: 'We bought hot dogs at the night market last night.', example_zh: '我們昨晚在夜市買了熱狗。', tier: '基礎' },
  { word: 'lid', pos: 'n.', phonetic: '/lɪd/', definition: 'a cover that closes the top of a pot, box, or jar', definition_zh: '蓋子', example_en: 'Please put the lid back on the pot after cooking.', example_zh: '煮完後請把蓋子蓋回鍋子上。', tier: '基礎' },
  { word: 'milkshake', pos: 'n.', phonetic: '/ˈmɪlkʃeɪk/', definition: 'a sweet cold drink made from milk and ice cream', definition_zh: '奶昔', example_en: 'She ordered a chocolate milkshake at the fast food shop.', example_zh: '她在速食店點了一杯巧克力奶昔。', tier: '基礎' },
  { word: 'moon cake', pos: 'n.', phonetic: '/mun keɪk/', definition: 'a round Chinese cake eaten during the Mid-Autumn Festival', definition_zh: '月餅', example_en: 'Our family shares moon cakes every Mid-Autumn Festival.', example_zh: '我們家每年中秋節都會一起吃月餅。', tier: '基礎' },
  { word: 'noodle', pos: 'n.', phonetic: '/ˈnudəl/', definition: 'a long thin piece of food made from flour and water', definition_zh: '麵條', example_en: 'He likes noodle soup on cold winter mornings.', example_zh: '他在寒冷的冬天早晨喜歡喝湯麵。', tier: '基礎' },
  { word: 'peach', pos: 'n.', phonetic: '/pitʃ/', definition: 'a round soft fruit with pink or yellow skin', definition_zh: '桃子', example_en: 'The peach on the table smelled sweet and fresh.', example_zh: '桌上的桃子聞起來又甜又新鮮。', tier: '基礎' },
  { word: 'pear', pos: 'n.', phonetic: '/pɛr/', definition: 'a sweet fruit that is round and wider at the bottom', definition_zh: '梨子', example_en: 'She cut the pear into small pieces for her sister.', example_zh: '她把梨子切成小塊給妹妹吃。', tier: '基礎' },
  { word: 'pizza', pos: 'n.', phonetic: '/ˈpitsə/', definition: 'a flat round bread covered with cheese and other food, then baked', definition_zh: '披薩', example_en: 'We ordered a large pizza for the birthday party.', example_zh: '我們為生日派對訂了一個大披薩。', tier: '基礎' },
  { word: 'salt', pos: 'n.', phonetic: '/sɔlt/', definition: 'a white substance used to add flavor to food', definition_zh: '鹽', example_en: 'Please pass me the salt for the soup.', example_zh: '請把鹽遞給我加進湯裡。', tier: '基礎' },
  { word: 'soup', pos: 'n.', phonetic: '/sup/', definition: 'a liquid food made by cooking meat or vegetables in water', definition_zh: '湯', example_en: 'She made hot soup for her sick brother.', example_zh: '她為生病的弟弟煮了熱湯。', tier: '基礎' },
  { word: 'spaghetti', pos: 'n.', phonetic: '/spəˈgɛti/', definition: 'long thin noodles from Italy, usually served with sauce', definition_zh: '義大利麵', example_en: 'He cooked spaghetti with tomato sauce for dinner.', example_zh: '他晚餐煮了番茄醬義大利麵。', tier: '基礎' },
  { word: 'straw', pos: 'n.', phonetic: '/strɔ/', definition: 'a thin tube used for drinking liquid', definition_zh: '吸管', example_en: 'The store no longer gives out plastic straws.', example_zh: '這家店已經不再提供塑膠吸管了。', tier: '基礎' },
  { word: 'sugar', pos: 'n.', phonetic: '/ˈʃʊgər/', definition: 'a sweet substance used to make food and drinks sweet', definition_zh: '糖', example_en: 'She added two spoons of sugar to her tea.', example_zh: '她在茶裡加了兩匙糖。', tier: '基礎' },
  { word: 'toast', pos: 'n.', phonetic: '/toʊst/', definition: 'bread that has been heated until it turns brown', definition_zh: '吐司', example_en: 'He had toast with butter for breakfast today.', example_zh: '他今天早餐吃了塗奶油的吐司。', tier: '基礎' },
  { word: 'tomato', pos: 'n.', phonetic: '/təˈmeɪtoʊ/', definition: 'a round red fruit often eaten as a vegetable', definition_zh: '番茄', example_en: 'She grows tomatoes in a small pot on the balcony.', example_zh: '她在陽台的小盆栽裡種番茄。', tier: '基礎' },
  { word: 'yummy', pos: 'adj.', phonetic: '/ˈjʌmi/', definition: 'tasting very good', definition_zh: '好吃的；美味的', example_en: 'This cake looks so yummy that I want more.', example_zh: '這個蛋糕看起來太好吃了，我還想再吃。', tier: '基礎' },
  { word: 'brunch', pos: 'n.', phonetic: '/brʌntʃ/', definition: 'a meal eaten in the late morning, combining breakfast and lunch', definition_zh: '早午餐', example_en: 'We had brunch together on Sunday morning.', example_zh: '我們星期天早上一起吃了早午餐。', tier: '進階' },
  { word: 'doughnut', pos: 'n.', phonetic: '/ˈdoʊnʌt/', definition: 'a small round sweet cake with a hole in the middle', definition_zh: '甜甜圈', example_en: 'She bought a box of doughnuts for the class party.', example_zh: '她買了一盒甜甜圈給班級派對。', tier: '進階' },
  { word: 'instant noodles', pos: 'n.', phonetic: '/ˈɪnstənt ˈnudəlz/', definition: 'dried noodles that can be cooked quickly with hot water', definition_zh: '泡麵', example_en: 'He cooked instant noodles when he got home late.', example_zh: '他很晚回家時煮了泡麵。', tier: '進階' },
  { word: 'jam', pos: 'n.', phonetic: '/dʒæm/', definition: 'a sweet food made from fruit and sugar, spread on bread', definition_zh: '果醬', example_en: 'She spread strawberry jam on her toast.', example_zh: '她在吐司上塗了草莓果醬。', tier: '進階' },
  { word: 'ketchup', pos: 'n.', phonetic: '/ˈkɛtʃəp/', definition: 'a thick red sauce made from tomatoes', definition_zh: '番茄醬', example_en: 'He put a lot of ketchup on his French fries.', example_zh: '他在薯條上加了很多番茄醬。', tier: '進階' },
  { word: 'mango', pos: 'n.', phonetic: '/ˈmæŋgoʊ/', definition: 'a sweet yellow or orange tropical fruit', definition_zh: '芒果', example_en: 'Mango ice is a popular summer dessert in Taiwan.', example_zh: '芒果冰是台灣夏天很受歡迎的甜點。', tier: '進階' },
  { word: 'napkin', pos: 'n.', phonetic: '/ˈnæpkɪn/', definition: 'a piece of cloth or paper used to clean your hands or mouth while eating', definition_zh: '餐巾紙', example_en: 'She wiped her mouth with a napkin after eating.', example_zh: '她吃完後用餐巾紙擦了嘴。', tier: '進階' },
  { word: 'nut', pos: 'n.', phonetic: '/nʌt/', definition: 'a hard-shelled seed that can be eaten', definition_zh: '堅果', example_en: 'He is allergic to nuts, so he avoids them.', example_zh: '他對堅果過敏，所以會避開它們。', tier: '進階' },
  { word: 'pan', pos: 'n.', phonetic: '/pæn/', definition: 'a flat metal container used for cooking food', definition_zh: '平底鍋', example_en: 'She heated some oil in the pan before frying the egg.', example_zh: '她在煎蛋前先在鍋裡熱了些油。', tier: '進階' },
  { word: 'papaya', pos: 'n.', phonetic: '/pəˈpaɪə/', definition: 'a sweet tropical fruit with orange flesh', definition_zh: '木瓜', example_en: 'Papaya milk is a common drink sold on the street.', example_zh: '木瓜牛奶是街上常見的飲料。', tier: '進階' },
  { word: 'pepper', pos: 'n.', phonetic: '/ˈpɛpər/', definition: 'a spice used to add a sharp taste to food', definition_zh: '胡椒；辣椒', example_en: 'He added some pepper to make the soup spicier.', example_zh: '他加了一些胡椒讓湯更辣。', tier: '進階' },
  { word: 'pineapple', pos: 'n.', phonetic: '/ˈpaɪnˌæpəl/', definition: 'a large tropical fruit with a rough skin and sweet yellow inside', definition_zh: '鳳梨', example_en: 'She bought a fresh pineapple at the fruit stand.', example_zh: '她在水果攤買了一顆新鮮的鳳梨。', tier: '進階' },
  { word: 'potato', pos: 'n.', phonetic: '/pəˈteɪtoʊ/', definition: 'a round vegetable that grows under the ground', definition_zh: '馬鈴薯', example_en: 'We had baked potatoes with our steak tonight.', example_zh: '我們今晚吃牛排配烤馬鈴薯。', tier: '進階' },
  { word: 'rare', pos: 'adj.', phonetic: '/rɛr/', definition: 'cooked for only a short time, so still red inside', definition_zh: '（肉）半生的；稀有的', example_en: 'His father likes his steak cooked rare.', example_zh: '他爸爸喜歡吃半生的牛排。', tier: '進階' },
  { word: 'salty', pos: 'adj.', phonetic: '/ˈsɔlti/', definition: 'having a taste like salt', definition_zh: '鹹的', example_en: 'This soup is too salty for me to drink.', example_zh: '這碗湯對我來說太鹹了。', tier: '進階' },
  { word: 'saucer', pos: 'n.', phonetic: '/ˈsɔsər/', definition: 'a small round plate placed under a cup', definition_zh: '茶碟；小淺盤', example_en: 'She placed the teacup on a white saucer.', example_zh: '她把茶杯放在一個白色的茶碟上。', tier: '進階' },
  { word: 'seafood', pos: 'n.', phonetic: '/ˈsifud/', definition: 'fish and other animals from the sea that people eat', definition_zh: '海鮮', example_en: 'This restaurant is famous for its fresh seafood.', example_zh: '這家餐廳以新鮮的海鮮聞名。', tier: '進階' },
  { word: 'shrimp', pos: 'n.', phonetic: '/ʃrɪmp/', definition: 'a small sea animal with a shell, often eaten as food', definition_zh: '蝦', example_en: 'We ordered fried shrimp and rice for lunch.', example_zh: '我們午餐點了炸蝦和飯。', tier: '進階' },
  { word: 'soda', pos: 'n.', phonetic: '/ˈsoʊdə/', definition: 'a sweet fizzy drink', definition_zh: '汽水', example_en: 'He drank a cold soda after the basketball game.', example_zh: '打完籃球後他喝了一杯冰汽水。', tier: '進階' },
  { word: 'soft drink', pos: 'n.', phonetic: '/sɔft drɪŋk/', definition: 'a cold sweet drink that has no alcohol', definition_zh: '軟性飲料', example_en: 'The store sells many kinds of soft drinks.', example_zh: '這家店賣很多種軟性飲料。', tier: '進階' },
  { word: 'soy sauce', pos: 'n.', phonetic: '/sɔɪ sɔs/', definition: 'a dark salty liquid used in Asian cooking', definition_zh: '醬油', example_en: 'She added soy sauce to make the noodles tastier.', example_zh: '她加了醬油讓麵更好吃。', tier: '進階' },
  { word: 'spread', pos: 'v.', phonetic: '/sprɛd/', definition: 'to put a soft substance evenly over a surface', definition_zh: '塗抹；散布', example_en: 'He spread butter on the bread before eating it.', example_zh: '他在吃麵包前先塗上奶油。', tier: '進階' },
  { word: 'supper', pos: 'n.', phonetic: '/ˈsʌpər/', definition: 'a meal eaten in the evening', definition_zh: '晚餐；晚飯', example_en: 'The family always eats supper together at seven.', example_zh: '這家人總是在七點一起吃晚餐。', tier: '進階' },
  { word: 'tangerine', pos: 'n.', phonetic: '/ˌtændʒəˈrin/', definition: 'a small sweet orange-like fruit with loose skin', definition_zh: '橘子', example_en: 'She peeled a tangerine for her little sister.', example_zh: '她幫妹妹剝了一顆橘子。', tier: '進階' },
  { word: 'teapot', pos: 'n.', phonetic: '/ˈtipɑt/', definition: 'a container with a spout, used for making and pouring tea', definition_zh: '茶壺', example_en: 'Grandma poured hot tea from the teapot.', example_zh: '奶奶從茶壺裡倒出熱茶。', tier: '進階' },
  { word: 'vinegar', pos: 'n.', phonetic: '/ˈvɪnɪgər/', definition: 'a sour liquid used to add flavor to food', definition_zh: '醋', example_en: 'He added a little vinegar to the salad.', example_zh: '他在沙拉裡加了一點醋。', tier: '進階' },
  { word: 'wine', pos: 'n.', phonetic: '/waɪn/', definition: 'an alcoholic drink made from grapes', definition_zh: '葡萄酒', example_en: 'The adults drank wine at the wedding dinner.', example_zh: '大人們在婚宴上喝了葡萄酒。', tier: '進階' },
];

async function main() {
  console.log(`準備寫入 Unit9 共 ${ENTRIES.length} 個新字...`);
  let inserted = 0, skipped = 0, failed = 0;
  for (const e of ENTRIES) {
    const { data: existing } = await supabase.from('words').select('id, tags').ilike('word', e.word).limit(1);
    if (existing && existing.length) {
      console.log(`  ⏭️  ${e.word} 已存在，跳過新增，改為補上 unit9 標籤`);
      const newTags = Array.from(new Set([...(existing[0].tags || []), 'unit9']));
      await supabase.from('words').update({ tags: newTags }).eq('id', existing[0].id);
      skipped++;
      continue;
    }
    const { error } = await supabase.from('words').insert({
      word: e.word, pos: e.pos, phonetic: e.phonetic,
      definition: e.definition, definition_zh: e.definition_zh,
      example_en: e.example_en, example_zh: e.example_zh,
      tags: ['cap_2000', 'unit9', e.tier],
      level: 1,
    });
    if (error) { console.error(`  ❌ ${e.word} 寫入失敗:`, error.message); failed++; }
    else { console.log(`  ✅ ${e.word}`); inserted++; }
  }
  console.log(`\n完成：新增 ${inserted} 筆、跳過(已存在) ${skipped} 筆、失敗 ${failed} 筆`);
}

main().catch(err => { console.error(err); process.exit(1); });
