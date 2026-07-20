// ════════════════════════════════
// 文法教學系統（閱覽室「文法教學」分頁入口）
// 資料來源：/server/data/grammar_lessons.json
// 進度儲存：localStorage grammar_progress
// ════════════════════════════════

let GRAMMAR_CHAPTERS = {};
let _gmLoadFailed = false;

async function _gmLoadData() {
  try {
    const token = typeof getAuthToken === 'function' ? await getAuthToken() : null;
    const res = await fetch('/api/grammar-lessons', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    GRAMMAR_CHAPTERS = await res.json();
    _gmLoadFailed = false;
  } catch (e) {
    console.error('文法資料載入失敗', e);
    GRAMMAR_CHAPTERS = {};
    _gmLoadFailed = true;
  }
  _gmForceLevelMapRedraw();
}
_gmLoadData();

// 資料剛載入完成時，若閱覽室的文法教學列表已經畫過（星數未反映），重畫一次
function _gmForceLevelMapRedraw() {
  if (typeof renderGrammarLessonsList === 'function' && document.getElementById('lessonsPanel')?.classList.contains('show')) {
    renderGrammarLessonsList();
  }
}

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
  // 若閱覽室的文法教學列表正開著，關閉時順便刷新打勾狀態
  if (typeof renderGrammarLessonsList === 'function' && document.getElementById('lessonsPanel')?.classList.contains('show')) {
    renderGrammarLessonsList();
  }
}
function _gmEsc(s) {
  return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── 章節畫面：小節清單
// #2 達到指定等級才解鎖的小節：點擊時提示需要的等級（訂閱可全解）
function gmShowLockedHint(level) {
  if (typeof showToast === 'function') showToast(`🔒 達到 Lv.${level} 解鎖此小節，或訂閱直接全部解鎖`, 3500);
}

function grammarStartChapter(n) {
  const ch = GRAMMAR_CHAPTERS[n];
  // #2 逐節解鎖：允許進入任何章節查看小節清單（含未解鎖的，顯示所需等級），不再整章擋在門外
  const ov = _gmOverlay();
  ov.style.display = 'flex';
  if (typeof showFeatureHint === 'function') showFeatureHint('grammar');
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
    const locked = !!s.locked;                 // #2 等級未達解鎖
    const ready  = !!s.teaching;               // 有教學內容（未解鎖的節伺服器不會回內容）
    const starsHtml = [0,1,2].map(i => `<span class="${i < stars ? 'on' : 'off'}">★</span>`).join('');
    let action, right;
    if (locked) {
      action = `gmShowLockedHint(${s.unlockLevel || 1})`;
      right  = `<span class="gm-sub-locklv">🔒 Lv.${s.unlockLevel || 1}</span>`;
    } else if (ready) {
      action = `gmOpenSubLesson(${ch.chapterId}, '${s.id}')`;
      right  = starsHtml;
    } else {
      action = `showToast('🌱 這個小節還在準備中')`;
      right  = '🔒';
    }
    return `
      <button class="gm-sub-row${(locked || !ready) ? ' gm-sub-locked' : ''}" onclick="${action}">
        <span class="gm-sub-id">${s.id}</span>
        <span class="gm-sub-title">${_gmEsc(s.title)}</span>
        <span class="gm-sub-stars">${right}</span>
      </button>`;
  }).join('');
  ov.innerHTML = `
    <div class="gm-topbar">
      <button class="gm-back" onclick="gmClose()">← 返回</button>
      <span class="gm-topbar-title">第${ch.chapterId}章・${_gmEsc(ch.title)}</span>
    </div>
    <div class="gm-sub-list">${rows}</div>`;
}

// 把原本一整坨 <b>標題</b><br>內容<br>• 條列...<br><br> 的教學說明文字，
// 拆成「標題卡片 + 條列區塊」的結構，取代原本的長段落 wall-of-text。
// 前提：raw 已經先跑過 wrapWordsPreserveHtml()，內部可能夾雜 <span class="w">…</span>，
// 但不影響這裡的切割（分隔符 <br><br>／<br>／行首符號都在 span 之外）。
function _gmStructureExplain(raw) {
  const sections = String(raw || '').split(/<br>\s*<br>/i).filter(s => s.trim());
  return sections.map(section => {
    const m = section.match(/^\s*<b>([\s\S]*?)<\/b>\s*<br>?/i);
    let heading = '', body = section;
    if (m) { heading = m[1]; body = section.slice(m[0].length); }

    const lines = body.split(/<br>/i).map(l => l.trim()).filter(l => l);
    const linesHtml = lines.map(line => {
      if (/^　*例[：:]/.test(line) || /^　/.test(line)) {
        return `<div class="gm-explain-subitem">${line.replace(/^　+/, '')}</div>`;
      }
      if (/^[•‧・]/.test(line)) {
        return `<div class="gm-explain-bullet">${line.replace(/^[•‧・]\s*/, '')}</div>`;
      }
      if (/^[①②③④⑤⑥⑦⑧⑨]/.test(line)) {
        return `<div class="gm-explain-bullet gm-explain-bullet-num">${line}</div>`;
      }
      return `<div class="gm-explain-line">${line}</div>`;
    }).join('');

    return `<div class="gm-explain-section">
      ${heading ? `<div class="gm-explain-heading">${heading}</div>` : ''}
      <div class="gm-explain-body">${linesHtml}</div>
    </div>`;
  }).join('');
}

