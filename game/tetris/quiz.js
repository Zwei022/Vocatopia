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
const TT_READING_SECONDS = 120;
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
  // 技能可用在英文選擇題（計時題）或消行快問（單字題），閱讀理解不顯示技能按鈕；
  // 按鈕內部依技能類型自己判斷該不該渲染（見 _ttSkillQuizButtonHtml）
  const skillHtml = (!isReading && (timed || isWord)) ? _ttSkillQuizButtonHtml() : '';
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
    // 恢復遊戲（若 onResolve 未觸發結束，也沒有緊接著彈出新題目——例如閱讀理解
    // 關卡結束後會直接接續60秒英文選擇題，這種情況要維持暫停，讓新題目接手）
    if (ttGame && !ttGame.gameOver && !(ttGame.quiz && ttGame.quiz.active)) {
      ttGame.paused = false;
      _ttSetGravity(ttGame.currentGravityMs);
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
      // dumpling 的 bonusSecondsWord 冷卻計數（不論答對答錯都要 +1，仿 timedCount 算法）
      ttGame.wordQuizCount = (ttGame.wordQuizCount || 0) + 1;
      if (correct) {
        ttGame.wordStreak = (ttGame.wordStreak || 0) + 1;
        // 第一次答對（streak=1）倍率是 ×1（沒有加成），連續第二次才開始加乘 ×1.1、第三次 ×1.2...
        const mult = Math.min(1 + (ttGame.wordStreak - 1) * TT_COMBO_STEP, TT_COMBO_CAP);
        const gained = Math.round(TT_WORD_CORRECT * mult);
        _ttAddScore(gained);
        showTtFloat(`+${gained}${mult > 1 ? ` ×${mult.toFixed(1)}` : ''}`, true);
        // waffle 5★覺醒被動：每答對 N 題自動恢復 1 次護盾使用次數
        if (ttGame.passives?.recoverEvery) {
          ttGame.comboCorrectCount = (ttGame.comboCorrectCount || 0) + 1;
          if (ttGame.comboCorrectCount % ttGame.passives.recoverEvery === 0 && (ttGame.comboShieldUsed || 0) > 0) {
            ttGame.comboShieldUsed--;
          }
        }
        _ttStreakShieldTrack(true);
      } else {
        const type = ttGame.skill?.type;
        let skipPenalty = false;
        if (type === 'comboShield' && (ttGame.comboShieldUsed || 0) < (ttGame.skill.usesPerGame || 1)) {
          // 鬆餅的暖心護盾：讀成長後的 usesPerGame（可用次數），答錯時自動觸發，保住連勝不被歸零
          ttGame.comboShieldUsed = (ttGame.comboShieldUsed || 0) + 1;
          if (typeof SFX !== 'undefined') SFX.skillCast();
          showToast(`${ttGame.skill.icon} ${ttGame.skill.name}！連勝獲得保護`);
          if (ttGame.skill.offsetPenalty) skipPenalty = true;
          if (getCharStar(ttGame.skillChar.id) >= 3) ttGame.wordStreak = (ttGame.wordStreak || 0) + 1;
        } else if (type === 'streakSoftFail') {
          // 聖多諾黑：連勝不直接歸零，改用 streakRetainRatio 打折；5★覺醒可完全免疫
          if (!ttGame.passives?.streakImmune) {
            const ratio = ttGame.skill.streakRetainRatio ?? 0.5;
            ttGame.wordStreak = Math.floor((ttGame.wordStreak || 0) * ratio);
          }
        } else {
          ttGame.wordStreak = 0;
        }
        const penalty = (type === 'streakSoftFail') ? -(ttGame.skill.penaltyScore ?? 30) : TT_WORD_WRONG;
        if (!skipPenalty) { _ttAddScore(penalty); showTtFloat(`${penalty}`, false); }
        else { showTtFloat('護盾抵銷', false); }
        _ttStreakShieldTrack(false);
      }
      _ttSkillMaybeRecharge('word');
      ttRender();
    },
  });
}

