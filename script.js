// 空白單字卡範本
const EMPTY_WORD_TEMPLATE = {
  id: 'empty_template',
  word: '',
  pos: '',
  phonetic: '',
  definition: '',
  example_en: '',
  example_zh: '',
  frequency_rank: 0,
  level: 0,
  tags: ['custom']
};

// ── PIXEL CHARACTER ──
(function drawChar() {
  const c = document.getElementById('charCanvas'), ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const p = 4;
  const px = (x, y, col) => { ctx.fillStyle = col; ctx.fillRect(x * p, y * p, p, p); };
  const sk = '#f0b07a', hr = '#3b2000', ey = '#111', sh = '#d4945a', cl = '#ddd8cc', br = '#4477ee', bt = '#331800', wd = '#7a3b10';
  // hair
  [3, 4, 5, 6].forEach(x => px(x, 0, hr));
  [2, 3, 4, 5, 6, 7].forEach(x => px(x, 1, hr));
  // face
  [2, 3, 4, 5, 6, 7].forEach(x => px(x, 2, sk)); px(3, 2, hr); px(6, 2, hr);
  [2, 3, 4, 5, 6, 7].forEach(x => px(x, 3, sk)); px(3, 3, ey); px(6, 3, ey); px(5, 3, sh);
  [2, 3, 4, 5, 6, 7].forEach(x => px(x, 4, sk)); px(4, 4, '#c07060'); px(5, 4, '#c07060');
  // neck
  [4, 5].forEach(x => px(x, 5, sk));
  // torso
  [2, 3, 4, 5, 6, 7].forEach(x => px(x, 6, cl));
  [2, 3, 4, 5, 6, 7].forEach(x => px(x, 7, cl));
  // arms
  px(1, 6, sk); px(1, 7, sk); px(1, 8, sk);
  px(8, 6, sk); px(8, 7, sk); px(8, 8, sk);
  // weapon stick
  [4, 5, 6, 7, 8, 9].forEach(y => px(0, y, wd)); px(0, 3, wd);
  // underwear
  [3, 4, 5, 6].forEach(x => px(x, 8, br));
  [3, 4].forEach(x => px(x, 9, br)); [5, 6].forEach(x => px(x, 9, br));
  // legs
  [3, 4].forEach(x => { px(x, 10, sk); px(x, 11, sk); });
  [5, 6].forEach(x => { px(x, 10, sk); px(x, 11, sk); });
  // boots
  [[3, 12], [4, 12], [3, 13], [4, 13], [5, 12], [6, 12], [5, 13], [6, 13]].forEach(([x, y]) => px(x, y, bt));
})();

// ── UTILS ──
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 片語清單（一次性從 question_bank_phrase.json 的 phrasal_verb／expression 選項抽取，共 293 個），
// 用於 wrapWordsHtml() 的最長匹配，讓「put on」「give up」這種片語被合併成一個可點擊單位，
// 而不是拆成「put」「on」兩個各自獨立的單字。若之後片語題庫擴充，需重新抽取這份清單才會同步。
const PHRASE_LIST = ["account for","account on","account to","account with","against all odds","agree at","agree on","agree to","agree with","ahead of","as a result","as a rule","as example","as opposed to","as soon as","at a result","at a time","at all costs","at any cost","at any moment","at any rate","at any time","at first","at last","at least","at once","at the drop of a hat","at the rate of","at time","at times","back down","back off","back out","back up","belong at","belong for","belong to","belong with","brush aside on","brush off on","brush over on","brush up on","by accident","by all means","by and large","by course","by example","by hook or by crook","by means of","by the name of","by the way","by time","by virtue of","called off","came across","came along","came along with","came down with","came out with","came up against","came up with","catch on with","catch up on","catch up to","catch up with","clean out","clean up","come rain or shine","count down","count on","count out","count up","deal for","deal in","deal on","deal with","depend at","depend for","depend on","depend to","do away with","do out with","do over with","do up with","fall apart","fall behind","fall off","fall through","find for","find off","find out","find over","for all intents and purposes","for example","for fear of","for good","for instance","for once","for sale","for sure","for the case of","for the sake of","for the time being","get across","get along","get down","get in","get off","get over","get through","get up","give away","give back","give out","give up","go along","go off","go over","go through","hand down","hand in","hand out","hand over","handed in","hold back","hold off","hold on","hold out","in a hurry","in a result","in accident","in addition","in addition to","in advance","in ahead","in all likelihood","in case","in case of","in case to","in common","in course","in detail","in due course","in due time","in example","in fact","in favor of","in front","in general","in no time","in once","in order to","in particular","in progress","in retrospect","in short","in spite of","in the blink of an eye","in the event that","in the long run","in the meantime","in the nick of time","in time","in time to","instead of saying","just in time","lie down","listen at","listen for","listen on","listen to","live off to","live on to","live through to","live up to","look after","look at","look down on","look for","look into","look out","look out for","look up","look up to","looked up","looking after","looking at","looking for","looking forward to","looking into","looking up","looking up to","make for","make out of","make up for","make up to","needless to say","not to say","now and then","of course","of fact","off and on","on accident","on account of","on and on","on purpose","on the contrary","on the grounds that","on the whole","on time","once again","once and for all","once bitten, twice shy","once in a blue moon","once in a while","once upon a time","out of order","out of the blue","pick on","pick out","pick over","pick up","pointed at","pointed out","pointed to","pointed up","put away","put in","put off","put on","put up","rather than say","rule down","rule off","rule out","rule over","sat down","set down","set off","set out","set up","sit down","sit up","so as","stand by for","stand out for","stand up","stand up for","stand up to","stood by","stood off","stood up","take after","take off","take over","take up","takes after","takes off","takes over","takes up","through thick and thin","tied down","tied in","tied over","tied up","turn down","turn off","turn on","turn up","turned down","turned in","turned into","turned up","wait for","wait on","wait out","wait up","wake up","wear away","wear down","wear off","wear out","when it comes to","with accident","with the exception of","without cause","without doubt","without fail","without notice","work off","work on","work out","work up"];

// 依「片語第一個字」分組，組內依詞數由多到少排序，供最長匹配優先比對（例如優先比對「at the drop of a hat」而非「at last」）
const PHRASE_BY_FIRST_WORD = {};
PHRASE_LIST.forEach(p => {
  const words = p.replace(/[^a-zA-Z\s]/g, '').trim().toLowerCase().split(/\s+/);
  if (words.length < 2) return;
  (PHRASE_BY_FIRST_WORD[words[0]] = PHRASE_BY_FIRST_WORD[words[0]] || []).push(words);
});
Object.values(PHRASE_BY_FIRST_WORD).forEach(arr => arr.sort((a, b) => b.length - a.length));

// 將文字中的英文單字（或已知片語）包成可點擊 <span>，共用於題幹／選項／詳解／文章等所有地方，
// 不分答題前後，一律點下去先開 lookupWord 的單字詳情彈窗，使用者再自行用彈窗裡的按鈕決定是否加入不熟字卡。
// 片語比對：先看目前字是否為某個片語的開頭字，往後掃描（可跨越任意標點/空白分隔符）比對片語其餘的字，
// 比對成功就把整個片語（含中間的原始分隔符）包成同一個 span，比對不到才照舊逐字包。
// 純語法虛詞（冠詞/be動詞/人稱代名詞/所有格代名詞/基礎連接詞/基礎助動詞）：
// 這些幾乎不會是學生需要查字典的「詞彙」，standalone 出現時不套用點字（減少贅字查詢與不必要的 Gemini 呼叫）。
// 注意：不放介系詞（up/on/off/in/with...），因為它們常是片語動詞的一部分，也是值得學習的獨立詞彙。
const STOPWORDS = new Set(['a', 'an', 'the', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'its', 'our', 'their', 'mine', 'yours', 'ours', 'theirs',
  'and', 'or', 'but', 'do', 'does', 'did', 'has', 'have', 'had',
  'will', 'would', 'can', 'could', 'shall', 'should', 'may', 'might', 'must']);

