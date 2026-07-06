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

// 消行計分表
const TT_LINE_SCORE = { 1: 100, 2: 300, 3: 500, 4: 800 };

let ttGame = null;

function _ttOverlay() { return document.getElementById('tetrisOverlay'); }

function tetrisStart() {
  const ov = _ttOverlay();
  if (!ov) return;

  const engine = ttCreateEngine(TT_COLS, TT_ROWS);
  engine.spawn();

  ttGame = {
    engine,
    score: 0,
    lines: 0,
    gravityInt: null,
    paused: false,
    gameOver: false,
    softDropping: false,
    holdTimer: null,
    isHolding: false,
  };

  const ch = (typeof getDeployedChar === 'function') ? getDeployedChar() : null;

  ov.innerHTML = `
    <div class="tt-topbar">
      <button class="tt-back" onclick="tetrisClose()">← 離開</button>
      <div class="tt-topbar-title">單字對戰</div>
      <div class="tt-score-chip">分數 <b id="ttScore">0</b></div>
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
        <div class="tt-side-card tt-lines-card">
          <div class="tt-side-label">消除行數</div>
          <div class="tt-lines" id="ttLines">0</div>
        </div>
        <button class="tt-skill-btn" id="ttSkill" onclick="ttUseSkill()" disabled>
          <div class="tt-skill-ava">${ch ? `<img src="${ch.img}" alt="">` : '🎮'}</div>
          <div class="tt-skill-name">${ch ? ch.skill.name : '技能'}</div>
          <div class="tt-skill-cd" id="ttSkillCd"></div>
        </button>
      </div>
    </div>

    <div class="tt-controls">
      <button class="tt-ctrl tt-ctrl-side" id="ttBtnLeft" aria-label="左移">◀</button>
      <button class="tt-ctrl tt-ctrl-circle" id="ttBtnCircle" aria-label="旋轉/下墜">◉</button>
      <button class="tt-ctrl tt-ctrl-side" id="ttBtnRight" aria-label="右移">▶</button>
    </div>

    <!-- 題目彈層（Phase 3 使用） -->
    <div class="tt-quiz" id="ttQuiz" style="display:none"></div>
  `;

  ov.style.display = 'flex';

  _ttBuildBoardCells();
  _ttBindControls();
  _ttResizeBoard();
  window.addEventListener('resize', _ttResizeBoard);

  ttRender();
  _ttSetGravity(TT_GRAVITY_MS);

  // Phase 4：技能與計時題會在此啟動
  if (typeof ttInitSkill === 'function') ttInitSkill(ch);
  if (typeof ttStartTimedCycle === 'function') ttStartTimedCycle();
}

function tetrisClose() {
  if (ttGame) {
    clearInterval(ttGame.gravityInt);
    if (typeof ttStopTimedCycle === 'function') ttStopTimedCycle();
  }
  window.removeEventListener('resize', _ttResizeBoard);
  const ov = _ttOverlay();
  if (ov) { ov.style.display = 'none'; ov.innerHTML = ''; }
  ttGame = null;
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
}

function _ttRenderNext() {
  const el = document.getElementById('ttNext');
  const type = ttGame.engine.nextType;
  const m = TT_PIECES[type].matrix;
  const color = TT_PIECES[type].color;
  const rows = m.length, cols = m[0].length;
  let html = '';
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      html += `<div class="tt-next-cell${m[r][c] ? ' fill-' + color : ''}"></div>`;
  el.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  el.innerHTML = html;
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
  if (ev.moved && ttGame.softDropping) ttGame.score += 1; // 軟降加分
  if (ev.locked && ev.cleared > 0) ttOnLineClear(ev.cleared);
  if (ev.gameOver) { ttRender(); ttEndGame(); return; }
  ttRender();
}

// 消行事件：基礎加分（Phase 3 會在此觸發單字快問）
function ttOnLineClear(n) {
  ttGame.lines += n;
  ttGame.score += (TT_LINE_SCORE[n] || n * 100);
  if (typeof ttTriggerWordQuiz === 'function') ttTriggerWordQuiz(n);
}