// ── mochi 的 streakShield：連續答對 N 題觸發一次護盾，抵銷下一次懲罰 ──
function _ttStreakShieldTrack(correct) {
  if (!ttGame || ttGame.skill?.type !== 'streakShield') return;
  if (correct) {
    ttGame.streakShieldCount = (ttGame.streakShieldCount || 0) + 1;
    const need = ttGame.skill.milestone || 5;
    if (ttGame.streakShieldCount >= need) {
      ttGame.streakShieldCount = 0;
      ttGame.streakShieldReady = true;
      showToast('🍡 Q彈護體蓄力完成，下次懲罰將被彈開！');
    }
  } else {
    ttGame.streakShieldCount = 0;
  }
  _ttUpdateSkillBtn();
}
function _ttStreakShieldConsume() {
  if (!ttGame || !ttGame.streakShieldReady) return false;
  if (getCharStar(ttGame.skillChar.id) >= 3) _ttAddScore(50);
  const chance = ttGame.passives?.noConsumeChance || 0;
  if (!(chance && Math.random() < chance)) ttGame.streakShieldReady = false;
  if (typeof SFX !== 'undefined') SFX.skillCast();
  return true;
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

// #14 俄羅斯方塊答錯自動歸檔到閱覽室「答錯題庫」（比照每日練習的 _qbankAdd 用法），
// 分類跟每日練習分開（tt_grammar／tt_reading），不論單機或積分模式都會記錄；
// 消行快問（單字選擇）不記錄，只有60秒英文選擇題跟閱讀理解關卡兩種。
function _ttFileWrongToBank(cat, q) {
  if (typeof _qbankAdd !== 'function' || typeof CAT_META === 'undefined' || !CAT_META[cat]) return;
  const filed = {
    question: q.prompt,
    passage: q.passage || undefined,
    options: q.options,
    answer: q.answer,
    optionsZh: q.optionsZh,
    explanation: q.explanation || '',
    id: q.id || null,
  };
  _qbankAdd('wrong', cat, filed);
  if (typeof _updateBankCounts === 'function') _updateBankCounts('wrong');
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
        _ttStreakShieldTrack(true);
      } else {
        _ttFileWrongToBank('tt_grammar', q);
        if (_ttStreakShieldConsume()) {
          showToast('🍡 Q彈護體發動！這次懲罰被彈開');
        } else {
          const over = ttGame.engine.addGarbageRow();
          showTtFloat('答錯！鎖一行', false);
          if (over) { ttRender(); ttEndGame(); return; }
        }
        _ttStreakShieldTrack(false);
      }
      // millefeuille 的 chargeStack：蓄力中才計算疊層增減
      if (ttGame.skill?.type === 'chargeStack' && ttGame.charging) {
        if (correct) {
          const max = ttGame.skill.maxStack || 5;
          ttGame.chargeLevel = Math.min((ttGame.chargeLevel || 0) + 1, max);
        } else if (ttGame.skill.failResetAll === false) {
          ttGame.chargeLevel = Math.max((ttGame.chargeLevel || 0) - 1, 0);
        } else {
          ttGame.chargeLevel = 0;
        }
        _ttUpdateSkillBtn();
      }
      _ttSkillMaybeRecharge('timed');
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
  // 閱讀理解關卡優先權最高：提前佔用暫停狀態，避免載入題目的空檔被60秒計時題
  // 或消行快問搶先跳出——搶到的話 ttShowQuiz() 的守門條件會讓這次閱讀測驗
  // 悄悄被吃掉（門檻已經往前推進到下一關，卻沒有真的跳出視窗）。
  ttGame.paused = true;
  const q = await ttMakeReadingQuestion();
  if (!ttGame || ttGame.gameOver) return;   // 載入期間遊戲可能已結束/離開
  if (!q) {
    // 題庫載入失敗或暫時為空：把門檻退回去，下次分數變動時重新嘗試，
    // 避免這一關卡因為一次性的載入失敗就永久跳過；同時解除搶佔的暫停狀態。
    ttGame.nextReadingThreshold -= TT_READING_STEP;
    ttGame.paused = false;
    return;
  }
  ttShowQuiz({
    q, seconds: TT_READING_SECONDS, timed: false,
    onResolve: (correct) => {
      if (correct) {
        _ttAddScore(TT_READING_CORRECT);
        showTtFloat(`+${TT_READING_CORRECT}`, true);
        _ttStreakShieldTrack(true);
      } else {
        _ttFileWrongToBank('tt_reading', q);
        if (_ttStreakShieldConsume()) {
          showToast('🍡 Q彈護體發動！這次懲罰被彈開');
        } else {
          // 3★質變（honore）：側牆鎖定行數減半
          const lockRows = ttGame.passives?.sideLockRows || undefined;
          ttGame.engine.lockSideWalls(lockRows);
          showTtFloat('左右封鎖！填滿整排解鎖', false);
          showToast(`📖 閱讀理解答錯，左右兩側各鎖底部 ${lockRows || 6} 格，填滿一整排即可解鎖該行`);
        }
        _ttStreakShieldTrack(false);
      }
      ttRender();
      // 閱讀測驗插隊搶走了這次60秒計時題的時機，結束後直接接續一題計時題補回來，
      // 並重新起算下一輪倒數，避免緊接著又立刻再跳一次。
      if (ttGame && !ttGame.gameOver) {
        ttGame.nextQuizRemainingMs = TT_TIMED_PERIOD;
        _ttTriggerTimedQuestion();
      }
    },
  });
}

