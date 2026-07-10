/**
 * Unit 21-26 主題式分類：比對 + 標記 unitN + user_lookup/user_custom 升格 + 缺字原創生成寫入。
 * 套用 tag_unit1.js / insert_unit1_missing.js / promote_unit1_userlookup.js 的邏輯，一次跑完 6 個 Unit。
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const UNITS = {
  21: {
    name: '法律 (Law)',
    basic: `attack power right`.split(/\s+/),
    adv: `bomb contract crime crisis democracy democratic document duty effective elect election equal form freedom government gun image law lawful legal organization organize policy pollute pollution population powerful prison protect protection respondent shoot shot society system trial vote war weapon`.split(/\s+/),
    missing: [
      { word: 'power', pos: 'n.', phonetic: '/ˈpaʊɚ/', definition: 'the ability or right to control people or things', definition_zh: '權力', example_en: "The mayor doesn't have power to change this law.", example_zh: '市長沒有權力更改這條法律。', tier: '基礎' },
      { word: 'democracy', pos: 'n.', phonetic: '/dɪˈmɑkrəsi/', definition: 'a system of government in which people vote to choose their leaders', definition_zh: '民主制度；民主國家', example_en: 'Taiwan became a democracy in the 1990s.', example_zh: '台灣在1990年代成為民主國家。', tier: '進階' },
      { word: 'democratic', pos: 'adj.', phonetic: '/ˌdɛməˈkrætɪk/', definition: 'relating to democracy or supporting equal rights for people', definition_zh: '民主的', example_en: 'We live in a democratic society.', example_zh: '我們生活在民主社會中。', tier: '進階' },
      { word: 'form', pos: 'n.', phonetic: '/fɔrm/', definition: 'a type of something, or a piece of paper with blanks to fill in', definition_zh: '形式；表格', example_en: 'Please fill out this form before you leave.', example_zh: '離開前請先填寫這張表格。', tier: '進階' },
      { word: 'gun', pos: 'n.', phonetic: '/gʌn/', definition: 'a weapon that shoots bullets', definition_zh: '槍', example_en: 'The police officer carries a gun for safety.', example_zh: '這位警察為了安全攜帶槍枝。', tier: '進階' },
      { word: 'lawful', pos: 'adj.', phonetic: '/ˈlɔfəl/', definition: 'allowed by the law', definition_zh: '合法的', example_en: 'It is not lawful to drive without a license.', example_zh: '無照駕駛是不合法的。', tier: '進階' },
      { word: 'legal', pos: 'adj.', phonetic: '/ˈligəl/', definition: 'connected with the law, or allowed by law', definition_zh: '法律的；合法的', example_en: 'Smoking here is not legal for teenagers.', example_zh: '未成年人在此吸菸是不合法的。', tier: '進階' },
      { word: 'organization', pos: 'n.', phonetic: '/ˌɔrgənəˈzeʃən/', definition: 'a group of people who work together for a purpose', definition_zh: '組織', example_en: 'This organization helps homeless people find shelter.', example_zh: '這個組織幫助街友尋找住所。', tier: '進階' },
      { word: 'organize', pos: 'v.', phonetic: '/ˈɔrgəˌnaɪz/', definition: 'to plan and arrange an event or activity', definition_zh: '組織；籌辦', example_en: 'Our class will organize a charity sale next month.', example_zh: '我們班下個月將籌辦一場慈善義賣。', tier: '進階' },
      { word: 'policy', pos: 'n.', phonetic: '/ˈpɑləsi/', definition: 'a plan of action agreed by a government or company', definition_zh: '政策', example_en: 'The school has a strict policy on cell phones.', example_zh: '這所學校對手機有嚴格的政策。', tier: '進階' },
      { word: 'pollute', pos: 'v.', phonetic: '/pəˈlut/', definition: 'to make air, water, or land dirty and harmful', definition_zh: '汙染', example_en: 'Factories should not pollute the river nearby.', example_zh: '工廠不應該汙染附近的河流。', tier: '進階' },
      { word: 'pollution', pos: 'n.', phonetic: '/pəˈluʃən/', definition: 'the process of making air, water, or land dirty', definition_zh: '汙染', example_en: 'Air pollution is getting worse in big cities.', example_zh: '大城市的空氣汙染越來越嚴重。', tier: '進階' },
      { word: 'population', pos: 'n.', phonetic: '/ˌpɑpjəˈleʃən/', definition: 'the number of people living in a place', definition_zh: '人口', example_en: 'The population of this town keeps growing every year.', example_zh: '這個小鎮的人口每年都在成長。', tier: '進階' },
      { word: 'prison', pos: 'n.', phonetic: '/ˈprɪzən/', definition: 'a building where criminals are kept as punishment', definition_zh: '監獄', example_en: 'The thief was sent to prison for two years.', example_zh: '這個小偷被關進監獄兩年。', tier: '進階' },
      { word: 'protection', pos: 'n.', phonetic: '/prəˈtɛkʃən/', definition: 'the act of keeping someone or something safe from harm', definition_zh: '保護', example_en: 'This helmet gives good protection for your head.', example_zh: '這頂安全帽能提供頭部良好的保護。', tier: '進階' },
      { word: 'respondent', pos: 'n.', phonetic: '/rɪˈspɑndənt/', definition: 'a person who answers a survey or a question', definition_zh: '受訪者；答題者', example_en: 'Most respondents said they liked the new menu.', example_zh: '大多數受訪者表示他們喜歡新菜單。', tier: '進階' },
      { word: 'shoot', pos: 'v.', phonetic: '/ʃut/', definition: 'to fire a bullet or arrow from a weapon', definition_zh: '射擊', example_en: "The hunter didn't shoot any animals in the forest.", example_zh: '那位獵人沒有在森林裡射殺任何動物。', tier: '進階' },
      { word: 'society', pos: 'n.', phonetic: '/səˈsaɪəti/', definition: 'all the people who live together in a country or area', definition_zh: '社會', example_en: 'Being polite is important in our society.', example_zh: '有禮貌在我們的社會中很重要。', tier: '進階' },
      { word: 'system', pos: 'n.', phonetic: '/ˈsɪstəm/', definition: 'a set of things or ideas that work together', definition_zh: '系統；制度', example_en: 'Our school has a new grading system this year.', example_zh: '我們學校今年有新的評分制度。', tier: '進階' },
      { word: 'trial', pos: 'n.', phonetic: '/ˈtraɪəl/', definition: 'a formal process in court to decide if someone is guilty', definition_zh: '審判', example_en: 'The trial will begin next Monday morning.', example_zh: '審判將於下週一早上開始。', tier: '進階' },
      { word: 'vote', pos: 'v.', phonetic: '/voʊt/', definition: 'to choose someone or something by marking a paper or raising your hand', definition_zh: '投票', example_en: 'Everyone in class voted for the class leader.', example_zh: '班上每個人都投票選出班長。', tier: '進階' },
      { word: 'weapon', pos: 'n.', phonetic: '/ˈwɛpən/', definition: 'a tool used to fight or hurt someone', definition_zh: '武器', example_en: 'Guns and knives are both dangerous weapons.', example_zh: '槍和刀都是危險的武器。', tier: '進階' },
    ],
  },
  22: {
    name: '動物、昆蟲 (Animals & Insects)',
    basic: `animal ant bat bear bee bird bite bug butterfly cat chicken cow dog dragon duck elephant fish fox frog goat goose hen hippo horse insect kangaroo koala lion monkey mouse ox pet pig puppy rabbit rat shark snake spider tail tiger turkey turtle whale zebra`.split(/\s+/),
    adv: `bark cage cockroach crab deer dinosaur dolphin donkey eagle kitten lamb monster mosquito nest panda parrot pigeon sheep shrimp snail swallow swan wild wing wolf worm`.split(/\s+/),
    missing: [
      { word: 'cow', pos: 'n.', phonetic: '/kaʊ/', definition: 'a large farm animal kept for milk', definition_zh: '母牛', example_en: 'The farmer milks his cows every morning.', example_zh: '農夫每天早上都會擠牛奶。', tier: '基礎' },
      { word: 'duck', pos: 'n.', phonetic: '/dʌk/', definition: 'a bird that swims in ponds and has a flat beak', definition_zh: '鴨子', example_en: 'We fed bread to the ducks at the park.', example_zh: '我們在公園餵鴨子吃麵包。', tier: '基礎' },
      { word: 'goose', pos: 'n.', phonetic: '/gus/', definition: 'a large bird similar to a duck but bigger', definition_zh: '鵝', example_en: 'A goose chased us across the yard.', example_zh: '一隻鵝在院子裡追著我們跑。', tier: '基礎' },
      { word: 'hen', pos: 'n.', phonetic: '/hɛn/', definition: 'a female chicken', definition_zh: '母雞', example_en: 'The hen laid three eggs this morning.', example_zh: '這隻母雞今天早上下了三顆蛋。', tier: '基礎' },
      { word: 'hippo', pos: 'n.', phonetic: '/ˈhɪpoʊ/', definition: 'a large gray animal that lives near rivers in Africa', definition_zh: '河馬', example_en: 'The hippo spent the whole day in the water.', example_zh: '那隻河馬整天都待在水裡。', tier: '基礎' },
      { word: 'kangaroo', pos: 'n.', phonetic: '/ˌkæŋgəˈru/', definition: 'an Australian animal that jumps and carries its baby in a pouch', definition_zh: '袋鼠', example_en: 'We saw a kangaroo jumping across the field.', example_zh: '我們看見一隻袋鼠跳過田野。', tier: '基礎' },
      { word: 'lion', pos: 'n.', phonetic: '/ˈlaɪən/', definition: 'a large wild cat known as the king of animals', definition_zh: '獅子', example_en: 'The lion roared loudly in the zoo.', example_zh: '那隻獅子在動物園裡大聲吼叫。', tier: '基礎' },
      { word: 'monkey', pos: 'n.', phonetic: '/ˈmʌŋki/', definition: 'an animal with a long tail that climbs trees', definition_zh: '猴子', example_en: 'A monkey stole a banana from the tourist.', example_zh: '一隻猴子從遊客那裡偷走了一根香蕉。', tier: '基礎' },
      { word: 'ox', pos: 'n.', phonetic: '/ɑks/', definition: 'a large farm animal used for pulling heavy things', definition_zh: '公牛', example_en: 'The ox pulled the cart across the field.', example_zh: '那頭牛拉著車穿過田野。', tier: '基礎' },
      { word: 'pig', pos: 'n.', phonetic: '/pɪg/', definition: 'a farm animal with a curly tail, kept for meat', definition_zh: '豬', example_en: 'The pig rolled in the mud happily.', example_zh: '那隻豬快樂地在泥巴裡打滾。', tier: '基礎' },
      { word: 'rabbit', pos: 'n.', phonetic: '/ˈræbɪt/', definition: 'a small furry animal with long ears', definition_zh: '兔子', example_en: 'My little sister keeps a white rabbit as a pet.', example_zh: '我妹妹養了一隻白兔當寵物。', tier: '基礎' },
      { word: 'rat', pos: 'n.', phonetic: '/ræt/', definition: 'a small animal with a long tail, bigger than a mouse', definition_zh: '大老鼠', example_en: 'A rat ran across the kitchen floor at night.', example_zh: '晚上有隻老鼠跑過廚房地板。', tier: '基礎' },
      { word: 'shark', pos: 'n.', phonetic: '/ʃɑrk/', definition: 'a large dangerous fish with sharp teeth', definition_zh: '鯊魚', example_en: 'Swimmers were warned about sharks near the beach.', example_zh: '游泳的人被警告海灘附近有鯊魚。', tier: '基礎' },
      { word: 'spider', pos: 'n.', phonetic: '/ˈspaɪdɚ/', definition: 'a small creature with eight legs that spins webs', definition_zh: '蜘蛛', example_en: 'A spider built its web in the corner of my room.', example_zh: '一隻蜘蛛在我房間角落結網。', tier: '基礎' },
      { word: 'tiger', pos: 'n.', phonetic: '/ˈtaɪgɚ/', definition: 'a large wild cat with orange fur and black stripes', definition_zh: '老虎', example_en: 'The tiger walked slowly around its cage.', example_zh: '那隻老虎在籠子裡慢慢地走動。', tier: '基礎' },
      { word: 'crab', pos: 'n.', phonetic: '/kræb/', definition: 'a sea animal with a hard shell and two large claws', definition_zh: '螃蟹', example_en: 'We caught a crab on the beach last weekend.', example_zh: '上週末我們在海灘抓到一隻螃蟹。', tier: '進階' },
      { word: 'dinosaur', pos: 'n.', phonetic: '/ˈdaɪnəˌsɔr/', definition: 'a huge animal that lived on Earth millions of years ago', definition_zh: '恐龍', example_en: 'My son loves reading books about dinosaurs.', example_zh: '我兒子喜歡讀有關恐龍的書。', tier: '進階' },
      { word: 'dolphin', pos: 'n.', phonetic: '/ˈdɑlfɪn/', definition: 'a smart sea animal that swims in groups', definition_zh: '海豚', example_en: 'We watched dolphins jumping out of the water.', example_zh: '我們看著海豚躍出水面。', tier: '進階' },
      { word: 'donkey', pos: 'n.', phonetic: '/ˈdɑŋki/', definition: 'an animal similar to a small horse with long ears', definition_zh: '驢子', example_en: 'The farmer used a donkey to carry the bags.', example_zh: '那位農夫用驢子搬運袋子。', tier: '進階' },
      { word: 'kitten', pos: 'n.', phonetic: '/ˈkɪtən/', definition: 'a young cat', definition_zh: '小貓', example_en: 'The kitten slept in a small basket all day.', example_zh: '那隻小貓整天都睡在小籃子裡。', tier: '進階' },
      { word: 'lamb', pos: 'n.', phonetic: '/læm/', definition: 'a young sheep', definition_zh: '小羊', example_en: 'A little lamb followed its mother around the field.', example_zh: '一隻小羊跟著牠媽媽在田野裡走。', tier: '進階' },
      { word: 'monster', pos: 'n.', phonetic: '/ˈmɑnstɚ/', definition: 'a strange and frightening imaginary creature', definition_zh: '怪獸', example_en: 'The boy was scared of monsters under his bed.', example_zh: '那男孩害怕床底下有怪獸。', tier: '進階' },
      { word: 'panda', pos: 'n.', phonetic: '/ˈpændə/', definition: 'a large black-and-white bear from China', definition_zh: '熊貓', example_en: 'The panda ate bamboo all afternoon at the zoo.', example_zh: '那隻熊貓整個下午都在動物園吃竹子。', tier: '進階' },
      { word: 'parrot', pos: 'n.', phonetic: '/ˈpærət/', definition: 'a colorful bird that can copy human speech', definition_zh: '鸚鵡', example_en: "My grandmother's parrot can say a few words.", example_zh: '我奶奶的鸚鵡會說幾個字。', tier: '進階' },
      { word: 'pigeon', pos: 'n.', phonetic: '/ˈpɪdʒɪn/', definition: 'a common gray bird often seen in cities', definition_zh: '鴿子', example_en: 'Pigeons gathered around the man feeding them bread.', example_zh: '鴿子聚集在餵牠們麵包的男人周圍。', tier: '進階' },
      { word: 'shrimp', pos: 'n.', phonetic: '/ʃrɪmp/', definition: 'a small sea animal with a shell, eaten as food', definition_zh: '蝦子', example_en: 'We ordered fried shrimp at the restaurant.', example_zh: '我們在餐廳點了炸蝦。', tier: '進階' },
      { word: 'snail', pos: 'n.', phonetic: '/sneɪl/', definition: 'a small slow animal with a round shell on its back', definition_zh: '蝸牛', example_en: 'The snail moved slowly across the wet leaf.', example_zh: '那隻蝸牛在濕葉子上緩緩爬行。', tier: '進階' },
      { word: 'swallow', pos: 'n.', phonetic: '/ˈswɑloʊ/', definition: 'a small fast-flying bird with a forked tail', definition_zh: '燕子', example_en: 'Swallows return to this town every spring.', example_zh: '燕子每年春天都會回到這個小鎮。', tier: '進階' },
      { word: 'wild', pos: 'adj.', phonetic: '/waɪld/', definition: 'living or growing in nature, not controlled by people', definition_zh: '野生的', example_en: 'We saw wild deer while hiking in the mountains.', example_zh: '我們在爬山時看到野生的鹿。', tier: '進階' },
      { word: 'wing', pos: 'n.', phonetic: '/wɪŋ/', definition: 'the part of a bird or insect used for flying', definition_zh: '翅膀', example_en: 'The bird spread its wings and flew away.', example_zh: '那隻鳥展開翅膀飛走了。', tier: '進階' },
      { word: 'wolf', pos: 'n.', phonetic: '/wʊlf/', definition: 'a wild animal similar to a large dog that hunts in groups', definition_zh: '狼', example_en: 'A pack of wolves howled in the forest at night.', example_zh: '一群狼在晚上的森林裡嚎叫。', tier: '進階' },
      { word: 'worm', pos: 'n.', phonetic: '/wɝm/', definition: 'a small long thin animal that lives in soil', definition_zh: '蟲', example_en: 'Birds often eat worms found in the garden.', example_zh: '鳥經常吃在花園裡發現的蟲。', tier: '進階' },
    ],
  },
  23: {
    name: '地理、天氣、自然界 (Geography, Weather & Nature)',
    basic: `air bank beach blow clear cloudy cold cool dry earth flower grass hill hot island lake moon mountain mud nature plant pond pool rain rainbow rainy river rock rose sea seed shine sky snow snowman snowy spring star sun sunny tree typhoon warm weather wet wind windy`.split(/\s+/),
    adv: `area branch climate cloud coast countryside creature current degree desert dirt environment fog foggy forest freezing humid leaf lightning natural ocean plain planet root sand scene scenery scenic shore shower stone storm stormy stream temperature thunder universe valley village waterfall wood wooden woods`.split(/\s+/),
    missing: [
      { word: 'earth', pos: 'n.', phonetic: '/ɝθ/', definition: 'the planet we live on, or the soil in the ground', definition_zh: '地球；泥土', example_en: 'The Earth takes one year to go around the sun.', example_zh: '地球繞太陽一圈需要一年時間。', tier: '基礎' },
      { word: 'grass', pos: 'n.', phonetic: '/græs/', definition: 'the short green plant that covers fields and gardens', definition_zh: '草', example_en: 'The children played happily on the green grass.', example_zh: '孩子們開心地在綠草地上玩耍。', tier: '基礎' },
      { word: 'mud', pos: 'n.', phonetic: '/mʌd/', definition: 'soft wet dirt', definition_zh: '泥巴', example_en: 'His shoes were covered in mud after the rain.', example_zh: '下雨後他的鞋子沾滿了泥巴。', tier: '基礎' },
      { word: 'rainbow', pos: 'n.', phonetic: '/ˈreɪnˌboʊ/', definition: 'a colorful arc that appears in the sky after rain', definition_zh: '彩虹', example_en: 'We saw a beautiful rainbow after the storm.', example_zh: '暴風雨過後我們看見一道美麗的彩虹。', tier: '基礎' },
      { word: 'rose', pos: 'n.', phonetic: '/roʊz/', definition: 'a flower with a sweet smell, often with thorns', definition_zh: '玫瑰花', example_en: 'He gave his mom a bunch of red roses.', example_zh: '他送給媽媽一束紅玫瑰。', tier: '基礎' },
      { word: 'shine', pos: 'v.', phonetic: '/ʃaɪn/', definition: 'to give off bright light', definition_zh: '照耀；發光', example_en: 'The stars shine brightly in the night sky.', example_zh: '星星在夜空中閃耀著光芒。', tier: '基礎' },
      { word: 'snow', pos: 'n.', phonetic: '/snoʊ/', definition: 'soft white frozen drops that fall from the sky in winter', definition_zh: '雪', example_en: 'The mountains were covered with snow this morning.', example_zh: '今天早上山上覆蓋著白雪。', tier: '基礎' },
      { word: 'snowman', pos: 'n.', phonetic: '/ˈsnoʊˌmæn/', definition: 'a figure made of snow, shaped like a person', definition_zh: '雪人', example_en: 'The kids built a snowman in the front yard.', example_zh: '孩子們在前院堆了一個雪人。', tier: '基礎' },
      { word: 'sun', pos: 'n.', phonetic: '/sʌn/', definition: 'the bright star that gives light and heat to Earth', definition_zh: '太陽', example_en: 'The sun rises in the east every morning.', example_zh: '太陽每天早上從東邊升起。', tier: '基礎' },
      { word: 'creature', pos: 'n.', phonetic: '/ˈkritʃɚ/', definition: 'a living animal, especially a strange or interesting one', definition_zh: '生物', example_en: 'Scientists found a strange creature deep in the ocean.', example_zh: '科學家在深海中發現一種奇特的生物。', tier: '進階' },
      { word: 'dirt', pos: 'n.', phonetic: '/dɝt/', definition: 'loose soil or dust that makes things unclean', definition_zh: '泥土；汙垢', example_en: "The children's clothes were covered in dirt after playing outside.", example_zh: '孩子們在戶外玩耍後衣服沾滿了泥土。', tier: '進階' },
      { word: 'lightning', pos: 'n.', phonetic: '/ˈlaɪtnɪŋ/', definition: 'a sudden bright flash of light in the sky during a storm', definition_zh: '閃電', example_en: 'The lightning lit up the whole sky for a second.', example_zh: '閃電照亮了整片天空一瞬間。', tier: '進階' },
      { word: 'natural', pos: 'adj.', phonetic: '/ˈnætʃərəl/', definition: 'existing in nature, not made by people', definition_zh: '自然的', example_en: 'Fresh air is a natural gift from the mountains.', example_zh: '新鮮的空氣是山林自然的贈禮。', tier: '進階' },
      { word: 'plain', pos: 'n.', phonetic: '/pleɪn/', definition: 'a large flat area of land', definition_zh: '平原', example_en: 'Farmers grow rice on the wide plain.', example_zh: '農夫在寬闊的平原上種植稻米。', tier: '進階' },
      { word: 'root', pos: 'n.', phonetic: '/rut/', definition: 'the part of a plant that grows under the ground', definition_zh: '根', example_en: "The tree's roots spread deep under the garden.", example_zh: '這棵樹的根深深地延伸到花園底下。', tier: '進階' },
      { word: 'sand', pos: 'n.', phonetic: '/sænd/', definition: 'tiny loose grains found on beaches and deserts', definition_zh: '沙', example_en: 'The kids built a sandcastle with wet sand.', example_zh: '孩子們用濕沙堆了一座沙堡。', tier: '進階' },
      { word: 'scene', pos: 'n.', phonetic: '/sin/', definition: 'a view of a place, or a part of a movie or play', definition_zh: '景色；場景', example_en: 'The sunset scene from the hill was breathtaking.', example_zh: '從山丘看到的夕陽景色令人屏息。', tier: '進階' },
      { word: 'scenery', pos: 'n.', phonetic: '/ˈsinəri/', definition: 'the natural beauty of a place, like mountains or the sea', definition_zh: '風景', example_en: 'Visitors were amazed by the scenery in the countryside.', example_zh: '遊客們對鄉間的風景感到驚豔。', tier: '進階' },
      { word: 'scenic', pos: 'adj.', phonetic: '/ˈsinɪk/', definition: 'having beautiful natural scenery', definition_zh: '風景優美的', example_en: 'We drove along a scenic road by the coast.', example_zh: '我們沿著海岸的風景優美道路開車。', tier: '進階' },
      { word: 'shore', pos: 'n.', phonetic: '/ʃɔr/', definition: 'the land along the edge of the sea or a lake', definition_zh: '岸邊', example_en: 'We walked barefoot along the shore at sunset.', example_zh: '我們在夕陽下赤腳沿著岸邊散步。', tier: '進階' },
      { word: 'stone', pos: 'n.', phonetic: '/stoʊn/', definition: 'a small hard piece of rock', definition_zh: '石頭', example_en: 'He skipped a stone across the calm lake.', example_zh: '他把一顆石頭打水漂過平靜的湖面。', tier: '進階' },
      { word: 'stormy', pos: 'adj.', phonetic: '/ˈstɔrmi/', definition: 'having strong winds and heavy rain', definition_zh: '暴風雨的', example_en: 'The sailors stayed inside during the stormy night.', example_zh: '水手們在暴風雨的夜晚待在室內。', tier: '進階' },
      { word: 'stream', pos: 'n.', phonetic: '/strim/', definition: 'a small narrow river', definition_zh: '小溪', example_en: 'Cold water flowed quickly down the mountain stream.', example_zh: '冰涼的溪水快速地從山間流下。', tier: '進階' },
      { word: 'temperature', pos: 'n.', phonetic: '/ˈtɛmprətʃɚ/', definition: 'how hot or cold something is', definition_zh: '溫度；氣溫', example_en: 'The temperature dropped suddenly last night.', example_zh: '昨晚氣溫突然下降。', tier: '進階' },
      { word: 'universe', pos: 'n.', phonetic: '/ˈjunəˌvɝs/', definition: 'all of space, including every planet and star', definition_zh: '宇宙', example_en: "Scientists still don't know how big the universe is.", example_zh: '科學家仍不清楚宇宙有多大。', tier: '進階' },
      { word: 'valley', pos: 'n.', phonetic: '/ˈvæli/', definition: 'low land between two mountains or hills', definition_zh: '山谷', example_en: 'A small village sits quietly in the valley.', example_zh: '一個小村莊安靜地座落在山谷中。', tier: '進階' },
      { word: 'village', pos: 'n.', phonetic: '/ˈvɪlɪdʒ/', definition: 'a small group of houses in the countryside', definition_zh: '村莊', example_en: 'Her grandparents still live in a quiet village.', example_zh: '她的祖父母仍住在一個安靜的村莊。', tier: '進階' },
      { word: 'waterfall', pos: 'n.', phonetic: '/ˈwɔtɚˌfɔl/', definition: 'water falling from a high place, like a cliff', definition_zh: '瀑布', example_en: 'The hikers stopped to take photos of the waterfall.', example_zh: '登山客停下來拍瀑布的照片。', tier: '進階' },
      { word: 'wood', pos: 'n.', phonetic: '/wʊd/', definition: 'the hard material that trees are made of', definition_zh: '木頭', example_en: 'This old table is made of solid wood.', example_zh: '這張舊桌子是用實心木頭做的。', tier: '進階' },
      { word: 'wooden', pos: 'adj.', phonetic: '/ˈwʊdən/', definition: 'made of wood', definition_zh: '木製的', example_en: 'We sat on a wooden bench in the park.', example_zh: '我們坐在公園裡的一張木製長椅上。', tier: '進階' },
    ],
  },
  24: {
    name: '冠詞、代名詞、限定詞 (Articles, Pronouns & Determiners)',
    basic: `a/an all another any anybody anyone anything both each every everybody everyone everything many most nobody none nothing other part some somebody someone something such that the these this those`.split(/\s+/),
    adv: [],
    missing: [
      { word: 'a/an', pos: 'art.', phonetic: '/ə/, /æn/', definition: "used before a singular noun to mean 'one' or 'any'", definition_zh: '一（不特定的單位詞）', example_en: 'She bought a book and an umbrella.', example_zh: '她買了一本書和一把雨傘。', tier: '基礎' },
      { word: 'anybody', pos: 'pron.', phonetic: '/ˈɛniˌbɑdi/', definition: 'any person; used mostly in questions and negative sentences', definition_zh: '任何人', example_en: 'Is anybody home right now?', example_zh: '現在家裡有人嗎？', tier: '基礎' },
      { word: 'somebody', pos: 'pron.', phonetic: '/ˈsʌmˌbɑdi/', definition: 'some person, not known or named', definition_zh: '某人', example_en: 'Somebody left a jacket on the chair.', example_zh: '有人把一件外套留在椅子上了。', tier: '基礎' },
      { word: 'those', pos: 'determiner', phonetic: '/ðoʊz/', definition: 'used to point to people or things that are farther away', definition_zh: '那些', example_en: 'Those shoes on the shelf are mine.', example_zh: '架上那些鞋子是我的。', tier: '基礎' },
    ],
  },
  25: {
    name: '疑問詞、感嘆詞 (Wh-words & Interjections)',
    basic: `good-bye hello hey hi how what when where whether which who whose why`.split(/\s+/),
    adv: `whatever while whom`.split(/\s+/),
    missing: [
      { word: 'good-bye', pos: 'interj.', phonetic: '/ɡʊdˈbaɪ/', definition: 'a word used when leaving someone', definition_zh: '再見', example_en: 'We waved and said good-bye at the station.', example_zh: '我們在車站揮手道別。', tier: '基礎' },
      { word: 'hi', pos: 'interj.', phonetic: '/haɪ/', definition: 'a friendly, casual greeting', definition_zh: '嗨', example_en: 'Hi, nice to see you again!', example_zh: '嗨，很高興再次見到你！', tier: '基礎' },
      { word: 'whatever', pos: 'pron.', phonetic: '/wʌtˈɛvɚ/', definition: 'anything at all, no matter what', definition_zh: '無論什麼', example_en: 'You can choose whatever color you like.', example_zh: '你可以選擇你喜歡的任何顏色。', tier: '進階' },
    ],
  },
  26: {
    name: '連接詞 (Conjunctions)',
    basic: `and as because but however if or since than that`.split(/\s+/),
    adv: `neither...nor though`.split(/\s+/),
    missing: [
      { word: 'and', pos: 'conj.', phonetic: '/ænd/', definition: 'used to connect words or ideas that go together', definition_zh: '和；而且', example_en: 'I like apples and oranges.', example_zh: '我喜歡蘋果和柳橙。', tier: '基礎' },
      { word: 'but', pos: 'conj.', phonetic: '/bʌt/', definition: 'used to show a difference or contrast between two ideas', definition_zh: '但是', example_en: 'The test was hard, but I passed it.', example_zh: '考試很難，但我通過了。', tier: '基礎' },
      { word: 'or', pos: 'conj.', phonetic: '/ɔr/', definition: 'used to show a choice between two or more things', definition_zh: '或者', example_en: 'Would you like tea or coffee?', example_zh: '你想要茶還是咖啡？', tier: '基礎' },
      { word: 'neither...nor', pos: 'conj.', phonetic: '/ˈniðɚ/ /nɔr/', definition: 'used to say that two things are both not true or not chosen', definition_zh: '既不…也不…', example_en: 'Neither my brother nor I like spicy food.', example_zh: '我哥哥和我都不喜歡辣的食物。', tier: '進階' },
    ],
  },
};

async function processUnit(num, unit) {
  const unitTag = `unit${num}`;
  console.log(`\n========== 處理 Unit ${num}: ${unit.name} ==========`);
  const all = [...unit.basic.map(w => ({ word: w, tier: '基礎' })), ...unit.adv.map(w => ({ word: w, tier: '進階' }))];
  console.log(`書上共 ${all.length} 字`);

  const matched = [];
  const missingWords = new Set();
  for (const { word, tier } of all) {
    const { data, error } = await supabase.from('words').select('id, word, tags').ilike('word', word).limit(1);
    if (error) { console.error('查詢失敗:', word, error.message); continue; }
    if (data && data.length) matched.push({ ...data[0], tier });
    else missingWords.add(word.toLowerCase());
  }

  // 步驟3：已存在的字加上 unitN 標籤 + user_lookup/user_custom 升格
  let tagged = 0, promoted = 0;
  for (const m of matched) {
    let tags = Array.from(new Set([...(m.tags || []), unitTag]));
    if ((m.tags || []).includes('user_lookup') || (m.tags || []).includes('user_custom')) {
      tags = Array.from(new Set(tags.filter(t => t !== 'user_lookup' && t !== 'user_custom').concat('cap_2000')));
      promoted++;
    }
    const changed = tags.length !== (m.tags || []).length || !(m.tags || []).includes(unitTag);
    if (!changed) continue;
    const { error } = await supabase.from('words').update({ tags }).eq('id', m.id);
    if (error) console.error('更新失敗:', m.word, error.message);
    else tagged++;
  }
  console.log(`已為 ${tagged} 個既有字加上 ${unitTag} 標籤（含升格 ${promoted} 個）`);

  // 步驟4：缺少的字，原創生成寫入
  let inserted = 0, skipped = 0, failed = 0;
  for (const e of unit.missing) {
    const { data: existing } = await supabase.from('words').select('id, tags').ilike('word', e.word).limit(1);
    if (existing && existing.length) {
      console.log(`  ⏭️  ${e.word} 已存在（可能剛被其他 unit 寫入），改為補上 ${unitTag} 標籤`);
      const newTags = Array.from(new Set([...(existing[0].tags || []), unitTag]));
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
      tags: ['cap_2000', unitTag, e.tier],
      level: 1,
    });
    if (error) { console.error(`  ❌ ${e.word} 寫入失敗:`, error.message); failed++; }
    else { console.log(`  ✅ ${e.word}`); inserted++; }
  }
  console.log(`Unit ${num} 缺字處理完成：新增 ${inserted}、跳過(已存在) ${skipped}、失敗 ${failed}`);

  // 步驟5：驗證
  const { data: verify, error: vErr } = await supabase.from('words').select('id').contains('tags', [unitTag]);
  if (vErr) { console.error('驗證查詢失敗:', vErr.message); return; }
  const ok = verify.length === all.length;
  console.log(`驗證：書上 ${all.length} 字 vs 資料庫 ${unitTag} 標籤 ${verify.length} 字 → ${ok ? '✅ 一致' : '❌ 不一致'}`);
}

async function main() {
  for (const [num, unit] of Object.entries(UNITS)) {
    await processUnit(num, unit);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