function wrapWordsHtml(text) {
  const handler = 'lookupWord';
  const tokens = String(text == null ? '' : text).split(/([\s\n]+|[.,!?;:'"()]+)/);
  // 判斷一個 token 是否值得點字查詢：
  // 1) 整個 token 必須是純英文字母（可含連字號/撇號），排除「NT$50」「9am」這種數字/符號混雜、查了也查不到的詞
  // 2) 排除全大寫且長度≥2 的詞（GREENWAY、NT 這類專有名詞/縮寫代碼，查字典通常沒有意義）
  const isWordTok = (t) => {
    if (!t || t.length < 2) return false;
    if (!/^[a-zA-Z]+(?:['-][a-zA-Z]+)*$/.test(t)) return false;
    if (/^[A-Z]+$/.test(t)) return false;
    return true;
  };
  const cleanTok  = (t) => (t || '').replace(/[^a-zA-Z]/g, '').toLowerCase();

  const out = [];
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];
    if (!isWordTok(t)) { out.push(escHtml(t).replace(/\n/g, '<br>')); i++; continue; }

    const w0 = cleanTok(t);
    const candidates = PHRASE_BY_FIRST_WORD[w0];
    let matchedEnd = -1, matchedWords = null;
    if (candidates) {
      for (const words of candidates) {
        let ti = i, wi = 1, ok = true;
        while (wi < words.length) {
          ti++;
          while (ti < tokens.length && !isWordTok(tokens[ti])) ti++;
          if (ti >= tokens.length || cleanTok(tokens[ti]) !== words[wi]) { ok = false; break; }
          wi++;
        }
        if (ok) { matchedEnd = ti; matchedWords = words; break; }
      }
    }

    if (matchedEnd > -1) {
      const span = tokens.slice(i, matchedEnd + 1).join('');
      const key  = matchedWords.join(' ');
      out.push(`<span class="w" onclick="event.stopPropagation();${handler}('${key}',this)">${escHtml(span).replace(/\n/g, '<br>')}</span>`);
      i = matchedEnd + 1;
      continue;
    }

    if (STOPWORDS.has(w0)) { out.push(escHtml(t)); i++; continue; }

    out.push(`<span class="w" onclick="event.stopPropagation();${handler}('${w0}',this)">${escHtml(t)}</span>`);
    i++;
  }
  return out.join('');
}

// ── DATA (loaded from API) ──
let WORDS    = [];   // populated by loadWords()
let ARTICLES = [];   // populated by loadArticles()
let DICT     = {};   // populated by loadWords()

// 從 API 正規化單字格式（DB 欄位 → 前端欄位）
const POS_MAP = {
  // nouns
  'n':'名詞','n.':'名詞','noun':'名詞','n. (plural)':'名詞','n. phr.':'名詞片語','n. / v.':'名詞','n./v.':'名詞',
  // verbs
  'v':'動詞','v.':'動詞','verb':'動詞',
  'v. (past tense)':'動詞','v. (past tense/past participle)':'動詞',
  'v. (past participle)':'動詞','v. (past participle) / adj.':'動詞',
  'v. (present participle)':'動詞','v. (present participle / adj.)':'動詞',
  'v. (ing)':'動詞','v. / n.':'動詞','v./n.':'動詞',
  'phr. v.':'動詞片語','phr. v. (past participle)':'動詞片語','phr. v. (present participle)':'動詞片語',
  // adjectives
  'adj':'形容詞','adj.':'形容詞','adjective':'形容詞',
  'adj. (comparative)':'形容詞','adj. (superlative)':'形容詞',
  'adj. / v. (present participle)':'形容詞','adj. / v.':'形容詞','adj./v.':'形容詞',
  'adj. / n.':'形容詞','adj./n.':'形容詞','adj. phr.':'形容詞',
  // adverbs
  'adv':'副詞','adv.':'副詞','adv./adj.':'副詞','adj./adv.':'副詞',
  // prepositions
  'prep':'介系詞','prep.':'介系詞','prep. phr.':'介系詞','prep./conj.':'介系詞',
  // conjunctions
  'conj':'連接詞','conj.':'連接詞',
  // pronouns
  'pron':'代名詞','pron.':'代名詞',
  // modals
  'modal':'助動詞','modal v.':'助動詞',
  // determiners
  'det. / pron.':'限定詞','det.':'限定詞',
  // phrases / idioms
  'phr.':'片語','phrase':'片語','idiom':'片語',
  // null/empty
  'null':'',
};

function normalizePos(raw) {
  if (!raw || raw === 'null') return '';
  const trimmed = raw.trim();
  return POS_MAP[trimmed] || trimmed;
}

function normalizeWord(w) {
  return {
    id:         w.id,
    word:       w.word,
    pos:        normalizePos(w.pos),
    def:        w.definition || '',
    definition: w.definition || '',
    definition_zh: w.definition_zh || '',
    example_en: w.example_en || '',
    example_zh: w.example_zh || '',
    ex:         w.example_en && w.example_zh
                  ? `${w.example_en}\n${w.example_zh}`
                  : (w.example_en || ''),
    tag:        (w.tags && w.tags[1]) || '',
    phonetic:   w.phonetic   || '',
    level:      w.level      || 1,
    st:         'new',
    tags:       w.tags       || [],
    source:     w.source     || 'builtin',
  };
}

async function loadWords() {
  try {
    const BATCH = 500;
    let offset = 0;
    let all = [];
    while (true) {
      const res  = await fetch(`/api/words?limit=${BATCH}&offset=${offset}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;
      all = all.concat(data.map(normalizeWord));
      if (data.length < BATCH) break;
      offset += BATCH;
    }
    if (all.length === 0) throw new Error('No words loaded');
    WORDS = all;
    DICT  = Object.fromEntries(WORDS.map(w => [w.word, { def: w.def, phonetic: w.phonetic }]));
    console.log('[loadWords] 成功載入 ' + WORDS.length + ' 個單字');
  } catch (err) {
    console.error('[loadWords] 載入失敗:', err.message, '使用備用資料');
    WORDS = FALLBACK_WORDS;
    DICT  = Object.fromEntries(WORDS.map(w => [w.word, { def: w.def, phonetic: w.phonetic }]));
  }
  if (readTab === 'grammar') renderLib();
}

async function loadArticles() {
  try {
    const res  = await fetch('/api/articles');
    const data = await res.json();
    ARTICLES = data.map(a => ({ ...a, text: a.content || '' }));
  } catch {
    console.warn('articles API unavailable, using fallback');
    ARTICLES = FALLBACK_ARTICLES;
  }
}

async function loadDailyArticles() {
  try {
    const res  = await fetch('/api/daily-articles');
    const data = await res.json();
    DAILY_ARTICLES = data.articles || [];
  } catch {
    DAILY_ARTICLES = [];
  }
}

// ── FALLBACK（API 離線時使用）──
const FALLBACK_WORDS = [
  { word: 'abandon',  pos: '動詞',   def: '放棄；遺棄', ex: 'He had to abandon his plan.\n他不得不放棄他的計畫。',  tag: '會考必考', phonetic: '/əˈbændən/', st: 'new' },
  { word: 'believe',  pos: '動詞',   def: '相信；認為', ex: 'I believe you can do it.\n我相信你做得到。',            tag: '高頻',     phonetic: '/bɪˈliːv/',   st: 'new' },
  { word: 'careful',  pos: '形容詞', def: '小心的',     ex: 'Be careful crossing the street.\n過馬路時要小心。',    tag: '基礎',     phonetic: '/ˈkeəfəl/',   st: 'new' },
];
const FALLBACK_ARTICLES = [
  { id: 1, emoji: '🌿', tag: '精選', title: 'The Power of Habit', locked: false, text: 'Loading...' },
];

let curIdx = 0, revealed = false, combo = 0, xp = 230;
let capturedWords = [];
let libOpenSections = new Set();

// ── 角色屬性 STATS ────────────────────────────────────────────────
// STR 力量 = 單字練習量（每次翻牌 rate() +1）
// INT 智力 = 文章練習量（每次完成閱讀測驗 showQuizResult() +1）
// FAI 信仰 = 文法教學完成度（Grammar 功能上線後啟用）

const STATS = { str: 0, int: 0, fai: 0 };

function loadStats() {
  // 已登入：從 currentProfile 讀（在 _loadProfile 後由 auth.js 覆蓋）
  if (typeof currentProfile !== 'undefined' && currentProfile) {
    STATS.str = currentProfile.str_stat ?? 5;
    STATS.int = currentProfile.int_stat ?? 5;
    STATS.fai = currentProfile.fai_stat ?? 5;
    return;
  }
  // 訪客/尚未登入：從 localStorage 讀
  try {
    const s = JSON.parse(localStorage.getItem('voca_stats') || '{}');
    STATS.str = s.str || 0;
    STATS.int = s.int || 0;
    STATS.fai = s.fai || 0;
  } catch {}
}

function saveStats() {
  if (typeof currentProfile !== 'undefined' && currentProfile) {
    currentProfile.str_stat = STATS.str;
    currentProfile.int_stat = STATS.int;
    currentProfile.fai_stat = STATS.fai;
    if (typeof syncStats !== 'undefined') syncStats(STATS.str, STATS.int, STATS.fai);
    return;
  }
  localStorage.setItem('voca_stats', JSON.stringify(STATS));
}

// ── DECK & STUDY-MODE STATE ──────────────────────────────────────
let STUDY_WORDS   = [];        // 當次練習的單字清單（來自 Deck 或全部）
let studyReturnTo = 'home';    // 'home' | 'wordcard'
let customDecks   = [];        // [{id,name,emoji,wordIds:[]}]
let _pendingCaptureWord = '';  // 捕捉選 Deck 時暫存的單字
let fcCurrentDeckId = null;    // 當前 Flashcard 頁面的卡組 ID（用於新增單字）

const DECK_EMOJIS = ['⭐','🎯','🚀','💡','📝','🔑','💪','🌟','🎓','🏆','🔥','🌈'];
let selectedDeckEmoji = DECK_EMOJIS[0];

const BUILTIN_DECKS = [
  {
    id: 'cap2000', name: '會考2000單字', emoji: '📚',
    cls: 'deck-cap2000',
    getWords: () => WORDS,
  },
  {
    id: 'weak', name: '不熟字卡', emoji: '🔥',
    cls: 'deck-weak',
    getWords: () => WORDS.filter(w => w.st === 'lrn' || capturedWords.includes(w.word)),
  },
];

// ── DAILY ARTICLES STATE ──
let DAILY_ARTICLES = [];
let currentDailyArticle = null;
let readTab = 'curated';
let quizState = null; // { questions, idx, score, answers }

// ── NAV ──
function goReadTab(tab, btn) {
  readTab = tab;
  if (!btn) {
    const rtabBtn = document.getElementById('rtab' + tab.charAt(0).toUpperCase() + tab.slice(1));
    if (rtabBtn) {
      const parentNav = document.querySelector('#reading .bnav');
      if (parentNav) {
        btn = parentNav.querySelector('.bn:nth-child(4)');
      }
    }
  }
  goScreen('reading', btn);
}

function goScreen(id, btn) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screenEl = document.getElementById(id);
  screenEl.classList.add('active');
  document.querySelectorAll('.bn').forEach(b => b.classList.remove('active'));
  // 每個畫面各自有一份獨立的底部導覽列複本，被點擊的 btn 可能屬於切換前（現已隱藏）的畫面，
  // 所以要在「新畫面」自己的導覽列裡找出對應按鈕來標記 active，而不是直接用 btn。
  const activeBtn = screenEl.querySelector(`.bnav .bn[onclick*="goScreen('${id}',"]`);
  if (activeBtn) activeBtn.classList.add('active');
  else if (btn) btn.classList.add('active');
  if (id === 'flashcard')  loadFlashcard(fcCurrentIdx);
  if (id === 'reading') { switchReadTab(readTab); }
  if (id === 'arena') {
    // 進入競技場一律回到大廳；若先前有未結束的房間則先退出
    pvpAbandonIfActive();
    pvpResetViews();
  }
  if (id === 'home') { updateHomeScreen(); }
  closeWordPopup();
}

// ── PIXEL CHAR ──
function updateChar() {
  const { int, fai } = STATS;

  // STR = 已熟悉的單字數（標記為 'ok'），目標 2000 字全滿
  const str = WORDS.filter(w => w.st === 'ok').length;
  const wordTotal = WORDS.length || 2000;

  // ── 等級計算（加權分）
  const score = str + int * 5 + fai * 10;
  const badge = document.getElementById('charBadge');
  const name  = document.getElementById('charName');
  if      (score >= 500) { badge.textContent = '全能備考者';   name.textContent = 'LV.4 騎士守護者'; }
  else if (score >= 150) { badge.textContent = '博學備考者';   name.textContent = 'LV.3 戰士學徒';   }
  else if (score >= 30)  { badge.textContent = '勇敢的備考者'; name.textContent = 'LV.2 單字勇者';   }
  else                   { badge.textContent = '初來的備考者'; name.textContent = 'LV.1 單字學徒';   }

  // ── STR 力量：已熟悉單字數 / 全部單字數
  document.getElementById('aStr').textContent = str;
  document.getElementById('fStr').style.width = Math.min(str / wordTotal * 100, 100) + '%';

  // ── INT 智力：文章練習量（上限 100 填滿）
  document.getElementById('aInt').textContent = int;
  document.getElementById('fInt').style.width = Math.min(int / 100 * 100, 100) + '%';

  // ── FAI 信仰：文法完成度（上限 30 填滿，功能上線後啟用）
  document.getElementById('aFai').textContent = fai;
  document.getElementById('fFai').style.width = Math.min(fai / 30 * 100, 100) + '%';
}

// ── STUDY ──
function loadCard(idx) {
  if (!STUDY_WORDS.length) return;
  revealed = false;
  const w = STUDY_WORDS[idx];
  document.getElementById('wcWord').textContent = w.word;
  document.getElementById('wcPos').textContent  = w.pos;
  document.getElementById('wcDef').textContent  = w.def;
  document.getElementById('wcEx').textContent   = w.ex;
  const wcTagEl = document.getElementById('wcTag');
  wcTagEl.textContent = w.tag;
  wcTagEl.style.display = w.tag ? '' : 'none';
  document.getElementById('wcNum').textContent  = String(idx + 1).padStart(2, '0');
  document.getElementById('sessInfo').textContent = `第 ${idx + 1} / ${STUDY_WORDS.length} 張`;
  document.getElementById('wcHint').style.display = 'block';
  document.getElementById('wcDef').style.display  = 'none';
  document.getElementById('wcEx').style.display   = 'none';
  document.getElementById('actRow').style.opacity       = '.3';
  document.getElementById('actRow').style.pointerEvents = 'none';
}

function revealCard() {
  if (revealed) return;
  revealed = true;
  document.getElementById('wcHint').style.display = 'none';
  document.getElementById('wcDef').style.display  = 'block';
  document.getElementById('wcEx').style.display   = 'block';
  document.getElementById('actRow').style.opacity       = '1';
  document.getElementById('actRow').style.pointerEvents = 'auto';
}

function rate(hit) {
  if (!revealed) return;
  const w = STUDY_WORDS[curIdx];
  if (hit) {
    combo++; xp += combo >= 3 ? 35 : 20;
    showFb('掌握！', true);
    if (combo >= 3) {
      document.getElementById('comboTxt').textContent = `COMBO ×${combo}`;
      document.getElementById('comboTxt').classList.add('show');
      setTimeout(() => document.getElementById('comboTxt').classList.remove('show'), 1600);
    }
    navigator.vibrate && navigator.vibrate(30);
    confetti();
    w.st = 'ok';
    w._correctStreak = (w._correctStreak || 0) + 1;
  } else {
    combo = 0; xp += 5;
    showFb('再努力！', false);
    document.getElementById('phone').classList.add('shake');
    setTimeout(() => document.getElementById('phone').classList.remove('shake'), 400);
    navigator.vibrate && navigator.vibrate([50, 30, 50]);
    w.st = 'lrn';
    w._correctStreak = 0;
  }
  if (typeof syncWordStatus !== 'undefined') syncWordStatus(w.id, w.st, w._correctStreak || 0);
  if (typeof syncXP !== 'undefined') syncXP(xp);
  document.getElementById('comboNum').textContent = combo;
  const pct = Math.min(xp / 1000 * 100, 100);
  document.getElementById('xpBar').style.width = pct + '%';
  document.getElementById('xpVal').textContent  = `${xp} / 1000`;
  updateChar();
  curIdx = (curIdx + 1) % STUDY_WORDS.length;
  setTimeout(() => loadCard(curIdx), 280);
}

function showFb(msg, hit) {
  const el = document.getElementById('fbTxt');
  el.textContent = msg;
  el.className = `fb-txt ${hit ? 'hit' : 'miss'} show`;
  setTimeout(() => el.className = `fb-txt ${hit ? 'hit' : 'miss'}`, 900);
}

// ── CONFETTI ──
function confetti() {
  const cv  = document.getElementById('confettiCanvas');
  const ctx = cv.getContext('2d');
  cv.width  = innerWidth;
  cv.height = innerHeight;
  const pts = Array.from({ length: 50 }, () => ({
    x: cv.width / 2, y: cv.height * .55,
    vx: (Math.random() - .5) * 14,
    vy: (Math.random() - .9) * 15,
    c: ['#3db870', '#FF6B00', '#FFD700', '#4488ff', '#ff6b6b'][0 | Math.random() * 5],
    s: Math.random() * 7 + 3, life: 1
  }));
  (function loop() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    let alive = false;
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += .45; p.life -= .022;
      if (p.life > 0) { alive = true; ctx.globalAlpha = p.life; ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.s, p.s); }
    });
    ctx.globalAlpha = 1;
    if (alive) requestAnimationFrame(loop);
    else ctx.clearRect(0, 0, cv.width, cv.height);
  })();
}

// ════════════════════════════════
// ARENA — 即時 PVP 單字對決（socket.io）
// 房主建房選模式 → 對手憑房號加入 → 伺服器統一出 5 題限時 30 秒
// 雙方完成或時間到由伺服器結算：答對數高者勝，相同平手
// ════════════════════════════════
let roomCode  = '';
let pvpSocket = null;
let pvpState  = null;   // { isHost, questions, qIdx, done, timerInt }
let hostSelectedMode = 'vocab';
let buzzerState = null; // { qIdx, total, myAnswered, foeAnswered, myTotal, foeTotal, countdownInt }

function openModal(id)  { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }

function selectPvpMode(mode) {
  hostSelectedMode = mode;
  document.getElementById('modeChipVocab').classList.toggle('sel', mode === 'vocab');
  document.getElementById('modeChipBuzzer').classList.toggle('sel', mode === 'buzzer');
}

function pvpResetViews() {
  document.getElementById('arenaLobby').style.display  = 'flex';
  document.getElementById('arenaWait').style.display   = 'none';
  document.getElementById('arenaBattle').style.display = 'none';
  document.getElementById('arenaBuzzerBattle').style.display = 'none';
  document.getElementById('arenaResult').style.display = 'none';
  document.getElementById('arenaBnav').style.display   = 'flex';
  if (pvpState && pvpState.timerInt) clearInterval(pvpState.timerInt);
  if (pvpState && pvpState.rematchCountdownInt) clearInterval(pvpState.rematchCountdownInt);
  if (buzzerState && buzzerState.countdownInt) clearInterval(buzzerState.countdownInt);
  pvpState = null;
  buzzerState = null;
  selectPvpMode('vocab');
  roomCode = '';
}

function pvpAbandonIfActive() {
  if (roomCode && pvpSocket && pvpSocket.connected) {
    pvpSocket.emit('leave_room', { code: roomCode });
  }
}

function getPvpSocket() {
  if (typeof io === 'undefined') {
    showToast('⚠ 連線元件載入失敗，請重新整理頁面');
    return null;
  }
  if (pvpSocket) {
    if (!pvpSocket.connected) pvpSocket.connect();
    return pvpSocket;
  }
  pvpSocket = io();

  pvpSocket.on('room_created', ({ code }) => {
    roomCode = code;
    pvpState = { isHost: true, questions: [], qIdx: 0, done: false, timerInt: null };
    document.getElementById('roomCodeBig').textContent = code.slice(0, 3) + ' ' + code.slice(3);
    document.getElementById('arenaLobby').style.display = 'none';
    document.getElementById('arenaWait').style.display  = 'flex';
    _pvpSetFoeSlot(false);
    document.getElementById('hostModePanel').style.display = 'flex';
    document.getElementById('guestWaitHint').style.display = 'none';
    const btn = document.getElementById('pvpStartBtn');
    btn.disabled = true;
    btn.textContent = '等待對手加入⋯';
  });

  pvpSocket.on('room_ready', ({ code }) => {
    roomCode = code;
    if (!pvpState) {   // 加入方第一次收到
      pvpState = { isHost: false, questions: [], qIdx: 0, done: false, timerInt: null };
      document.getElementById('roomCodeBig').textContent = code.slice(0, 3) + ' ' + code.slice(3);
      document.getElementById('arenaLobby').style.display = 'none';
      document.getElementById('arenaWait').style.display  = 'flex';
      document.getElementById('hostModePanel').style.display = 'none';
      document.getElementById('guestWaitHint').style.display = 'block';
    } else if (pvpState.isHost) {
      const btn = document.getElementById('pvpStartBtn');
      btn.disabled = false;
      btn.textContent = '開始對決 ▶';
      showToast('⚔ 對手已加入，可以開始對決！');
    }
    _pvpSetFoeSlot(true);
  });

  pvpSocket.on('room_error', ({ msg }) => showToast(`⚠ ${msg}`));

  pvpSocket.on('battle_start', ({ questions, duration }) => {
    if (!pvpState) return;
    pvpState.mode = 'vocab';
    pvpState.questions = questions;
    pvpState.qIdx = 0;
    pvpState.done = false;
    if (pvpState.rematchCountdownInt) { clearInterval(pvpState.rematchCountdownInt); pvpState.rematchCountdownInt = null; }
    document.getElementById('arenaWait').style.display   = 'none';
    document.getElementById('arenaBattle').style.display = 'flex';
    document.getElementById('arenaBuzzerBattle').style.display = 'none';
    document.getElementById('arenaBnav').style.display   = 'none';
    document.getElementById('pvpDoneWait').style.display = 'none';
    // 若是「再來一場」進來的，重置結算畫面上的按鈕狀態，供下一輪結束後使用
    const rematchBtn = document.getElementById('pvpRematchBtn');
    rematchBtn.disabled = false;
    rematchBtn.textContent = '🔁 再來一場';
    _pvpSetBars(0, 0, questions.length);
    // 倒數計時（顯示用；實際結算以伺服器為準）
    const endAt = Date.now() + duration * 1000;
    const timerEl = document.getElementById('pvpTimer');
    const tick = () => {
      const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      timerEl.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
      timerEl.classList.toggle('low', left <= 10);
      if (left <= 0) clearInterval(pvpState.timerInt);
    };
    tick();
    pvpState.timerInt = setInterval(tick, 250);
    loadPvpQ();
  });

  pvpSocket.on('pvp_progress', ({ progress }) => {
    if (!pvpState) return;
    const myId  = pvpSocket.id;
    const foeId = Object.keys(progress).find(id => id !== myId);
    _pvpSetBars(progress[myId] || 0, progress[foeId] || 0, pvpState.questions.length || 5);
  });

  pvpSocket.on('battle_result', ({ scores, winner, total }) => {
    if (!pvpState) return;
    if (pvpState.timerInt) clearInterval(pvpState.timerInt);
    if (buzzerState && buzzerState.countdownInt) clearInterval(buzzerState.countdownInt);
    const isBuzzer = pvpState.mode === 'buzzer';
    const myId  = pvpSocket.id;
    const foeId = Object.keys(scores).find(id => id !== myId);
    const mine = scores[myId] || 0, foe = scores[foeId] || 0;
    const iconEl  = document.getElementById('pvpResultIcon');
    const titleEl = document.getElementById('pvpResultTitle');
    if (winner === null)      { iconEl.textContent = '🤝'; titleEl.textContent = '平手！';  titleEl.style.color = 'var(--orange2)'; }
    else if (winner === myId) { iconEl.textContent = '🏆'; titleEl.textContent = '勝利！';  titleEl.style.color = 'var(--green2)';  confetti(); }
    else                      { iconEl.textContent = '💀'; titleEl.textContent = '敗北⋯'; titleEl.style.color = 'var(--wrong)'; }
    document.getElementById('pvpResultScore').textContent = isBuzzer
      ? `你 ${mine} 分 ・ 對手 ${foe} 分`
      : `你 ${mine}/${total} ・ 對手 ${foe}/${total}`;
    document.getElementById('arenaBattle').style.display = 'none';
    document.getElementById('arenaBuzzerBattle').style.display = 'none';
    document.getElementById('arenaResult').style.display = 'flex';
    // 房間仍保留在伺服器（供「再來一場」用），只有離開/斷線才會真正解散
    document.getElementById('pvpRematchBtn').style.display      = pvpState.isHost ? 'block' : 'none';
    document.getElementById('pvpRematchWaitHint').style.display = pvpState.isHost ? 'none'  : 'block';
    _pvpStartRematchCountdown();
  });

  // ── 單字搶答（buzzer）──
  pvpSocket.on('buzzer_question', (data) => {
    if (!pvpState) return;
    pvpState.mode = 'buzzer';
    document.getElementById('arenaWait').style.display = 'none';
    document.getElementById('arenaBattle').style.display = 'none';
    document.getElementById('arenaBuzzerBattle').style.display = 'flex';
    document.getElementById('arenaBnav').style.display = 'none';
    _renderBuzzerQuestion(data);
  });

  pvpSocket.on('buzzer_result_self', ({ qIdx, correct, points, correctIndex, myTotal }) => {
    if (!buzzerState || buzzerState.qIdx !== qIdx) return;
    buzzerState.myAnswered = true;
    buzzerState.myTotal = myTotal;
    document.getElementById('bzScoreYou').textContent = myTotal;
    document.getElementById('bzYouBadge').textContent = correct ? '✅' : '❌';
    const btns = document.querySelectorAll('.bz-opt');
    btns.forEach(b => b.disabled = true);
    if (btns[correctIndex]) btns[correctIndex].classList.add('correct');
    if (!correct && buzzerState.myChoice != null && btns[buzzerState.myChoice]) {
      btns[buzzerState.myChoice].classList.add('wrong');
    }
  });

  pvpSocket.on('buzzer_opponent_answered', ({ qIdx, opponentTotal }) => {
    if (!buzzerState || buzzerState.qIdx !== qIdx) return;
    buzzerState.foeAnswered = true;
    buzzerState.foeTotal = opponentTotal;
    document.getElementById('bzScoreFoe').textContent = opponentTotal;
    document.getElementById('bzFoeBadge').textContent = '✓';
  });

  pvpSocket.on('buzzer_reveal', ({ qIdx, correctIndex, scores }) => {
    if (!buzzerState || buzzerState.qIdx !== qIdx) return;
    if (buzzerState.countdownInt) clearInterval(buzzerState.countdownInt);
    const myId  = pvpSocket.id;
    const foeId = Object.keys(scores).find(id => id !== myId);
    document.getElementById('bzScoreYou').textContent = scores[myId] || 0;
    document.getElementById('bzScoreFoe').textContent = scores[foeId] || 0;
    const btns = document.querySelectorAll('.bz-opt');
    btns.forEach(b => b.disabled = true);
    if (btns[correctIndex]) btns[correctIndex].classList.add('correct');
    if (!buzzerState.myAnswered && buzzerState.myChoice != null && buzzerState.myChoice !== correctIndex && btns[buzzerState.myChoice]) {
      btns[buzzerState.myChoice].classList.add('wrong');
    }
  });

  pvpSocket.on('rematch_error', ({ msg }) => showToast(`⚠ ${msg}`));

  pvpSocket.on('opponent_left', () => {
    showToast('👋 對手已離開房間');
    pvpResetViews();
  });
  pvpSocket.on('room_expired', () => {
    showToast('⏰ 房間已過期');
    pvpResetViews();
  });
  pvpSocket.on('disconnect', () => {
    if (roomCode) {
      showToast('⚠ 連線中斷');
      pvpResetViews();
    }
  });

  return pvpSocket;
}

function createRoom() {
  const s = getPvpSocket();
  if (!s) return;
  s.emit('create_room');
}

function copyRoom() {
  navigator.clipboard && navigator.clipboard.writeText(roomCode);
  showToast('✓ 房號已複製！傳給同學開尬吧');
}

function confirmJoin() {
  const v = document.getElementById('joinInput').value;
  if (v.length !== 6) return showToast('⚠ 請輸入 6 位數房號');
  const s = getPvpSocket();
  if (!s) return;
  closeModal('joinModal');
  document.getElementById('joinInput').value = '';
  s.emit('join_room', { code: v });
}

function hostStartBattle() {
  if (!pvpState || !pvpState.isHost || !roomCode) return;
  const btn = document.getElementById('pvpStartBtn');
  btn.disabled = true;
  btn.textContent = '出題中⋯';
  pvpSocket.emit('select_mode', { code: roomCode, mode: hostSelectedMode });
  pvpSocket.emit('start_battle', { code: roomCode });
}

function hostRematch() {
  if (!pvpState || !pvpState.isHost || !roomCode) return;
  const btn = document.getElementById('pvpRematchBtn');
  btn.disabled = true;
  btn.textContent = '出題中⋯';
  pvpSocket.emit('rematch', { code: roomCode });
}

function leaveRoom() {
  pvpAbandonIfActive();
  pvpResetViews();
}

function _pvpSetFoeSlot(joined) {
  document.getElementById('foeName').textContent = joined ? '對手' : '等待中';
  const st = document.getElementById('foeStatus');
  st.textContent = joined ? '✓ 已就緒' : '⏳ …';
  st.className = joined ? 'slot-status ok' : 'slot-status wait-dots';
  document.getElementById('foeSlot').classList.toggle('slot-ready', joined);
}

function _pvpSetBars(mine, foe, total) {
  document.getElementById('hpYou').style.width = Math.max(mine / total * 100, 4) + '%';
  document.getElementById('hpFoe').style.width = Math.max(foe  / total * 100, 4) + '%';
  document.getElementById('scYou').textContent = `${mine}/${total}`;
  document.getElementById('scFoe').textContent = `${foe}/${total}`;
}

// 結算畫面「再來一場」倒數 10 秒，時間到就把按鈕（房主）／等待提示（對手）都藏起來，只留「返回競技場」
function _pvpStartRematchCountdown() {
  if (!pvpState) return;
  if (pvpState.rematchCountdownInt) clearInterval(pvpState.rematchCountdownInt);
  const btn  = document.getElementById('pvpRematchBtn');
  const hint = document.getElementById('pvpRematchWaitHint');
  let left = 10;
  const tick = () => {
    if (pvpState.isHost) btn.textContent = `🔁 再來一場（${left}）`;
    else hint.textContent = `🕐 等待房主決定是否再來一場⋯（${left}）`;
    if (left <= 0) {
      clearInterval(pvpState.rematchCountdownInt);
      btn.style.display  = 'none';
      hint.style.display = 'none';
      return;
    }
    left--;
  };
  tick();
  pvpState.rematchCountdownInt = setInterval(tick, 1000);
}

function loadPvpQ() {
  const st = pvpState;
  if (!st) return;
  if (st.qIdx >= st.questions.length) {
    st.done = true;
    document.getElementById('pvpQNum').textContent = '';
    document.getElementById('pvpQ').textContent = '';
    document.getElementById('pvpOpts').innerHTML = '';
    document.getElementById('pvpDoneWait').style.display = 'block';
    return;
  }
  const q = st.questions[st.qIdx];
  document.getElementById('pvpQNum').textContent = `第 ${st.qIdx + 1} / ${st.questions.length} 題${q.pos ? `・${q.pos}` : ''}`;
  document.getElementById('pvpQ').textContent = q.q;
  document.getElementById('pvpOpts').innerHTML = q.opts.map((o, i) =>
    `<button class="pvp-opt" onclick="answerPvp(${i})">${o}</button>`).join('');
}

function answerPvp(idx) {
  const st = pvpState;
  if (!st || st.done) return;
  const q = st.questions[st.qIdx];
  const btns = document.querySelectorAll('.pvp-opt');
  btns.forEach(b => b.disabled = true);
  btns[idx].classList.add(idx === q.answer ? 'correct' : 'wrong');
  btns[q.answer].classList.add('correct');
  pvpSocket.emit('pvp_answer', { code: roomCode, qIdx: st.qIdx, choice: idx });
  st.qIdx++;
  setTimeout(loadPvpQ, 700);
}

// ── 單字搶答（buzzer）畫面渲染 ──
function _renderBuzzerQuestion(data) {
  if (buzzerState && buzzerState.countdownInt) clearInterval(buzzerState.countdownInt);
  buzzerState = {
    qIdx: data.qIdx, total: data.total,
    myAnswered: false, foeAnswered: false, myChoice: null,
    myTotal: buzzerState ? buzzerState.myTotal : 0,
    foeTotal: buzzerState ? buzzerState.foeTotal : 0,
    countdownInt: null,
  };
  document.getElementById('bzYouBadge').textContent = '';
  document.getElementById('bzFoeBadge').textContent = '';
  const isLast = data.qIdx === data.total - 1;
  document.getElementById('bzQNum').textContent = `第 ${data.qIdx + 1} / ${data.total} 題${isLast ? '・雙倍分數！' : ''}`;
  document.getElementById('bzQuestion').textContent = data.sentence;
  document.getElementById('bzOpts').innerHTML = data.options.map((o, i) =>
    `<button class="bz-opt" onclick="answerBuzzer(${i})">${escHtml(o)}</button>`).join('');

  const duration = data.duration || 10;
  const endAt = Date.now() + duration * 1000;
  const ring  = document.getElementById('bzRing');
  const numEl = document.getElementById('bzTimerNum');
  const tick = () => {
    const leftMs  = Math.max(0, endAt - Date.now());
    const leftSec = Math.ceil(leftMs / 1000);
    numEl.textContent = leftSec;
    ring.style.setProperty('--pct', Math.max(0, (leftMs / (duration * 1000)) * 100).toFixed(1));
    ring.classList.toggle('low', leftSec <= 3);
    if (leftMs <= 0) clearInterval(buzzerState.countdownInt);
  };
  tick();
  buzzerState.countdownInt = setInterval(tick, 100);
}

function answerBuzzer(idx) {
  if (!buzzerState || buzzerState.myAnswered) return;
  buzzerState.myAnswered = true;
  buzzerState.myChoice = idx;
  document.querySelectorAll('.bz-opt').forEach(b => b.disabled = true);
  pvpSocket.emit('buzzer_answer', { code: roomCode, qIdx: buzzerState.qIdx, choice: idx });
}

function backArena() {
  pvpAbandonIfActive();   // 結算後房間會保留供「再來一場」用，選擇返回時要主動通知伺服器解散
  pvpResetViews();
}

// ── READING TABS ──
let curatedSubTab = 'exam';

// ── 會考歷屆資料（dataUrl 有值＝已上線可作答） ──
const GSAT_EXAMS = [
  { year: 2026, type: 'reading',   label: '閱讀測驗', icon: '📖', dataUrl: '/server/data/gsat_exam_2026_reading.json' },
  { year: 2026, type: 'listening', label: '聽力測驗', icon: '🔊', dataUrl: '/server/data/gsat_exam_2026_listening.json' },
  { year: 2025, type: 'reading',   label: '閱讀測驗', icon: '📖', dataUrl: '/server/data/gsat_exam_2025_reading.json' },
  { year: 2025, type: 'listening', label: '聽力測驗', icon: '🔊', dataUrl: '/server/data/gsat_exam_2025_listening.json' },
  { year: 2024, type: 'reading',   label: '閱讀測驗', icon: '📖', dataUrl: '/server/data/gsat_exam_2024_reading.json' },
  { year: 2024, type: 'listening', label: '聽力測驗', icon: '🔊', dataUrl: '/server/data/gsat_exam_2024_listening.json' },
  { year: 2023, type: 'reading',   label: '閱讀測驗', icon: '📖', dataUrl: '/server/data/gsat_exam_2023_reading.json' },
  { year: 2023, type: 'listening', label: '聽力測驗', icon: '🔊', dataUrl: '/server/data/gsat_exam_2023_listening.json' },
];

// 單題（第1–19題）的題型分類，供「答錯題庫」歸檔使用
const GSAT_SINGLE_CAT = {
  1:'vocab', 2:'vocab', 3:'vocab', 4:'vocab', 5:'vocab', 6:'grammar', 7:'vocab',
  8:'grammar', 9:'grammar', 10:'grammar', 11:'grammar', 12:'grammar', 13:'vocab',
  14:'vocab', 15:'vocab', 16:'grammar', 17:'grammar', 18:'grammar', 19:'grammar',
};

function _gsatYearRowsHTML(openFnName) {
  const years = [2026, 2025, 2024, 2023];
  return years.map(year => {
    const exams = GSAT_EXAMS.filter(e => e.year === year);
    return `
      <div class="gsat-year-row">
        <div class="gyr-year">
          <div class="gyr-num">${year}</div>
          <div class="gyr-label">國中教育會考</div>
        </div>
        <div class="gyr-exams">
          ${exams.map(e => {
            const hasData = !!e.dataUrl;
            return `
              <button class="gyr-exam${hasData ? '' : ' empty'}" onclick="${hasData ? `${openFnName}(${e.year},'${e.type}')` : ''}">
                <div class="gyr-exam-name">${e.icon} ${e.label}</div>
                <div class="gyr-exam-status">${hasData ? '開始作答' : '準備中'}</div>
              </button>`;
          }).join('')}
        </div>
      </div>`;
  }).join('');
}

function renderGsatList() {
  const el = document.getElementById('gsatList');
  if (!el) return;
  el.innerHTML = _gsatYearRowsHTML('openGsatExam');
}

function renderGsatLib() {
  const el = document.getElementById('libGsatList');
  if (!el) return;
  el.innerHTML = _gsatYearRowsHTML('openLibGsatExam');
}

// ── 全卷作答引擎（會考歷屆）─────────────────────────────────────────────
// gsatExam 狀態：{ idprefix, qmap:{n:{options,answer,explanation,cat,bankStem}},
//                 total, answers:{n:選項index}, submitted, remain(秒), timerId, bodyEl }
let gsatExam = null;

function _gxEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
function _gxPassageHtml(t) {
  return String(t == null ? '' : t).split(/\n\n+/).map(p => '<p>' + wrapWordsHtml(p) + '</p>').join('');
}
function _gxPlaceholder(year, exam) {
  return `
    <div class="gsat-placeholder">
      <div class="rp-icon">${exam.icon}</div>
      <div class="rp-title">${year} ${exam.label}</div>
      <div class="rp-desc">考題內容準備中<br>即將加入完整試題</div>
      <div class="rp-badge">即將上線</div>
    </div>`;
}
function _gxQCard(q) {
  const qn = q.n;
  const audio = q.audio ? `<audio class="gx-audio" controls preload="none" src="${q.audio}"></audio>` : '';
  const img = q.image ? `<img class="gx-img" src="${q.image}" alt="">` : '';
  const stemTxt = q.stem ? _gxEsc(q.stem)
    : (q.audio ? '<span class="gx-listen-tag">🎧 聆聽後作答（內容唸兩次）</span>' : '');
  const opts = q.options.map((o, oi) => {
    const zh = (q.optionsZh && q.optionsZh[oi])
      ? `<span class="gx-opt-zh">${_gxEsc(q.optionsZh[oi])}</span>` : '';
    return `<button type="button" class="gx-opt" id="gxo_${qn}_${oi}" onclick="gsatSelect(${qn},${oi})">${_gxEsc(o)}${zh}</button>`;
  }).join('');
  return `<div class="gx-q" id="gxq_${qn}">
    <div class="gx-stem" id="gxs_${qn}"><span class="gx-num">${qn}.</span> ${stemTxt}</div>
    ${audio}
    ${img}
    <div class="gx-opts">${opts}</div>
    <div class="gx-explain" id="gxe_${qn}" style="display:none"></div>
  </div>`;
}

// 共用：把指定 exam 渲染進指定容器（curated 與 library 兩個入口共用）
function _openGsatExamInto(year, type, ids) {
  const exam = GSAT_EXAMS.find(e => e.year === year && e.type === type);
  if (!exam) return;
  const viewEl = document.getElementById(ids.view);
  document.getElementById(ids.list).style.display = 'none';
  viewEl.style.display = 'flex';
  document.getElementById(ids.title).textContent = `${year} 國中會考 ${exam.label}`;
  const body = document.getElementById(ids.body);
  const bw = viewEl.querySelector('.gx-barwrap');
  if (bw) bw.innerHTML = '';
  if (!exam.dataUrl) {
    viewEl.classList.remove('gsat-fullscreen');
    _gsatCleanupTimer();
    body.innerHTML = _gxPlaceholder(year, exam);
    return;
  }

  // 全螢幕作答模式：覆蓋上方分頁列與底部導航，只能透過「返回」退出
  viewEl.classList.add('gsat-fullscreen');
  body.innerHTML = `<div class="gx-loading">載入試卷中…</div>`;
  fetch(exam.dataUrl)
    .then(res => { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
    .then(data => _renderGsatExam(_normalizeGsatData(data), body, `gsat${year}${type}`))
    .catch(err => { body.innerHTML = `<div class="gx-loading">試卷載入失敗：${_gxEsc(err.message)}</div>`; });
}

// 將舊版 JSON 格式（2023/2024）正規化為 2026 格式供 renderer 使用
function _normalizeGsatData(data) {
  const normalizeQ = q => q.stem ? q : Object.assign({}, q, { stem: q.question || '' });
  data.sections = data.sections.map(sec => {
    if (sec.kind === 'single') {
      return Object.assign({}, sec, { items: sec.items.map(normalizeQ) });
    }
    // group section：舊格式用 items[].{passages,questions}，新格式用 passages[]
    if (!sec.passages && sec.items) {
      const passages = sec.items.map(item => {
        const ps = item.passages || [];
        // 合併多個 passage：圖片取第一個有 image 的，文字取第一個有 passage 的
        const imgP  = ps.find(p => p.image) || {};
        const txtP  = ps.find(p => p.passage) || {};
        return {
          title: item.title || '',
          range: item.title || '',
          passageType: imgP.passageType || txtP.passageType || 'text',
          image: imgP.image || null,
          caption: imgP.caption || txtP.caption || null,
          passage: txtP.passage || imgP.passage || null,
          questions: (item.questions || []).map(normalizeQ),
        };
      });
      return Object.assign({}, sec, { passages, items: undefined });
    }
    // 新格式 group：只需正規化 questions 的 stem
    return Object.assign({}, sec, {
      passages: sec.passages.map(p =>
        Object.assign({}, p, { questions: (p.questions || []).map(normalizeQ) })
      ),
    });
  });
  return data;
}

function _renderGsatExam(data, bodyEl, idprefix) {
  const qmap = {};
  let total = 0;
  // 計分列：固定於捲動區「外」，避免蓋住題目圖片
  const barHTML = `
    <div class="gsat-scorebar" id="gxBar">
      <div class="gx-timer" id="gxTimer">--:--</div>
      <div class="gx-prog" id="gxProg"></div>
      <button type="button" class="gsat-submit" onclick="gsatSubmit()">交卷</button>
    </div>`;
  let html = `
    <div class="gx-meta">${_gxEsc(data.source || '')}　共 ${data.totalQuestions} 題・${data.durationMin} 分鐘</div>`;

  if (data.type === 'listening') {
    html += `<div class="gx-listen-start" id="gxListenStart">
      <div class="gls-info">🎧 共 ${data.totalQuestions} 題，按下後將倒數 3 秒，<b>連續播放</b>官方原聲（每題唸兩次、中途不暫停），模擬真實考試。<b>交卷後</b>才會出現各題播放鈕，可逐題重聽。</div>
      <button type="button" class="gsat-submit big" id="gxListenBtn" onclick="gsatStartListening()">▶ 開始測驗（倒數 3 秒）</button>
    </div>`;
  }

  data.sections.forEach(sec => {
    html += `<div class="gx-sec-title">${_gxEsc(sec.title)}　<span>${_gxEsc(sec.range || '')}</span></div>`;
    if (sec.desc) html += `<div class="gx-sec-desc">${_gxEsc(sec.desc)}</div>`;
    if (sec.kind === 'single') {
      sec.items.forEach(it => {
        qmap[it.n] = {
          options: it.options, answer: it.answer, explanation: it.explanation,
          transcript: it.transcript,
          cat: data.type === 'listening' ? 'listening' : (GSAT_SINGLE_CAT[it.n] || 'grammar'),
          bankStem: it.transcript ? ('🎧 ' + it.transcript) : it.stem,
        };
        total++;
        html += _gxQCard(it);
      });
    } else {
      sec.passages.forEach(p => {
        const cat = p.passageType === 'cloze' ? 'cloze' : 'reading';
        const pimg = p.image ? `<img class="gx-img gx-pimg" src="${p.image}" alt="" onload="splitIfTall(this)">` : '';
        const ptxt = p.passage ? `<div class="gx-passage gx-passage-zoom" onclick="openTxtLightbox(this,'${_gxEsc(p.title)}')">${_gxPassageHtml(p.passage)}</div>` : '';
        const cap  = p.caption ? `<div class="gx-cap">${_gxEsc(p.caption)}</div>` : '';
        let qhtml = '';
        p.questions.forEach(q => {
          qmap[q.n] = {
            options: q.options, answer: q.answer, explanation: q.explanation,
            cat, bankStem: `[${p.title}] ${q.stem}`,
          };
          total++;
          qhtml += _gxQCard(q);
        });
        html += `<div class="gx-passage-block">
          <div class="gx-ptitle">${_gxEsc(p.title)} <span class="gx-prange">(${_gxEsc(p.range)})</span></div>
          ${pimg}${ptxt}${cap}
          <div class="gx-pqs">${qhtml}</div>
        </div>`;
      });
    }
  });
  html += `<div class="gx-bottom"><button type="button" class="gsat-submit big" onclick="gsatSubmit()">交卷看成績</button></div>`;

  // 計分列放到捲動容器「外」（gsatExamView 內、body 之上），固定不捲動、不蓋題目
  const view = bodyEl.parentElement;
  let barWrap = view.querySelector('.gx-barwrap');
  if (!barWrap) {
    barWrap = document.createElement('div');
    barWrap.className = 'gx-barwrap';
    view.insertBefore(barWrap, bodyEl);
  }
  barWrap.innerHTML = barHTML;
  bodyEl.innerHTML = html;
  bodyEl.classList.remove('gx-submitted');

  if (gsatExam) {
    if (gsatExam.timerId) clearInterval(gsatExam.timerId);
    if (gsatExam.countdownTimer) clearInterval(gsatExam.countdownTimer);
  }
  gsatExam = {
    idprefix, qmap, total, answers: {}, submitted: false,
    remain: (data.durationMin || 60) * 60, timerId: null, bodyEl,
    countdownTimer: null, seqPlaying: false, seqIndex: -1,
  };
  _gsatRenderTimer();
  _gsatUpdateProgress();
  gsatExam.timerId = setInterval(_gsatTick, 1000);
  bodyEl.scrollTop = 0;
}

function gsatSelect(qn, oi) {
  if (!gsatExam || gsatExam.submitted) return;
  gsatExam.answers[qn] = oi;
  const q = gsatExam.qmap[qn];
  q.options.forEach((_, i) => {
    const el = document.getElementById('gxo_' + qn + '_' + i);
    if (el) el.classList.toggle('sel', i === oi);
  });
  _gsatUpdateProgress();
}

function _gsatUpdateProgress() {
  const p = document.getElementById('gxProg');
  if (p && gsatExam) p.textContent = `已作答 ${Object.keys(gsatExam.answers).length} / ${gsatExam.total}`;
}

function _gsatRenderTimer() {
  const t = document.getElementById('gxTimer');
  if (!t || !gsatExam) return;
  const r = Math.max(0, gsatExam.remain);
  const m = String(Math.floor(r / 60)).padStart(2, '0');
  const s = String(r % 60).padStart(2, '0');
  t.textContent = `${m}:${s}`;
  t.classList.toggle('low', r <= 300);
}
function _gsatTick() {
  if (!gsatExam) return;
  gsatExam.remain--;
  _gsatRenderTimer();
  if (gsatExam.remain <= 0) gsatSubmit(true);
}

function gsatSubmit(auto) {
  if (!gsatExam || gsatExam.submitted) return;
  const unanswered = gsatExam.total - Object.keys(gsatExam.answers).length;
  if (!auto && unanswered > 0 &&
      !confirm(`還有 ${unanswered} 題未作答，確定要交卷嗎？`)) return;

  gsatExam.submitted = true;
  clearInterval(gsatExam.timerId);
  _gsatStopAudio();   // 交卷即停止連續播放與所有音檔

  let correct = 0;
  Object.keys(gsatExam.qmap).forEach(qn => {
    const q = gsatExam.qmap[qn];
    const sel = gsatExam.answers[qn];
    const isRight = sel === q.answer;
    if (isRight) correct++;
    // 交卷後：選項文字從純文字升級為可點字查詢（跟詳解一致）
    q.options.forEach((o, i) => {
      const el = document.getElementById('gxo_' + qn + '_' + i);
      if (!el) return;
      el.classList.remove('sel');
      const zh = (q.optionsZh && q.optionsZh[i])
        ? `<span class="gx-opt-zh">${_gxEsc(q.optionsZh[i])}</span>` : '';
      el.innerHTML = `${wrapWordsHtml(o)}${zh}`;
      if (i === q.answer) el.classList.add('correct');
      else if (i === sel) el.classList.add('wrong');
      el.disabled = true;
    });
    const ee = document.getElementById('gxe_' + qn);
    if (ee) {
      const tag = sel == null ? '<span class="gx-skip">未作答</span>'
        : (isRight ? '<span class="gx-ok">答對</span>' : '<span class="gx-no">答錯</span>');
      const tr = q.transcript ? `<div class="gx-transcript"><b>🎧 原文：</b>${_gxEsc(q.transcript)}</div>` : '';
      ee.innerHTML = `${tag}　正解：(${'ABCD'[q.answer]})　${wrapWordsHtml(q.explanation || '')}${tr}`;
      ee.style.display = '';
    }
  });
  gsatExam.correct = correct;
  _gsatShowScore();
  // 交卷後才顯示各題獨立播放器（供逐題複習）
  if (gsatExam.bodyEl) gsatExam.bodyEl.classList.add('gx-submitted');
  _gsatListenDone();   // 連播鈕重設為「▶ 重新播放」

  const bb = gsatExam.bodyEl && gsatExam.bodyEl.querySelector('.gx-bottom .gsat-submit');
  if (bb) { bb.textContent = `已交卷（答對 ${correct} / ${gsatExam.total}）`; bb.disabled = true; }
  if (gsatExam.bodyEl) gsatExam.bodyEl.scrollTop = 0;
}

function _gsatShowScore() {
  const bar = document.getElementById('gxBar');
  if (!bar || !gsatExam) return;
  const pct = Math.round(gsatExam.correct / gsatExam.total * 100);
  bar.classList.add('done');
  bar.innerHTML = `
    <div class="gx-score">答對 <b>${gsatExam.correct}</b> / ${gsatExam.total}　(${pct}%)</div>
    <button type="button" class="gsat-submit ghost" id="gxFileWrong" onclick="gsatFileWrong()">把答錯題加入答錯題庫</button>`;
}

function gsatFileWrong() {
  if (!gsatExam || !gsatExam.submitted) return;
  let n = 0;
  Object.keys(gsatExam.qmap).forEach(qn => {
    const q = gsatExam.qmap[qn];
    if (gsatExam.answers[qn] !== q.answer) {
      const norm = {
        id: gsatExam.idprefix + '_q' + qn,
        question: q.bankStem, options: q.options,
        answer: q.answer, explanation: q.explanation,
      };
      if (_qbankAdd('wrong', q.cat, norm)) n++;
    }
  });
  const btn = document.getElementById('gxFileWrong');
  if (btn) { btn.textContent = n ? `已加入 ${n} 題 ✓` : '答錯題已在題庫中 ✓'; btn.disabled = true; }
}

// ── 聽力：開始測驗 → 倒數 3 秒 → 連續播放全部音檔 ──────────────────────
// 用 Web Audio API 合成倒數嗶聲（無需音檔、無版權疑慮）
let _gxAudioCtx = null;
function _gxBeep(freq, dur, vol) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!_gxAudioCtx) _gxAudioCtx = new AC();
    const ctx = _gxAudioCtx;
    if (ctx.state === 'suspended') ctx.resume();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    o.connect(g); g.connect(ctx.destination);
    const t = ctx.currentTime;
    g.gain.setValueAtTime(vol || 0.16, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.15));
    o.start(t);
    o.stop(t + (dur || 0.15) + 0.03);
  } catch (e) {}
}

function gsatStartListening() {
  if (!gsatExam || gsatExam.seqPlaying) return;
  const view = document.getElementById('gsatExamView');
  const ov = document.createElement('div');
  ov.className = 'gx-countdown';
  view.appendChild(ov);
  let n = 3;
  ov.textContent = n;
  _gxBeep(800, 0.15);            // 倒數 3
  gsatExam.countdownTimer = setInterval(() => {
    n--;
    if (n > 0) { ov.textContent = n; _gxBeep(800, 0.15); return; }  // 倒數 2、1
    clearInterval(gsatExam.countdownTimer);
    gsatExam.countdownTimer = null;
    ov.textContent = 'Go!';
    _gxBeep(1245, 0.38, 0.2);    // Go! 較高、較長的提示音
    setTimeout(() => {
      ov.remove();
      gsatExam.seqPlaying = true;
      const btn = document.getElementById('gxListenBtn');
      if (btn) { btn.disabled = true; btn.textContent = '▶ 播放中…'; }
      _gsatPlaySeq(0);
    }, 600);
  }, 1000);
}

function _gsatPlaySeq(i) {
  if (!gsatExam || !gsatExam.seqPlaying) return;
  const audios = [...gsatExam.bodyEl.querySelectorAll('.gx-audio')];
  audios.forEach(x => { const c = x.closest('.gx-q'); if (c) c.classList.remove('gx-playing'); });
  if (i >= audios.length) { _gsatListenDone(); return; }
  const a = audios[i];
  const q = a.closest('.gx-q');
  gsatExam.seqIndex = i;
  if (q) { q.classList.add('gx-playing'); q.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  try { a.currentTime = 0; } catch (e) {}
  const pr = a.play();
  if (pr && pr.catch) pr.catch(() => {});
  a.onended = () => {
    if (!gsatExam || !gsatExam.seqPlaying) return;
    if (q) q.classList.remove('gx-playing');
    setTimeout(() => _gsatPlaySeq(i + 1), 700);
  };
}

function _gsatListenDone() {
  if (!gsatExam) return;
  gsatExam.seqPlaying = false;
  const btn = document.getElementById('gxListenBtn');
  if (btn) { btn.disabled = false; btn.textContent = '▶ 重新播放'; }
}

function _gsatStopAudio() {
  if (!gsatExam) return;
  gsatExam.seqPlaying = false;
  if (gsatExam.countdownTimer) { clearInterval(gsatExam.countdownTimer); gsatExam.countdownTimer = null; }
  if (gsatExam.bodyEl) {
    gsatExam.bodyEl.querySelectorAll('.gx-audio').forEach(a => {
      try { a.pause(); a.onended = null; } catch (e) {}
    });
    gsatExam.bodyEl.querySelectorAll('.gx-q.gx-playing').forEach(q => q.classList.remove('gx-playing'));
  }
  const ov = document.querySelector('.gx-countdown');
  if (ov) ov.remove();
}

function _gsatCleanupTimer() {
  _gsatStopAudio();
  if (gsatExam && gsatExam.timerId) clearInterval(gsatExam.timerId);
  gsatExam = null;
}

function openGsatExam(year, type) {
  _openGsatExamInto(year, type,
    { list: 'gsatList', view: 'gsatExamView', title: 'gsatExamTitle', body: 'gsatExamBody' });
}
function closeGsatExam() {
  _gsatCleanupTimer();
  const v = document.getElementById('gsatExamView');
  v.classList.remove('gsat-fullscreen');
  v.style.display = 'none';
  // .sub-panel 預設 display:none，需明確設回 flex（不可用 ''，否則會回退成隱藏）
  document.getElementById('gsatList').style.display = 'flex';
  renderGsatList();
}
function openLibGsatExam(year, type) {
  _openGsatExamInto(year, type,
    { list: 'libGsatList', view: 'libGsatExamView', title: 'libGsatExamTitle', body: 'libGsatExamBody' });
}
function closeLibGsatExam() {
  _gsatCleanupTimer();
  const v = document.getElementById('libGsatExamView');
  v.classList.remove('gsat-fullscreen');
  v.style.display = 'none';
  document.getElementById('libGsatList').style.display = 'flex';
  renderGsatLib();
}

function _resetBankPanel(prefix) {
  document.getElementById(prefix + 'Cats').style.display = '';
  document.getElementById(prefix + 'Back').style.display = 'none';
  document.getElementById(prefix + 'Content').style.display = 'none';
}

function switchCuratedSub(sub) {
  curatedSubTab = sub;
  ['Exam', 'Wrong', 'Saved', 'Daily'].forEach(t =>
    document.getElementById('csub' + t).classList.toggle('active', sub === t.toLowerCase())
  );

  // 隱藏所有 panel
  document.getElementById('gsatList').style.display      = 'none';
  document.getElementById('gsatExamView').style.display  = 'none';
  document.getElementById('artList').style.display       = 'none';
  document.getElementById('dailyList').classList.remove('show');
  document.getElementById('wrongList').classList.remove('show');
  document.getElementById('savedList').classList.remove('show');

  if (sub === 'exam') {
    document.getElementById('gsatList').style.display = 'flex';
    renderGsatList();
  } else if (sub === 'daily') {
    document.getElementById('dailyList').classList.add('show');
    dailyCatOpen = null;
    document.getElementById('dailyCats').style.display = '';
    document.getElementById('dailyReadingBack').style.display = 'none';
    document.getElementById('artList').style.display = 'none';
    renderDailyArticles();
  } else if (sub === 'wrong') {
    document.getElementById('wrongList').classList.add('show');
    _resetBankPanel('wrong');
    _updateBankCounts('wrong');
  } else if (sub === 'saved') {
    document.getElementById('savedList').classList.add('show');
    _resetBankPanel('saved');
    _updateBankCounts('saved');
  }
}

function switchReadTab(tab) {
  readTab = tab;

  ['Deck', 'Grammar', 'Curated'].forEach(t =>
    document.getElementById('rtab' + t).classList.toggle('active', tab === t.toLowerCase())
  );

  const deckPanel     = document.getElementById('deckPanel');
  const libraryPanel  = document.getElementById('libraryPanel');
  const artList       = document.getElementById('artList');
  const dailyList     = document.getElementById('dailyList');
  const grammarPanel  = document.getElementById('grammarPanel');
  const curatedPanel  = document.getElementById('curatedPanel');
  const artContent    = document.getElementById('artContent');
  const quizPanel     = document.getElementById('quizPanel');
  const quizResult    = document.getElementById('quizResult');

  // 隱藏所有 panel
  artContent.classList.remove('show');
  quizPanel.classList.remove('show');
  quizResult.classList.remove('show');
  quizPanel.style.display  = '';
  quizResult.style.display = '';
  deckPanel.classList.remove('show');
  libraryPanel.classList.remove('show');
  artList.style.display = 'none';
  dailyList.classList.remove('show');
  grammarPanel.classList.remove('show');
  if (curatedPanel) curatedPanel.classList.remove('show');
  // 隱藏精選題目子面板
  const gsatListEl = document.getElementById('gsatList');
  const gsatExamEl = document.getElementById('gsatExamView');
  const wrongListEl = document.getElementById('wrongList');
  const savedListEl = document.getElementById('savedList');
  if (gsatListEl)  gsatListEl.style.display  = 'none';
  if (gsatExamEl)  gsatExamEl.style.display  = 'none';
  if (wrongListEl) wrongListEl.classList.remove('show');
  if (savedListEl) savedListEl.classList.remove('show');

  if (tab === 'deck') {
    deckPanel.classList.add('show');
    renderDecks();
  } else if (tab === 'grammar') {
    grammarPanel.classList.add('show');
    renderLib();
  } else if (tab === 'curated') {
    curatedPanel.classList.add('show');
    switchCuratedSub(curatedSubTab);
  }
}

// ── DAILY ARTICLES UI ──
let dailyCatOpen = null;

function renderDailyArticles() {
  // 更新六分類「剩餘題數」徽章
  _updateDailyBadges();
}


function closeDailyCat() {
  dailyCatOpen = null;
  document.getElementById('dailyCats').style.display = '';
  document.getElementById('dailyReadingBack').style.display = 'none';
  document.getElementById('artList').style.display = 'none';
}

function _renderDailyReadingList(artList) {
  if (DAILY_ARTICLES.length === 0) {
    artList.innerHTML = `<div style="text-align:center;padding:40px 0;color:var(--gray);font-family:Nunito;font-weight:700">
      今日文章生成中…<br><span style="font-size:11px;margin-top:8px;display:block">通常在每天 00:05 自動更新</span>
    </div>`;
    return;
  }
  artList.innerHTML = DAILY_ARTICLES.map(a => {
    const done = a._done;
    return `<div class="daily-card${done ? ' done' : ''}" onclick="openDailyArticle('${a.id}')">
      <div class="dc-emoji">${a.emoji}</div>
      <div class="dc-body">
        <div class="dc-tag">${a.tag}</div>
        <div class="dc-title">${a.title}</div>
        <div class="dc-meta">${a.word_count || '—'} 字 · ${a.difficulty || 'B1'} · ${a.topic}</div>
      </div>
      ${done ? `<div class="dc-score">${a._score}/3</div>` : '<div style="font-size:18px;color:var(--gray2)">▶</div>'}
    </div>`;
  }).join('');
}

// ── 答錯題庫 / 收藏題庫 共用函數 ──────────────────────────────
const CAT_META = {
  vocab:     { icon: '📖', name: '單字' },
  phrase:    { icon: '🔗', name: '片語' },
  grammar:   { icon: '📐', name: '文法' },
  reading:   { icon: '📰', name: '閱讀' },
  cloze:     { icon: '✏️', name: '克漏字' },
  listening: { icon: '🎧', name: '聽力' },
};
const BANK_LABELS = { wrong: '答錯題庫', saved: '收藏題庫' };

// ── 題目銀行（答錯／收藏）localStorage 儲存 ───────────────────────────────
// 結構：voca_qbank_wrong / voca_qbank_saved = { [cat]: [ question物件… ] }
// 每題依分類（vocab/phrase/grammar/reading/cloze/listening）歸檔。
function _qbankRead(kind) {
  try { return JSON.parse(localStorage.getItem('voca_qbank_' + kind)) || {}; }
  catch { return {}; }
}
function _qbankWrite(kind, obj) {
  localStorage.setItem('voca_qbank_' + kind, JSON.stringify(obj));
}
// 穩定題目 ID：優先用題庫 id，否則由題幹+選項雜湊
function _qid(q) {
  if (q._qid) return q._qid;
  if (q.id != null) return 'id' + q.id;
  const s = (q.question || q.sentence || '') + '|' + (q.options || []).join('|');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return 'q' + (h >>> 0).toString(36);
}
function _qbankHas(kind, cat, id) {
  return (_qbankRead(kind)[cat] || []).some(q => _qid(q) === id);
}
function _qbankAdd(kind, cat, q) {
  const o = _qbankRead(kind);
  const arr = o[cat] || (o[cat] = []);
  const id = _qid(q);
  if (arr.some(x => _qid(x) === id)) return false;
  arr.push({ ...q, _qid: id, _cat: cat, _ts: Date.now() });
  _qbankWrite(kind, o);
  return true;
}
function _qbankRemove(kind, cat, id) {
  const o = _qbankRead(kind);
  o[cat] = (o[cat] || []).filter(q => _qid(q) !== id);
  _qbankWrite(kind, o);
}
// 更新分類卡片右上角的數量徽章
function _updateBankCounts(kind) {
  const o = _qbankRead(kind);
  Object.keys(CAT_META).forEach(cat => {
    const el = document.getElementById(kind + 'Count_' + cat);
    if (!el) return;
    const n = (o[cat] || []).length;
    el.textContent = n ? String(n) : '';
    el.style.display = n ? '' : 'none';
  });
}

function openBankCat(tab, cat) {
  document.getElementById(tab + 'Cats').style.display = 'none';
  document.getElementById(tab + 'Back').style.display = '';
  const content = document.getElementById(tab + 'Content');
  content.style.display = '';

  const { icon, name } = CAT_META[cat];
  const list = _qbankRead(tab)[cat] || [];

  if (!list.length) {
    content.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:44px 0;gap:10px;text-align:center">
        <div style="font-size:40px">${icon}</div>
        <div style="font-family:Nunito;font-weight:700;font-size:16px;color:var(--white)">${name}・${BANK_LABELS[tab]}</div>
        <div style="font-size:12px;color:var(--gray);line-height:1.7">${tab === 'wrong' ? '做每日練習答錯的題目會自動收錄到這裡' : '在每日練習點題目右上角的星號即可收藏'}</div>
      </div>`;
    return;
  }

  content.innerHTML =
    `<div class="qbank-head">${icon} ${name}・${BANK_LABELS[tab]}（${list.length}）</div>` +
    list.map(q => _bankCardHtml(tab, cat, q)).join('');
}

function _bankCardHtml(kind, cat, q) {
  const id      = _qid(q);
  const passage = q.passage  ? `<div class="qbank-passage">${wrapWordsHtml(q.passage)}</div>` : '';
  const dialog  = q.dialogue ? `<div class="qbank-passage">${wrapWordsHtml(q.dialogue)}</div>` : '';
  const isSaved = _qbankHas('saved', cat, id);
  const star = `<button class="qbank-star${isSaved ? ' on' : ''}" title="收藏" onclick="bankToggleStar('${kind}','${cat}','${id}',this)">${isSaved ? '★' : '☆'}</button>`;
  const cardTop = `<div class="qbank-card-top">${star}<button class="qbank-del" title="移除" onclick="bankRemoveItem('${kind}','${cat}','${id}')">✕</button></div>`;

  // 題組式（克漏字 / 閱讀）：整篇 + 各題正解與解析
  if (q.blanks || q.questions) {
    const items = _groupItems(q);
    const title = q.title ? `<div class="qbank-q">${wrapWordsHtml(q.title)}</div>` : `<div class="qbank-q">${q.blanks ? '克漏字' : '閱讀題組'}</div>`;
    const itemsHtml = items.map(it => {
      const correctOpt = wrapWordsHtml((it.options[it.answer] || '').replace(/^\s*(?:\([A-D]\)|[A-D][.、．])\s*/u, ''));
      const cZh = (it.optionsZh && it.optionsZh[it.answer]) ? `<span class="qbank-opt-zh">${escHtml(it.optionsZh[it.answer])}</span>` : '';
      const head = q.blanks ? `(${it.n})` : `${wrapWordsHtml(it.heading)}<br>`;
      return `<div class="qbank-opt correct">${head} ${correctOpt} ✓${cZh}</div>` +
             (it.explanation ? `<div class="qbank-explain">${wrapWordsHtml(it.explanation)}</div>` : '');
    }).join('');
    return `<div class="qbank-card" data-id="${id}">${cardTop}${passage}
      ${title}
      <div class="qbank-opts">${itemsHtml}</div>
    </div>`;
  }

  const qtext = q.question || q.sentence || '';
  const opts = (q.options || []).map((o, i) => {
    const clean   = wrapWordsHtml(o.replace(/^\s*(?:\([A-D]\)|[A-D][.、．])\s*/u, ''));
    const correct = i === q.answer;
    const zh = (q.optionsZh && q.optionsZh[i]) ? `<span class="qbank-opt-zh">${escHtml(q.optionsZh[i])}</span>` : '';
    return `<div class="qbank-opt${correct ? ' correct' : ''}">${String.fromCharCode(65 + i)}. ${clean}${correct ? ' ✓' : ''}${zh}</div>`;
  }).join('');
  return `<div class="qbank-card" data-id="${id}">${cardTop}
    ${passage}${dialog}
    <div class="qbank-q">${wrapWordsHtml(qtext)}</div>
    <div class="qbank-opts">${opts}</div>
    ${q.explanation ? `<div class="qbank-explain">${wrapWordsHtml(q.explanation)}</div>` : ''}
  </div>`;
}

// 卡片星號：在「答錯題庫」加入/移除收藏；在「收藏題庫」移除收藏（並消失）
function bankToggleStar(kind, cat, id, btn) {
  if (_qbankHas('saved', cat, id)) {
    _qbankRemove('saved', cat, id);
    _updateBankCounts('saved');
    showToast('已移除收藏');
    if (kind === 'saved') { bankRemoveItem('saved', cat, id); return; }
    btn.classList.remove('on');
    btn.textContent = '☆';
  } else {
    const src = _qbankRead(kind)[cat] || [];
    const q   = src.find(x => _qid(x) === id);
    if (!q) return;
    _qbankAdd('saved', cat, q);
    _updateBankCounts('saved');
    btn.classList.add('on');
    btn.textContent = '★';
    showToast('⭐ 已加入收藏題庫');
  }
}

function bankRemoveItem(kind, cat, id) {
  _qbankRemove(kind, cat, id);
  _updateBankCounts(kind);
  openBankCat(kind, cat);
}

function closeBankCat(tab) {
  _resetBankPanel(tab);
}

async function openDailyArticle(id) {
  try {
    const res  = await fetch(`/api/daily-articles/${id}`);
    const data = await res.json();
    currentDailyArticle = data;
  } catch {
    showToast('⚠ 載入失敗，請稍後再試');
    return;
  }

  const a = currentDailyArticle;
  document.getElementById('artTitle').textContent = a.title;

  document.getElementById('artBody').innerHTML = wrapWordsHtml(a.content);

  document.getElementById('dailyList').classList.remove('show');
  document.getElementById('artContent').classList.add('show');
  document.getElementById('artBackBtn').onclick = () => {
    document.getElementById('artContent').classList.remove('show');
    document.getElementById('dailyList').classList.add('show');
    document.getElementById('dailyCats').style.display = 'none';
    document.getElementById('dailyReadingBack').style.display = '';
    document.getElementById('artList').style.display = '';
    closeWordPopup();
  };
}

// ── 每日練習題目 Badge 標籤 ─────────────────────────────────────────────────
const QUIZ_BADGE_LABELS = {
  // 片語題型
  phrasal_verb: '動詞片語',
  preposition:  '介系詞搭配',
  expression:   '慣用表達',
  // 單字詞性
  noun:      '名詞',
  verb:      '動詞',
  adjective: '形容詞',
  adverb:    '副詞',
  // 詞彙層級
  T1: '基礎',
  T2: '標準',
  T3: '進階',
  // 聽力題型（GSAT 三部分）
  '辨識句意': '辨識句意',
  '基本問答': '基本問答',
  '言談理解': '言談理解',
};

// 每日練習分類設定
const DAILY_CAT_CONFIG = {
  vocab:     { icon: '📖', label: '單字',  apiType: 'vocab' },
  phrase:    { icon: '🔗', label: '片語',  apiType: 'phrase' },
  grammar:   { icon: '📐', label: '文法',  apiType: 'grammar' },
  cloze:     { icon: '✏️', label: '克漏字', apiType: 'cloze' },
  reading:   { icon: '📰', label: '閱讀',  apiType: 'reading' },
  listening: { icon: '🎧', label: '聽力',  apiType: 'listening' },
};

// ── 每日練習進度（剩餘題數徽章）─────────────────────────────────────────────
// 每日題數：閱讀/克漏字 3 題，其餘 5 題（對齊後端 daily_quiz）
const DAILY_QUOTA = { vocab: 5, phrase: 5, grammar: 5, reading: 3, cloze: 3, listening: 5 };

function _dailyDoneKey() {
  return 'voca_daily_done_' + new Date().toISOString().slice(0, 10).replace(/-/g, '');
}
function _dailyDoneRead() {
  try { return JSON.parse(localStorage.getItem(_dailyDoneKey())) || {}; }
  catch { return {}; }
}
// 以「已完成題目 id 集合」計數，避免重作同一題被重複計算
function _dailyMarkDone(cat, qid) {
  const o = _dailyDoneRead();
  const arr = o[cat] || (o[cat] = []);
  const wasComplete = arr.length >= (DAILY_QUOTA[cat] || 5);
  if (!arr.includes(qid)) {
    arr.push(qid);
    localStorage.setItem(_dailyDoneKey(), JSON.stringify(o));
    // 首次完成該科 → 發放金幣
    if (!wasComplete && arr.length >= (DAILY_QUOTA[cat] || 5)) {
      _awardSubjectGold(cat);
    }
  }
}
function dailyRemaining(cat) {
  const done = (_dailyDoneRead()[cat] || []).length;
  return Math.max(0, (DAILY_QUOTA[cat] || 5) - done);
}
// 清掉非今日的舊紀錄，避免 localStorage 累積
function _dailyCleanup() {
  const keep = _dailyDoneKey();
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k && k.startsWith('voca_daily_done_') && k !== keep) localStorage.removeItem(k);
  }
}
// 更新每日練習六分類卡片的剩餘題數徽章
function _updateDailyBadges() {
  _dailyCleanup();
  Object.keys(DAILY_QUOTA).forEach(cat => {
    const el = document.getElementById('dcatCount_' + cat);
    if (!el) return;
    const rem = dailyRemaining(cat);
    el.style.display = '';
    if (rem > 0) {
      el.textContent = `剩 ${rem} 題`;
      el.classList.remove('done');
    } else {
      el.textContent = '✓ 完成';
      el.classList.add('done');
    }
  });
}

async function openDailyCat(cat) {
  dailyCatOpen = cat;
  document.getElementById('dailyCats').style.display = 'none';
  document.getElementById('dailyReadingBack').style.display = '';
  const artList = document.getElementById('artList');

  const cfg = DAILY_CAT_CONFIG[cat];
  if (cfg) {
    // 直接抓題目並開始作答（不顯示載入畫面，避免殘留遮住題目）
    artList.style.display = 'none';
    try {
      const res = await fetch(`/api/daily-quiz/${cfg.apiType}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { questions } = await res.json();
      if (!questions?.length) throw new Error('無題目資料');
      _startDailyQuiz(questions, cat);
    } catch (err) {
      artList.style.display = '';
      artList.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 0;gap:12px">
          <div style="font-size:32px">⚠</div>
          <div style="font-family:Nunito;font-weight:700;font-size:15px;color:var(--orange)">載入失敗</div>
          <div style="font-size:12px;color:var(--gray)">${escHtml(err.message)}</div>
          <button class="quiz-start-btn" onclick="closeDailyCat();openDailyCat('${escHtml(cat)}')" style="margin-top:8px">重試</button>
        </div>`;
    }
    return;
  }
  artList.style.display = '';

  // 其他分類尚未上線
  const labels = { grammar: '文法', cloze: '克漏字', listening: '聽力' };
  const icons  = { grammar: '📐',  cloze: '✏️',    listening: '🎧'  };
  artList.innerHTML = `
    <div class="csub-placeholder" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 0;gap:10px">
      <div class="rp-icon" style="font-size:40px">${icons[cat] || '📝'}</div>
      <div class="rp-title" style="font-family:Nunito;font-weight:700;font-size:16px;color:var(--white)">${escHtml(labels[cat] || cat)} 練習</div>
      <div class="rp-desc" style="font-size:12px;color:var(--gray);text-align:center;line-height:1.7">每日練習題目正在準備中<br>敬請期待！</div>
      <div class="rp-badge" style="font-size:10px;font-family:Nunito;font-weight:700;letter-spacing:1px;color:var(--orange);border:1px solid var(--orange);border-radius:4px;padding:3px 10px">即將上線</div>
    </div>`;
}

// 通用每日練習啟動（vocab / phrase / grammar / cloze / reading 共用）
function _startDailyQuiz(questions, context) {
  const normalized = questions.map(q => ({
    ...q,
    question: q.sentence || q.question,
  }));

  quizState = { questions: normalized, idx: 0, score: 0, context };

  // 隱藏整個每日練習容器與文章列表，避免上方殘留空白與重複的返回按鈕
  document.getElementById('artList').style.display = 'none';
  document.getElementById('dailyList').classList.remove('show');
  document.getElementById('dailyReadingBack').style.display = 'none';

  const panel = document.getElementById('quizPanel');
  panel.classList.remove('hidden');
  panel.classList.add('show');

  document.getElementById('quizBackBtn').textContent       = '◀ 返回每日練習';
  document.getElementById('quizResultBackBtn').textContent = '返回每日練習';

  renderQuestion();

  // 聽力模式：背景預先生成所有題目的 Kokoro 音檔
  if (context === 'listening') {
    _preGenerateListeningAudio(normalized);
  }
}

// 背景依序預生成聽力題目的音檔（不阻塞 UI）
async function _preGenerateListeningAudio(questions) {
  for (const q of questions) {
    if (q.dialogue && !_listenCache[q.dialogue]) {
      try {
        await _generateListeningAudio(q.dialogue);
      } catch {}
      // 讓出 event loop，避免連續請求塞爆後端
      await new Promise(r => setTimeout(r, 200));
    }
  }
}

// ── 聽力音檔系統（Kokoro TTS 預生成 → HTMLAudioElement 播放）─────────────────

const _listenCache = {};    // { dialogueText → audioUrl }
let   _listenAudio = null;  // 當前 Audio 實例
let   _listenPlayId = 0;    // 每次新播放遞增，用來取消舊的 async 播放

async function _generateListeningAudio(dialogue) {
  if (_listenCache[dialogue]) return _listenCache[dialogue];
  const res = await fetch('/api/listening-audio/generate', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ dialogue }),
  });
  if (!res.ok) throw new Error(`generate failed: ${res.status}`);
  const { url } = await res.json();
  _listenCache[dialogue] = url;
  return url;
}

function _playAudioUrl(url) {
  return new Promise(resolve => {
    if (_listenAudio) { _listenAudio.pause(); _listenAudio = null; }
    const a = new Audio(url);
    _listenAudio = a;
    a.onended = resolve;
    a.onerror = resolve;
    a.play().catch(resolve);
  });
}

function _stopListening() {
  _listenPlayId++;  // 讓所有 async _listenStart 的檢查點中止
  if (_listenAudio) { _listenAudio.pause(); _listenAudio = null; }
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

// Web Speech fallback（Kokoro 不可用時）
function _playFallback(dialogue) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const lines = dialogue.split('\n').filter(l => l.trim());
  let i = 0;
  const next = () => {
    if (i >= lines.length) return;
    const m = lines[i++].match(/^([^:]+):\s*(.+)$/);
    if (!m) { next(); return; }
    const utter  = new SpeechSynthesisUtterance(m[2].trim());
    utter.lang   = 'en-US';
    utter.rate   = 0.88;
    utter.onend  = next;
    window.speechSynthesis.speak(utter);
  };
  next();
}

// 主播放：Kokoro 優先，失敗再 fallback
async function _playListening(dialogue) {
  _stopListening();
  try {
    const url = await _generateListeningAudio(dialogue);
    await _playAudioUrl(url);
  } catch (err) {
    console.warn('[listening] Kokoro TTS 失敗，使用瀏覽器 TTS:', err.message);
    _playFallback(dialogue);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 以下保留供 fallback Web Speech 使用
const SPEAKER_PROFILES = {
  // 青少年男（12-17）
  kevin:          { gender: 'male',   age: 'teen'  },
  tom:            { gender: 'male',   age: 'teen'  },
  boy:            { gender: 'male',   age: 'teen'  },
  // 青少年女（12-17）
  lily:           { gender: 'female', age: 'teen'  },
  sarah:          { gender: 'female', age: 'teen'  },
  lisa:           { gender: 'female', age: 'teen'  },
  jessica:        { gender: 'female', age: 'teen'  },
  girl:           { gender: 'female', age: 'teen'  },
  // 青壯年男（25-30）
  ben:            { gender: 'male',   age: 'young' },
  mike:           { gender: 'male',   age: 'young' },
  mark:           { gender: 'male',   age: 'young' },
  james:          { gender: 'male',   age: 'young' },
  david:          { gender: 'male',   age: 'young' },
  man:            { gender: 'male',   age: 'adult' },
  waiter:         { gender: 'male',   age: 'young' },
  // 青壯年女（25-30）
  amy:            { gender: 'female', age: 'young' },
  anna:           { gender: 'female', age: 'young' },
  woman:          { gender: 'female', age: 'adult' },
  // 成人女（35-45）
  teacher:        { gender: 'female', age: 'adult' },
  nurse:          { gender: 'female', age: 'adult' },
  receptionist:   { gender: 'female', age: 'adult' },
  'shop assistant': { gender: 'female', age: 'adult' },
  mom:            { gender: 'female', age: 'adult' },
  mother:         { gender: 'female', age: 'adult' },
  // 成人男（35-45）
  dad:            { gender: 'male',   age: 'adult' },
  father:         { gender: 'male',   age: 'adult' },
  doctor:         { gender: 'male',   age: 'adult' },
};

// pitch × rate 對應六個年齡×性別音軌
// 女聲保持自然音調（接近 1.0），靠選用不同聲音檔區分男女
// 男聲略降音調強化差異，但不超過 ±0.2 避免失真
const VOICE_PARAMS = {
  female_teen:   { pitch: 1.10, rate: 0.90 },
  female_young:  { pitch: 1.05, rate: 0.86 },
  female_adult:  { pitch: 1.00, rate: 0.83 },
  male_teen:     { pitch: 0.95, rate: 0.90 },
  male_young:    { pitch: 0.88, rate: 0.86 },
  male_adult:    { pitch: 0.82, rate: 0.82 },
  neutral_teen:  { pitch: 1.00, rate: 0.88 },
  neutral_adult: { pitch: 0.92, rate: 0.84 },
};


// 聽力題詳解中顯示對話 HTML
function _dialogueHtml(dialogue) {
  if (!dialogue) return '';
  const lines = dialogue.split('\n').map(l => {
    const m = l.match(/^([^:]+):\s*(.*)$/);
    return m
      ? `<div class="ql-line"><span class="ql-speaker">${escHtml(m[1])}</span>: ${escHtml(m[2])}</div>`
      : `<div class="ql-line">${escHtml(l)}</div>`;
  }).join('');
  return `<div class="quiz-dialogue">${lines}</div>`;
}

// 倒數 3 秒後播放音檔（每題均適用）
let _listenCdTimer = null;
function _listenCountdown() {
  const btn = document.getElementById('listenPlayBtn');
  const cd  = document.getElementById('listenCountdown');
  if (!btn || !cd) return;
  btn.disabled = true;
  btn.textContent = '準備中...';
  cd.style.display = '';
  let n = 3;
  cd.textContent = n;
  // 倒數開始就預先產生音檔，3 秒內快取好後播放幾乎無延遲
  const q = quizState.questions?.[quizState.idx];
  if (q?.dialogue) _generateListeningAudio(q.dialogue).catch(() => {});
  _listenCdTimer = setInterval(() => {
    n--;
    if (n > 0) {
      cd.textContent = n;
    } else {
      clearInterval(_listenCdTimer);
      cd.style.display = 'none';
      _listenStart();
    }
  }, 1000);
}

// 播放音檔兩次 + 顯示選項（倒數結束後呼叫，模擬 GSAT 每題唸兩遍）
async function _listenStart() {
  const playId = ++_listenPlayId;  // 取得本次播放的唯一 ID
  const { questions, idx } = quizState;
  const q = questions[idx];

  // 先顯示選項，讓使用者邊聽邊看
  const optsEl = document.getElementById('quizOpts');
  optsEl.classList.remove('revealed');
  optsEl.innerHTML = q.options.map((opt, i) => {
    const clean = opt.replace(/^\s*(?:\([A-D]\)|[A-D][.、．])\s*/u, '');
    return `<button class="quiz-opt" onclick="answerQuestion(${i})">${String.fromCharCode(65 + i)}. ${escHtml(clean)}${_qZhSpan(q.optionsZh, i)}</button>`;
  }).join('');

  // 播放兩遍，每個 await 後都檢查是否已被取消（答題/下一題/關閉）
  try {
    const url = await _generateListeningAudio(q.dialogue);
    if (playId !== _listenPlayId) return;
    if (_listenAudio) { _listenAudio.pause(); _listenAudio = null; }
    await _playAudioUrl(url);
    if (playId !== _listenPlayId) return;  // 第一遍結束後：已答題？直接停
    await new Promise(r => setTimeout(r, 700));
    if (playId !== _listenPlayId) return;  // 停頓中：已切題？直接停
    await _playAudioUrl(url);
  } catch (err) {
    if (playId === _listenPlayId) {
      console.warn('[listening] TTS 失敗，fallback:', err.message);
      _playFallback(q.dialogue);
    }
  }
}

// 題目右上角星號狀態（僅每日練習分類顯示）
function _updateQuizStar(q, context) {
  const starBtn = document.getElementById('quizStarBtn');
  if (!starBtn) return;
  const isCat = !!CAT_META[context];
  starBtn.style.display = isCat ? '' : 'none';
  if (isCat) {
    const saved = _qbankHas('saved', context, _qid(q));
    starBtn.classList.toggle('on', saved);
    starBtn.textContent = saved ? '★' : '☆';
  }
}

// ── 共用 QUIZ FLOW ──────────────────────────────────────────────────────────
// 選項中譯 span（作答/送出後才顯示，由容器 #quizOpts.revealed 控制）
function _qZhSpan(arr, i) {
  return (arr && arr[i]) ? `<span class="q-zh">${escHtml(arr[i])}</span>` : '';
}

function renderQuestion() {
  const { questions, idx, context } = quizState;
  const q = questions[idx];
  document.getElementById('quizOpts').classList.remove('revealed');

  // 題組式：克漏字（整篇空格）/ 閱讀（文章＋1–4題）一次作答
  if (q.blanks || q.questions) { _renderGroupQuestion(q); return; }

  document.getElementById('quizProgress').textContent = `第 ${idx + 1} / ${questions.length} 題`;

  // Badge
  const badge = document.getElementById('quizTypeBadge');
  if (badge) {
    const badgeKey = q.section || q.phrase_type || q.vocab_tier || q.target_grammar || q.pos || '';
    const label    = QUIZ_BADGE_LABELS[badgeKey] || '';
    badge.textContent = label;
    badge.style.display = label ? '' : 'none';
    badge.className = 'quiz-type-badge' + (q.section ? ' badge-listen-section' : '');
  }

  const questionText = q.question || q.sentence || '';

  if (context === 'listening') {
    // 聽力：每題顯示問題文字 + 倒數播放按鈕，選項在倒數後才出現
    document.getElementById('quizQ').innerHTML =
      `<div class="quiz-q-text">${escHtml(questionText)}</div>`;

    document.getElementById('quizOpts').innerHTML = `
      <div class="listen-start-wrap">
        <p class="listen-hint">按下後倒數 3 秒，音檔自動播放，選項同步出現</p>
        <button class="quiz-listen-btn" id="listenPlayBtn" onclick="_listenCountdown()">▶ 播放題目</button>
        <div class="listen-countdown-num" id="listenCountdown" style="display:none">3</div>
      </div>`;
  } else {
    // 非聽力：顯示 passage（閱讀/克漏字）
    let passageHtml = '';
    if (q.passage) {
      passageHtml = `<div class="quiz-passage">${wrapWordsHtml(q.passage)}</div>`;
    }
    document.getElementById('quizQ').innerHTML =
      passageHtml + `<div class="quiz-q-text">${escHtml(questionText)}</div>`;

    document.getElementById('quizOpts').innerHTML = q.options.map((opt, i) => {
      const clean = opt.replace(/^\s*(?:\([A-D]\)|[A-D][.、．])\s*/u, '');
      return `<button class="quiz-opt" onclick="answerQuestion(${i})">${String.fromCharCode(65 + i)}. ${escHtml(clean)}${_qZhSpan(q.optionsZh, i)}</button>`;
    }).join('');
  }

  document.getElementById('quizExplain').classList.add('hidden');
  const nextBtn = document.getElementById('quizNextBtn');
  nextBtn.onclick = nextQuestion;       // 非克漏字一律走 nextQuestion
  nextBtn.classList.add('hidden');

  _updateQuizStar(q, context);
}

// ── 題組式作答（克漏字 / 閱讀）：整篇一次作答、一起批改 ─────────────────────
// 把克漏字的 blanks 與閱讀的 questions 統一成 items 結構
function _groupItems(q) {
  if (q.blanks) {
    return q.blanks.map(bl => ({
      heading: `第 (${bl.n}) 格`, headingClass: 'cloze-blank-label',
      options: bl.options, optionsZh: bl.optionsZh, answer: bl.answer, explanation: bl.explanation, n: bl.n,
    }));
  }
  return (q.questions || []).map((sq, i) => ({
    heading: `${i + 1}. ${sq.question}`, headingClass: 'rq-heading',
    options: sq.options, optionsZh: sq.optionsZh, answer: sq.answer, explanation: sq.explanation, n: i + 1,
  }));
}

function _renderGroupQuestion(q) {
  const { questions, idx, context } = quizState;
  document.getElementById('quizProgress').textContent = `第 ${idx + 1} / ${questions.length} 題`;

  const badge = document.getElementById('quizTypeBadge');
  if (badge) badge.style.display = 'none';

  quizState.grpSel  = {};        // itemIndex → optionIndex
  quizState.grpDone = false;

  const items     = _groupItems(q);
  const titleHtml = q.title   ? `<div class="quiz-q-title">${escHtml(q.title)}</div>` : '';
  const passageHtml = q.passage ? `<div class="quiz-passage">${wrapWordsHtml(q.passage)}</div>` : '';
  const intro = q.blanks ? `<div class="quiz-q-text">請依短文選出每一格最適合的答案</div>` : '';
  document.getElementById('quizQ').innerHTML = titleHtml + passageHtml + intro;

  document.getElementById('quizOpts').innerHTML = items.map((it, bi) => `
    <div class="cloze-group" id="grp_${bi}">
      <div class="${it.headingClass}" id="gh_${bi}">${escHtml(it.heading)}</div>
      <div class="cloze-opts">
        ${it.options.map((o, oi) => {
          const clean = o.replace(/^\s*(?:\([A-D]\)|[A-D][.、．])\s*/u, '');
          return `<button class="quiz-opt cloze-opt" id="g_${bi}_${oi}" onclick="groupSelect(${bi},${oi})">${String.fromCharCode(65 + oi)}. ${escHtml(clean)}${_qZhSpan(it.optionsZh, oi)}</button>`;
        }).join('')}
      </div>
    </div>`).join('');

  document.getElementById('quizExplain').classList.add('hidden');
  const nextBtn = document.getElementById('quizNextBtn');
  nextBtn.textContent = '送出答案';
  nextBtn.onclick = submitGroup;
  nextBtn.classList.remove('hidden');

  _updateQuizStar(q, context);
}

function groupSelect(bi, oi) {
  if (quizState.grpDone) return;
  quizState.grpSel[bi] = oi;
  const items = _groupItems(quizState.questions[quizState.idx]);
  items[bi].options.forEach((_, k) => {
    const el = document.getElementById(`g_${bi}_${k}`);
    if (el) el.classList.toggle('sel', k === oi);
  });
}

function submitGroup() {
  const { questions, idx, context } = quizState;
  const q = questions[idx];
  if (quizState.grpDone) return;
  quizState.grpDone = true;

  const items = _groupItems(q);
  let correct = 0;
  items.forEach((it, bi) => {
    const chosen = quizState.grpSel[bi];
    const ans    = it.answer;
    // 送出後：選項文字從純文字升級為可點字查詢（跟詳解一致）
    it.options.forEach((o, k) => {
      const el = document.getElementById(`g_${bi}_${k}`);
      if (!el) return;
      el.disabled = true;
      el.classList.remove('sel');
      const clean = o.replace(/^\s*(?:\([A-D]\)|[A-D][.、．])\s*/u, '');
      el.innerHTML = `${String.fromCharCode(65 + k)}. ${wrapWordsHtml(clean)}${_qZhSpan(it.optionsZh, k)}`;
      if (k === ans) el.classList.add('correct');
      else if (k === chosen) el.classList.add('wrong');
    });
    if (chosen === ans) correct++;
    const headEl = document.getElementById(`gh_${bi}`);
    if (headEl && !q.blanks) headEl.innerHTML = wrapWordsHtml(it.heading); // 克漏字格號標籤是純中文，不需升級
    const grp = document.getElementById(`grp_${bi}`);
    if (grp && it.explanation) {
      const ex = document.createElement('div');
      ex.className = 'cloze-explain';
      ex.innerHTML = `(${it.n}) ` + wrapWordsHtml(it.explanation);
      grp.appendChild(ex);
    }
  });

  document.getElementById('quizOpts').classList.add('revealed');  // 送出後顯示選項中譯

  const total    = items.length;
  const allRight = correct === total;
  const unit     = q.blanks ? '格' : '題';
  showFb(`答對 ${correct}/${total} ${unit}`, allRight);
  if (allRight) quizState.score++;

  // 未全對 → 整篇/整組歸檔到答錯題庫
  if (CAT_META[context] && !allRight) {
    _qbankAdd('wrong', context, q);
    _updateBankCounts('wrong');
  }
  // 記錄今日已完成（整篇/整組算一題）
  if (CAT_META[context]) {
    _dailyMarkDone(context, _qid(q));
    _updateDailyBadges();
    _trackSubjectStats(context, correct, total);
  }

  const nextBtn = document.getElementById('quizNextBtn');
  nextBtn.textContent = idx >= questions.length - 1 ? '查看成績 →' : '下一題 →';
  nextBtn.onclick = nextQuestion;
}

// 題目星號：加入/移除「收藏題庫」對應分類
function quizToggleStar() {
  const { questions, idx, context } = quizState;
  if (!CAT_META[context]) return;
  const q   = questions[idx];
  const id  = _qid(q);
  const btn = document.getElementById('quizStarBtn');
  if (_qbankHas('saved', context, id)) {
    _qbankRemove('saved', context, id);
    btn.classList.remove('on');
    btn.textContent = '☆';
    showToast('已移除收藏');
  } else {
    _qbankAdd('saved', context, q);
    btn.classList.add('on');
    btn.textContent = '★';
    showToast('⭐ 已加入收藏題庫');
  }
  _updateBankCounts('saved');
}

function answerQuestion(chosen) {
  const { questions, idx, context } = quizState;
  const q    = questions[idx];
  const btns = document.querySelectorAll('.quiz-opt');

  _stopListening(); // 答題後停止播放

  // 答題揭曉：題幹句子（單字/片語/文法題的 "The meeting was _____ ..." 這類句子）也要升級為可點字查詢
  const qTextEl = document.querySelector('#quizQ .quiz-q-text');
  if (qTextEl) qTextEl.innerHTML = wrapWordsHtml(q.question || q.sentence || '');

  // 答題揭曉：選項文字從純文字升級為可點字查詢（跟詳解一致），並標記正解/錯選樣式
  btns.forEach((b, i) => {
    b.disabled = true;
    const clean = q.options[i].replace(/^\s*(?:\([A-D]\)|[A-D][.、．])\s*/u, '');
    b.innerHTML = `${String.fromCharCode(65 + i)}. ${wrapWordsHtml(clean)}${_qZhSpan(q.optionsZh, i)}`;
  });
  btns[chosen].classList.add(chosen === q.answer ? 'correct' : 'wrong');
  btns[q.answer].classList.add('correct');

  if (chosen === q.answer) {
    quizState.score++;
    showFb('正確！', true);
    navigator.vibrate && navigator.vibrate(30);
  } else {
    showFb('答錯了', false);
    // 答錯自動歸檔到「答錯題庫」對應分類
    if (CAT_META[context]) {
      _qbankAdd('wrong', context, q);
      _updateBankCounts('wrong');
    }
  }

  // 記錄今日已完成題目（不論對錯），用於剩餘題數徽章
  if (CAT_META[context]) {
    _dailyMarkDone(context, _qid(q));
    _updateDailyBadges();
    _trackSubjectStats(context, chosen === q.answer ? 1 : 0, 1);
  }

  const explainEl = document.getElementById('quizExplain');
  // 聽力：詳解前先顯示對話內容
  if (context === 'listening' && q.dialogue) {
    explainEl.innerHTML =
      _dialogueHtml(q.dialogue) +
      `<div>${wrapWordsHtml(q.explanation)}</div>`;
  } else {
    explainEl.innerHTML = wrapWordsHtml(q.explanation);
  }
  explainEl.classList.remove('hidden');
  document.getElementById('quizOpts').classList.add('revealed');  // 作答後顯示選項中譯

  const nextBtn = document.getElementById('quizNextBtn');
  nextBtn.textContent = idx >= questions.length - 1 ? '查看成績 →' : '下一題 →';
  nextBtn.classList.remove('hidden');
}

function nextQuestion() {
  _stopListening();  // 確保前一題音檔（含第二遍）完全停止
  const { questions, idx } = quizState;
  if (idx >= questions.length - 1) {
    showQuizResult();
  } else {
    quizState.idx++;
    renderQuestion();
  }
}

function showQuizResult() {
  _stopListening();
  const { score, questions } = quizState;
  const total = questions.length;
  const pct   = score / total;

  document.getElementById('quizPanel').classList.remove('show');
  const result = document.getElementById('quizResult');
  result.classList.remove('hidden');
  result.classList.add('show');

  document.getElementById('qrIcon').textContent  = pct === 1 ? '🏆' : pct >= 0.6 ? '⚔️' : '📖';
  document.getElementById('qrScore').textContent = `${score} / ${total}`;
  document.getElementById('qrMsg').textContent   =
    pct === 1   ? '全對！表現太棒了！' :
    pct >= 0.6  ? '不錯！繼續加油！' : '多練習，一定會進步！';

  STATS.int++;
  saveStats();
  updateChar();
}

function _restoreFromQuiz() {
  // 重置每日練習到分類 grid
  document.getElementById('dailyCats').style.display = '';
  document.getElementById('dailyReadingBack').style.display = 'none';
  document.getElementById('artList').style.display = 'none';
  document.getElementById('dailyList').classList.add('show');
  _updateDailyBadges();
}

function closeQuiz() {
  _stopListening();
  document.getElementById('quizPanel').classList.remove('show');
  document.getElementById('quizPanel').classList.add('hidden');
  _restoreFromQuiz();
}

function closeQuizResult() {
  const result = document.getElementById('quizResult');
  result.classList.remove('show');
  result.classList.add('hidden');
  _restoreFromQuiz();
  currentDailyArticle = null;
}

// ── READING ──
function renderArticles() {
  document.getElementById('artContent').classList.remove('show');
  const list = document.getElementById('artList');
  list.innerHTML = ARTICLES.map(a => `
    <div class="art-card" onclick="${a.locked ? `openModal('upgradeModal')` : `openArticle(${a.id})`}">
      <div class="art-img${a.locked ? ' locked' : ''}" style="background:linear-gradient(135deg,rgba(26,92,56,.3),rgba(20,20,30,.8))">${a.emoji}</div>
      <div class="art-body">
        <div class="art-tag">${a.tag}</div>
        <div class="art-name">${a.title}</div>
      </div>
    </div>`).join('');
}

function openArticle(id) {
  const a = ARTICLES.find(x => x.id === id);
  document.getElementById('artTitle').textContent = a.title;
  document.getElementById('artBody').innerHTML = wrapWordsHtml(a.text);
  document.getElementById('artList').style.display = 'none';
  document.getElementById('artContent').classList.add('show');
}

function closeArticle() {
  document.getElementById('artContent').classList.remove('show');
  switchCuratedSub(curatedSubTab);
  closeWordPopup();
}

// 簡易字尾還原：把動詞變化/複數/比較級猜回可能的原形，用於在本地 WORDS 裡找到既有條目，
// 避免「accepted」「activities」這種變化形明明字庫裡已有原形「accept」「activity」卻還要另外呼叫 Gemini 生成一次。
function _lemmaCandidates(w) {
  const c = [];
  if (w.endsWith('ies') && w.length > 4) c.push(w.slice(0, -3) + 'y');
  if (w.endsWith('ied') && w.length > 4) c.push(w.slice(0, -3) + 'y');
  if (w.endsWith('ier') && w.length > 4) c.push(w.slice(0, -3) + 'y');
  if (w.endsWith('iest') && w.length > 5) c.push(w.slice(0, -4) + 'y');
  if (w.endsWith('ing') && w.length > 5) { c.push(w.slice(0, -3)); c.push(w.slice(0, -3) + 'e'); c.push(w.slice(0, -4)); }
  if (w.endsWith('ed') && w.length > 4) { c.push(w.slice(0, -2)); c.push(w.slice(0, -1)); c.push(w.slice(0, -3)); }
  if (w.endsWith('es') && w.length > 4) { c.push(w.slice(0, -2)); c.push(w.slice(0, -1)); }
  if (w.endsWith('s') && w.length > 3 && !w.endsWith('ss')) c.push(w.slice(0, -1));
  if (w.endsWith('er') && w.length > 4) c.push(w.slice(0, -2));
  if (w.endsWith('est') && w.length > 5) c.push(w.slice(0, -3));
  if (w.endsWith('ly') && w.length > 4) c.push(w.slice(0, -2));
  return c;
}

async function lookupWord(word, el) {
  // 優先用 WORDS 陣列開啟詳細 overlay（含字尾還原比對）
  let w = WORDS.find(x => x.word === word);
  if (!w) {
    for (const cand of _lemmaCandidates(word)) {
      w = WORDS.find(x => x.word === cand);
      if (w) break;
    }
  }
  if (w) { openWordDetail(w.id); return; }

  // 字庫沒有（例如題目/選項/詳解裡出現的變化形）→ 呼叫共用查詢快取
  // /api/words/search（未命中才用 Gemini 生成字典資料並寫回 words 表，實測約 3~5 秒）。
  // 先立刻開出 overlay 顯示查詢中狀態，避免使用者盯著沒反應的畫面空等。
  if (el) el.classList.add('w-loading');
  _openWordDetailLoading(word);
  try {
    const res  = await fetch(`/api/words/search?query=${encodeURIComponent(word)}`);
    const data = await res.json();
    if (el) el.classList.remove('w-loading');
    if (!data.success) { closeWordDetail(); showToast(`⚠ ${data.error || `找不到「${word}」`}`); return; }
    w = normalizeWord(data.data);
    WORDS.push(w);
    DICT[w.word] = { def: w.def, phonetic: w.phonetic };
    openWordDetail(w.id);
  } catch (err) {
    if (el) el.classList.remove('w-loading');
    closeWordDetail();
    showToast('⚠ 網路錯誤，請重試');
  }
}

// 查詢期間（約 3~5 秒，字典資料由 Gemini 即時生成）先開出 overlay 顯示載入狀態，
// 讓使用者知道系統在動作，而不是點了字卻毫無反應。
function _openWordDetailLoading(word) {
  const overlay = document.getElementById('wordDetailOverlay');
  if (!overlay) return;
  document.getElementById('wdWord').textContent = word;
  document.getElementById('wdPhon').textContent = '查詢中…';
  document.getElementById('wdPos').textContent  = '';
  document.getElementById('wdDot').className    = 'wr-dot wdot-lg';
  const defLbl = document.getElementById('wdDefLbl');
  if (defLbl) defLbl.style.display = '';
  const defEl = document.getElementById('wdDef');
  defEl.style.display = '';
  defEl.textContent   = '⏳ 查詢字典資料中…';
  const zhDefEl = document.getElementById('wdDefZh');
  if (zhDefEl) zhDefEl.textContent = '';
  const exWrap = document.getElementById('wdExWrap');
  if (exWrap) exWrap.style.display = 'none';
  const markBtn = document.getElementById('wdMarkBtn');
  if (markBtn) {
    markBtn.textContent = '查詢中…';
    markBtn.className   = 'wda-btn wda-mark';
    markBtn.disabled     = true;
  }
  overlay.classList.add('show');
}

function closeWordPopup() {
  const el = document.getElementById('wordPopup');
  if (el) el.classList.remove('show');
}

function captureWord() {
  const w = document.getElementById('wordPopup')._word;
  if (!w) return;
  closeWordPopup();

  if (customDecks.length === 0) {
    // 無自建卡 → 直接加入不熟字卡
    addToCaptured(w);
  } else {
    // 有自建卡 → 顯示選擇器
    _pendingCaptureWord = w;
    renderDeckPicker(w);
    openModal('deckPickModal');
  }
}

function addToCaptured(w) {
  if (!capturedWords.includes(w)) {
    capturedWords.push(w);
    showToast(`✓ "${w}" 已加入不熟字卡！`);
  } else {
    showToast('已在不熟字卡中');
  }
}

function renderDeckPicker(word) {
  const list = document.getElementById('dpickList');
  // 不熟字卡 option
  const weakItem = `
    <div class="dpick-row" onclick="captureToBuiltin();closeModal('deckPickModal')">
      <span class="dpick-emo">🔥</span>
      <span class="dpick-name">不熟字卡</span>
      <span class="dpick-cnt">${capturedWords.length + WORDS.filter(w=>w.st==='lrn').length} 字</span>
    </div>`;
  const customItems = customDecks.map(d => {
    const cnt = d.wordIds.length;
    return `
      <div class="dpick-row" onclick="captureToCustom('${d.id}');closeModal('deckPickModal')">
        <span class="dpick-emo">${d.emoji}</span>
        <span class="dpick-name">${d.name}</span>
        <span class="dpick-cnt">${cnt} 字</span>
      </div>`;
  }).join('');
  list.innerHTML = weakItem + customItems;
}

function captureToBuiltin() {
  addToCaptured(_pendingCaptureWord);
  _pendingCaptureWord = '';
}

function captureToCustom(deckId) {
  const deck = customDecks.find(d => d.id === deckId);
  if (!deck) return;
  const wordObj = WORDS.find(w => w.word === _pendingCaptureWord);
  if (wordObj && !deck.wordIds.includes(wordObj.id)) {
    deck.wordIds.push(wordObj.id);
    saveCustomDecks();
    showToast(`✓ "${_pendingCaptureWord}" 已加入「${deck.name}」`);
  } else {
    showToast('已在此單字卡中');
  }
  _pendingCaptureWord = '';
}

// ── DECK MANAGEMENT ─────────────────────────────────────────────

async function loadCustomDecks() {
  if (typeof currentUser !== 'undefined' && currentUser && typeof authClient !== 'undefined') {
    const { data, error } = await authClient
      .from('custom_decks')
      .select('id, name, emoji, word_ids')
      .eq('user_id', currentUser.id)
      .order('created_at');
    if (!error && data) {
      customDecks = data.map(r => ({ id: r.id, name: r.name, emoji: r.emoji, wordIds: r.word_ids || [] }));
      return;
    }
  }
  try { customDecks = JSON.parse(localStorage.getItem('voca_custom_decks') || '[]'); }
  catch { customDecks = []; }
}

async function saveCustomDecks() {
  if (typeof currentUser !== 'undefined' && currentUser && typeof authClient !== 'undefined') {
    // Full replace：先刪除全部，再重新 insert（最多 20 個 deck，開銷極小）
    await authClient.from('custom_decks').delete().eq('user_id', currentUser.id);
    if (customDecks.length > 0) {
      await authClient.from('custom_decks').insert(
        customDecks.map(d => ({
          id: d.id,
          user_id: currentUser.id,
          name: d.name,
          emoji: d.emoji,
          word_ids: d.wordIds || [],
          updated_at: new Date().toISOString(),
        }))
      );
    }
    return;
  }
  localStorage.setItem('voca_custom_decks', JSON.stringify(customDecks));
}

function renderDecks() {
  const el = document.getElementById('deckList');
  if (!el) return;

  const builtinHtml = BUILTIN_DECKS.map(deck => {
    const words   = deck.getWords();
    const total   = words.length;
    const mastered= words.filter(w => w.st === 'ok').length;
    const pct     = total > 0 ? Math.round(mastered / total * 100) : 0;
    const canStart= total > 0;

    let chips = `<span class="deck-chip">${total} 字</span>`;
    if (deck.id === 'cap2000') {
      chips += `<span class="deck-chip green">已掌握 ${mastered}</span>`;
    } else {
      chips += total > 0
        ? `<span class="deck-chip orange">待複習</span>`
        : `<span class="deck-chip">答錯後自動加入</span>`;
    }

    const pbarHtml = deck.id === 'cap2000' ? `
      <div class="deck-pbar"><div class="deck-pbar-fill" style="width:${pct}%"></div></div>` : '';

    return `
    <div class="deck-card ${deck.cls}" onclick="${canStart ? `startDeckStudy('${deck.id}')` : ''}">
      <div class="deck-card-top">
        <div class="deck-emoji">${deck.emoji}</div>
        <div class="deck-info">
          <div class="deck-name">${deck.name}</div>
          <div class="deck-meta-row">${chips}</div>
        </div>
      </div>
      ${pbarHtml}
      <div class="deck-foot">
        <button class="deck-go-btn ${canStart ? '' : 'dim'}"
          onclick="${canStart ? `event.stopPropagation();startDeckStudy('${deck.id}')` : 'event.stopPropagation()'}">
          ${canStart ? '開始練習 ▶' : '尚無單字'}
        </button>
      </div>
    </div>`;
  }).join('');

  const customHtml = customDecks.map(deck => {
      const deckWords = WORDS.filter(w => deck.wordIds.includes(w.id));
      const total     = deckWords.length;
      const canStart  = true;
      const isFull    = total >= 2500;  // 檢查是否已滿

      const statusChip = total >= 2500
        ? `<span class="deck-chip red">已滿 ${total}/2500</span>`
        : total > 0
          ? `<span class="deck-chip">${total}/2500 字</span>`
          : `<span class="deck-chip">尚未加入單字</span>`;

      return `
      <div class="deck-card" onclick="${canStart ? `startDeckStudy('${deck.id}')` : ''}">
        <div class="deck-card-top">
          <div class="deck-emoji">${deck.emoji}</div>
          <div class="deck-info">
            <div class="deck-name">${deck.name}</div>
            <div class="deck-meta-row">
              ${statusChip}
            </div>
          </div>
        </div>
        <div class="deck-foot">
          <button class="deck-del-btn" onclick="event.stopPropagation();deleteDeck('${deck.id}')">🗑</button>
          <button class="deck-go-btn ${canStart ? '' : 'dim'}"
            onclick="${canStart ? `event.stopPropagation();startDeckStudy('${deck.id}')` : 'event.stopPropagation()'}">
            開始練習 ▶
          </button>
        </div>
      </div>`;
    }).join('');

  // 顯示卡組數量限制提示
  const deckCountHint = customDecks.length >= 20
    ? `<div class="deck-hint">⚠️ 已達最大卡組數量 (20/20)</div>`
    : customDecks.length === 0
      ? `<div class="deck-hint">點選文章中的單字 →「＋ 加入單字卡」<br>即可捕捉到自建卡片中</div>`
      : '';

  const hintHtml = deckCountHint;

  el.innerHTML = builtinHtml + customHtml + hintHtml;
}

function openNewDeckModal() {
  selectedDeckEmoji = DECK_EMOJIS[0];
  document.getElementById('newDeckNameInput').value = '';
  document.getElementById('ndmEmojiRow').innerHTML = DECK_EMOJIS.map((e, i) =>
    `<button class="ndm-emo ${i === 0 ? 'sel' : ''}" onclick="selectDeckEmoji('${e}',this)">${e}</button>`
  ).join('');
  openModal('newDeckModal');
  setTimeout(() => document.getElementById('newDeckNameInput').focus(), 300);
}

function selectDeckEmoji(emoji, btn) {
  selectedDeckEmoji = emoji;
  document.querySelectorAll('.ndm-emo').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
}

function confirmNewDeck() {
  const name = document.getElementById('newDeckNameInput').value.trim();
  if (!name) { showToast('請輸入單字卡名稱'); return; }
  if (customDecks.some(d => d.name === name)) { showToast('已有相同名稱的單字卡'); return; }

  // ===== 卡組數量限制：最多 20 個 =====
  if (customDecks.length >= 20) {
    showToast('❌ 最多只能創建 20 個單字卡組');
    return;
  }

  const deckId = 'custom_' + Date.now();
  const deck = { id: deckId, name, emoji: selectedDeckEmoji, wordIds: [], words: [] };

  customDecks.push(deck);
  saveCustomDecks();
  console.log('[confirmNewDeck] ✓ 已創建新卡組:', deckId);

  invalidateLibCache();
  if (readTab === 'grammar') renderLib();
  renderDecks();

  closeModal('newDeckModal');
  setTimeout(() => startFlashcard(deck.id), 300);
}

function deleteDeck(id) {
  const deck = customDecks.find(d => d.id === id);
  if (!deck) return;
  customDecks = customDecks.filter(d => d.id !== id);
  saveCustomDecks();
  invalidateLibCache();
  if (readTab === 'grammar') renderLib();
  renderDecks();
  showToast(`已刪除「${deck.name}」`);
}

function startDeckStudy(deckId) {
  // 改為使用新的 flashcard 介面
  startFlashcard(deckId);
}

function studyGoBack() {
  goScreen('reading');
  document.querySelectorAll('.bn').forEach(b => b.classList.remove('active'));
  const readingBns = document.querySelectorAll('#reading .bnav .bn');
  if (readingBns[3]) readingBns[3].classList.add('active');
}

// ── LIBRARY ──
function buildSectionWords(words, deckId) {
  if (!words.length) {
    return `<div class="lib-empty">${deckId === 'weak' ? '目前沒有不熟的單字 👏' : '此卡組尚無單字'}</div>`;
  }
  return words.map((w, i) => {
    const isQuickMode = !!(w.definition_zh || w.example_en || (w.tags && w.tags.includes('cap_2000')) || (w.source === 'cambridge'));
    const defDisplay = isQuickMode ? (w.definition_zh || w.def || '—') : (w.def || '—');
    return `
    <div class="wrow" onclick="event.stopPropagation();openWordDetail(${w.id})">
      <div class="wr-num">${String(i+1).padStart(2,'0')}</div>
      <div class="wr-dot wd-${w.st||'new'}"></div>
      <div class="wr-en">${w.word}</div>
      <div class="wr-zh">${defDisplay}</div>
      <div class="wr-spk" onclick="event.stopPropagation();speak('${w.word}')">🔊</div>
    </div>`;
  }).join('');
}

// 搜尋單字是否曾收錄在任何卡組（內建2個 + 使用者自訂卡組）裡；
// 有找到 → 顯示簡要資料+收錄卡組，點擊可開完整單字詳情彈窗；沒找到 → 顯示提示文字
function searchWordAcrossDecks(query) {
  const resultEl = document.getElementById('libSearchResult');
  if (!resultEl) return;
  const q = query.trim().toLowerCase();
  if (!q) { resultEl.innerHTML = ''; return; }

  const sections = [
    ...BUILTIN_DECKS,
    ...customDecks.map(d => ({
      id: d.id, name: d.name, emoji: d.emoji,
      getWords: () => {
        const wordsMap = new Map();
        if (d.words) d.words.forEach(w => wordsMap.set(w.id, w));
        return d.wordIds.map(id => wordsMap.get(id) || WORDS.find(w => w.id === id)).filter(Boolean);
      }
    }))
  ];

  let hitWord = null;
  const hitDeckNames = [];
  sections.forEach(sec => {
    const found = sec.getWords().find(w => w && w.word && w.word.toLowerCase() === q);
    if (found) {
      hitWord = hitWord || found;
      hitDeckNames.push(`${sec.emoji} ${sec.name}`);
    }
  });

  if (!hitWord) {
    resultEl.innerHTML = `<div class="lib-search-miss">「${escHtml(query.trim())}」目前不在任何一個單字卡組裡</div>`;
    return;
  }

  const posTag = hitWord.pos ? `<span style="font-size:11px;color:var(--ink3);font-weight:600;margin-left:6px">${escHtml(hitWord.pos)}</span>` : '';
  resultEl.innerHTML = `
    <div class="lib-search-hit" onclick="openWordDetail(${hitWord.id})">
      <div style="flex:1">
        <div class="lib-search-hit-word">${escHtml(hitWord.word)}${posTag}</div>
        <div class="lib-search-hit-def">${escHtml(hitWord.definition_zh || hitWord.def || '')}</div>
        <div class="lib-search-hit-decks">曾收錄於：${hitDeckNames.map(n => escHtml(n)).join('、')}</div>
      </div>
    </div>`;
}

function renderLib() {
  const body = document.getElementById('libList');
  if (!body) return;

  const sections = [
    ...BUILTIN_DECKS,
    ...customDecks.map(d => ({
      id: d.id, name: d.name, emoji: d.emoji,
      getWords: () => {
        const wordsMap = new Map();
        if (d.words) d.words.forEach(w => wordsMap.set(w.id, w));
        return d.wordIds.map(id => wordsMap.get(id) || WORDS.find(w => w.id === id)).filter(Boolean);
      }
    }))
  ];

  body.innerHTML = sections.map(sec => {
    const words = sec.getWords();
    const cnt   = words.length;
    const isOpen = libOpenSections.has(sec.id);
    return `
      <div class="lib-section${isOpen ? ' open' : ''}" data-deck-id="${sec.id}">
        <div class="lib-sec-hd" onclick="libToggleSection('${sec.id}')">
          <span class="lib-sec-ico">${sec.emoji}</span>
          <span class="lib-sec-name">${sec.name}</span>
          <span class="lib-sec-cnt">${cnt} 字</span>
          <span class="lib-sec-arr">▼</span>
        </div>
        <div class="lib-sec-body">${isOpen ? buildSectionWords(words, sec.id) : ''}</div>
      </div>`;
  }).join('');
}

function libToggleSection(deckId) {
  if (libOpenSections.has(deckId)) {
    libOpenSections.delete(deckId);
  } else {
    libOpenSections.add(deckId);
  }
  renderLib();
}

function invalidateLibCache() {
  document.querySelectorAll('.lib-sec-body[data-loaded]')
    .forEach(el => delete el.dataset.loaded);
}

// 全域唯一 AbortController，確保同時只有一個 fetch 請求在進行
let _speakController = null;
let _speakAudio = null;

function speak(w) {
  if (!w) return;

  // 取消上一個 fetch 請求 + 所有音頻
  if (_speakController) { _speakController.abort(); _speakController = null; }
  if (_speakAudio) { _speakAudio.pause(); _speakAudio.src = ''; _speakAudio = null; }
  if ('speechSynthesis' in window) speechSynthesis.cancel();

  const filename = w.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_'-]/g, '');
  const ctrl = new AbortController();
  _speakController = ctrl;

  function tryPlay(url) {
    return fetch(url, { signal: ctrl.signal })
      .then(res => { if (!res.ok) throw new Error('not_found'); return res.blob(); })
      .then(blob => {
        if (ctrl.signal.aborted) return true;
        const objUrl = URL.createObjectURL(blob);
        const audio  = new Audio(objUrl);
        _speakAudio  = audio;
        audio.onended = () => URL.revokeObjectURL(objUrl);
        audio.play().catch(() => {});
        return true;
      });
  }

  // 層 1：靜態預生成 MP3（am_michael）v2 = 全部統一 Kokoro TTS，強制失效舊快取
  // 層 2：/api/tts/ → tts_server.py（同 am_michael 聲音，Kokoro 常駐）
  // 層 3：Web Speech API（最終備援，tts_server 未啟動時）
  tryPlay(`/public/audio/words/${filename}.mp3?v=2`)
    .catch(err => {
      if (ctrl.signal.aborted) return false;
      return tryPlay(`/api/tts/${encodeURIComponent(w)}`).then(() => true).catch(() => false);
    })
    .then(played => {
      if (ctrl.signal.aborted || played) return;
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(w);
        u.lang = 'en-US'; u.rate = 0.95;
        speechSynthesis.speak(u);
      }
    });
}

// ── WORD DETAIL POPUP ────────────────────────────────────────────

let _wdWordId = null;

// 跨來源找字：主字庫找不到時，從自訂卡組本地快取找（快速查詢/手動輸入的字不在主字庫）
function _findWordById(wordId) {
  const inLib = WORDS.find(x => x.id === wordId);
  if (inLib) return inLib;
  for (const deck of customDecks) {
    const hit = (deck.words || []).find(x => x.id === wordId);
    if (hit) return hit;
  }
  return null;
}

function openWordDetail(wordId) {
  const w = _findWordById(wordId);
  if (!w) return;
  _wdWordId = wordId;

  // 判斷是否為快速模式：有完整信息（example_en 或 definition_zh）、或標籤含 cap_2000、或來自 Cambridge
  const isQuickMode = !!(w.definition_zh || w.example_en || (w.tags && w.tags.includes('cap_2000')) || (w.source === 'cambridge'));
  const isManualMode = w.source === 'user_input' || w.manual_note;

  // 詞性顏色
  // 深色系配色：淺色底（奶油卡片）上需足夠對比
  const posColors = {
    '名詞':'#3A6FD8','動詞':'#2F8A4C','形容詞':'#D9750E','副詞':'#8E4EC6',
    '連接詞':'#B08508','介系詞':'#2E86AB','代名詞':'#C94848',
    '助動詞':'#2E8B7A','感嘆詞':'#D9640E','限定詞':'#6A5ACD','數詞':'#8A7768',
    '片語':'#C05A2E','名詞片語':'#4A6FD1','動詞片語':'#2E9E63',
  };
  const posColor = posColors[w.pos] || 'var(--gray)';

  document.getElementById('wdWord').textContent    = w.word;

  // 音標：只在快速模式顯示，用 / 括起來（清理多餘的 // 符號）
  if (isQuickMode && w.phonetic) {
    let displayPhonetic = w.phonetic;
    // 移除多餘的 / 符號（//phonetic// → /phonetic/）
    displayPhonetic = displayPhonetic.replace(/^\/+/, '/').replace(/\/+$/, '/');
    if (!displayPhonetic.startsWith('/')) displayPhonetic = `/${displayPhonetic}`;
    if (!displayPhonetic.endsWith('/')) displayPhonetic = `${displayPhonetic}/`;
    document.getElementById('wdPhon').textContent = displayPhonetic;
  } else {
    document.getElementById('wdPhon').textContent = '—';
  }

  document.getElementById('wdPos').textContent     = w.pos        || '—';
  document.getElementById('wdPos').style.background= `${posColor}22`;
  document.getElementById('wdPos').style.color     = posColor;

  // 定義顯示：手動輸入的字只顯示使用者輸入的內容
  const defLbl  = document.getElementById('wdDefLbl');
  const defEl   = document.getElementById('wdDef');
  const zhDefEl = document.getElementById('wdDefZh');
  if (isManualMode) {
    // 手動模式：中文解釋存於 definition 欄位，英文定義區整段隱藏
    if (defLbl) defLbl.style.display = 'none';
    defEl.style.display = 'none';
    if (zhDefEl) zhDefEl.textContent = w.definition || w.def || '—';
  } else {
    if (defLbl) defLbl.style.display = '';
    defEl.style.display = '';
    let defText = (w.definition || w.def || '—').trim();
    if (defText.endsWith(':')) defText = defText.slice(0, -1).trim();
    defEl.textContent = defText;
    if (zhDefEl) zhDefEl.textContent = w.definition_zh || '—';
  }

  // 例句區：手動模式顯示備註；快速模式顯示中英例句
  const exWrap  = document.getElementById('wdExWrap');
  const exLbl   = document.getElementById('wdExLbl');
  const exEnEl  = document.getElementById('wdExEn');
  const exZhEl  = document.getElementById('wdExZh');
  if (isManualMode) {
    if (w.manual_note) {
      exWrap.style.display = 'block';
      if (exLbl) exLbl.textContent = '備註';
      exEnEl.textContent = w.manual_note;
      exZhEl.textContent = '';
      exZhEl.style.display = 'none';
    } else {
      exWrap.style.display = 'none';
    }
  } else {
    if (exLbl) exLbl.textContent = '例句';
    const exEn = w.example_en || '';
    const exZh = (w.example_zh && w.example_zh.trim() !== exEn.trim()) ? w.example_zh : '';
    if (exEn || exZh) {
      exWrap.style.display = 'block';
      exEnEl.textContent = exEn;
      if (exZh) {
        exZhEl.textContent = exZh;
        exZhEl.style.display = 'block';
      } else {
        exZhEl.textContent = '';
        exZhEl.style.display = 'none';
      }
    } else {
      exWrap.style.display = 'none';
    }
  }

  // 狀態點
  document.getElementById('wdDot').className = `wr-dot wd-${w.st || 'new'} wdot-lg`;

  // 標記按鈕
  _updateWdMarkBtn(w);

  document.getElementById('wordDetailOverlay').classList.add('show');
}

function closeWordDetail(e) {
  if (e && e.currentTarget !== e.target) return;
  document.getElementById('wordDetailOverlay').classList.remove('show');
}

function _updateWdMarkBtn(w) {
  const btn = document.getElementById('wdMarkBtn');
  btn.disabled = false;
  if (w.st === 'ok') {
    btn.textContent = '🏆 已掌握';
    btn.className   = 'wda-btn wda-ok';
  } else if (w.st === 'lrn') {
    btn.textContent = '✓ 在不熟字卡中';
    btn.className   = 'wda-btn wda-done';
  } else {
    btn.textContent = '❌ 加入不熟字卡';
    btn.className   = 'wda-btn wda-mark';
  }
}

function toggleWordMark() {
  const w = _findWordById(_wdWordId);
  if (!w) return;
  if (w.st === 'lrn') {
    w.st = 'new'; w._correctStreak = 0;
    const idx = capturedWords.indexOf(w.word);
    if (idx > -1) capturedWords.splice(idx, 1);
  } else {
    w.st = 'lrn'; w._correctStreak = 0;
    if (!capturedWords.includes(w.word)) capturedWords.push(w.word);
  }
  _updateWdMarkBtn(w);
  if (typeof syncWordStatus !== 'undefined') syncWordStatus(w.id, w.st, w._correctStreak || 0);
  // 同步更新字庫列表的狀態點
  const dot = document.querySelector(`.wrow[onclick*="openWordDetail(${_wdWordId})"] .wr-dot`);
  if (dot) dot.className = `wr-dot wd-${w.st}`;
}

// ── TOAST ──
function showToast(msg, duration) {
  const t = document.getElementById('toastEl');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), duration || 2500);
}

// ── CLICK OUTSIDE POPUP ──
document.addEventListener('click', e => {
  const pp = document.getElementById('wordPopup');
  if (pp && pp.classList.contains('show') && !pp.contains(e.target) && !e.target.classList.contains('w'))
    closeWordPopup();
});

// （已移除 cap2000_editable 邏輯）

// ── INIT ──
(async function init() {
  try {
    loadStats();

    // auth 必須先完成，loadCustomDecks 才能知道 currentUser
    const loggedIn = (typeof initAuth !== 'undefined') ? await initAuth() : false;
    if (!loggedIn && typeof showAuthOverlay !== 'undefined') showAuthOverlay();

    await loadCustomDecks();

    await Promise.all([loadWords(), loadArticles(), loadDailyArticles()]);

    if (typeof loadUserWordStatus !== 'undefined') await loadUserWordStatus();

    STUDY_WORDS = WORDS;

    loadCard(0);
    renderLib();
    renderArticles();
    updateChar();
  } catch (err) {
    console.error('[init] 初始化失敗:', err);
    showToast('⚠ 載入失敗，請重新整理頁面');
  }
})();

// ── FLASHCARD（卡片播放介面） ────────────────────────────────────
let fcCurrentIdx = 0;
let fcFlipped = false;
let fcMarked = new Set();       // 已學習（熟悉）的單字 id
let fcFavorites = new Set();    // 收藏的單字 id（獨立於熟悉度）
let fcRecordTab = 'unlearned';  // 學習紀錄當前分頁：learned / unlearned / fav

// 學習設定（全域持久化）：只學習收藏 + 卡片正面語言
let fcSettings = { onlyFav: false, front: 'en' };
try {
  fcSettings = { onlyFav: false, front: 'en', ...JSON.parse(localStorage.getItem('voca_fc_prefs') || '{}') };
} catch { /* 維持預設 */ }
function _saveFcSettings() {
  localStorage.setItem('voca_fc_prefs', JSON.stringify(fcSettings));
}

// 上方單字卡只播放「當前分頁」的單字（已學習/未學習/收藏連動過濾）
function fcViewList() {
  // 空卡組只有空白範本時，照常顯示範本卡
  if (STUDY_WORDS.length === 1 && STUDY_WORDS[0].id === 'empty_template') return STUDY_WORDS;
  let real = STUDY_WORDS.filter(w => w.id !== 'empty_template');
  if (fcSettings.onlyFav) real = real.filter(w => fcFavorites.has(w.id));  // 只學習收藏
  if (fcRecordTab === 'learned') return real.filter(w => fcMarked.has(w.id));
  if (fcRecordTab === 'fav')     return real.filter(w => fcFavorites.has(w.id));
  return real.filter(w => !fcMarked.has(w.id));
}

// 熟悉度與收藏依卡組分開持久化（localStorage，沿用 voca_ 前綴慣例）
function _fcMarksKey(kind) { return `voca_fc_${kind}_${fcCurrentDeckId}`; }

function _fcLoadMarks() {
  try {
    fcMarked    = new Set(JSON.parse(localStorage.getItem(_fcMarksKey('learned')) || '[]'));
    fcFavorites = new Set(JSON.parse(localStorage.getItem(_fcMarksKey('fav')) || '[]'));
  } catch {
    fcMarked = new Set();
    fcFavorites = new Set();
  }
}

function _fcSaveMarks() {
  localStorage.setItem(_fcMarksKey('learned'), JSON.stringify([...fcMarked]));
  localStorage.setItem(_fcMarksKey('fav'), JSON.stringify([...fcFavorites]));
}

function startFlashcard(deckId) {
  fcCurrentDeckId = deckId;  // 保存當前卡組 ID（用於新增單字）

  const builtin = BUILTIN_DECKS.find(d => d.id === deckId);
  if (builtin) {
    STUDY_WORDS = builtin.getWords();
  } else {
    const custom = customDecks.find(d => d.id === deckId);
    if (!custom) { showToast('找不到卡片'); return; }

    // 自定義卡組：優先使用本地快取的單字數據（手動輸入優先）
    if (custom.wordIds.length > 0) {
      // 【優化】建立索引以避免重複搜索
      const wordsMap = new Map();
      if (custom.words && Array.isArray(custom.words)) {
        custom.words.forEach(w => wordsMap.set(w.id, w));
      }

      STUDY_WORDS = custom.wordIds.map(wordId => {
        // 優先查本地快取
        if (wordsMap.has(wordId)) {
          return wordsMap.get(wordId);
        }

        // 備用：從全局 WORDS 中查找
        const foundWord = WORDS.find(w => w.id === wordId);
        if (foundWord) return foundWord;

        // 都找不到，返回空模板（不應該發生）
        return {
          id: wordId,
          word: '【加載中】',
          def: '單字信息加載失敗',
          phonetic: '',
          pos: '',
          example_en: ''
        };
      });
    } else {
      STUDY_WORDS = [EMPTY_WORD_TEMPLATE];
    }
  }
  // 允許進入空卡組
  fcCurrentIdx = 0;
  fcFlipped = false;
  _fcLoadMarks();  // 載入此卡組的熟悉度與收藏紀錄（預設全部未學習）

  // 進入卡組時回到「未學習」分頁（預設所有單字都在這裡）
  fcRecordTab = 'unlearned';
  document.querySelectorAll('.fc-record-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tabUnlearned')?.classList.add('active');

  // 更新卡組名稱（重要：同時更新刪除管理器的卡組名稱）
  let deckName = '卡組';
  if (builtin) {
    deckName = builtin.name || '會考2000單字';
  } else {
    const custom = customDecks.find(d => d.id === deckId);
    if (custom) deckName = custom.name;
  }
  const deckNameEl = document.getElementById('fcDeckName');
  if (deckNameEl) deckNameEl.textContent = deckName;

  // 新增/管理按鈕顯示規則：
  // 會考2000 = 固定教材僅供瀏覽（兩者皆隱藏）；不熟卡組 = 自動收錄（隱藏管理）
  const addBtn = document.querySelector('.fc-records-add-btn');
  if (addBtn) {
    addBtn.style.display = (deckId === 'cap2000') ? 'none' : '';
  }
  const manageBtn = document.getElementById('fcManageBtn');
  if (manageBtn) {
    manageBtn.style.display = ['cap2000', 'weak'].includes(deckId) ? 'none' : '';
  }

  // 切換卡組時關閉殘留的管理面板，避免跨卡組誤操作
  deleteWordState.isDeleteMode = false;
  deleteWordState.selectedIds.clear();
  const dmEl = document.getElementById('fcDeleteMode');
  if (dmEl) dmEl.style.display = 'none';

  loadFlashcard(0);
  updateRecordsList();
  goScreen('flashcard');
}

function loadFlashcard(idx) {
  const viewList = fcViewList();
  if (!viewList.length) {
    const emptyWordEl = document.getElementById('fcWord');
    emptyWordEl.textContent = STUDY_WORDS.length ? '此分類沒有單字' : '尚無單字';
    emptyWordEl.classList.add('fc-word-empty');
    emptyWordEl.style.fontSize = '';
    document.getElementById('fcPos').textContent = '';
    document.getElementById('fcPhonetic').textContent = '';
    // 背面欄位一併清空，避免翻轉後殘留上一個單字的內容
    document.getElementById('fcBackPhonetic').textContent = '';
    document.getElementById('fcDefinitionZh').textContent = STUDY_WORDS.length ? '此分類沒有單字' : '尚無單字';
    const emptyDefEn = document.getElementById('fcDefinitionEn');
    if (emptyDefEn) emptyDefEn.style.display = 'none';
    document.getElementById('fcExampleLabel').textContent = '';
    document.getElementById('fcExampleEn').textContent = '';
    document.getElementById('fcExampleZh').textContent = '';
    document.getElementById('fcProgress').textContent = '0 / 0';
    document.getElementById('fcProgressFill').style.width = '0%';
    document.getElementById('fcCard').classList.remove('flipped');
    fcFlipped = false;
    updateRecordsList();
    return;
  }
  if (idx >= viewList.length) idx = viewList.length - 1;
  fcCurrentIdx = idx;
  const w = viewList[idx];
  const isTemplate = w.id === 'empty_template';
  // 正面語言設定：en = 正面英文（預設）；zh = 正面中文定義、背面英文
  const frontIsZh = fcSettings.front === 'zh' && !isTemplate;
  const zhDefText = w.definition_zh || w.def || w.definition || '—';
  const wordEl = document.getElementById('fcWord');
  wordEl.textContent = isTemplate ? '尚無單字' : (frontIsZh ? zhDefText : w.word);
  wordEl.classList.toggle('fc-word-empty', isTemplate);
  wordEl.classList.toggle('fc-word-zhfront', frontIsZh);
  const fcHintEl = document.querySelector('#fcCard .fc-hint');
  if (fcHintEl) fcHintEl.textContent = isTemplate ? '點下方「➕ 新增」加入第一個單字' : '點擊翻轉';
  if (frontIsZh) { wordEl.style.fontSize = ''; } else { fitFcWord(); }
  document.getElementById('fcPos').textContent = w.pos || 'n.';
  // 格式化音標為 /phonetic/（清理多餘的 // 符號）
  let phonetic = w.phonetic || '';
  // 移除多餘的 / 符號（//phonetic// → /phonetic/）
  phonetic = phonetic.replace(/^\/+/, '/').replace(/\/+$/, '/');
  // 確保格式為 /phonetic/
  if (phonetic && !phonetic.startsWith('/')) {
    phonetic = `/${phonetic}`;
  }
  if (phonetic && !phonetic.endsWith('/')) {
    phonetic = `${phonetic}/`;
  }
  const formattedPhonetic = phonetic;
  // 正面為中文時音標移到背面（跟著英文單字走）
  document.getElementById('fcPhonetic').textContent = frontIsZh ? '' : formattedPhonetic;
  document.getElementById('fcBackPhonetic').textContent = formattedPhonetic;

  // ===== 定義顯示邏輯 =====
  // 快速查詢：顯示字典中的定義（中文優先，加上英文）
  // 手動輸入：只顯示用戶輸入的中文定義

  const isQuickMode = !!(w.definition_zh || w.example_en || (w.tags && w.tags.includes('cap_2000')) || (w.source === 'cambridge'));
  const englishDefEl = document.getElementById('fcDefinitionEn');

  if (isQuickMode) {
    // 快速查詢模式：顯示 Cambridge 字典中的定義
    const chineseDef = w.definition_zh || w.def || '未知';
    document.getElementById('fcDefinitionZh').textContent = chineseDef;

    // 顯示原始英文定義（較小）
    const englishDef = w.definition || '';
    if (englishDef) {
      englishDefEl.textContent = englishDef;
      englishDefEl.style.display = 'block';
    } else {
      englishDefEl.style.display = 'none';
    }
  } else {
    // 手動輸入模式：只顯示用戶輸入的中文定義
    const chineseDef = w.definition || w.def || '未知';
    document.getElementById('fcDefinitionZh').textContent = chineseDef;
    englishDefEl.style.display = 'none';
  }

  // 正面為中文時，背面主文字改顯示英文單字
  if (frontIsZh) {
    document.getElementById('fcDefinitionZh').textContent = w.word;
  }

  // ===== 例句/備註顯示邏輯 =====
  const exampleLabelEl = document.getElementById('fcExampleLabel');
  const exampleEnEl = document.getElementById('fcExampleEn');
  const exampleZhEl = document.getElementById('fcExampleZh');

  if (isQuickMode) {
    // 快速查詢：顯示字典中的例句
    exampleLabelEl.textContent = '例句';
    exampleEnEl.textContent = w.example_en || '';
    exampleZhEl.textContent = w.example_zh || '';
    // 如果沒有例句，隱藏整個例句區塊
    const exWrap = document.getElementById('wdExWrap');
    if (!w.example_en && !w.example_zh) {
      exWrap ? (exWrap.style.display = 'none') : null;
    }
  } else {
    // 手動輸入：顯示備註（如果有的話）
    if (w.manual_note) {
      exampleLabelEl.textContent = '備註';
      exampleEnEl.textContent = w.manual_note;
      exampleZhEl.textContent = '';
    } else {
      exampleLabelEl.textContent = '';
      exampleEnEl.textContent = '';
      exampleZhEl.textContent = '';
    }
  }

  document.getElementById('fcProgress').textContent = `${idx + 1} / ${viewList.length}`;
  const pct = ((idx + 1) / viewList.length) * 100;
  document.getElementById('fcProgressFill').style.width = pct + '%';
  document.getElementById('fcCard').classList.remove('flipped');
  fcFlipped = false;
  updateFcMarkBtn();
  updateRecordsList();
}

// 過長單字不換行，改為自動縮小字體至塞進卡片寬度
function fitFcWord() {
  const el = document.getElementById('fcWord');
  if (!el || !el.parentElement) return;
  el.style.fontSize = '';  // 還原 CSS 預設（56px）再重新量測
  const avail = el.parentElement.clientWidth - 48;  // 扣除卡片左右 padding 24px
  if (avail <= 0) return;  // 畫面尚未顯示時跳過
  let size = parseFloat(getComputedStyle(el).fontSize);
  while (size > 20 && el.scrollWidth > avail) {
    size -= 2;
    el.style.fontSize = size + 'px';
  }
}

function flipCard() {
  const card = document.getElementById('fcCard');
  card.classList.toggle('flipped');
  fcFlipped = !fcFlipped;
}

function fcNextCard() {
  const len = fcViewList().length;
  if (!len) return;
  fcCurrentIdx = (fcCurrentIdx + 1) % len;
  loadFlashcard(fcCurrentIdx);
}

function fcPrevCard() {
  const len = fcViewList().length;
  if (!len) return;
  fcCurrentIdx = (fcCurrentIdx - 1 + len) % len;
  loadFlashcard(fcCurrentIdx);
}

// 星星按鈕＝收藏（獨立狀態，不影響已學習/未學習分類）
function fcToggleMark() {
  const w = fcViewList()[fcCurrentIdx];
  if (!w || w.id === 'empty_template') return;
  if (fcFavorites.has(w.id)) {
    fcFavorites.delete(w.id);
  } else {
    fcFavorites.add(w.id);
  }
  _fcSaveMarks();
  if (fcRecordTab === 'fav') {
    // 在收藏分頁取消收藏 → 單字移出當前清單，原位即是下一張
    loadFlashcard(fcCurrentIdx);
  } else {
    updateFcMarkBtn();
    updateRecordsList();
  }
}

// 熟悉 / 不熟悉判定：熟悉 → 已學習，不熟悉 → 未學習
function fcSetFamiliar(isFamiliar) {
  const before = fcViewList();
  const w = before[fcCurrentIdx];
  if (!w || w.id === 'empty_template') return;
  if (isFamiliar) {
    fcMarked.add(w.id);
  } else {
    fcMarked.delete(w.id);
  }
  _fcSaveMarks();
  const after = fcViewList();
  if (after.length < before.length) {
    // 單字移出當前分類（如在未學習按下熟悉），原位即是下一張
    loadFlashcard(after.length ? fcCurrentIdx % after.length : 0);
  } else {
    // 分類未變動（如在收藏分頁判定），自動跳下一張
    fcNextCard();
  }
}

function updateFcMarkBtn() {
  const w = fcViewList()[fcCurrentIdx];
  if (!w) return;
  const btn = document.getElementById('fcMarkBtn');
  const icon = document.getElementById('fcMarkIcon');
  if (fcFavorites.has(w.id)) {
    btn.classList.add('marked');
    icon.textContent = '★';
  } else {
    btn.classList.remove('marked');
    icon.textContent = '☆';
  }
}

function fcPlayAudio() {
  const w = fcViewList()[fcCurrentIdx];
  if (w?.word) speak(w.word);
}

function switchFlashcardMode(mode) {
  // 標示按鈕狀態
  document.querySelectorAll('.fc-mode-btn').forEach(b => b.classList.remove('fc-mode-active'));
  if (typeof event !== 'undefined' && event.target) {
    event.target.closest('.fc-mode-btn')?.classList.add('fc-mode-active');
  }
  if (mode === 'match') { openMatchReady(); return; }
  if (mode === 'quiz')  { openFcQuizMode(); return; }
  // flip = 預設卡片模式，無需額外處理
}

// ── 單字卡測驗（10 題選擇題）────────────────────────────────────
let fcQuizState = null;

function _fcqZh(w) { return w.definition_zh || w.def || w.definition || '—'; }

function _fcqShow(stageId) {
  ['fcQuizMode', 'fcQuizQuestion', 'fcQuizResult'].forEach(id => {
    document.getElementById(id).style.display = id === stageId ? 'flex' : 'none';
  });
}

function openFcQuizMode() {
  const pool = STUDY_WORDS.filter(w => w.id !== 'empty_template' && w.word && (w.definition_zh || w.def || w.definition));
  if (pool.length < 4) {
    showToast('❌ 測驗需要至少 4 個單字');
    return;
  }
  fcQuizState = { pool, mode: null, questions: [], idx: 0, answers: [], locked: false };
  document.getElementById('fcQuizProgress').textContent = '';
  _fcqShow('fcQuizMode');
  document.getElementById('fcQuizOverlay').classList.add('show');
}

function startFcQuiz(mode) {
  const s = fcQuizState;
  s.mode = mode;
  // 隨機抽題（最多 10 題），每題 1 正確 + 3 隨機干擾，選項順序打亂（正確答案位置隨機）
  const qWords = [...s.pool].sort(() => Math.random() - .5).slice(0, Math.min(10, s.pool.length));
  s.questions = qWords.map(w => {
    const wrongs = s.pool.filter(x => x.id !== w.id).sort(() => Math.random() - .5).slice(0, 3);
    const opts = [w, ...wrongs].sort(() => Math.random() - .5);
    return { w, opts };
  });
  s.idx = 0;
  s.answers = [];
  _fcqRenderQuestion();
  _fcqShow('fcQuizQuestion');
}

function _fcqRenderQuestion() {
  const s = fcQuizState;
  const q = s.questions[s.idx];
  document.getElementById('fcQuizProgress').textContent = `第 ${s.idx + 1} / ${s.questions.length} 題`;
  document.getElementById('fcqQuestion').textContent = s.mode === 'zh' ? _fcqZh(q.w) : q.w.word;
  document.getElementById('fcqOpts').innerHTML = q.opts.map((o, i) =>
    `<button class="fcq-opt" id="fcqOpt${i}" onclick="fcqAnswer(${i})">${_matchEsc(s.mode === 'zh' ? o.word : _fcqZh(o))}</button>`
  ).join('');
  s.locked = false;
}

function fcqAnswer(i) {
  const s = fcQuizState;
  if (!s || s.locked) return;
  s.locked = true;
  const q = s.questions[s.idx];
  const correct = q.opts[i].id === q.w.id;
  s.answers.push({ w: q.w, correct });

  document.getElementById('fcqOpt' + i).classList.add(correct ? 'ok' : 'bad');
  if (!correct) {
    // 答錯時同步亮出正確答案
    const cIdx = q.opts.findIndex(o => o.id === q.w.id);
    document.getElementById('fcqOpt' + cIdx).classList.add('ok');
  }

  setTimeout(() => {
    s.idx++;
    if (s.idx >= s.questions.length) {
      _fcqFinish();
    } else {
      _fcqRenderQuestion();
    }
  }, correct ? 600 : 1100);
}

function _fcqFinish() {
  const s = fcQuizState;
  const correct = s.answers.filter(a => a.correct);
  const wrong   = s.answers.filter(a => !a.correct);
  document.getElementById('fcQuizProgress').textContent = '';
  document.getElementById('fcqScore').textContent = `${correct.length} / ${s.answers.length} 分`;

  const row = a => `
    <div class="fcq-row">
      <span class="fcq-row-word">${_matchEsc(a.w.word)}</span>
      <span class="fcq-row-zh">${_matchEsc(_fcqZh(a.w))}</span>
      <button class="fcq-row-fav ${fcFavorites.has(a.w.id) ? 'on' : ''}" data-id="${a.w.id}" onclick="fcqToggleFav(this)">${fcFavorites.has(a.w.id) ? '★' : '☆'}</button>
    </div>`;
  document.getElementById('fcqCorrectList').innerHTML = correct.map(row).join('') || '<div class="fcq-none">—</div>';
  document.getElementById('fcqWrongList').innerHTML   = wrong.map(row).join('')   || '<div class="fcq-none">—</div>';
  _fcqShow('fcQuizResult');
}

function fcqToggleFav(btn) {
  const word = STUDY_WORDS.find(w => String(w.id) === String(btn.dataset.id));
  if (!word) return;
  if (fcFavorites.has(word.id)) {
    fcFavorites.delete(word.id);
  } else {
    fcFavorites.add(word.id);
  }
  _fcSaveMarks();
  const on = fcFavorites.has(word.id);
  btn.classList.toggle('on', on);
  btn.textContent = on ? '★' : '☆';
  updateRecordsList();
  updateFcMarkBtn();
}

function closeFcQuiz() {
  fcQuizState = null;
  document.getElementById('fcQuizOverlay').classList.remove('show');
  // 模式按鈕回到翻牌
  document.querySelectorAll('.fc-mode-btn').forEach(b => b.classList.remove('fc-mode-active'));
  document.querySelector('.fc-mode-btn')?.classList.add('fc-mode-active');
}

// ── 配對遊戲（每個卡組獨立計時紀錄）────────────────────────────
let matchState = null;

function _matchEsc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _matchShow(stageId) {
  ['matchReady', 'matchCountdown', 'matchGame', 'matchResult'].forEach(id => {
    document.getElementById(id).style.display = id === stageId ? 'flex' : 'none';
  });
}

function openMatchReady() {
  const pool = STUDY_WORDS.filter(w => w.id !== 'empty_template' && w.word);
  if (pool.length < 6) {
    showToast('❌ 配對遊戲需要至少 6 個單字');
    return;
  }
  matchState = { deckId: fcCurrentDeckId, pool, firstPick: null, matched: 0, timerId: null, countdownId: null, startTs: 0, locked: false };
  document.getElementById('matchTimer').textContent = '0.0';
  _matchShow('matchReady');
  document.getElementById('matchOverlay').classList.add('show');
}

function startMatchCountdown() {
  _matchShow('matchCountdown');
  let n = 3;
  const numEl = document.getElementById('matchCountNum');
  numEl.textContent = n;
  matchState.countdownId = setInterval(() => {
    n--;
    if (n <= 0) {
      clearInterval(matchState.countdownId);
      _startMatchGame();
    } else {
      numEl.textContent = n;
    }
  }, 1000);
}

function _startMatchGame() {
  const s = matchState;
  // 隨機抽 6 個單字 → 6 英文 + 6 中文定義共 12 張牌，打亂排列
  const words = [...s.pool].sort(() => Math.random() - .5).slice(0, 6);
  const tiles = [];
  words.forEach(w => {
    const zh = w.definition_zh || w.def || w.definition || '—';
    tiles.push({ key: w.id, type: 'en', text: w.word });
    tiles.push({ key: w.id, type: 'zh', text: zh });
  });
  tiles.sort(() => Math.random() - .5);

  document.getElementById('matchGrid').innerHTML = tiles.map(t =>
    `<div class="match-tile match-tile-${t.type}" data-key="${t.key}" data-type="${t.type}" onclick="matchTileClick(this)">${_matchEsc(t.text)}</div>`
  ).join('');

  s.matched = 0;
  s.firstPick = null;
  s.locked = false;
  _matchShow('matchGame');
  s.startTs = performance.now();
  s.timerId = setInterval(() => {
    document.getElementById('matchTimer').textContent = ((performance.now() - s.startTs) / 1000).toFixed(1);
  }, 100);
}

function matchTileClick(el) {
  const s = matchState;
  if (!s || s.locked || el.classList.contains('gone') || el.classList.contains('ok')) return;

  // 再點同一張 = 取消選取
  if (s.firstPick === el) {
    el.classList.remove('sel');
    s.firstPick = null;
    return;
  }

  el.classList.add('sel');
  if (!s.firstPick) {
    s.firstPick = el;
    return;
  }

  const a = s.firstPick, b = el;
  s.firstPick = null;
  const isMatch = a.dataset.key === b.dataset.key && a.dataset.type !== b.dataset.type;

  if (isMatch) {
    // 配對成功：轉綠後消失
    a.classList.remove('sel'); b.classList.remove('sel');
    a.classList.add('ok'); b.classList.add('ok');
    setTimeout(() => { a.classList.add('gone'); b.classList.add('gone'); }, 350);
    s.matched++;
    if (s.matched >= 6) _finishMatchGame();
  } else {
    // 配對錯誤：轉紅抖動後復原，不消失
    s.locked = true;
    a.classList.remove('sel'); b.classList.remove('sel');
    a.classList.add('bad'); b.classList.add('bad');
    setTimeout(() => {
      a.classList.remove('bad'); b.classList.remove('bad');
      s.locked = false;
    }, 450);
  }
}

function _finishMatchGame() {
  const s = matchState;
  clearInterval(s.timerId);
  const elapsed = (performance.now() - s.startTs) / 1000;

  // 每個卡組獨立保存最佳紀錄
  const key = `voca_match_best_${s.deckId}`;
  const prevBest = parseFloat(localStorage.getItem(key));
  let bestText;
  if (isNaN(prevBest)) {
    localStorage.setItem(key, elapsed.toFixed(1));
    bestText = '🎉 首次完成，紀錄建立！';
  } else if (elapsed < prevBest) {
    localStorage.setItem(key, elapsed.toFixed(1));
    bestText = `🎉 新紀錄！（原最佳 ${prevBest.toFixed(1)} 秒）`;
  } else {
    bestText = `此卡組最佳紀錄：${prevBest.toFixed(1)} 秒`;
  }

  setTimeout(() => {
    document.getElementById('matchResultTime').textContent = elapsed.toFixed(1) + ' 秒';
    document.getElementById('matchResultBest').textContent = bestText;
    _matchShow('matchResult');
  }, 500);
}

function closeMatchGame() {
  if (matchState) {
    clearInterval(matchState.timerId);
    clearInterval(matchState.countdownId);
  }
  matchState = null;
  document.getElementById('matchOverlay').classList.remove('show');
  // 模式按鈕回到翻牌
  document.querySelectorAll('.fc-mode-btn').forEach(b => b.classList.remove('fc-mode-active'));
  document.querySelector('.fc-mode-btn')?.classList.add('fc-mode-active');
}

function showFcSettings() {
  _renderFcSettingsUI();
  openModal('fcSettingsModal');
}

function _renderFcSettingsUI() {
  document.getElementById('fcSetOnlyFav').classList.toggle('on', fcSettings.onlyFav);
  document.getElementById('fcSetFrontEn').classList.toggle('active', fcSettings.front === 'en');
  document.getElementById('fcSetFrontZh').classList.toggle('active', fcSettings.front === 'zh');
}

function toggleFcOnlyFav() {
  fcSettings.onlyFav = !fcSettings.onlyFav;
  _saveFcSettings();
  _renderFcSettingsUI();
  // 重新套用過濾：回到清單第一張
  fcCurrentIdx = 0;
  loadFlashcard(0);
}

function setFcFront(side) {
  fcSettings.front = side;
  _saveFcSettings();
  _renderFcSettingsUI();
  loadFlashcard(fcCurrentIdx);
}

// ── SETTINGS PANEL ──────────────────────────────────────────────

const SETTINGS_KEY = 'voca_settings';

function _loadSettingsData() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); }
  catch { return {}; }
}

