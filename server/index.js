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

// 預生成靜態音頻：no-cache 讓瀏覽器每次驗證 ETag，音檔更新後立即生效
// /api/tts/ 動態生成的音頻在 tts.js 內個別設 no-store
app.use('/public/audio/words', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

app.use(express.static(path.join(__dirname, '..')));

// ── API ROUTES ──
app.use('/api/user',            require('./routes/user'));
app.use('/api/words',          require('./routes/words'));
app.use('/api/articles',       require('./routes/articles'));
app.use('/api/daily-articles', require('./routes/daily_articles'));
app.use('/api/daily-quiz',      require('./routes/daily_quiz'));
app.use('/api/listening-audio', require('./routes/listening_audio'));
app.use('/api/tts',             require('./routes/tts'));

// ── PVP ROOM SYSTEM ──
const rooms = {};
const ROOM_TTL = 60 * 60 * 1000; // 1 小時自動過期

function genRoomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// 每 10 分鐘掃描並清除過期房間，防止記憶體洩漏
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of Object.entries(rooms)) {
    if (now - room.createdAt > ROOM_TTL) {
      io.to(code).emit('room_expired');
      delete rooms[code];
    }
  }
}, 10 * 60 * 1000);

io.on('connection', (socket) => {
  socket.on('create_room', () => {
    const code = genRoomCode();
    rooms[code] = { host: socket.id, guest: null, scores: {}, started: false, createdAt: Date.now() };
    socket.join(code);
    socket.emit('room_created', { code });
  });

  socket.on('join_room', ({ code }) => {
    const room = rooms[code];
    if (!room) return socket.emit('room_error', { msg: '找不到房間' });
    if (room.guest)  return socket.emit('room_error', { msg: '房間已滿' });
    room.guest = socket.id;
    socket.join(code);
    io.to(code).emit('room_ready', { code, host: room.host, guest: room.guest });
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
