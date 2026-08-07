const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const report = JSON.parse(fs.readFileSync(path.join(root, 'reports/question_bank_audit.json'), 'utf8'));
const mismatches = report.findings.filter((x) => x.code === 'EXPLANATION_ANSWER_MISMATCH');

for (const file of new Set([...(report.scope || []), ...mismatches.map((x) => x.file)])) {
  const filename = path.join(root, 'server/data', file);
  const records = JSON.parse(fs.readFileSync(filename, 'utf8'));
  const byId = new Map(records.map((record) => [record.id, record]));
  for (const issue of mismatches.filter((x) => x.file === file)) {
    const record = byId.get(issue.id);
    const unitMatch = issue.location.match(/(?:questions|blanks)\[(\d+)\]/);
    const unit = unitMatch
      ? (issue.location.startsWith('questions') ? record.questions : record.blanks)[Number(unitMatch[1])]
      : record;
    const claimed = issue.message.match(/詳解卻指向 ([A-D])/);
    if (!unit || !claimed) throw new Error(`無法修正 ${file}/${issue.id}/${issue.location}`);
    unit.answer = claimed[1].charCodeAt(0) - 65;
  }
  const cleanSpacing = (value) => typeof value === 'string' ? value.replace(/\s+([,.!?;])/g, '$1') : value;
  for (const record of records) {
    if ('passage' in record) record.passage = cleanSpacing(record.passage);
    if ('sentence' in record) record.sentence = cleanSpacing(record.sentence);
    if ('dialogue' in record) record.dialogue = cleanSpacing(record.dialogue);
  }
  fs.writeFileSync(filename, JSON.stringify(records, null, 2) + '\n');
}