function _saveSettingsData(patch) {
  const cur = _loadSettingsData();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...cur, ...patch }));
}

// ── SUBJECT STATS ────────────────────────────────────────────
const _SSTATS_KEY  = 'voca_subject_stats';
const _SCAT_ORDER  = ['vocab','phrase','grammar','cloze','reading','listening'];
const _SCAT_NAMES  = { vocab:'單字', phrase:'片語', grammar:'文法', cloze:'克漏字', reading:'閱讀', listening:'聽力' };

function _loadSubjectStats() {
  try { return JSON.parse(localStorage.getItem(_SSTATS_KEY)) || {}; }
  catch { return {}; }
}
function _saveSubjectStats(obj) { localStorage.setItem(_SSTATS_KEY, JSON.stringify(obj)); }

function _trackSubjectStats(cat, correct, total) {
  if (!cat || total <= 0) return;
  const s = _loadSubjectStats();
  if (!s[cat]) s[cat] = { total: 0, correct: 0 };
  s[cat].total   += total;
  s[cat].correct += Math.min(correct, total);
  _saveSubjectStats(s);
}

function _buildRadarSVG(statsObj) {
  const N = _SCAT_ORDER.length;
  const cx = 120, cy = 120, R = 76, LR = 108;

  const vals = _SCAT_ORDER.map(c => {
    const s = statsObj[c];
    return (s && s.total > 0) ? Math.min(s.correct / s.total, 1) : 0;
  });

  const pt = (r, i) => {
    const a = (2 * Math.PI * i / N) - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  const grids = [0.25, 0.5, 0.75, 1].map(g => {
    const pts = _SCAT_ORDER.map((_, i) => pt(g * R, i).join(',')).join(' ');
    const op  = g === 1 ? '.45' : '.18';
    return `<polygon points="${pts}" fill="none" stroke="rgba(122,92,67,${op})" stroke-width="${g===1?1.5:1}"/>`;
  }).join('');

  const axes = _SCAT_ORDER.map((_, i) => {
    const [x, y] = pt(R, i);
    return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(122,92,67,.2)" stroke-width="1"/>`;
  }).join('');

  const dataPts = _SCAT_ORDER.map((_, i) => pt(vals[i] * R, i).join(',')).join(' ');

  const dots = _SCAT_ORDER.map((_, i) => {
    const [x, y] = pt(vals[i] * R, i);
    return vals[i] > 0
      ? `<circle cx="${x}" cy="${y}" r="3.5" fill="var(--green3)"/>`
      : '';
  }).join('');

  const labels = _SCAT_ORDER.map((c, i) => {
    const [lx, ly] = pt(LR, i);
    const s   = statsObj[c];
    const pct = (s && s.total > 0) ? Math.round(s.correct / s.total * 100) : -1;
    const col = vals[i] > 0 ? 'var(--white)' : 'rgba(75,56,42,.4)';
    const sub = pct >= 0 ? `${pct}%（${s.total}題）` : '未練習';
    const subCol = pct >= 0 ? 'var(--green3)' : 'rgba(75,56,42,.35)';
    return `
      <text x="${lx}" y="${ly - 5}" text-anchor="middle" fill="${col}" font-size="10" font-weight="700" font-family="Nunito,sans-serif">${_SCAT_NAMES[c]}</text>
      <text x="${lx}" y="${ly + 8}" text-anchor="middle" fill="${subCol}" font-size="9" font-family="Nunito,sans-serif">${sub}</text>`;
  }).join('');

  const ringNums = [0.5, 1].map(g =>
    `<text x="${cx+4}" y="${cy - g*R + 4}" fill="rgba(75,56,42,.35)" font-size="8" font-family="Nunito,sans-serif">${g*100|0}%</text>`
  ).join('');

  return `<svg width="240" height="240" viewBox="0 0 240 240" style="display:block;margin:0 auto">
    ${grids}${axes}
    <polygon points="${dataPts}" fill="rgba(61,184,112,.22)" stroke="var(--green3)" stroke-width="2" stroke-linejoin="round"/>
    ${dots}${labels}${ringNums}
  </svg>`;
}

function _refreshProfileRadar() {
  const c = document.getElementById('profileRadarContainer');
  if (c) c.innerHTML = _buildRadarSVG(_loadSubjectStats());
}

// 訪客模式點「個人資料」：說明能力分析需要帳號，並直接開啟登入/註冊視窗
function showGuestProfileNotice() {
  showToast('目前是訪客模式，無法開啟個人優劣分析圖，請先登入或註冊帳號', 4000);
  showAuthOverlay();
}

// ── PROFILE MODAL ────────────────────────────────────────────
function showProfile() {
  if (!currentProfile) return;
  const mastered = (typeof WORDS !== 'undefined') ? WORDS.filter(w => w.st === 'ok').length : 0;
  const total    = (typeof WORDS !== 'undefined') ? WORDS.length : 2000;

  const overlay = document.createElement('div');
  overlay.id = 'profileOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(75,56,42,.55);z-index:9000;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto';
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };

  overlay.innerHTML = `
    <div style="background:var(--card);border:2.5px solid var(--line);border-radius:16px;padding:24px 20px;width:100%;max-width:340px;font-family:'Nunito',sans-serif;position:relative;box-shadow:0 8px 40px rgba(75,56,42,.3)">
      <button onclick="document.getElementById('profileOverlay').remove()" style="position:absolute;top:14px;right:16px;background:none;border:none;color:var(--gray);font-size:18px;cursor:pointer">✕</button>

      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:40px;margin-bottom:6px">👤</div>
        <div style="font-weight:900;font-size:18px;color:var(--white)">${currentProfile.username}</div>
        <div style="font-size:11px;color:var(--gray);margin-top:2px">${currentUser?.email || ''}</div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px">
        <div style="background:rgba(122,92,67,.08);border-radius:10px;padding:10px;text-align:center">
          <div style="font-size:18px;font-weight:900;color:var(--green3)">${currentProfile.xp||0}</div>
          <div style="font-size:11px;color:var(--gray)">經驗值 XP</div>
        </div>
        <div style="background:rgba(122,92,67,.08);border-radius:10px;padding:10px;text-align:center">
          <div style="font-size:18px;font-weight:900;color:#f4a62a">${currentProfile.gold||0}</div>
          <div style="font-size:11px;color:var(--gray)">🪙 金幣</div>
        </div>
        <div style="background:rgba(122,92,67,.08);border-radius:10px;padding:10px;text-align:center">
          <div style="font-size:18px;font-weight:900;color:#ff7043">${currentProfile.streak||0}</div>
          <div style="font-size:11px;color:var(--gray)">🔥 連續天數</div>
        </div>
        <div style="background:rgba(122,92,67,.08);border-radius:10px;padding:10px;text-align:center">
          <div style="font-size:18px;font-weight:900;color:var(--white)">${mastered}<span style="font-size:11px;font-weight:400;color:var(--gray)">/${total}</span></div>
          <div style="font-size:11px;color:var(--gray)">✅ 已掌握單字</div>
        </div>
      </div>

      <div style="margin-bottom:16px">
        <div style="font-size:13px;font-weight:700;color:var(--white);margin-bottom:10px">
          📊 能力分析
          <span style="font-size:11px;color:var(--gray);font-weight:400;margin-left:4px">正確率 / 作答數</span>
        </div>
        <div id="profileRadarContainer" style="background:rgba(122,92,67,.06);border-radius:12px;padding:8px"></div>
        <button onclick="_refreshProfileRadar()" style="width:100%;margin-top:10px;padding:9px;background:rgba(61,184,112,.13);border:1px solid rgba(61,184,112,.28);border-radius:8px;color:var(--green3);font-family:'Nunito',sans-serif;font-weight:700;font-size:13px;cursor:pointer">🔄 更新分析</button>
      </div>

      <button onclick="document.getElementById('profileOverlay').remove();logoutUser()" style="width:100%;padding:11px;background:rgba(224,71,46,.1);border:1px solid rgba(224,71,46,.35);border-radius:10px;color:#E0472E;font-family:'Nunito',sans-serif;font-weight:700;font-size:13px;cursor:pointer">登出</button>
    </div>`;

  document.body.appendChild(overlay);
  _refreshProfileRadar();
}