// ── 輸入：三按鈕 + 鍵盤（桌面測試用） ──
function _ttMove(dir) {
  if (!ttGame || ttGame.paused || ttGame.gameOver) return;
  if (ttGame.engine.move(dir)) ttRender();
}
function _ttRotate() {
  if (!ttGame || ttGame.paused || ttGame.gameOver) return;
  if (ttGame.engine.rotate()) ttRender();
}
function _ttStartSoftDrop() {
  if (!ttGame || ttGame.paused || ttGame.gameOver) return;
  ttGame.softDropping = true;
  _ttSetGravity(TT_SOFTDROP_MS);
}
function _ttStopSoftDrop() {
  if (!ttGame) return;
  ttGame.softDropping = false;
  _ttSetGravity(TT_GRAVITY_MS);
}

function _ttBindControls() {
  const left = document.getElementById('ttBtnLeft');
  const right = document.getElementById('ttBtnRight');
  const circle = document.getElementById('ttBtnCircle');

  // 左右：點一下移動一格；按住則連續移動
  _ttBindRepeat(left, () => _ttMove(-1));
  _ttBindRepeat(right, () => _ttMove(1));

  // 圓圈：短按=旋轉，長按=加速下墜
  const down = (e) => {
    e.preventDefault();
    ttGame.isHolding = false;
    ttGame.holdTimer = setTimeout(() => { ttGame.isHolding = true; _ttStartSoftDrop(); }, 160);
  };
  const up = (e) => {
    e.preventDefault();
    clearTimeout(ttGame.holdTimer);
    if (ttGame.isHolding) _ttStopSoftDrop();
    else _ttRotate();
    ttGame.isHolding = false;
  };
  circle.addEventListener('pointerdown', down);
  circle.addEventListener('pointerup', up);
  circle.addEventListener('pointerleave', up);
  circle.addEventListener('pointercancel', up);

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
  };
  ttGame._keyUpHandler = (e) => {
    if (e.key === 'ArrowDown' && ttGame && ttGame.softDropping) _ttStopSoftDrop();
  };
  document.addEventListener('keydown', ttGame._keyHandler);
  document.addEventListener('keyup', ttGame._keyUpHandler);
}

// 點一下觸發一次；按住 260ms 後每 90ms 連發（左右移動用）
function _ttBindRepeat(el, fn) {
  let repeatTimer = null, delayTimer = null;
  const start = (e) => {
    e.preventDefault();
    fn();
    delayTimer = setTimeout(() => { repeatTimer = setInterval(fn, 90); }, 260);
  };
  const stop = () => { clearTimeout(delayTimer); clearInterval(repeatTimer); };
  el.addEventListener('pointerdown', start);
  el.addEventListener('pointerup', stop);
  el.addEventListener('pointerleave', stop);
  el.addEventListener('pointercancel', stop);
}

// ── 結束 ──
function ttEndGame() {
  if (!ttGame || ttGame.gameOver) return;
  ttGame.gameOver = true;
  clearInterval(ttGame.gravityInt);
  if (typeof ttStopTimedCycle === 'function') ttStopTimedCycle();
  document.removeEventListener('keydown', ttGame._keyHandler);
  document.removeEventListener('keyup', ttGame._keyUpHandler);

  const finalScore = ttGame.score;
  const finalLines = ttGame.lines;

  // Phase 4：上傳排行榜
  if (typeof ttSubmitScore === 'function') ttSubmitScore(finalScore);

  const ov = _ttOverlay();
  const panel = document.createElement('div');
  panel.className = 'tt-gameover';
  panel.innerHTML = `
    <div class="tt-go-box">
      <div class="tt-go-icon">🎮</div>
      <div class="tt-go-title">遊戲結束</div>
      <div class="tt-go-score">${finalScore.toLocaleString()} 分</div>
      <div class="tt-go-lines">消除 ${finalLines} 行</div>
      <div class="tt-go-btns">
        <button class="tt-go-again" onclick="tetrisClose();tetrisStart()">再玩一次</button>
        <button class="tt-go-back" onclick="tetrisClose()">返回首頁</button>
      </div>
    </div>`;
  ov.appendChild(panel);
}
// ttUseSkill / ttTriggerWordQuiz / ttStartTimedCycle 等由 quiz.js 定義
