// ════════════════════════════════
// 俄羅斯方塊 — 遊戲主控（DOM 渲染 / 三按鈕輸入 / 重力迴圈 / 計分）
// 依賴：engine.js（純邏輯）、characters.js（出戰角色/技能）
// Phase 2：核心可玩（移動/旋轉/軟降/消行/預覽/計分/結算）
// Phase 3 會在 ttOnLineClear、ttStartTimedQuestion 掛上單字題
// Phase 4 會在此接技能與排行榜上傳
// ════════════════════════════════

const TT_COLS = 8;
const TT_ROWS = 16;
const TT_GRAVITY_MS  = 700;   // 一般下降速度
const TT_HARDDROP_SCORE_PER_CELL = 2; // 硬降計分：瞬間下墜的每一格額外加分

// #14 模式拆分：單機（solo，不上榜不計最高分，難度固定）／積分（ranked，上榜、算最高分、
// 重力隨分數漸快、每 5000 分有閱讀理解關卡）。規則其餘完全相同。
// 重力速度改成直接跟分數線性內插（不再是每隔幾秒定時加快）：
// 分數 <= MIN 維持一般速度，MIN~MAX 之間線性變快，>= MAX 封頂在最快速度。
const TT_RANKED_RAMP_FLOOR     = 200;   // 最快不低於這個值
const TT_RANKED_RAMP_SCORE_MIN = 7500;  // 積分模式分數達到此門檻才開始加速
const TT_RANKED_RAMP_SCORE_MAX = 15000; // 達到此分數時重力達到最快

// 消行計分表
const TT_LINE_SCORE = { 1: 100, 2: 300, 3: 500, 4: 800 };

let ttGame = null;

function _ttOverlay() { return document.getElementById('tetrisOverlay'); }