function showSettings() {
  const s = _loadSettingsData();

  // 還原 toggles
  const sfx = document.getElementById('sfxToggle');
  const bgm = document.getElementById('bgmToggle');
  if (sfx) sfx.checked = s.sfx !== false;
  if (bgm) bgm.checked = s.bgm === true;

  // 還原 segmented controls（每日目標）
  const dailyGoal = s.dailyGoal || 20;
  document.querySelectorAll('.sett-seg[onclick*="setDailyGoal"]').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.includes(String(dailyGoal)));
  });

  // 還原學習目標
  const goal = s.goal || 'cap2000';
  document.querySelectorAll('.sett-seg[onclick*="setGoal"]').forEach(btn => {
    const map = { cap2000: '會考', gsat: '學測', toeic: '多益' };
    btn.classList.toggle('active', btn.textContent.includes(map[goal] || ''));
  });

  document.getElementById('settingsPanel').classList.add('open');
}

function closeSettings() {
  document.getElementById('settingsPanel').classList.remove('open');
}

function settingsPanelClick(e) {
  if (e.target === document.getElementById('settingsPanel')) closeSettings();
}

function setGoal(goal, btn) {
  document.querySelectorAll('.sett-seg[onclick*="setGoal"]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  _saveSettingsData({ goal });
  const labels = { cap2000: '會考 2000', gsat: '學測', toeic: '多益' };
  showToast(`✓ 目標切換為「${labels[goal]}」`);
}

function setDailyGoal(n, btn) {
  document.querySelectorAll('.sett-seg[onclick*="setDailyGoal"]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  _saveSettingsData({ dailyGoal: n });
  showToast(`✓ 每日目標設為 ${n} 字`);
}

function saveSoundSettings() {
  const sfx = document.getElementById('sfxToggle')?.checked ?? true;
  const bgm = document.getElementById('bgmToggle')?.checked ?? false;
  _saveSettingsData({ sfx, bgm });
}

function confirmResetWordBank() {
  if (!confirm('確定要重置字庫嗎？\n所有單字學習狀態將歸零，這個操作無法復原。')) return;
  WORDS.forEach(w => { w.st = 'new'; w._correctStreak = 0; });
  if (typeof currentUser !== 'undefined' && currentUser && typeof authClient !== 'undefined') {
    authClient.from('user_word_status').delete().eq('user_id', currentUser.id);
  }
  localStorage.removeItem('voca_word_status');
  updateChar();
  showToast('✓ 字庫已重置，重新開始！');
}

function showParentBind() {
  // 產生隨機 8 碼聯動碼（顯示用，後端功能待實作）
  const stored = _loadSettingsData().bindCode;
  document.getElementById('bindCodeText').textContent = stored || '——';
  openModal('parentBindModal');
}

function generateBindCode() {
  const code = Math.random().toString(36).slice(2, 10).toUpperCase();
  _saveSettingsData({ bindCode: code });
  document.getElementById('bindCodeText').textContent = code;
}

function submitParentCode() {
  const code = document.getElementById('parentCodeInput').value.trim().toUpperCase();
  if (!code) { showToast('請輸入聯動碼'); return; }
  closeModal('parentBindModal');
  showToast('✓ 已送出聯動申請（功能即將上線）');
}

function showPrivacySettings() {
  showToast('隱私設定功能即將上線');
}

async function downloadOfflinePack() {
  if (!('serviceWorker' in navigator)) {
    showToast('❌ 此瀏覽器不支援離線功能');
    return;
  }
  showToast('⏳ 下載離線包中...');
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.update();
    showToast('✓ 離線包已更新完成！');
  } catch {
    showToast('❌ 離線包下載失敗，請稍後再試');
  }
}

async function clearAppCache() {
  if (!confirm('確定清理快取？App 會重新載入。')) return;
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    showToast('✓ 快取已清除，正在重新載入...');
    setTimeout(() => location.reload(true), 1200);
  } catch {
    showToast('✓ 快取已清除');
    setTimeout(() => location.reload(true), 1200);
  }
}

