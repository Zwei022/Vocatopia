require('dotenv').config();
const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const cors    = require('cors');
const path    = require('path');
const cron    = require('node-cron');
const supabase = require('./db/supabase');
const { generateAndSave } = require('./scripts/generate_daily_articles');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// ── API ROUTES ──
app.use('/api/words',          require('./routes/words'));
app.use('/api/articles',       require('./routes/articles'));
app.use('/api/daily-articles', require('./routes/daily_articles'));

// ── PVP ROOM SYSTEM ──
const rooms = {};

function genRoomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

io.on('connection', (socket) => {
  console.log(`[socket] connected: ${socket.id}`);

  socket.on('create_room', () => {
    const code = genRoomCode();
    rooms[code] = { host: socket.id, guest: null, scores: {}, started: false };
    socket.join(code);
    socket.emit('room_created', { code });
    console.log(`[room] created ${code} by ${socket.id}`);
  });

  socket.on('join_room', ({ code }) => {
    const room = rooms[code];
    if (!room) return socket.emit('room_error', { msg: '找不到房間' });
    if (room.guest)  return socket.emit('room_error', { msg: '房間已滿' });
    room.guest = socket.id;
    socket.join(code);
    io.to(code).emit('room_ready', { code, host: room.host, guest: room.guest });
    console.log(`[room] ${socket.id} joined ${code}`);
  });

  socket.on('start_battle', ({ code }) => {
    const room = rooms[code];
    if (!room) return;
    room.started = true;
    room.scores[room.host]  = 0;
    room.scores[room.guest] = 0;
    io.to(code).emit('battle_start', { code });
  });

  socket.on('submit_answer', ({ code, correct, timeBonus }) => {
    const room = rooms[code];
    if (!room) return;
    const gain = correct ? (timeBonus ? 150 : 100) : 0;
    room.scores[socket.id] = (room.scores[socket.id] || 0) + gain;
    io.to(code).emit('score_update', { scores: room.scores });
  });

  socket.on('battle_end', ({ code }) => {
    const room = rooms[code];
    if (!room) return;
    io.to(code).emit('battle_result', { scores: room.scores });
    delete rooms[code];
  });

  socket.on('disconnect', () => {
    for (const [code, room] of Object.entries(rooms)) {
      if (room.host === socket.id || room.guest === socket.id) {
        io.to(code).emit('opponent_disconnected');
        delete rooms[code];
      }
    }
    console.log(`[socket] disconnected: ${socket.id}`);
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ── 每日文章 CRON（台灣時間 00:05 = UTC 16:05）──
cron.schedule('5 16 * * *', async () => {
  const today = new Date().toISOString().split('T')[0];
  console.log(`\n[Cron] 每日文章排程觸發 ${today}`);
  try {
    await generateAndSave(today);
  } catch (err) {
    console.error('[Cron] 生成失敗：', err.message);
  }
});

// 啟動時若今日尚無文章則自動補生成
(async () => {
  const today = new Date().toISOString().split('T')[0];
  const { count } = await supabase
    .from('daily_articles')
    .select('id', { count: 'exact', head: true })
    .eq('date', today);
  if ((count || 0) < 5) {
    console.log('[啟動] 今日文章不足，自動生成中...');
    generateAndSave(today).catch(err =>
      console.error('[啟動] 生成失敗：', err.message)
    );
  } else {
    console.log(`[啟動] 今日 ${count} 篇文章已就緒`);
  }
})();

server.listen(PORT, () => {
  console.log(`Vocatopia server running at http://localhost:${PORT}`);
});
