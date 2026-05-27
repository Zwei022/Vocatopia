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
    id:       w.id,
    word:     w.word,
    pos:      w.pos,
    def:      w.definition,
    ex:       w.example_en && w.example_zh ? `${w.example_en}\n${w.example_zh}` : (w.example_en || ''),
    tag:      (w.tags && w.tags[1]) || `Level ${w.level}`,
    phonetic: w.phonetic || '',
    st:       'new',
  };
}

async function loadWords() {
  try {
    const res  = await fetch('/api/words?limit=100');
    const data = await res.json();
    WORDS = data.map(normalizeWord);
    DICT  = Object.fromEntries(WORDS.map(w => [w.word, { def: w.def, phonetic: w.phonetic }]));
  } catch {
    console.warn('API unavailable, using fallback data');
    WORDS = FALLBACK_WORDS;
    DICT  = Object.fromEntries(WORDS.map(w => [w.word, { def: w.def, phonetic: w.phonetic }]));
  }
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
  if (id === 'study')   loadCard(curIdx);
  if (id === 'library') renderLib();
  if (id === 'reading') switchReadTab(readTab);
  if (id === 'arena') {
    document.getElementById('arenaLobby').style.display = 'flex';
    document.getElementById('arenaWait').style.display = 'none';
    document.getElementById('arenaBattle').style.display = 'none';
    if (pvpTimer) clearInterval(pvpTimer);
  }
  closeWordPopup();
}

// ── PIXEL CHAR ──
function updateChar(masteredCount) {
  const badge = document.getElementById('charBadge');
  const name  = document.getElementById('charName');
  if      (masteredCount >= 500) { badge.textContent = '閱讀守護者'; name.textContent = 'LV.4 騎士守護者'; }
  else if (masteredCount >= 100) { badge.textContent = '鐵劍備考者'; name.textContent = 'LV.3 戰士學徒';   }
  else if (masteredCount >= 20)  { badge.textContent = '勇敢的備考者'; name.textContent = 'LV.2 單字勇者'; }
  else                           { badge.textContent = '初來的備考者'; name.textContent = 'LV.1 單字學徒'; }
  const str = Math.min(12 + masteredCount * 0.5, 200);
  document.getElementById('aStr').textContent = Math.round(str);
  document.getElementById('fStr').style.width = Math.min(str / 200 * 100, 100) + '%';
}

// ── STUDY ──
function loadCard(idx) {
  revealed = false;
  const w = WORDS[idx];
  document.getElementById('wcWord').textContent = w.word;
  document.getElementById('wcPos').textContent  = w.pos;
  document.getElementById('wcDef').textContent  = w.def;
  document.getElementById('wcEx').textContent   = w.ex;
  document.getElementById('wcTag').textContent  = w.tag;
  document.getElementById('wcNum').textContent  = String(idx + 1).padStart(2, '0');
  document.getElementById('sessInfo').textContent = `第 ${idx + 1} / ${WORDS.length} 張`;
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
  const w = WORDS[curIdx];
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
  const mastered = WORDS.filter(w => w.st === 'ok').length;
  updateChar(mastered);
  document.getElementById('aStr').textContent = 12 + mastered;
  curIdx = (curIdx + 1) % WORDS.length;
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
  document.getElementById('rtabCurated').classList.toggle('active', tab === 'curated');
  document.getElementById('rtabDaily').classList.toggle('active', tab === 'daily');

  const artList    = document.getElementById('artList');
  const dailyList  = document.getElementById('dailyList');
  const artContent = document.getElementById('artContent');
  const quizPanel  = document.getElementById('quizPanel');
  const quizResult = document.getElementById('quizResult');

  artContent.classList.remove('show');
  quizPanel.classList.remove('show');
  quizResult.classList.remove('show');
  quizPanel.style.display = '';
  quizResult.style.display = '';

  if (tab === 'curated') {
    artList.style.display = 'flex';
    dailyList.classList.remove('show');
    renderArticles();
  } else {
    artList.style.display = 'none';
    dailyList.classList.add('show');
    renderDailyArticles();
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
  document.getElementById('quizOpts').innerHTML = q.options.map((opt, i) =>
    `<button class="quiz-opt" onclick="answerQuestion(${i})">${String.fromCharCode(65 + i)}. ${opt}</button>`
  ).join('');
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
  document.getElementById('artList').style.display = 'flex';
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
  document.getElementById('artList').style.display = 'flex';
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
  if (w && !capturedWords.includes(w)) { capturedWords.push(w); showToast(`✓ "${w}" 已加入不熟字卡！`); }
  else showToast('已在不熟字卡中');
  closeWordPopup();
}

// ── LIBRARY ──
function renderLib() {
  const arr = libMode === 'weak' ? WORDS.filter(w => w.st === 'lrn') : WORDS;
  document.getElementById('libList').innerHTML = arr.map((w, i) => `
    <div class="wrow">
      <div class="wr-num">${String(i + 1).padStart(2, '0')}</div>
      <div class="wr-dot wd-${w.st}"></div>
      <div class="wr-en">${w.word}</div>
      <div class="wr-zh">${w.def}</div>
      <div class="wr-spk" onclick="speak('${w.word}')">🔊</div>
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
  const loggedIn = (typeof initAuth !== 'undefined') ? await initAuth() : false;
  if (!loggedIn && typeof showAuthOverlay !== 'undefined') showAuthOverlay();

  await Promise.all([loadWords(), loadArticles(), loadDailyArticles()]);

  if (typeof loadUserWordStatus !== 'undefined') await loadUserWordStatus();

  PVP_QS = buildPvpQuestions(WORDS, 5);

  loadCard(0);
  renderLib();
  renderArticles();
  updateChar(0);
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
