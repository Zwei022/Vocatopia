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
const TT_SOFTDROP_MS = 55;    // 長按加速下降速度

// #14 模式拆分：單機（solo，不上榜不計最高分，難度固定）／積分（ranked，上榜、算最高分、
// 重力隨時間漸快、每 5000 分有閱讀理解關卡）。規則其餘完全相同。
const TT_RANKED_RAMP_MS    = 20000; // 積分模式每隔多久重力加快一次
const TT_RANKED_RAMP_STEP  = 40;    // 每次加快多少毫秒
const TT_RANKED_RAMP_FLOOR = 200;   // 最快不低於這個值

// 消行計分表
const TT_LINE_SCORE = { 1: 100, 2: 300, 3: 500, 4: 800 };

let ttGame = null;

function _ttOverlay() { return document.getElementById('tetrisOverlay'); }

function tetrisStart(mode) {
  const ov = _ttOverlay();
  if (!ov) return;
  mode = (mode === 'ranked') ? 'ranked' : 'solo';

  const engine = ttCreateEngine(TT_COLS, TT_ROWS);
  engine.spawn();

  ttGame = {
    engine,
    mode,
    score: 0,
    lines: 0,
    gravityInt: null,
    rankedRampInt: null,
    currentGravityMs: TT_GRAVITY_MS,
    nextReadingThreshold: TT_READING_STEP,
    paused: false,
    gameOver: false,
    softDropping: false,
  };

  const ch = (typeof getDeployedChar === 'function') ? getDeployedChar() : null;

  ov.innerHTML = `
    <div class="tt-topbar">
      <button class="tt-back" onclick="tetrisClose()">← 離開</button>
      <div class="tt-topbar-title">${mode === 'ranked' ? '🏆 積分模式' : '🧘 單機模式'}</div>
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
        <button class="tt-ctrl-half tt-ctrl-half-bottom" id="ttBtnDrop" aria-label="加速降落">▼</button>
      </div>
      <button class="tt-ctrl tt-ctrl-side" id="ttBtnRight" aria-label="右移">▶</button>
    </div>

    <!-- 題目彈層（Phase 3 使用） -->
    <div class="tt-quiz" id="ttQuiz" style="display:none"></div>

    <!-- 可麗露技能：選擇下一個方塊 -->
    <div class="tt-piece-picker" id="ttPiecePicker" style="display:none"></div>
  `;

  ov.style.display = 'flex';

  _ttBuildBoardCells();
  _ttBindControls();
  _ttResizeBoard();
  window.addEventListener('resize', _ttResizeBoard);

  ttRender();
  _ttSetGravity(ttGame.currentGravityMs);
  if (mode === 'ranked') _ttStartRankedRamp();

  // Phase 4：技能與計時題會在此啟動
  if (typeof ttInitSkill === 'function') ttInitSkill(ch);
  if (typeof ttStartTimedCycle === 'function') ttStartTimedCycle();
}

// 積分模式：每隔 TT_RANKED_RAMP_MS 重力加快一次，最快封頂在 TT_RANKED_RAMP_FLOOR
function _ttStartRankedRamp() {
  if (!ttGame) return;
  ttGame.rankedRampInt = setInterval(() => {
    if (!ttGame || ttGame.gameOver) return;
    if (ttGame.currentGravityMs <= TT_RANKED_RAMP_FLOOR) return;
    ttGame.currentGravityMs = Math.max(TT_RANKED_RAMP_FLOOR, ttGame.currentGravityMs - TT_RANKED_RAMP_STEP);
    if (!ttGame.paused && !ttGame.softDropping) _ttSetGravity(ttGame.currentGravityMs);
  }, TT_RANKED_RAMP_MS);
}

// 集中處理分數變動：統一下限保護（不會變負數），並在積分模式檢查是否觸發閱讀理解關卡
function _ttAddScore(n) {
  if (!ttGame) return;
  ttGame.score += n;
  if (ttGame.score < 0) ttGame.score = 0;
  if (typeof _ttCheckReadingGate === 'function') _ttCheckReadingGate();
}