function tetrisStart(mode) {
  const ov = _ttOverlay();
  if (!ov) return;
  mode = (mode === 'ranked') ? 'ranked' : 'solo';

  // ponytail: 手機 WebView（Capacitor iOS/Android）常見坑——Web Audio API 的 AudioContext
  // 預設是 suspended，只有在「使用者手勢的呼叫堆疊內」呼叫 resume() 才保證被允許解鎖。
  // 之後遊戲中方塊落地/消行等音效是由計時器（重力下墜）觸發，不算使用者手勢，
  // 若第一次解鎖沒在這裡（按下開始按鈕，確定是手勢內）做，之後整場可能都聽不到音效。
  if (typeof _sfxGetCtx === 'function') _sfxGetCtx();

  const engine = ttCreateEngine(TT_COLS, TT_ROWS);
  engine.spawn();

  ttGame = {
    engine,
    mode,
    score: 0,
    lines: 0,
    gravityInt: null,
    currentGravityMs: TT_GRAVITY_MS,
    nextReadingThreshold: TT_READING_STEP,
    paused: false,
    gameOver: false,
  };

  const ch = (typeof getDeployedChar === 'function') ? getDeployedChar() : null;

  ov.innerHTML = `
    <div class="tt-topbar">
      <div class="tt-topbar-left">
        <button class="tt-back" onclick="tetrisClose()">← 離開</button>
        ${mode === 'solo' ? '<button class="tt-pause-btn" onclick="ttPauseGame()" aria-label="暫停">⏸</button>' : ''}
      </div>
      <div class="tt-topbar-title">${mode === 'ranked' ? '積分模式' : '單機模式'}</div>
      <div class="tt-score-chip">分數 <b id="ttScore">0</b></div>
    </div>

    <!-- 消除行數／下一題倒數移到方塊框上方橫排，避免擠壓右側面板（見 #16） -->
    <div class="tt-statbar">
      <div class="tt-stat-chip">
        <span class="tt-stat-label">消除行數</span>
        <span class="tt-lines" id="ttLines">0</span>
      </div>
      <div class="tt-stat-chip">
        <span class="tt-stat-label">下一題倒數</span>
        <span class="tt-quizcd" id="ttQuizCountdown">60</span>
      </div>
    </div>

    <div class="tt-main">
      <div class="tt-board-wrap" id="ttBoardWrap">
        <div class="tt-board" id="ttBoard"></div>
      </div>
      <div class="tt-side">
        <div class="tt-side-card">
          <div class="tt-side-label">下一個</div>
          <div class="tt-next" id="ttNext"></div>
        </div>
        <div class="tt-side-card" id="ttHoldCard">
          <div class="tt-side-label">保留</div>
          <div class="tt-next" id="ttHold"></div>
        </div>
        <button class="tt-skill-btn" id="ttSkill" onclick="ttUseSkill()" disabled>
          <div class="tt-skill-ava">${ch ? `<img src="${ch.img}" alt="">` : '🎮'}</div>
          <div class="tt-skill-name">${ch ? ch.skill.name : '技能'}</div>
          <div class="tt-skill-cd" id="ttSkillCd"></div>
        </button>
        <button class="tt-hold-btn" id="ttHoldBtn" onclick="ttUseHold()">
          <span id="ttHoldBtnLabel">保留</span>
        </button>
      </div>
    </div>

    <div class="tt-controls">
      <button class="tt-ctrl tt-ctrl-side" id="ttBtnLeft" aria-label="左移">◀</button>
      <div class="tt-ctrl-circle" id="ttBtnCircle">
        <button class="tt-ctrl-half tt-ctrl-half-top" id="ttBtnRotate" aria-label="旋轉">↻</button>
        <button class="tt-ctrl-half tt-ctrl-half-bottom" id="ttBtnDrop" aria-label="瞬間下墜">▼</button>
      </div>
      <button class="tt-ctrl tt-ctrl-side" id="ttBtnRight" aria-label="右移">▶</button>
    </div>

    <!-- 題目彈層（Phase 3 使用） -->
    <div class="tt-quiz" id="ttQuiz" style="display:none"></div>

    <!-- 可麗露技能：選擇下一個方塊 -->
    <div class="tt-piece-picker" id="ttPiecePicker" style="display:none"></div>

    <!-- 單機模式暫停選單 -->
    <div class="tt-pause" id="ttPauseOverlay" style="display:none">
      <div class="tt-pause-box">
        <div class="tt-pause-icon">⏸</div>
        <div class="tt-pause-title">遊戲暫停</div>
        <div class="tt-pause-btns">
          <button class="tt-pause-resume" onclick="ttResumeGame()">▶ 繼續</button>
          <button class="tt-pause-exit" onclick="tetrisClose()">✕ 退出</button>
        </div>
      </div>
    </div>
  `;

  ov.style.display = 'flex';

  _ttBuildBoardCells();
  _ttBindControls();
  _ttResizeBoard();
  window.addEventListener('resize', _ttResizeBoard);

  ttRender();
  _ttSetGravity(ttGame.currentGravityMs);
  // 積分模式的重力速度改由 _ttAddScore 每次分數變動時依當前分數重新計算
  // #8 第一次進入該模式顯示提示卡時，暫停重力（用既有的 ttGame.paused，跟計時題
  // 暫停遊戲是同一套機制），避免使用者還在看提示文字時方塊已經悄悄落下好幾格。
  if (typeof showFeatureHint === 'function') {
    ttGame.paused = true;
    showFeatureHint(mode === 'ranked' ? 'tetrisRanked' : 'tetrisSolo', () => { if (ttGame) ttGame.paused = false; });
  }

  // Phase 4：技能與計時題會在此啟動
  if (typeof ttInitSkill === 'function') ttInitSkill(ch);
  if (typeof ttStartTimedCycle === 'function') ttStartTimedCycle();
}