function openErrorReport() {
  window.open('mailto:support@vocatopia.app?subject=錯誤回報&body=請描述你發現的問題：', '_blank');
}

function openTerms() {
  showToast('服務條款即將上線');
}

function updateRecordsList() {
  if (!STUDY_WORDS || STUDY_WORDS.length === 0) return;

  let realWords = STUDY_WORDS.filter(w => w.id !== 'empty_template');
  if (fcSettings.onlyFav) realWords = realWords.filter(w => fcFavorites.has(w.id));  // 只學習收藏
  const learnedList   = realWords.filter(w => fcMarked.has(w.id));
  const unlearnedList = realWords.filter(w => !fcMarked.has(w.id));
  const favList       = realWords.filter(w => fcFavorites.has(w.id));

  document.getElementById('countLearned').textContent = learnedList.length;
  document.getElementById('countUnlearned').textContent = unlearnedList.length;
  const favCountEl = document.getElementById('countFav');
  if (favCountEl) favCountEl.textContent = favList.length;

  const items = fcRecordTab === 'learned' ? learnedList
              : fcRecordTab === 'fav'     ? favList
              : unlearnedList;

  // items 與 fcViewList() 在當前分頁下順序一致，索引可直接用於卡片跳轉
  const _trunc = (s, n) => (s.length > n ? s.substring(0, n) + '…' : s);
  const listHtml = items.map((w, i) => {
    const isManual = w.source === 'user_input' || w.manual_note;
    const zhDef = (isManual ? (w.definition || w.def) : w.definition_zh) || '—';
    return `
    <div class="fc-record-item" onclick="loadFlashcard(${i})">
      <span class="fc-record-word">${fcFavorites.has(w.id) ? '<span class="fc-record-fav">★</span>' : ''}${w.word}</span>
      <span class="fc-record-zh">${_trunc(zhDef, 24)}</span>
    </div>`;
  }).join('');

  document.getElementById('fcRecordsList').innerHTML = listHtml || '<div style="padding: 20px; text-align: center; color: #999;">沒有單字</div>';
}

