/**
 * 補齊 Unit 15-20 在 words 表裡缺少的字（共 123 個，依 tag_unit15to20.js 產出的
 * unit15to20_missing.json 清單）。內容依 cambridge-style-examples 技能規範原創生成，
 * 欄位對齊現有 words 表格式，寫入 tags: ['cap_2000','unitN', 基礎/進階]。
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const ENTRIES = [
  // ══════ Unit 15 數字 (Numbers) ══════
  { unit: 15, word: 'a few', pos: 'adj.', phonetic: '/ə fjuː/', definition: 'a small number of people or things', definition_zh: '一些；幾個', example_en: 'I have a few coins in my pocket.', example_zh: '我口袋裡有幾個硬幣。', tier: '基礎' },
  { unit: 15, word: 'a little', pos: 'adj.', phonetic: '/ə ˈlɪtl/', definition: 'a small amount of something', definition_zh: '一點；少許', example_en: 'She added a little sugar to her tea.', example_zh: '她在茶裡加了一點糖。', tier: '基礎' },
  { unit: 15, word: 'a lot', pos: 'adv.', phonetic: '/ə lɑt/', definition: 'a large amount or number of something', definition_zh: '很多；大量', example_en: 'He has a lot of homework tonight.', example_zh: '他今晚有很多作業。', tier: '基礎' },
  { unit: 15, word: 'total', pos: 'n.', phonetic: '/ˈtoʊtl/', definition: 'the whole amount when everything is added together', definition_zh: '總數；總計', example_en: 'The total of the bill was two hundred dollars.', example_zh: '帳單的總額是兩百元。', tier: '基礎' },
  { unit: 15, word: 'addition', pos: 'n.', phonetic: '/əˈdɪʃən/', definition: 'the process of adding numbers together', definition_zh: '加法；附加', example_en: 'We learned addition and subtraction in math class.', example_zh: '我們在數學課學了加法和減法。', tier: '進階' },
  { unit: 15, word: 'division', pos: 'n.', phonetic: '/dɪˈvɪʒən/', definition: 'the process of dividing one number by another', definition_zh: '除法；分配', example_en: 'Division is harder for me than addition.', example_zh: '除法對我來說比加法難。', tier: '進階' },
  { unit: 15, word: 'minus', pos: 'prep.', phonetic: '/ˈmaɪnəs/', definition: 'used to show that one number is subtracted from another', definition_zh: '減；負的', example_en: 'Ten minus three equals seven.', example_zh: '十減三等於七。', tier: '進階' },
  { unit: 15, word: 'plus', pos: 'prep.', phonetic: '/plʌs/', definition: 'used to show that one number is added to another', definition_zh: '加；外加', example_en: 'Two plus two equals four.', example_zh: '二加二等於四。', tier: '進階' },

  // ══════ Unit 16 時間 (Time) ══════
  { unit: 16, word: 'a.m.', pos: 'adv.', phonetic: '/ˌeɪ ˈɛm/', definition: 'used after a time to show it is before noon', definition_zh: '上午', example_en: 'School starts at eight a.m. every day.', example_zh: '學校每天上午八點開始上課。', tier: '基礎' },
  { unit: 16, word: 'December', pos: 'n.', phonetic: '/dɪˈsɛmbər/', definition: 'the twelfth and last month of the year', definition_zh: '十二月', example_en: 'We celebrate Christmas in December.', example_zh: '我們在十二月慶祝聖誕節。', tier: '基礎' },
  { unit: 16, word: 'February', pos: 'n.', phonetic: '/ˈfɛbjuˌɛri/', definition: 'the second month of the year', definition_zh: '二月', example_en: 'Chinese New Year is often in February.', example_zh: '農曆新年常常在二月。', tier: '基礎' },
  { unit: 16, word: 'Friday', pos: 'n.', phonetic: '/ˈfraɪdeɪ/', definition: 'the day after Thursday and before Saturday', definition_zh: '星期五', example_en: 'We have a test every Friday morning.', example_zh: '我們每個星期五早上都有考試。', tier: '基礎' },
  { unit: 16, word: 'hour', pos: 'n.', phonetic: '/aʊər/', definition: 'a period of sixty minutes', definition_zh: '小時', example_en: 'The movie lasted about two hours.', example_zh: '這部電影大約放映了兩個小時。', tier: '基礎' },
  { unit: 16, word: 'January', pos: 'n.', phonetic: '/ˈdʒænjuˌɛri/', definition: 'the first month of the year', definition_zh: '一月', example_en: 'The new term starts in January in some countries.', example_zh: '有些國家的新學期從一月開始。', tier: '基礎' },
  { unit: 16, word: 'July', pos: 'n.', phonetic: '/dʒʊˈlaɪ/', definition: 'the seventh month of the year', definition_zh: '七月', example_en: 'Summer vacation begins in July.', example_zh: '暑假在七月開始。', tier: '基礎' },
  { unit: 16, word: 'June', pos: 'n.', phonetic: '/dʒun/', definition: 'the sixth month of the year', definition_zh: '六月', example_en: 'We graduated from school in June.', example_zh: '我們六月從學校畢業。', tier: '基礎' },
  { unit: 16, word: 'March', pos: 'n.', phonetic: '/mɑrtʃ/', definition: 'the third month of the year', definition_zh: '三月', example_en: 'Spring flowers start to bloom in March.', example_zh: '春天的花在三月開始盛開。', tier: '基礎' },
  { unit: 16, word: 'minute', pos: 'n.', phonetic: '/ˈmɪnɪt/', definition: 'a period of sixty seconds', definition_zh: '分鐘', example_en: 'Please wait a minute before you answer.', example_zh: '請等一分鐘再回答。', tier: '基礎' },
  { unit: 16, word: 'Monday', pos: 'n.', phonetic: '/ˈmʌndeɪ/', definition: 'the day after Sunday and before Tuesday', definition_zh: '星期一', example_en: 'We raise the flag every Monday morning.', example_zh: '我們每個星期一早上升旗。', tier: '基礎' },
  { unit: 16, word: 'noon', pos: 'n.', phonetic: '/nun/', definition: 'twelve o’clock in the middle of the day', definition_zh: '中午；正午', example_en: 'We usually have lunch at noon.', example_zh: '我們通常在中午吃午餐。', tier: '基礎' },
  { unit: 16, word: 'November', pos: 'n.', phonetic: '/noʊˈvɛmbər/', definition: 'the eleventh month of the year', definition_zh: '十一月', example_en: 'The weather gets cold in November.', example_zh: '十一月天氣變冷了。', tier: '基礎' },
  { unit: 16, word: "o'clock", pos: 'adv.', phonetic: '/əˈklɑk/', definition: 'used after a number to say the exact hour', definition_zh: '……點鐘', example_en: 'The bus leaves at seven o’clock.', example_zh: '公車七點鐘出發。', tier: '基礎' },
  { unit: 16, word: 'October', pos: 'n.', phonetic: '/ɑkˈtoʊbər/', definition: 'the tenth month of the year', definition_zh: '十月', example_en: 'There is a sports day in October.', example_zh: '十月有運動會。', tier: '基礎' },
  { unit: 16, word: 'p.m.', pos: 'adv.', phonetic: '/ˌpi ˈɛm/', definition: 'used after a time to show it is after noon', definition_zh: '下午', example_en: 'School ends at four p.m.', example_zh: '學校下午四點放學。', tier: '基礎' },
  { unit: 16, word: 'quarter', pos: 'n.', phonetic: '/ˈkwɔrtər/', definition: 'one of four equal parts of something', definition_zh: '四分之一；一刻鐘', example_en: 'It is a quarter past nine now.', example_zh: '現在是九點十五分。', tier: '基礎' },
  { unit: 16, word: 'September', pos: 'n.', phonetic: '/sɛpˈtɛmbər/', definition: 'the ninth month of the year', definition_zh: '九月', example_en: 'The new semester starts in September.', example_zh: '新學期在九月開始。', tier: '基礎' },
  { unit: 16, word: 'Thursday', pos: 'n.', phonetic: '/ˈθərzdeɪ/', definition: 'the day after Wednesday and before Friday', definition_zh: '星期四', example_en: 'We have art class on Thursday afternoon.', example_zh: '我們星期四下午有美術課。', tier: '基礎' },
  { unit: 16, word: 'Tuesday', pos: 'n.', phonetic: '/ˈtuzdeɪ/', definition: 'the day after Monday and before Wednesday', definition_zh: '星期二', example_en: 'The library is closed on Tuesday.', example_zh: '圖書館星期二不開放。', tier: '基礎' },
  { unit: 16, word: 'Wednesday', pos: 'n.', phonetic: '/ˈwɛnzdeɪ/', definition: 'the day after Tuesday and before Thursday', definition_zh: '星期三', example_en: 'We clean the classroom every Wednesday.', example_zh: '我們每個星期三打掃教室。', tier: '基礎' },
  { unit: 16, word: 'alarm clock', pos: 'n.', phonetic: '/əˈlɑrm klɑk/', definition: 'a clock that makes a sound to wake you up', definition_zh: '鬧鐘', example_en: 'My alarm clock rings at six thirty.', example_zh: '我的鬧鐘六點半響。', tier: '進階' },
  { unit: 16, word: 'monthly', pos: 'adj.', phonetic: '/ˈmʌnθli/', definition: 'happening or done once every month', definition_zh: '每月的', example_en: 'We get a monthly test at school.', example_zh: '我們在學校有每月一次的考試。', tier: '進階' },
  { unit: 16, word: 'period', pos: 'n.', phonetic: '/ˈpɪriəd/', definition: 'a length of time, or a class at school', definition_zh: '期間；一節課', example_en: 'Math class is the first period today.', example_zh: '今天數學課是第一節。', tier: '進階' },
  { unit: 16, word: 'stopwatch', pos: 'n.', phonetic: '/ˈstɑpˌwɑtʃ/', definition: 'a watch used to measure exactly how long something takes', definition_zh: '碼錶', example_en: 'The coach used a stopwatch to time the runners.', example_zh: '教練用碼錶為跑者計時。', tier: '進階' },
  { unit: 16, word: 'weekday', pos: 'n.', phonetic: '/ˈwikˌdeɪ/', definition: 'any day except Saturday and Sunday', definition_zh: '平日；工作日', example_en: 'I go to school on weekdays.', example_zh: '我平日要去上學。', tier: '進階' },
  { unit: 16, word: 'weekly', pos: 'adj.', phonetic: '/ˈwikli/', definition: 'happening or done once a week', definition_zh: '每週的', example_en: 'We have a weekly spelling test.', example_zh: '我們有每週一次的拼字考試。', tier: '進階' },
  { unit: 16, word: 'yearly', pos: 'adj.', phonetic: '/ˈjɪrli/', definition: 'happening or done once a year', definition_zh: '每年的', example_en: 'The school trip is a yearly event.', example_zh: '校外教學是每年一次的活動。', tier: '進階' },

  // ══════ Unit 17 金錢 (Money) ══════
  { unit: 17, word: 'dollar', pos: 'n.', phonetic: '/ˈdɑlər/', definition: 'a unit of money used in the US and other countries', definition_zh: '元；美元', example_en: 'The toy cost only five dollars.', example_zh: '這個玩具只要五元。', tier: '基礎' },
  { unit: 17, word: 'coin', pos: 'n.', phonetic: '/kɔɪn/', definition: 'a small piece of metal money', definition_zh: '硬幣', example_en: 'He dropped a coin into the machine.', example_zh: '他把一枚硬幣投進機器裡。', tier: '進階' },
  { unit: 17, word: 'credit card', pos: 'n.', phonetic: '/ˈkrɛdɪt kɑrd/', definition: 'a small plastic card used to buy things and pay later', definition_zh: '信用卡', example_en: 'My mother paid for the trip with her credit card.', example_zh: '我媽媽用信用卡付了旅費。', tier: '進階' },
  { unit: 17, word: 'currency', pos: 'n.', phonetic: '/ˈkərənsi/', definition: 'the money used in a particular country', definition_zh: '貨幣', example_en: 'The currency in Japan is called the yen.', example_zh: '日本的貨幣叫做日圓。', tier: '進階' },
  { unit: 17, word: 'income', pos: 'n.', phonetic: '/ˈɪnˌkʌm/', definition: 'the money that a person earns from work', definition_zh: '收入', example_en: "His parents' income increased this year.", example_zh: '他父母今年的收入增加了。', tier: '進階' },

  // ══════ Unit 18 尺寸、形狀、測量 (Size, Shape & Measurements) ══════
  { unit: 18, word: 'dot', pos: 'n.', phonetic: '/dɑt/', definition: 'a very small round mark', definition_zh: '點；小圓點', example_en: 'There is a small dot above the letter i.', example_zh: '字母 i 上面有一個小點。', tier: '基礎' },
  { unit: 18, word: 'gram', pos: 'n.', phonetic: '/græm/', definition: 'a small unit for measuring weight', definition_zh: '公克', example_en: 'The recipe needs two hundred grams of flour.', example_zh: '這個食譜需要兩百公克的麵粉。', tier: '基礎' },
  { unit: 18, word: 'inch', pos: 'n.', phonetic: '/ɪntʃ/', definition: 'a unit for measuring length, about 2.5 centimeters', definition_zh: '英吋', example_en: 'The photo frame is six inches wide.', example_zh: '這個相框寬六英吋。', tier: '基礎' },
  { unit: 18, word: 'kilogram', pos: 'n.', phonetic: '/ˈkɪləˌgræm/', definition: 'a unit for measuring weight equal to 1000 grams', definition_zh: '公斤', example_en: 'The bag of rice weighs five kilograms.', example_zh: '這袋米重五公斤。', tier: '基礎' },
  { unit: 18, word: 'pound', pos: 'n.', phonetic: '/paʊnd/', definition: 'a unit for measuring weight used in the US and UK', definition_zh: '磅', example_en: 'The puppy weighs about ten pounds.', example_zh: '這隻小狗大約重十磅。', tier: '基礎' },
  { unit: 18, word: 'round', pos: 'adj.', phonetic: '/raʊnd/', definition: 'shaped like a circle or a ball', definition_zh: '圓形的', example_en: 'The table in our kitchen is round.', example_zh: '我們廚房的桌子是圓形的。', tier: '基礎' },
  { unit: 18, word: 'row', pos: 'n.', phonetic: '/roʊ/', definition: 'a line of people or things', definition_zh: '排；列', example_en: 'We sat in the front row of the theater.', example_zh: '我們坐在劇院的前排。', tier: '基礎' },
  { unit: 18, word: 'tall', pos: 'adj.', phonetic: '/tɔl/', definition: 'having a greater than average height', definition_zh: '高的', example_en: 'My brother is taller than my father now.', example_zh: '我哥哥現在比我爸爸還高。', tier: '基礎' },
  { unit: 18, word: 'tiny', pos: 'adj.', phonetic: '/ˈtaɪni/', definition: 'extremely small', definition_zh: '極小的', example_en: 'The kitten was tiny when we found it.', example_zh: '我們發現這隻小貓時牠非常小。', tier: '基礎' },
  { unit: 18, word: 'deep', pos: 'adj.', phonetic: '/dip/', definition: 'going far down from the top or surface', definition_zh: '深的', example_en: 'Be careful, the lake is very deep here.', example_zh: '小心，這裡的湖水非常深。', tier: '進階' },
  { unit: 18, word: 'kilometer', pos: 'n.', phonetic: '/kɪˈlɑmɪtər/', definition: 'a unit for measuring distance equal to 1000 meters', definition_zh: '公里', example_en: 'The park is about three kilometers from my house.', example_zh: '這座公園離我家大約三公里。', tier: '進階' },
  { unit: 18, word: 'length', pos: 'n.', phonetic: '/lɛŋkθ/', definition: 'how long something is from one end to the other', definition_zh: '長度', example_en: 'Can you measure the length of this table?', example_zh: '你能量一下這張桌子的長度嗎？', tier: '進階' },
  { unit: 18, word: 'maximum', pos: 'adj.', phonetic: '/ˈmæksɪməm/', definition: 'the largest amount or number that is possible', definition_zh: '最大的；最高的', example_en: 'The maximum speed on this road is fifty.', example_zh: '這條路的最高速限是五十。', tier: '進階' },
  { unit: 18, word: 'measure', pos: 'v.', phonetic: '/ˈmɛʒər/', definition: 'to find the size, length, or amount of something', definition_zh: '測量', example_en: 'The nurse measured my height and weight.', example_zh: '護士量了我的身高和體重。', tier: '進階' },
  { unit: 18, word: 'meter', pos: 'n.', phonetic: '/ˈmitər/', definition: 'a unit for measuring length equal to 100 centimeters', definition_zh: '公尺', example_en: 'The swimming pool is fifty meters long.', example_zh: '這座游泳池長五十公尺。', tier: '進階' },
  { unit: 18, word: 'pattern', pos: 'n.', phonetic: '/ˈpætərn/', definition: 'a repeated design, or a regular way something happens', definition_zh: '圖案；模式', example_en: 'She chose a shirt with a flower pattern.', example_zh: '她選了一件有花朵圖案的襯衫。', tier: '進階' },
  { unit: 18, word: 'range', pos: 'n.', phonetic: '/reɪndʒ/', definition: 'the area between the lowest and highest amount', definition_zh: '範圍', example_en: 'The shop sells shoes in a wide range of sizes.', example_zh: '這家店賣的鞋子尺寸範圍很廣。', tier: '進階' },
  { unit: 18, word: 'rectangle', pos: 'n.', phonetic: '/ˈrɛkˌtæŋgəl/', definition: 'a shape with four sides and four right angles', definition_zh: '長方形', example_en: 'The classroom door is shaped like a rectangle.', example_zh: '教室的門是長方形的。', tier: '進階' },
  { unit: 18, word: 'regular', pos: 'adj.', phonetic: '/ˈrɛgjələr/', definition: 'happening often with the same amount of time between', definition_zh: '規律的；定期的', example_en: 'Regular exercise keeps your body healthy.', example_zh: '規律運動能讓身體保持健康。', tier: '進階' },
  { unit: 18, word: 'scale', pos: 'n.', phonetic: '/skeɪl/', definition: 'a machine used to measure how heavy something is', definition_zh: '磅秤；量表', example_en: 'He stood on the scale to check his weight.', example_zh: '他站上磅秤看自己的體重。', tier: '進階' },
  { unit: 18, word: 'spacious', pos: 'adj.', phonetic: '/ˈspeɪʃəs/', definition: 'having a lot of space; large inside', definition_zh: '寬敞的', example_en: 'Their new apartment is bright and spacious.', example_zh: '他們的新公寓明亮又寬敞。', tier: '進階' },
  { unit: 18, word: 'triangle', pos: 'n.', phonetic: '/ˈtraɪˌæŋgəl/', definition: 'a shape with three straight sides and three angles', definition_zh: '三角形', example_en: 'The teacher drew a triangle on the board.', example_zh: '老師在黑板上畫了一個三角形。', tier: '進階' },
  { unit: 18, word: 'volume', pos: 'n.', phonetic: '/ˈvɑljum/', definition: 'the amount of space something fills, or how loud a sound is', definition_zh: '體積；音量', example_en: 'Please turn down the volume of the TV.', example_zh: '請把電視的音量調小一點。', tier: '進階' },
  { unit: 18, word: 'weight', pos: 'n.', phonetic: '/weɪt/', definition: 'how heavy a person or thing is', definition_zh: '重量；體重', example_en: 'The doctor checked my weight during the visit.', example_zh: '醫生在看診時檢查了我的體重。', tier: '進階' },
  { unit: 18, word: 'wide', pos: 'adj.', phonetic: '/waɪd/', definition: 'measuring a large distance from one side to the other', definition_zh: '寬的', example_en: 'The river is too wide to swim across.', example_zh: '這條河太寬了，沒辦法游過去。', tier: '進階' },
  { unit: 18, word: 'widen', pos: 'v.', phonetic: '/ˈwaɪdən/', definition: 'to become wider or make something wider', definition_zh: '加寬；擴大', example_en: 'The city plans to widen this narrow road.', example_zh: '市政府計畫將這條窄路拓寬。', tier: '進階' },
  { unit: 18, word: 'width', pos: 'n.', phonetic: '/wɪdθ/', definition: 'the distance from one side of something to the other', definition_zh: '寬度', example_en: 'What is the width of your desk?', example_zh: '你的書桌寬度是多少？', tier: '進階' },

  // ══════ Unit 19 假日、節慶 (Holidays & Festivals) ══════
  { unit: 19, word: 'Christmas', pos: 'n.', phonetic: '/ˈkrɪsməs/', definition: 'a holiday on December 25th when many people celebrate together', definition_zh: '聖誕節', example_en: 'We put up a tree every Christmas.', example_zh: '我們每年聖誕節都會佈置聖誕樹。', tier: '基礎' },
  { unit: 19, word: 'Easter', pos: 'n.', phonetic: '/ˈistər/', definition: 'a spring holiday celebrated with eggs and rabbits', definition_zh: '復活節', example_en: 'Children hunt for eggs on Easter.', example_zh: '孩子們在復活節找彩蛋。', tier: '基礎' },
  { unit: 19, word: "Father's Day", pos: 'n.', phonetic: '/ˈfɑðərz deɪ/', definition: 'a day set aside to honor fathers', definition_zh: '父親節', example_en: "We gave Dad a card on Father's Day.", example_zh: '父親節那天我們給爸爸一張卡片。', tier: '基礎' },
  { unit: 19, word: 'Lantern Festival', pos: 'n.', phonetic: '/ˈlæntərn ˈfɛstəvəl/', definition: 'a festival with lanterns held after Chinese New Year', definition_zh: '元宵節', example_en: 'We watched lanterns light up the night at the Lantern Festival.', example_zh: '我們在元宵節看著燈籠點亮夜晚。', tier: '基礎' },
  { unit: 19, word: 'Moon Festival', pos: 'n.', phonetic: '/mun ˈfɛstəvəl/', definition: 'an autumn festival celebrated by eating mooncakes', definition_zh: '中秋節', example_en: 'Our family eats mooncakes during the Moon Festival.', example_zh: '我們家在中秋節會吃月餅。', tier: '基礎' },
  { unit: 19, word: "Mother's Day", pos: 'n.', phonetic: '/ˈmʌðərz deɪ/', definition: 'a day set aside to honor mothers', definition_zh: '母親節', example_en: "I made a card for Mom on Mother's Day.", example_zh: '我在母親節做了一張卡片給媽媽。', tier: '基礎' },
  { unit: 19, word: "New Year's Day", pos: 'n.', phonetic: '/nu jɪrz deɪ/', definition: 'January 1st, the first day of the year', definition_zh: '元旦', example_en: "We watch fireworks on New Year's Day.", example_zh: '我們在元旦看煙火。', tier: '基礎' },
  { unit: 19, word: "New Year's Eve", pos: 'n.', phonetic: '/nu jɪrz iv/', definition: 'December 31st, the last night of the year', definition_zh: '跨年夜；除夕', example_en: "We stayed up late on New Year's Eve.", example_zh: '我們在跨年夜熬夜到很晚。', tier: '基礎' },
  { unit: 19, word: "Teacher's Day", pos: 'n.', phonetic: '/ˈtitʃərz deɪ/', definition: 'a day to show thanks to teachers', definition_zh: '教師節', example_en: "Students sent cards to teachers on Teacher's Day.", example_zh: '學生在教師節寄卡片給老師。', tier: '基礎' },
  { unit: 19, word: 'congratulation', pos: 'n.', phonetic: '/kənˌgrætʃəˈleɪʃən/', definition: 'words said to praise someone for their success', definition_zh: '恭喜；祝賀', example_en: 'We sent our congratulations to the winning team.', example_zh: '我們向獲勝的隊伍表達祝賀。', tier: '進階' },
  { unit: 19, word: 'Double Tenth Day', pos: 'n.', phonetic: '/ˈdʌbəl tɛnθ deɪ/', definition: "Taiwan's national day on October 10th", definition_zh: '雙十節', example_en: 'There is a big parade in Taipei on Double Tenth Day.', example_zh: '雙十節那天台北有盛大的遊行。', tier: '進階' },
  { unit: 19, word: 'Dragon Boat Festival', pos: 'n.', phonetic: '/ˈdrægən boʊt ˈfɛstəvəl/', definition: 'a summer festival with boat races and rice dumplings', definition_zh: '端午節', example_en: 'People eat rice dumplings during the Dragon Boat Festival.', example_zh: '人們在端午節吃粽子。', tier: '進階' },
  { unit: 19, word: 'invitation', pos: 'n.', phonetic: '/ˌɪnvəˈteɪʃən/', definition: 'a written or spoken request asking someone to come to something', definition_zh: '邀請；邀請函', example_en: 'She sent an invitation to all her classmates.', example_zh: '她寄邀請函給所有同學。', tier: '進階' },
  { unit: 19, word: 'memory', pos: 'n.', phonetic: '/ˈmɛməri/', definition: 'something you remember from the past', definition_zh: '回憶；記憶', example_en: 'This photo brings back happy memories.', example_zh: '這張照片喚起了快樂的回憶。', tier: '進階' },
  { unit: 19, word: 'Thanksgiving', pos: 'n.', phonetic: '/ˌθæŋksˈgɪvɪŋ/', definition: 'a November holiday for giving thanks, celebrated with a big meal', definition_zh: '感恩節', example_en: 'Families in America eat turkey on Thanksgiving.', example_zh: '美國家庭在感恩節吃火雞。', tier: '進階' },
  { unit: 19, word: "Valentine's Day", pos: 'n.', phonetic: '/ˈvæləntaɪnz deɪ/', definition: 'February 14th, a day for showing love', definition_zh: '情人節', example_en: "He gave her flowers on Valentine's Day.", example_zh: '他在情人節送她花。', tier: '進階' },

  // ══════ Unit 20 國家、地區、語言 (Countries, Cities & Languages) ══════
  { unit: 20, word: 'America', pos: 'n.', phonetic: '/əˈmɛrɪkə/', definition: 'the United States, or the continent of North and South America', definition_zh: '美國；美洲', example_en: 'My uncle has lived in America for ten years.', example_zh: '我叔叔已經在美國住了十年。', tier: '基礎' },
  { unit: 20, word: 'American', pos: 'adj.', phonetic: '/əˈmɛrɪkən/', definition: 'from or relating to America', definition_zh: '美國的；美國人', example_en: 'She has many American friends online.', example_zh: '她在網路上有很多美國朋友。', tier: '基礎' },
  { unit: 20, word: 'Chinese', pos: 'adj.', phonetic: '/ˌtʃaɪˈniz/', definition: 'from or relating to China, or the Chinese language', definition_zh: '中國的；中文', example_en: 'He is learning Chinese at school.', example_zh: '他在學校學中文。', tier: '基礎' },
  { unit: 20, word: 'ROC', pos: 'n.', phonetic: '/ˌɑr oʊ ˈsi/', definition: 'short for the Republic of China', definition_zh: '中華民國', example_en: 'ROC stands for the Republic of China.', example_zh: 'ROC 是中華民國的縮寫。', tier: '基礎' },
  { unit: 20, word: 'Taiwan', pos: 'n.', phonetic: '/ˌtaɪˈwɑn/', definition: 'an island country in East Asia', definition_zh: '台灣', example_en: 'Taiwan is famous for its night markets.', example_zh: '台灣以夜市聞名。', tier: '基礎' },
  { unit: 20, word: 'USA', pos: 'n.', phonetic: '/ˌju ɛs ˈeɪ/', definition: 'short for the United States of America', definition_zh: '美國', example_en: 'She moved to the USA last summer.', example_zh: '她去年夏天搬去了美國。', tier: '基礎' },
  { unit: 20, word: 'Australia', pos: 'n.', phonetic: '/ɔˈstreɪljə/', definition: 'a country and continent in the Southern Hemisphere', definition_zh: '澳洲', example_en: 'Kangaroos are famous animals from Australia.', example_zh: '袋鼠是澳洲有名的動物。', tier: '進階' },
  { unit: 20, word: 'Australian', pos: 'adj.', phonetic: '/ɔˈstreɪljən/', definition: 'from or relating to Australia', definition_zh: '澳洲的；澳洲人', example_en: 'Our new teacher is Australian.', example_zh: '我們的新老師是澳洲人。', tier: '進階' },
  { unit: 20, word: 'Britain', pos: 'n.', phonetic: '/ˈbrɪtən/', definition: 'a country in Europe, also called the UK', definition_zh: '英國', example_en: 'Big Ben is a famous clock tower in Britain.', example_zh: '大笨鐘是英國有名的鐘樓。', tier: '進階' },
  { unit: 20, word: 'British', pos: 'adj.', phonetic: '/ˈbrɪtɪʃ/', definition: 'from or relating to Britain', definition_zh: '英國的', example_en: 'He speaks with a strong British accent.', example_zh: '他說話帶著濃厚的英國腔。', tier: '進階' },
  { unit: 20, word: 'Canada', pos: 'n.', phonetic: '/ˈkænədə/', definition: 'a large country in North America', definition_zh: '加拿大', example_en: 'It snows a lot in Canada every winter.', example_zh: '加拿大每年冬天都下很多雪。', tier: '進階' },
  { unit: 20, word: 'Canadian', pos: 'adj.', phonetic: '/kəˈneɪdiən/', definition: 'from or relating to Canada', definition_zh: '加拿大的；加拿大人', example_en: 'My pen pal is Canadian.', example_zh: '我的筆友是加拿大人。', tier: '進階' },
  { unit: 20, word: 'Englishman', pos: 'n.', phonetic: '/ˈɪŋglɪʃmən/', definition: 'a man from England', definition_zh: '英格蘭男子', example_en: 'The Englishman ordered tea instead of coffee.', example_zh: '那位英格蘭男子點了茶而不是咖啡。', tier: '進階' },
  { unit: 20, word: 'European', pos: 'adj.', phonetic: '/ˌjʊrəˈpiən/', definition: 'from or relating to Europe', definition_zh: '歐洲的；歐洲人', example_en: 'Many European countries share the same money.', example_zh: '許多歐洲國家使用相同的貨幣。', tier: '進階' },
  { unit: 20, word: 'France', pos: 'n.', phonetic: '/fræns/', definition: 'a country in Western Europe', definition_zh: '法國', example_en: 'The Eiffel Tower is located in France.', example_zh: '艾菲爾鐵塔位於法國。', tier: '進階' },
  { unit: 20, word: 'Germany', pos: 'n.', phonetic: '/ˈdʒərməni/', definition: 'a country in Central Europe', definition_zh: '德國', example_en: 'My cousin studies engineering in Germany.', example_zh: '我表哥在德國讀工程學。', tier: '進階' },
  { unit: 20, word: 'governmental', pos: 'adj.', phonetic: '/ˌgʌvərnˈmɛntəl/', definition: 'relating to the government', definition_zh: '政府的', example_en: 'The new rule came from a governmental decision.', example_zh: '這項新規定來自政府的決策。', tier: '進階' },
  { unit: 20, word: 'Hong Kong', pos: 'n.', phonetic: '/hɑŋ kɑŋ/', definition: 'a city and special region in southern China', definition_zh: '香港', example_en: 'We ate dim sum on our trip to Hong Kong.', example_zh: '我們去香港旅行時吃了點心。', tier: '進階' },
  { unit: 20, word: 'Hualien', pos: 'n.', phonetic: '/hwɑˈljɛn/', definition: 'a county on the east coast of Taiwan', definition_zh: '花蓮', example_en: 'Hualien is known for its beautiful mountains and sea.', example_zh: '花蓮以美麗的山海景色聞名。', tier: '進階' },
  { unit: 20, word: 'international', pos: 'adj.', phonetic: '/ˌɪntərˈnæʃənəl/', definition: 'involving two or more countries', definition_zh: '國際的', example_en: 'Our school joined an international art contest.', example_zh: '我們學校參加了一場國際美術比賽。', tier: '進階' },
  { unit: 20, word: 'Japanese', pos: 'adj.', phonetic: '/ˌdʒæpəˈniz/', definition: 'from or relating to Japan, or the Japanese language', definition_zh: '日本的；日文', example_en: 'She can speak both Japanese and English.', example_zh: '她會說日文和英文。', tier: '進階' },
  { unit: 20, word: 'Kaohsiung', pos: 'n.', phonetic: '/ˌkaʊˈʃjʊŋ/', definition: 'a large city in southern Taiwan', definition_zh: '高雄', example_en: 'Kaohsiung has a beautiful harbor and MRT system.', example_zh: '高雄有美麗的港口和捷運系統。', tier: '進階' },
  { unit: 20, word: 'kingdom', pos: 'n.', phonetic: '/ˈkɪŋdəm/', definition: 'a country ruled by a king or queen', definition_zh: '王國', example_en: 'The United Kingdom is made up of four countries.', example_zh: '聯合王國由四個國家組成。', tier: '進階' },
  { unit: 20, word: 'Korean', pos: 'adj.', phonetic: '/kəˈriən/', definition: 'from or relating to Korea, or the Korean language', definition_zh: '韓國的；韓文', example_en: 'My sister loves watching Korean dramas.', example_zh: '我姊姊喜歡看韓劇。', tier: '進階' },
  { unit: 20, word: 'local', pos: 'adj.', phonetic: '/ˈloʊkəl/', definition: 'relating to a particular area or place nearby', definition_zh: '當地的', example_en: 'We bought fruit from a local market.', example_zh: '我們在當地市場買了水果。', tier: '進階' },
  { unit: 20, word: 'London', pos: 'n.', phonetic: '/ˈlʌndən/', definition: 'the capital city of England', definition_zh: '倫敦', example_en: 'Big Ben stands in the center of London.', example_zh: '大笨鐘矗立在倫敦市中心。', tier: '進階' },
  { unit: 20, word: 'Mandarin', pos: 'n.', phonetic: '/ˈmændərɪn/', definition: 'the main official language of China and Taiwan', definition_zh: '華語；國語', example_en: 'Mandarin is the official language of Taiwan.', example_zh: '華語是台灣的官方語言。', tier: '進階' },
  { unit: 20, word: 'New York', pos: 'n.', phonetic: '/nu jɔrk/', definition: 'a large city in the United States', definition_zh: '紐約', example_en: 'Times Square is a famous place in New York.', example_zh: '時代廣場是紐約有名的地方。', tier: '進階' },
  { unit: 20, word: 'overseas', pos: 'adv.', phonetic: '/ˌoʊvərˈsiz/', definition: 'in or to a foreign country across the sea', definition_zh: '海外的；到海外', example_en: 'My brother is studying overseas this year.', example_zh: '我哥哥今年在海外求學。', tier: '進階' },
  { unit: 20, word: 'Philippines', pos: 'n.', phonetic: '/ˈfɪləˌpinz/', definition: 'a country made up of many islands in Southeast Asia', definition_zh: '菲律賓', example_en: 'Many beautiful beaches can be found in the Philippines.', example_zh: '菲律賓有許多美麗的海灘。', tier: '進階' },
  { unit: 20, word: 'region', pos: 'n.', phonetic: '/ˈridʒən/', definition: 'a large area of a country or the world', definition_zh: '地區', example_en: 'This region is famous for its tea farms.', example_zh: '這個地區以茶園聞名。', tier: '進階' },
  { unit: 20, word: 'regional', pos: 'adj.', phonetic: '/ˈridʒənəl/', definition: 'relating to a particular region', definition_zh: '地區性的', example_en: 'She won first place in the regional speech contest.', example_zh: '她在地區演講比賽中獲得第一名。', tier: '進階' },
  { unit: 20, word: 'Russia', pos: 'n.', phonetic: '/ˈrʌʃə/', definition: 'the largest country in the world, in Europe and Asia', definition_zh: '俄羅斯', example_en: 'Russia is the largest country in the world.', example_zh: '俄羅斯是世界上最大的國家。', tier: '進階' },
  { unit: 20, word: 'Russian', pos: 'adj.', phonetic: '/ˈrʌʃən/', definition: 'from or relating to Russia, or the Russian language', definition_zh: '俄羅斯的；俄語', example_en: 'He is learning some basic Russian words.', example_zh: '他正在學一些基本的俄語單字。', tier: '進階' },
  { unit: 20, word: 'section', pos: 'n.', phonetic: '/ˈsɛkʃən/', definition: 'one of the parts that something is divided into', definition_zh: '部分；區段', example_en: 'This section of the museum shows ancient art.', example_zh: '博物館的這個區域展示古代藝術。', tier: '進階' },
  { unit: 20, word: 'Singapore', pos: 'n.', phonetic: '/ˈsɪŋgəˌpɔr/', definition: 'a small island country in Southeast Asia', definition_zh: '新加坡', example_en: 'Singapore is known for being clean and modern.', example_zh: '新加坡以整潔和現代化聞名。', tier: '進階' },
  { unit: 20, word: 'state', pos: 'n.', phonetic: '/steɪt/', definition: 'one of the areas that a country like the USA is divided into', definition_zh: '州', example_en: 'California is a state on the west coast of the USA.', example_zh: '加州是美國西岸的一個州。', tier: '進階' },
  { unit: 20, word: 'Taichung', pos: 'n.', phonetic: '/ˈtaɪˈtʃʊŋ/', definition: 'a city in central Taiwan', definition_zh: '台中', example_en: 'Taichung has a mild climate all year round.', example_zh: '台中一年四季氣候溫和。', tier: '進階' },
  { unit: 20, word: 'Tainan', pos: 'n.', phonetic: '/ˈtaɪˈnæn/', definition: 'a historic city in southern Taiwan', definition_zh: '台南', example_en: 'Tainan is known for its old temples and snacks.', example_zh: '台南以古老的廟宇和小吃聞名。', tier: '進階' },
];

async function main() {
  console.log(`準備寫入 ${ENTRIES.length} 個新字...`);
  let inserted = 0, skipped = 0, failed = 0;
  const byUnit = {};

  for (const e of ENTRIES) {
    const unitTag = `unit${e.unit}`;
    byUnit[unitTag] = byUnit[unitTag] || { inserted: 0, skipped: 0 };
    const { data: existing } = await supabase.from('words').select('id, tags').ilike('word', e.word).limit(1);
    if (existing && existing.length) {
      console.log(`  ⏭  ${e.word} 已存在，跳過新增，改為補上 ${unitTag} 標籤`);
      const newTags = Array.from(new Set([...(existing[0].tags || []), unitTag]));
      await supabase.from('words').update({ tags: newTags }).eq('id', existing[0].id);
      skipped++; byUnit[unitTag].skipped++;
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
    else { console.log(`  ✅ ${e.word} (${unitTag})`); inserted++; byUnit[unitTag].inserted++; }
  }

  console.log(`\n完成：新增 ${inserted} 筆、跳過(已存在) ${skipped} 筆、失敗 ${failed} 筆`);
  console.log('分 Unit 統計：', JSON.stringify(byUnit, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