// 需要「用一次就封印，連續答對 N 題計時題才解封」的技能類型
const TT_SEALED_SKILL_TYPES = ['choosePiece', 'bombPiece', 'clearBottom', 'columnClearPiece', 'chargeStack'];

// 封印中的技能：連續答對 N 題英文選擇題（60秒計時題）才解除封印。
// 答錯會中斷解封進度（歸零），需重新連續答對。
function _ttSealedSkillMaybeUnseal(correct) {
  if (!ttGame || !TT_SEALED_SKILL_TYPES.includes(ttGame.skill?.type) || !ttGame.skillSealed) return;
  if (!correct) { ttGame.skillUnsealStreak = 0; _ttUpdateSkillBtn(); return; }

  const need = ttGame.skill.unsealStreak || 2;
  ttGame.skillUnsealStreak = (ttGame.skillUnsealStreak || 0) + 1;
  // canele 5★覺醒被動：封印期間每答對一題有機率提前解封
  if (ttGame.skillUnsealStreak < need && ttGame.passives?.earlyUnsealChance && Math.random() < ttGame.passives.earlyUnsealChance) {
    ttGame.skillSealed = false;
    ttGame.skillUnsealStreak = 0;
    ttGame.skillUsesLeft = ttGame.skill.consecutiveUses || 1;
    showToast(`${ttGame.skill.icon} 幸運提前解封！`);
    _ttUpdateSkillBtn();
    return;
  }
  if (ttGame.skillUnsealStreak >= need) {
    ttGame.skillSealed = false;
    ttGame.skillUnsealStreak = 0;
    // canele 4★：解封後可連續施放 consecutiveUses 次才會重新封印（其餘角色沒有這欄位，預設 1 次）
    ttGame.skillUsesLeft = ttGame.skill.consecutiveUses || 1;
    showToast(`${ttGame.skill.icon} ${ttGame.skill.name}解除封印！`);
  }
  _ttUpdateSkillBtn();
}

// 封印型技能施放一次：扣掉一次可用次數，歸零才重新封印（沒有 consecutiveUses 的角色預設 1 次，
// 行為跟原本「用一次就封印」一致）
function _ttConsumeSealedUse() {
  if (ttGame.skillUsesLeft == null) ttGame.skillUsesLeft = ttGame.skill.consecutiveUses || 1;
  ttGame.skillUsesLeft -= 1;
  if (ttGame.skillUsesLeft <= 0) {
    ttGame.skillSealed = true;
    ttGame.skillUnsealStreak = 0;
  }
}