// 積分模式：依當前分數算出重力速度。分數 <= MIN 維持一般速度，
// MIN~MAX 之間線性變快，>= MAX 封頂在 TT_RANKED_RAMP_FLOOR。
function _ttUpdateRankedGravity() {
  if (!ttGame || ttGame.mode !== 'ranked') return;
  const { score } = ttGame;
  let ms;
  if (score <= TT_RANKED_RAMP_SCORE_MIN) {
    ms = TT_GRAVITY_MS;
  } else if (score >= TT_RANKED_RAMP_SCORE_MAX) {
    ms = TT_RANKED_RAMP_FLOOR;
  } else {
    const ratio = (score - TT_RANKED_RAMP_SCORE_MIN) / (TT_RANKED_RAMP_SCORE_MAX - TT_RANKED_RAMP_SCORE_MIN);
    ms = TT_GRAVITY_MS - (TT_GRAVITY_MS - TT_RANKED_RAMP_FLOOR) * ratio;
  }
  ms = Math.round(ms);
  if (ms === ttGame.currentGravityMs) return;
  ttGame.currentGravityMs = ms;
  if (!ttGame.paused) _ttSetGravity(ms);
}

// 集中處理分數變動：統一下限保護（不會變負數），並在積分模式檢查是否觸發閱讀理解關卡
// 與是否該依最新分數更新重力速度
function _ttAddScore(n) {
  if (!ttGame) return;
  // foiegras 5★覺醒：單局分數達門檻後，之後所有分數獲取直接雙倍
  if (n > 0 && ttGame.skill?.type === 'lineScoreBonus' && ttGame.passives?.doubleAfterScore && ttGame.score >= ttGame.passives.doubleAfterScore) {
    n *= 2;
  }
  // uni 5★覺醒：軍艦護盾觸發後，本局剩餘時間分數獲取額外加成
  if (n > 0 && ttGame.autoShieldTriggeredBonus && ttGame.passives?.postTriggerScoreBonusPct) {
    n = Math.round(n * (1 + ttGame.passives.postTriggerScoreBonusPct / 100));
  }
  ttGame.score += n;
  if (ttGame.score < 0) ttGame.score = 0;
  _ttUpdateRankedGravity();
  if (typeof _ttCheckReadingGate === 'function') _ttCheckReadingGate();
}

// 單機模式暫停：沿用 ttGame.paused（重力/操作/計時題都已讀這個旗標），跳出繼續／退出選單
function ttPauseGame() {
  if (!ttGame || ttGame.gameOver || ttGame.mode !== 'solo') return;
  ttGame.paused = true;
  const el = document.getElementById('ttPauseOverlay');
  if (el) el.style.display = 'flex';
  if (typeof SFX !== 'undefined') SFX.skillCast();
}

function ttResumeGame() {
  if (!ttGame) return;
  ttGame.paused = false;
  const el = document.getElementById('ttPauseOverlay');
  if (el) el.style.display = 'none';
}

async function tetrisClose() {
  const g = ttGame;
  if (g) {
    clearInterval(g.gravityInt);
    if (typeof ttStopTimedCycle === 'function') ttStopTimedCycle();
  }
  window.removeEventListener('resize', _ttResizeBoard);
  const ov = _ttOverlay();
  if (ov) { ov.style.display = 'none'; ov.innerHTML = ''; }
  ttGame = null;

  // #8 未 game over 就按「離開」也要結算目前分數上榜（原本只有 game over 才送分）。
  // 先關 UI 再送分/刷榜，讓離開反應即時。ttSubmitScore 只在刷新最高分時才寫入。
  // #14 單機模式（g.mode !== 'ranked'）一律不送分、不計最高分。
  if (g && !g.gameOver && g.score > 0) {
    try { await ttSubmitScore(g.score, g.mode); } catch { /* 送分失敗不影響關閉 */ }
  } else if (g && g._submitPromise) {
    // 正常 game over 那條路的送分是 fire-and-forget（見 ttEndGame），這裡等它真的寫完再刷排行榜
    try { await g._submitPromise; } catch { /* 送分失敗不影響關閉 */ }
  }
  // #8 一場結束回首頁就即時刷新排行榜（不再等下次首頁整體重繪才更新）
  if (typeof renderLeaderboard === 'function') renderLeaderboard();
}