// ── 教學卡片畫面
let _gmCurrentCtx = null; // { chapterId, subId }

function gmOpenSubLesson(chapterId, subId) {
  const ch = GRAMMAR_CHAPTERS[chapterId];
  const sub = ch && ch.subLessons.find(s => s.id === subId);
  if (!sub || !sub.teaching) return;
  _gmCurrentCtx = { chapterId, subId };
  const t = sub.teaching;
  const examplesHtml = (t.examples || []).map((ex, i) => `
    <div class="gm-example">
      <div style="display:flex;align-items:flex-start;gap:6px;">
        <div class="gm-example-en" style="flex:1">${wrapWordsHtml(ex.en)}</div>
        <button class="spk-btn" onclick="gmSpeakExample(${i},this)" title="朗讀例句" style="flex-shrink:0;background:none;border:none;cursor:pointer;font-size:15px;">🔊</button>
      </div>
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
        <div class="gm-teach-explain">${_gmStructureExplain(wrapWordsPreserveHtml(t.explanation))}</div>
        <div class="gm-example-group-lbl">例句</div>
        ${examplesHtml}
      </div>
      <button class="gm-cta" onclick="gmStartQuiz()">開始隨堂測驗 →</button>
    </div>`;
}

function gmSpeakExample(i, btn) {
  if (!_gmCurrentCtx) return;
  const { chapterId, subId } = _gmCurrentCtx;
  const ch = GRAMMAR_CHAPTERS[chapterId];
  const sub = ch && ch.subLessons.find(s => s.id === subId);
  const ex = sub && sub.teaching && sub.teaching.examples && sub.teaching.examples[i];
  if (!ex) return;
  speakSentence('grammar', `${subId}_${i}`, ex.en, btn);
}

// ── 測驗畫面：10題文法選擇（mc）→ 5題克漏字題組（cloze）兩階段
let _gmQuizState = null;
// { mcList, mcIdx, mcCorrect, mcAnswered, cloze, clozeAnswered:{n:i}, clozeCorrect }

function gmStartQuiz() {
  const { chapterId, subId } = _gmCurrentCtx;
  const ch = GRAMMAR_CHAPTERS[chapterId];
  const sub = ch.subLessons.find(s => s.id === subId);
  const quiz = sub.quiz || {};
  _gmQuizState = {
    mcList: quiz.mc || [],
    mcIdx: 0,
    mcCorrect: 0,
    mcAnswered: false,
    cloze: quiz.cloze || null,
    clozeAnswered: {},
    clozeCorrect: 0,
  };
  if (_gmQuizState.mcList.length) _gmRenderMcQuestion();
  else if (_gmQuizState.cloze) _gmRenderCloze();
  else _gmFinishQuiz();
}

function _gmQuizTopbar(titleText) {
  return `
    <div class="gm-topbar gm-topbar-quiz">
      <span class="gm-topbar-title">${titleText}</span>
      <button class="gm-quiz-close" onclick="gmClose()" aria-label="退出測驗">✕</button>
    </div>`;
}

function _gmRenderMcQuestion() {
  const st = _gmQuizState;
  const q = st.mcList[st.mcIdx];
  const optsHtml = q.options.map((opt, i) =>
    `<button class="gm-quiz-opt" id="gmOpt${i}" onclick="gmAnswer(${i})">${String.fromCharCode(65 + i)}. ${_gmEsc(opt)}</button>`
  ).join('');
  const ov = _gmOverlay();
  ov.innerHTML = `
    ${_gmQuizTopbar(`文法測驗 ${st.mcIdx + 1}/${st.mcList.length}`)}
    <div class="gm-quiz-wrap">
      <div class="gm-quiz-sentence">${_gmEsc(q.sentence)}</div>
      <div class="gm-quiz-opts">${optsHtml}</div>
      <div class="gm-quiz-explain" id="gmExplain" style="display:none"></div>
      <button class="gm-cta" id="gmNextBtn" style="display:none" onclick="_gmNextMc()">下一題 →</button>
    </div>`;
}

function gmAnswer(i) {
  const st = _gmQuizState;
  if (st.mcAnswered) return;
  st.mcAnswered = true;
  const q = st.mcList[st.mcIdx];
  const correct = i === q.answer;
  if (correct) st.mcCorrect++;
  q.options.forEach((_, oi) => {
    const btn = document.getElementById('gmOpt' + oi);
    btn.disabled = true;
    if (oi === q.answer) btn.classList.add('gm-correct');
    else if (oi === i) btn.classList.add('gm-wrong');
  });
  const zh = (q.optionsZh && q.optionsZh[q.answer]) ? _gmEsc(q.optionsZh[q.answer]) : '';
  const explainEl = document.getElementById('gmExplain');
  explainEl.style.display = 'block';
  explainEl.innerHTML = `${correct ? '✅ 答對了！' : '❌ 答錯了'} 正解 ${String.fromCharCode(65 + q.answer)} ${zh}<br>${_gmEsc(q.explanation)}`;
  document.getElementById('gmNextBtn').style.display = 'block';
}

function _gmNextMc() {
  const st = _gmQuizState;
  st.mcIdx++;
  st.mcAnswered = false;
  if (st.mcIdx >= st.mcList.length) {
    if (st.cloze) return _gmRenderCloze();
    return _gmFinishQuiz();
  }
  _gmRenderMcQuestion();
}

// ── 克漏字題組（沿用 question_bank_cloze.json 的 passage + blanks 結構）
function _gmRenderCloze() {
  const st = _gmQuizState;
  const c = st.cloze;
  const passageHtml = _gmEsc(c.passage).replace(/__\((\d)\)__/g, (m, n) =>
    `<span class="gm-cloze-blank" id="gmBlankMark${n}">(${n})</span>`);
  const blocksHtml = c.blanks.map(b => {
    const optsHtml = b.options.map((opt, i) =>
      `<button class="gm-quiz-opt gm-cloze-opt" id="gmClozeOpt${b.n}_${i}" onclick="gmClozeAnswer(${b.n},${i})">${String.fromCharCode(65 + i)}. ${_gmEsc(opt)}</button>`
    ).join('');
    return `
      <div class="gm-cloze-block">
        <div class="gm-cloze-num">第 (${b.n}) 格</div>
        <div class="gm-quiz-opts">${optsHtml}</div>
        <div class="gm-quiz-explain" id="gmClozeExplain${b.n}" style="display:none"></div>
      </div>`;
  }).join('');
  const ov = _gmOverlay();
  ov.innerHTML = `
    ${_gmQuizTopbar('克漏字題組')}
    <div class="gm-quiz-wrap">
      ${c.title ? `<div class="gm-cloze-title">${_gmEsc(c.title)}</div>` : ''}
      <div class="gm-cloze-passage">${passageHtml}</div>
      ${blocksHtml}
      <button class="gm-cta" id="gmClozeFinishBtn" style="display:none" onclick="_gmFinishQuiz()">完成測驗 →</button>
    </div>`;
}

function gmClozeAnswer(n, i) {
  const st = _gmQuizState;
  if (st.clozeAnswered[n] !== undefined) return;
  const blank = st.cloze.blanks.find(b => b.n === n);
  st.clozeAnswered[n] = i;
  const correct = i === blank.answer;
  if (correct) st.clozeCorrect++;
  blank.options.forEach((_, oi) => {
    const btn = document.getElementById(`gmClozeOpt${n}_${oi}`);
    btn.disabled = true;
    if (oi === blank.answer) btn.classList.add('gm-correct');
    else if (oi === i) btn.classList.add('gm-wrong');
  });
  const zh = (blank.optionsZh && blank.optionsZh[blank.answer]) ? _gmEsc(blank.optionsZh[blank.answer]) : '';
  const explainEl = document.getElementById(`gmClozeExplain${n}`);
  explainEl.style.display = 'block';
  explainEl.innerHTML = `${correct ? '✅ 答對了！' : '❌ 答錯了'} 正解 ${String.fromCharCode(65 + blank.answer)} ${zh}<br>${_gmEsc(blank.explanation)}`;
  const markEl = document.getElementById(`gmBlankMark${n}`);
  if (markEl) markEl.classList.add(correct ? 'gm-blank-correct' : 'gm-blank-wrong');

  if (Object.keys(st.clozeAnswered).length >= st.cloze.blanks.length) {
    const btn = document.getElementById('gmClozeFinishBtn');
    if (btn) btn.style.display = 'block';
  }
}

function _gmFinishQuiz() {
  const st = _gmQuizState;
  const totalQ = st.mcList.length + (st.cloze ? st.cloze.blanks.length : 0);
  const totalCorrect = st.mcCorrect + st.clozeCorrect;
  const acc = totalQ ? totalCorrect / totalQ : 0;
  let stars = 1;
  if (acc >= 1) stars = 3;
  else if (acc >= 0.5) stars = 2;
  const { chapterId, subId } = _gmCurrentCtx;
  const progress = _gmLoadProgress();
  const prevStars = (progress[subId] && progress[subId].stars) || 0;
  progress[subId] = { stars: Math.max(prevStars, stars), lastAcc: acc };
  _gmSaveProgress(progress);
  _gmForceLevelMapRedraw();

  const starsHtml = [0,1,2].map(i => `<span class="${i < stars ? 'on' : 'off'}">★</span>`).join('');
  const ov = _gmOverlay();
  ov.innerHTML = `
    <div class="gm-result">
      <div class="gm-result-stars">${starsHtml}</div>
      <div class="gm-result-acc">正確率 ${Math.round(acc * 100)}%（${totalCorrect}/${totalQ}）</div>
      <button class="gm-cta" onclick="grammarStartChapter(${chapterId})">回小節清單</button>
      <button class="gm-cta gm-cta-ghost" onclick="gmClose()">返回首頁</button>
    </div>`;
}
