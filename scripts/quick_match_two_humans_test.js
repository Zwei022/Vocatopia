// 快速配對兩個真人測試：兩人幾乎同時排同一模式，應互相配對成功（不是各自等到電腦逾時）。
const { io } = require('socket.io-client');
const URL = process.env.TEST_URL || 'http://localhost:3001';
let done = 0;
function finish(who, code, players) {
  console.log(`[${who}] queue_matched code=${code} players=${JSON.stringify(players)}`);
  done++;
  if (done === 2) { console.log('\n✅ 兩位真人互相配對成功（不是各自等電腦）'); process.exit(0); }
}
const a = io(URL), b = io(URL);
a.on('connect', () => a.emit('queue_join', { mode: 'buzzer', clientId: 'a', userId: null, name: 'A', title: '' }));
setTimeout(() => b.emit('queue_join', { mode: 'buzzer', clientId: 'b', userId: null, name: 'B', title: '' }), 300);
a.on('queue_matched', (d) => finish('A', d.code, d.players));
b.on('queue_matched', (d) => finish('B', d.code, d.players));
setTimeout(() => { console.error('❌ 逾時：兩人沒有互相配對到'); process.exit(1); }, 10000);