// ── 棋盤 DOM 格子（一次建立，之後只改 class） ──
function _ttBuildBoardCells() {
  const boardEl = document.getElementById('ttBoard');
  boardEl.style.gridTemplateColumns = `repeat(${TT_COLS}, 1fr)`;
  boardEl.style.gridTemplateRows = `repeat(${TT_ROWS}, 1fr)`;
  let html = '';
  for (let r = 0; r < TT_ROWS; r++)
    for (let c = 0; c < TT_COLS; c++)
      html += `<div class="tt-cell" data-r="${r}" data-c="${c}"></div>`;
  boardEl.innerHTML = html;
}

// 讓棋盤在可用空間內維持 8:16 比例
function _ttResizeBoard() {
  const wrap = document.getElementById('ttBoardWrap');
  const boardEl = document.getElementById('ttBoard');
  if (!wrap || !boardEl) return;
  const availW = wrap.clientWidth;
  const availH = wrap.clientHeight;
  if (!availW || !availH) return;
  const ratio = TT_COLS / TT_ROWS;
  let w = availH * ratio;
  if (w > availW) w = availW;
  boardEl.style.width  = w + 'px';
  boardEl.style.height = (w / ratio) + 'px';
}

function ttRender() {
  if (!ttGame) return;
  const view = ttGame.engine.render();
  const ghost = ttGame.engine.ghostCells();
  const cells = document.getElementById('ttBoard').children;
  for (let r = 0; r < TT_ROWS; r++) {
    for (let c = 0; c < TT_COLS; c++) {
      const cell = cells[r * TT_COLS + c];
      const color = view[r][c];
      let cls = 'tt-cell' + (color ? ' fill-' + color : '');
      // 影子只畫在還沒被目前這顆方塊本身佔用的格子上，避免跟真正的方塊顏色疊在一起
      if (!color && ghost.some(g => g.r === r && g.c === c)) cls += ' tt-cell-ghost';
      cell.className = cls;
    }
  }
  document.getElementById('ttScore').textContent = ttGame.score.toLocaleString();
  document.getElementById('ttLines').textContent = ttGame.lines;
  _ttRenderNext();
  _ttRenderHold();
}

// 共用的方塊縮圖畫法：直接依照方塊實際的行列數把容器裁成剛好的大小，
// 不再用固定 74×74 正方形置中——窄的方塊（例如 I3、M1）以前會被夾在
// 大方框正中間、四周留白一大圈，改成貼齊方塊實際外形後不會再有這種空洞感。
const TT_PREVIEW_CELL = 17, TT_PREVIEW_GAP = 3;
function _ttRenderPreviewInto(el, type, isBomb) {
  if (!type) { el.innerHTML = ''; el.style.width = '0'; el.style.height = '0'; el.classList.remove('tt-next-bomb'); return; }
  const m = TT_PIECES[type].matrix;
  const color = isBomb ? 'bomb' : TT_PIECES[type].color;
  const rows = m.length, cols = m[0].length;
  let html = '';
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      html += `<div class="tt-next-cell${m[r][c] ? ' fill-' + color : ''}"></div>`;
  el.style.gridTemplateColumns = `repeat(${cols}, ${TT_PREVIEW_CELL}px)`;
  el.style.width  = (cols * TT_PREVIEW_CELL + (cols - 1) * TT_PREVIEW_GAP) + 'px';
  el.style.height = (rows * TT_PREVIEW_CELL + (rows - 1) * TT_PREVIEW_GAP) + 'px';
  el.innerHTML = html;
  el.classList.toggle('tt-next-bomb', isBomb);
}

function _ttRenderNext() {
  _ttRenderPreviewInto(document.getElementById('ttNext'), ttGame.engine.nextType, !!ttGame.engine.pendingBomb);
}

function _ttRenderHold() {
  const holdType = ttGame.engine.holdType;
  const el = document.getElementById('ttHold');
  _ttRenderPreviewInto(el, holdType, false);
  const card = document.getElementById('ttHoldCard');
  if (card) card.classList.toggle('tt-hold-empty', !holdType);
  const btn = document.getElementById('ttHoldBtn');
  if (btn) {
    const locked = !!ttGame.engine.holdLocked;
    btn.disabled = locked;
    document.getElementById('ttHoldBtnLabel').textContent = holdType ? '交換' : '保留';
  }
}

