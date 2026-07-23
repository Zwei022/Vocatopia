// 單字搶答（buzzer）回歸測試：確認 applyBuzzerAnswer 抽離重構後行為不變。
const { io } = require('socket.io-client');
const URL = process.env.TEST_URL || 'http://localhost:3001';
const log = (who, ...a) => console.log(`[${who}]`, ...a);
let code = '';
let done = 0;
const finish = () => { if (++done === 2) process.exit(0); };

const host = io(URL), guest = io(URL);
host.on('connect', () => host.emit('create_room', { name: 'H' }));
host.on('room_created', (d) => { code = d.code; guest.emit('join_room', { code, name: 'G' }); });
host.on('room_ready', () => {
  host.emit('select_mode', { code, mode: 'buzzer' });
  host.emit('start_battle', { code });
});
guest.on('room_error', (d) => { console.error('room_error', d); process.exit(1); });

function play(sock, who) {
  sock.on('buzzer_question', ({ qIdx, options, sentence }) => {
    log(who, `Q${qIdx}`, sentence.slice(0, 30));
    setTimeout(() => sock.emit('buzzer_answer', { code, qIdx, choice: 0 }), 100 + Math.random() * 300);
  });
  sock.on('buzzer_result_self', (d) => log(who, 'result_self', JSON.stringify(d)));
  sock.on('buzzer_opponent_answered', (d) => log(who, 'opp_answered', JSON.stringify(d)));
  sock.on('battle_result', ({ scores, winner, total }) => {
    log(who, '✅ battle_result', JSON.stringify({ scores, winner, total }));
    finish();
  });
}
play(host, 'host');
play(guest, 'guest');

setTimeout(() => { console.error('❌ 逾時'); process.exit(1); }, 60000);
