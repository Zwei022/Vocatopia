// 俄羅斯方塊引擎單元測試（純邏輯，node 直接執行：node game/tetris/engine.test.js）
// 驗證旋轉、7-bag、碰撞、消行、懲罰、結束判定等核心規則。
const { ttCreateEngine, ttRotateMatrix, ttCreateBag, TT_PIECES, TT_TYPES } = require('./engine.js');

let pass = 0, fail = 0;
function ok(name, cond) { if (cond) pass++; else { fail++; console.log('  ✗ FAIL:', name); } }

// 矩陣旋轉
const t = [[0, 1, 0], [1, 1, 1]];
ok('rotate T dims', ttRotateMatrix(t).length === 3 && ttRotateMatrix(t)[0].length === 2);
ok('rotate T values', JSON.stringify(ttRotateMatrix(t)) === JSON.stringify([[1, 0], [1, 1], [1, 0]]));
let m = t; for (let i = 0; i < 4; i++) m = ttRotateMatrix(m);
ok('rotate 4x = original', JSON.stringify(m) === JSON.stringify(t));

// N-bag 均勻：每一輪把全部方塊各發一次（不重複）
const N = TT_TYPES.length;
const bag = ttCreateBag();
const s1 = new Set(), s2 = new Set();
for (let i = 0; i < N; i++) s1.add(bag.next());
for (let i = 0; i < N; i++) s2.add(bag.next());
ok('bag deals all types once per bag', s1.size === N && s2.size === N);

// 所有方塊都能生成、旋轉四次回到原狀、且格子數正確（4格/5格/3格）
let allPiecesOk = true;
for (const type of TT_TYPES) {
  let m = TT_PIECES[type].matrix;
  const cells = m.flat().filter(x => x).length;
  if (![1, 2, 3, 4, 5].includes(cells)) allPiecesOk = false;
  let rm = m; for (let i = 0; i < 4; i++) rm = ttRotateMatrix(rm);
  if (JSON.stringify(rm) !== JSON.stringify(m)) allPiecesOk = false;
}
ok('all pieces valid & rotate 4x back to original', allPiecesOk);

// 生成與邊界
const e = ttCreateEngine(8, 16);
ok('spawn ok', e.spawn() === true && e.active !== null);
let mv = 0; while (e.move(-1)) { if (++mv > 20) break; }
ok('left wall blocks', mv <= 8 && e.move(-1) === false);

// 落地鎖定
const e2 = ttCreateEngine(8, 16); e2.spawn();
let locked = false; for (let i = 0; i < 100 && !locked; i++) locked = e2.tick().locked;
ok('piece eventually locks', locked);

// 消行
const e3 = ttCreateEngine(8, 16);
for (let c = 0; c < 8; c++) e3.board[15][c] = 'i';
ok('full row cleared', e3.clearLines() === 1);
ok('bottom empty after clear', e3.board[15].every(x => x === null));
const e4 = ttCreateEngine(8, 16);
for (let c = 0; c < 7; c++) e4.board[15][c] = 'i';
ok('partial row not cleared', e4.clearLines() === 0);

// 懲罰列
const e5 = ttCreateEngine(8, 16); e5.board[15][0] = 'i';
ok('garbage not over when top clear', e5.addGarbageRow() === false);
ok('garbage bottom all gray', e5.board[15].every(x => x === 'g'));

// 懲罰列（整列灰）不可被消除：clearLines 必須跳過它，永久鎖住
const eg = ttCreateEngine(8, 16);
for (let c = 0; c < 8; c++) eg.board[15][c] = 'g';
ok('garbage full row NOT cleared', eg.clearLines() === 0);
ok('garbage row still there after clear', eg.board[15].every(x => x === 'g'));
// 懲罰列上方的正常滿列仍可正常消除
for (let c = 0; c < 8; c++) eg.board[14][c] = 'i';
ok('normal row above garbage still clears', eg.clearLines() === 1);
ok('garbage row survives clearing row above', eg.board[15].every(x => x === 'g'));

// 結束判定
const e6 = ttCreateEngine(8, 16);
for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) e6.board[r][c] = 'i';
ok('spawn fails when top blocked', e6.spawn() === false);

// setNextType / markNextAsBomb（可麗露/壽司技能）
const e7 = ttCreateEngine(8, 16);
e7.setNextType('I');
ok('setNextType overrides next piece', e7.nextType === 'I');
e7.markNextAsBomb();
ok('pendingBomb true after markNextAsBomb', e7.pendingBomb === true);
e7.spawn();
ok('spawned piece is tagged as bomb', e7.active.isBomb === true && e7.active.color === 'bomb');
ok('pendingBomb cleared after spawn consumes it', e7.pendingBomb === false);
ok('next spawn without marking is not a bomb', (() => { e7.setNextType('O'); e7.spawn(); return e7.active.isBomb !== true; })());