// 保留/交換按鈕
function ttUseHold() {
  if (!ttGame || ttGame.paused || ttGame.gameOver) return;
  if (ttGame.engine.hold()) {
    ttRender();
    if (typeof SFX !== 'undefined' && SFX.rotate) SFX.rotate();
  }
}

// ── 重力 ──
function _ttSetGravity(ms) {
  if (!ttGame) return;
  clearInterval(ttGame.gravityInt);
  ttGame.gravityInt = setInterval(_ttGravityStep, ms);
}

function _ttGravityStep() {
  if (!ttGame || ttGame.paused || ttGame.gameOver) return;
  const ev = ttGame.engine.tick();
  if (ev.bombed) {
    if (typeof SFX !== 'undefined') SFX.bomb();
    if (typeof ttOnBombExplode === 'function') ttOnBombExplode(ev.bombedCount);
  } else if (ev.columnCleared) {
    if (typeof SFX !== 'undefined') SFX.bomb();
    if (typeof ttOnColumnClear === 'function') ttOnColumnClear(ev.columnClearedCount);
  } else if (ev.locked && ev.cleared > 0) {
    ttOnLineClear(ev.cleared);
  } else if (ev.locked) {
    if (typeof SFX !== 'undefined') SFX.lock();
    ttGame.lastClearHadLines = false;
  }
  if (ev.locked) _ttCheckAutoShield(ev);
  if (ev.gameOver) { ttRender(); ttEndGame(); return; }
  ttRender();
}

// 震動回饋：iOS 的 WKWebView（App 內）跟 Safari 完全不支援 Web Vibration API（navigator.vibrate
// 呼叫了也是靜默無效，不是бug，是平台本身沒實作這支 API），只有 Android WebView/瀏覽器才吃這套。
// 改用 Capacitor 官方 Haptics 外掛（原生震動），iOS/Android 都走原生 API 真的會震；
// 沒有 Capacitor 環境（純網頁版）才退回 navigator.vibrate 當 best-effort。
// 開關跟音效共用同一份 voca_settings（設定頁「震動」），_loadSettingsData() 是 script.js 的全域函式，
// 同一頁面共用 window scope，跟其他跨檔案呼叫（showToast/SFX）同一套模式。
function _ttHapticsEnabled() {
  return typeof _loadSettingsData === 'function' ? _loadSettingsData().haptics !== false : true;
}
// Capacitor Haptics 外掛需要 npx cap sync + 原生重新編譯才會出現在 window.Capacitor.Plugins，
// 純改網頁端程式碼、沒有重新出 App build 的話，iOS/Android App 仍然是舊版原生殼，摸不到這支外掛。
function _ttNativeHaptics() {
  return (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.())
    ? window.Capacitor?.Plugins?.Haptics
    : null;
}

// 消行震動回饋：力道隨消行數遞增（1~4行）
const TT_CLEAR_IMPACT   = { 1: 'LIGHT', 2: 'MEDIUM', 3: 'MEDIUM', 4: 'HEAVY' }; // Capacitor 原生
const TT_CLEAR_VIBRATE  = { 1: 25, 2: 45, 3: 70, 4: [40, 30, 90] };             // navigator.vibrate 退回用
function _ttVibrateForClear(n) {
  if (!_ttHapticsEnabled()) return;
  const haptics = _ttNativeHaptics();
  if (haptics) { haptics.impact({ style: TT_CLEAR_IMPACT[n] || TT_CLEAR_IMPACT[4] }); return; }
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(TT_CLEAR_VIBRATE[n] || TT_CLEAR_VIBRATE[4]);
}

// 懲罰震動（底部鎖行／側邊直列鎖共用）：原生走 notification(Warning)，網頁版退回固定震動樣式
function _ttVibratePenalty() {
  if (!_ttHapticsEnabled()) return;
  const haptics = _ttNativeHaptics();
  if (haptics) { haptics.notification({ type: 'WARNING' }); return; }
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([60, 40, 60]);
}

