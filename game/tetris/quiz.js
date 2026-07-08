// ════════════════════════════════
// 俄羅斯方塊 — 題目流程 / 計時題循環 / 角色技能
// 依賴：game.js（ttGame 狀態、ttRender、ttEndGame）、vocab.js（出題）
// ════════════════════════════════

// 計分
const TT_WORD_CORRECT = 50;   // 消行快問答對
const TT_WORD_WRONG   = -30;  // 消行快問答錯
const TT_SENT_CORRECT = 150;  // 60秒計時題答對（答錯改為鎖底層一整欄）

const TT_WORD_SECONDS = 5;    // 消行快問限時
const TT_SENT_SECONDS = 40;   // 計時題限時
const TT_TIMED_PERIOD = 60000; // 每 60 秒出一題計時題

function _ttEscHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ── 通用題目彈層 ──
// opts: { q, seconds, timed, onResolve(correct) }
function ttShowQuiz(opts) {
  if (!ttGame || ttGame.gameOver) return false;
  if (ttGame.quiz && ttGame.quiz.active) return false; // 已有題目在進行，忽略
  const { q, seconds, timed, onResolve } = opts;
  if (!q) return false;

  // 暫停遊戲
  ttGame.paused = true;
  clearInterval(ttGame.gravityInt);

  ttGame.quiz = {
    active: true, answered: false, timed: !!timed,
    q, endAt: Date.now() + seconds * 1000, seconds,
    onResolve, timerInt: null,
  };

  const quizEl = document.getElementById('ttQuiz');
  const isWord = q.kind === 'word';
  // 技能只能用在英文選擇題（計時題），消行快問不顯示技能按鈕
  const skillHtml = timed ? _ttSkillQuizButtonHtml() : '';

  quizEl.innerHTML = `
    <div class="ttq-card ${isWord ? 'ttq-word' : 'ttq-sentence'}">
      <div class="ttq-head">
        <span class="ttq-tag">${isWord ? '⚡ 消行快問' : '⏰ 計時挑戰'}${!isWord && q.typeLabel ? ` · ${q.typeLabel}` : ''}</span>
        <span class="ttq-timer" id="ttqTimer">${seconds}</span>
      </div>
      <div class="ttq-bar-track"><div class="ttq-bar" id="ttqBar" style="width:100%"></div></div>
      <div class="ttq-prompt ${isWord ? 'ttq-prompt-word' : ''}">${_ttEscHtml(q.prompt)}</div>
      <div class="ttq-opts" id="ttqOpts">
        ${q.options.map((o, i) => `<button class="ttq-opt" data-i="${i}" onclick="ttAnswerQuiz(${i})">${_ttEscHtml(o)}</button>`).join('')}
      </div>
      ${skillHtml}
    </div>`;
  quizEl.style.display = 'flex';
  _ttUpdateSkillBtn();

  _ttQuizTick();
  ttGame.quiz.timerInt = setInterval(_ttQuizTick, 100);
  return true;
}

function _ttQuizTick() {
  const quiz = ttGame && ttGame.quiz;
  if (!quiz || !quiz.active) return;
  const leftMs = Math.max(0, quiz.endAt - Date.now());
  const leftSec = Math.ceil(leftMs / 1000);
  const timerEl = document.getElementById('ttqTimer');
  const barEl = document.getElementById('ttqBar');
  if (timerEl) timerEl.textContent = leftSec;
  if (barEl) barEl.style.width = (leftMs / (quiz.seconds * 1000) * 100).toFixed(1) + '%';
  if (timerEl) timerEl.classList.toggle('low', leftSec <= 3);
  if (leftMs <= 0 && !quiz.answered) ttAnswerQuiz(-1); // 時間到＝未作答＝答錯
}

function ttAnswerQuiz(idx) {
  const quiz = ttGame && ttGame.quiz;
  if (!quiz || !quiz.active || quiz.answered) return;
  quiz.answered = true;
  clearInterval(quiz.timerInt);

  const correct = idx === quiz.q.answer;
  // 揭曉
  document.querySelectorAll('.ttq-opt').forEach(btn => {
    const i = +btn.dataset.i;
    btn.disabled = true;
    if (i === quiz.q.answer) btn.classList.add('correct');
    else if (i === idx) btn.classList.add('wrong');
  });

  setTimeout(() => {
    quiz.active = false;
    const quizEl = document.getElementById('ttQuiz');
    if (quizEl) { quizEl.style.display = 'none'; quizEl.innerHTML = ''; }
    if (typeof quiz.onResolve === 'function') quiz.onResolve(correct);
    // 恢復遊戲（若 onResolve 未觸發結束）
    if (ttGame && !ttGame.gameOver) {
      ttGame.paused = false;
      _ttSetGravity(ttGame.softDropping ? TT_SOFTDROP_MS : TT_GRAVITY_MS);
    }
  }, 850);
}

// ── 消行快問（消行時觸發） ──
function ttTriggerWordQuiz(n) {
  const q = ttMakeWordQuestion();
  if (!q) return;
  ttShowQuiz({
    q, seconds: TT_WORD_SECONDS, timed: false,
    onResolve: (correct) => {
      ttGame.score += correct ? TT_WORD_CORRECT : TT_WORD_WRONG;
      if (ttGame.score < 0) ttGame.score = 0;
      showTtFloat(correct ? `+${TT_WORD_CORRECT}` : `${TT_WORD_WRONG}`, correct);
      ttRender();
    },
  });
}

