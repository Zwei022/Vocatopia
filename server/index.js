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
//      → 雙方作答（限時 30 秒）→ 雙方完成或時間到即結算 → 依答對數判定勝/敗/平手
const rooms = {};
const ROOM_TTL     = 60 * 60 * 1000; // 房間 1 小時自動過期
const PVP_DURATION = 30;             // 對決限時（秒）
const PVP_QCOUNT   = 5;              // 題數
const vocabFallback = require('./data/question_bank_vocab.json');

// ── 單字搶答（buzzer）：雙方同題同步、伺服器時間計分、逐題進行 ──
const BUZZER_QCOUNT   = 7;   // 題數
const BUZZER_DURATION = 30;  // 每題限時（秒）
const buzzerBank = require('./data/question_bank_vocab_practice.json');

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

// 單字搶答出題：沿用每日練習同源的英文句子選字題庫（英文題幹+英文選項）
function buildBuzzerQuestions() {
  const pool = shuffle([...buzzerBank]);
  return pool.slice(0, BUZZER_QCOUNT).map(q => ({
    q: q.sentence,
    pos: q.pos || '',
    opts: q.options.map(o => String(o).replace(/^\([A-D]\)\s*/, '')),
    answer: q.answer,
  }));
}

// 答對得分依「伺服器收到作答時的經過時間」分級，不信任前端回報的時間（防作弊）
function scoreForElapsed(ms) {
  if (ms <= 2000)  return 100;
  if (ms <= 5000)  return 60;
  if (ms <= 10000) return 30;
  return 0;
}

// 出題並開始單字搶答對局（start_battle 與 rematch 共用）
function beginBuzzerRound(code) {
  const room = rooms[code];
  if (!room) return;
  room.state = 'building';
  room.questions    = buildBuzzerQuestions();
  room.answers      = { [room.host]: [], [room.guest]: [] };
  room.buzzerScores = { [room.host]: 0, [room.guest]: 0 };
  room.qIdx  = 0;
  room.state = 'playing';
  sendBuzzerQuestion(code);
}

// 逐題發送：雙方同時收到同一題，伺服器記錄出題時間點作為計分基準
function sendBuzzerQuestion(code) {
  const room = rooms[code];
  if (!room || room.state !== 'playing') return;
  const qIdx = room.qIdx;
  const q = room.questions[qIdx];
  room.qStartAt   = Date.now();
  room.qAnswered  = {};
  io.to(code).emit('buzzer_question', {
    qIdx, total: room.questions.length,
    sentence: q.q, pos: q.pos, options: q.opts,
    duration: BUZZER_DURATION,
  });
  room.qTimer = setTimeout(() => finishBuzzerQuestion(code, qIdx), BUZZER_DURATION * 1000 + 500);
}

// 該題結束（雙方都已作答，或時間到）：雙方一起看到正解與最新總分，接著進下一題或結算
function finishBuzzerQuestion(code, qIdx) {
  const room = rooms[code];
  if (!room || room.state !== 'playing' || room.qIdx !== qIdx) return;
  clearTimeout(room.qTimer);
  const correctIndex = room.questions[qIdx].answer;
  const scores = { [room.host]: room.buzzerScores[room.host], [room.guest]: room.buzzerScores[room.guest] };
  io.to(code).emit('buzzer_reveal', { qIdx, correctIndex, scores });
  room.qIdx++;
  if (room.qIdx >= room.questions.length) {
    setTimeout(() => settleBuzzerBattle(code), 1200);
  } else {
    setTimeout(() => sendBuzzerQuestion(code), 1400);
  }
}

// 結算：總分高者勝，相同平手（跟現有單字對決模式一致）
function settleBuzzerBattle(code) {
  const room = rooms[code];
  if (!room || room.state !== 'playing') return;
  room.state = 'done';
  const scores = { ...room.buzzerScores };
  let winner = null;
  if (scores[room.host] > scores[room.guest])      winner = room.host;
  else if (scores[room.guest] > scores[room.host]) winner = room.guest;
  io.to(code).emit('battle_result', { scores, winner, total: room.questions.length });
}

// 結算：答對數高者勝，相同平手。結算後房間不解散（保留給「再來一場」用），
// 只有離開/斷線/逾時才會真正銷毀（見 dropFromRoom 與逾時清除）。
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
}

// 出題並開始一輪對局（start_battle 與 rematch 共用）
async function beginRound(code) {
  const room = rooms[code];
  if (!room) return;
  room.state = 'building';                    // 鎖住，避免重複開始
  const questions = await buildVocabQuestions();
  if (!rooms[code]) return;                   // 出題期間房間可能已解散
  room.questions = questions;
  room.answers   = { [room.host]: [], [room.guest]: [] };
  room.state     = 'playing';
  io.to(code).emit('battle_start', { mode: room.mode, questions, duration: PVP_DURATION });
  room.timer = setTimeout(() => settleBattle(code), PVP_DURATION * 1000 + 800);
}