// ── 角色技能 ──
// 五種技能類型：
//   bonusSeconds — 飯糰/龍蝦(舊)：只能在英文選擇題（計時題）進行中手動施放，+N秒
//   comboShield  — 鬆餅：被動技能，消行單字題答錯時自動觸發，無法手動施放
//   choosePiece  — 可麗露：隨時可手動施放，跳出方塊表格指定下一個方塊，用後封印
//   bombPiece    — 壽司：隨時可手動施放，下一個方塊變成壽司炸彈，鎖定時炸開 3×3 範圍，用後封印
//   clearBottom  — 龍蝦：隨時可手動施放，直接清空棋盤最底 2 行（不管是否被鎖住），用後封印
function ttInitSkill(ch) {
  if (!ttGame) return;
  ttGame.skillChar = ch || null;
  ttGame.skill = ch ? effectiveSkill(ch.id) : null;     // 套用星級加成後的技能物件
  ttGame.passives = ch ? activePassives(ch.id) : {};     // 覺醒被動（額外欄位，非 overrides）
  const type = ttGame.skill?.type;
  ttGame.skillArmed = (type === 'bonusSeconds' || type === 'bonusSecondsWord'); // 是否可施放
  ttGame.skillUsedAt = -1;                        // 施放時已解決的題數
  ttGame.timedCount = 0;
  ttGame.wordQuizCount = 0;              // dumpling bonusSecondsWord 冷卻計數
  ttGame.wordStreak = 0;                 // 消行單字題連勝計數（連勝加乘用）
  ttGame.comboShieldUsed = 0;            // 鬆餅護盾已用次數
  ttGame.comboCorrectCount = 0;          // 鬆餅5★覺醒：答對題數計數
  ttGame.skillSealed = false;            // 封印型技能是否封印中
  ttGame.skillUnsealStreak = 0;          // 封印期間，計時題連續答對計數
  ttGame.skillUsesLeft = null;           // 解封後剩餘可連續施放次數
  ttGame.autoShieldUsed = 0;             // uni 軍艦護盾已觸發次數
  ttGame.autoShieldTriggeredBonus = false;
  ttGame.streakShieldCount = 0;          // mochi 連續答對計數
  ttGame.streakShieldReady = false;
  ttGame.charging = false;               // millefeuille 蓄力狀態
  ttGame.chargeLevel = 0;
  ttGame.chargeUsed = 0;
  ttGame.chargeFirstCastDone = false;
  ttGame.sushiFirstCastUsed = false;     // sushi 5★覺醒：本局第一次施放
  ttGame.firstCastDone = false;          // lobster/bluefin 5★覺醒：本局第一次免費施放
  ttGame.lastClearHadLines = false;      // foiegras 3★：連續消行判斷
  _ttUpdateSkillBtn();
}

// 技能按鈕觸發：依技能類型分派不同行為
function ttUseSkill() {
  if (!ttGame || !ttGame.skillChar || !ttGame.skill) return;
  const type = ttGame.skill.type;

  if (TT_SEALED_SKILL_TYPES.includes(type)) {
    if (ttGame.gameOver) return;
    if (ttGame.skillSealed) {
      const need = ttGame.skill.unsealStreak || 2;
      showToast(`技能封印中，需連續答對 ${need} 題英文選擇題解除（目前 ${ttGame.skillUnsealStreak || 0}/${need}）`);
      return;
    }
    if (type === 'choosePiece')      { ttOpenPiecePicker(); return; }
    if (type === 'bombPiece')        { _ttCastBombPiece();  return; }
    if (type === 'clearBottom')      { _ttCastClearBottom(); return; }
    if (type === 'columnClearPiece') { _ttCastColumnClear(); return; }
    if (type === 'chargeStack')      { _ttHandleChargeStack(); return; }
  }

  if (type === 'comboShield' || type === 'streakShield' || type === 'autoShield' ||
      type === 'lineScoreBonus' || type === 'streakSoftFail') {
    showToast('這是被動技能，會在符合條件時自動觸發');
    return;
  }

  // bonusSeconds / bonusSecondsWord：只能在對應題型進行中施放
  if (type === 'bonusSeconds' || type === 'bonusSecondsWord') {
    const inRightQuiz = ttGame.quiz && ttGame.quiz.active &&
      (type === 'bonusSeconds' ? ttGame.quiz.timed : ttGame.quiz.q?.kind === 'word');
    if (!inRightQuiz) {
      showToast(type === 'bonusSeconds' ? '技能只能用在英文選擇題' : '技能只能用在消行快問');
      return;
    }
    if (!ttGame.skillArmed) { showToast('技能冷卻中'); return; }

    const bonus = ttGame.skill.bonusSeconds || 10;
    ttGame.quiz.endAt += bonus * 1000;
    ttGame.skillArmed = false;
    // 需等「下一輪」該題型結束才恢復，故 +1
    const counter = type === 'bonusSeconds' ? (ttGame.timedCount || 0) : (ttGame.wordQuizCount || 0);
    ttGame.skillUsedAt = counter + 1;
    if (typeof SFX !== 'undefined') SFX.skillCast();
    showToast(`${ttGame.skill.icon} ${ttGame.skill.name}！+${bonus}秒`);
    _ttUpdateSkillBtn();
  }
}

