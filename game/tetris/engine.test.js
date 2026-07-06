// 俄羅斯方塊引擎單元測試（純邏輯，node 直接執行：node game/tetris/engine.test.js）
// 驗證旋轉、7-bag、碰撞、消行、懲罰、結束判定等核心規則。
const { ttCreateEngine, ttRotateMatrix, ttCreateBag } = require('./engine.js');

let pass = 0, fail = 0;
function ok(name, cond) { if (cond) pass++; else { fail++; console.log('  ✗ FAIL:', name); } }

// 矩陣旋轉
const t = [[0, 1, 0], [1, 1, 1]];
ok('rotate T dims', ttRotateMatrix(t).length === 3 && ttRotateMatrix(t)[0].length === 2);
ok('rotate T values', JSON.stringify(ttRotateMatrix(t)) === JSON.stringify([[1, 0], [1, 1], [1, 0]]));
let m = t; for (let i = 0; i < 4; i++) m = ttRotateMatrix(m);
ok('rotate 4x = original', JSON.stringify(m) === JSON.stringify(t));

// 7-bag 均勻
const bag = ttCreateBag();
const s1 = new Set(), s2 = new Set();
for (let i = 0; i < 7; i++) s1.add(bag.next());
for (let i = 0; i < 7; i++) s2.add(bag.next());
ok('bag first 7 all unique', s1.size === 7);
ok('bag second 7 all unique', s2.size === 7);

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

// 結束判定
const e6 = ttCreateEngine(8, 16);
for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) e6.board[r][c] = 'i';
ok('spawn fails when top blocked', e6.spawn() === false);

console.log(`\nENGINE TESTS: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
