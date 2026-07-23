require('dotenv').config({ quiet: true });
const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const cors    = require('cors');
const path    = require('path');
const cron    = require('node-cron');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const supabase = require('./db/supabase');
const { generateAndSave } = require('./scripts/generate_daily_articles');

// 單一未捕捉錯誤不應該讓整個 process（含所有 Socket.io 記憶體內房間狀態）當掉。
// 只記錄並存活，不靜默吞掉（fail loud in logs，但不 crash）。
process.on('uncaughtException', (err) => {
  console.error('[FATAL] uncaughtException:', err);
});
process.on('unhandledRejection', (err) => {
  console.error('[FATAL] unhandledRejection:', err);
});

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });

// 多實例（水平擴展）時，Socket.io 預設的房間/連線狀態只存在單一 process 記憶體內，
// 不同 instance 之間互不相通（同房間兩人可能被路由到不同 instance，永遠配對不到）。
// 設定 REDIS_URL 後才啟用 Redis adapter 讓所有 instance 共享狀態；未設定時（現況：
// 單一 instance）維持原本的記憶體內模式，不影響任何現有行為。
if (process.env.REDIS_URL) {
  const { createAdapter } = require('@socket.io/redis-adapter');
  const Redis = require('ioredis');
  const pubClient = new Redis(process.env.REDIS_URL);
  const subClient = pubClient.duplicate();
  pubClient.on('error', (err) => console.error('[Redis] pubClient error:', err.message));
  subClient.on('error', (err) => console.error('[Redis] subClient error:', err.message));
  io.adapter(createAdapter(pubClient, subClient));
  console.log('[Socket.io] 已啟用 Redis adapter（多實例模式）');
} else {
  console.log('[Socket.io] 未設定 REDIS_URL，使用單實例記憶體模式');
}

const PORT = process.env.PORT || 3000;

app.use(compression());
app.use(cors());
app.use(express.json());

// 健康檢查：Railway / 任何負載平衡器判斷這個 instance 是否存活
app.get('/health', (req, res) => res.status(200).json({ ok: true }));

// 全站基本限流，防止單一來源打爆伺服器（各路由可再疊加更嚴格的限制）
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: '請求過於頻繁，請稍後再試' },
}));

// 查詢單字會呼叫 Gemini API（有成本、有配額上限），需要比一般 API 更嚴格的限流，
// 避免單一使用者/惡意來源在短時間內大量觸發 cache miss 把配額打光
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: '查詢太頻繁了，請稍後再試' },
});
app.use('/api/words/search', searchLimiter);

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
app.use('/api/grammar-lessons', require('./routes/grammar'));
app.use('/api/mock-exam',       require('./routes/mock_exam'));
app.use('/api',                 require('./routes/subscription'));
app.use('/api',                 require('./routes/feedback'));
app.use('/api',                 require('./routes/push'));

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

// ── 競技場排名／獎勵（ELO）──
// 標準 Elo 公式：K 值取 24（比競技類遊戲常見的 32 略低，降低單場波動，
// 對國中生使用者比較不會因為一場失常就大幅掉段）。
const ARENA_ELO_K = 24;
function eloDelta(myElo, foeElo, score /* 1=贏 0.5=平 0=輸 */) {
  const expected = 1 / (1 + Math.pow(10, (foeElo - myElo) / 400));
  return Math.round(ARENA_ELO_K * (score - expected));
}

// 依對戰結果算獎勵（未登入訪客沒有 userId，結算時會整段跳過，不影響對局本身）
function rewardForResult(result) {
  if (result === 'win')  return { gold: 30, xp: 20 };
  if (result === 'draw') return { gold: 15, xp: 10 };
  return { gold: 10, xp: 8 }; // loss：輸也給一點參與獎勵，避免小朋友覺得白打一場
}