function switchRecordTab(btn, tabName) {
  fcRecordTab = tabName;
  document.querySelectorAll('.fc-record-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  // 上方單字卡連動切換到該分類的第一張
  fcCurrentIdx = 0;
  loadFlashcard(0);
}

// ===== DELETE WORD MANAGEMENT =====

let deleteWordState = {
  isDeleteMode: false,
  selectedIds: new Set(),
  deckId: null  // 追蹤目前的卡組 ID（確保隔離）
};

function toggleDeleteMode() {
  deleteWordState.isDeleteMode = !deleteWordState.isDeleteMode;
  deleteWordState.selectedIds.clear();
  deleteWordState.deckId = fcCurrentDeckId;  // 記錄當前卡組 ID

  const deleteModeBefore = document.getElementById('fcDeleteMode');

  if (deleteWordState.isDeleteMode) {
    deleteModeBefore.style.display = 'block';

    // 從 fcDeckName 獲取最新的卡組名稱（startFlashcard 已更新）
    const currentDeckName = document.getElementById('fcDeckName')?.textContent || '卡組';
    const deckNameEl = document.getElementById('fcDeleteDeckName');
    if (deckNameEl) {
      deckNameEl.textContent = currentDeckName;
    }

    updateDeleteList();
  } else {
    deleteModeBefore.style.display = 'none';
  }
}

function updateDeleteList() {
  const deleteListEl = document.getElementById('fcDeleteList');

  // 確保只顯示當前卡組的單字（過濾掉空白範本）
  const words = STUDY_WORDS.filter(w => w.id !== 'empty_template');

  if (words.length === 0) {
    deleteListEl.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">沒有單字</div>';
    return;
  }

  const listHtml = words.map(w => {
    const isSelected = deleteWordState.selectedIds.has(String(w.id));
    return `
      <div class="fc-delete-item ${isSelected ? 'fc-delete-item-selected' : ''}" id="delete-item-${w.id}">
        <input type="checkbox" class="fc-delete-checkbox" data-word-id="${w.id}"
               ${isSelected ? 'checked' : ''}
               onchange="toggleWordSelection('${w.id}')">
        <span class="fc-delete-item-word">${w.word}</span>
        <span style="color: #999; font-size: 11px;">${(w.def || w.definition || '—')?.substring(0, 15)}...</span>
      </div>
    `;
  }).join('');

  deleteListEl.innerHTML = listHtml;
}

function toggleWordSelection(wordId) {
  wordId = String(wordId);  // 確保統一為字符串

  if (deleteWordState.selectedIds.has(wordId)) {
    deleteWordState.selectedIds.delete(wordId);
  } else {
    deleteWordState.selectedIds.add(wordId);
  }

  // 更新 UI：高亮已選中的單字
  const itemEl = document.getElementById(`delete-item-${wordId}`);
  if (itemEl) {
    if (deleteWordState.selectedIds.has(wordId)) {
      itemEl.classList.add('fc-delete-item-selected');
    } else {
      itemEl.classList.remove('fc-delete-item-selected');
    }
  }

  // 更新選中計數
  updateDeleteCount();
}

function updateDeleteCount() {
  const countEl = document.getElementById('fcDeleteCount');
  if (countEl) {
    countEl.textContent = deleteWordState.selectedIds.size;
  }
}

function selectAllWords() {
  const words = STUDY_WORDS.filter(w => w.id !== 'empty_template');
  words.forEach(w => deleteWordState.selectedIds.add(String(w.id)));

  // 更新 UI
  document.querySelectorAll('.fc-delete-item').forEach(item => {
    item.classList.add('fc-delete-item-selected');
  });

  document.querySelectorAll('.fc-delete-checkbox').forEach(cb => {
    cb.checked = true;
  });

  updateDeleteCount();
}

function deselectAllWords() {
  deleteWordState.selectedIds.clear();

  // 更新 UI
  document.querySelectorAll('.fc-delete-item').forEach(item => {
    item.classList.remove('fc-delete-item-selected');
  });

  document.querySelectorAll('.fc-delete-checkbox').forEach(cb => {
    cb.checked = false;
  });

  updateDeleteCount();
}

function openMoveWordsModal() {
  if (deleteWordState.selectedIds.size === 0) {
    showToast('❌ 請選擇要轉移的單字');
    return;
  }

  // 確保卡組隔離
  if (deleteWordState.deckId !== fcCurrentDeckId) {
    showToast('❌ 卡組已改變，請重新打開刪除管理器');
    return;
  }

  // 更新 Modal 的單字計數
  document.getElementById('moveWordsCount').textContent = deleteWordState.selectedIds.size;

  // 生成可用的目標卡組列表（排除當前卡組）
  const currentDeckId = fcCurrentDeckId;
  const deckList = document.getElementById('moveWordsDeckList');
  deckList.innerHTML = '';

  // 只顯示自定義卡組作為目標（無法轉移到內置卡組）
  const targetDecks = customDecks.filter(d => d.id !== currentDeckId);

  if (targetDecks.length === 0) {
    deckList.innerHTML = '<div style="padding: 16px; text-align: center; color: #999; font-size: 12px;">沒有其他自定義卡組</div>';
  } else {
    targetDecks.forEach((deck, idx) => {
      const item = document.createElement('div');
      item.id = `moveTarget_${idx}`;
      item.dataset.deckId = deck.id;
      item.dataset.deckName = deck.name;
      item.style.cssText = 'padding: 12px; margin: 8px 0; background: white; border-radius: 6px; border: 2px solid #ddd; cursor: pointer; transition: all .2s; display: flex; align-items: center; gap: 10px;';

      const wordCount = deck.wordIds ? deck.wordIds.length : 0;
      item.innerHTML = `
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${deck.emoji} ${deck.name}</div>
          <div style="font-size: 12px; color: #999;">${wordCount} 個單字</div>
        </div>
        <div id="moveCheck_${idx}" style="font-size: 20px; opacity: 0; transition: opacity .2s;">✓</div>
      `;

      item.onmouseover = () => {
        item.style.background = '#f5f5f5';
        item.style.borderColor = '#2196F3';
      };

      item.onmouseout = () => {
        item.style.background = 'white';
        item.style.borderColor = '#ddd';
      };

      item.onclick = async () => {
        // 視覺反饋：亮起來
        item.style.background = '#2196F3';
        item.style.borderColor = '#1976D2';
        item.style.color = 'white';
        Array.from(item.children).forEach(child => child.style.color = 'white');
        document.getElementById(`moveCheck_${idx}`).style.opacity = '1';

        // 延遲執行轉移，讓用戶看到反饋
        setTimeout(async () => {
          await moveSelectedWords(deck.id, deck.name);
        }, 300);
      };

      deckList.appendChild(item);
    });
  }

  openModal('moveWordsModal');
}

async function moveSelectedWords(targetDeckId, targetDeckName) {
  console.log('[moveSelectedWords] 開始轉移...', { targetDeckId, targetDeckName });

  if (deleteWordState.selectedIds.size === 0) {
    showToast('❌ 請選擇要轉移的單字');
    return;
  }

  const sourceDeckId = fcCurrentDeckId;

  // 內置卡組（cap2000, weak）無法轉移 - 保持唯讀
  if (['cap2000', 'weak'].includes(sourceDeckId)) {
    showToast('❌ 內置卡組無法轉移');
    return;
  }

  const wordIds = Array.from(deleteWordState.selectedIds).map(id => parseInt(id) || id);
  const moveCount = wordIds.length;

  console.log('[moveSelectedWords] 準備轉移', { sourceDeckId, targetDeckId, wordIds: wordIds.length, moveCount });

  closeModal('moveWordsModal');
  showToast('⏳ 轉移中...');

  try {
    const isSourceCustom = !['cap2000', 'weak'].includes(sourceDeckId);
    const isTargetCustom = !['cap2000', 'weak'].includes(targetDeckId);

    // 無法轉移到內置卡組
    if (!isTargetCustom) {
      showToast('❌ 無法轉移到內置卡組');
      return;
    }

    // 獲取要轉移的單字（僅從自定義卡組）
    const movedWords = [];

    const sourceDeck = customDecks.find(d => d.id === sourceDeckId);
    if (!sourceDeck) {
      showToast('❌ 源卡組不存在');
      return;
    }

    // 保存要轉移的單字
    wordIds.forEach(id => {
      if (sourceDeck.words) {
        const word = sourceDeck.words.find(w => w.id === id);
        if (word) {
          movedWords.push({ ...word });
        }
      }
    });

    // 從源卡組移除
    sourceDeck.wordIds = sourceDeck.wordIds.filter(id => !wordIds.includes(id));
    if (sourceDeck.words) {
      sourceDeck.words = sourceDeck.words.filter(w => !wordIds.includes(w.id));
    }

    console.log('[moveSelectedWords] 從自定義卡組轉移');

    // 添加到目標卡組
    const targetDeck = customDecks.find(d => d.id === targetDeckId);
    if (!targetDeck) {
      showToast('❌ 目標卡組不存在');
      return;
    }

    // 初始化陣列
    if (!targetDeck.wordIds) targetDeck.wordIds = [];
    if (!targetDeck.words) targetDeck.words = [];

    // 添加轉移的單字
    movedWords.forEach(word => {
      if (!targetDeck.wordIds.includes(word.id)) {
        targetDeck.wordIds.push(word.id);
        if (!targetDeck.words.find(w => w.id === word.id)) {
          targetDeck.words.push(word);
        }
      }
    });

    console.log('[moveSelectedWords] 目標卡組已更新', {
      wordIdCount: targetDeck.wordIds.length,
      wordCount: targetDeck.words.length
    });

    // 保存自定義卡組
    saveCustomDecks();
    console.log('[moveSelectedWords] 已保存自定義卡組');

    // 清除選擇和刪除模式
    deleteWordState.selectedIds.clear();
    deleteWordState.isDeleteMode = false;
    const fcDeleteMode = document.getElementById('fcDeleteMode');
    if (fcDeleteMode) fcDeleteMode.style.display = 'none';
    updateDeleteCount();

    // 後台更新 UI
    setTimeout(() => {
      try {
        // 重新加載當前卡組
        let updatedStudyWords = [];
        const refreshDeck = customDecks.find(d => d.id === sourceDeckId);
        if (refreshDeck && refreshDeck.wordIds && refreshDeck.wordIds.length > 0) {
          updatedStudyWords = refreshDeck.wordIds
            .map(id => refreshDeck.words.find(w => w.id === id))
            .filter(Boolean);
        }

        STUDY_WORDS = updatedStudyWords.length > 0 ? updatedStudyWords : [EMPTY_WORD_TEMPLATE];

        // 更新字庫
        invalidateLibCache();
        if (readTab === 'library') {
          renderLib();
        }

        // 重新渲染卡片
        fcCardIndex = 0;
        if (STUDY_WORDS.length > 0 && STUDY_WORDS[0].id !== 'empty_template') {
          loadFlashcard(fcCardIndex);
        } else {
          document.getElementById('fcWord').textContent = '此卡組已無單字';
          document.getElementById('fcCard').classList.remove('flipped');
        }
        renderFlashcardList();

        console.log('[moveSelectedWords] UI 已更新');
      } catch (uiError) {
        console.error('[moveSelectedWords] UI 更新錯誤:', uiError);
      }
    }, 0);

    showToast(`✓ 已將 ${moveCount} 個單字轉移到「${targetDeckName}」`);
    console.log('[moveSelectedWords] 轉移完成');

  } catch (error) {
    console.error('[moveSelectedWords] 錯誤:', error);
    showToast('❌ 轉移失敗：' + error.message);
  }
}

// 初始化功能已移除 - 內置卡組保持唯讀

async function deleteSelectedWords() {
  if (deleteWordState.selectedIds.size === 0) {
    showToast('❌ 請選擇要刪除的單字');
    return;
  }

  // 確保卡組隔離：只能刪除當前卡組的單字
  if (deleteWordState.deckId !== fcCurrentDeckId) {
    showToast('❌ 卡組已改變，請重新打開刪除管理器');
    return;
  }

  // 內置卡組（cap2000, weak）無法刪除 - 保持唯讀
  if (['cap2000', 'weak'].includes(fcCurrentDeckId)) {
    showToast('❌ 內置卡組無法修改');
    return;
  }

  const confirmed = confirm(`確定要從「${document.getElementById('fcDeckName')?.textContent || '卡組'}」刪除 ${deleteWordState.selectedIds.size} 個單字嗎？此操作無法撤銷。`);
  if (!confirmed) return;

  const wordIds = Array.from(deleteWordState.selectedIds).map(id => parseInt(id) || id);
  const deckId = fcCurrentDeckId;

  // 立即隱藏刪除界面（提高響應速度）
  deleteWordState.selectedIds.clear();
  deleteWordState.isDeleteMode = false;
  document.getElementById('fcDeleteMode').style.display = 'none';
  updateDeleteCount();

  showToast('⏳ 刪除中...');

  try {
    const isCustomDeck = !['cap2000', 'weak'].includes(deckId);

      // 自定義卡組：調用後端 API 刪除
      if (isCustomDeck) {
        const response = await fetch('/api/words/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deck_id: deckId,
            word_ids: wordIds
          })
        });

        const result = await response.json();

        if (!result.success) {
          showToast('❌ 刪除失敗：' + (result.error || '未知錯誤'));
          return;
        }

        // 更新前端 customDecks
        const deck = customDecks.find(d => d.id === deckId);
        if (deck) {
          deck.wordIds = deck.wordIds.filter(id => !wordIds.includes(id));
          if (deck.words) {
            deck.words = deck.words.filter(w => !wordIds.includes(w.id));
          }
          saveCustomDecks();
        }
      }

    // 內置卡組也在前端過濾 STUDY_WORDS
    STUDY_WORDS = STUDY_WORDS.filter(w => !wordIds.includes(w.id));

    // 快速刷新當前頁面（不重新加載整個卡組）
    if (STUDY_WORDS.length === 0) {
      STUDY_WORDS = [EMPTY_WORD_TEMPLATE];
    }

    // 重置卡片索引
    if (fcCurrentIdx >= STUDY_WORDS.length) {
      fcCurrentIdx = Math.max(0, STUDY_WORDS.length - 1);
    }

    // 刷新當前卡片顯示
    loadFlashcard(fcCurrentIdx);
    updateRecordsList();

    showToast(`✓ 已刪除 ${wordIds.length} 個單字`);

  } catch (error) {
    console.error('[deleteSelectedWords] 錯誤:', error);
    showToast('❌ 網路錯誤，請重試');
  }
}

