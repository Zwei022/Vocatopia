/**
 * 補齊 Unit 3（職業）在 words 表裡缺少的 56 個字。
 * 內容依 cambridge-style-examples 技能規範原創生成，加上 tags: ['cap_2000','unit3', 基礎/進階]。
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const ENTRIES = [
  // ── 基礎學習篇 ──
  { word: 'driver', pos: 'n.', phonetic: '/ˈdraɪvər/', definition: 'a person who drives a car, bus, or other vehicle', definition_zh: '駕駛；司機', example_en: 'The bus driver waited for us at the corner.', example_zh: '公車司機在轉角等我們。', tier: '基礎' },
  { word: 'fisherman', pos: 'n.', phonetic: '/ˈfɪʃərmən/', definition: 'a person who catches fish as a job', definition_zh: '漁夫', example_en: 'The fisherman sailed out early before sunrise.', example_zh: '那位漁夫在日出前就出海了。', tier: '基礎' },
  { word: 'housewife', pos: 'n.', phonetic: '/ˈhaʊswaɪf/', definition: 'a woman who manages her home instead of having a paid job', definition_zh: '家庭主婦', example_en: 'My aunt is a housewife who cooks wonderful meals.', example_zh: '我阿姨是位煮得一手好菜的家庭主婦。', tier: '基礎' },
  { word: 'lawyer', pos: 'n.', phonetic: '/ˈlɔjər/', definition: 'a person whose job is to give advice about the law', definition_zh: '律師', example_en: 'She hired a lawyer to help with the contract.', example_zh: '她請了一位律師幫忙處理合約。', tier: '基礎' },
  { word: 'mailman', pos: 'n.', phonetic: '/ˈmeɪlmæn/', definition: 'a person whose job is to deliver mail', definition_zh: '郵差', example_en: 'The mailman delivers letters to our street every morning.', example_zh: '郵差每天早上都會來我們這條街送信。', tier: '基礎' },
  { word: 'police officer', pos: 'n.', phonetic: '/pəˈlis ˈɔfəsər/', definition: 'a person whose job is to make sure people obey the law', definition_zh: '警察', example_en: 'A police officer helped the lost child find his mom.', example_zh: '一位警察幫助那個迷路的小孩找到媽媽。', tier: '基礎' },
  { word: 'salesman', pos: 'n.', phonetic: '/ˈseɪlzmən/', definition: 'a man whose job is to sell things', definition_zh: '男推銷員；男業務員', example_en: 'The salesman explained how the new phone worked.', example_zh: '那位推銷員解釋新手機的功能。', tier: '基礎' },
  { word: 'secretary', pos: 'n.', phonetic: '/ˈsɛkrəˌtɛri/', definition: 'a person who types letters and organizes a manager’s schedule', definition_zh: '秘書', example_en: 'His secretary answered the phone during the meeting.', example_zh: '會議期間他的秘書接了電話。', tier: '基礎' },
  { word: 'singer', pos: 'n.', phonetic: '/ˈsɪŋər/', definition: 'a person who sings, especially as a job', definition_zh: '歌手', example_en: 'The singer performed her new song on stage.', example_zh: '那位歌手在台上表演她的新歌。', tier: '基礎' },
  { word: 'waitress', pos: 'n.', phonetic: '/ˈweɪtrɪs/', definition: 'a woman whose job is to serve food in a restaurant', definition_zh: '女服務生', example_en: 'The waitress brought us menus and a glass of water.', example_zh: '那位女服務生拿了菜單和一杯水給我們。', tier: '基礎' },
  // ── 進階學習篇 ──
  { word: 'adviser', pos: 'n.', phonetic: '/ədˈvaɪzər/', definition: 'a person who gives advice about a subject', definition_zh: '顧問；指導者', example_en: 'The club needs an adviser to guide the students.', example_zh: '社團需要一位顧問指導學生。', tier: '進階' },
  { word: 'babysitter', pos: 'n.', phonetic: '/ˈbeɪbiˌsɪtər/', definition: 'a person who is paid to take care of children while the parents are out', definition_zh: '臨時保母', example_en: 'The babysitter played games with the kids all afternoon.', example_zh: '那位保母整個下午都在跟孩子們玩遊戲。', tier: '進階' },
  { word: 'banker', pos: 'n.', phonetic: '/ˈbæŋkər/', definition: 'a person who has an important job in a bank', definition_zh: '銀行家；銀行員', example_en: 'My cousin works as a banker in the city.', example_zh: '我表哥在城裡當銀行員。', tier: '進階' },
  { word: 'chairman', pos: 'n.', phonetic: '/ˈtʃɛrmən/', definition: 'the person in charge of a meeting or a company', definition_zh: '主席；董事長', example_en: 'The chairman opened the meeting with a short speech.', example_zh: '主席以簡短的演說開啟這場會議。', tier: '進階' },
  { word: 'collector', pos: 'n.', phonetic: '/kəˈlɛktər/', definition: 'a person whose job or hobby is collecting things', definition_zh: '收藏家；收集者', example_en: 'He is a collector of old coins from other countries.', example_zh: '他是收藏外國舊硬幣的收藏家。', tier: '進階' },
  { word: 'cowboy', pos: 'n.', phonetic: '/ˈkaʊbɔɪ/', definition: 'a man whose job is to look after cattle, often on horseback', definition_zh: '牛仔', example_en: 'The cowboy rode his horse across the wide field.', example_zh: '那位牛仔騎著馬穿越寬廣的原野。', tier: '進階' },
  { word: 'dealer', pos: 'n.', phonetic: '/ˈdilər/', definition: 'a person whose job is buying and selling a particular kind of thing', definition_zh: '經銷商；買賣者', example_en: 'My uncle is a used car dealer in Taipei.', example_zh: '我叔叔在台北是位二手車經銷商。', tier: '進階' },
  { word: 'designer', pos: 'n.', phonetic: '/dɪˈzaɪnər/', definition: 'a person who plans how something will look or work', definition_zh: '設計師', example_en: 'The designer created a new logo for the school.', example_zh: '那位設計師為學校設計了新的標誌。', tier: '進階' },
  { word: 'diplomat', pos: 'n.', phonetic: '/ˈdɪpləˌmæt/', definition: 'a person whose job is to represent their country in another country', definition_zh: '外交官', example_en: 'The diplomat traveled to many countries for her job.', example_zh: '那位外交官因為工作到過許多國家。', tier: '進階' },
  { word: 'director', pos: 'n.', phonetic: '/dəˈrɛktər/', definition: 'a person who controls how a film, play, or company is made or run', definition_zh: '導演；主管', example_en: 'The director shouted "Action!" to start the scene.', example_zh: '導演喊「開拍！」讓這場戲開始。', tier: '進階' },
  { word: 'dramatist', pos: 'n.', phonetic: '/ˈdræmətɪst/', definition: 'a person who writes plays', definition_zh: '劇作家', example_en: 'The famous dramatist wrote plays about ordinary life.', example_zh: '那位知名劇作家寫關於平凡生活的劇本。', tier: '進階' },
  { word: 'educator', pos: 'n.', phonetic: '/ˈɛdʒʊˌkeɪtər/', definition: 'a person whose job is to teach or train people', definition_zh: '教育工作者', example_en: 'She became an educator to help children learn better.', example_zh: '她成為一位教育工作者，幫助孩子學得更好。', tier: '進階' },
  { word: 'electrician', pos: 'n.', phonetic: '/ɪˌlɛkˈtrɪʃən/', definition: 'a person whose job is to install or fix electrical equipment', definition_zh: '電工', example_en: 'We called an electrician to fix the broken light.', example_zh: '我們找了一位電工來修壞掉的燈。', tier: '進階' },
  { word: 'governor', pos: 'n.', phonetic: '/ˈgʌvərnər/', definition: 'a person who officially controls a state or organization', definition_zh: '州長；首長', example_en: 'The governor gave a speech about new school rules.', example_zh: '州長針對新的學校規定發表演說。', tier: '進階' },
  { word: 'guard', pos: 'n.', phonetic: '/gɑrd/', definition: 'a person whose job is to protect a place or people', definition_zh: '警衛；守衛', example_en: 'A guard stood quietly at the museum entrance.', example_zh: '一位警衛靜靜地站在博物館入口。', tier: '進階' },
  { word: 'guide', pos: 'n.', phonetic: '/gaɪd/', definition: 'a person whose job is to show tourists around a place', definition_zh: '導遊；嚮導', example_en: 'Our guide showed us the temple’s long history.', example_zh: '我們的導遊向我們介紹這座廟悠久的歷史。', tier: '進階' },
  { word: 'hire', pos: 'v.', phonetic: '/haɪr/', definition: 'to give someone a job', definition_zh: '雇用', example_en: 'The restaurant plans to hire two new waiters.', example_zh: '那間餐廳打算雇用兩位新的服務生。', tier: '進階' },
  { word: 'historian', pos: 'n.', phonetic: '/hɪˈstɔriən/', definition: 'a person who studies or writes about history', definition_zh: '歷史學家', example_en: 'The historian explained why the war started.', example_zh: '那位歷史學家解釋這場戰爭為何爆發。', tier: '進階' },
  { word: 'hunter', pos: 'n.', phonetic: '/ˈhʌntər/', definition: 'a person who hunts wild animals for food or sport', definition_zh: '獵人', example_en: 'The hunter followed the deer’s tracks into the forest.', example_zh: '獵人循著鹿的足跡走進森林。', tier: '進階' },
  { word: 'industry', pos: 'n.', phonetic: '/ˈɪndəstri/', definition: 'a particular kind of business or trade', definition_zh: '產業；工業', example_en: 'The tourism industry brings many jobs to this island.', example_zh: '觀光產業為這座島帶來許多工作機會。', tier: '進階' },
  { word: 'journalist', pos: 'n.', phonetic: '/ˈdʒɜrnəlɪst/', definition: 'a person who writes news reports for newspapers or TV', definition_zh: '記者', example_en: 'The journalist interviewed the mayor about the new park.', example_zh: '那位記者針對新公園採訪了市長。', tier: '進階' },
  { word: 'judge', pos: 'n.', phonetic: '/dʒʌdʒ/', definition: 'a person who decides how to punish someone in court', definition_zh: '法官', example_en: 'The judge listened carefully to both sides of the case.', example_zh: '法官仔細聽取雙方的說法。', tier: '進階' },
  { word: 'magician', pos: 'n.', phonetic: '/məˈdʒɪʃən/', definition: 'a person who performs magic tricks to entertain people', definition_zh: '魔術師', example_en: 'The magician pulled a rabbit out of his hat.', example_zh: '魔術師從帽子裡變出一隻兔子。', tier: '進階' },
  { word: 'mechanic', pos: 'n.', phonetic: '/məˈkænɪk/', definition: 'a person whose job is to repair machines or vehicles', definition_zh: '技工；機械師', example_en: 'The mechanic fixed our car’s engine in an hour.', example_zh: '那位技工一小時內就修好了我們的車子引擎。', tier: '進階' },
  { word: 'military', pos: 'n.', phonetic: '/ˈmɪləˌtɛri/', definition: 'the armed forces of a country, such as the army or navy', definition_zh: '軍方；軍隊', example_en: 'His father served in the military for ten years.', example_zh: '他的父親在軍中服役了十年。', tier: '進階' },
  { word: 'model', pos: 'n.', phonetic: '/ˈmɑdəl/', definition: 'a person whose job is to wear and show new clothes', definition_zh: '模特兒', example_en: 'The model walked confidently down the fashion runway.', example_zh: '那位模特兒自信地走在時尚伸展台上。', tier: '進階' },
  { word: 'musician', pos: 'n.', phonetic: '/mjuˈzɪʃən/', definition: 'a person who plays a musical instrument as a job or hobby', definition_zh: '音樂家', example_en: 'The young musician practiced the violin every evening.', example_zh: '那位年輕音樂家每天晚上都練習小提琴。', tier: '進階' },
  { word: 'occupation', pos: 'n.', phonetic: '/ˌɑkjəˈpeɪʃən/', definition: 'a person’s job or profession', definition_zh: '職業', example_en: 'Please write your name and occupation on the form.', example_zh: '請在表格上寫下你的姓名和職業。', tier: '進階' },
  { word: 'operator', pos: 'n.', phonetic: '/ˈɑpəˌreɪtər/', definition: 'a person who controls a machine or a phone system as a job', definition_zh: '操作員；接線生', example_en: 'The phone operator connected us to customer service.', example_zh: '電話接線生把我們轉接到客服部門。', tier: '進階' },
  { word: 'personnel', pos: 'n.', phonetic: '/ˌpɜrsəˈnɛl/', definition: 'the people who work for a company or organization', definition_zh: '（全體）員工；人事部門', example_en: 'All new personnel must attend the training on Monday.', example_zh: '所有新進員工都必須參加星期一的訓練。', tier: '進階' },
  { word: 'photographer', pos: 'n.', phonetic: '/fəˈtɑgrəfər/', definition: 'a person whose job is to take photographs', definition_zh: '攝影師', example_en: 'The photographer took pictures of the wedding all day.', example_zh: '那位攝影師整天都在拍婚禮的照片。', tier: '進階' },
  { word: 'physician', pos: 'n.', phonetic: '/fɪˈzɪʃən/', definition: 'a doctor who treats people with medicine', definition_zh: '內科醫生', example_en: 'The physician checked his heartbeat during the exam.', example_zh: '內科醫生在檢查時聽了他的心跳。', tier: '進階' },
  { word: 'physicist', pos: 'n.', phonetic: '/ˈfɪzəsɪst/', definition: 'a scientist who studies physics', definition_zh: '物理學家', example_en: 'The physicist explained why the sky looks blue.', example_zh: '那位物理學家解釋天空為什麼是藍色的。', tier: '進階' },
  { word: 'president', pos: 'n.', phonetic: '/ˈprɛzədənt/', definition: 'the leader of a country or organization', definition_zh: '總統；總裁；社長', example_en: 'The president gave a speech about education reform.', example_zh: '總統針對教育改革發表了演說。', tier: '進階' },
  { word: 'priest', pos: 'n.', phonetic: '/prist/', definition: 'a person who leads religious ceremonies, especially in a church', definition_zh: '神父；牧師', example_en: 'The priest welcomed everyone into the small church.', example_zh: '神父歡迎大家進入這間小教堂。', tier: '進階' },
  { word: 'printer', pos: 'n.', phonetic: '/ˈprɪntər/', definition: 'a person or company whose job is printing books or papers', definition_zh: '印刷業者；印表機', example_en: 'The printer finished the school yearbook on time.', example_zh: '那間印刷廠準時完成了學校的畢業紀念冊。', tier: '進階' },
  { word: 'product', pos: 'n.', phonetic: '/ˈprɑdʌkt/', definition: 'something that is made to be sold', definition_zh: '產品', example_en: 'The company launched a new product last week.', example_zh: '那間公司上星期推出了一項新產品。', tier: '進階' },
  { word: 'profession', pos: 'n.', phonetic: '/prəˈfɛʃən/', definition: 'a job that needs special training or education', definition_zh: '專業；職業', example_en: 'Teaching is a profession that requires great patience.', example_zh: '教學是一項需要極大耐心的專業。', tier: '進階' },
  { word: 'professor', pos: 'n.', phonetic: '/prəˈfɛsər/', definition: 'a senior teacher at a university', definition_zh: '教授', example_en: 'The professor gave a lecture about ancient history.', example_zh: '那位教授做了一場關於古代歷史的演講。', tier: '進階' },
  { word: 'rent', pos: 'v.', phonetic: '/rɛnt/', definition: 'to pay money to use something that belongs to someone else', definition_zh: '租；租用', example_en: 'They decided to rent a small apartment near school.', example_zh: '他們決定在學校附近租一間小公寓。', tier: '進階' },
  { word: 'sailor', pos: 'n.', phonetic: '/ˈseɪlər/', definition: 'a person who works on a ship', definition_zh: '水手', example_en: 'The sailor checked the ropes before the ship left.', example_zh: '船出發前，那位水手檢查了繩索。', tier: '進階' },
  { word: 'servant', pos: 'n.', phonetic: '/ˈsɜrvənt/', definition: 'a person who is paid to work in someone’s house', definition_zh: '僕人；傭人', example_en: 'The old story is about a kind servant and a king.', example_zh: '這個古老的故事是關於一位善良的僕人和國王。', tier: '進階' },
  { word: 'serve', pos: 'v.', phonetic: '/sɜrv/', definition: 'to give someone food or drinks, or to work for a person or place', definition_zh: '服務；供應', example_en: 'The restaurant serves lunch from eleven to two.', example_zh: '這家餐廳供應午餐時間是十一點到兩點。', tier: '進階' },
  { word: 'trade', pos: 'n.', phonetic: '/treɪd/', definition: 'the buying and selling of goods between people or countries', definition_zh: '貿易；交易', example_en: 'The two countries signed a new trade agreement.', example_zh: '這兩個國家簽署了一項新的貿易協議。', tier: '進階' },
  { word: 'trader', pos: 'n.', phonetic: '/ˈtreɪdər/', definition: 'a person who buys and sells goods as a job', definition_zh: '商人；交易員', example_en: 'The trader sold silk at the busy market.', example_zh: '那位商人在熱鬧的市場裡賣絲綢。', tier: '進階' },
  { word: 'vendor', pos: 'n.', phonetic: '/ˈvɛndər/', definition: 'a person who sells things, often outside or in a market', definition_zh: '小販', example_en: 'A vendor sold cold drinks near the night market gate.', example_zh: '一位小販在夜市入口附近賣冷飲。', tier: '進階' },
];

async function main() {
  console.log(`準備寫入 ${ENTRIES.length} 個新字（Unit3）...`);
  let inserted = 0, skipped = 0, failed = 0;

  for (const e of ENTRIES) {
    const { data: existing } = await supabase.from('words').select('id').ilike('word', e.word).limit(1);
    if (existing && existing.length) {
      console.log(`  ⏭️  ${e.word} 已存在，跳過新增，改為補上 unit3 標籤`);
      const { data: row } = await supabase.from('words').select('tags').eq('id', existing[0].id).single();
      const newTags = Array.from(new Set([...(row?.tags || []), 'unit3']));
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
      tags: ['cap_2000', 'unit3', e.tier],
      level: 1,
    });
    if (error) { console.error(`  ❌ ${e.word} 寫入失敗:`, error.message); failed++; }
    else { console.log(`  ✅ ${e.word}`); inserted++; }
  }

  console.log(`\n完成：新增 ${inserted} 筆、跳過(已存在) ${skipped} 筆、失敗 ${failed} 筆`);
}

main().catch(err => { console.error(err); process.exit(1); });