// 玩家離開/斷線：通知對手並解散房間
// 明確離開（使用者主動點擊「返回競技場」）：立即銷毀房間，不給重連機會
function dropFromRoom(socket, code) {
  const room = rooms[code];
  if (!room || (room.host !== socket.id && room.guest !== socket.id)) return;
  socket.leave(code);
  if (room.timer)      clearTimeout(room.timer);
  if (room.qTimer)     clearTimeout(room.qTimer);
  if (room.hostGraceTimer)  clearTimeout(room.hostGraceTimer);
  if (room.guestGraceTimer) clearTimeout(room.guestGraceTimer);
  socket.to(code).emit('opponent_left');
  delete rooms[code];
}

const RECONNECT_GRACE_MS = 15000; // 斷線後給15秒重連機會，才真正判定對手離開

// 斷線（可能只是手機切到背景、訊號短暫中斷，Socket.IO會自動重連並emit rejoin_room）：
// 先不销毁房間，給一段緩衝時間讓 rejoin_room 有機會挽回；緩衝時間內都沒重連才真正銷毀
function scheduleRoomTeardown(socket, code) {
  const room = rooms[code];
  if (!room) return;
  const isHost  = room.host  === socket.id;
  const isGuest = room.guest === socket.id;
  if (!isHost && !isGuest) return;

  const timer = setTimeout(() => {
    const r = rooms[code];
    if (!r) return;
    // 緩衝期間內若已經用新 socket.id 重新加入（rejoin_room 會把 host/guest 換成新id），
    // 這裡的 socket.id 就不會再等於 r.host/r.guest，代表已挽回，不需要銷毀
    if ((isHost && r.host !== socket.id) || (isGuest && r.guest !== socket.id)) return;
    if (r.timer)  clearTimeout(r.timer);
    if (r.qTimer) clearTimeout(r.qTimer);
    io.to(code).emit('opponent_left');
    delete rooms[code];
  }, RECONNECT_GRACE_MS);

  if (isHost) room.hostGraceTimer = timer;
  else        room.guestGraceTimer = timer;
}

// 每 10 分鐘掃描並清除過期房間，防止記憶體洩漏
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of Object.entries(rooms)) {
    if (now - room.createdAt > ROOM_TTL) {
      if (room.timer)  clearTimeout(room.timer);
      if (room.qTimer) clearTimeout(room.qTimer);
      io.to(code).emit('room_expired');
      delete rooms[code];
    }
  }
}, 10 * 60 * 1000);

// ── 好友上線狀態 / 邀請即時推播 ──
// onlineUsers: userId(uuid) -> Set<socket.id>，同一個帳號可能同時開多個分頁/裝置
const onlineUsers = new Map();