// ===== ADD WORD MODAL FUNCTIONS =====

// 全局狀態：新增單字
let addWordState = {
  mode: 'quick',        // 'quick' 或 'manual'
  currentDeckId: null,  // 目標卡組 ID
  searchResult: null,   // API 查詢結果
};

function openAddWordModal(deckId) {
  console.log('[openAddWordModal] 打開 Modal，deckId:', deckId);

  addWordState.currentDeckId = deckId;
  addWordState.mode = 'quick';
  addWordState.searchResult = null;

  // 重置快速模式表單
  const quickInput = document.getElementById('awmQuickInput');
  const quickPreview = document.getElementById('awmQuickPreview');
  const quickError = document.getElementById('awmQuickError');
  const quickLoading = document.getElementById('awmQuickLoading');

  if (quickInput) quickInput.value = '';
  if (quickPreview) quickPreview.style.display = 'none';
  if (quickError) quickError.style.display = 'none';
  if (quickLoading) quickLoading.style.display = 'none';

  // 重置手動模式表單
  const manualWord = document.getElementById('awmWord');
  const manualDef = document.getElementById('awmDef');
  const manualNote = document.getElementById('awmNote');

  if (manualWord) manualWord.value = '';
  if (manualDef) manualDef.value = '';
  if (manualNote) manualNote.value = '';

  // 重置模式為快速模式
  const quickPanel = document.getElementById('awmQuickPanel');
  const manualPanel = document.getElementById('awmManualPanel');

  if (quickPanel) quickPanel.classList.add('awm-panel-active');
  if (manualPanel) manualPanel.classList.remove('awm-panel-active');

  // 重置 Tab 樣式
  const tabs = document.querySelectorAll('.awm-tab');
  tabs.forEach(tab => tab.classList.remove('awm-tab-active'));
  if (tabs[0]) tabs[0].classList.add('awm-tab-active');

  // 打開 Modal
  const modal = document.getElementById('addWordModal');
  if (modal) {
    modal.classList.add('show');
    console.log('[openAddWordModal] ✓ Modal 已開啟');
  } else {
    console.error('[openAddWordModal] ✗ 找不到 Modal 元素');
  }
}

