/**
 * 補齊官方 2000 字中缺少的單字
 * - 從 Cambridge 繁中字典爬取資料
 * - 使用現有快取（words_cache.json）優先
 * - 插入 Supabase DB
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const cheerio = require('cheerio');
const https   = require('https');
const fs      = require('fs');
const path    = require('path');
const s       = require('../server/db/supabase');

const CACHE_FILE = path.join(__dirname, '../supabase/words_cache.json');

// 104 個缺少的單字（含詞性）
const MISSING = [
  { word: 'alphabet',     pos: '名詞' },
  { word: 'anybody',      pos: '代名詞' },
  { word: 'backward',     pos: '副詞' },
  { word: 'be',           pos: '動詞' },
  { word: 'been',         pos: '動詞' },
  { word: 'beside',       pos: '介系詞' },
  { word: 'bike',         pos: '名詞' },
  { word: 'blouse',       pos: '名詞' },
  { word: 'bookstore',    pos: '名詞' },
  { word: 'boring',       pos: '形容詞' },
  { word: 'burger',       pos: '名詞' },
  { word: 'bye',          pos: '感嘆詞' },
  { word: 'chemistry',    pos: '名詞' },
  { word: 'childhood',    pos: '名詞' },
  { word: 'china',        pos: '名詞' },
  { word: 'chopsticks',   pos: '名詞' },
  { word: 'classical',    pos: '形容詞' },
  { word: 'cloudy',       pos: '形容詞' },
  { word: 'comic',        pos: '名詞' },
  { word: 'cross',        pos: '動詞' },
  { word: 'crowd',        pos: '名詞' },
  { word: 'crowded',      pos: '形容詞' },
  { word: 'donut',        pos: '名詞' },
  { word: 'dresser',      pos: '名詞' },
  { word: 'drugstore',    pos: '名詞' },
  { word: 'earrings',     pos: '名詞' },
  { word: 'eighteenth',   pos: '數詞' },
  { word: 'eighth',       pos: '數詞' },
  { word: 'either',       pos: '限定詞' },
  { word: 'eleventh',     pos: '數詞' },
  { word: 'everybody',    pos: '代名詞' },
  { word: 'everyone',     pos: '代名詞' },
  { word: 'everything',   pos: '代名詞' },
  { word: 'everywhere',   pos: '副詞' },
  { word: 'excited',      pos: '形容詞' },
  { word: 'exciting',     pos: '形容詞' },
  { word: 'fashionable',  pos: '形容詞' },
  { word: 'fifteenth',    pos: '數詞' },
  { word: 'fifth',        pos: '數詞' },
  { word: 'foggy',        pos: '形容詞' },
  { word: 'forward',      pos: '副詞' },
  { word: 'fourteenth',   pos: '數詞' },
  { word: 'fourth',       pos: '數詞' },
  { word: 'freezer',      pos: '名詞' },
  { word: 'freezing',     pos: '形容詞' },
  { word: 'friendship',   pos: '名詞' },
  { word: 'goodbye',      pos: '感嘆詞' },
  { word: 'granddaughter', pos: '名詞' },
  { word: 'haircut',      pos: '名詞' },
  { word: 'hello',        pos: '感嘆詞' },
  { word: 'hey',          pos: '感嘆詞' },
  { word: 'hi',           pos: '感嘆詞' },
  { word: 'homesick',     pos: '形容詞' },
  { word: 'kangaroo',     pos: '名詞' },
  { word: 'koala',        pos: '名詞' },
  { word: 'mailman',      pos: '名詞' },
  { word: 'marker',       pos: '名詞' },
  { word: 'math',         pos: '名詞' },
  { word: 'mathematics',  pos: '名詞' },
  { word: 'much',         pos: '副詞' },
  { word: 'nineteenth',   pos: '數詞' },
  { word: 'ninth',        pos: '數詞' },
  { word: 'nobody',       pos: '代名詞' },
  { word: 'operation',    pos: '名詞' },
  { word: 'overpass',     pos: '名詞' },
  { word: 'person',       pos: '名詞' },
  { word: 'pleased',      pos: '形容詞' },
  { word: 'pleasure',     pos: '名詞' },
  { word: 'postcard',     pos: '名詞' },
  { word: 'railway',      pos: '名詞' },
  { word: 'raincoat',     pos: '名詞' },
  { word: 'recorder',     pos: '名詞' },
  { word: 'salesman',     pos: '名詞' },
  { word: 'saucer',       pos: '名詞' },
  { word: 'scared',       pos: '形容詞' },
  { word: 'secondary',    pos: '形容詞' },
  { word: 'seventeenth',  pos: '數詞' },
  { word: 'seventh',      pos: '數詞' },
  { word: 'shopkeeper',   pos: '名詞' },
  { word: 'sixteenth',    pos: '數詞' },
  { word: 'sixth',        pos: '數詞' },
  { word: 'sneaky',       pos: '形容詞' },
  { word: 'snowman',      pos: '名詞' },
  { word: 'socks',        pos: '名詞' },
  { word: 'softball',     pos: '名詞' },
  { word: 'somebody',     pos: '代名詞' },
  { word: 'sports',       pos: '名詞' },
  { word: 'stairs',       pos: '名詞' },
  { word: 'stormy',       pos: '形容詞' },
  { word: 'such',         pos: '限定詞' },
  { word: 'swimsuit',     pos: '名詞' },
  { word: 'tenth',        pos: '數詞' },
  { word: 'tub',          pos: '名詞' },
  { word: 'twelfth',      pos: '數詞' },
  { word: 'twentieth',    pos: '數詞' },
  { word: 'underpass',    pos: '名詞' },
  { word: 'valentine',    pos: '名詞' },
  { word: 'wok',          pos: '名詞' },
  { word: 'woods',        pos: '名詞' },
  { word: 'workbook',     pos: '名詞' },
  { word: 'zebra',        pos: '名詞' },
  { word: 'e-mail',       pos: '名詞' },
  { word: 'hard-working', pos: '形容詞' },
  { word: 'nice-looking', pos: '形容詞' },
  // 加上漏掉但在官方清單中的補充
  { word: 'be',           pos: '動詞' },  // 重複 ok，會去重
];

const hasCN = str => /[一-鿿]/.test(str || '');
const sleep  = ms => new Promise(r => setTimeout(r, ms));

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0',
        'Accept': 'text/html',
        'Accept-Language': 'zh-TW,zh;q=0.9',
        'Accept-Encoding': 'identity',
      },
      timeout: 12000,
    }, res => {
      if ([301,302,303,307,308].includes(res.statusCode)) {
        res.resume();
        const loc = res.headers.location;
        return httpGet(loc.startsWith('http') ? loc : new URL(loc, url).href).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)); }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function parseCambridge(html) {
  const $ = cheerio.load(html);
  let phonetic = '';
  for (const sel of ['.us.dpron-i .ipa', '.pron-info.pron-us .ipa', '.us .ipa']) {
    const t = $(sel).first().text().trim(); if (t) { phonetic = '/' + t + '/'; break; }
  }
  if (!phonetic) { const t = $('.uk.dpron-i .ipa').first().text().trim(); if (t) phonetic = '/' + t + '/'; }

  let definition = '';
  for (const sel of ['.entry-body__el .def-body', '.entry-body__el .ddef_b']) {
    $(sel).each(function () {
      $(this).find('.trans,.dtrans').each(function () {
        if ($(this).parents('.examp,.dexamp,.eg').length > 0) return;
        const t = $(this).text().trim();
        if (t && t.length >= 2) { definition = t; return false; }
      });
      if (definition) return false;
    });
    if (definition) break;
  }

  let example_en = '', example_zh = '';
  const fe = $('.entry-body__el').first();
  for (const sel of ['.examp', '.dexamp']) {
    const ex = fe.find(sel).first();
    if (!ex.length) continue;
    const en = ex.find('.eg,.deg').first().text().trim();
    const zh = ex.find('.trans,.dtrans').first().text().trim();
    if (en) { example_en = en; example_zh = zh; break; }
  }
  return { phonetic, definition, example_en, example_zh };
}

// 手動資料（Cambridge 可能找不到的特殊字）
const MANUAL = {
  'be':          { phonetic: '/biː/', definition: '是；存在；成為', example_en: 'I want to be a doctor.', example_zh: '我想成為一名醫生。' },
  'been':        { phonetic: '/biːn/', definition: 'be 的過去分詞', example_en: 'Have you been to Japan?', example_zh: '你去過日本嗎？' },
  'hi':          { phonetic: '/haɪ/', definition: '嗨；你好', example_en: 'Hi! How are you?', example_zh: '嗨！你好嗎？' },
  'hey':         { phonetic: '/heɪ/', definition: '嘿（用於引起注意）', example_en: 'Hey, wait for me!', example_zh: '嘿，等等我！' },
  'bye':         { phonetic: '/baɪ/', definition: '再見', example_en: 'Bye! See you tomorrow.', example_zh: '再見！明天見。' },
  'much':        { phonetic: '/mʌtʃ/', definition: '很多；大量（不可數）', example_en: 'Thank you very much.', example_zh: '非常感謝你。' },
  'such':        { phonetic: '/sʌtʃ/', definition: '如此；這樣的', example_en: 'I have never seen such a beautiful view.', example_zh: '我從未見過如此美麗的景色。' },
  'e-mail':      { phonetic: '/ˈiː.meɪl/', definition: '電子郵件', example_en: 'Please send me an e-mail.', example_zh: '請給我發一封電子郵件。' },
  'hard-working': { phonetic: '/ˌhɑːrdˈwɜːrkɪŋ/', definition: '努力工作的；勤奮的', example_en: 'She is a hard-working student.', example_zh: '她是一個勤奮的學生。' },
  'nice-looking': { phonetic: '/ˌnaɪsˈlʊkɪŋ/', definition: '好看的；漂亮的', example_en: 'He is a nice-looking boy.', example_zh: '他是一個好看的男孩。' },
  'eighth':      { phonetic: '/eɪtθ/', definition: '第八；八分之一', example_en: 'She finished eighth in the race.', example_zh: '她在比賽中排名第八。' },
  'ninth':       { phonetic: '/naɪnθ/', definition: '第九', example_en: 'Today is the ninth of March.', example_zh: '今天是三月九日。' },
  'tenth':       { phonetic: '/tenθ/', definition: '第十', example_en: 'She is in the tenth grade.', example_zh: '她在十年級。' },
  'eleventh':    { phonetic: '/ɪˈlevənθ/', definition: '第十一', example_en: 'His birthday is on the eleventh.', example_zh: '他的生日在十一號。' },
  'twelfth':     { phonetic: '/twelfθ/', definition: '第十二', example_en: 'December is the twelfth month.', example_zh: '十二月是第十二個月。' },
  'china':       { phonetic: '/ˈtʃaɪnə/', definition: '瓷器；中國（China）', example_en: 'This cup is made of fine china.', example_zh: '這個杯子是用精緻瓷器製成的。' },
  'donut':       { phonetic: '/ˈdoʊnʌt/', definition: '甜甜圈（doughnut 的另一種拼寫）', example_en: 'I had a donut for breakfast.', example_zh: '我早餐吃了一個甜甜圈。' },
};

(async () => {
  // 去重
  const seen = new Set();
  const targets = MISSING.filter(m => { if (seen.has(m.word)) return false; seen.add(m.word); return true; });

  // 讀取快取
  let cache = {};
  if (fs.existsSync(CACHE_FILE)) {
    try { cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8')); } catch {}
  }

  console.log(`\n=== 補齊缺少的 ${targets.length} 個單字 ===\n`);

  const rows = [];
  for (let i = 0; i < targets.length; i++) {
    const { word, pos } = targets[i];
    process.stdout.write(`\r  [${i+1}/${targets.length}] ${word.padEnd(20)}`);

    let data = cache[word] || MANUAL[word] || null;

    if (!data || !hasCN(data.definition)) {
      // 手動備援
      if (MANUAL[word]) {
        data = MANUAL[word];
      } else {
        // 爬 Cambridge
        try {
          const searchWord = word.replace(/-/g, '-'); // handle hyphenated
          const html = await httpGet(`https://dictionary.cambridge.org/dictionary/english-chinese-traditional/${encodeURIComponent(searchWord)}`);
          data = parseCambridge(html);
          if (hasCN(data.definition)) {
            process.stdout.write(`✓ ${data.definition.slice(0,18)}`);
          }
          await sleep(1600 + Math.random() * 600);
        } catch (e) {
          process.stdout.write(`✗ ${e.message.slice(0,15)}`);
          data = { phonetic: '', definition: '', example_en: '', example_zh: '' };
        }
      }
    } else {
      process.stdout.write(`📦 ${(data.definition || '').slice(0,18)}`);
    }

    rows.push({
      word,
      pos,
      definition:  data.definition  || '',
      phonetic:    data.phonetic    || '',
      example_en:  data.example_en  || '',
      example_zh:  data.example_zh  || '',
      tags:        ['cap_2000'],
      level:       3,
      frequency_rank: 1900 + i,
    });
  }

  console.log('\n\n[插入 DB]...');
  let inserted = 0, failed = 0;
  for (const row of rows) {
    const { error } = await s.from('words').insert(row);
    if (error) {
      if (error.code === '23505') {
        // Duplicate → update instead
        const { error: updErr } = await s.from('words')
          .update({ pos: row.pos, definition: row.definition, phonetic: row.phonetic,
                    example_en: row.example_en, example_zh: row.example_zh })
          .eq('word', row.word);
        if (!updErr) inserted++;
      } else {
        failed++;
        console.log(`  ✗ ${row.word}: ${error.message}`);
      }
    } else {
      inserted++;
    }
  }

  const { count } = await s.from('words').select('*', { count: 'exact', head: true });
  console.log(`\n✅ 完成！插入/更新：${inserted}，失敗：${failed}`);
  console.log(`DB 現有：${count} 字`);
})();
