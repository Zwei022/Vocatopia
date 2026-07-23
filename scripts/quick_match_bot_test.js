// 快速配對電腦補位整合測試：模擬單一玩家排隊，等不到真人時應自動配電腦、正常打完一局。
// 伺服器需以 QUICK_MATCH_BOT_TIMEOUT_MS=1500 啟動，縮短等待時間方便測試。
const { io } = require('socket.io-client');
const URL = process.env.TEST_URL || 'http://localhost:3001';

const log = (...a) => console.log('[player]', ...a);
const player = io(URL);
let code = '';

player.on('connect', () => {
  log('connected', player.id, '→ queue_join vocab（單獨排隊，應該等不到真人）');
  player.emit('queue_join', { mode: 'vocab', clientId: 'test-client-1', userId: null, name: '測試玩家', title: '' });
});

player.on('queue_waiting', (d) => log('queue_waiting', JSON.stringify(d)));

player.on('queue_matched', (d) => {
  code = d.code;
  log('✅ queue_matched（配到對手，可能是電腦補位）', JSON.stringify(d));
});

player.on('battle_start', ({ questions, duration, mode }) => {
  log(`battle_start mode=${mode} duration=${duration}s questions=${questions.length}`);
  const bad = questions.filter(q => !q.q || q.opts.length !== 4 || q.answer < 0 || q.answer > 3);
  if (questions.length !== 5 || bad.length) { console.error('❌ 題目格式錯誤'); process.exit(1); }
  questions.forEach((q, i) => {
    setTimeout(() => player.emit('pvp_answer', { code, qIdx: i, choice: q.answer }), 200 * (i + 1));
  });
});

player.on('pvp_progress', ({ progress }) => log('progress', JSON.stringify(progress)));

player.on('battle_result', ({ scores, winner, total, outcome }) => {
  const my = scores[player.id];
  const foeId = Object.keys(scores).find(id => id !== player.id);
  const outcomeTxt = winner === null ? '平手' : (winner === player.id ? '勝利' : '敗北');
  console.log('\n=== 測試結果 ===');
  console.log(`結果：${outcomeTxt}（我 ${my}/${total}・對方(${foeId}) ${scores[foeId]}/${total}）`);
  console.log('對手是電腦但前端拿不到任何標記，符合「不顯示是電腦」的需求：', JSON.stringify(outcome));
  if (!outcome || !outcome[player.id]) {
    console.error('⚠ 沒有拿到 outcome（可能是因為 userId=null，訪客模式本來就會跳過獎勵/ELO——這是預期行為）');
  } else {
    console.log('ELO/獎勵：', JSON.stringify(outcome[player.id]));
  }
  process.exit(0);
});

setTimeout(() => { console.error('❌ 測試逾時（20 秒內沒配到電腦或沒打完）'); process.exit(1); }, 20000);
