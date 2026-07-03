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

// ── PVP ROOM SYSTEM（單字對決）──
// 流程：房主建房 → 對手憑房號加入 → 房主選模式並開始 → 伺服器統一出 5 題
//      → 雙方作答（限時 2 分鐘）→ 雙方完成或時間到即結算 → 依答對數判定勝/敗/平手
const rooms = {};
const ROOM_TTL     = 60 * 60 * 1000; // 房間 1 小時自動過期
const PVP_DURATION = 120;            // 對決限時（秒）
const PVP_QCOUNT   = 5;              // 題數
const vocabFallback = require('./data/question_bank_vocab.json');

function genRoomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = 0 | Math.random() * (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 單字對決出題：從字庫隨機抽字，每題「英文單字選中文意思」四選一
let _wordCount = null;
async function buildVocabQuestions() {
  try {
    if (_wordCount === null) {
      const { count } = await supabase.from('words')
        .select('id', { count: 'exact', head: true })
        .not('tags', 'cs', '{user_lookup}')
        .not('tags', 'cs', '{user_custom}');
      _wordCount = count || 0;
    }
    if (_wordCount < 40) throw new Error('字庫字數不足');
    const offset = Math.floor(Math.random() * (_wordCount - 40));
    const { data, error } = await supabase.from('words')
      .select('word, pos, definition_zh')
      .not('tags', 'cs', '{user_lookup}')
      .not('tags', 'cs', '{user_custom}')
      .order('word', { ascending: true })
      .range(offset, offset + 39);
    if (error || !data) throw new Error(error ? error.message : '查無資料');
    const pool = shuffle(data.filter(w => w.word && w.definition_zh));
    if (pool.length < PVP_QCOUNT + 9) throw new Error('可出題字數不足');
    const targets = pool.slice(0, PVP_QCOUNT);
    const rest    = pool.slice(PVP_QCOUNT);
    return targets.map(t => {
      const distractors = shuffle(rest.filter(r => r.definition_zh !== t.definition_zh))
        .slice(0, 3).map(r => r.definition_zh);
      const opts = shuffle([t.definition_zh, ...distractors]);
      return { q: t.word, pos: t.pos || '', opts, answer: opts.indexOf(t.definition_zh) };
    });
  } catch (e) {
    // 字庫不可用時退回靜態題庫（Fail loud：記錄原因）
    console.error('[PVP] 動態出題失敗，改用備援題庫：', e.message);
    return shuffle([...vocabFallback]).slice(0, PVP_QCOUNT).map(q => ({
      q: q.sentence,
      pos: q.pos || '',
      opts: q.options.map((o, i) => `${o}${q.optionsZh?.[i] ? `（${q.optionsZh[i]}）` : ''}`),
      answer: q.answer,
    }));
  }
}

// 結算：答對數高者勝，相同平手
function settleBattle(code) {
  const room = rooms[code];
  if (!room || room.state !== 'playing') return;
  room.state = 'done';
  clearTimeout(room.timer);
  const scores = {};
  for (const id of [room.host, room.guest]) {
    scores[id] = (room.answers[id] || []).filter(a => a && a.correct).length;
  }
  let winner = null;
  if (scores[room.host] > scores[room.guest])      winner = room.host;
  else if (scores[room.guest] > scores[room.host]) winner = room.guest;
  io.to(code).emit('battle_result', { scores, winner, total: room.questions.length });
  delete rooms[code];
}

// 玩家離開/斷線：通知對手並解散房間
function dropFromRoom(socket, code) {
  const room = rooms[code];
  if (!room || (room.host !== socket.id && room.guest !== socket.id)) return;
  socket.leave(code);
  if (room.timer) clearTimeout(room.timer);
  socket.to(code).emit('opponent_left');
  delete rooms[code];
}

// 每 10 分鐘掃描並清除過期房間，防止記憶體洩漏
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of Object.entries(rooms)) {
    if (now - room.createdAt > ROOM_TTL) {
      if (room.timer) clearTimeout(room.timer);
      io.to(code).emit('room_expired');
      delete rooms[code];
    }
  }
}, 10 * 60 * 1000);

io.on('connection', (socket) => {
  socket.on('create_room', () => {
    const code = genRoomCode();
    rooms[code] = {
      host: socket.id, guest: null,
      mode: 'vocab', state: 'lobby',
      questions: [], answers: {}, timer: null,
      createdAt: Date.now(),
    };
    socket.join(code);
    socket.emit('room_created', { code });
  });

  socket.on('join_room', ({ code }) => {
    const room = rooms[code];
    if (!room)                   return socket.emit('room_error', { msg: '找不到房間，請確認房號' });
    if (room.state !== 'lobby')  return socket.emit('room_error', { msg: '對決已開始，無法加入' });
    if (room.guest)              return socket.emit('room_error', { msg: '房間已滿' });
    if (room.host === socket.id) return socket.emit('room_error', { msg: '不能加入自己的房間' });
    room.guest = socket.id;
    socket.join(code);
    io.to(code).emit('room_ready', { code, mode: room.mode });
  });

  // 房主選擇切磋模式（目前僅 vocab：單字對決）
  socket.on('select_mode', ({ code, mode }) => {
    const room = rooms[code];
    if (!room || room.host !== socket.id || room.state !== 'lobby') return;
    room.mode = mode;
    socket.to(code).emit('mode_selected', { mode });
  });

  socket.on('start_battle', async ({ code }) => {
    const room = rooms[code];
    if (!room || room.host !== socket.id || room.state !== 'lobby' || !room.guest) return;
    room.state = 'building';                    // 鎖住，避免重複開始
    const questions = await buildVocabQuestions();
    if (!rooms[code]) return;                   // 出題期間房間可能已解散
    room.questions = questions;
    room.answers   = { [room.host]: [], [room.guest]: [] };
    room.state     = 'playing';
    io.to(code).emit('battle_start', { mode: room.mode, questions, duration: PVP_DURATION });
    room.timer = setTimeout(() => settleBattle(code), PVP_DURATION * 1000 + 800);
  });

  // 收答案：每題只收第一次作答；雙方都答完 5 題立即結算
  socket.on('pvp_answer', ({ code, qIdx, choice }) => {
    const room = rooms[code];
    if (!room || room.state !== 'playing') return;
    const arr = room.answers[socket.id];
    if (!arr || !Number.isInteger(qIdx) || qIdx < 0 || qIdx >= room.questions.length) return;
    if (arr[qIdx] !== undefined) return;
    arr[qIdx] = { choice, correct: choice === room.questions[qIdx].answer };
    const progress = {};
    for (const id of [room.host, room.guest]) {
      progress[id] = (room.answers[id] || []).filter(a => a !== undefined).length;
    }
    io.to(code).emit('pvp_progress', { progress });
    if (progress[room.host] >= room.questions.length &&
        progress[room.guest] >= room.questions.length) {
      settleBattle(code);
    }
  });

  socket.on('leave_room', ({ code }) => dropFromRoom(socket, code));

  socket.on('disconnect', () => {
    for (const code of Object.keys(rooms)) dropFromRoom(socket, code);
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