// 消行事件：基礎加分（Phase 3 會在此觸發單字快問）
function ttOnLineClear(n) {
  _ttVibrateForClear(n);
  ttGame.lines += n;
  let score = TT_LINE_SCORE[n] || n * 100;
  // foiegras（香煎鵝肝）被動：每消一行額外 +bonusPct% 分數加成，3★質變：連續兩次操作都有消行時本次加成翻倍
  if (ttGame.skill?.type === 'lineScoreBonus') {
    let pct = ttGame.skill.bonusPct || 0;
    if (getCharStar(ttGame.skillChar.id) >= 3 && ttGame.lastClearHadLines) pct *= 2;
    score = Math.round(score * (1 + pct / 100));
    ttGame.lastClearHadLines = true;
  } else {
    ttGame.lastClearHadLines = false;
  }
  _ttAddScore(score);
  if (typeof SFX !== 'undefined') SFX.lineClear(n);
  if (typeof ttTriggerWordQuiz === 'function') ttTriggerWordQuiz(n);
}

// uni（海膽軍艦）autoShield：堆疊逼近頂端（或本次鎖定已判定 gameOver）時自動清空底部救場，每局限用 N 次
function _ttCheckAutoShield(ev) {
  if (!ttGame || !ttGame.skill || ttGame.skill.type !== 'autoShield') return false;
  const used = ttGame.autoShieldUsed || 0;
  const max = ttGame.skill.usesPerGame || 1;
  if (used >= max) return false;
  const margin = ttGame.skill.triggerMarginRows || 0;
  const rows = ttGame.engine.rows;
  const board = ttGame.engine.board;
  let topRow = rows;
  for (let r = 0; r < rows; r++) { if (board[r].some(c => c)) { topRow = r; break; } }
  if (!ev.gameOver && topRow > margin) return false; // 還沒逼近觸發線，且沒有立即 game over 危機
  ttGame.engine.clearBottomRows(ttGame.skill.clearRows || 3);
  ttGame.autoShieldUsed = used + 1;
  ttGame.autoShieldTriggeredBonus = true;
  // 3★質變：觸發時額外讓消行單字題連勝 +N
  if (ttGame.passives?.streakBonusOnTrigger) ttGame.wordStreak = (ttGame.wordStreak || 0) + ttGame.passives.streakBonusOnTrigger;
  if (typeof SFX !== 'undefined') SFX.clearBottom();
  if (typeof showTtFloat === 'function') showTtFloat('🍱 軍艦護盾發動！', true);
  if (typeof showToast === 'function') showToast('軍艦護盾自動觸發，清空底部');
  if (typeof _ttUpdateSkillBtn === 'function') _ttUpdateSkillBtn();
  if (ev.gameOver && !ttGame.engine.collides(ttGame.engine.active)) ev.gameOver = false; // 救回一命
  return true;
}

// ── 輸入：三按鈕 + 鍵盤（桌面測試用） ──
function _ttMove(dir) {
  if (!ttGame || ttGame.paused || ttGame.gameOver) return;
  if (ttGame.engine.move(dir)) { ttRender(); if (typeof SFX !== 'undefined') SFX.move(); }
}
function _ttRotate() {
  if (!ttGame || ttGame.paused || ttGame.gameOver) return;
  if (ttGame.engine.rotate()) { ttRender(); if (typeof SFX !== 'undefined') SFX.rotate(); }
}
// 硬降：目前這顆方塊直接瞬間落到底部鎖定（正統俄羅斯方塊的「Hard Drop」），
// 不是加速下降。連續呼叫 tick() 直到它不再往下移動為止，那一次 tick 的
// 鎖定／消行／炸彈／game over 事件跟一般重力下墜共用同一套處理邏輯。
function _ttHardDrop() {
  if (!ttGame || ttGame.paused || ttGame.gameOver) return;
  let cells = 0;
  let ev;
  do {
    ev = ttGame.engine.tick();
    if (ev.moved) cells++;
  } while (ev.moved);
  if (cells > 0) _ttAddScore(cells * TT_HARDDROP_SCORE_PER_CELL);
  if (typeof SFX !== 'undefined') SFX.hardDrop();
  if (ev.bombed) {
    if (typeof SFX !== 'undefined') SFX.bomb();
    if (typeof ttOnBombExplode === 'function') ttOnBombExplode(ev.bombedCount);
  } else if (ev.columnCleared) {
    if (typeof SFX !== 'undefined') SFX.bomb();
    if (typeof ttOnColumnClear === 'function') ttOnColumnClear(ev.columnClearedCount);
  } else if (ev.locked && ev.cleared > 0) {
    ttOnLineClear(ev.cleared);
  } else if (ev.locked) {
    ttGame.lastClearHadLines = false;
  }
  if (ev.locked) _ttCheckAutoShield(ev);
  if (ev.gameOver) { ttRender(); ttEndGame(); return; }
  ttRender();
}

