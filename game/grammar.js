// ════════════════════════════════
// 文法教學系統（首頁關卡樹入口，取代原塔防遊戲）
// 資料來源：/server/data/grammar_lessons.json
// 進度儲存：localStorage grammar_progress
// ════════════════════════════════

let GRAMMAR_CHAPTERS = {};

async function _gmLoadData() {
  try {
    const res = await fetch('/server/data/grammar_lessons.json');
    GRAMMAR_CHAPTERS = await res.json();
  } catch (e) {
    console.error('文法資料載入失敗', e);
    GRAMMAR_CHAPTERS = {};
  }
  // 資料到位時首頁關卡樹可能已畫過（星數未反映），強制重畫一次
  const map = document.getElementById('hmLevelMap');
  if (map && map.dataset.w) {
    delete map.dataset.w;
    if (typeof renderLevelMap === 'function') renderLevelMap();
  }
}
_gmLoadData();

// ── 進度儲存
const GM_PROGRESS_KEY = 'grammar_progress';
function _gmLoadProgress() {
  try { return JSON.parse(localStorage.getItem(GM_PROGRESS_KEY)) || {}; }
  catch { return {}; }
}
function _gmSaveProgress(p) {
  localStorage.setItem(GM_PROGRESS_KEY, JSON.stringify(p));
}
function _gmSubStars(subId) {
  const p = _gmLoadProgress();
  return (p[subId] && p[subId].stars) || 0;
}
// 章節星等：小節星數加總 ÷ 滿分，30%/60%/100% 對應 1/2/3 星
function grammarStarsFor(chapterId) {
  const ch = GRAMMAR_CHAPTERS[chapterId];
  if (!ch || !ch.subLessons.length) return 0;
  const maxStars = ch.subLessons.length * 3;
  const earned = ch.subLessons.reduce((sum, s) => sum + _gmSubStars(s.id), 0);
  const pct = earned / maxStars;
  if (pct >= 1)   return 3;
  if (pct >= 0.6) return 2;
  if (pct >= 0.3) return 1;
  return 0;
}

