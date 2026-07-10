/**
 * 補齊 Unit 13（學校、科目、文具）在 words 表裡缺少的 59 個字，原創生成內容。
 */
require('dotenv').config({ path: 'C:\\Users\\qaz10\\Desktop\\claude agent\\vocatopia\\.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const ENTRIES = [
  { word: 'chalk', pos: 'n.', phonetic: '/tʃɔk/', definition: 'a soft white stick used for writing on a blackboard', definition_zh: '粉筆', example_en: 'The teacher wrote the answer on the board with chalk.', example_zh: '老師用粉筆把答案寫在黑板上。', tier: '基礎' },
  { word: 'cheerleader', pos: 'n.', phonetic: '/ˈtʃɪrˌlidər/', definition: 'a person who leads cheers and dances at sports events', definition_zh: '啦啦隊員', example_en: 'She became a cheerleader for the school basketball team.', example_zh: '她成為學校籃球隊的啦啦隊員。', tier: '基礎' },
  { word: 'Chinese', pos: 'n.', phonetic: '/tʃaɪˈniz/', definition: 'the language spoken in China and Taiwan, or a school subject', definition_zh: '中文；國語（科目）', example_en: 'We have Chinese class every morning at school.', example_zh: '我們每天早上在學校上國語課。', tier: '基礎' },
  { word: 'class leader', pos: 'n.', phonetic: '/klæs ˈlidər/', definition: 'a student chosen to help lead and organize the class', definition_zh: '班長', example_en: 'The class leader collects homework every morning.', example_zh: '班長每天早上收作業。', tier: '基礎' },
  { word: 'copy', pos: 'v.', phonetic: '/ˈkɑpi/', definition: 'to write down words exactly as they appear somewhere else', definition_zh: '抄寫；複製', example_en: 'He copied the notes from the whiteboard into his book.', example_zh: '他把白板上的筆記抄進他的本子裡。', tier: '基礎' },
  { word: 'correct', pos: 'adj.', phonetic: '/kəˈrɛkt/', definition: 'right or true, without any mistakes', definition_zh: '正確的', example_en: 'She gave the correct answer to every question.', example_zh: '她每一題都答對了。', tier: '基礎' },
  { word: 'count', pos: 'v.', phonetic: '/kaʊnt/', definition: 'to say numbers in order', definition_zh: '數數；計算', example_en: 'The kids counted their stickers after class.', example_zh: '孩子們下課後數了他們的貼紙。', tier: '基礎' },
  { word: 'elementary school', pos: 'n.', phonetic: '/ˌɛləˈmɛntəri skul/', definition: 'a school for children usually aged six to twelve', definition_zh: '國小', example_en: 'My little sister still goes to elementary school.', example_zh: '我妹妹還在讀國小。', tier: '基礎' },
  { word: 'eraser', pos: 'n.', phonetic: '/ɪˈreɪsər/', definition: 'a small object used to remove pencil marks', definition_zh: '橡皮擦', example_en: 'He borrowed an eraser to fix his mistake.', example_zh: '他借了一塊橡皮擦來擦掉錯誤。', tier: '基礎' },
  { word: 'junior high school', pos: 'n.', phonetic: '/ˈdʒunjər haɪ skul/', definition: 'a school between elementary school and high school', definition_zh: '國中', example_en: 'She is in the second grade of junior high school.', example_zh: '她現在讀國中二年級。', tier: '基礎' },
  { word: 'marker', pos: 'n.', phonetic: '/ˈmɑrkər/', definition: 'a pen with a thick, colorful tip used for writing or drawing', definition_zh: '麥克筆', example_en: 'She used a red marker to write the title.', example_zh: '她用紅色麥克筆寫下標題。', tier: '基礎' },
  { word: 'pass', pos: 'v.', phonetic: '/pæs/', definition: 'to get a good enough score on a test', definition_zh: '通過；及格', example_en: 'He studied hard and passed the math test.', example_zh: '他認真讀書，數學考試及格了。', tier: '基礎' },
  { word: 'paste', pos: 'v.', phonetic: '/peɪst/', definition: 'to stick something onto a surface using glue', definition_zh: '黏貼', example_en: 'She pasted the picture into her notebook.', example_zh: '她把圖片黏貼到筆記本裡。', tier: '基礎' },
  { word: 'PE', pos: 'n.', phonetic: '/ˌpi ˈi/', definition: 'physical education, a school subject about sports and exercise', definition_zh: '體育（科目）', example_en: 'We play basketball in PE class on Fridays.', example_zh: '我們星期五的體育課會打籃球。', tier: '基礎' },
  { word: 'pencil box', pos: 'n.', phonetic: '/ˈpɛnsəl bɑks/', definition: 'a small box used to keep pencils and pens in', definition_zh: '鉛筆盒', example_en: 'He keeps his pens and rulers in his pencil box.', example_zh: '他把筆和尺放在鉛筆盒裡。', tier: '基礎' },
  { word: 'pin', pos: 'n.', phonetic: '/pɪn/', definition: 'a small thin piece of metal used to hold things together', definition_zh: '大頭針；別針', example_en: 'She used a pin to hang the notice on the board.', example_zh: '她用一根大頭針把公告釘在布告欄上。', tier: '基礎' },
  { word: 'repeat', pos: 'v.', phonetic: '/rɪˈpit/', definition: 'to say or do something again', definition_zh: '重複；重述', example_en: 'Please repeat the word after the teacher.', example_zh: '請跟著老師重複這個單字。', tier: '基礎' },
  { word: 'ruler', pos: 'n.', phonetic: '/ˈrulər/', definition: 'a flat, straight tool used for measuring or drawing lines', definition_zh: '尺；直尺', example_en: 'He used a ruler to draw a straight line.', example_zh: '他用尺畫了一條直線。', tier: '基礎' },
  { word: 'seesaw', pos: 'n.', phonetic: '/ˈsisɔ/', definition: 'a long board that children sit on and move up and down', definition_zh: '蹺蹺板', example_en: 'The kids played on the seesaw at recess.', example_zh: '孩子們下課時玩了蹺蹺板。', tier: '基礎' },
  { word: 'senior high school', pos: 'n.', phonetic: '/ˈsinjər haɪ skul/', definition: 'a school after junior high, usually for students aged fifteen to eighteen', definition_zh: '高中', example_en: 'My sister will start senior high school next year.', example_zh: '我姊姊明年就要讀高中了。', tier: '基礎' },
  { word: 'slide', pos: 'n.', phonetic: '/slaɪd/', definition: 'a smooth structure that children slide down on a playground', definition_zh: '溜滑梯', example_en: 'The little boy laughed as he went down the slide.', example_zh: '那個小男孩溜滑梯時笑得很開心。', tier: '基礎' },
  { word: 'swing', pos: 'n.', phonetic: '/swɪŋ/', definition: 'a seat hung from ropes or chains that moves back and forth', definition_zh: '鞦韆', example_en: 'She pushed her brother on the swing at the park.', example_zh: '她在公園推弟弟盪鞦韆。', tier: '基礎' },
  { word: 'write', pos: 'v.', phonetic: '/raɪt/', definition: 'to make words on paper using a pen or pencil', definition_zh: '寫；書寫', example_en: 'The students wrote their names on the test paper.', example_zh: '學生們把名字寫在考卷上。', tier: '基礎' },
  { word: 'chemistry', pos: 'n.', phonetic: '/ˈkɛməstri/', definition: 'the school subject about how substances change and react', definition_zh: '化學', example_en: 'He finds chemistry more interesting than physics.', example_zh: '他覺得化學比物理有趣。', tier: '進階' },
  { word: 'discussion', pos: 'n.', phonetic: '/dɪˈskʌʃən/', definition: 'a talk between people about a topic', definition_zh: '討論', example_en: 'The class had a discussion about the reading.', example_zh: '全班針對這篇文章進行了討論。', tier: '進階' },
  { word: 'engineering', pos: 'n.', phonetic: '/ˌɛndʒəˈnɪrɪŋ/', definition: 'the study of designing and building machines, roads, or structures', definition_zh: '工程學', example_en: 'He wants to study engineering at university.', example_zh: '他想在大學研讀工程學。', tier: '進階' },
  { word: 'friendship', pos: 'n.', phonetic: '/ˈfrɛndʃɪp/', definition: 'the relationship between friends', definition_zh: '友誼', example_en: 'Their friendship has lasted since elementary school.', example_zh: '他們的友誼從國小維持到現在。', tier: '進階' },
  { word: 'importance', pos: 'n.', phonetic: '/ɪmˈpɔrtəns/', definition: 'the quality of being important', definition_zh: '重要性', example_en: 'The teacher talked about the importance of reading.', example_zh: '老師談到閱讀的重要性。', tier: '進階' },
  { word: 'instance', pos: 'n.', phonetic: '/ˈɪnstəns/', definition: 'an example of something happening', definition_zh: '例子；實例', example_en: 'She gave an instance to explain the grammar rule.', example_zh: '她舉了一個例子來解釋這條文法規則。', tier: '進階' },
  { word: 'joke', pos: 'n.', phonetic: '/dʒoʊk/', definition: 'something said or done to make people laugh', definition_zh: '笑話', example_en: 'The teacher told a joke to make the class laugh.', example_zh: '老師講了一個笑話讓全班大笑。', tier: '進階' },
  { word: 'kindergarten', pos: 'n.', phonetic: '/ˈkɪndərˌgɑrtən/', definition: 'a school for very young children before elementary school', definition_zh: '幼稚園', example_en: 'He made his first friend in kindergarten.', example_zh: '他在幼稚園交到了第一個朋友。', tier: '進階' },
  { word: 'meaning', pos: 'n.', phonetic: '/ˈminɪŋ/', definition: 'what a word or sentence means', definition_zh: '意思；意義', example_en: 'She checked the dictionary for the word\'s meaning.', example_zh: '她查字典找這個字的意思。', tier: '進階' },
  { word: 'means', pos: 'n.', phonetic: '/minz/', definition: 'a way or method of doing something', definition_zh: '方法；手段', example_en: 'Walking is a healthy means of getting to school.', example_zh: '走路是一種健康的上學方法。', tier: '進階' },
  { word: 'method', pos: 'n.', phonetic: '/ˈmɛθəd/', definition: 'a particular way of doing something', definition_zh: '方法', example_en: 'The teacher used a fun method to teach grammar.', example_zh: '老師用了一個有趣的方法教文法。', tier: '進階' },
  { word: 'mistake', pos: 'n.', phonetic: '/məˈsteɪk/', definition: 'something done wrong', definition_zh: '錯誤', example_en: 'He checked his test again to find any mistakes.', example_zh: '他再次檢查考卷找出任何錯誤。', tier: '進階' },
  { word: 'object', pos: 'n.', phonetic: '/ˈɑbdʒɪkt/', definition: 'a thing that you can see or touch', definition_zh: '物體；物品', example_en: 'The teacher showed the class a strange object.', example_zh: '老師給全班看了一個奇怪的物體。', tier: '進階' },
  { word: 'physics', pos: 'n.', phonetic: '/ˈfɪzɪks/', definition: 'the school subject about matter, energy, and forces', definition_zh: '物理學', example_en: 'She is good at physics and math.', example_zh: '她物理和數學都很拿手。', tier: '進階' },
  { word: 'pressure', pos: 'n.', phonetic: '/ˈprɛʃər/', definition: 'a feeling of stress from having too much to do', definition_zh: '壓力', example_en: 'Students often feel pressure before final exams.', example_zh: '學生在期末考前常常感到壓力。', tier: '進階' },
  { word: 'principle', pos: 'n.', phonetic: '/ˈprɪnsəpəl/', definition: 'a basic rule or idea that explains how something works', definition_zh: '原理；原則', example_en: 'The teacher explained the basic principle of the science experiment.', example_zh: '老師解釋了這個科學實驗的基本原理。', tier: '進階' },
  { word: 'pronounce', pos: 'v.', phonetic: '/prəˈnaʊns/', definition: 'to say a word or sound in a certain way', definition_zh: '發音', example_en: 'She practiced how to pronounce the new English word.', example_zh: '她練習如何發這個新英文單字的音。', tier: '進階' },
  { word: 'punish', pos: 'v.', phonetic: '/ˈpʌnɪʃ/', definition: 'to make someone suffer because they did something wrong', definition_zh: '處罰', example_en: 'The teacher punished the students for being late.', example_zh: '老師處罰了遲到的學生。', tier: '進階' },
  { word: 'puzzle', pos: 'n.', phonetic: '/ˈpʌzəl/', definition: 'a game or problem that tests your thinking', definition_zh: '謎題；拼圖', example_en: 'They spent an hour solving the puzzle together.', example_zh: '他們花了一個小時一起解這個謎題。', tier: '進階' },
  { word: 'revise', pos: 'v.', phonetic: '/rɪˈvaɪz/', definition: 'to change or improve something, especially written work', definition_zh: '修改；修訂', example_en: 'She revised her essay before turning it in.', example_zh: '她在交作文之前修改了內容。', tier: '進階' },
  { word: 'rubber', pos: 'n.', phonetic: '/ˈrʌbər/', definition: 'a strong material that can bend and stretch', definition_zh: '橡膠；橡皮', example_en: 'The wheels of the cart are made of rubber.', example_zh: '推車的輪子是用橡膠做的。', tier: '進階' },
  { word: 'score', pos: 'n.', phonetic: '/skɔr/', definition: 'the number of points someone gets in a game or test', definition_zh: '分數', example_en: 'He got the highest score in the math quiz.', example_zh: '他數學小考拿到了最高分。', tier: '進階' },
  { word: 'semester', pos: 'n.', phonetic: '/səˈmɛstər/', definition: 'one of the two main parts of a school year', definition_zh: '學期', example_en: 'This is her last semester in junior high school.', example_zh: '這是她國中的最後一個學期。', tier: '進階' },
  { word: 'sheet', pos: 'n.', phonetic: '/ʃit/', definition: 'a single piece of paper', definition_zh: '一張紙；工作單', example_en: 'The teacher handed out a sheet of practice questions.', example_zh: '老師發下一張練習題的講義。', tier: '進階' },
  { word: 'skill', pos: 'n.', phonetic: '/skɪl/', definition: 'the ability to do something well', definition_zh: '技能', example_en: 'Writing is an important skill for students.', example_zh: '寫作對學生來說是一項重要的技能。', tier: '進階' },
  { word: 'skillful', pos: 'adj.', phonetic: '/ˈskɪlfəl/', definition: 'able to do something very well', definition_zh: '熟練的；有技巧的', example_en: 'She is a skillful painter and often wins awards.', example_zh: '她是個熟練的畫家，常常得獎。', tier: '進階' },
  { word: 'social science', pos: 'n.', phonetic: '/ˈsoʊʃəl ˈsaɪəns/', definition: 'the school subject about people and society, like history and geography', definition_zh: '社會（科目）', example_en: 'We learned about Taiwan\'s history in social science class.', example_zh: '我們在社會課學到了台灣的歷史。', tier: '進階' },
  { word: 'sociology', pos: 'n.', phonetic: '/ˌsoʊsiˈɑlədʒi/', definition: 'the study of how people live together in groups', definition_zh: '社會學', example_en: 'She plans to study sociology in college.', example_zh: '她打算在大學研讀社會學。', tier: '進階' },
  { word: 'solution', pos: 'n.', phonetic: '/səˈluʃən/', definition: 'the answer to a problem', definition_zh: '解決方法；解答', example_en: 'The students found a solution to the math problem.', example_zh: '學生們找到了這道數學題的解答。', tier: '進階' },
  { word: 'spelling', pos: 'n.', phonetic: '/ˈspɛlɪŋ/', definition: 'the way a word is written using letters in the correct order', definition_zh: '拼字', example_en: 'She checked the spelling of the word twice.', example_zh: '她把這個字的拼字檢查了兩次。', tier: '進階' },
  { word: 'spirit', pos: 'n.', phonetic: '/ˈspɪrɪt/', definition: 'a feeling of energy and enthusiasm', definition_zh: '精神；士氣', example_en: 'The team showed great spirit during the game.', example_zh: '球隊在比賽中展現了很棒的精神。', tier: '進階' },
  { word: 'stationary', pos: 'adj.', phonetic: '/ˈsteɪʃəˌnɛri/', definition: 'not moving', definition_zh: '靜止的；不動的', example_en: 'The car remained stationary at the red light.', example_zh: '那輛車在紅燈前靜止不動。', tier: '進階' },
  { word: 'stress', pos: 'n.', phonetic: '/strɛs/', definition: 'a feeling of worry caused by a difficult situation', definition_zh: '壓力；緊張', example_en: 'Exams often cause stress for junior high students.', example_zh: '考試常常讓國中生感到壓力。', tier: '進階' },
  { word: 'talent', pos: 'n.', phonetic: '/ˈtælənt/', definition: 'a natural ability to do something well', definition_zh: '天賦；才能', example_en: 'He has a talent for drawing cartoons.', example_zh: '他有畫漫畫的天賦。', tier: '進階' },
  { word: 'target', pos: 'n.', phonetic: '/ˈtɑrgɪt/', definition: 'a goal that someone is trying to reach', definition_zh: '目標', example_en: 'Her target is to pass all her final exams.', example_zh: '她的目標是通過所有期末考。', tier: '進階' },
  { word: 'term', pos: 'n.', phonetic: '/tɜrm/', definition: 'a period of time in a school year, or a word with a special meaning', definition_zh: '學期；名詞', example_en: 'The new term starts in September.', example_zh: '新學期九月開始。', tier: '進階' },
  { word: 'tip', pos: 'n.', phonetic: '/tɪp/', definition: 'a small piece of useful advice', definition_zh: '訣竅；小提示', example_en: 'The teacher gave us a tip for the reading test.', example_zh: '老師給了我們一個閱讀測驗的訣竅。', tier: '進階' },
  { word: 'underline', pos: 'v.', phonetic: '/ˈʌndərˌlaɪn/', definition: 'to draw a line under a word to show it is important', definition_zh: '在……下畫線', example_en: 'She underlined the key words in the paragraph.', example_zh: '她把段落中的關鍵字畫了底線。', tier: '進階' },
];

async function main() {
  console.log(`準備寫入 Unit13 共 ${ENTRIES.length} 個新字...`);
  let inserted = 0, skipped = 0, failed = 0;
  for (const e of ENTRIES) {
    const { data: existing } = await supabase.from('words').select('id, tags').ilike('word', e.word).limit(1);
    if (existing && existing.length) {
      console.log(`  ⏭️  ${e.word} 已存在，跳過新增，改為補上 unit13 標籤`);
      const newTags = Array.from(new Set([...(existing[0].tags || []), 'unit13']));
      await supabase.from('words').update({ tags: newTags }).eq('id', existing[0].id);
      skipped++;
      continue;
    }
    const { error } = await supabase.from('words').insert({
      word: e.word, pos: e.pos, phonetic: e.phonetic,
      definition: e.definition, definition_zh: e.definition_zh,
      example_en: e.example_en, example_zh: e.example_zh,
      tags: ['cap_2000', 'unit13', e.tier],
      level: 1,
    });
    if (error) { console.error(`  ❌ ${e.word} 寫入失敗:`, error.message); failed++; }
    else { console.log(`  ✅ ${e.word}`); inserted++; }
  }
  console.log(`\n完成：新增 ${inserted} 筆、跳過(已存在) ${skipped} 筆、失敗 ${failed} 筆`);
}

main().catch(err => { console.error(err); process.exit(1); });
