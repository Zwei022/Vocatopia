/**
 * 補齊 Unit 12（交通工具、場所、位置）在 words 表裡缺少的 49 個字，原創生成內容。
 */
require('dotenv').config({ path: 'C:\\Users\\qaz10\\Desktop\\claude agent\\vocatopia\\.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const ENTRIES = [
  { word: 'bus stop', pos: 'n.', phonetic: '/bʌs stɑp/', definition: 'a place where a bus stops for people to get on or off', definition_zh: '公車站', example_en: 'She waited at the bus stop for ten minutes.', example_zh: '她在公車站等了十分鐘。', tier: '基礎' },
  { word: 'cross', pos: 'v.', phonetic: '/krɔs/', definition: 'to go from one side of something to the other', definition_zh: '穿越；橫越', example_en: 'Look both ways before you cross the street.', example_zh: '過馬路前要看看兩邊。', tier: '基礎' },
  { word: 'fast food restaurant', pos: 'n.', phonetic: '/fæst fud ˈrɛstərənt/', definition: 'a restaurant that serves food quickly at a low price', definition_zh: '速食餐廳', example_en: 'They met at a fast food restaurant after school.', example_zh: '他們放學後在一家速食餐廳碰面。', tier: '基礎' },
  { word: 'fire station', pos: 'n.', phonetic: '/faɪər ˈsteɪʃən/', definition: 'a building where fire trucks and firefighters are kept', definition_zh: '消防局', example_en: 'The fire station is only two blocks from our school.', example_zh: '消防局離我們學校只有兩個街區。', tier: '基礎' },
  { word: 'flower shop', pos: 'n.', phonetic: '/ˈflaʊər ʃɑp/', definition: 'a shop that sells flowers', definition_zh: '花店', example_en: 'He bought roses for his mom at the flower shop.', example_zh: '他在花店買了玫瑰花給媽媽。', tier: '基礎' },
  { word: 'fly', pos: 'v.', phonetic: '/flaɪ/', definition: 'to travel through the air, especially in a plane', definition_zh: '飛；搭飛機', example_en: 'We will fly to Japan for summer vacation.', example_zh: '我們暑假要搭飛機去日本。', tier: '基礎' },
  { word: 'gas', pos: 'n.', phonetic: '/gæs/', definition: 'fuel used to make cars run', definition_zh: '汽油；瓦斯', example_en: 'Dad stopped the car to buy some gas.', example_zh: '爸爸停下車去加油。', tier: '基礎' },
  { word: 'here', pos: 'adv.', phonetic: '/hɪr/', definition: 'in or at this place', definition_zh: '在這裡', example_en: 'Please wait here until the bus comes.', example_zh: '請在這裡等公車來。', tier: '基礎' },
  { word: 'motorcycle', pos: 'n.', phonetic: '/ˈmoʊtərˌsaɪkəl/', definition: 'a two-wheeled vehicle with an engine', definition_zh: '摩托車', example_en: 'His uncle rides a motorcycle to work every day.', example_zh: '他叔叔每天騎摩托車上班。', tier: '基礎' },
  { word: 'movie theater', pos: 'n.', phonetic: '/ˈmuvi ˈθiətər/', definition: 'a building where people watch films', definition_zh: '電影院', example_en: 'We went to the movie theater to watch a new film.', example_zh: '我們去電影院看了一部新電影。', tier: '基礎' },
  { word: 'MRT', pos: 'n.', phonetic: '/ˌɛm ɑr ˈti/', definition: 'a fast train system used for public transportation in a city', definition_zh: '捷運', example_en: 'She takes the MRT to school every morning.', example_zh: '她每天早上搭捷運去上學。', tier: '基礎' },
  { word: 'museum', pos: 'n.', phonetic: '/mjuˈziəm/', definition: 'a building where interesting or old objects are shown to the public', definition_zh: '博物館', example_en: 'Our class visited a science museum last Friday.', example_zh: '我們班上星期五參觀了一間科學博物館。', tier: '基礎' },
  { word: 'police station', pos: 'n.', phonetic: '/pəˈlis ˈsteɪʃən/', definition: 'a building where police officers work', definition_zh: '警察局', example_en: 'He asked for directions at the police station.', example_zh: '他在警察局問了路。', tier: '基礎' },
  { word: 'railway', pos: 'n.', phonetic: '/ˈreɪlweɪ/', definition: 'a track that trains travel on', definition_zh: '鐵路', example_en: 'The old railway runs along the coast.', example_zh: '這條舊鐵路沿著海岸延伸。', tier: '基礎' },
  { word: 'restroom', pos: 'n.', phonetic: '/ˈrɛstrum/', definition: 'a room with a toilet in a public building', definition_zh: '洗手間', example_en: 'The restroom is at the end of the hallway.', example_zh: '洗手間在走廊的盡頭。', tier: '基礎' },
  { word: 'scooter', pos: 'n.', phonetic: '/ˈskutər/', definition: 'a small motor vehicle with two wheels', definition_zh: '機車；速克達', example_en: 'She rides her scooter to the night market.', example_zh: '她騎機車去夜市。', tier: '基礎' },
  { word: 'ship', pos: 'n.', phonetic: '/ʃɪp/', definition: 'a large boat used for traveling on the sea', definition_zh: '船', example_en: 'The ship sailed slowly out of the harbor.', example_zh: '那艘船緩緩駛出港口。', tier: '基礎' },
  { word: 'south', pos: 'n.', phonetic: '/saʊθ/', definition: 'the direction that is opposite to north', definition_zh: '南方', example_en: 'Our summer house is in the south of Taiwan.', example_zh: '我們的避暑小屋在台灣南部。', tier: '基礎' },
  { word: 'train station', pos: 'n.', phonetic: '/treɪn ˈsteɪʃən/', definition: 'a place where trains stop for people to get on or off', definition_zh: '火車站', example_en: 'We will meet in front of the train station.', example_zh: '我們會在火車站前面碰面。', tier: '基礎' },
  { word: 'west', pos: 'n.', phonetic: '/wɛst/', definition: 'the direction where the sun sets', definition_zh: '西方', example_en: 'The sun sets in the west every evening.', example_zh: '太陽每天傍晚在西方落下。', tier: '基礎' },
  { word: 'airline', pos: 'n.', phonetic: '/ˈɛrlaɪn/', definition: 'a company that owns and flies airplanes', definition_zh: '航空公司', example_en: 'We booked our tickets with a famous airline.', example_zh: '我們用一家知名的航空公司訂了機票。', tier: '進階' },
  { word: 'convenience store', pos: 'n.', phonetic: '/kənˈvinjəns stɔr/', definition: 'a small shop that sells daily items and is often open late', definition_zh: '便利商店', example_en: 'He bought a drink at the convenience store nearby.', example_zh: '他在附近的便利商店買了一杯飲料。', tier: '進階' },
  { word: 'culture center', pos: 'n.', phonetic: '/ˈkʌltʃər ˈsɛntər/', definition: 'a building where art shows and cultural events are held', definition_zh: '文化中心', example_en: 'They watched a painting show at the culture center.', example_zh: '他們在文化中心看了畫展。', tier: '進階' },
  { word: 'direct', pos: 'adj.', phonetic: '/dəˈrɛkt/', definition: 'going straight to a place without stopping', definition_zh: '直接的', example_en: 'We took a direct flight to save time.', example_zh: '我們搭了直飛班機以節省時間。', tier: '進階' },
  { word: 'direction', pos: 'n.', phonetic: '/dəˈrɛkʃən/', definition: 'the way that someone or something is moving or facing', definition_zh: '方向', example_en: 'He asked a stranger for directions to the station.', example_zh: '他向一位陌生人問了去車站的方向。', tier: '進階' },
  { word: 'distance', pos: 'n.', phonetic: '/ˈdɪstəns/', definition: 'the amount of space between two places', definition_zh: '距離', example_en: 'The distance between the two cities is short.', example_zh: '這兩座城市之間的距離很短。', tier: '進階' },
  { word: 'downtown', pos: 'adv.', phonetic: '/ˌdaʊnˈtaʊn/', definition: 'in or toward the center of a city', definition_zh: '在市中心；到市中心', example_en: 'We went downtown to watch a concert.', example_zh: '我們去市中心看演唱會。', tier: '進階' },
  { word: 'eastern', pos: 'adj.', phonetic: '/ˈistərn/', definition: 'in or from the east', definition_zh: '東方的；東部的', example_en: 'They live on the eastern side of the island.', example_zh: '他們住在島的東邊。', tier: '進階' },
  { word: 'flat tire', pos: 'n.', phonetic: '/flæt taɪər/', definition: 'a tire that has lost its air, often because of damage', definition_zh: '爆胎；扁掉的輪胎', example_en: 'The car stopped suddenly because of a flat tire.', example_zh: '車子因為爆胎突然停了下來。', tier: '進階' },
  { word: 'flight', pos: 'n.', phonetic: '/flaɪt/', definition: 'a journey made by airplane', definition_zh: '班機；飛行', example_en: 'Our flight to Japan leaves at nine tonight.', example_zh: '我們今晚九點的班機飛往日本。', tier: '進階' },
  { word: 'forward', pos: 'adv.', phonetic: '/ˈfɔrwərd/', definition: 'toward the front or in the direction you are facing', definition_zh: '向前', example_en: 'The soldiers moved forward slowly in the dark.', example_zh: '士兵們在黑暗中緩緩向前移動。', tier: '進階' },
  { word: 'helicopter', pos: 'n.', phonetic: '/ˈhɛlɪˌkɑptər/', definition: 'an aircraft with large blades on top that can fly straight up', definition_zh: '直升機', example_en: 'A helicopter flew over the mountain to help the hikers.', example_zh: '一架直升機飛過山區去幫助登山客。', tier: '進階' },
  { word: 'highway', pos: 'n.', phonetic: '/ˈhaɪweɪ/', definition: 'a wide road used for fast travel between cities', definition_zh: '公路', example_en: 'We drove on the highway to visit our grandparents.', example_zh: '我們開上公路去看望祖父母。', tier: '進階' },
  { word: 'jeep', pos: 'n.', phonetic: '/dʒip/', definition: 'a strong vehicle used for driving on rough ground', definition_zh: '吉普車', example_en: 'They rented a jeep to drive around the countryside.', example_zh: '他們租了一台吉普車在鄉間遊玩。', tier: '進階' },
  { word: 'mall', pos: 'n.', phonetic: '/mɔl/', definition: 'a large building with many shops inside', definition_zh: '購物中心', example_en: 'We spent the whole afternoon at the mall.', example_zh: '我們整個下午都待在購物中心。', tier: '進階' },
  { word: "men's room", pos: 'n.', phonetic: '/mɛnz rum/', definition: 'a public toilet for men', definition_zh: '男廁', example_en: "The men's room is next to the elevator.", example_zh: '男廁在電梯旁邊。', tier: '進階' },
  { word: 'northern', pos: 'adj.', phonetic: '/ˈnɔrðərn/', definition: 'in or from the north', definition_zh: '北方的；北部的', example_en: 'It snows in the northern part of the country.', example_zh: '這個國家的北部會下雪。', tier: '進階' },
  { word: 'overpass', pos: 'n.', phonetic: '/ˈoʊvərpæs/', definition: 'a road or path built above another road', definition_zh: '天橋；高架道', example_en: 'We used the overpass to cross the busy highway.', example_zh: '我們走天橋越過那條繁忙的公路。', tier: '進階' },
  { word: 'platform', pos: 'n.', phonetic: '/ˈplætˌfɔrm/', definition: 'a raised area where people wait for a train', definition_zh: '月台', example_en: 'She waited on the platform for the next train.', example_zh: '她在月台上等下一班火車。', tier: '進階' },
  { word: 'pool', pos: 'n.', phonetic: '/pul/', definition: 'a large container of water for swimming', definition_zh: '游泳池', example_en: 'The children swam in the pool all afternoon.', example_zh: '孩子們整個下午都在游泳池裡游泳。', tier: '進階' },
  { word: 'position', pos: 'n.', phonetic: '/pəˈzɪʃən/', definition: 'the place where someone or something is', definition_zh: '位置', example_en: 'He checked the map to find his position.', example_zh: '他查看地圖確認自己的位置。', tier: '進階' },
  { word: 'post office', pos: 'n.', phonetic: '/poʊst ˈɔfɪs/', definition: 'a place where letters and packages are sent', definition_zh: '郵局', example_en: 'She mailed the letter at the post office.', example_zh: '她在郵局寄了那封信。', tier: '進階' },
  { word: 'pump', pos: 'n.', phonetic: '/pʌmp/', definition: 'a machine used to move liquid or air', definition_zh: '幫浦；加油機', example_en: 'He used a pump to fill the bike tire with air.', example_zh: '他用打氣筒幫腳踏車輪胎打氣。', tier: '進階' },
  { word: 'rush', pos: 'v.', phonetic: '/rʌʃ/', definition: 'to move or do something very quickly', definition_zh: '匆忙；急速前進', example_en: 'She had to rush to catch the last bus.', example_zh: '她必須匆忙趕上最後一班公車。', tier: '進階' },
  { word: 'southern', pos: 'adj.', phonetic: '/ˈsʌðərn/', definition: 'in or from the south', definition_zh: '南方的；南部的', example_en: 'The weather is warmer in the southern city.', example_zh: '南部城市的天氣比較溫暖。', tier: '進階' },
  { word: 'speed', pos: 'n.', phonetic: '/spid/', definition: 'how fast something moves', definition_zh: '速度', example_en: 'The train traveled at a very high speed.', example_zh: '那輛火車以非常快的速度行駛。', tier: '進階' },
  { word: 'stationery store', pos: 'n.', phonetic: '/ˈsteɪʃənˌɛri stɔr/', definition: 'a shop that sells paper, pens, and school supplies', definition_zh: '文具店', example_en: 'She bought new pencils at the stationery store.', example_zh: '她在文具店買了新的鉛筆。', tier: '進階' },
  { word: 'subway', pos: 'n.', phonetic: '/ˈsʌbweɪ/', definition: 'a train system that runs under a city', definition_zh: '地下鐵', example_en: 'He takes the subway to work every morning.', example_zh: '他每天早上搭地下鐵上班。', tier: '進階' },
  { word: 'tank', pos: 'n.', phonetic: '/tæŋk/', definition: 'a large container for holding liquid or gas', definition_zh: '油箱；儲水槽', example_en: 'Dad filled the gas tank before the long trip.', example_zh: '爸爸在長途旅行前把油箱加滿。', tier: '進階' },
  { word: 'tower', pos: 'n.', phonetic: '/ˈtaʊər/', definition: 'a tall narrow building or part of a building', definition_zh: '塔；高樓', example_en: 'Tourists took photos in front of the tall tower.', example_zh: '遊客在那座高塔前拍照。', tier: '進階' },
  { word: 'tunnel', pos: 'n.', phonetic: '/ˈtʌnəl/', definition: 'a long passage built under the ground or through a mountain', definition_zh: '隧道', example_en: 'The car drove through a long tunnel in the mountain.', example_zh: '那輛車開過山中一條長長的隧道。', tier: '進階' },
  { word: 'underpass', pos: 'n.', phonetic: '/ˈʌndərpæs/', definition: 'a road or path built under another road', definition_zh: '地下道', example_en: 'We walked through the underpass to reach the station.', example_zh: '我們走地下道到達車站。', tier: '進階' },
  { word: 'village', pos: 'n.', phonetic: '/ˈvɪlɪdʒ/', definition: 'a small group of houses in the countryside', definition_zh: '村莊', example_en: 'His grandparents live in a quiet village.', example_zh: '他的祖父母住在一個安靜的村莊裡。', tier: '進階' },
  { word: 'western', pos: 'adj.', phonetic: '/ˈwɛstərn/', definition: 'in or from the west', definition_zh: '西方的；西部的', example_en: 'They visited the western coast during vacation.', example_zh: '他們在假期參觀了西海岸。', tier: '進階' },
  { word: 'wheel', pos: 'n.', phonetic: '/wil/', definition: 'a round object that turns to allow a vehicle to move', definition_zh: '輪子', example_en: 'One wheel of his bicycle was broken.', example_zh: '他腳踏車的一個輪子壞了。', tier: '進階' },
  { word: "women's room", pos: 'n.', phonetic: '/ˈwɪmɪnz rum/', definition: 'a public toilet for women', definition_zh: '女廁', example_en: "She waited outside the women's room for her friend.", example_zh: '她在女廁外面等朋友。', tier: '進階' },
];

async function main() {
  console.log(`準備寫入 Unit12 共 ${ENTRIES.length} 個新字...`);
  let inserted = 0, skipped = 0, failed = 0;
  for (const e of ENTRIES) {
    const { data: existing } = await supabase.from('words').select('id, tags').ilike('word', e.word).limit(1);
    if (existing && existing.length) {
      console.log(`  ⏭️  ${e.word} 已存在，跳過新增，改為補上 unit12 標籤`);
      const newTags = Array.from(new Set([...(existing[0].tags || []), 'unit12']));
      await supabase.from('words').update({ tags: newTags }).eq('id', existing[0].id);
      skipped++;
      continue;
    }
    const { error } = await supabase.from('words').insert({
      word: e.word, pos: e.pos, phonetic: e.phonetic,
      definition: e.definition, definition_zh: e.definition_zh,
      example_en: e.example_en, example_zh: e.example_zh,
      tags: ['cap_2000', 'unit12', e.tier],
      level: 1,
    });
    if (error) { console.error(`  ❌ ${e.word} 寫入失敗:`, error.message); failed++; }
    else { console.log(`  ✅ ${e.word}`); inserted++; }
  }
  console.log(`\n完成：新增 ${inserted} 筆、跳過(已存在) ${skipped} 筆、失敗 ${failed} 筆`);
}

main().catch(err => { console.error(err); process.exit(1); });
