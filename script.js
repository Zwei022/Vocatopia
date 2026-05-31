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

// ── DATA (loaded from API) ──
let WORDS    = [];   // populated by loadWords()
let ARTICLES = [];   // populated by loadArticles()
let DICT     = {};   // populated by loadWords()

// 從 API 正規化單字格式（DB 欄位 → 前端欄位）
function normalizeWord(w) {
  return {
    id:         w.id,
    word:       w.word,
    pos:        w.pos        || '',
    def:        w.definition || '',
    example_en: w.example_en || '',
    example_zh: w.example_zh || '',
    ex:         w.example_en && w.example_zh
                  ? `${w.example_en}\n${w.example_zh}`
                  : (w.example_en || ''),
    tag:        (w.tags && w.tags[1]) || `Level ${w.level || 1}`,
    phonetic:   w.phonetic   || '',
    level:      w.level      || 1,
    st:         'new',
  };
}

async function loadWords() {
  try {
    const BATCH = 500;
    let offset = 0;
    let all = [];
    while (true) {
      const res  = await fetch(`/api/words?limit=${BATCH}&offset=${offset}`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;
      all = all.concat(data.map(normalizeWord));
      if (data.length < BATCH) break;
      offset += BATCH;
    }
    WORDS = all;
    DICT  = Object.fromEntries(WORDS.map(w => [w.word, { def: w.def, phonetic: w.phonetic }]));
  } catch {
    console.warn('API unavailable, using fallback data');
    WORDS = FALLBACK_WORDS;
    DICT  = Object.fromEntries(WORDS.map(w => [w.word, { def: w.def, phonetic: w.phonetic }]));
  }
  // 若字庫畫面目前是開啟狀態，立刻重新渲染
  const libEl = document.getElementById('library');
  if (libEl && libEl.classList.contains('active')) renderLib();
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

let curIdx = 0, revealed = false, combo = 0, xp = 230, libMode = 'all';
let pvpYou = 0, pvpFoe = 0, pvpTimer = null, pvpQ = 0, capturedWords = [];
let PVP_QS = [];

// ── 角色屬性 STATS ────────────────────────────────────────────────
// STR 力量 = 單字練習量（每次翻牌 rate() +1）
// INT 智力 = 文章練習量（每次完成閱讀測驗 showQuizResult() +1）
// FAI 信仰 = 文法教學完成度（Grammar 功能上線後啟用）

const STATS = { str: 0, int: 0, fai: 0 };

function loadStats() {
  try {
    const s = JSON.parse(localStorage.getItem('voca_stats') || '{}');
    STATS.str = s.str || 0;
    STATS.int = s.int || 0;
    STATS.fai = s.fai || 0;
  } catch {}
}

function saveStats() {
  localStorage.setItem('voca_stats', JSON.stringify(STATS));
}

// ── DECK & STUDY-MODE STATE ──────────────────────────────────────
let STUDY_WORDS   = [];        // 當次練習的單字清單（來自 Deck 或全部）
let studyReturnTo = 'home';    // 'home' | 'wordcard'
let customDecks   = [];        // [{id,name,emoji,wordIds:[]}]
let _pendingCaptureWord = '';  // 捕捉選 Deck 時暫存的單字

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
function goScreen(id, btn) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.bn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (id === 'decks')      renderDecks();
  if (id === 'flashcard')  loadFlashcard(fcCurrentIdx);
  if (id === 'library')    renderLib();
  if (id === 'reading') { switchReadTab(readTab); }
  if (id === 'arena') {
    document.getElementById('arenaLobby').style.display = 'flex';
    document.getElementById('arenaWait').style.display = 'none';
    document.getElementById('arenaBattle').style.display = 'none';
    if (pvpTimer) clearInterval(pvpTimer);
  }
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
  document.getElementById('wcTag').textContent  = w.tag;
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

// ── ARENA ──
let roomCode = '';

function createRoom() {
  roomCode = String(Math.floor(100000 + Math.random() * 900000));
  document.getElementById('roomCodeBig').textContent = roomCode.slice(0, 3) + ' ' + roomCode.slice(3);
  document.getElementById('arenaLobby').style.display = 'none';
  document.getElementById('arenaWait').style.display  = 'flex';
}

function copyRoom() {
  navigator.clipboard && navigator.clipboard.writeText(roomCode);
  showToast('✓ 房號已複製！傳給同學開尬吧');
}

function openModal(id)  { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }

function confirmJoin() {
  const v = document.getElementById('joinInput').value;
  if (v.length === 6) { closeModal('joinModal'); startBattle(); }
  else showToast('⚠ 請輸入 6 位數房號');
}

function startBattle() {
  document.getElementById('arenaWait').style.display   = 'none';
  document.getElementById('arenaBattle').style.display = 'flex';
  document.getElementById('arenaBnav').style.display   = 'none';
  pvpYou = 0; pvpFoe = 0; pvpQ = 0;
  loadPvpQ();
}

function loadPvpQ() {
  if (pvpQ >= PVP_QS.length) { endBattle(); return; }
  const q = PVP_QS[pvpQ];
  document.getElementById('pvpQ').textContent = q.q;
  const opts = document.getElementById('pvpOpts');
  opts.innerHTML = q.opts.map((o, i) => `<button class="pvp-opt" onclick="answerPvp(${i})">${o}</button>`).join('');
  let t = 10;
  document.getElementById('pvpTimer').textContent = t;
  if (pvpTimer) clearInterval(pvpTimer);
  pvpTimer = setInterval(() => {
    t--;
    document.getElementById('pvpTimer').textContent = t;
    if (Math.random() < .3 && t < 8) { pvpFoe += 100; updatePvpBars(); }
    if (t <= 0) { clearInterval(pvpTimer); pvpQ++; setTimeout(loadPvpQ, 500); }
  }, 1000);
}

function answerPvp(idx) {
  clearInterval(pvpTimer);
  const q    = PVP_QS[pvpQ];
  const btns = document.querySelectorAll('.pvp-opt');
  btns[idx].classList.add(idx === q.ans ? 'correct' : 'wrong');
  btns[q.ans].classList.add('correct');
  if (idx === q.ans) pvpYou += 150;
  else pvpFoe += 80;
  updatePvpBars();
  pvpQ++;
  setTimeout(loadPvpQ, 900);
}

function updatePvpBars() {
  const yPct = Math.max(pvpYou / Math.max(pvpYou, pvpFoe) * 100, 5);
  const fPct = Math.max(pvpFoe / Math.max(pvpYou, pvpFoe) * 100, 5);
  document.getElementById('hpYou').style.width = yPct + '%';
  document.getElementById('hpFoe').style.width = fPct + '%';
  document.getElementById('scYou').textContent = pvpYou;
  document.getElementById('scFoe').textContent = pvpFoe;
}

function endBattle() {
  clearInterval(pvpTimer);
  const win = pvpYou >= pvpFoe;
  document.getElementById('pvpQ').textContent = win ? '⚔ 你贏了！單字力量大放送！' : '💀 敗北…再練習後捲土重來！';
  document.getElementById('pvpOpts').innerHTML = `<button class="pvp-opt" style="grid-column:1/-1;padding:18px;background:rgba(255,107,0,.15);border-color:var(--orange);color:var(--orange)" onclick="backArena()">返回競技場</button>`;
  document.getElementById('pvpTimer').textContent = win ? 'WIN' : '...';
  if (win) confetti();
}

function backArena() {
  document.getElementById('arenaBattle').style.display = 'none';
  document.getElementById('arenaLobby').style.display  = 'flex';
  document.getElementById('arenaBnav').style.display   = 'flex';
}

// ── READING TABS ──
function switchReadTab(tab) {
  readTab = tab;

  ['Grammar', 'Curated', 'Daily'].forEach(t =>
    document.getElementById('rtab' + t).classList.toggle('active', tab === t.toLowerCase())
  );

  const artList       = document.getElementById('artList');
  const dailyList     = document.getElementById('dailyList');
  const wordcardPanel = document.getElementById('wordcardPanel');
  const grammarPanel  = document.getElementById('grammarPanel');
  const artContent    = document.getElementById('artContent');
  const quizPanel     = document.getElementById('quizPanel');
  const quizResult    = document.getElementById('quizResult');

  artContent.classList.remove('show');
  quizPanel.classList.remove('show');
  quizResult.classList.remove('show');
  quizPanel.style.display  = '';
  quizResult.style.display = '';

  artList.style.display = 'none';
  dailyList.classList.remove('show');
  wordcardPanel.classList.remove('show');
  grammarPanel.classList.remove('show');

  if (tab === 'curated') {
    artList.style.display = '';
    renderArticles();
  } else if (tab === 'daily') {
    dailyList.classList.add('show');
    renderDailyArticles();
  } else if (tab === 'grammar') {
    grammarPanel.classList.add('show');
  }
}

// ── DAILY ARTICLES UI ──
function renderDailyArticles() {
  const el = document.getElementById('dailyList');
  if (DAILY_ARTICLES.length === 0) {
    el.innerHTML = `<div style="text-align:center;padding:40px 0;color:var(--gray);font-family:Nunito;font-weight:700">
      今日文章生成中…<br><span style="font-size:11px;margin-top:8px;display:block">通常在每天 00:05 自動更新</span>
    </div>`;
    return;
  }
  el.innerHTML = DAILY_ARTICLES.map(a => {
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

  // tokenize for word lookup
  const tokens = a.content.split(/([\s\n]+|[.,!?;:'"()]+)/);
  document.getElementById('artBody').innerHTML = tokens.map(t => {
    const clean = t.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (/^[a-zA-Z]{2,}$/.test(clean))
      return `<span class="w" onclick="lookupWord('${clean}')">${t}</span>`;
    return t.replace(/\n/g, '<br>');
  }).join('');

  document.getElementById('quizStartBtn').classList.remove('hidden');
  document.getElementById('dailyList').classList.remove('show');
  document.getElementById('artContent').classList.add('show');
  document.getElementById('artBackBtn').onclick = () => {
    document.getElementById('artContent').classList.remove('show');
    document.getElementById('dailyList').classList.add('show');
    closeWordPopup();
  };
}

// ── QUIZ FLOW ──
function startQuiz() {
  if (!currentDailyArticle?.questions?.length) {
    showToast('⚠ 題目載入中，請稍後');
    return;
  }
  quizState = {
    questions: currentDailyArticle.questions,
    idx:   0,
    score: 0,
  };
  document.getElementById('artContent').classList.remove('show');
  const panel = document.getElementById('quizPanel');
  panel.classList.remove('hidden');
  panel.classList.add('show');
  renderQuestion();
}

function renderQuestion() {
  const { questions, idx } = quizState;
  const q = questions[idx];
  document.getElementById('quizProgress').textContent = `第 ${idx + 1} / ${questions.length} 題`;
  document.getElementById('quizQ').textContent = q.question;
  document.getElementById('quizOpts').innerHTML = q.options.map((opt, i) => {
    const clean = opt.replace(/^[A-D][.、．]\s*/u, '');
    return `<button class="quiz-opt" onclick="answerQuestion(${i})">${String.fromCharCode(65 + i)}. ${clean}</button>`;
  }).join('');
  document.getElementById('quizExplain').classList.add('hidden');
  document.getElementById('quizNextBtn').classList.add('hidden');
}

function answerQuestion(chosen) {
  const { questions, idx } = quizState;
  const q    = questions[idx];
  const btns = document.querySelectorAll('.quiz-opt');

  btns.forEach(b => b.disabled = true);
  btns[chosen].classList.add(chosen === q.answer ? 'correct' : 'wrong');
  btns[q.answer].classList.add('correct');

  if (chosen === q.answer) {
    quizState.score++;
    showFb('正確！', true);
    navigator.vibrate && navigator.vibrate(30);
  } else {
    showFb('答錯了', false);
  }

  const explainEl = document.getElementById('quizExplain');
  explainEl.textContent = q.explanation;
  explainEl.classList.remove('hidden');

  const nextBtn = document.getElementById('quizNextBtn');
  const isLast  = idx >= questions.length - 1;
  nextBtn.textContent = isLast ? '查看成績 →' : '下一題 →';
  nextBtn.classList.remove('hidden');
}

function nextQuestion() {
  const { questions, idx } = quizState;
  if (idx >= questions.length - 1) {
    showQuizResult();
  } else {
    quizState.idx++;
    renderQuestion();
  }
}

function showQuizResult() {
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
    pct === 1   ? '全對！英文力量大增！' :
    pct >= 0.6  ? '不錯！繼續加油！' : '再讀一次，你會更強！';

  // INT 智力 +1（完成一篇文章測驗）
  STATS.int++;
  saveStats();
  updateChar();

  // 標記已完成
  if (currentDailyArticle) {
    const a = DAILY_ARTICLES.find(x => x.id === currentDailyArticle.id);
    if (a) { a._done = true; a._score = score; }
    if (typeof currentUser !== 'undefined' && currentUser) {
      authClient?.from('daily_article_progress').upsert({
        user_id:    currentUser.id,
        article_id: currentDailyArticle.id,
        score,
        completed:  true,
        done_at:    new Date().toISOString(),
      }, { onConflict: 'user_id,article_id' });
    }
  }
}

function closeQuiz() {
  document.getElementById('quizPanel').classList.remove('show');
  document.getElementById('artContent').classList.add('show');
}

function closeQuizResult() {
  const result = document.getElementById('quizResult');
  result.classList.remove('show');
  result.classList.add('hidden');
  document.getElementById('dailyList').classList.add('show');
  renderDailyArticles();
  currentDailyArticle = null;
}

// ── READING ──
function renderArticles() {
  document.getElementById('artList').style.display = '';
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
  const tokens = a.text.split(/([\s\n]+|[.,!?;:'"()]+)/);
  document.getElementById('artBody').innerHTML = tokens.map(t => {
    const clean = t.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (/^[a-zA-Z]{2,}$/.test(clean)) return `<span class="w" onclick="lookupWord('${clean}')">${t}</span>`;
    return t.replace(/\n/g, '<br>');
  }).join('');
  document.getElementById('artList').style.display = 'none';
  document.getElementById('artContent').classList.add('show');
}

function closeArticle() {
  document.getElementById('artContent').classList.remove('show');
  document.getElementById('artList').style.display = '';
  closeWordPopup();
}

function lookupWord(word) {
  const d = DICT[word] || { def: '（查閱中...）', phonetic: '' };
  document.getElementById('wpWord').textContent     = word;
  document.getElementById('wpPhonetic').textContent = d.phonetic;
  document.getElementById('wpDef').textContent      = d.def;
  document.getElementById('wordPopup').classList.add('show');
  document.getElementById('wordPopup')._word = word;
}

function closeWordPopup() { document.getElementById('wordPopup').classList.remove('show'); }

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

function loadCustomDecks() {
  try { customDecks = JSON.parse(localStorage.getItem('voca_custom_decks') || '[]'); }
  catch { customDecks = []; }
}

function saveCustomDecks() {
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
    const canStart  = total > 0;
    return `
    <div class="deck-card" onclick="${canStart ? `startDeckStudy('${deck.id}')` : ''}">
      <div class="deck-card-top">
        <div class="deck-emoji">${deck.emoji}</div>
        <div class="deck-info">
          <div class="deck-name">${deck.name}</div>
          <div class="deck-meta-row">
            <span class="deck-chip">${total > 0 ? total + ' 字' : '尚未加入單字'}</span>
          </div>
        </div>
      </div>
      <div class="deck-foot">
        <button class="deck-del-btn" onclick="event.stopPropagation();deleteDeck('${deck.id}')">🗑</button>
        <button class="deck-go-btn ${canStart ? '' : 'dim'}"
          onclick="${canStart ? `event.stopPropagation();startDeckStudy('${deck.id}')` : 'event.stopPropagation()'}">
          ${canStart ? '開始 ▶' : '讀文章後捕捉'}
        </button>
      </div>
    </div>`;
  }).join('');

  const hintHtml = customDecks.length === 0 ? `
    <div class="deck-hint">點選文章中的單字 →「＋ 加入單字卡」<br>即可捕捉到自建卡片中</div>` : '';

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
  const deck = { id: 'custom_' + Date.now(), name, emoji: selectedDeckEmoji, wordIds: [] };
  customDecks.push(deck);
  saveCustomDecks();
  closeModal('newDeckModal');
  setTimeout(() => startFlashcard(deck.id), 300);
}

function deleteDeck(id) {
  const deck = customDecks.find(d => d.id === id);
  if (!deck) return;
  customDecks = customDecks.filter(d => d.id !== id);
  saveCustomDecks();
  renderDecks();
  showToast(`已刪除「${deck.name}」`);
}

function startDeckStudy(deckId) {
  // 改為使用新的 flashcard 介面
  startFlashcard(deckId);
}

function studyGoBack() {
  // 永遠返回單字卡頁面
  goScreen('decks');
  // 補上 decks nav active 狀態
  document.querySelectorAll('.bn').forEach(b => b.classList.remove('active'));
  const decksBns = document.querySelectorAll('#decks .bnav .bn');
  if (decksBns[1]) decksBns[1].classList.add('active');
}

// ── LIBRARY ──
function renderLib() {
  const arr = libMode === 'weak' ? WORDS.filter(w => w.st === 'lrn') : WORDS;
  if (arr.length === 0) {
    document.getElementById('libList').innerHTML =
      libMode === 'weak'
        ? `<div style="text-align:center;padding:40px;color:var(--gray);font-family:Nunito;font-weight:700">目前沒有不熟的單字 👏</div>`
        : `<div style="text-align:center;padding:40px;color:var(--gray);font-family:Nunito;font-weight:700">載入中…</div>`;
    return;
  }
  document.getElementById('libList').innerHTML = arr.map((w, i) => `
    <div class="wrow" onclick="openWordDetail(${w.id})">
      <div class="wr-num">${String(i + 1).padStart(2, '0')}</div>
      <div class="wr-dot wd-${w.st}"></div>
      <div class="wr-en">${w.word}</div>
      <div class="wr-zh">${w.def || '—'}</div>
      <div class="wr-spk" onclick="event.stopPropagation();speak('${w.word}')">🔊</div>
    </div>`).join('');
}

function libSwitch(btn, mode) {
  document.querySelectorAll('.ltab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  libMode = mode;
  renderLib();
}

function speak(w) {
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(w);
    u.lang = 'en-US'; u.rate = .85;
    speechSynthesis.speak(u);
  }
}

// ── WORD DETAIL POPUP ────────────────────────────────────────────

let _wdWordId = null;

function openWordDetail(wordId) {
  const w = WORDS.find(x => x.id === wordId);
  if (!w) return;
  _wdWordId = wordId;

  // 詞性顏色
  const posColors = {
    '名詞':'#4488ff','動詞':'#3db870','形容詞':'#ff8c33','副詞':'#cc88ff',
    '連接詞':'#ffcc44','介系詞':'#88ccff','代名詞':'#ff7070',
    '助動詞':'#66bbaa','感嘆詞':'#ffaa44','限定詞':'#aaaaff','數詞':'#cccccc',
  };
  const posColor = posColors[w.pos] || 'var(--gray)';

  document.getElementById('wdWord').textContent    = w.word;
  document.getElementById('wdPhon').textContent    = w.phonetic   || '—';
  document.getElementById('wdPos').textContent     = w.pos        || '—';
  document.getElementById('wdPos').style.background= `${posColor}22`;
  document.getElementById('wdPos').style.color     = posColor;
  document.getElementById('wdDef').textContent     = w.def        || '（中文解釋補充中）';
  document.getElementById('wdLvl').textContent     = `Level ${w.level || 1}`;

  // 例句
  const hasEx = !!(w.example_en || w.example_zh);
  const exWrap = document.getElementById('wdExWrap');
  exWrap.style.display = hasEx ? 'block' : 'none';
  document.getElementById('wdExEn').textContent = w.example_en || '';
  document.getElementById('wdExZh').textContent = w.example_zh || '';

  // 狀態點
  document.getElementById('wdDot').className = `wr-dot wd-${w.st} wdot-lg`;

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
  const w = WORDS.find(x => x.id === _wdWordId);
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
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── CLICK OUTSIDE POPUP ──
document.addEventListener('click', e => {
  const pp = document.getElementById('wordPopup');
  if (pp.classList.contains('show') && !pp.contains(e.target) && !e.target.classList.contains('w'))
    closeWordPopup();
});

// ── INIT ──
(async function init() {
  loadCustomDecks();
  loadStats();

  const loggedIn = (typeof initAuth !== 'undefined') ? await initAuth() : false;
  if (!loggedIn && typeof showAuthOverlay !== 'undefined') showAuthOverlay();

  await Promise.all([loadWords(), loadArticles(), loadDailyArticles()]);

  if (typeof loadUserWordStatus !== 'undefined') await loadUserWordStatus();

  STUDY_WORDS = WORDS; // 預設全部單字
  PVP_QS      = buildPvpQuestions(WORDS, 5);

  loadCard(0);
  renderLib();
  renderArticles();
  updateChar();
})();

function buildPvpQuestions(words, count) {
  if (words.length < 4) return [];
  const shuffled = [...words].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map(w => {
    const wrong = words
      .filter(x => x.word !== w.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(x => x.def);
    const opts = [...wrong, w.def].sort(() => Math.random() - 0.5);
    return { q: `${w.word} 的中文？`, opts, ans: opts.indexOf(w.def) };
  });
}

// ── FLASHCARD（卡片播放介面） ────────────────────────────────────
let fcCurrentIdx = 0;
let fcFlipped = false;
let fcMarked = new Set();

function startFlashcard(deckId) {
  const builtin = BUILTIN_DECKS.find(d => d.id === deckId);
  if (builtin) {
    STUDY_WORDS = builtin.getWords();
  } else {
    const custom = customDecks.find(d => d.id === deckId);
    if (!custom) { showToast('找不到卡片'); return; }
    STUDY_WORDS = WORDS.filter(w => custom.wordIds.includes(w.id));
  }
  // 允許進入空卡組
  fcCurrentIdx = 0;
  fcFlipped = false;
  fcMarked.clear();
  loadFlashcard(0);
  updateRecordsList();
  goScreen('flashcard');
}

function loadFlashcard(idx) {
  if (!STUDY_WORDS.length) return;
  const w = STUDY_WORDS[idx];
  document.getElementById('fcWord').textContent = w.word;
  document.getElementById('fcPos').textContent = w.pos || 'n.';
  document.getElementById('fcPhonetic').textContent = w.phonetic || '';
  document.getElementById('fcDefinition').textContent = w.def || '未知';
  document.getElementById('fcBackPhonetic').textContent = w.phonetic || '';
  document.getElementById('fcExampleEn').textContent = w.example_en || 'No example.';
  document.getElementById('fcExampleZh').textContent = w.example_zh || '';
  document.getElementById('fcProgress').textContent = `${idx + 1} / ${STUDY_WORDS.length}`;
  const pct = ((idx + 1) / STUDY_WORDS.length) * 100;
  document.getElementById('fcProgressFill').style.width = pct + '%';
  document.getElementById('fcCard').classList.remove('flipped');
  fcFlipped = false;
  updateFcMarkBtn();
  updateRecordsList();
}

function flipCard() {
  const card = document.getElementById('fcCard');
  card.classList.toggle('flipped');
  fcFlipped = !fcFlipped;
}

function fcNextCard() {
  fcCurrentIdx = (fcCurrentIdx + 1) % STUDY_WORDS.length;
  loadFlashcard(fcCurrentIdx);
}

function fcPrevCard() {
  fcCurrentIdx = (fcCurrentIdx - 1 + STUDY_WORDS.length) % STUDY_WORDS.length;
  loadFlashcard(fcCurrentIdx);
}

function fcToggleMark() {
  const w = STUDY_WORDS[fcCurrentIdx];
  if (fcMarked.has(w.id)) {
    fcMarked.delete(w.id);
  } else {
    fcMarked.add(w.id);
  }
  updateFcMarkBtn();
  updateRecordsList();
}

function updateFcMarkBtn() {
  const w = STUDY_WORDS[fcCurrentIdx];
  const btn = document.getElementById('fcMarkBtn');
  const icon = document.getElementById('fcMarkIcon');
  if (fcMarked.has(w.id)) {
    btn.classList.add('marked');
    icon.textContent = '✕';
  } else {
    btn.classList.remove('marked');
    icon.textContent = '☆';
  }
}

function fcPlayAudio() {
  const w = STUDY_WORDS[fcCurrentIdx];
  const utterance = new SpeechSynthesisUtterance(w.word);
  utterance.rate = 0.9;
  speechSynthesis.speak(utterance);
}

function switchFlashcardMode(mode) {
  // 標示按鈕狀態
  document.querySelectorAll('.fc-mode-btn').forEach(b => b.classList.remove('fc-mode-active'));
  event.target.closest('.fc-mode-btn').classList.add('fc-mode-active');
  // TODO：實作各模式邏輯（測驗、聽力、速度）
  showToast(`🎯 ${['flip','quiz','listen','speed'][['flip','quiz','listen','speed'].indexOf(mode)]} 模式`);
}

function showFcSettings() {
  showToast('⚙ 設置（即將上線）');
}

function showSettings() {
  showToast('⚙ 應用設置（即將上線）');
}

function updateRecordsList() {
  if (!STUDY_WORDS || STUDY_WORDS.length === 0) return;

  const learnedList = STUDY_WORDS.filter(w => fcMarked.has(w.id));
  const unlearnedList = STUDY_WORDS.filter(w => !fcMarked.has(w.id));

  document.getElementById('countLearned').textContent = learnedList.length;
  document.getElementById('countUnlearned').textContent = unlearnedList.length;

  const currentTab = document.querySelector('.fc-record-tab.active')?.id || 'tabLearned';
  const items = currentTab === 'tabLearned' ? learnedList : unlearnedList;

  const listHtml = items.map(w => `
    <div class="fc-record-item" onclick="fcCurrentIdx = ${STUDY_WORDS.indexOf(w)}; loadFlashcard(fcCurrentIdx)">
      <span class="fc-record-word">${w.word}</span>
      <span class="fc-record-status">${w.def?.substring(0, 20)}...</span>
    </div>
  `).join('');

  document.getElementById('fcRecordsList').innerHTML = listHtml || '<div style="padding: 20px; text-align: center; color: #999;">沒有單字</div>';
}

function switchRecordTab(btn, tabName) {
  document.querySelectorAll('.fc-record-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  updateRecordsList();
}

function openAddWordModal() {
  showToast('➕ 新增單字（即將上線）');
}