function _gmOverlay() { return document.getElementById('grammarOverlay'); }
function gmClose() {
  const ov = _gmOverlay();
  ov.style.display = 'none';
  ov.innerHTML = '';
}
function _gmEsc(s) {
  return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── 章節畫面：小節清單
function grammarStartChapter(n) {
  const ov = _gmOverlay();
  ov.style.display = 'flex';
  const ch = GRAMMAR_CHAPTERS[n];
  if (!ch) {
    ov.innerHTML = `
      <div class="gm-topbar">
        <button class="gm-back" onclick="gmClose()">← 返回</button>
        <span class="gm-topbar-title">關卡 ${n}</span>
      </div>
      <div class="gm-empty">🌱 這個章節還在準備中，敬請期待！</div>`;
    return;
  }
  const rows = ch.subLessons.map(s => {
    const stars = _gmSubStars(s.id);
    const ready = !!s.teaching;
    const starsHtml = [0,1,2].map(i => `<span class="${i < stars ? 'on' : 'off'}">★</span>`).join('');
    const action = ready
      ? `gmOpenSubLesson(${ch.chapterId}, '${s.id}')`
      : `showToast('🌱 這個小節還在準備中')`;
    return `
      <button class="gm-sub-row${ready ? '' : ' gm-sub-locked'}" onclick="${action}">
        <span class="gm-sub-id">${s.id}</span>
        <span class="gm-sub-title">${_gmEsc(s.title)}</span>
        <span class="gm-sub-stars">${ready ? starsHtml : '🔒'}</span>
      </button>`;
  }).join('');
  ov.innerHTML = `
    <div class="gm-topbar">
      <button class="gm-back" onclick="gmClose()">← 返回</button>
      <span class="gm-topbar-title">第${ch.chapterId}章・${_gmEsc(ch.title)}</span>
    </div>
    <div class="gm-sub-list">${rows}</div>`;
}

// ── 教學卡片畫面
let _gmCurrentCtx = null; // { chapterId, subId }

function gmOpenSubLesson(chapterId, subId) {
  const ch = GRAMMAR_CHAPTERS[chapterId];
  const sub = ch && ch.subLessons.find(s => s.id === subId);
  if (!sub || !sub.teaching) return;
  _gmCurrentCtx = { chapterId, subId };
  const t = sub.teaching;
  const examplesHtml = (t.examples || []).map(ex => `
    <div class="gm-example">
      <div class="gm-example-en">${_gmEsc(ex.en)}</div>
      <div class="gm-example-zh">${_gmEsc(ex.zh)}</div>
    </div>`).join('');
  const ov = _gmOverlay();
  ov.innerHTML = `
    <div class="gm-topbar">
      <button class="gm-back" onclick="grammarStartChapter(${chapterId})">← 返回</button>
      <span class="gm-topbar-title">${sub.id}・${_gmEsc(sub.title)}</span>
    </div>
    <div class="gm-teach-scroll">
      <div class="gm-teach-card">
        <div class="gm-teach-explain">${t.explanation}</div>
        ${examplesHtml}
      </div>
      <button class="gm-cta" onclick="gmStartQuiz()">開始隨堂測驗 →</button>
    </div>`;
}

// ── 測驗畫面
let _gmQuizState = null; // { list, idx, correctCount, answered }

function gmStartQuiz() {
  const { chapterId, subId } = _gmCurrentCtx;
  const ch = GRAMMAR_CHAPTERS[chapterId];
  const sub = ch.subLessons.find(s => s.id === subId);
  _gmQuizState = { list: sub.quiz, idx: 0, correctCount: 0, answered: false };
  _gmRenderQuizQuestion();
}

function _gmRenderQuizQuestion() {
  const st = _gmQuizState;
  const q = st.list[st.idx];
  const optsHtml = q.options.map((opt, i) =>
    `<button class="gm-quiz-opt" id="gmOpt${i}" onclick="gmAnswer(${i})">${String.fromCharCode(65 + i)}. ${_gmEsc(opt)}</button>`
  ).join('');
  const ov = _gmOverlay();
  ov.innerHTML = `
    <div class="gm-topbar">
      <span class="gm-topbar-title">隨堂測驗 ${st.idx + 1}/${st.list.length}</span>
    </div>
    <div class="gm-quiz-wrap">
      <div class="gm-quiz-sentence">${_gmEsc(q.sentence)}</div>
      <div class="gm-quiz-opts">${optsHtml}</div>
      <div class="gm-quiz-explain" id="gmExplain" style="display:none"></div>
      <button class="gm-cta" id="gmNextBtn" style="display:none" onclick="_gmNextQuestion()">下一題 →</button>
    </div>`;
}

function gmAnswer(i) {
  const st = _gmQuizState;
  if (st.answered) return;
  st.answered = true;
  const q = st.list[st.idx];
  const correct = i === q.answer;
  if (correct) st.correctCount++;
  q.options.forEach((_, oi) => {
    const btn = document.getElementById('gmOpt' + oi);
    btn.disabled = true;
    if (oi === q.answer) btn.classList.add('gm-correct');
    else if (oi === i) btn.classList.add('gm-wrong');
  });
  const zh = (q.optionsZh && q.optionsZh[q.answer]) ? `（${_gmEsc(q.optionsZh[q.answer])}）` : '';
  const explainEl = document.getElementById('gmExplain');
  explainEl.style.display = 'block';
  explainEl.innerHTML = `${correct ? '✅ 答對了！' : '❌ 答錯了'} 正解 ${String.fromCharCode(65 + q.answer)} ${zh}<br>${_gmEsc(q.explanation)}`;
  document.getElementById('gmNextBtn').style.display = 'block';
}

function _gmNextQuestion() {
  const st = _gmQuizState;
  st.idx++;
  st.answered = false;
  if (st.idx >= st.list.length) return _gmFinishQuiz();
  _gmRenderQuizQuestion();
}

function _gmFinishQuiz() {
  const st = _gmQuizState;
  const acc = st.correctCount / st.list.length;
  let stars = 1;
  if (acc >= 1) stars = 3;
  else if (acc >= 0.5) stars = 2;
  const { chapterId, subId } = _gmCurrentCtx;
  const progress = _gmLoadProgress();
  const prevStars = (progress[subId] && progress[subId].stars) || 0;
  progress[subId] = { stars: Math.max(prevStars, stars), lastAcc: acc };
  _gmSaveProgress(progress);

  const starsHtml = [0,1,2].map(i => `<span class="${i < stars ? 'on' : 'off'}">★</span>`).join('');
  const ov = _gmOverlay();
  ov.innerHTML = `
    <div class="gm-result">
      <div class="gm-result-stars">${starsHtml}</div>
      <div class="gm-result-acc">正確率 ${Math.round(acc * 100)}%（${st.correctCount}/${st.list.length}）</div>
      <button class="gm-cta" onclick="grammarStartChapter(${chapterId})">回小節清單</button>
      <button class="gm-cta gm-cta-ghost" onclick="gmClose()">返回首頁</button>
    </div>`;
}
