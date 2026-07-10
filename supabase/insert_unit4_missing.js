/**
 * 補齊 Unit 4（人物和稱呼）在 words 表裡缺少的 30 個字。
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const ENTRIES = [
  // ── 基礎學習篇 ──
  { word: 'kid', pos: 'n.', phonetic: '/kɪd/', definition: 'a child (used in everyday conversation)', definition_zh: '小孩', example_en: 'The kids played tag in the park all afternoon.', example_zh: '孩子們整個下午都在公園裡玩鬼抓人。', tier: '基礎' },
  { word: 'Mr.', pos: 'n.', phonetic: '/ˈmɪstər/', definition: 'a title used before a man’s name', definition_zh: '先生', example_en: 'Mr. Chen teaches math at our school.', example_zh: '陳先生在我們學校教數學。', tier: '基礎' },
  { word: 'Mrs.', pos: 'n.', phonetic: '/ˈmɪsəz/', definition: 'a title used before a married woman’s name', definition_zh: '太太；夫人', example_en: 'Mrs. Wang lives next door to my grandmother.', example_zh: '王太太住在我奶奶隔壁。', tier: '基礎' },
  { word: 'Ms.', pos: 'n.', phonetic: '/mɪz/', definition: 'a title used before a woman’s name, married or not', definition_zh: '女士', example_en: 'Ms. Lin will be our new homeroom teacher.', example_zh: '林女士將成為我們新的班導師。', tier: '基礎' },
  { word: 'prince', pos: 'n.', phonetic: '/prɪns/', definition: 'the son of a king or queen', definition_zh: '王子', example_en: 'The prince rode his horse through the village.', example_zh: '王子騎著馬穿過村莊。', tier: '基礎' },
  { word: 'princess', pos: 'n.', phonetic: '/ˈprɪnsəs/', definition: 'the daughter of a king or queen', definition_zh: '公主', example_en: 'The princess wore a beautiful golden dress.', example_zh: '公主穿著一件美麗的金色洋裝。', tier: '基礎' },
  { word: 'queen', pos: 'n.', phonetic: '/kwin/', definition: 'a woman who rules a country, or the wife of a king', definition_zh: '皇后；女王', example_en: 'The queen waved to the crowd from the balcony.', example_zh: '女王從陽台向群眾揮手。', tier: '基礎' },
  { word: 'sir', pos: 'n.', phonetic: '/sɜr/', definition: 'a polite way to speak to a man', definition_zh: '先生（禮貌稱呼）', example_en: '"Excuse me, sir, may I ask a question?"', example_zh: '「不好意思，先生，我可以問個問題嗎？」', tier: '基礎' },
  // ── 進階學習篇 ──
  { word: 'couple', pos: 'n.', phonetic: '/ˈkʌpəl/', definition: 'two people who are married or in a relationship', definition_zh: '一對情侶／夫妻', example_en: 'The couple walked hand in hand along the beach.', example_zh: '那對情侶手牽手沿著海灘散步。', tier: '進階' },
  { word: 'creator', pos: 'n.', phonetic: '/kriˈeɪtər/', definition: 'a person who makes or invents something', definition_zh: '創造者', example_en: 'The creator of the app is only twenty years old.', example_zh: '那個應用程式的創造者只有二十歲。', tier: '進階' },
  { word: 'Dr.', pos: 'n.', phonetic: '/ˈdɑktər/', definition: 'a title used before the name of a doctor', definition_zh: '博士；醫生（稱謂）', example_en: 'Dr. Lee checked my ears and throat carefully.', example_zh: '李醫生仔細檢查了我的耳朵和喉嚨。', tier: '進階' },
  { word: 'follower', pos: 'n.', phonetic: '/ˈfɑloʊər/', definition: 'a person who supports or copies another person’s ideas', definition_zh: '追隨者；跟隨者', example_en: 'The singer has millions of followers online.', example_zh: '那位歌手在網路上有數百萬個追隨者。', tier: '進階' },
  { word: 'God', pos: 'n.', phonetic: '/gɑd/', definition: 'the being that some religions believe created the world', definition_zh: '上帝；神', example_en: 'Many people pray to God before important events.', example_zh: '許多人在重要事情前會向上帝祈禱。', tier: '進階' },
  { word: 'goddess', pos: 'n.', phonetic: '/ˈgɑdəs/', definition: 'a female god in an old religion or story', definition_zh: '女神', example_en: 'The old story tells of a goddess who protects the sea.', example_zh: '這個古老的故事講述一位守護海洋的女神。', tier: '進階' },
  { word: 'guest', pos: 'n.', phonetic: '/gɛst/', definition: 'a person who is invited to visit a place or event', definition_zh: '客人；訪客', example_en: 'We prepared special food for our guests tonight.', example_zh: '我們為今晚的客人準備了特別的食物。', tier: '進階' },
  { word: 'host', pos: 'n.', phonetic: '/hoʊst/', definition: 'a person who invites guests or leads a show', definition_zh: '主人；主持人', example_en: 'The show’s host asked the singer three questions.', example_zh: '節目主持人問了那位歌手三個問題。', tier: '進階' },
  { word: 'lady', pos: 'n.', phonetic: '/ˈleɪdi/', definition: 'a polite word for a woman', definition_zh: '女士', example_en: 'A kind lady helped me carry my heavy bags.', example_zh: '一位親切的女士幫我提沉重的袋子。', tier: '進階' },
  { word: 'leadership', pos: 'n.', phonetic: '/ˈlidərʃɪp/', definition: 'the ability or position to lead a group of people', definition_zh: '領導能力；領導地位', example_en: 'Her leadership helped the team win the contest.', example_zh: '她的領導能力幫助團隊贏得比賽。', tier: '進階' },
  { word: 'loser', pos: 'n.', phonetic: '/ˈluzər/', definition: 'a person who does not win, or fails often', definition_zh: '輸家；失敗者', example_en: 'He was a good loser and congratulated the winner.', example_zh: '他是個有風度的輸家，還恭喜了贏家。', tier: '進階' },
  { word: 'madam', pos: 'n.', phonetic: '/ˈmædəm/', definition: 'a polite word used to speak to a woman', definition_zh: '女士；夫人（禮貌稱呼）', example_en: '"Good morning, madam, how may I help you?"', example_zh: '「早安，女士，需要我幫忙嗎？」', tier: '進階' },
  { word: 'male', pos: 'n.', phonetic: '/meɪl/', definition: 'a person or animal that is a man or boy', definition_zh: '男性；雄性', example_en: 'The zoo has both a male and a female lion.', example_zh: '這間動物園有一隻公獅和一隻母獅。', tier: '進階' },
  { word: 'master', pos: 'n.', phonetic: '/ˈmæstər/', definition: 'a person who has great skill, or who controls something', definition_zh: '大師；主人', example_en: 'The martial arts master trained students every weekend.', example_zh: '那位武術大師每個週末都訓練學生。', tier: '進階' },
  { word: 'partner', pos: 'n.', phonetic: '/ˈpɑrtnər/', definition: 'a person who does an activity or business with someone else', definition_zh: '夥伴；搭檔', example_en: 'Choose a partner for tomorrow’s science project.', example_zh: '請為明天的科學專題選一位夥伴。', tier: '進階' },
  { word: 'passenger', pos: 'n.', phonetic: '/ˈpæsəndʒər/', definition: 'a person traveling in a car, bus, plane, or train, but not driving it', definition_zh: '乘客', example_en: 'All passengers must wear a seat belt on the bus.', example_zh: '公車上所有乘客都必須繫安全帶。', tier: '進階' },
  { word: 'prisoner', pos: 'n.', phonetic: '/ˈprɪzənər/', definition: 'a person who is kept in prison as a punishment', definition_zh: '囚犯', example_en: 'The old movie is about a prisoner who escapes.', example_zh: '那部老電影是關於一名逃獄囚犯的故事。', tier: '進階' },
  { word: 'speaker', pos: 'n.', phonetic: '/ˈspikər/', definition: 'a person who gives a speech, or a machine that makes sound', definition_zh: '演講者；喇叭', example_en: 'The speaker talked about protecting the environment.', example_zh: '那位講者談到了保護環境的議題。', tier: '進階' },
  { word: 'thief', pos: 'n.', phonetic: '/θif/', definition: 'a person who steals things', definition_zh: '小偷', example_en: 'A thief took her bike from outside the store.', example_zh: '一個小偷從商店外偷走了她的腳踏車。', tier: '進階' },
  { word: 'user', pos: 'n.', phonetic: '/ˈjuzər/', definition: 'a person who uses a product or service', definition_zh: '使用者', example_en: 'This app has more than one million users worldwide.', example_zh: '這個應用程式在全世界有超過一百萬名使用者。', tier: '進階' },
  { word: 'winner', pos: 'n.', phonetic: '/ˈwɪnər/', definition: 'a person who wins a game, race, or competition', definition_zh: '贏家；獲勝者', example_en: 'The winner received a trophy and a big smile.', example_zh: '那位贏家得到了一座獎盃和滿臉的笑容。', tier: '進階' },
  { word: 'youth', pos: 'n.', phonetic: '/juθ/', definition: 'the time when a person is young, or young people in general', definition_zh: '青春；青少年（統稱）', example_en: 'She spent her youth traveling around the country.', example_zh: '她的青春歲月都在環遊這個國家。', tier: '進階' },
];

async function main() {
  console.log(`準備寫入 ${ENTRIES.length} 個新字（Unit4）...`);
  let inserted = 0, skipped = 0, failed = 0;

  for (const e of ENTRIES) {
    const { data: existing } = await supabase.from('words').select('id').ilike('word', e.word).limit(1);
    if (existing && existing.length) {
      console.log(`  ⏭️  ${e.word} 已存在，跳過新增，改為補上 unit4 標籤`);
      const { data: row } = await supabase.from('words').select('tags').eq('id', existing[0].id).single();
      const newTags = Array.from(new Set([...(row?.tags || []), 'unit4']));
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
      tags: ['cap_2000', 'unit4', e.tier],
      level: 1,
    });
    if (error) { console.error(`  ❌ ${e.word} 寫入失敗:`, error.message); failed++; }
    else { console.log(`  ✅ ${e.word}`); inserted++; }
  }

  console.log(`\n完成：新增 ${inserted} 筆、跳過(已存在) ${skipped} 筆、失敗 ${failed} 筆`);
}

main().catch(err => { console.error(err); process.exit(1); });
