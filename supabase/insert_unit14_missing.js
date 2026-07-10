/**
 * 補齊 Unit 14（運動、興趣、嗜好）在 words 表裡缺少的 27 個字，原創生成內容。
 */
require('dotenv').config({ path: 'C:\\Users\\qaz10\\Desktop\\claude agent\\vocatopia\\.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const ENTRIES = [
  { word: 'comic book', pos: 'n.', phonetic: '/ˈkɑmɪk bʊk/', definition: 'a book that tells a story mainly through pictures', definition_zh: '漫畫書', example_en: 'He reads a comic book every night before bed.', example_zh: '他每晚睡前都會看一本漫畫書。', tier: '基礎' },
  { word: 'computer game', pos: 'n.', phonetic: '/kəmˈpjutər geɪm/', definition: 'a game played on a computer', definition_zh: '電腦遊戲', example_en: 'They played a computer game together after school.', example_zh: '他們放學後一起玩了電腦遊戲。', tier: '基礎' },
  { word: 'dodgeball', pos: 'n.', phonetic: '/ˈdɑdʒbɔl/', definition: 'a game in which players throw a ball to hit other players', definition_zh: '躲避球', example_en: 'Our class plays dodgeball during PE class.', example_zh: '我們班上體育課會玩躲避球。', tier: '基礎' },
  { word: 'frisbee', pos: 'n.', phonetic: '/ˈfrɪzbi/', definition: 'a flat plastic disc that people throw and catch as a game', definition_zh: '飛盤', example_en: 'They threw a frisbee on the beach all afternoon.', example_zh: '他們整個下午都在沙灘上丟飛盤。', tier: '基礎' },
  { word: 'hike', pos: 'v.', phonetic: '/haɪk/', definition: 'to walk a long distance, especially in the mountains', definition_zh: '健行；徒步旅行', example_en: 'We hiked up the mountain early in the morning.', example_zh: '我們一大早就去爬山健行。', tier: '基礎' },
  { word: 'net', pos: 'n.', phonetic: '/nɛt/', definition: 'material made of crossed strings, used in sports like tennis or volleyball', definition_zh: '網子', example_en: 'The ball hit the net during the volleyball game.', example_zh: '排球比賽時球打到了球網。', tier: '基礎' },
  { word: 'drum', pos: 'n.', phonetic: '/drʌm/', definition: 'a musical instrument that you hit to make sound', definition_zh: '鼓', example_en: 'He plays the drum in the school band.', example_zh: '他在學校樂隊裡打鼓。', tier: '基礎' },
  { word: 'player', pos: 'n.', phonetic: '/ˈpleɪər/', definition: 'a person who takes part in a game or sport', definition_zh: '選手；玩家', example_en: 'Every player on the team practiced hard for the game.', example_zh: '球隊裡的每位選手都為比賽努力練習。', tier: '基礎' },
  { word: 'race', pos: 'n.', phonetic: '/reɪs/', definition: 'a competition to see who is the fastest', definition_zh: '比賽；賽跑', example_en: 'She won first place in the school running race.', example_zh: '她在學校賽跑中得到第一名。', tier: '基礎' },
  { word: 'skate', pos: 'v.', phonetic: '/skeɪt/', definition: 'to move smoothly on ice or wheels', definition_zh: '溜冰；滑冰', example_en: 'They like to skate at the park on weekends.', example_zh: '他們週末喜歡在公園溜冰。', tier: '基礎' },
  { word: 'sport', pos: 'n.', phonetic: '/spɔrt/', definition: 'a physical activity done for exercise or competition', definition_zh: '運動', example_en: 'Basketball is his favorite sport to play.', example_zh: '籃球是他最喜歡的運動。', tier: '基礎' },
  { word: 'stamp', pos: 'n.', phonetic: '/stæmp/', definition: 'a small piece of paper stuck on a letter to show it has been paid for', definition_zh: '郵票', example_en: 'He collects stamps from different countries.', example_zh: '他收集來自不同國家的郵票。', tier: '基礎' },
  { word: 'surf', pos: 'v.', phonetic: '/sɜrf/', definition: 'to ride on ocean waves using a special board', definition_zh: '衝浪', example_en: 'They went to the beach to surf every summer.', example_zh: '他們每年夏天都去海邊衝浪。', tier: '基礎' },
  { word: 'swing', pos: 'v.', phonetic: '/swɪŋ/', definition: 'to move back and forth or side to side', definition_zh: '擺盪；揮動', example_en: 'He swung the bat and hit the ball hard.', example_zh: '他揮棒把球打得很遠。', tier: '基礎' },
  { word: 'the internet', pos: 'n.', phonetic: '/ði ˈɪntərˌnɛt/', definition: 'the large system of connected computers that lets people find information online', definition_zh: '網際網路', example_en: 'She looks up information on the internet for homework.', example_zh: '她在網路上查資料做作業。', tier: '基礎' },
  { word: 'collection', pos: 'n.', phonetic: '/kəˈlɛkʃən/', definition: 'a group of things gathered together, especially as a hobby', definition_zh: '收藏；收集品', example_en: 'His stamp collection has more than two hundred pieces.', example_zh: '他的郵票收藏超過兩百張。', tier: '進階' },
  { word: 'golf', pos: 'n.', phonetic: '/gɑlf/', definition: 'a sport in which players hit a small ball into holes', definition_zh: '高爾夫球', example_en: 'Her grandfather plays golf every weekend.', example_zh: '她爺爺每個週末都打高爾夫球。', tier: '進階' },
  { word: 'instrument', pos: 'n.', phonetic: '/ˈɪnstrəmənt/', definition: 'an object used to make music', definition_zh: '樂器', example_en: 'The piano is her favorite musical instrument.', example_zh: '鋼琴是她最喜歡的樂器。', tier: '進階' },
  { word: 'magazine', pos: 'n.', phonetic: '/ˈmægəˌzin/', definition: 'a thin book with pictures and articles, published regularly', definition_zh: '雜誌', example_en: 'He reads a sports magazine on the bus every week.', example_zh: '他每星期都在公車上看運動雜誌。', tier: '進階' },
  { word: 'MTV', pos: 'n.', phonetic: '/ˌɛm ti ˈvi/', definition: 'a channel or place for watching music videos', definition_zh: 'MTV（音樂電視）', example_en: 'They watched MTV together at the store after school.', example_zh: '他們放學後一起在店裡看MTV。', tier: '進階' },
  { word: 'novel', pos: 'n.', phonetic: '/ˈnɑvəl/', definition: 'a long written story about made-up people and events', definition_zh: '小說', example_en: 'She finished reading a mystery novel last weekend.', example_zh: '她上週末讀完了一本推理小說。', tier: '進階' },
  { word: 'program', pos: 'n.', phonetic: '/ˈproʊgræm/', definition: 'a show on television or radio', definition_zh: '節目', example_en: 'They watch a music program every Saturday night.', example_zh: '他們每個星期六晚上都看一個音樂節目。', tier: '進階' },
  { word: 'record', pos: 'v.', phonetic: '/rɪˈkɔrd/', definition: 'to save sound, video, or information for later', definition_zh: '錄製；記錄', example_en: 'He recorded his sister singing on his phone.', example_zh: '他用手機錄下妹妹唱歌的樣子。', tier: '進階' },
  { word: 'strike', pos: 'v.', phonetic: '/straɪk/', definition: 'to hit something or someone hard', definition_zh: '打；擊中', example_en: 'The batter struck the ball over the fence.', example_zh: '打者把球打過了圍牆。', tier: '進階' },
  { word: 'trumpet', pos: 'n.', phonetic: '/ˈtrʌmpɪt/', definition: 'a brass musical instrument played by blowing air into it', definition_zh: '小號', example_en: 'He practices the trumpet after school every day.', example_zh: '他每天放學後練習吹小號。', tier: '進階' },
  { word: 'volleyball', pos: 'n.', phonetic: '/ˈvɑliˌbɔl/', definition: 'a sport in which two teams hit a ball over a net', definition_zh: '排球', example_en: 'Our class won the volleyball match yesterday.', example_zh: '我們班昨天贏了排球比賽。', tier: '進階' },
  { word: 'Walkman', pos: 'n.', phonetic: '/ˈwɔkmæn/', definition: 'a small portable machine used for listening to music while walking', definition_zh: '隨身聽', example_en: 'His father used a Walkman to listen to music long ago.', example_zh: '他爸爸以前用隨身聽聽音樂。', tier: '進階' },
];

async function main() {
  console.log(`準備寫入 Unit14 共 ${ENTRIES.length} 個新字...`);
  let inserted = 0, skipped = 0, failed = 0;
  for (const e of ENTRIES) {
    const { data: existing } = await supabase.from('words').select('id, tags').ilike('word', e.word).limit(1);
    if (existing && existing.length) {
      console.log(`  ⏭️  ${e.word} 已存在，跳過新增，改為補上 unit14 標籤`);
      const newTags = Array.from(new Set([...(existing[0].tags || []), 'unit14']));
      await supabase.from('words').update({ tags: newTags }).eq('id', existing[0].id);
      skipped++;
      continue;
    }
    const { error } = await supabase.from('words').insert({
      word: e.word, pos: e.pos, phonetic: e.phonetic,
      definition: e.definition, definition_zh: e.definition_zh,
      example_en: e.example_en, example_zh: e.example_zh,
      tags: ['cap_2000', 'unit14', e.tier],
      level: 1,
    });
    if (error) { console.error(`  ❌ ${e.word} 寫入失敗:`, error.message); failed++; }
    else { console.log(`  ✅ ${e.word}`); inserted++; }
  }
  console.log(`\n完成：新增 ${inserted} 筆、跳過(已存在) ${skipped} 筆、失敗 ${failed} 筆`);
}

main().catch(err => { console.error(err); process.exit(1); });