io.on('connection', (socket) => {
  socket.on('identify', ({ userId }) => {
    if (!userId) return;
    socket.data.userId = userId;
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);
  });

  socket.on('check_online', ({ userIds }, cb) => {
    if (typeof cb !== 'function' || !Array.isArray(userIds)) return;
    const online = userIds.filter(id => onlineUsers.has(id) && onlineUsers.get(id).size > 0);
    cb({ online });
  });

  socket.on('send_friend_request', ({ toUserId, fromUserId, fromUsername }) => {
    const targets = onlineUsers.get(toUserId);
    if (!targets) return;
    for (const sid of targets) io.to(sid).emit('friend_request_incoming', { fromUserId, fromUsername });
  });

  socket.on('friend_request_response', ({ toUserId, fromUsername, accepted }) => {
    const targets = onlineUsers.get(toUserId);
    if (!targets) return;
    for (const sid of targets) io.to(sid).emit('friend_request_responded', { fromUsername, accepted });
  });

  // 邀請好友加入對戰房：把房號推播給對方所有在線分頁
  socket.on('game_invite', ({ toUserId, code, fromUsername, mode }) => {
    const targets = onlineUsers.get(toUserId);
    if (!targets) return;
    for (const sid of targets) io.to(sid).emit('game_invite_incoming', { code, fromUsername, mode });
  });

  socket.on('create_room', ({ clientId } = {}) => {
    const code = genRoomCode();
    rooms[code] = {
      host: socket.id, guest: null,
      hostClientId: clientId || null, guestClientId: null,
      hostGraceTimer: null, guestGraceTimer: null,
      mode: 'vocab', state: 'lobby',
      questions: [], answers: {}, timer: null,
      createdAt: Date.now(),
    };
    socket.join(code);
    socket.emit('room_created', { code });
  });

  socket.on('join_room', ({ code, clientId }) => {
    const room = rooms[code];
    if (!room)                   return socket.emit('room_error', { msg: '找不到房間，請確認房號' });
    if (room.state !== 'lobby')  return socket.emit('room_error', { msg: '對決已開始，無法加入' });
    if (room.guest)              return socket.emit('room_error', { msg: '房間已滿' });
    if (room.host === socket.id) return socket.emit('room_error', { msg: '不能加入自己的房間' });
    room.guest = socket.id;
    room.guestClientId = clientId || null;
    socket.join(code);
    io.to(code).emit('room_ready', { code, mode: room.mode });
  });

  // 斷線重連：手機切到背景、訊號短暫中斷等情況會讓 socket 斷線又重連並拿到新的 socket.id，
  // 靠 clientId（客端產生、整個分頁生命週期不變）比對回原本是房主還是對手，把 room.host/
  // room.guest 更新成新的 socket.id，並重新加入 Socket.IO 房間，取消原本排定的「淘汰」計時器
  socket.on('rejoin_room', ({ code, clientId }) => {
    const room = rooms[code];
    if (!room || !clientId) return;
    if (room.hostClientId === clientId) {
      room.host = socket.id;
      socket.join(code);
      if (room.hostGraceTimer) { clearTimeout(room.hostGraceTimer); room.hostGraceTimer = null; }
      socket.emit('room_rejoined', { code, mode: room.mode, state: room.state });
    } else if (room.guestClientId === clientId) {
      room.guest = socket.id;
      socket.join(code);
      if (room.guestGraceTimer) { clearTimeout(room.guestGraceTimer); room.guestGraceTimer = null; }
      socket.emit('room_rejoined', { code, mode: room.mode, state: room.state });
    }
  });

  // 房主選擇切磋模式（目前僅 vocab：單字對決）
  socket.on('select_mode', ({ code, mode }) => {
    const room = rooms[code];
    if (!room || room.host !== socket.id || room.state !== 'lobby') return;
    room.mode = mode;
    socket.to(code).emit('mode_selected', { mode });
  });

  socket.on('start_battle', ({ code }) => {
    const room = rooms[code];
    if (!room || room.host !== socket.id || room.state !== 'lobby' || !room.guest) return;
    if (room.mode === 'buzzer') beginBuzzerRound(code);
    else beginRound(code);
  });

  // 再來一場：僅房主可觸發，需雙方都還在房內、且上一場已結算完畢
  socket.on('rematch', ({ code }) => {
    const room = rooms[code];
    if (!room)                   return socket.emit('rematch_error', { msg: '房間已不存在' });
    if (room.host !== socket.id) return; // 非房主的請求靜默忽略
    if (!room.guest)             return socket.emit('rematch_error', { msg: '對手已離開，無法再來一場' });
    if (room.state !== 'done')   return;
    if (room.mode === 'buzzer') beginBuzzerRound(code);
    else beginRound(code);
  });

  // 單字搶答收答案：每題只收第一次作答，本人立即知道正解，對手只看到分數變動
  socket.on('buzzer_answer', ({ code, qIdx, choice }) => {
    const room = rooms[code];
    if (!room || room.state !== 'playing' || room.mode !== 'buzzer') return;
    if (qIdx !== room.qIdx) return;               // 該題已經結束，回應太慢
    if (room.qAnswered[socket.id]) return;        // 這題已經答過
    const q = room.questions[qIdx];
    const elapsed = Date.now() - room.qStartAt;
    const correct = choice === q.answer;
    let points = correct ? scoreForElapsed(elapsed) : 0;
    if (qIdx === room.questions.length - 1) points *= 2;   // 最後一題雙倍
    room.qAnswered[socket.id] = true;
    room.buzzerScores[socket.id] = (room.buzzerScores[socket.id] || 0) + points;
    room.answers[socket.id][qIdx] = { choice, correct, points };

    socket.emit('buzzer_result_self', {
      qIdx, correct, points, correctIndex: q.answer,
      myTotal: room.buzzerScores[socket.id],
    });
    const foeId = socket.id === room.host ? room.guest : room.host;
    if (foeId) {
      io.to(foeId).emit('buzzer_opponent_answered', {
        qIdx, opponentTotal: room.buzzerScores[socket.id],
      });
    }

    if (room.qAnswered[room.host] && room.qAnswered[room.guest]) {
      finishBuzzerQuestion(code, qIdx);
    }
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
    for (const code of Object.keys(rooms)) scheduleRoomTeardown(socket, code);
    const uid = socket.data.userId;
    if (uid && onlineUsers.has(uid)) {
      onlineUsers.get(uid).delete(socket.id);
      if (onlineUsers.get(uid).size === 0) onlineUsers.delete(uid);
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