// ── 60秒計時題 ──
function ttStartTimedCycle() {
  if (!ttGame) return;
  ttLoadSentenceBank();
  ttGame.timedInt = setInterval(() => {
    if (!ttGame || ttGame.gameOver) return;
    _ttTriggerTimedQuestion();
  }, TT_TIMED_PERIOD);

  // 側欄「下一題倒數」：獨立於出題節奏本身，純粹顯示距離下一題還有幾秒
  ttGame.nextQuizAt = Date.now() + TT_TIMED_PERIOD;
  _ttQuizCountdownTick();
  ttGame.quizCdInt = setInterval(_ttQuizCountdownTick, 250);
}

function ttStopTimedCycle() {
  if (ttGame && ttGame.timedInt) clearInterval(ttGame.timedInt);
  if (ttGame && ttGame.quizCdInt) clearInterval(ttGame.quizCdInt);
}

function _ttQuizCountdownTick() {
  if (!ttGame) return;
  const el = document.getElementById('ttQuizCountdown');
  if (!el) return;
  const leftSec = Math.max(0, Math.ceil((ttGame.nextQuizAt - Date.now()) / 1000));
  el.textContent = leftSec;
  el.classList.toggle('low', leftSec <= 5);
}

function _ttTriggerTimedQuestion(retry = 0) {
  if (!ttGame || ttGame.gameOver) return;
  // 若正好有消行快問在進行，稍後再試（避免兩題疊在一起）
  if (ttGame.quiz && ttGame.quiz.active) {
    if (retry < 6) setTimeout(() => _ttTriggerTimedQuestion(retry + 1), 1500);
    return;
  }
  const q = ttMakeSentenceQuestion();
  if (!q) return;
  // 這題正式出現：重置「下一題倒數」，從這一刻起再算 60 秒
  ttGame.nextQuizAt = Date.now() + TT_TIMED_PERIOD;
  ttShowQuiz({
    q, seconds: TT_SENT_SECONDS, timed: true,
    onResolve: (correct) => {
      ttGame.timedCount = (ttGame.timedCount || 0) + 1;
      if (correct) {
        ttGame.score += TT_SENT_CORRECT;
        showTtFloat(`+${TT_SENT_CORRECT}`, true);
      } else {
        const over = ttGame.engine.addGarbageRow();
        showTtFloat('答錯！鎖一行', false);
        if (over) { ttRender(); ttEndGame(); return; }
      }
      _ttSkillMaybeRecharge();
      ttRender();
    },
  });
}

// ── 角色技能（飯糰人：從容一刻 = 當前題目 +10 秒） ──
function ttInitSkill(ch) {
  if (!ttGame) return;
  ttGame.skillChar = ch || null;
  ttGame.skillArmed = !!(ch && ch.skill);   // 是否可施放
  ttGame.skillUsedAt = -1;                    // 施放時已解決的計時題數
  ttGame.timedCount = 0;
  _ttUpdateSkillBtn();
}

// 技能按鈕觸發（只能用在英文選擇題＝計時題）
function ttUseSkill() {
  if (!ttGame || !ttGame.skillChar) return;
  // 只能在「英文選擇題（計時題）」進行中施放
  if (!ttGame.quiz || !ttGame.quiz.active || !ttGame.quiz.timed) {
    showToast('技能只能用在英文選擇題');
    return;
  }
  if (!ttGame.skillArmed) { showToast('技能冷卻中'); return; }

  const bonus = ttGame.skillChar.skill.bonusSeconds || 10;
  ttGame.quiz.endAt += bonus * 1000;
  ttGame.skillArmed = false;
  // 在計時題中使用，需等「下一輪」計時題結束才恢復，故 +1
  ttGame.skillUsedAt = (ttGame.timedCount || 0) + 1;
  showToast(`${ttGame.skillChar.skill.icon} ${ttGame.skillChar.skill.name}！+${bonus}秒`);
  _ttUpdateSkillBtn();
}

// 每次計時題結束後檢查是否該解除冷卻
function _ttSkillMaybeRecharge() {
  if (!ttGame || !ttGame.skillChar) return;
  if (!ttGame.skillArmed && (ttGame.timedCount || 0) > ttGame.skillUsedAt) {
    ttGame.skillArmed = true;
  }
  _ttUpdateSkillBtn();
}

// 更新側欄技能按鈕與題目卡內的技能按鈕狀態
function _ttUpdateSkillBtn() {
  if (!ttGame) return;
  const hasSkill = !!ttGame.skillChar;
  const inTimedQuiz = !!(ttGame.quiz && ttGame.quiz.active && ttGame.quiz.timed);
  const canCast = hasSkill && inTimedQuiz && ttGame.skillArmed;

  const side = document.getElementById('ttSkill');
  if (side) {
    side.disabled = !hasSkill;
    const cd = document.getElementById('ttSkillCd');
    if (cd) cd.textContent = !hasSkill ? '' : (ttGame.skillArmed ? '就緒' : '冷卻中');
  }
  const inQuizBtn = document.getElementById('ttqSkillBtn');
  if (inQuizBtn) {
    inQuizBtn.disabled = !canCast;
    inQuizBtn.classList.toggle('armed', canCast);
  }
}

function _ttSkillQuizButtonHtml() {
  if (!ttGame || !ttGame.skillChar) return '';
  const ch = ttGame.skillChar;
  return `<button class="ttq-skill-btn" id="ttqSkillBtn" onclick="ttUseSkill()">
      <img src="${ch.img}" alt=""> ${ch.skill.icon} ${_ttEscHtml(ch.skill.name)} <span class="ttq-skill-plus">+${ch.skill.bonusSeconds || 10}秒</span>
    </button>`;
}

// ── 分數浮動提示 ──
function showTtFloat(text, positive) {
  const ov = document.getElementById('tetrisOverlay');
  if (!ov) return;
  const el = document.createElement('div');
  el.className = 'tt-float ' + (positive ? 'pos' : 'neg');
  el.textContent = text;
  ov.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}
