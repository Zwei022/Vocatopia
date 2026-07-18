// ════════════════════════════════
// 俄羅斯方塊 — 純遊戲引擎（無 DOM、無計時器、可單元測試）
// 只負責棋盤狀態、方塊生成/移動/旋轉/碰撞/消行/結束判定。
// 渲染、輸入、計時、單字題、技能都由 game.js 控制。
// ════════════════════════════════

// 方塊定義：以最小外框矩陣表示，旋轉時直接旋轉矩陣。
// 除標準 7 種四格方塊外，另加入 2 種三格（較好放）與 4 種五格（較有挑戰）方塊增加變化。
const TT_PIECES = {
  // 標準四格方塊
  I: { color: 'i', matrix: [[1, 1, 1, 1]] },
  O: { color: 'o', matrix: [[1, 1], [1, 1]] },
  T: { color: 't', matrix: [[0, 1, 0], [1, 1, 1]] },
  L: { color: 'l', matrix: [[0, 0, 1], [1, 1, 1]] },
  J: { color: 'j', matrix: [[1, 0, 0], [1, 1, 1]] },
  S: { color: 's', matrix: [[0, 1, 1], [1, 1, 0]] },
  Z: { color: 'z', matrix: [[1, 1, 0], [0, 1, 1]] },
  // 一格 / 兩格（最小，專門補洞）
  M1: { color: 'm', matrix: [[1]] },                   // 單格
  D2: { color: 'd', matrix: [[1, 1]] },                // 雙格（骨牌）
  // 三格方塊（簡單、好收尾）
  V3: { color: 'v', matrix: [[1, 0], [1, 1]] },        // 小轉角
  I3: { color: 'e', matrix: [[1, 1, 1]] },             // 小長條
  // 五格方塊（有挑戰）
  // 十字（X）已移除：五格中最容易補滿多行、對整體節奏破壞太大，拿掉後難度曲線更平順
  U:  { color: 'u', matrix: [[1, 0, 1], [1, 1, 1]] },            // U 形
  P:  { color: 'p', matrix: [[1, 1], [1, 1], [1, 0]] },          // P 形
  N:  { color: 'n', matrix: [[0, 1], [0, 1], [1, 1], [1, 0]] },  // N 形
};
const TT_TYPES = Object.keys(TT_PIECES);

// 矩陣順時針旋轉 90 度
function ttRotateMatrix(m) {
  const N = m.length, M = m[0].length;
  const r = Array.from({ length: M }, () => Array(N).fill(0));
  for (let i = 0; i < N; i++)
    for (let j = 0; j < M; j++)
      r[j][N - 1 - i] = m[i][j];
  return r;
}

// 7-bag 亂數器：每一輪把 7 種方塊洗牌後依序發出，保證分布均勻
function ttCreateBag() {
  let bag = [];
  function refill() {
    bag = [...TT_TYPES];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
  }
  return { next() { if (!bag.length) refill(); return bag.shift(); } };
}