// 每次對應題型結束後檢查是否該解除冷卻（僅 bonusSeconds / bonusSecondsWord 需要）
// kind: 'timed'（60秒計時題）｜'word'（消行快問單字題）
function _ttSkillMaybeRecharge(kind) {
  if (!ttGame || !ttGame.skill) return;
  const type = ttGame.skill.type;
  if (kind === 'timed' && type !== 'bonusSeconds') return;
  if (kind === 'word' && type !== 'bonusSecondsWord') return;
  const counter = kind === 'timed' ? (ttGame.timedCount || 0) : (ttGame.wordQuizCount || 0);
  if (!ttGame.skillArmed && counter > ttGame.skillUsedAt) {
    ttGame.skillArmed = true;
  }
  _ttUpdateSkillBtn();
}

// 更新側欄技能按鈕與題目卡內的技能按鈕狀態
function _ttUpdateSkillBtn() {
  if (!ttGame) return;
  const hasSkill = !!ttGame.skillChar && !!ttGame.skill;
  const type = hasSkill ? ttGame.skill.type : null;
  const inTimedQuiz = !!(ttGame.quiz && ttGame.quiz.active && ttGame.quiz.timed);
  const inWordQuiz = !!(ttGame.quiz && ttGame.quiz.active && ttGame.quiz.q?.kind === 'word');

  let sideDisabled = !hasSkill, sideLabel = '';
  if (type === 'bonusSeconds' || type === 'bonusSecondsWord') {
    sideLabel = ttGame.skillArmed ? '就緒' : '冷卻中';
  } else if (type === 'chargeStack') {
    const need = ttGame.skill.unsealStreak || 2;
    if (ttGame.skillSealed) sideLabel = `封印中(${ttGame.skillUnsealStreak || 0}/${need})`;
    else if (ttGame.charging) sideLabel = `蓄力中 ${ttGame.chargeLevel || 0}層`;
    else sideLabel = `就緒（剩${(ttGame.skill.usesPerGame || 2) - (ttGame.chargeUsed || 0)}次）`;
  } else if (TT_SEALED_SKILL_TYPES.includes(type)) {
    const need = ttGame.skill.unsealStreak || 2;
    sideLabel = ttGame.skillSealed ? `封印中(${ttGame.skillUnsealStreak || 0}/${need})` : '就緒';
  } else if (type === 'comboShield') {
    sideDisabled = true; // 被動技能，側欄按鈕不可手動點擊
    sideLabel = `${ttGame.comboShieldUsed || 0}/${ttGame.skill.usesPerGame || 1}`;
  } else if (type === 'streakShield') {
    sideDisabled = true;
    const need = ttGame.skill.milestone || 5;
    sideLabel = ttGame.streakShieldReady ? '護盾就緒' : `${ttGame.streakShieldCount || 0}/${need}`;
  } else if (type === 'autoShield' || type === 'lineScoreBonus' || type === 'streakSoftFail') {
    sideDisabled = true;
    sideLabel = '待機（被動）';
  }

  const side = document.getElementById('ttSkill');
  if (side) {
    side.disabled = sideDisabled;
    const cd = document.getElementById('ttSkillCd');
    if (cd) cd.textContent = sideLabel;
  }
  const inQuizBtn = document.getElementById('ttqSkillBtn');
  if (inQuizBtn) {
    const canCast = (type === 'bonusSeconds' && inTimedQuiz && ttGame.skillArmed) ||
                    (type === 'bonusSecondsWord' && inWordQuiz && ttGame.skillArmed);
    inQuizBtn.disabled = !canCast;
    inQuizBtn.classList.toggle('armed', canCast);
  }
}

// 題目卡內的技能按鈕：bonusSeconds（計時題）／bonusSecondsWord（消行快問）各自只在對應題型顯示
function _ttSkillQuizButtonHtml() {
  if (!ttGame || !ttGame.skillChar || !ttGame.skill) return '';
  const type = ttGame.skill.type;
  if (type !== 'bonusSeconds' && type !== 'bonusSecondsWord') return '';
  const isWordQuiz = !!(ttGame.quiz && ttGame.quiz.q && ttGame.quiz.q.kind === 'word');
  if (type === 'bonusSeconds' && isWordQuiz) return '';
  if (type === 'bonusSecondsWord' && !isWordQuiz) return '';
  const ch = ttGame.skillChar;
  return `<button class="ttq-skill-btn" id="ttqSkillBtn" onclick="ttUseSkill()">
      <img src="${ch.img}" alt=""> ${ttGame.skill.icon} ${_ttEscHtml(ttGame.skill.name)} <span class="ttq-skill-plus">+${ttGame.skill.bonusSeconds || 10}秒</span>
    </button>`;
}