// 結算後幫雙方（有登入的）算 ELO 變動與獎勵，回傳供 battle_result 廣播使用。
// 用 service-role client 直接讀 profiles，不透過使用者自己的 RLS 權限（伺服器是可信任來源）。
// mode：兩種模式（單字對決/單字搶答）各自獨立的 ELO 段位，讀寫對應的 arena_elo_vocab／arena_elo_buzzer。
// guestBotElo：對手是電腦補位時（見 _createQueuedRoom，電腦一律是 guest 側），電腦當局
// 被分派到的 ELO——不能讓 eloOf(null) 退回預設值 1000，否則電腦強弱就跟真人的對戰體驗脫鉤。
async function computeArenaOutcome(hostUserId, guestUserId, winnerIsHost /* true/false/null(平手) */, guestBotElo, mode) {
  const out = {};
  if (!hostUserId && !guestUserId) return out;
  const eloCol = mode === 'buzzer' ? 'arena_elo_buzzer' : 'arena_elo_vocab';
  try {
    const ids = [hostUserId, guestUserId].filter(Boolean);
    const { data, error } = await supabase.from('profiles').select(`id, ${eloCol}`).in('id', ids);
    if (error) throw error;
    const eloOf = (uid) => data?.find(p => p.id === uid)?.[eloCol] ?? 1000;
    const hostElo = eloOf(hostUserId);
    const guestElo = (!guestUserId && guestBotElo) ? guestBotElo : eloOf(guestUserId);
    const hostScore  = winnerIsHost === null ? 0.5 : winnerIsHost ? 1 : 0;
    const guestScore = 1 - hostScore;
    const hostResult  = winnerIsHost === null ? 'draw' : winnerIsHost ? 'win' : 'loss';
    const guestResult = winnerIsHost === null ? 'draw' : winnerIsHost ? 'loss' : 'win';
    if (hostUserId)  out.host  = { elo: eloDelta(hostElo, guestElo, hostScore),  result: hostResult,  mode, reward: rewardForResult(hostResult) };
    if (guestUserId) out.guest = { elo: eloDelta(guestElo, hostElo, guestScore), result: guestResult, mode, reward: rewardForResult(guestResult) };
  } catch (e) {
    console.error('[Arena] 計算 ELO 失敗（不影響對局本身，僅此局無獎勵）：', e.message);
  }
  return out;
}

// PVP 名牌：回傳雙方顯示名稱與稱號（#13 稱號顯示於對戰名牌）
function _roomPlayers(room) {
  return {
    host:  { name: room.hostName  || '玩家', title: room.hostTitle  || '' },
    guest: { name: room.guestName || '玩家', title: room.guestTitle || '' },
  };
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
  room.rematchReady = {};   // #10 新一場開始，清掉再來一場的同意狀態
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
  if (room.isBot) scheduleBotBuzzerAnswer(code, qIdx);
}

