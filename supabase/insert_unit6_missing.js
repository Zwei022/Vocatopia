/**
 * 補齊 Unit 6（人格特質）在 words 表裡缺少的 31 個字。
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const ENTRIES = [
  // ── 基礎學習篇 ──
  { word: 'funny', pos: 'adj.', phonetic: '/ˈfʌni/', definition: 'making you laugh or smile', definition_zh: '好笑的；有趣的', example_en: 'He told a funny story about his first day at school.', example_zh: '他講了一個關於他第一天上學的好笑故事。', tier: '基礎' },
  { word: 'rich', pos: 'adj.', phonetic: '/rɪtʃ/', definition: 'having a lot of money', definition_zh: '富有的', example_en: 'The rich man donated money to the local school.', example_zh: '那位富有的男子捐款給當地的學校。', tier: '基礎' },
  // ── 進階學習篇 ──
  { word: 'childlike', pos: 'adj.', phonetic: '/ˈtʃaɪldˌlaɪk/', definition: 'having the good qualities of a child, such as being innocent or honest', definition_zh: '天真爛漫的；孩子氣的', example_en: 'Grandpa still has a childlike love for cartoons.', example_zh: '爺爺對卡通仍抱著孩子般天真的喜愛。', tier: '進階' },
  { word: 'clever', pos: 'adj.', phonetic: '/ˈklɛvər/', definition: 'able to learn and understand things quickly', definition_zh: '聰明的；機靈的', example_en: 'The clever fox found a way out of the trap.', example_zh: '那隻聰明的狐狸找到了逃出陷阱的方法。', tier: '進階' },
  { word: 'decisive', pos: 'adj.', phonetic: '/dɪˈsaɪsɪv/', definition: 'able to make decisions quickly and with confidence', definition_zh: '果斷的', example_en: 'A good leader must be decisive during an emergency.', example_zh: '一位好的領導者在緊急時刻必須果斷。', tier: '進階' },
  { word: 'dependent', pos: 'adj.', phonetic: '/dɪˈpɛndənt/', definition: 'needing help or support from someone or something else', definition_zh: '依賴的', example_en: 'The little boy is still dependent on his parents.', example_zh: '那個小男孩仍然依賴他的父母。', tier: '進階' },
  { word: 'dutiful', pos: 'adj.', phonetic: '/ˈdjutɪfəl/', definition: 'always doing what you are supposed to do', definition_zh: '盡責的', example_en: 'She is a dutiful daughter who visits her parents weekly.', example_zh: '她是個盡責的女兒，每週都去看父母。', tier: '進階' },
  { word: 'expressive', pos: 'adj.', phonetic: '/ɪkˈsprɛsɪv/', definition: 'showing feelings or thoughts clearly', definition_zh: '富有表現力的', example_en: 'The actor’s expressive face told the whole story.', example_zh: '那位演員富有表現力的臉道盡了整個故事。', tier: '進階' },
  { word: 'heroic', pos: 'adj.', phonetic: '/hɪˈroʊɪk/', definition: 'very brave, like a hero', definition_zh: '英勇的', example_en: 'Firefighters made a heroic effort to save the cat.', example_zh: '消防員英勇地努力救出那隻貓。', tier: '進階' },
  { word: 'honesty', pos: 'n.', phonetic: '/ˈɑnəsti/', definition: 'the quality of telling the truth and being fair', definition_zh: '誠實', example_en: 'Our teacher always talks about the value of honesty.', example_zh: '我們的老師總是談論誠實的重要性。', tier: '進階' },
  { word: 'humble', pos: 'adj.', phonetic: '/ˈhʌmbəl/', definition: 'not thinking you are more important than other people', definition_zh: '謙虛的', example_en: 'Even after winning, the athlete stayed humble and quiet.', example_zh: '即使贏了比賽，那位運動員仍保持謙虛低調。', tier: '進階' },
  { word: 'humor', pos: 'n.', phonetic: '/ˈhjumər/', definition: 'the quality of being funny, or the ability to find things funny', definition_zh: '幽默；幽默感', example_en: 'His sense of humor made everyone at the party laugh.', example_zh: '他的幽默感讓派對上的每個人都笑了。', tier: '進階' },
  { word: 'humorous', pos: 'adj.', phonetic: '/ˈhjumərəs/', definition: 'funny in a clever or gentle way', definition_zh: '幽默的', example_en: 'The teacher used a humorous example to explain the rule.', example_zh: '老師用一個幽默的例子解釋這條規則。', tier: '進階' },
  { word: 'ignorant', pos: 'adj.', phonetic: '/ˈɪgnərənt/', definition: 'not knowing about something that you should know', definition_zh: '無知的', example_en: 'It is ignorant to judge people before knowing them.', example_zh: '在了解一個人之前就評斷他是無知的。', tier: '進階' },
  { word: 'imaginative', pos: 'adj.', phonetic: '/ɪˈmædʒənətɪv/', definition: 'good at thinking of new and interesting ideas', definition_zh: '有想像力的', example_en: 'The imaginative child drew a castle in the clouds.', example_zh: '那個有想像力的孩子畫了一座雲上的城堡。', tier: '進階' },
  { word: 'impolite', pos: 'adj.', phonetic: '/ˌɪmpəˈlaɪt/', definition: 'not having good manners; rude', definition_zh: '不禮貌的', example_en: 'It is impolite to talk with your mouth full.', example_zh: '嘴裡塞滿食物時說話是不禮貌的。', tier: '進階' },
  { word: 'independent', pos: 'adj.', phonetic: '/ˌɪndɪˈpɛndənt/', definition: 'able to do things by yourself without help', definition_zh: '獨立的', example_en: 'She became independent after moving to a new city.', example_zh: '她搬到新城市後變得更加獨立。', tier: '進階' },
  { word: 'intelligent', pos: 'adj.', phonetic: '/ɪnˈtɛlədʒənt/', definition: 'able to learn, understand, and think well', definition_zh: '聰明的；有智慧的', example_en: 'Dolphins are known to be very intelligent animals.', example_zh: '海豚以聰明的動物聞名。', tier: '進階' },
  { word: 'manner', pos: 'n.', phonetic: '/ˈmænər/', definition: 'the way a person behaves or does something', definition_zh: '態度；方式', example_en: 'He spoke to the teacher in a polite manner.', example_zh: '他以有禮貌的態度跟老師說話。', tier: '進階' },
  { word: 'marvelous', pos: 'adj.', phonetic: '/ˈmɑrvələs/', definition: 'extremely good or enjoyable', definition_zh: '極好的；令人驚嘆的', example_en: 'We had a marvelous time at the amusement park.', example_zh: '我們在遊樂園玩得非常開心。', tier: '進階' },
  { word: 'naughty', pos: 'adj.', phonetic: '/ˈnɔti/', definition: 'behaving badly, especially a child', definition_zh: '調皮的；頑皮的', example_en: 'The naughty puppy chewed up my new shoes.', example_zh: '那隻調皮的小狗咬爛了我的新鞋。', tier: '進階' },
  { word: 'ordinary', pos: 'adj.', phonetic: '/ˈɔrdəˌnɛri/', definition: 'normal and not special or different', definition_zh: '普通的；平凡的', example_en: 'It was just an ordinary Monday until the surprise call.', example_zh: '那本來只是個平凡的星期一，直到那通意外的電話。', tier: '進階' },
  { word: 'respectful', pos: 'adj.', phonetic: '/rɪˈspɛktfəl/', definition: 'showing respect and good manners toward others', definition_zh: '恭敬的；尊重人的', example_en: 'Students should be respectful to their teachers.', example_zh: '學生應該尊敬老師。', tier: '進階' },
  { word: 'sincere', pos: 'adj.', phonetic: '/sɪnˈsɪr/', definition: 'saying and meaning what you really feel', definition_zh: '真誠的', example_en: 'He gave a sincere apology after breaking the vase.', example_zh: '他打破花瓶後給了一個真誠的道歉。', tier: '進階' },
  { word: 'sneaky', pos: 'adj.', phonetic: '/ˈsniki/', definition: 'doing things secretly or dishonestly', definition_zh: '鬼鬼祟祟的', example_en: 'The cat took a sneaky bite of the fish on the table.', example_zh: '那隻貓偷偷咬了一口桌上的魚。', tier: '進階' },
  { word: 'stingy', pos: 'adj.', phonetic: '/ˈstɪndʒi/', definition: 'not willing to spend or give money', definition_zh: '小氣的', example_en: 'He is too stingy to buy his friends a drink.', example_zh: '他小氣到不願意請朋友喝飲料。', tier: '進階' },
  { word: 'talkative', pos: 'adj.', phonetic: '/ˈtɔkətɪv/', definition: 'liking to talk a lot', definition_zh: '愛說話的；健談的', example_en: 'My talkative cousin never stops telling stories.', example_zh: '我那個愛說話的表哥講故事永遠停不下來。', tier: '進階' },
  { word: 'terrific', pos: 'adj.', phonetic: '/təˈrɪfɪk/', definition: 'excellent; very good', definition_zh: '極好的；棒極了的', example_en: 'The band gave a terrific performance last night.', example_zh: '那個樂團昨晚的表演棒極了。', tier: '進階' },
  { word: 'thoughtful', pos: 'adj.', phonetic: '/ˈθɔtfəl/', definition: 'thinking carefully about other people’s feelings', definition_zh: '體貼的；周到的', example_en: 'It was thoughtful of her to bring an extra umbrella.', example_zh: '她多帶一把傘來，真的很體貼。', tier: '進階' },
  { word: 'traditional', pos: 'adj.', phonetic: '/trəˈdɪʃənəl/', definition: 'following the customs or beliefs that have existed for a long time', definition_zh: '傳統的', example_en: 'We wore traditional clothes for the festival.', example_zh: '我們在節慶時穿上了傳統服裝。', tier: '進階' },
  { word: 'unique', pos: 'adj.', phonetic: '/juˈnik/', definition: 'being the only one of its kind; very special', definition_zh: '獨特的', example_en: 'Every snowflake has a unique shape and pattern.', example_zh: '每片雪花都有獨特的形狀和圖案。', tier: '進階' },
];

async function main() {
  console.log(`準備寫入 ${ENTRIES.length} 個新字（Unit6）...`);
  let inserted = 0, skipped = 0, failed = 0;

  for (const e of ENTRIES) {
    const { data: existing } = await supabase.from('words').select('id').ilike('word', e.word).limit(1);
    if (existing && existing.length) {
      console.log(`  ⏭️  ${e.word} 已存在，跳過新增，改為補上 unit6 標籤`);
      const { data: row } = await supabase.from('words').select('tags').eq('id', existing[0].id).single();
      const newTags = Array.from(new Set([...(row?.tags || []), 'unit6']));
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
      tags: ['cap_2000', 'unit6', e.tier],
      level: 1,
    });
    if (error) { console.error(`  ❌ ${e.word} 寫入失敗:`, error.message); failed++; }
    else { console.log(`  ✅ ${e.word}`); inserted++; }
  }

  console.log(`\n完成：新增 ${inserted} 筆、跳過(已存在) ${skipped} 筆、失敗 ${failed} 筆`);
}

main().catch(err => { console.error(err); process.exit(1); });