// ── 可麗露：選擇下一個方塊（2★起：先選下一顆，再選下下顆，兩步驟） ──
function ttOpenPiecePicker(step = 1) {
  if (!ttGame || !ttGame.engine) return;
  const el = document.getElementById('ttPiecePicker');
  if (!el) return;
  ttGame._piecePickStep = step;
  const twoStep = (ttGame.skill.previewCount || 1) >= 2;
  const title = !twoStep ? '🍮 選擇下一個方塊'
    : step === 1 ? '🍮 選擇下一個方塊（1/2）' : '🍮 選擇下下一個方塊（2/2）';
  // 第二步驟強制選完才能跳出，不給關閉按鈕（避免選了第一顆又反悔取消，變成沒收技能次數就白改到 nextType）
  const closeBtn = (twoStep && step === 2) ? '' : '<button class="ttpp-close" onclick="ttClosePiecePicker()">✕</button>';
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
        <span class="ttpp-title">${title}</span>
        ${closeBtn}
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
  const step = ttGame._piecePickStep || 1;
  const twoStep = (ttGame.skill.previewCount || 1) >= 2;
  if (step === 1) ttGame.engine.setNextType(type);
  else ttGame.engine.setQueuedType(type);
  if (twoStep && step === 1) {
    // 第一顆選完先不消耗技能次數/封印，緊接著跳出第二步選下下顆
    ttClosePiecePicker();
    ttOpenPiecePicker(2);
    return;
  }
  _ttConsumeSealedUse();
  ttClosePiecePicker();
  _ttRenderNext();
  _ttUpdateSkillBtn();
  if (typeof SFX !== 'undefined') SFX.skillCast();
  const what = twoStep ? '接下來兩個方塊' : '下一個方塊';
  showToast(ttGame.skillSealed
    ? `${ttGame.skill.icon} 已指定${what}，技能封印中`
    : `${ttGame.skill.icon} 已指定${what}，還可再連續施放 ${ttGame.skillUsesLeft} 次`);
}

// ── 壽司：下一個方塊變成壽司炸彈（強制為單格方塊，鎖定時炸開 3×3 範圍） ──
function _ttCastBombPiece() {
  if (!ttGame || !ttGame.engine) return;
  // 5★覺醒被動：本局第一次施放，爆炸範圍自動擴大一階（3×3 → 5×5）
  const boosted = !ttGame.sushiFirstCastUsed && ttGame.passives?.firstCastRadiusBoost;
  ttGame.engine.setNextType('M1');
  ttGame.engine.markNextAsBomb(boosted ? 2 : 1);
  if (boosted) ttGame.sushiFirstCastUsed = true;
  _ttConsumeSealedUse();
  _ttRenderNext();
  _ttUpdateSkillBtn();
  if (typeof SFX !== 'undefined') SFX.skillCast();
  showToast(`${ttGame.skill.icon} 下一個方塊將變成壽司炸彈！${boosted ? '（範圍擴大）' : ''}`);
}

// 消行事件裡呼叫（game.js 的 _ttGravityStep 判斷 ev.bombed 時觸發，音效已在該處播放）
function ttOnBombExplode(bombedCount) {
  const gained = 400;
  _ttAddScore(gained);
  // 3★質變：炸彈落地時，額外讓消行單字題連勝 +N
  if (ttGame.passives?.streakBonusOnTrigger) ttGame.wordStreak = (ttGame.wordStreak || 0) + ttGame.passives.streakBonusOnTrigger;
  showTtFloat(`💥 炸開 ${bombedCount} 格！+${gained}`, true);
}