// ── 電腦補位對手的模擬作答（快速配對久候不到真人時使用）──
// 準確率依電腦被分派到的 ELO（room.botElo，見 _spawnBotEntry）動態校準，
// 反應延遲落在合理的人類反應時間範圍內，讓對局節奏看起來跟真人對戰一致。
function _botAccuracy(botElo) {
  return Math.min(0.92, Math.max(0.32, 0.5 + (botElo - 1000) / 1000));
}
function _botWrongChoice(opts, correctIdx) {
  const wrongIdxs = opts.map((_, i) => i).filter(i => i !== correctIdx);
  return wrongIdxs[Math.floor(Math.random() * wrongIdxs.length)];
}
// 單字對決：5 題各自安排一個時間點作答（房主/對手皆可能是電腦，此函式不分辨，只依 room.host/guest 判斷哪個 id 是 BOT）
function scheduleBotVocabAnswers(code) {
  const room = rooms[code];
  if (!room || !room.isBot) return;
  const botId = 'BOT'; // 電腦一律以固定的 'BOT' 假 id 存放於 room.host 或 room.guest（見 _createQueuedRoom）
  const p = _botAccuracy(room.botElo);
  room.questions.forEach((q, qIdx) => {
    const delay = 2200 + qIdx * 3200 + Math.random() * 2600; // 錯開節奏，越後面題目稍微拖久一點
    setTimeout(() => {
      if (!rooms[code] || rooms[code].state !== 'playing') return;
      const correct = Math.random() < p;
      const choice = correct ? q.answer : _botWrongChoice(q.opts, q.answer);
      applyPvpAnswer(code, botId, qIdx, choice);
    }, delay);
  });
}
// 單字搶答：每題出題當下各自排一次模擬作答
function scheduleBotBuzzerAnswer(code, qIdx) {
  const room = rooms[code];
  if (!room || !room.isBot) return;
  const botId = 'BOT'; // 電腦一律以固定的 'BOT' 假 id 存放於 room.host 或 room.guest（見 _createQueuedRoom）
  const p = _botAccuracy(room.botElo);
  const delay = 1200 + Math.random() * 6500; // BUZZER_DURATION=30s 內回答，比照真人反應時間分布
  setTimeout(() => {
    const r = rooms[code];
    if (!r || r.state !== 'playing' || r.qIdx !== qIdx) return;
    const q = r.questions[qIdx];
    const correct = Math.random() < p;
    const choice = correct ? q.answer : _botWrongChoice(q.opts, q.answer);
    applyBuzzerAnswer(code, botId, qIdx, choice);
  }, delay);
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

// 單一答案套用邏輯，抽成獨立函式讓真人 socket 事件與電腦模擬作答（scheduleBotBuzzerAnswer）共用。
// socketId 對真人來說就是 socket.id；對電腦來說是固定字串 'BOT'（見 _createQueuedRoom）——
// io.to(socketId) 對一個沒人在監聽的假 id 單純不會送達給任何人，不需要另外特判。
function applyBuzzerAnswer(code, socketId, qIdx, choice) {
  const room = rooms[code];
  if (!room || room.state !== 'playing' || room.mode !== 'buzzer') return;
  if (qIdx !== room.qIdx) return;               // 該題已經結束，回應太慢
  if (room.qAnswered[socketId]) return;          // 這題已經答過
  const q = room.questions[qIdx];
  const elapsed = Date.now() - room.qStartAt;
  const correct = choice === q.answer;
  let points = correct ? scoreForElapsed(elapsed) : 0;
  if (qIdx === room.questions.length - 1) points *= 2;   // 最後一題雙倍
  room.qAnswered[socketId] = true;
  room.buzzerScores[socketId] = (room.buzzerScores[socketId] || 0) + points;
  room.answers[socketId][qIdx] = { choice, correct, points };

  io.to(socketId).emit('buzzer_result_self', {
    qIdx, correct, points, correctIndex: q.answer,
    myTotal: room.buzzerScores[socketId],
  });
  const foeId = socketId === room.host ? room.guest : room.host;
  if (foeId) {
    io.to(foeId).emit('buzzer_opponent_answered', {
      qIdx, opponentTotal: room.buzzerScores[socketId],
    });
  }

  if (room.qAnswered[room.host] && room.qAnswered[room.guest]) {
    finishBuzzerQuestion(code, qIdx);
  }
}

// 結算：總分高者勝，相同平手（跟現有單字對決模式一致）
async function settleBuzzerBattle(code) {
  const room = rooms[code];
  if (!room || room.state !== 'playing') return;
  room.state = 'done';
  const scores = { ...room.buzzerScores };
  let winner = null, winnerIsHost = null;
  if (scores[room.host] > scores[room.guest])      { winner = room.host;  winnerIsHost = true; }
  else if (scores[room.guest] > scores[room.host]) { winner = room.guest; winnerIsHost = false; }
  const outcome = await computeArenaOutcome(room.hostUserId, room.guestUserId, winnerIsHost, room.botElo, room.mode);
  if (!rooms[code]) return; // 結算期間房間可能已被解散（極端情況：對手秒退）
  io.to(code).emit('battle_result', {
    scores, winner, total: room.questions.length,
    outcome: { [room.host]: outcome.host, [room.guest]: outcome.guest },
  });
}

// 結算：答對數高者勝，相同平手。結算後房間不解散（保留給「再來一場」用），
// 只有離開/斷線/逾時才會真正銷毀（見 dropFromRoom 與逾時清除）。
async function settleBattle(code) {
  const room = rooms[code];
  if (!room || room.state !== 'playing') return;
  room.state = 'done';
  clearTimeout(room.timer);
  const scores = {};
  for (const id of [room.host, room.guest]) {
    scores[id] = (room.answers[id] || []).filter(a => a && a.correct).length;
  }
  let winner = null, winnerIsHost = null;
  if (scores[room.host] > scores[room.guest])      { winner = room.host;  winnerIsHost = true; }
  else if (scores[room.guest] > scores[room.host]) { winner = room.guest; winnerIsHost = false; }
  const outcome = await computeArenaOutcome(room.hostUserId, room.guestUserId, winnerIsHost, room.botElo, room.mode);
  if (!rooms[code]) return; // 結算期間房間可能已被解散（極端情況：對手秒退）
  io.to(code).emit('battle_result', {
    scores, winner, total: room.questions.length,
    outcome: { [room.host]: outcome.host, [room.guest]: outcome.guest },
  });
}

// 單一答案套用邏輯，抽成獨立函式讓真人 socket 事件與電腦模擬作答（scheduleBotVocabAnswers）共用。
function applyPvpAnswer(code, socketId, qIdx, choice) {
  const room = rooms[code];
  if (!room || room.state !== 'playing') return;
  const arr = room.answers[socketId];
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
}

// 出題並開始一輪對局（start_battle 與 rematch 共用）
async function beginRound(code) {
  const room = rooms[code];
  if (!room) return;
  room.rematchReady = {};                      // #10 新一場開始，清掉再來一場的同意狀態
  room.state = 'building';                    // 鎖住，避免重複開始
  const questions = await buildVocabQuestions();
  if (!rooms[code]) return;                   // 出題期間房間可能已解散
  room.questions = questions;
  room.answers   = { [room.host]: [], [room.guest]: [] };
  room.state     = 'playing';
  io.to(code).emit('battle_start', { mode: room.mode, questions, duration: PVP_DURATION });
  room.timer = setTimeout(() => settleBattle(code), PVP_DURATION * 1000 + 800);
  if (room.isBot) scheduleBotVocabAnswers(code);
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

// ── 快速配對（含冷啟動電腦補位）──
// 使用者按「快速配對」進佇列；若佇列裡已有人在等同一模式，立即配對成真人對戰。
// 若排隊超過 QUICK_MATCH_BOT_TIMEOUT_MS 都配不到真人（常發生在使用者量還小的早期），
// 自動配一個電腦對手頂上，UI 上完全比照真人顯示、不標示「電腦」，名稱從 BOT_NAMES
// 隨機挑一個。電腦的 ELO 依對手當下 ELO 分階（±jitter），連動決定模擬準確率/反應速度，
// 且照樣計入 ELO 輸贏——這樣才不會變成「配到電腦＝穩贏刷分」的捷徑。
const QUICK_MATCH_BOT_TIMEOUT_MS = parseInt(process.env.QUICK_MATCH_BOT_TIMEOUT_MS, 10) || 8000;
const matchQueue = { vocab: [], buzzer: [] }; // [{socket, clientId, userId, name, title, elo, botTimer}]
const BOT_NAMES = ['小恩', '阿凱', '雨柔', '家豪', '宜蓁', '承翰', '思妤', '冠廷', '子萱', '柏宇', '品妍', '昱安'];

function _dequeue(mode, socketId) {
  const q = matchQueue[mode];
  if (!q) return null;
  const idx = q.findIndex(e => e.socket.id === socketId);
  if (idx === -1) return null;
  const [entry] = q.splice(idx, 1);
  clearTimeout(entry.botTimer);
  return entry;
}
function _leaveAllQueues(socketId) {
  for (const mode of Object.keys(matchQueue)) _dequeue(mode, socketId);
}

function _spawnBotEntry(humanElo) {
  const jitter = Math.round((Math.random() - 0.5) * 80); // ±40，讓電腦程度貼近但不完全等於對手
  return {
    isBot: true,
    elo: Math.max(600, humanElo + jitter),
    name: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
    title: '',
  };
}

// a：一定是真人 queue entry（{socket, clientId, userId, name, title, elo}）
// b：真人 entry 或 _spawnBotEntry() 產生的電腦 entry（{isBot:true, elo, name, title}）
function _createQueuedRoom(mode, a, b) {
  const code = genRoomCode();
  rooms[code] = {
    host: a.socket.id, guest: b.isBot ? 'BOT' : b.socket.id,
    hostClientId: a.clientId, guestClientId: b.isBot ? null : b.clientId,
    hostUserId: a.userId, guestUserId: b.isBot ? null : b.userId,
    hostName: a.name || '玩家', hostTitle: a.title || '',
    guestName: b.name || '玩家', guestTitle: b.title || '',
    hostGraceTimer: null, guestGraceTimer: null,
    mode, state: 'lobby',
    questions: [], answers: {}, timer: null,
    isBot: !!b.isBot, botElo: b.isBot ? b.elo : null,
    createdAt: Date.now(),
  };
  const room = rooms[code];
  a.socket.join(code);
  if (!b.isBot) b.socket.join(code);
  io.to(a.socket.id).emit('queue_matched', { code, mode, players: _roomPlayers(room), youAreHost: true });
  if (!b.isBot) io.to(b.socket.id).emit('queue_matched', { code, mode, players: _roomPlayers(room), youAreHost: false });
  setTimeout(() => {
    if (!rooms[code]) return; // 這 1.4 秒緩衝內任一方可能已經離開
    if (mode === 'buzzer') beginBuzzerRound(code); else beginRound(code);
  }, 1400);
}

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
  // 回傳 delivered 給呼叫端，讓前端知道邀請究竟有沒有送達（避免靜默失敗）。
  //
  // 注意：光是 socket.id 還留在 onlineUsers 裡，不代表對方真的收得到——手機背景/鎖屏時
  // WebSocket 可能已經斷線但伺服器還沒偵測到（預設 heartbeat 逾時最長要 ~45 秒），
  // 這段期間送出的邀請過去會被誤判為「已送達」，實際上對方畫面根本沒跳出來。
  // 改用 emit-with-ack + 逾時：只有對方分頁真的執行到彈窗程式碼並回傳確認，才算真正送達。
  socket.on('game_invite', ({ toUserId, code, fromUsername, mode }, cb) => {
    // 不論即時推播有沒有送達，都在收件夾留一筆記錄——這樣就算對方離線、
    // 或彈窗跳出來時沒即時按到，事後還是能在收件夾找到並嘗試加入
    // （fire-and-forget，不擋住/不影響即時推播流程本身）
    if (toUserId) {
      supabase.from('inbox').insert([{
        user_id: toUserId,
        type: 'invite',
        title: `${fromUsername} 邀請你對戰`,
        message: mode === 'buzzer' ? '單字搶答' : '單字對決',
        meta: { code, fromUsername, mode },
      }]).then(({ error }) => {
        if (error) console.error('[game_invite] 寫入收件夾失敗:', error.message);
      });
    }

    const targets = onlineUsers.get(toUserId);
    if (!targets || targets.size === 0) {
      if (typeof cb === 'function') cb({ delivered: false });
      return;
    }
    const payload = { code, fromUsername, mode };
    const acks = [...targets].map(sid =>
      new Promise(resolve => {
        io.to(sid).timeout(3000).emit('game_invite_incoming', payload, (err) => resolve(!err));
      })
    );
    Promise.all(acks).then(results => {
      const delivered = results.some(ok => ok);
      if (typeof cb === 'function') cb({ delivered });
    });
  });

  socket.on('create_room', ({ clientId, name, title, userId } = {}) => {
    const code = genRoomCode();
    rooms[code] = {
      host: socket.id, guest: null,
      hostClientId: clientId || null, guestClientId: null,
      hostUserId: userId || null, guestUserId: null,
      hostName: name || '玩家', hostTitle: title || '',
      guestName: null, guestTitle: '',
      hostGraceTimer: null, guestGraceTimer: null,
      mode: 'vocab', state: 'lobby',
      questions: [], answers: {}, timer: null,
      createdAt: Date.now(),
    };
    socket.join(code);
    socket.emit('room_created', { code });
  });

  socket.on('join_room', ({ code, clientId, name, title, userId }) => {
    const room = rooms[code];
    if (!room)                   return socket.emit('room_error', { msg: '找不到房間，請確認房號' });
    if (room.state !== 'lobby')  return socket.emit('room_error', { msg: '對決已開始，無法加入' });
    if (room.guest)              return socket.emit('room_error', { msg: '房間已滿' });
    if (room.host === socket.id) return socket.emit('room_error', { msg: '不能加入自己的房間' });
    room.guest = socket.id;
    room.guestClientId = clientId || null;
    room.guestUserId = userId || null;
    room.guestName = name || '玩家';
    room.guestTitle = title || '';
    socket.join(code);
    io.to(code).emit('room_ready', { code, mode: room.mode, players: _roomPlayers(room) });
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

  // 再來一場（#10 雙方同意制）：任一方都可請求，需雙方都按下才真正開始。
  // 只有一方按下時，通知對手「對方想再來一場」、並回自己「等待對方同意」。
  socket.on('rematch', ({ code }) => {
    const room = rooms[code];
    if (!room)   return socket.emit('rematch_error', { msg: '房間已不存在' });
    if (socket.id !== room.host && socket.id !== room.guest) return; // 不在此房內，忽略
    if (!room.guest)             return socket.emit('rematch_error', { msg: '對手已離開，無法再來一場' });
    if (room.state !== 'done')   return;

    if (!room.rematchReady) room.rematchReady = {};
    room.rematchReady[socket.id] = true;

    const foeId = socket.id === room.host ? room.guest : room.host;
    if (foeId) io.to(foeId).emit('rematch_requested');   // 對手畫面顯示「對方想再來一場」
    socket.emit('rematch_waiting');                       // 自己畫面顯示「等待對方同意」

    // 雙方都按了 → 開始新一場（beginRound/beginBuzzerRound 會清掉 rematchReady）
    if (room.rematchReady[room.host] && room.rematchReady[room.guest]) {
      if (room.mode === 'buzzer') beginBuzzerRound(code);
      else beginRound(code);
    }
  });

  // 單字搶答收答案：每題只收第一次作答，本人立即知道正解，對手只看到分數變動
  // （抽成 applyBuzzerAnswer 是因為電腦補位對手的模擬作答也要走同一套邏輯，見 scheduleBotBuzzerAnswer）
  socket.on('buzzer_answer', ({ code, qIdx, choice }) => applyBuzzerAnswer(code, socket.id, qIdx, choice));

  // 收答案：每題只收第一次作答；雙方都答完 5 題立即結算
  // （抽成 applyPvpAnswer 原因同上，見 scheduleBotVocabAnswers）
  socket.on('pvp_answer', ({ code, qIdx, choice }) => applyPvpAnswer(code, socket.id, qIdx, choice));

  // ── 快速配對 ──
  socket.on('queue_join', async ({ mode, clientId, userId, name, title } = {}) => {
    if (mode !== 'vocab' && mode !== 'buzzer') return;
    _leaveAllQueues(socket.id); // 防止手滑連點造成同一人排進佇列兩次

    let elo = 1000;
    if (userId) {
      const eloCol = mode === 'buzzer' ? 'arena_elo_buzzer' : 'arena_elo_vocab';
      try {
        const { data } = await supabase.from('profiles').select(eloCol).eq('id', userId).maybeSingle();
        if (data?.[eloCol]) elo = data[eloCol];
      } catch (e) { console.error('[Arena] 查詢排隊者 ELO 失敗，改用預設值 1000：', e.message); }
    }

    const q = matchQueue[mode];
    if (q.length > 0) {
      // 佇列裡已有人在等：先進先出直接配對。使用者量還小，暫不做 ELO 相近優先，
      // 免得反而久候配不到人——這點等玩家基數上來後可以再加。
      const opponent = q.shift();
      clearTimeout(opponent.botTimer);
      _createQueuedRoom(mode, opponent, { socket, clientId, userId, name, title, elo, isBot: false });
      return;
    }
    const entry = { socket, clientId, userId, name, title, elo };
    entry.botTimer = setTimeout(() => {
      const stillQueued = _dequeue(mode, socket.id);
      if (!stillQueued) return; // 這段等待期間已經被別人配走了
      _createQueuedRoom(mode, stillQueued, _spawnBotEntry(elo));
    }, QUICK_MATCH_BOT_TIMEOUT_MS);
    q.push(entry);
    socket.emit('queue_waiting', { mode });
  });

  socket.on('queue_leave', ({ mode } = {}) => {
    if (mode) _dequeue(mode, socket.id); else _leaveAllQueues(socket.id);
  });

  socket.on('leave_room', ({ code }) => dropFromRoom(socket, code));

  socket.on('disconnect', () => {
    _leaveAllQueues(socket.id);
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

// ── Supabase 保溫 ping（每 4 分鐘一次）──
// 免費方案的連線池閒置一段時間後，下一個請求會重新建立連線而變慢（實測冷連線
// 約多 400ms），且專案本身若連續 7 天完全無活動會被自動暫停。這裡定期打一個
// 極輕量的查詢，讓連線池與專案本身持續保持在「熱」的狀態。
cron.schedule('*/4 * * * *', async () => {
  try {
    await supabase.from('profiles').select('id', { count: 'exact', head: true }).limit(1);
  } catch (err) {
    console.error('[Cron] Supabase 保溫 ping 失敗：', err.message);
  }
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