function switchAddWordMode(mode) {
  console.log('[switchAddWordMode] 切換模式到:', mode);
  addWordState.mode = mode;
  addWordState.searchResult = null;

  // 更新 Tab 樣式
  const tabs = document.querySelectorAll('.awm-tab');
  tabs.forEach((tab, idx) => {
    const isActive = (mode === 'quick' && idx === 0) || (mode === 'manual' && idx === 1);
    tab.classList.toggle('awm-tab-active', isActive);
  });

  // 切換面板
  const quickPanel = document.getElementById('awmQuickPanel');
  const manualPanel = document.getElementById('awmManualPanel');

  if (quickPanel) {
    quickPanel.classList.toggle('awm-panel-active', mode === 'quick');
  }
  if (manualPanel) {
    manualPanel.classList.toggle('awm-panel-active', mode === 'manual');
  }

  // 清空相應面板的內容
  if (mode === 'quick') {
    const quickInput = document.getElementById('awmQuickInput');
    const quickPreview = document.getElementById('awmQuickPreview');
    const quickError = document.getElementById('awmQuickError');
    if (quickInput) quickInput.value = '';
    if (quickPreview) quickPreview.style.display = 'none';
    if (quickError) quickError.style.display = 'none';
  } else if (mode === 'manual') {
    const manualWord = document.getElementById('awmWord');
    const manualDef = document.getElementById('awmDef');
    const manualNote = document.getElementById('awmNote');
    if (manualWord) manualWord.value = '';
    if (manualDef) manualDef.value = '';
    if (manualNote) manualNote.value = '';
  }
}

async function searchWordFromCambridge() {
  const query = document.getElementById('awmQuickInput').value.trim();

  if (!query) {
    showError('awmQuickError', '請輸入要查詢的單字');
    return;
  }

  // 顯示加載狀態
  document.getElementById('awmQuickLoading').style.display = 'block';
  document.getElementById('awmQuickPreview').style.display = 'none';
  document.getElementById('awmQuickError').style.display = 'none';

  try {
    const response = await fetch(`/api/words/search?query=${encodeURIComponent(query)}`);
    const data = await response.json();

    document.getElementById('awmQuickLoading').style.display = 'none';

    if (data.success) {
      addWordState.searchResult = data.data;
      displaySearchResult(data.data);
      document.getElementById('awmQuickPreview').style.display = 'block';
    } else {
      showError('awmQuickError', `查詢失敗: ${data.error}`);
    }
  } catch (error) {
    console.error('搜尋失敗:', error);
    document.getElementById('awmQuickLoading').style.display = 'none';
    showError('awmQuickError', '網路錯誤，請重試');
  }
}

function displaySearchResult(result) {
  document.getElementById('awpWord').textContent = result.word;

  // 音標格式化：/phonetic/（清理多餘的 // 符號）
  let phonetic = result.phonetic || '';
  if (phonetic) {
    phonetic = phonetic.replace(/^\/+/, '/').replace(/\/+$/, '/');
    if (!phonetic.startsWith('/')) phonetic = `/${phonetic}`;
    if (!phonetic.endsWith('/')) phonetic = `${phonetic}/`;
  }
  document.getElementById('awpPhonetic').textContent = phonetic || '—';

  document.getElementById('awpPos').textContent = result.pos ? `(${result.pos})` : '';

  // 顯示中文定義和英文定義
  let defHtml = '';
  if (result.definition_zh) {
    defHtml += `<div style="font-size:16px;color:var(--white);font-weight:600;margin-bottom:4px;">${result.definition_zh}</div>`;
  }
  if (result.definition) {
    defHtml += `<div style="font-size:12px;color:var(--gray);">${result.definition}</div>`;
  }
  document.getElementById('awpDef').innerHTML = defHtml || '<div style="color:var(--gray);">—</div>';

  // 顯示例句（不直接照抄劍橋字典，需要改寫）
  let exampleHtml = '';
  if (result.example_en && result.example_zh) {
    exampleHtml += `<div style="margin-bottom:6px;"><strong>例句:</strong> ${result.example_en}</div>`;
    exampleHtml += `<div style="font-size:12px;color:var(--gray);">${result.example_zh}</div>`;
  }
  document.getElementById('awpExample').innerHTML = exampleHtml || '<em>暫無例句</em>';
}

function showError(elementId, message) {
  const elem = document.getElementById(elementId);
  elem.textContent = message;
  elem.style.display = 'block';
}

async function submitAddWord() {
  if (!addWordState.currentDeckId) {
    showToast('❌ 未選擇卡組');
    return;
  }

  let wordData = {};

  if (addWordState.mode === 'quick') {
    // 從查詢結果取得
    if (!addWordState.searchResult) {
      showToast('❌ 請先查詢單字');
      return;
    }
    wordData = { ...addWordState.searchResult };
  } else {
    // 手動模式：word + definition + 備註
    const word = document.getElementById('awmWord').value.trim();
    const def = document.getElementById('awmDef').value.trim();
    const note = document.getElementById('awmNote').value.trim();

    if (!word) {
      showToast('❌ 請輸入英文單字');
      return;
    }
    if (!def) {
      showToast('❌ 請輸入中文解釋');
      return;
    }

    // 手動模式：備註不存放在 example_en（避免被當作例句）
    wordData = {
      word: word,
      phonetic: '',
      pos: '',
      definition: def,
      definition_zh: '',  // 手動模式不需要翻譯
      example_en: '',  // 手動模式不用
      example_zh: '',
      manual_note: note,  // 備註單獨存放
      source: 'user_input'
    };
  }

  // 驗證必要欄位
  if (!wordData.word || !wordData.definition) {
    showToast('❌ 單字和定義為必填');
    return;
  }

  console.log('[submitAddWord] 提交資料:', {
    deck_id: addWordState.currentDeckId,
    ...wordData
  });

  // 發送到後端
  try {
    const response = await fetch('/api/words/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deck_id: addWordState.currentDeckId,
        ...wordData
      })
    });

    const result = await response.json();
    console.log('[submitAddWord] 後端回應:', result);

    if (result.success) {
      // ===== 單字數量限制：每個卡組最多 2500 個 =====
      const isCustomDeck = !['cap2000', 'weak'].includes(addWordState.currentDeckId);
      const deck = customDecks.find(d => d.id === addWordState.currentDeckId) ||
                   BUILTIN_DECKS.find(d => d.id === addWordState.currentDeckId);

      if (deck) {
        let currentCount = 0;
        if (isCustomDeck) {
          currentCount = deck.wordIds ? deck.wordIds.length : 0;
        } else {
          // 內置卡組
          currentCount = deck.getWords ? deck.getWords().length : 0;
        }

        if (currentCount >= 2500) {
          showToast('❌ 此卡組已達上限 2500 個單字');
          return;
        }
      }

      showToast('✓ 單字已加入卡組');

      // 立即關閉 Modal（不等待後台操作）
      closeModal('addWordModal');

      // 在後台執行更新邏輯（不阻塞 UI）
      setTimeout(() => {
        // 更新前端 customDecks（用於自定義卡組）
        if (isCustomDeck && result.wordId) {
          const customDeck = customDecks.find(d => d.id === addWordState.currentDeckId);
          if (customDeck && !customDeck.wordIds.includes(result.wordId)) {
            // 添加 wordId
            customDeck.wordIds.push(result.wordId);

            // 保存完整的單字數據到本地卡組（確保卡組獨立）
            if (!customDeck.words) customDeck.words = [];

            const wordObj = {
              id: result.wordId,
              word: wordData.word,
              phonetic: wordData.phonetic || '',
              pos: wordData.pos || '',
              def: wordData.definition,
              definition: wordData.definition,
              definition_zh: wordData.definition_zh || '',
              example_en: wordData.example_en || '',
              example_zh: wordData.example_zh || '',
              manual_note: wordData.manual_note || '',
              source: wordData.source || 'unknown',
              tags: ['user_added'],
              frequency_rank: 9999
            };

            // 檢查是否已存在，避免重複
            if (!customDeck.words.find(w => w.id === result.wordId)) {
              customDeck.words.push(wordObj);
              console.log('[submitAddWord] ✓ 已添加單字到本地卡組:', wordObj);
            }

            saveCustomDecks();
            console.log('[submitAddWord] ✓ 已更新自定義卡組:', customDeck);
          }
        }

        // 更新 UI（字庫和卡片）
        invalidateLibCache();
        if (readTab === 'library') {
          renderLib();
        }

        // 重新加載卡組以顯示新單字
        startFlashcard(addWordState.currentDeckId);
      }, 0);
    } else {
      showToast(`❌ ${result.error || '新增失敗'}`);
    }
  } catch (error) {
    console.error('[submitAddWord] 提交失敗:', error);
    showToast('❌ 網路錯誤：' + error.message);
  }
}

// ════════════════════════════════
// 金幣系統（遊戲化首頁 v2）
// ════════════════════════════════

const GOLD_PER_CAT = { vocab:70, phrase:70, grammar:70, listening:120, reading:160, cloze:160 };
const GOLD_BONUS_ALL = 100;
function getGold() {
  if (typeof currentProfile !== 'undefined' && currentProfile) {
    return currentProfile.gold ?? 0;
  }
  return parseInt(localStorage.getItem('voca_gold') || '0');
}

function addGold(amount) {
  let next;
  if (typeof currentProfile !== 'undefined' && currentProfile) {
    next = (currentProfile.gold || 0) + amount;
    currentProfile.gold = next;
    if (typeof syncGold !== 'undefined') syncGold(next);
  } else {
    next = parseInt(localStorage.getItem('voca_gold') || '0') + amount;
    localStorage.setItem('voca_gold', next);
  }
  const el = document.getElementById('hGold');
  if (el) el.textContent = next.toLocaleString();
  return next;
}

function _awardSubjectGold(cat) {
  const reward = GOLD_PER_CAT[cat] || 0;
  if (!reward) return;
  addGold(reward);
  const catName = (CAT_META[cat] || {}).name || cat;
  showToast(`🪙 +${reward} 金幣！${catName}完成`);

  // 全科完成加碼
  const done = _dailyDoneRead();
  const allDone = Object.keys(DAILY_QUOTA).every(c =>
    (done[c] || []).length >= DAILY_QUOTA[c]
  );
  if (allDone) {
    setTimeout(() => {
      addGold(GOLD_BONUS_ALL);
      showToast('🎉 全科完成！+100 金幣獎勵！');
    }, 1600);
  }
}

// ── 首頁狀態更新 ──────────────────
function updateHomeScreen() {
  const done = _dailyDoneRead();
  const cats = Object.keys(DAILY_QUOTA);

  // 哪些科完成了
  const completedCats = cats.filter(c =>
    (done[c] || []).length >= DAILY_QUOTA[c]
  );
  const count = completedCats.length;

  // 金幣顯示
  const hGoldEl = document.getElementById('hGold');
  if (hGoldEl) hGoldEl.textContent = getGold().toLocaleString();

  // 六科 dot
  const subEl = document.getElementById('hmSubjects');
  if (subEl) {
    subEl.innerHTML = cats.map(cat => {
      const m = CAT_META[cat] || { icon: '📝', name: cat };
      const isDone = completedCats.includes(cat);
      return `<div class="hm-subj${isDone ? ' done' : ''}">
        <div class="hm-subj-name">${m.name}</div>
      </div>`;
    }).join('');
  }

  // 進度條
  const pct = count / cats.length * 100;
  const barEl = document.getElementById('hmQuestBar');
  if (barEl) barEl.style.width = pct + '%';
  const pctEl = document.getElementById('hmQuestPct');
  if (pctEl) pctEl.textContent = `${count}/${cats.length} 完成`;

  // 關卡樹
  renderLevelMap();
}

// ════════════════════════════════
// 首頁關卡樹：關卡 1-20（對應文法 20 章）由下往上，手繪水彩樹幹圖 + 果實按鈕
// 樹幹樹枝改用固定手繪圖片素材（public/images/icons/tree-segment.png），
// 每段圖片有 8 個枝點槽位，向上重複拼接蓋滿 20 關（不用擔心接縫，樹皮紋理本來就很適合重複）
// ════════════════════════════════
const LEVEL_COUNT = 20;
const TREE_SEG_IMG = 'public/images/icons/tree-segment.png';
const TREE_SEG_ASPECT = 1152 / 1966;   // 素材寬高比（寬/高），用來依容器寬度換算每段顯示高度
// 每段圖片內 8 個枝點槽位座標（目測估算，由下往上）
const TREE_SEG_SLOTS = [
  { x: 75, y: 58 },
  { x: 25, y: 48 },
  { x: 78, y: 44 },
  { x: 25, y: 33 },
  { x: 80, y: 28 },
  { x: 28, y: 20 },
  { x: 68, y: 18 },
  { x: 52, y: 10 },
];
const SLOTS_PER_SEG = TREE_SEG_SLOTS.length;

function onLevelClick(n) {
  grammarStartChapter(n);
}

function renderLevelMap() {
  const map = document.getElementById('hmLevelMap');
  if (!map) return;
  const W = map.clientWidth;
  if (!W) return;                                   // 尚未排版完成，等下次呼叫
  if (map.dataset.w === String(W)) return;          // 同寬度已畫過，避免切頁時重畫跳動
  const firstRender = !map.dataset.w;

  const segH = W / TREE_SEG_ASPECT;                              // 每段圖片依容器寬度等比例縮放後的高度
  const segCount = Math.ceil(LEVEL_COUNT / SLOTS_PER_SEG);       // 需要幾段圖片才蓋滿 20 關
  const H = segH * segCount;

  let segmentsHtml = '';
  let fruitsHtml = '';
  for (let s = 0; s < segCount; s++) {
    const segTop = H - (s + 1) * segH;    // 這段在整體容器裡的 top 位移
    segmentsHtml += `<img class="hm-tree-seg" src="${TREE_SEG_IMG}" style="top:${segTop}px;height:${segH}px" alt="">`;
    for (let slot = 0; slot < SLOTS_PER_SEG; slot++) {
      const n = s * SLOTS_PER_SEG + slot + 1;
      if (n > LEVEL_COUNT) break;
      const coord = TREE_SEG_SLOTS[slot];
      const x = coord.x / 100 * W;
      const y = segTop + coord.y / 100 * segH;
      const stars = (typeof grammarStarsFor === 'function' && typeof GRAMMAR_CHAPTERS !== 'undefined' && GRAMMAR_CHAPTERS[n]) ? grammarStarsFor(n) : 0;
      const starsHtml = (typeof GRAMMAR_CHAPTERS !== 'undefined' && GRAMMAR_CHAPTERS[n])
        ? `<span class="hm-fruit-stars">${[0,1,2].map(i => i < stars ? '★' : '<span class="off">★</span>').join('')}</span>`
        : '';
      fruitsHtml += `
        <button class="hm-fruit${n === 1 ? ' hm-fruit-cur' : ''}" style="left:${x}px;top:${y}px"
          onclick="onLevelClick(${n})" aria-label="關卡 ${n}">
          <span class="hm-fruit-num">${n}</span>
          ${starsHtml}
        </button>`;
    }
  }

  map.innerHTML = `<div class="hm-lm-inner" style="height:${H}px">${segmentsHtml}${fruitsHtml}</div>`;

  map.dataset.w = String(W);
  if (firstRender) map.scrollTop = map.scrollHeight;  // 初始定位在最下方（關卡 1）
}

// 視窗改變大小時重畫（保留滾動位置）
let _lmResizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(_lmResizeTimer);
  _lmResizeTimer = setTimeout(() => {
    const map = document.getElementById('hmLevelMap');
    if (!map || !map.dataset.w) return;
    const st = map.scrollTop;
    map.dataset.w = '';
    renderLevelMap();
    map.scrollTop = st;
  }, 150);
});

// 頁面載入時初始化首頁
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(updateHomeScreen, 200);
});

// ── 長圖自動分割（ratio > 1.4 則拆成上下兩半顯示）
function splitIfTall(img) {
  const ratio = img.naturalHeight / img.naturalWidth;
  if (ratio <= 1.4) return;
  const url = img.src;
  const halfPct = (ratio * 50).toFixed(2) + '%';
  const wrap = document.createElement('div');
  wrap.className = 'gx-split-wrap';
  ['0%', '100%'].forEach(pos => {
    const half = document.createElement('div');
    half.className = 'gx-split-half';
    half.style.cssText = `background-image:url("${url}");background-size:100% auto;background-position:center ${pos};background-repeat:no-repeat;padding-top:${halfPct};width:100%;border-radius:6px;cursor:zoom-in`;
    half.addEventListener('click', () => openLightbox(url));
    wrap.appendChild(half);
  });
  if (img.parentNode) img.parentNode.replaceChild(wrap, img);
}

// ── 文字段落放大 Lightbox ──
function openTxtLightbox(el, title) {
  document.getElementById('tlbTitle').textContent = title || '';
  document.getElementById('tlbBody').innerHTML = el.innerHTML;
  const lb = document.getElementById('txtLightbox');
  lb.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function closeTxtLightbox() {
  document.getElementById('txtLightbox').style.display = 'none';
  document.body.style.overflow = '';
}

// ── 圖片放大 Lightbox ──
function openLightbox(src) {
  const lb = document.getElementById('imgLightbox');
  const img = document.getElementById('ilbImg');
  if (!lb || !img) return;
  img.src = src;
  lb.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  const lb = document.getElementById('imgLightbox');
  if (!lb) return;
  lb.style.display = 'none';
  document.getElementById('ilbImg').src = '';
  document.body.style.overflow = '';
}
// ESC 鍵也可關閉（圖片 + 文字 lightbox）
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeLightbox(); closeTxtLightbox(); } });
// 事件委派：點擊任何試題圖片開啟 lightbox
document.addEventListener('click', e => {
  const img = e.target.closest('.gx-img, .gx-pimg');
  if (img && img.src) openLightbox(img.src);
});