// 壽司炸彈：鎖定時炸開 3x3，範圍內方塊全部清除（含懲罰灰列）
const e8 = ttCreateEngine(8, 16);
for (let r = 10; r < 16; r++) for (let c = 0; c < 8; c++) e8.board[r][c] = (r === 15 ? 'g' : 'i');
e8.setNextType('M1');
e8.markNextAsBomb();
e8.spawn();
e8.active.row = 15; e8.active.col = 4; // 落在最底部中間
let bombEv = null;
for (let i = 0; i < 5 && !bombEv; i++) { const ev = e8.tick(); if (ev.bombed) bombEv = ev; }
ok('bomb explosion event fired', bombEv !== null);
// 中心在 row15,col4，3x3 只清 row14~15 × col3~5
ok('bomb cleared center cells within 3x3', e8.board[15][4] === null && e8.board[14][4] === null);
ok('bomb left cells outside 3x3 untouched', e8.board[15][0] === 'g' && e8.board[15][7] === 'g' && e8.board[13][4] === 'i');

// 龍蝦清盤：無條件清空最底 n 行（即使是懲罰灰列也直接移除），上方內容整體下移對齊填補空缺
const e9 = ttCreateEngine(8, 16);
for (let c = 0; c < 8; c++) { e9.board[15][c] = 'g'; e9.board[14][c] = 'g'; e9.board[13][c] = 'i'; }
e9.clearBottomRows(2);
ok('clearBottomRows removes garbage rows (bottom becomes the shifted-down row13 content, not garbage)', e9.board[15].every(x => x === 'i'));
ok('clearBottomRows shifts everything down by n, leaving row14 empty', e9.board[14].every(x => x === null));
ok('clearBottomRows preserves total row count', e9.board.length === 16);

// 十字方塊已移除
ok('X (cross) piece removed from piece set', !TT_TYPES.includes('X') && !TT_PIECES.X);

// 保留/交換：空欄位時先存入，之後再用一次變成交換
const e10 = ttCreateEngine(8, 16);
e10.setNextType('O'); e10.spawn(); // active = O
const firstType = e10.active.type;
ok('hold starts empty', e10.holdType === null);
ok('hold() succeeds on first use', e10.hold() === true);
ok('holdType now holds the piece that was active', e10.holdType === firstType);
ok('holdLocked true right after holding', e10.holdLocked === true);
ok('hold() blocked a second time before next piece locks', e10.hold() === false);
// 落地一次，holdLocked 應該解除
for (let i = 0; i < 40 && !e10.tick().locked;) {}
ok('holdLocked resets after a piece locks', e10.holdLocked === false);
// 這次保留欄位已經有東西了，呼叫 hold() 應該是「交換」：目前方塊種類要變成原本存的 firstType
const beforeSwapType = e10.active.type;
e10.hold();
ok('second hold swaps active piece to the previously held type', e10.active.type === firstType);
ok('previously active piece type now sits in hold', e10.holdType === beforeSwapType);

// 炸彈方塊不能保留
const e11 = ttCreateEngine(8, 16);
e11.setNextType('M1'); e11.markNextAsBomb(); e11.spawn();
ok('cannot hold a bomb-marked piece', e11.hold() === false);

// #14 積分模式閱讀理解懲罰：lockSideWalls() 把左右兩排整條鎖成牆 'w'
const e12 = ttCreateEngine(8, 16);
e12.lockSideWalls();
ok('lockSideWalls locks entire left column', e12.board.every(row => row[0] === 'w'));
ok('lockSideWalls locks entire right column', e12.board.every(row => row[7] === 'w'));
ok('lockSideWalls leaves middle columns untouched', e12.board.every(row => row.slice(1, 7).every(c => c === null)));
// 牆格會擋住方塊碰撞（跟一般已鎖定方塊一樣，不能穿過）
ok('wall cell blocks collision', e12.collides({ matrix: [[1]], row: 0, col: 0 }) === true);
// 跟懲罰灰列 'g' 不同：'w' 不在 clearLines() 的排除清單裡，
// 整排（含牆格）填滿就照常消除，牆格跟著一起消失 = 該行解鎖
for (let c = 1; c < 7; c++) e12.board[15][c] = 'i';
ok('row with wall cells clears normally once middle is filled (unlock via clear)', e12.clearLines() === 1);
// 第 15 排被消除後，上方所有行（含各自的牆格）整體下移一格填補，
// 所以新的第 15 排是「原本第 14 排」，牆格仍在（只是中間補回 null，之前疊的 'i' 已隨消除行離開棋盤）
ok('row that shifted down still has its own wall locked', e12.board[15][0] === 'w' && e12.board[15][7] === 'w');
ok('shifted-down row middle is empty (its own content, not the cleared row\'s)', e12.board[15].slice(1, 7).every(x => x === null));

console.log(`\nENGINE TESTS: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
