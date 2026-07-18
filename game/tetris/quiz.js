// ════════════════════════════════
// 俄羅斯方塊 — 題目流程 / 計時題循環 / 角色技能
// 依賴：game.js（ttGame 狀態、ttRender、ttEndGame）、vocab.js（出題）
// ════════════════════════════════

// 計分
const TT_WORD_CORRECT = 50;   // 消行快問答對
const TT_WORD_WRONG   = -30;  // 消行快問答錯
const TT_SENT_CORRECT = 150;  // 60秒計時題答對（答錯改為鎖底層一整欄）

const TT_WORD_SECONDS = 7;    // 消行快問（單字選擇題）限時
const TT_SENT_SECONDS = 30;   // 計時題（英文選擇題）限時
const TT_TIMED_PERIOD = 60000; // 每 60 秒出一題計時題

// 消行單字題連勝加乘：連勝 N 題 → ×(1 + N*0.1)，封頂 ×2.0
const TT_COMBO_STEP = 0.1;
const TT_COMBO_CAP  = 2.0;

// #14 積分模式閱讀理解關卡（每 5000 分觸發一次，只有 ttGame.mode==='ranked' 才會出現）
const TT_READING_STEP    = 5000;
const TT_READING_SECONDS = 40;
const TT_READING_CORRECT = 300;

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
  const isReading = q.kind === 'reading';
  // 技能只能用在英文選擇題（計時題），消行快問/閱讀理解不顯示技能按鈕
  const skillHtml = (timed && !isReading) ? _ttSkillQuizButtonHtml() : '';
  const tag = isReading ? '📖 閱讀理解' : (isWord ? '⚡ 消行快問' : '⏰ 計時挑戰');
  const passageHtml = isReading ? `<div class="ttq-passage">${_ttEscHtml(q.passage)}</div>` : '';

  quizEl.innerHTML = `
    <div class="ttq-card ${isWord ? 'ttq-word' : isReading ? 'ttq-reading' : 'ttq-sentence'}">
      <div class="ttq-head">
        <span class="ttq-tag">${tag}${!isWord && !isReading && q.typeLabel ? ` · ${q.typeLabel}` : ''}</span>
        <span class="ttq-timer" id="ttqTimer">${seconds}</span>
      </div>
      <div class="ttq-bar-track"><div class="ttq-bar" id="ttqBar" style="width:100%"></div></div>
      ${passageHtml}
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
  if (typeof SFX !== 'undefined') correct ? SFX.quizCorrect() : SFX.quizWrong();
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
      _ttSetGravity(ttGame.softDropping ? TT_SOFTDROP_MS : ttGame.currentGravityMs);
    }
  }, 850);
}

// ── 消行快問（消行時觸發） ──
// 連勝加乘只套用在答對的 +50 分上，答錯的 -30 懲罰不受倍率影響。
function ttTriggerWordQuiz(n) {
  const q = ttMakeWordQuestion();
  if (!q) return;
  ttShowQuiz({
    q, seconds: TT_WORD_SECONDS, timed: false,
    onResolve: (correct) => {
      if (correct) {
        ttGame.wordStreak = (ttGame.wordStreak || 0) + 1;
        // 第一次答對（streak=1）倍率是 ×1（沒有加成），連續第二次才開始加乘 ×1.1、第三次 ×1.2...
        const mult = Math.min(1 + (ttGame.wordStreak - 1) * TT_COMBO_STEP, TT_COMBO_CAP);
        const gained = Math.round(TT_WORD_CORRECT * mult);
        _ttAddScore(gained);
        showTtFloat(`+${gained}${mult > 1 ? ` ×${mult.toFixed(1)}` : ''}`, true);
      } else {
        // 鬆餅的暖心護盾：每局限用一次，答錯時自動觸發，保住連勝不被歸零
        const canShield = ttGame.skillChar?.skill?.type === 'comboShield' && !ttGame.waffleShieldUsed;
        if (canShield) {
          ttGame.waffleShieldUsed = true;
          if (typeof SFX !== 'undefined') SFX.skillCast();
          showToast(`${ttGame.skillChar.skill.icon} ${ttGame.skillChar.skill.name}！連勝獲得保護`);
        } else {
          ttGame.wordStreak = 0;
        }
        _ttAddScore(TT_WORD_WRONG);
        showTtFloat(`${TT_WORD_WRONG}`, false);
      }
      ttRender();
    },
  });
}

// ── 60秒計時題 ──
// 倒數只在「遊戲沒有暫停」時遞減：只要有任何題目（消行快問或計時題）彈出、
// ttGame.paused 為 true，倒數就整個凍結，不會在玩家答題的當下持續流逝，
// 也因此不會再跟另一題「撞在一起」，不需要碰撞重試的邏輯。
function ttStartTimedCycle() {
  if (!ttGame) return;
  ttLoadSentenceBank();
  ttGame.nextQuizRemainingMs = TT_TIMED_PERIOD;
  _ttQuizCountdownTick();
  ttGame.quizCdInt = setInterval(_ttQuizCountdownTick, 250);
}

function ttStopTimedCycle() {
  if (ttGame && ttGame.quizCdInt) clearInterval(ttGame.quizCdInt);
}

function _ttQuizCountdownTick() {
  if (!ttGame) return;
  if (!ttGame.paused && !ttGame.gameOver) {
    ttGame.nextQuizRemainingMs -= 250;
    if (ttGame.nextQuizRemainingMs <= 0) {
      ttGame.nextQuizRemainingMs = TT_TIMED_PERIOD;
      _ttTriggerTimedQuestion();
    }
  }
  const el = document.getElementById('ttQuizCountdown');
  if (!el) return;
  const leftSec = Math.max(0, Math.ceil(ttGame.nextQuizRemainingMs / 1000));
  el.textContent = leftSec;
  el.classList.toggle('low', leftSec <= 5);
}

function _ttTriggerTimedQuestion() {
  if (!ttGame || ttGame.gameOver) return;
  const q = ttMakeSentenceQuestion();
  if (!q) return;
  ttShowQuiz({
    q, seconds: TT_SENT_SECONDS, timed: true,
    onResolve: (correct) => {
      ttGame.timedCount = (ttGame.timedCount || 0) + 1;
      if (correct) {
        _ttAddScore(TT_SENT_CORRECT);
        showTtFloat(`+${TT_SENT_CORRECT}`, true);
      } else {
        const over = ttGame.engine.addGarbageRow();
        showTtFloat('答錯！鎖一行', false);
        if (over) { ttRender(); ttEndGame(); return; }
      }
      _ttSkillMaybeRecharge();
      _ttSealedSkillMaybeUnseal(correct);
      ttRender();
    },
  });
}

// ── #14 積分模式閱讀理解關卡（每 5000 分觸發一次）──
// 由 game.js 的 _ttAddScore() 在每次分數變動後呼叫；只有積分模式、且沒有題目正在進行時才觸發。
function _ttCheckReadingGate() {
  if (!ttGame || ttGame.mode !== 'ranked' || ttGame.gameOver) return;
  if (ttGame.quiz && ttGame.quiz.active) return;
  if (ttGame.nextReadingThreshold == null) ttGame.nextReadingThreshold = TT_READING_STEP;
  if (ttGame.score < ttGame.nextReadingThreshold) return;
  ttGame.nextReadingThreshold += TT_READING_STEP;
  _ttTriggerReadingQuiz();
}

async function _ttTriggerReadingQuiz() {
  if (!ttGame || ttGame.gameOver) return;
  const q = await ttMakeReadingQuestion();
  if (!q || !ttGame || ttGame.gameOver) return;   // 載入期間遊戲可能已結束/離開
  ttShowQuiz({
    q, seconds: TT_READING_SECONDS, timed: false,
    onResolve: (correct) => {
      if (correct) {
        _ttAddScore(TT_READING_CORRECT);
        showTtFloat(`+${TT_READING_CORRECT}`, true);
      } else {
        ttGame.engine.lockSideWalls();
        showTtFloat('左右封鎖！填滿整排解鎖', false);
        showToast('📖 閱讀理解答錯，左右兩側整條封鎖，填滿一整排即可解鎖該行');
      }
      ttRender();
    },
  });
}

// 需要「用一次就封印，連續答對 N 題計時題才解封」的技能類型
const TT_SEALED_SKILL_TYPES = ['choosePiece', 'bombPiece', 'clearBottom'];

// 封印中的技能：連續答對 N 題英文選擇題（60秒計時題）才解除封印。
// 答錯會中斷解封進度（歸零），需重新連續答對。
function _ttSealedSkillMaybeUnseal(correct) {
  if (!ttGame || !TT_SEALED_SKILL_TYPES.includes(ttGame.skillChar?.skill?.type) || !ttGame.skillSealed) return;
  if (!correct) { ttGame.skillUnsealStreak = 0; _ttUpdateSkillBtn(); return; }

  const need = ttGame.skillChar.skill.unsealStreak || 2;
  ttGame.skillUnsealStreak = (ttGame.skillUnsealStreak || 0) + 1;
  if (ttGame.skillUnsealStreak >= need) {
    ttGame.skillSealed = false;
    ttGame.skillUnsealStreak = 0;
    showToast(`${ttGame.skillChar.skill.icon} ${ttGame.skillChar.skill.name}解除封印！`);
  }
  _ttUpdateSkillBtn();
}

// ── 角色技能 ──
// 五種技能類型：
//   bonusSeconds — 飯糰/龍蝦(舊)：只能在英文選擇題（計時題）進行中手動施放，+N秒
//   comboShield  — 鬆餅：被動技能，消行單字題答錯時自動觸發，無法手動施放
//   choosePiece  — 可麗露：隨時可手動施放，跳出方塊表格指定下一個方塊，用後封印
//   bombPiece    — 壽司：隨時可手動施放，下一個方塊變成壽司炸彈，鎖定時炸開 9×9 範圍，用後封印
//   clearBottom  — 龍蝦：隨時可手動施放，直接清空棋盤最底 2 行（不管是否被鎖住），用後封印
function ttInitSkill(ch) {
  if (!ttGame) return;
  ttGame.skillChar = ch || null;
  const type = ch?.skill?.type;
  ttGame.skillArmed = type === 'bonusSeconds';  // 是否可施放（僅 bonusSeconds 用得到）
  ttGame.skillUsedAt = -1;                        // 施放時已解決的計時題數
  ttGame.timedCount = 0;
  ttGame.wordStreak = 0;                 // 消行單字題連勝計數（連勝加乘用）
  ttGame.waffleShieldUsed = false;       // 鬆餅護盾每局限用一次
  ttGame.skillSealed = false;            // 封印型技能是否封印中
  ttGame.skillUnsealStreak = 0;          // 封印期間，計時題連續答對計數
  _ttUpdateSkillBtn();
}

// 技能按鈕觸發：依技能類型分派不同行為
function ttUseSkill() {
  if (!ttGame || !ttGame.skillChar || !ttGame.skillChar.skill) return;
  const type = ttGame.skillChar.skill.type;

  if (TT_SEALED_SKILL_TYPES.includes(type)) {
    if (ttGame.gameOver) return;
    if (ttGame.skillSealed) {
      const need = ttGame.skillChar.skill.unsealStreak || 2;
      showToast(`技能封印中，需連續答對 ${need} 題英文選擇題解除（目前 ${ttGame.skillUnsealStreak || 0}/${need}）`);
      return;
    }
    if (type === 'choosePiece') { ttOpenPiecePicker(); return; }
    if (type === 'bombPiece')   { _ttCastBombPiece();  return; }
    if (type === 'clearBottom') { _ttCastClearBottom(); return; }
  }

  if (type === 'comboShield') {
    showToast('這是被動技能，消行單字題答錯時會自動觸發');
    return;
  }

  // 預設：bonusSeconds（只能在英文選擇題／計時題進行中施放）
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
  if (typeof SFX !== 'undefined') SFX.skillCast();
  showToast(`${ttGame.skillChar.skill.icon} ${ttGame.skillChar.skill.name}！+${bonus}秒`);
  _ttUpdateSkillBtn();
}

// 每次計時題結束後檢查是否該解除冷卻（僅 bonusSeconds 類型需要）
function _ttSkillMaybeRecharge() {
  if (!ttGame || !ttGame.skillChar) return;
  if (ttGame.skillChar.skill?.type !== 'bonusSeconds') return;
  if (!ttGame.skillArmed && (ttGame.timedCount || 0) > ttGame.skillUsedAt) {
    ttGame.skillArmed = true;
  }
  _ttUpdateSkillBtn();
}

// 更新側欄技能按鈕與題目卡內的技能按鈕狀態
function _ttUpdateSkillBtn() {
  if (!ttGame) return;
  const hasSkill = !!ttGame.skillChar;
  const type = hasSkill ? ttGame.skillChar.skill?.type : null;
  const inTimedQuiz = !!(ttGame.quiz && ttGame.quiz.active && ttGame.quiz.timed);

  let sideDisabled = !hasSkill, sideLabel = '';
  if (type === 'bonusSeconds') {
    sideLabel = ttGame.skillArmed ? '就緒' : '冷卻中';
  } else if (TT_SEALED_SKILL_TYPES.includes(type)) {
    const need = ttGame.skillChar.skill.unsealStreak || 2;
    sideLabel = ttGame.skillSealed ? `封印中(${ttGame.skillUnsealStreak || 0}/${need})` : '就緒';
  } else if (type === 'comboShield') {
    sideDisabled = true; // 被動技能，側欄按鈕不可手動點擊
    sideLabel = ttGame.waffleShieldUsed ? '已使用' : '待機（被動）';
  }

  const side = document.getElementById('ttSkill');
  if (side) {
    side.disabled = sideDisabled;
    const cd = document.getElementById('ttSkillCd');
    if (cd) cd.textContent = sideLabel;
  }
  const inQuizBtn = document.getElementById('ttqSkillBtn');
  if (inQuizBtn) {
    const canCast = type === 'bonusSeconds' && inTimedQuiz && ttGame.skillArmed;
    inQuizBtn.disabled = !canCast;
    inQuizBtn.classList.toggle('armed', canCast);
  }
}

// 題目卡內的技能按鈕：只有 bonusSeconds 類型會在英文選擇題彈窗內顯示
function _ttSkillQuizButtonHtml() {
  if (!ttGame || !ttGame.skillChar) return '';
  const ch = ttGame.skillChar;
  if (ch.skill?.type !== 'bonusSeconds') return '';
  return `<button class="ttq-skill-btn" id="ttqSkillBtn" onclick="ttUseSkill()">
      <img src="${ch.img}" alt=""> ${ch.skill.icon} ${_ttEscHtml(ch.skill.name)} <span class="ttq-skill-plus">+${ch.skill.bonusSeconds || 10}秒</span>
    </button>`;
}

// ── 可麗露：選擇下一個方塊 ──
function ttOpenPiecePicker() {
  if (!ttGame || !ttGame.engine) return;
  const el = document.getElementById('ttPiecePicker');
  if (!el) return;
  const tiles = TT_TYPES.map(type => {
    const def = TT_PIECES[type];
    const rows = def.matrix.length, cols = def.matrix[0].length;
    let cellsHtml = '';
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        cellsHtml += `<div class="tt-next-cell${def.matrix[r][c] ? ' fill-' + def.color : ''}"></div>`;
    return `<button class="ttpp-tile" onclick="ttChoosePiece('${type}')">
      <div class="ttpp-grid" style="grid-template-columns:repeat(${cols},1fr)">${cellsHtml}</div>
    </button>`;
  }).join('');
  el.innerHTML = `
    <div class="ttpp-card">
      <div class="ttpp-head">
        <span class="ttpp-title">🍮 選擇下一個方塊</span>
        <button class="ttpp-close" onclick="ttClosePiecePicker()">✕</button>
      </div>
      <div class="ttpp-tiles">${tiles}</div>
    </div>`;
  el.style.display = 'flex';
}

function ttClosePiecePicker() {
  const el = document.getElementById('ttPiecePicker');
  if (el) { el.style.display = 'none'; el.innerHTML = ''; }
}

function ttChoosePiece(type) {
  if (!ttGame || !ttGame.skillChar) return;
  ttGame.engine.setNextType(type);
  ttGame.skillSealed = true;
  ttGame.skillUnsealStreak = 0;
  ttClosePiecePicker();
  _ttRenderNext();
  _ttUpdateSkillBtn();
  if (typeof SFX !== 'undefined') SFX.skillCast();
  showToast(`${ttGame.skillChar.skill.icon} 已指定下一個方塊，技能封印中`);
}

// ── 壽司：下一個方塊變成壽司炸彈（強制為單格方塊，鎖定時炸開 9×9 範圍） ──
function _ttCastBombPiece() {
  if (!ttGame || !ttGame.engine) return;
  ttGame.engine.setNextType('M1');
  ttGame.engine.markNextAsBomb();
  ttGame.skillSealed = true;
  ttGame.skillUnsealStreak = 0;
  _ttRenderNext();
  _ttUpdateSkillBtn();
  if (typeof SFX !== 'undefined') SFX.skillCast();
  showToast(`${ttGame.skillChar.skill.icon} 下一個方塊將變成壽司炸彈！`);
}

// 消行事件裡呼叫（game.js 的 _ttGravityStep 判斷 ev.bombed 時觸發，音效已在該處播放）
function ttOnBombExplode(bombedCount) {
  const gained = 400;
  _ttAddScore(gained);
  showTtFloat(`💥 炸開 ${bombedCount} 格！+${gained}`, true);
}

// ── 龍蝦：直接清空棋盤最底 2 行（不管是否被鎖住） ──
function _ttCastClearBottom() {
  if (!ttGame || !ttGame.engine) return;
  ttGame.engine.clearBottomRows(2);
  ttGame.skillSealed = true;
  ttGame.skillUnsealStreak = 0;
  ttRender();
  _ttUpdateSkillBtn();
  if (typeof SFX !== 'undefined') SFX.clearBottom();
  showTtFloat('轟！清空底部兩行', true);
  showToast(`${ttGame.skillChar.skill.icon} ${ttGame.skillChar.skill.name}！`);
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