async function tetrisClose() {
  const g = ttGame;
  if (g) {
    clearInterval(g.gravityInt);
    if (g.rankedRampInt) clearInterval(g.rankedRampInt);
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
  const cells = document.getElementById('ttBoard').children;
  for (let r = 0; r < TT_ROWS; r++) {
    for (let c = 0; c < TT_COLS; c++) {
      const cell = cells[r * TT_COLS + c];
      const color = view[r][c];
      cell.className = 'tt-cell' + (color ? ' fill-' + color : '');
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
  if (ev.moved && ttGame.softDropping) _ttAddScore(1); // 軟降加分
  if (ev.bombed) {
    if (typeof SFX !== 'undefined') SFX.bomb();
    if (typeof ttOnBombExplode === 'function') ttOnBombExplode(ev.bombedCount);
  } else if (ev.locked && ev.cleared > 0) {
    ttOnLineClear(ev.cleared);
  } else if (ev.locked) {
    if (typeof SFX !== 'undefined') SFX.lock();
  }
  if (ev.gameOver) { ttRender(); ttEndGame(); return; }
  ttRender();
}

// 消行事件：基礎加分（Phase 3 會在此觸發單字快問）
function ttOnLineClear(n) {
  ttGame.lines += n;
  _ttAddScore(TT_LINE_SCORE[n] || n * 100);
  if (typeof SFX !== 'undefined') SFX.lineClear(n);
  if (typeof ttTriggerWordQuiz === 'function') ttTriggerWordQuiz(n);
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
function _ttStartSoftDrop() {
  if (!ttGame || ttGame.paused || ttGame.gameOver) return;
  ttGame.softDropping = true;
  _ttSetGravity(TT_SOFTDROP_MS);
}
function _ttStopSoftDrop() {
  if (!ttGame) return;
  ttGame.softDropping = false;
  _ttSetGravity(ttGame.currentGravityMs);
}

function _ttBindControls() {
  const left = document.getElementById('ttBtnLeft');
  const right = document.getElementById('ttBtnRight');
  const rotateBtn = document.getElementById('ttBtnRotate');
  const dropBtn = document.getElementById('ttBtnDrop');

  // 左右：點一下移動一格；按住則連續移動
  _ttBindRepeat(left, () => _ttMove(-1));
  _ttBindRepeat(right, () => _ttMove(1));

  // 圓形按鈕分上下兩瓣：上半＝旋轉（按下立即觸發一次），下半＝按住加速降落、放開恢復正常重力
  rotateBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    try { rotateBtn.setPointerCapture(e.pointerId); } catch { /* 不支援就算了 */ }
    _ttRotate();
  });

  let dropPressed = false;
  const dropDown = (e) => {
    e.preventDefault();
    if (!ttGame || dropPressed) return;
    dropPressed = true;
    try { dropBtn.setPointerCapture(e.pointerId); } catch { /* 不支援就算了 */ }
    _ttStartSoftDrop();
  };
  const dropFinish = () => {
    if (!dropPressed) return;
    dropPressed = false;
    _ttStopSoftDrop();
  };
  dropBtn.addEventListener('pointerdown', dropDown);
  dropBtn.addEventListener('pointerup', (e) => { e.preventDefault(); dropFinish(); });
  dropBtn.addEventListener('pointercancel', dropFinish);

  // 鍵盤（桌面測試/遊玩）
  ttGame._keyHandler = (e) => {
    if (!ttGame) return;
    if (e.key === 'ArrowLeft')  { _ttMove(-1); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { _ttMove(1); e.preventDefault(); }
    else if (e.key === 'ArrowUp' || e.key === ' ') { _ttRotate(); e.preventDefault(); }
    else if (e.key === 'ArrowDown') {
      if (!ttGame.softDropping) _ttStartSoftDrop();
      e.preventDefault();
    }
    else if (e.key === 'c' || e.key === 'C' || e.key === 'Shift') { ttUseHold(); e.preventDefault(); }
  };
  ttGame._keyUpHandler = (e) => {
    if (e.key === 'ArrowDown' && ttGame && ttGame.softDropping) _ttStopSoftDrop();
  };
  document.addEventListener('keydown', ttGame._keyHandler);
  document.addEventListener('keyup', ttGame._keyUpHandler);
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
  if (ttGame.rankedRampInt) clearInterval(ttGame.rankedRampInt);
  if (typeof ttStopTimedCycle === 'function') ttStopTimedCycle();
  document.removeEventListener('keydown', ttGame._keyHandler);
  document.removeEventListener('keyup', ttGame._keyUpHandler);

  const finalScore = ttGame.score;
  const finalLines = ttGame.lines;
  const mode = ttGame.mode;
  const isRanked = mode === 'ranked';

  // 本機最高分比較（決定是否顯示「新紀錄」）；#14 單機模式不計入最高分，不比較、不顯示新紀錄
  let prevBest = 0;
  try { prevBest = parseInt(localStorage.getItem(LS_TETRIS_BEST) || '0', 10) || 0; } catch { /* ignore */ }
  const isNewBest = isRanked && finalScore > prevBest;
  if (typeof SFX !== 'undefined') isNewBest ? SFX.newRecord() : SFX.gameOver();

  // 上傳排行榜（只有積分模式；未登入只存本機、不上榜）
  ttSubmitScore(finalScore, mode);
  // #2 一場結束給經驗值（每日前 5 場、有防刷上限，兩種模式都給）
  if (typeof awardTetrisXp === 'function') awardTetrisXp(finalLines);

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