function _ttBindControls() {
  const left = document.getElementById('ttBtnLeft');
  const right = document.getElementById('ttBtnRight');
  const rotateBtn = document.getElementById('ttBtnRotate');
  const dropBtn = document.getElementById('ttBtnDrop');

  // 左右：點一下移動一格；按住則連續移動
  _ttBindRepeat(left, () => _ttMove(-1));
  _ttBindRepeat(right, () => _ttMove(1));

  // 圓形按鈕分上下兩瓣：上半＝旋轉、下半＝硬降（瞬間落底），都是按下立即觸發一次
  rotateBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    try { rotateBtn.setPointerCapture(e.pointerId); } catch { /* 不支援就算了 */ }
    _ttRotate();
  });

  dropBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    try { dropBtn.setPointerCapture(e.pointerId); } catch { /* 不支援就算了 */ }
    _ttHardDrop();
  });

  // 鍵盤（桌面測試/遊玩）
  ttGame._keyHandler = (e) => {
    if (!ttGame) return;
    if (e.key === 'ArrowLeft')  { _ttMove(-1); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { _ttMove(1); e.preventDefault(); }
    else if (e.key === 'ArrowUp' || e.key === ' ') { _ttRotate(); e.preventDefault(); }
    else if (e.key === 'ArrowDown') {
      if (!e.repeat) _ttHardDrop(); // 忽略長按產生的重複 keydown，一次按下只硬降一次
      e.preventDefault();
    }
    else if (e.key === 'c' || e.key === 'C' || e.key === 'Shift') { ttUseHold(); e.preventDefault(); }
  };
  document.addEventListener('keydown', ttGame._keyHandler);
}

// 點一下觸發一次；按住 260ms 後每 90ms 連發（左右移動用）
function _ttBindRepeat(el, fn) {
  let repeatTimer = null, delayTimer = null, pressed = false;
  const start = (e) => {
    e.preventDefault();
    if (pressed) return;
    pressed = true;
    try { el.setPointerCapture(e.pointerId); } catch { /* 不支援就算了 */ }
    fn();
    delayTimer = setTimeout(() => { repeatTimer = setInterval(fn, 90); }, 260);
  };
  const stop = () => {
    pressed = false;
    clearTimeout(delayTimer); clearInterval(repeatTimer);
  };
  el.addEventListener('pointerdown', start);
  el.addEventListener('pointerup', stop);
  el.addEventListener('pointercancel', stop);
}