// ── 龍蝦：直接清空棋盤最底 N 行（不管是否被鎖住），N 讀成長後的 clearRows ──
function _ttCastClearBottom() {
  if (!ttGame || !ttGame.engine) return;
  const rows = ttGame.skill.clearRows || 2;
  ttGame.engine.clearBottomRows(rows);
  // 3★質變：清空時額外讓連勝 +N
  if (ttGame.passives?.streakBonusOnTrigger) ttGame.wordStreak = (ttGame.wordStreak || 0) + ttGame.passives.streakBonusOnTrigger;
  // 5★覺醒被動：本局開局自動附贈 1 次免費施放（不消耗封印狀態）
  if (ttGame.passives?.freeFirstCast && !ttGame.firstCastDone) {
    ttGame.firstCastDone = true;
  } else {
    _ttConsumeSealedUse();
  }
  ttRender();
  _ttUpdateSkillBtn();
  if (typeof SFX !== 'undefined') SFX.clearBottom();
  showTtFloat(`轟！清空底部${rows}行`, true);
  showToast(`${ttGame.skill.icon} ${ttGame.skill.name}！`);
}

// ── 黑鮪魚：下一個方塊變成魚雷，落地時清空所在直排（跟壽司炸彈架構一樣） ──
function _ttCastColumnClear() {
  if (!ttGame || !ttGame.engine) return;
  const pieceType = (ttGame.skill.columns >= 3) ? 'I3' : 'D2';
  ttGame.engine.setNextType(pieceType);
  ttGame.engine.markNextAsColumnClear();
  // 5★覺醒被動：本局開局自動附贈 1 次免費施放（不消耗封印狀態）
  if (ttGame.passives?.freeFirstCast && !ttGame.firstCastDone) {
    ttGame.firstCastDone = true;
  } else {
    _ttConsumeSealedUse();
  }
  _ttRenderNext();
  _ttUpdateSkillBtn();
  if (typeof SFX !== 'undefined') SFX.skillCast();
  showToast(`${ttGame.skill.icon} 下一個方塊將變成鮪魚魚雷！`);
}

// 消行事件裡呼叫（game.js 的 _ttGravityStep/_ttHardDrop 判斷 ev.columnCleared 時觸發）
function ttOnColumnClear(count) {
  const gained = 300 + (ttGame.skill.bonusScore || 0);
  _ttAddScore(gained);
  showTtFloat(`🐟 清空 ${count} 格！+${gained}`, true);
}

// ── 千層蛋糕：按一次進入蓄力，之後每答對一題計時題疊層，再按一次「開動」依疊層清空底部 ──
function _ttHandleChargeStack() {
  if (!ttGame || !ttGame.skill) return;
  if (ttGame.skillSealed) {
    const need = ttGame.skill.unsealStreak || 2;
    showToast(`技能封印中，需連續答對 ${need} 題英文選擇題解除（目前 ${ttGame.skillUnsealStreak || 0}/${need}）`);
    return;
  }
  const usesLeft = (ttGame.skill.usesPerGame || 2) - (ttGame.chargeUsed || 0);
  if (usesLeft <= 0) { showToast('本局施放次數已用完'); return; }
  if (!ttGame.charging) {
    ttGame.charging = true;
    ttGame.chargeLevel = 0;
    if (typeof SFX !== 'undefined') SFX.skillCast();
    showToast('🍰 開始蓄力！答對英文選擇題可疊層，再次按下技能鍵開動');
    _ttUpdateSkillBtn();
    return;
  }
  let level = ttGame.chargeLevel || 0;
  // 5★覺醒被動：本局第一次觸發時，額外視為多疊 N 層計算
  if (!ttGame.chargeFirstCastDone && ttGame.passives?.firstCastBonusStack) {
    level += ttGame.passives.firstCastBonusStack;
    ttGame.chargeFirstCastDone = true;
  }
  // 3★質變：疊到滿層時自動額外 +300 分
  if (level >= (ttGame.skill.maxStack || 5) && getCharStar(ttGame.skillChar.id) >= 3) _ttAddScore(300);
  if (level > 0) ttGame.engine.clearBottomRows(level);
  ttGame.charging = false;
  ttGame.chargeLevel = 0;
  ttGame.chargeUsed = (ttGame.chargeUsed || 0) + 1;
  ttGame.skillSealed = true;
  ttGame.skillUnsealStreak = 0;
  ttRender();
  _ttUpdateSkillBtn();
  if (typeof SFX !== 'undefined') SFX.clearBottom();
  showTtFloat(level > 0 ? `轟！清空底部 ${level} 行` : '沒有疊層，撲了個空', level > 0);
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
