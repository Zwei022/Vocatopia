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

console.log(`\nENGINE TESTS: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