// ── 結束 ──
function ttEndGame() {
  if (!ttGame || ttGame.gameOver) return;
  ttGame.gameOver = true;
  clearInterval(ttGame.gravityInt);
  if (typeof ttStopTimedCycle === 'function') ttStopTimedCycle();
  document.removeEventListener('keydown', ttGame._keyHandler);

  const finalScore = ttGame.score;
  const finalLines = ttGame.lines;
  const mode = ttGame.mode;
  const isRanked = mode === 'ranked';
  if (typeof logEvent === 'function') logEvent('tetris_game_over', { mode, score: finalScore, lines: finalLines });

  // 本機最高分比較（決定是否顯示「新紀錄」）；#14 單機模式不計入最高分，不比較、不顯示新紀錄
  let prevBest = 0;
  try { prevBest = parseInt(localStorage.getItem(LS_TETRIS_BEST) || '0', 10) || 0; } catch { /* ignore */ }
  const isNewBest = isRanked && finalScore > prevBest;
  if (typeof SFX !== 'undefined') isNewBest ? SFX.newRecord() : SFX.gameOver();

  // 上傳排行榜（只有積分模式；未登入只存本機、不上榜）。不 await 是為了不卡遊戲結束畫面顯示，
  // 但保留 promise 讓 tetrisClose() 之後能等它寫完再刷新排行榜，不然玩家秒點「返回首頁」
  // 會看到還沒寫進資料庫的舊排行榜（分數延遲上榜的根因）。
  ttGame._submitPromise = ttSubmitScore(finalScore, mode);
  // #2 一場結束給經驗值（每日前 5 場、有防刷上限，兩種模式都給）
  if (typeof awardTetrisXp === 'function') awardTetrisXp(finalLines);
  // 單局最高分達 15000 解鎖角色「香煎鵝肝」
  if (finalScore >= 15000 && typeof addOwnedChar === 'function' && addOwnedChar('foiegras')) {
    if (typeof showToast === 'function') showToast('🥩 恭喜單局突破 15000 分！獲得角色「香煎鵝肝」！', 4000);
  }

  const ov = _ttOverlay();
  const panel = document.createElement('div');
  panel.className = 'tt-gameover';
  panel.innerHTML = `
    <div class="tt-go-box">
      <div class="tt-go-icon">${isNewBest ? '🏆' : '🎮'}</div>
      <div class="tt-go-title">遊戲結束</div>
      ${isNewBest ? '<div class="tt-go-newbest">🎉 新紀錄！</div>' : ''}
      <div class="tt-go-score">${finalScore.toLocaleString()} 分</div>
      <div class="tt-go-lines">消除 ${finalLines} 行　${isRanked ? (!isNewBest ? `· 最佳 ${prevBest.toLocaleString()}` : '') : '· 單機模式（不計入排行榜）'}</div>
      <div class="tt-go-btns">
        <button class="tt-go-again" onclick="tetrisClose();tetrisStart('${mode}')">再玩一次</button>
        <button class="tt-go-back" onclick="tetrisClose()">返回首頁</button>
      </div>
    </div>`;
  ov.appendChild(panel);
}

// ── 上傳分數到排行榜（只保留最高分；未登入僅存本機；#14 只有積分模式才計分/上榜） ──
async function ttSubmitScore(score, mode) {
  if (mode !== 'ranked') return;

  try {
    const prev = parseInt(localStorage.getItem(LS_TETRIS_BEST) || '0', 10) || 0;
    if (score > prev) localStorage.setItem(LS_TETRIS_BEST, String(score));
  } catch { /* ignore */ }

  // 訪客不上榜
  if (typeof currentUser === 'undefined' || !currentUser || !currentProfile || typeof authClient === 'undefined') return;
  // 計時：下次若又出現「延遲許久」，主控台會印出實際毫秒數，不用再用猜的
  console.time('[perf] submit_tetris_score');
  try {
    // 原本「先查最高分、比較、再視情況寫入」要跑 2 次網路來回；
    // 現在改呼叫資料庫端的 RPC，比較與寫入都在資料庫內一次完成，只跑 1 次來回。
    const { error } = await authClient.rpc('submit_tetris_score', {
      p_username: currentProfile.username,
      p_score: score,
    });
    if (error) console.error('[ttSubmitScore] RPC 失敗：', error.message);
  } catch (err) {
    console.error('[ttSubmitScore] 例外：', err?.message || err);
  } finally {
    console.timeEnd('[perf] submit_tetris_score');
  }
}
// ttUseSkill / ttTriggerWordQuiz / ttStartTimedCycle 等由 quiz.js 定義