function ttCreateEngine(cols = 8, rows = 16) {
  const board = Array.from({ length: rows }, () => Array(cols).fill(null));
  const bag = ttCreateBag();
  let active = null;       // { type, color, matrix, row, col, isBomb }
  let nextType = bag.next();
  let pendingBomb = false; // 壽司技能：下一次 spawn() 出來的方塊要標記為炸彈
  let holdType = null;     // 保留欄位目前存放的方塊種類（null＝空）
  let holdLocked = false;  // 同一顆方塊落下期間只能保留/交換一次，鎖定後才能再用

  function makePiece(type) {
    const def = TT_PIECES[type];
    const matrix = def.matrix.map(r => [...r]);
    return {
      type, color: def.color, matrix,
      row: 0,
      col: Math.floor((cols - matrix[0].length) / 2),
    };
  }

  // 檢查一個方塊放在指定位置是否合法（不出界、不重疊已鎖定方塊）
  function collides(piece, offRow = 0, offCol = 0, matrix = piece.matrix) {
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        if (!matrix[i][j]) continue;
        const r = piece.row + i + offRow;
        const c = piece.col + j + offCol;
        if (c < 0 || c >= cols || r >= rows) return true;
        if (r >= 0 && board[r][c]) return true;
      }
    }
    return false;
  }

  // 生成下一個方塊；若一出生就卡住代表遊戲結束，回傳 false
  function spawn() {
    active = makePiece(nextType);
    if (pendingBomb) {
      active.isBomb = true;
      active.color = 'bomb'; // 渲染用特殊顏色，跟同形狀的一般方塊做出區別
      pendingBomb = false;
    }
    nextType = bag.next();
    return !collides(active);
  }

  // 指定「下一個」方塊（可麗露/壽司技能用），直接覆蓋 7-bag 原本排定的結果
  function setNextType(type) {
    if (TT_PIECES[type]) nextType = type;
  }

  // 標記下一次 spawn() 的方塊為壽司炸彈（壽司技能用）
  function markNextAsBomb() {
    pendingBomb = true;
  }

  // 保留/交換目前方塊：
  // - 保留欄位是空的 → 把目前方塊放進保留欄位，直接從 7-bag 生出新方塊
  // - 保留欄位已有方塊 → 跟目前方塊互換（原方塊進保留欄位，保留欄位的方塊變成目前方塊）
  // 炸彈方塊不能保留（避免炸彈狀態跟著保留機制流失/錯亂），同一顆方塊落下期間只能用一次。
  function hold() {
    if (!active || active.isBomb || holdLocked) return false;
    if (holdType === null) {
      holdType = active.type;
      spawn();
    } else {
      const swapped = holdType;
      holdType = active.type;
      active = makePiece(swapped);
    }
    holdLocked = true;
    return true;
  }

  function move(offCol) {
    if (!active || collides(active, 0, offCol)) return false;
    active.col += offCol;
    return true;
  }

  // 順時針旋轉，附帶簡易 wall kick（貼牆時嘗試左右挪 1~2 格）
  function rotate() {
    if (!active) return false;
    const rotated = ttRotateMatrix(active.matrix);
    for (const kick of [0, -1, 1, -2, 2]) {
      if (!collides(active, 0, kick, rotated)) {
        active.matrix = rotated;
        active.col += kick;
        return true;
      }
    }
    return false;
  }

  // 把 active 鎖進棋盤
  function lockPiece() {
    for (let i = 0; i < active.matrix.length; i++) {
      for (let j = 0; j < active.matrix[i].length; j++) {
        if (!active.matrix[i][j]) continue;
        const r = active.row + i, c = active.col + j;
        if (r >= 0 && r < rows && c >= 0 && c < cols) board[r][c] = active.color;
      }
    }
    active = null;
  }

  // 消除填滿的行，回傳消掉的行數
  function clearLines() {
    let cleared = 0;
    for (let r = rows - 1; r >= 0; r--) {
      // 整列填滿才消除，但「懲罰列」（含灰色 'g'）是永久鎖住、不可被消除，要跳過
      if (board[r].every(cell => cell) && !board[r].includes('g')) {
        board.splice(r, 1);
        board.unshift(Array(cols).fill(null));
        cleared++;
        r++; // 同一列重新檢查（因為上方整體下移）
      }
    }
    return cleared;
  }

  // 壽司炸彈爆炸：以方塊鎖定位置為中心炸開 3×3 範圍（超出棋盤邊界的部分自動裁切）。
  // 範圍內不論是否為一般方塊或懲罰灰色列都會被清除，不像 clearLines() 只認整列填滿。
  // 回傳實際被清掉的格數（給計分用）。
  const TT_BOMB_RADIUS = 1; // 3x3：中心 ±1
  function explodeBomb() {
    const midRow = active.row + Math.floor(active.matrix.length / 2);
    const midCol = active.col + Math.floor(active.matrix[0].length / 2);
    let count = 0;
    for (let r = midRow - TT_BOMB_RADIUS; r <= midRow + TT_BOMB_RADIUS; r++) {
      if (r < 0 || r >= rows) continue;
      for (let c = midCol - TT_BOMB_RADIUS; c <= midCol + TT_BOMB_RADIUS; c++) {
        if (c < 0 || c >= cols) continue;
        if (board[r][c]) count++;
        board[r][c] = null;
      }
    }
    active = null;
    return count;
  }

  // 龍蝦技能：無條件清空最底 n 行（不論是否已鎖住或為懲罰灰色列），
  // 上方內容整體下移對齊，最上方補齊空白列（跟 clearLines 的位移方式一致）。
  function clearBottomRows(n) {
    for (let i = 0; i < n; i++) {
      board.splice(rows - 1, 1);
      board.unshift(Array(cols).fill(null));
    }
  }

  // 重力一格：能降就降；不能降就鎖定（或炸彈爆炸）+消行+生成新方塊
  // 回傳 { moved, locked, cleared, gameOver, bombed, bombedCount }
  function tick() {
    if (!active) {
      const ok = spawn();
      return { moved: false, locked: false, cleared: 0, gameOver: !ok, bombed: false };
    }
    if (!collides(active, 1, 0)) {
      active.row += 1;
      return { moved: true, locked: false, cleared: 0, gameOver: false, bombed: false };
    }
    if (active.isBomb) {
      const bombedCount = explodeBomb();
      const ok = spawn();
      holdLocked = false; // 這顆方塊已經落定，下一顆可以再保留/交換
      return { moved: false, locked: true, cleared: 0, gameOver: !ok, bombed: true, bombedCount };
    }
    lockPiece();
    const cleared = clearLines();
    const ok = spawn();
    holdLocked = false; // 這顆方塊已經落定，下一顆可以再保留/交換
    return { moved: false, locked: true, cleared, gameOver: !ok, bombed: false };
  }

  // #14 積分模式閱讀理解關卡答錯懲罰：左右兩排（第 0 欄與最後一欄）從最上到最下整條鎖成牆。
  // 跟 addGarbageRow 的灰色 'g' 不同——'w' 沒有排進 clearLines() 的排除清單，
  // 所以哪一整排（含牆格）被填滿，那一排照常消除，牆格跟著一起消失（= 該行解鎖）；
  // 其他還沒填滿的行牆格則維持鎖住。
  function lockSideWalls() {
    for (let r = 0; r < rows; r++) {
      board[r][0] = 'w';
      board[r][cols - 1] = 'w';
    }
  }

  // 懲罰：從最底層往上鎖一整欄（灰色不可消，其實是整列填灰）；
  // 若因此頂到最上方視為遊戲結束
  function addGarbageRow() {
    // 整體上移一列，最底補一列灰色
    const top = board[0];
    if (top.some(cell => cell)) return true; // 頂出 → game over
    board.shift();
    board.push(Array(cols).fill('g'));
    // active 也跟著上移一格，避免疊到剛長出來的灰列
    if (active) active.row -= 1;
    return false;
  }

  return {
    cols, rows, board,
    get active() { return active; },
    get nextType() { return nextType; },
    get pendingBomb() { return pendingBomb; },
    get holdType() { return holdType; },
    get holdLocked() { return holdLocked; },
    spawn, move, rotate, tick, clearLines, addGarbageRow, lockSideWalls, collides, setNextType,
    markNextAsBomb, clearBottomRows, hold,
    // 給渲染用：回傳「棋盤 + 當前落下方塊」合併後的畫面（不改動 board）
    render() {
      const view = board.map(row => [...row]);
      if (active) {
        for (let i = 0; i < active.matrix.length; i++)
          for (let j = 0; j < active.matrix[i].length; j++) {
            if (!active.matrix[i][j]) continue;
            const r = active.row + i, c = active.col + j;
            if (r >= 0 && r < rows && c >= 0 && c < cols) view[r][c] = active.color;
          }
      }
      return view;
    },
  };
}

// 讓 Node 測試環境也能 require（瀏覽器則掛在 window）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ttCreateEngine, ttRotateMatrix, ttCreateBag, TT_PIECES, TT_TYPES };
}
