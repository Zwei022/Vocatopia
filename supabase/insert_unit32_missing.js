/**
 * 補齊 Unit 32（其他動詞 Other Verbs）在 words 表裡缺少的 67 個字。
 * 內容依 cambridge-style-examples 技能規範原創生成（非抄書），
 * 欄位對齊現有 words 表格式，並加上 tags: ['cap_2000','unit32', 基礎/進階]。
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const ENTRIES = [
  // ── 基礎學習篇 ──
  { word: 'offer', pos: 'v.', phonetic: '/ˈɔfɚ/', definition: 'to say you are willing to give or do something for someone', definition_zh: '提供；願意給予', example_en: 'He offered to carry my heavy bag home.', example_zh: '他主動提出要幫我把沉重的袋子提回家。', tier: '基礎' },
  { word: 'pass', pos: 'v.', phonetic: '/pæs/', definition: "to move something from your hand to another person's hand", definition_zh: '傳遞；經過；通過', example_en: 'Could you pass me the ketchup, please?', example_zh: '可以請你把番茄醬遞給我嗎？', tier: '基礎' },
  { word: 'write', pos: 'v.', phonetic: '/raɪt/', definition: 'to make letters or words on paper using a pen', definition_zh: '寫；書寫', example_en: 'She wrote a thank-you card to her teacher.', example_zh: '她寫了一張感謝卡給老師。', tier: '基礎' },
  { word: 'have', pos: 'v.', phonetic: '/hæv/', definition: 'to own, hold, or possess something', definition_zh: '有；擁有；要', example_en: 'We have two dogs and a cat at home.', example_zh: '我們家裡養了兩隻狗和一隻貓。', tier: '基礎' },
  { word: 'let', pos: 'v.', phonetic: '/lɛt/', definition: 'to allow someone to do something', definition_zh: '讓；允許', example_en: 'My parents let me stay up late on Fridays.', example_zh: '我爸媽讓我星期五可以晚點睡。', tier: '基礎' },
  { word: 'dig', pos: 'v.', phonetic: '/dɪg/', definition: 'to make a hole in the ground using a tool or your hands', definition_zh: '挖；挖掘', example_en: 'The children dug a big hole on the beach.', example_zh: '孩子們在沙灘上挖了一個大洞。', tier: '基礎' },
  { word: 'lead', pos: 'v.', phonetic: '/lid/', definition: 'to go in front of a group to show them the way', definition_zh: '帶領；領導', example_en: 'The captain led the team onto the field.', example_zh: '隊長帶領隊伍走上球場。', tier: '基礎' },
  { word: 'list', pos: 'v.', phonetic: '/lɪst/', definition: 'to write a group of names or things one after another', definition_zh: '列出；列表', example_en: 'Please list the items you want to buy.', example_zh: '請列出你想買的東西。', tier: '基礎' },
  { word: 'pray', pos: 'v.', phonetic: '/preɪ/', definition: 'to speak to God or a god, usually asking for help', definition_zh: '禱告；祈求', example_en: 'They prayed for good weather on the trip.', example_zh: '他們為旅行的好天氣祈禱。', tier: '基礎' },
  { word: 'roll', pos: 'v.', phonetic: '/rol/', definition: 'to move by turning over and over, or to wrap something around itself', definition_zh: '滾動；捲起', example_en: 'The ball rolled under the table during class.', example_zh: '那顆球在上課時滾到桌子底下。', tier: '基礎' },
  { word: 'shine', pos: 'v.', phonetic: '/ʃaɪn/', definition: 'to give off bright light', definition_zh: '發亮；照耀', example_en: 'The sun shone brightly through the classroom window.', example_zh: '陽光透過教室窗戶明亮地照射進來。', tier: '基礎' },
  { word: 'smoke', pos: 'v.', phonetic: '/smok/', definition: 'to breathe in smoke from a burning cigarette', definition_zh: '抽菸；冒煙', example_en: 'It is illegal for teenagers to smoke cigarettes.', example_zh: '青少年抽菸是違法的。', tier: '基礎' },
  // ── 進階學習篇 ──
  { word: 'require', pos: 'v.', phonetic: '/rɪˈkwaɪr/', definition: 'to need something in order to do or complete a task', definition_zh: '需要；要求', example_en: 'This math problem requires careful thinking.', example_zh: '這道數學題需要仔細思考。', tier: '進階' },
  { word: 'determine', pos: 'v.', phonetic: '/dɪˈtɜrmɪn/', definition: 'to decide something firmly after thinking about it', definition_zh: '決定；下定決心', example_en: 'She determined to finish the marathon this year.', example_zh: '她下定決心今年要完成馬拉松。', tier: '進階' },
  { word: 'pause', pos: 'v.', phonetic: '/pɔz/', definition: 'to stop doing something for a short time', definition_zh: '暫停；停頓', example_en: 'He paused the movie to answer the phone.', example_zh: '他暫停電影去接電話。', tier: '進階' },
  { word: 'propose', pos: 'v.', phonetic: '/prəˈpoz/', definition: 'to suggest a plan or idea for others to consider', definition_zh: '提議；打算', example_en: 'My classmate proposed a fun idea for the trip.', example_zh: '我同學提出了一個有趣的旅行點子。', tier: '進階' },
  { word: 'regret', pos: 'v.', phonetic: '/rɪˈgrɛt/', definition: 'to feel sorry about something you did or did not do', definition_zh: '後悔；遺憾', example_en: 'He regretted not studying harder for the exam.', example_zh: '他後悔沒有更努力準備考試。', tier: '進階' },
  { word: 'brighten', pos: 'v.', phonetic: '/ˈbraɪtn/', definition: 'to become brighter or to make something brighter', definition_zh: '（使）變亮；生色', example_en: 'New curtains brightened the whole living room.', example_zh: '新窗簾讓整間客廳變得明亮許多。', tier: '進階' },
  { word: 'darken', pos: 'v.', phonetic: '/ˈdɑrkən/', definition: 'to become darker or to make something darker', definition_zh: '（使）變暗', example_en: 'The sky darkened quickly before the storm arrived.', example_zh: '暴風雨來臨前天空迅速變暗。', tier: '進階' },
  { word: 'deepen', pos: 'v.', phonetic: '/ˈdipən/', definition: 'to become deeper or more serious', definition_zh: '（使）加深', example_en: 'Their friendship deepened after the summer camp.', example_zh: '他們的友誼在夏令營後加深了。', tier: '進階' },
  { word: 'detect', pos: 'v.', phonetic: '/dɪˈtɛkt/', definition: 'to discover or notice something that is not easy to see', definition_zh: '偵測；發覺', example_en: 'The machine can detect smoke in seconds.', example_zh: '這台機器能在幾秒內偵測到煙霧。', tier: '進階' },
  { word: 'dramatize', pos: 'v.', phonetic: '/ˈdræməˌtaɪz/', definition: 'to make a story more exciting than it really is, or turn it into a play', definition_zh: '（使）戲劇化；改編成劇本', example_en: 'The teacher dramatized the story to make it fun.', example_zh: '老師把這個故事戲劇化讓它變得有趣。', tier: '進階' },
  { word: 'freeze', pos: 'v.', phonetic: '/friz/', definition: 'to become hard and solid because of very cold temperature', definition_zh: '結冰；凍結', example_en: 'The pond froze completely during the cold winter.', example_zh: '那座池塘在寒冬中完全結冰了。', tier: '進階' },
  { word: 'generalize', pos: 'v.', phonetic: '/ˈdʒɛnərəˌlaɪz/', definition: 'to make a general statement based on only a few examples', definition_zh: '概括；一概而論', example_en: "You shouldn't generalize about a whole class.", example_zh: '你不應該對整個班級一概而論。', tier: '進階' },
  { word: 'generate', pos: 'v.', phonetic: '/ˈdʒɛnəˌreɪt/', definition: 'to produce or create something, such as energy or ideas', definition_zh: '形成；產生', example_en: 'Wind turbines generate clean electricity for the town.', example_zh: '風力發電機為小鎮產生乾淨的電力。', tier: '進階' },
  { word: 'govern', pos: 'v.', phonetic: '/ˈgʌvɚn/', definition: 'to officially control a country or organization', definition_zh: '統治；管理', example_en: 'A fair leader should govern with honesty.', example_zh: '公正的領導人應該誠實地治理。', tier: '進階' },
  { word: 'guide', pos: 'v.', phonetic: '/gaɪd/', definition: 'to show someone the way or help them do something', definition_zh: '帶領；引導', example_en: 'The librarian guided us to the history section.', example_zh: '圖書館員帶領我們到歷史區。', tier: '進階' },
  { word: 'ignore', pos: 'v.', phonetic: '/ɪgˈnɔr/', definition: 'to pay no attention to someone or something on purpose', definition_zh: '忽視；不理會', example_en: 'She ignored the noise and kept reading her book.', example_zh: '她不理會噪音，繼續看她的書。', tier: '進階' },
  { word: 'indicate', pos: 'v.', phonetic: '/ˈɪndəˌkeɪt/', definition: 'to show or point out something clearly', definition_zh: '指出；表示', example_en: 'The red light indicates that the machine is broken.', example_zh: '紅燈表示這台機器故障了。', tier: '進階' },
  { word: 'injure', pos: 'v.', phonetic: '/ˈɪndʒɚ/', definition: 'to hurt part of your body', definition_zh: '使受傷', example_en: 'He injured his ankle during the basketball game.', example_zh: '他在籃球比賽中弄傷了腳踝。', tier: '進階' },
  { word: 'insist', pos: 'v.', phonetic: '/ɪnˈsɪst/', definition: 'to say firmly that something must happen', definition_zh: '堅持', example_en: 'My mom insisted that I wear a jacket today.', example_zh: '我媽堅持要我今天穿外套。', tier: '進階' },
  { word: 'interrupt', pos: 'v.', phonetic: '/ˌɪntəˈrʌpt/', definition: 'to stop someone while they are speaking or doing something', definition_zh: '打斷', example_en: "Please don't interrupt me while I'm talking.", example_zh: '我說話時請不要打斷我。', tier: '進階' },
  { word: 'invent', pos: 'v.', phonetic: '/ɪnˈvɛnt/', definition: 'to design or create something that did not exist before', definition_zh: '發明', example_en: 'Who invented the first computer in history?', example_zh: '歷史上是誰發明了第一台電腦？', tier: '進階' },
  { word: 'investigate', pos: 'v.', phonetic: '/ɪnˈvɛstəˌgeɪt/', definition: 'to try to find out the truth about something carefully', definition_zh: '調查', example_en: 'The teacher investigated who broke the window.', example_zh: '老師調查了是誰打破窗戶。', tier: '進階' },
  { word: 'judge', pos: 'v.', phonetic: '/dʒʌdʒ/', definition: 'to form an opinion about someone or something', definition_zh: '評斷；判斷', example_en: "Don't judge people before you know their story.", example_zh: '別在了解別人的故事前就評斷他們。', tier: '進階' },
  { word: 'limit', pos: 'v.', phonetic: '/ˈlɪmɪt/', definition: 'to control the amount or size of something', definition_zh: '限制', example_en: "Parents should limit their kids' screen time.", example_zh: '父母應該限制孩子使用螢幕的時間。', tier: '進階' },
  { word: 'maintain', pos: 'v.', phonetic: '/meɪnˈteɪn/', definition: 'to keep something in good condition or at the same level', definition_zh: '維持；保養', example_en: 'You need to exercise daily to maintain your health.', example_zh: '你需要每天運動來維持健康。', tier: '進階' },
  { word: 'manage', pos: 'v.', phonetic: '/ˈmænɪdʒ/', definition: 'to be in charge of a business or a group of people', definition_zh: '經營；設法做到', example_en: 'She manages a small bakery near the school.', example_zh: '她在學校附近經營一間小麵包店。', tier: '進階' },
  { word: 'match', pos: 'v.', phonetic: '/mætʃ/', definition: 'to be the same as or go well together with something else', definition_zh: '搭配；相稱', example_en: "Your shoes don't match your school uniform.", example_zh: '你的鞋子跟校服不搭。', tier: '進階' },
  { word: 'memorize', pos: 'v.', phonetic: '/ˈmɛməˌraɪz/', definition: 'to learn something so well that you can remember it exactly', definition_zh: '記憶；背誦', example_en: 'We had to memorize ten new words every day.', example_zh: '我們每天必須背十個新單字。', tier: '進階' },
  { word: 'mix', pos: 'v.', phonetic: '/mɪks/', definition: 'to combine two or more things together', definition_zh: '混合', example_en: 'Mix the flour and sugar before adding eggs.', example_zh: '加蛋之前先把麵粉和糖混合。', tier: '進階' },
  { word: 'obey', pos: 'v.', phonetic: '/oˈbeɪ/', definition: 'to do what someone tells you to do, following rules', definition_zh: '服從；遵守', example_en: 'Drivers must obey the traffic lights at all times.', example_zh: '駕駛人必須隨時遵守交通號誌。', tier: '進階' },
  { word: 'omit', pos: 'v.', phonetic: '/oˈmɪt/', definition: 'to leave something out or not include it', definition_zh: '遺漏；刪除', example_en: 'He omitted his phone number on the form by mistake.', example_zh: '他不小心在表格上漏填電話號碼。', tier: '進階' },
  { word: 'pardon', pos: 'v.', phonetic: '/ˈpɑrdn/', definition: 'to forgive someone for a mistake or crime', definition_zh: '原諒', example_en: 'The king decided to pardon the young thief.', example_zh: '國王決定原諒那個年輕的小偷。', tier: '進階' },
  { word: 'praise', pos: 'v.', phonetic: '/preɪz/', definition: 'to say good things about someone or something', definition_zh: '讚美', example_en: 'The coach praised the team for their hard work.', example_zh: '教練讚美這支隊伍的努力。', tier: '進階' },
  { word: 'prove', pos: 'v.', phonetic: '/pruv/', definition: 'to show that something is true using facts or evidence', definition_zh: '證明', example_en: 'The photo proved that he was at home.', example_zh: '這張照片證明他當時在家。', tier: '進階' },
  { word: 'realize', pos: 'v.', phonetic: '/ˈriəˌlaɪz/', definition: 'to understand something clearly for the first time', definition_zh: '了解；意識到', example_en: 'I suddenly realized I had left my keys home.', example_zh: '我突然意識到我把鑰匙忘在家裡了。', tier: '進階' },
  { word: 'receive', pos: 'v.', phonetic: '/rɪˈsiv/', definition: 'to get something that someone gives or sends you', definition_zh: '收到', example_en: 'She received a birthday gift from her cousin.', example_zh: '她收到表姊送的生日禮物。', tier: '進階' },
  { word: 'recycle', pos: 'v.', phonetic: '/riˈsaɪkl/', definition: 'to treat used materials so they can be used again', definition_zh: '回收', example_en: 'We recycle plastic bottles at our school every week.', example_zh: '我們學校每週都會回收塑膠瓶。', tier: '進階' },
  { word: 'regard', pos: 'v.', phonetic: '/rɪˈgɑrd/', definition: 'to think of someone or something in a certain way', definition_zh: '視…為；看待', example_en: 'Many students regard him as a great teacher.', example_zh: '許多學生把他視為一位偉大的老師。', tier: '進階' },
  { word: 'regulate', pos: 'v.', phonetic: '/ˈrɛgjəˌleɪt/', definition: 'to control something by rules or by adjusting it', definition_zh: '調整；管制', example_en: "This device helps regulate the room's temperature.", example_zh: '這個裝置有助於調整房間的溫度。', tier: '進階' },
  { word: 'relate', pos: 'v.', phonetic: '/rɪˈleɪt/', definition: 'to show or find a connection between two things', definition_zh: '使…有關聯', example_en: 'This story relates closely to our own lives.', example_zh: '這個故事和我們自己的生活息息相關。', tier: '進階' },
  { word: 'remind', pos: 'v.', phonetic: '/rɪˈmaɪnd/', definition: 'to help someone remember something', definition_zh: '提醒', example_en: 'Please remind me to bring my umbrella tomorrow.', example_zh: '請提醒我明天要帶雨傘。', tier: '進階' },
  { word: 'reply', pos: 'v.', phonetic: '/rɪˈplaɪ/', definition: 'to answer someone in words or writing', definition_zh: '回覆；回答', example_en: 'He replied to my message within a few minutes.', example_zh: '他在幾分鐘內就回覆了我的訊息。', tier: '進階' },
  { word: 'respond', pos: 'v.', phonetic: '/rɪˈspɑnd/', definition: 'to say or do something as a reaction to a question', definition_zh: '回答；回應', example_en: "She responded quickly to the teacher's question.", example_zh: '她很快就回答了老師的問題。', tier: '進階' },
  { word: 'ruin', pos: 'v.', phonetic: '/ˈruɪn/', definition: 'to spoil or destroy something completely', definition_zh: '毀掉；破壞', example_en: 'The heavy rain ruined our outdoor picnic plans.', example_zh: '大雨毀了我們的戶外野餐計畫。', tier: '進階' },
  { word: 'seek', pos: 'v.', phonetic: '/sik/', definition: 'to try to find or get something', definition_zh: '尋求；尋找', example_en: 'He is seeking advice from his older brother.', example_zh: '他正在尋求哥哥的建議。', tier: '進階' },
  { word: 'select', pos: 'v.', phonetic: '/səˈlɛkt/', definition: 'to choose someone or something carefully from a group', definition_zh: '挑選', example_en: 'Please select the best answer for each question.', example_zh: '請為每一題挑選出最佳答案。', tier: '進階' },
  { word: 'sharpen', pos: 'v.', phonetic: '/ˈʃɑrpən/', definition: 'to make something have a sharp point or edge', definition_zh: '（使）銳利；削尖', example_en: 'He sharpened his pencil before the math test.', example_zh: '他在數學考試前把鉛筆削尖。', tier: '進階' },
  { word: 'shut', pos: 'v.', phonetic: '/ʃʌt/', definition: 'to close something, such as a door or a book', definition_zh: '關閉', example_en: "Please shut the window; it's getting cold.", example_zh: '請把窗戶關上，天氣變冷了。', tier: '進階' },
  { word: 'straighten', pos: 'v.', phonetic: '/ˈstreɪtn/', definition: 'to make something straight or in order', definition_zh: '（使）變直；整理', example_en: 'She straightened the pictures hanging on the wall.', example_zh: '她把牆上掛的照片扶正。', tier: '進階' },
  { word: 'thicken', pos: 'v.', phonetic: '/ˈθɪkən/', definition: 'to become thicker or make something thicker', definition_zh: '（使）變厚；變濃稠', example_en: 'Keep stirring the soup until it thickens.', example_zh: '持續攪拌湯直到它變濃稠。', tier: '進階' },
  { word: 'tire', pos: 'v.', phonetic: '/taɪr/', definition: 'to make someone feel tired or lose energy', definition_zh: '（使）疲倦', example_en: 'The long hike tired the students quickly.', example_zh: '這趟長途健行讓學生們很快就累了。', tier: '進階' },
  { word: 'trace', pos: 'v.', phonetic: '/treɪs/', definition: 'to follow signs or evidence to find something', definition_zh: '追蹤；追溯', example_en: 'Police traced the missing bike to a nearby park.', example_zh: '警方追蹤那輛失蹤的腳踏車到附近的公園。', tier: '進階' },
  { word: 'track', pos: 'v.', phonetic: '/træk/', definition: 'to follow the movement of a person or thing', definition_zh: '追蹤', example_en: "We tracked the storm's path on the weather app.", example_zh: '我們在天氣app上追蹤暴風的路徑。', tier: '進階' },
  { word: 'trap', pos: 'v.', phonetic: '/træp/', definition: 'to catch and hold something so it cannot escape', definition_zh: '設陷阱；困住', example_en: 'The heavy traffic trapped us for over an hour.', example_zh: '嚴重的塞車把我們困住了超過一小時。', tier: '進階' },
  { word: 'weaken', pos: 'v.', phonetic: '/ˈwikən/', definition: 'to become weaker or make something weaker', definition_zh: '（使）變弱', example_en: 'The old bridge weakened after years of heavy rain.', example_zh: '這座老橋在多年風雨後變得脆弱。', tier: '進階' },
];

async function main() {
  console.log(`準備寫入 ${ENTRIES.length} 個新字...`);
  let inserted = 0, skipped = 0, failed = 0;

  for (const e of ENTRIES) {
    // 防呆：避免萬一資料庫在這之間已經有這個字，造成重複
    const { data: existing } = await supabase.from('words').select('id, tags').ilike('word', e.word).limit(1);
    if (existing && existing.length) {
      console.log(`  ⏭️  ${e.word} 已存在，跳過新增，改為補上 unit32 標籤`);
      const newTags = Array.from(new Set([...(existing[0].tags || []), 'unit32']));
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
      tags: ['cap_2000', 'unit32', e.tier],
      level: 1,
    });
    if (error) { console.error(`  ❌ ${e.word} 寫入失敗:`, error.message); failed++; }
    else { console.log(`  ✅ ${e.word}`); inserted++; }
  }

  console.log(`\n完成：新增 ${inserted} 筆、跳過(已存在) ${skipped} 筆、失敗 ${failed} 筆`);
}

main().catch(err => { console.error(err); process.exit(1); });
