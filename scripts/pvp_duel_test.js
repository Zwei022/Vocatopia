// PVP 單字對決整合測試：模擬兩個玩家走完整流程
const { io } = require('socket.io-client');
const URL = process.env.TEST_URL || 'http://localhost:3001';

const log = (who, ...a) => console.log(`[${who}]`, ...a);
let code = '';
let questions = null;
let results = [];
const done = () => {
  if (results.length === 2) {
    console.log('\n=== 測試結果 ===');
    results.forEach(r => console.log(r));
    process.exit(0);
  }
};

const host = io(URL);
const guest = io(URL);

host.on('connect', () => {
  log('host', 'connected', host.id);
  host.emit('create_room');
});

host.on('room_created', (d) => {
  code = d.code;
  log('host', 'room_created', code);
  guest.emit('join_room', { code });
});

host.on('room_ready', () => {
  log('host', 'room_ready → select mode + start');
  host.emit('select_mode', { code, mode: 'vocab' });
  host.emit('start_battle', { code });
});

guest.on('room_ready', () => log('guest', 'room_ready'));
guest.on('mode_selected', (d) => log('guest', 'mode_selected', d.mode));
guest.on('room_error', (d) => { console.error('guest room_error:', d.msg); process.exit(1); });

function play(sock, who, strategy) {
  sock.on('battle_start', ({ questions: qs, duration, mode }) => {
    log(who, `battle_start mode=${mode} duration=${duration}s questions=${qs.length}`);
    if (who === 'host') {
      questions = qs;
      console.log('  題目範例:', JSON.stringify(qs[0]).slice(0, 160));
      const bad = qs.filter(q => !q.q || q.opts.length !== 4 || q.answer < 0 || q.answer > 3);
      if (qs.length !== 5 || bad.length) { console.error('❌ 題目格式錯誤'); process.exit(1); }
      console.log('  ✅ 5 題、每題 4 選項、answer 索引合法');
    }
    // host 全對；guest 全選錯誤選項（測勝負）
    qs.forEach((q, i) => {
      const choice = strategy === 'all-correct' ? q.answer : (q.answer + 1) % 4;
      setTimeout(() => sock.emit('pvp_answer', { code, qIdx: i, choice }), 150 * (i + 1));
    });
  });
  sock.on('pvp_progress', ({ progress }) => log(who, 'progress', JSON.stringify(progress)));
  sock.on('battle_result', ({ scores, winner, total }) => {
    const my = scores[sock.id], foe = Object.entries(scores).find(([id]) => id !== sock.id)[1];
    const outcome = winner === null ? '平手' : (winner === sock.id ? '勝利' : '敗北');
    results.push(`[${who}] ${outcome}（我 ${my}/${total}・對方 ${foe}/${total}）`);
    done();
  });
}

play(host, 'host', process.argv[2] || 'all-correct');
play(guest, 'guest', process.argv[3] || 'all-wrong');

setTimeout(() => { console.error('❌ 測試逾時（15 秒）'); process.exit(1); }, 15000);