const cacheFile = path.join(root, 'supabase/words_cache.json');
const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
const corrections = {
  industry: ['名詞', 'An area of business that produces goods or provides services.', '工業；產業；行業', 'Tourism is an important industry in many island countries.', '觀光業是許多島國的重要產業。'],
  japan: ['名詞', 'A country in East Asia made up of many islands.', '日本', 'Japan is famous for its trains, food, and cherry blossoms.', '日本以火車、美食和櫻花聞名。'],
  "ma'am": ['稱呼語', 'A polite way to address a woman.', '女士；太太；小姐（對女性的禮貌稱呼）', 'Excuse me, ma’am, you dropped your wallet.', '不好意思，女士，您的錢包掉了。'],
  mandarin: ['名詞', 'The standard form of Chinese spoken in Taiwan and China.', '國語；華語；普通話', 'She speaks both Mandarin and English at home.', '她在家會說華語和英語。'],
  marker: ['名詞', 'A pen with a thick tip used for writing or drawing.', '麥克筆；簽字筆；白板筆', 'Please write your name on the poster with this marker.', '請用這支麥克筆把名字寫在海報上。'],
  measurement: ['名詞', 'The act of measuring something or the result obtained.', '測量；尺寸；測量結果', 'We took the room’s measurements before buying a new table.', '買新桌子前，我們先量了房間的尺寸。'],
  melon: ['名詞', 'A large, round fruit with sweet, juicy flesh.', '瓜；甜瓜', 'We shared a sweet melon after lunch.', '午餐後，我們一起吃了一顆香甜的瓜。'],
  'michael jackson': ['名詞', 'An American singer and dancer known around the world as the King of Pop.', '麥可・傑克森；美國歌手與舞者，被稱為「流行樂之王」', "Michael Jackson's songs are still popular around the world.", '麥可・傑克森的歌曲至今仍風靡全球。'],
  deer: ['名詞', 'A wild animal with long legs; males often have antlers.', '鹿', 'We saw three deer walking through the forest.', '我們看到三隻鹿走過森林。'],
  donkey: ['名詞', 'An animal related to a horse, often used to carry things.', '驢子', 'The donkey carried the bags across the farm.', '驢子馱著袋子穿過農場。'],
  eagle: ['名詞', 'A large, strong bird with excellent eyesight.', '老鷹；鷹', 'An eagle flew high above the mountain.', '一隻老鷹在山上高空飛翔。'],
  eat: ['動詞', 'To put food in your mouth and swallow it.', '吃', 'We usually eat dinner together.', '我們通常一起吃晚餐。'],
  glasses: ['名詞', 'Lenses in a frame worn to help a person see.', '眼鏡', 'She wears glasses to read the board.', '她戴眼鏡看黑板。'],
  mosquito: ['名詞', 'A small flying insect that bites people and animals.', '蚊子', 'A mosquito bit my arm last night.', '昨晚一隻蚊子叮了我的手臂。'],
  pear: ['名詞', 'A sweet fruit that is narrow at the top and wide at the bottom.', '梨子', 'I ate a sweet pear after lunch.', '午餐後我吃了一顆甜梨。'],
  poem: ['名詞', 'A piece of writing arranged in lines, often using rhythm or rhyme.', '詩；詩歌', 'She wrote a poem about the mountains.', '她寫了一首關於山的詩。'],
  stomachache: ['名詞', 'A pain in the stomach.', '胃痛；肚子痛', 'I stayed home because I had a stomachache.', '我因為肚子痛而待在家。'],
  vinegar: ['名詞', 'A sour liquid used to add flavor to food.', '醋', 'Add some vinegar to the salad dressing.', '在沙拉醬裡加一點醋。'],
  whale: ['名詞', 'A very large sea mammal.', '鯨魚', 'The blue whale is the largest animal on Earth.', '藍鯨是地球上最大的動物。'],
  'convenience store': ['名詞', 'A small shop open for long hours that sells everyday items.', '便利商店', 'I bought some milk at the convenience store.', '我在便利商店買了一些牛奶。'],
  't-shirt': ['名詞', 'A simple shirt with short sleeves and no collar.', 'T恤', 'He wore a blue T-shirt to the picnic.', '他穿著藍色T恤去野餐。'],
};
const simplifiedToTraditional = { 涂:'塗',齐:'齊',传:'傳',动:'動',过:'過',闻:'聞',让:'讓',惊:'驚',讶:'訝',楼:'樓',组:'組',阶:'階',为:'為',里:'裡',书:'書',邮:'郵',爱:'愛',标:'標',准:'準',较:'較',则:'則',销:'銷',笔:'筆',张:'張',学:'學',开:'開',买:'買',记:'記',树:'樹',细:'細',扔:'扔',风:'風',呆:'待',挣:'掙',奋:'奮',难:'難',潜:'潛',舰:'艦',馆:'館',顺:'順',圆:'圓',满:'滿',经:'經',几:'幾',困:'困',们:'們',装:'裝',从:'從',师:'師',纸:'紙',长:'長',气:'氣',习:'習',镇:'鎮',欢:'歡',来:'來',类:'類',对:'對',个:'個',这:'這',评:'評',兴:'興',戏:'戲',说:'說',业:'業',场:'場' };
const traditionalize = (text) => typeof text === 'string'
  ? [...text].map((ch) => simplifiedToTraditional[ch] || ch).join('')
  : text;
for (const [word, row] of Object.entries(cache)) {
  if (!row.definition_zh && /[\u3400-\u9fff]/u.test(row.definition || '')) row.definition_zh = row.definition;
  const fix = corrections[word.toLowerCase()];
  if (fix) [row.pos, row.definition, row.definition_zh, row.example_en, row.example_zh] = fix;
  row.definition_zh = traditionalize(row.definition_zh);
  row.example_zh = traditionalize(row.example_zh);
  if (word.toLowerCase() !== 'queen') {
    row.definition_zh = row.definition_zh.replaceAll('后', '後');
    row.example_zh = row.example_zh.replaceAll('后', '後');
  }
}
fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2) + '\n');

console.log(`已修正 ${mismatches.length} 題答案／詳解矛盾，並校正 8 筆高信心錯義。`);
