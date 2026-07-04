// ════════════════════════════════════════════════════════════════
// Vocatopia 塔防（第 1 關）— 廚房大戰
// 佈局：左＝敵方【廚具櫃】、右＝我方【冰箱】；我方食物兵由右向左推進
//
// 系統：
//   金幣生產   — 左下大圓鈕升級（Lv1→5，提高上限與每秒產量）
//   冰箱技能   — 右下大圓鈕，需答對題目才發動（寒氣：敵全體 -20%HP+減速）
//   限時問題   — 戰鬥中定時跳題：答對→我方狂暴；答錯→三選一負面效果
//   三星評價   — 勝利★｜限時內勝利★｜冰箱血量>50%★
//   加速鈕     — 左上，切換 1x / 2x
// 依賴：script.js 的 WORDS（出題字庫）、showToast
// ════════════════════════════════════════════════════════════════

// ── 兵種設定表（速度/射程單位：px，時間：秒）──
const TD_UNITS = {
  onigiri: {
    side: 'p', name: '飯糰', emoji: '🍙',
    cost: 70, summonCd: 2.6,
    hp: 92, atk: 20, atkItv: 1.05, range: 34, speed: 60, size: 34,
  },
  spoon: {
    side: 'e', name: '小湯匙', emoji: '🥄',
    hp: 72, atk: 16, atkItv: 1.0, range: 30, speed: 50, size: 30,
  },
};

// ── 金幣生產等級表（up = 升到此級所需金幣；Lv1 為初始不需花費）──
const TD_GOLD_LEVELS = [
  { max: 130, rate: 8,  up: 0   },   // Lv1（初始）
  { max: 190, rate: 11, up: 80  },   // Lv2
  { max: 260, rate: 15, up: 170 },   // Lv3
  { max: 350, rate: 20, up: 300 },   // Lv4
  { max: 460, rate: 26, up: 460 },   // Lv5（滿級）
];

// ── 關卡設定表 ──
const TD_LEVELS = {
  1: {
    name: '第 1 關｜廚房大戰',
    playerBase: { hp: 1000, label: '我方冰箱' },   // 右
    enemyBase:  { hp: 860,  label: '敵方廚具櫃' }, // 左
    startGold: 70,
    deck: ['onigiri'],
    deckSlots: 5,
    enemy: { unit: 'spoon', firstAt: 5, interval: 4.2, maxAlive: 11 },
    // 限時問題
    quiz: {
      firstAt: 7, interval: 14, timeLimit: 10,
      rage: { duration: 8, atkMul: 1.6, spdMul: 1.5 },
    },
    // 冰箱技能
    fridge: {
      baseCd: 28, failCdMul: 1.5, timeLimit: 10,
      coldDur: 10, dmgPct: 0.20, slowMul: 0.80,   // 敵全體扣 20% 最大血、移速 ×0.8
    },
    starTime: 180,          // 3 分鐘內勝利拿第 2 星（秒）
    starHpPct: 0.5,         // 冰箱血量 > 50% 拿第 3 星
    reward: { food: 3 },
  },
};

// WORDS 未載入時的出題備援
const TD_QUIZ_FALLBACK = [
  { word: 'apple',  zh: '蘋果' },   { word: 'water',  zh: '水' },
  { word: 'happy',  zh: '快樂的' }, { word: 'school', zh: '學校' },
  { word: 'run',    zh: '跑' },     { word: 'book',   zh: '書' },
  { word: 'friend', zh: '朋友' },   { word: 'eat',    zh: '吃' },
  { word: 'moon',   zh: '月亮' },   { word: 'cold',   zh: '寒冷的' },
  { word: 'fast',   zh: '快的' },   { word: 'green',  zh: '綠色的' },
];

const TD_BASE_HALF = 40;   // 塔身碰撞半寬
const TD_UNIT_HALF  = 14;
const TD_PROGRESS_KEY = 'td_progress';

let TD = null;

// ════════════════════ 進度存取（含星數）════════════════════
function tdLoadProgress() {
  try { return JSON.parse(localStorage.getItem(TD_PROGRESS_KEY)) || {}; }
  catch { return {}; }
}
function tdStarsFor(levelN) {
  const rec = tdLoadProgress()[levelN];
  return rec && rec.cleared ? (rec.stars || 1) : 0;
}
function tdSaveClear(levelN, stars) {
  const p = tdLoadProgress();
  const prev = p[levelN] || {};
  p[levelN] = { cleared: true, stars: Math.max(stars, prev.stars || 0), clearedAt: Date.now() };
  localStorage.setItem(TD_PROGRESS_KEY, JSON.stringify(p));
}

// ════════════════════ 啟動 / 結束 ════════════════════
function tdStartLevel(levelN) {
  const cfg = TD_LEVELS[levelN];
  if (!cfg) return showToast(`關卡 ${levelN} 尚未開放`);

  const overlay = document.getElementById('tdOverlay');
  overlay.style.display = 'flex';
  document.body.classList.add('td-lock');
  document.getElementById('tdLevelName').textContent = cfg.name;
  document.getElementById('tdMenu').style.display  = 'none';
  document.getElementById('tdQuiz').style.display  = 'none';
  document.getElementById('tdRageBadge').style.display = 'none';
  document.getElementById('tdNotice').style.display = 'none';

  tdRenderDeck(cfg);

  TD = {
    levelN, cfg,
    t: 0, last: 0, raf: 0,
    paused: false, over: false, speed: 1,
    money: cfg.startGold, goldLv: 0,
    units: [],
    bases: {
      p: { side: 'p', tower: true, hp: cfg.playerBase.hp, maxHp: cfg.playerBase.hp },
      e: { side: 'e', tower: true, hp: cfg.enemyBase.hp,  maxHp: cfg.enemyBase.hp  },
    },
    nextSpawnAt: cfg.enemy.firstAt,
    cardCd: 0,
    quizPool: tdBuildQuizPool(),
    nextQuizAt: cfg.quiz.firstAt,
    quiz: null,               // { answer, remain, timeLimit, resolved, onDone }
    rageT: 0,
    fridgeCd: 0, fridgeReady: true,
    coldT: 0, blackoutT: 0,
    rings: [], hits: [], notices: [], shakeT: 0,
  };

  tdSizeCanvas();
  TD.last = performance.now();
  TD.raf = requestAnimationFrame(tdLoop);
}

function tdQuit() {
  if (TD) { cancelAnimationFrame(TD.raf); TD = null; }
  document.getElementById('tdOverlay').style.display = 'none';
  document.body.classList.remove('td-lock');
  const map = document.getElementById('hmLevelMap');       // 清除重畫守衛，讓星數刷新
  if (map) delete map.dataset.w;
  if (typeof updateHomeScreen === 'function') updateHomeScreen();
}

function tdRestart() {
  const n = TD ? TD.levelN : 1;
  tdQuit();
  document.getElementById('tdOverlay').style.display = 'flex';
  document.body.classList.add('td-lock');
  tdStartLevel(n);
}

// ════════════════════ 召喚卡列 ════════════════════
function tdRenderDeck(cfg) {
  const deck = document.getElementById('tdDeck');
  let html = '';
  for (const key of cfg.deck) {
    const u = TD_UNITS[key];
    html += `
      <button class="td-card" id="tdCard_${key}" onclick="tdSummon('${key}')">
        <span class="td-card-emoji">${u.emoji}</span>
        <span class="td-card-name">${u.name}</span>
        <span class="td-card-cost">${u.cost}元</span>
        <div class="td-card-cd" id="tdCardCd_${key}"></div>
      </button>`;
  }
  for (let i = cfg.deck.length; i < cfg.deckSlots; i++) {
    html += `<div class="td-card td-card-locked">🔒</div>`;
  }
  deck.innerHTML = html;
}

function tdSummon(key) {
  if (!TD || TD.paused || TD.over) return;
  const u = TD_UNITS[key];
  if (TD.cardCd > 0 || TD.money < u.cost) return;
  TD.money  -= u.cost;
  TD.cardCd  = u.summonCd;
  TD.units.push(tdMakeUnit(key, TD.fieldW - TD_BASE_HALF - 24));   // 從冰箱前生出
}

function tdSpawnEnemy() {
  TD.units.push(tdMakeUnit(TD.cfg.enemy.unit, TD_BASE_HALF + 24)); // 從廚具櫃前生出
}

function tdMakeUnit(key, x) {
  const c = TD_UNITS[key];
  return { key, side: c.side, cfg: c, x, hp: c.hp, maxHp: c.hp, atkT: 0, slowT: 0, slowMul: 1, seed: Math.random() * 10 };
}

// ════════════════════ 金幣升級 ════════════════════
function tdUpgradeGold() {
  if (!TD || TD.paused || TD.over) return;
  if (TD.goldLv >= TD_GOLD_LEVELS.length - 1) return;
  const next = TD_GOLD_LEVELS[TD.goldLv + 1];
  if (TD.money < next.up) return;
  TD.money -= next.up;
  TD.goldLv++;
  TD.notices.push({ txt: `💰 金幣生產升級 Lv.${TD.goldLv + 1}！`, t: 1.6, color: '#F0AD1D' });
}

// ════════════════════ 冰箱技能 ════════════════════
function tdFridgeSkill() {
  if (!TD || TD.paused || TD.over) return;
  if (!TD.fridgeReady || TD.quiz) return;                 // 冷卻中或正在答題不可用
  const f = TD.cfg.fridge;
  TD.fridgeReady = false;
  tdQuizOpen(f.timeLimit, correct => {
    if (correct) {
      // 成功：開冰箱門吹寒氣
      TD.coldT = f.coldDur;
      for (const u of TD.units) {
        if (u.side !== 'e') continue;
        u.hp -= u.maxHp * f.dmgPct;
        u.slowT = f.coldDur; u.slowMul = f.slowMul;
      }
      TD.units = TD.units.filter(u => u.hp > 0);
      TD.rings.push({ x: TD.fieldW - TD_BASE_HALF, r: 20, t: 1.0, color: '90,180,255' });
      TD.fridgeCd = f.baseCd;
      TD.notices.push({ txt: '❄️ 寒氣爆發！敵方冰凍減速', t: 1.6, color: '#4A8FFF' });
    } else {
      // 失敗：冰箱跳電，冷卻 +50%
      TD.fridgeCd = f.baseCd * f.failCdMul;
      TD.blackoutT = 1.2;
      TD.notices.push({ txt: '⚡ 冰箱跳電！技能失敗，冷卻延長', t: 1.8, color: '#E0472E' });
    }
  });
}

// ════════════════════ 主迴圈 ════════════════════
function tdLoop(now) {
  if (!TD) return;
  let dt = Math.min((now - TD.last) / 1000, 0.05);
  TD.last = now;
  if (!TD.paused && !TD.over) tdUpdate(dt * TD.speed);
  tdRender();
  tdUpdateHud();
  if (TD) TD.raf = requestAnimationFrame(tdLoop);
}

function tdUpdate(dt) {
  const cfg = TD.cfg;
  TD.t += dt;

  // 金幣
  const gl = TD_GOLD_LEVELS[TD.goldLv];
  TD.money = Math.min(TD.money + gl.rate * dt, gl.max);
  if (TD.cardCd    > 0) TD.cardCd    -= dt;
  if (TD.fridgeCd  > 0) { TD.fridgeCd -= dt; if (TD.fridgeCd <= 0) TD.fridgeReady = true; }
  if (TD.coldT     > 0) TD.coldT     -= dt;
  if (TD.blackoutT > 0) TD.blackoutT -= dt;
  if (TD.shakeT    > 0) TD.shakeT    -= dt;

  // 敵方生產
  const aliveEnemies = TD.units.filter(u => u.side === 'e').length;
  if (TD.t >= TD.nextSpawnAt && aliveEnemies < cfg.enemy.maxAlive) {
    tdSpawnEnemy();
    TD.nextSpawnAt = TD.t + cfg.enemy.interval;
  }

  // 限時問題排程與倒數
  if (!TD.quiz && TD.t >= TD.nextQuizAt) tdQuizShowBattle();
  if (TD.quiz && !TD.quiz.resolved) {
    TD.quiz.remain -= dt;
    const fill = document.getElementById('tdQuizTimeFill');
    if (fill) fill.style.width = Math.max(TD.quiz.remain / TD.quiz.timeLimit * 100, 0) + '%';
    if (TD.quiz.remain <= 0) tdQuizResolve(-1);
  }

  // 狂暴倒數
  if (TD.rageT > 0) {
    TD.rageT -= dt;
    if (TD.rageT <= 0) document.getElementById('tdRageBadge').style.display = 'none';
  }

  // 單位 AI
  for (const u of TD.units) {
    if (u.slowT > 0) { u.slowT -= dt; if (u.slowT <= 0) u.slowMul = 1; }
    if (u.atkT  > 0) u.atkT  -= dt;

    const dir = u.side === 'p' ? -1 : 1;
    const foes = TD.units.filter(o => o.side !== u.side && o.hp > 0);
    const foeBase = u.side === 'p' ? TD.bases.e : TD.bases.p;
    const baseX   = u.side === 'p' ? TD_BASE_HALF : TD.fieldW - TD_BASE_HALF;

    let target = null, targetDist = Infinity, targetHalf = 0;
    for (const f of foes) {
      const d = (f.x - u.x) * dir;
      if (d >= -TD_UNIT_HALF && d < targetDist) { target = f; targetDist = d; targetHalf = TD_UNIT_HALF; }
    }
    const dBase = (baseX - u.x) * dir;
    if (dBase < targetDist) { target = foeBase; targetDist = dBase; targetHalf = TD_BASE_HALF; }

    if (targetDist <= u.cfg.range + targetHalf - TD_UNIT_HALF) {
      if (u.atkT <= 0) {
        const rage = u.side === 'p' && TD.rageT > 0;
        const dmg  = Math.round(u.cfg.atk * (rage ? cfg.quiz.rage.atkMul : 1));
        target.hp -= dmg;
        u.atkT = u.cfg.atkItv;
        TD.hits.push({ x: target.tower ? baseX : target.x, y: 0, txt: `-${dmg}`, t: 0.6, side: u.side });
        if (target.tower && target.hp <= 0) return tdEndGame(target === TD.bases.e);
      }
    } else {
      let spd = u.cfg.speed * u.slowMul;
      if (u.side === 'p' && TD.rageT > 0) spd *= cfg.quiz.rage.spdMul;
      u.x += dir * spd * dt;
    }
  }
  TD.units = TD.units.filter(u => u.hp > 0);

  // 特效衰減
  for (const s of TD.rings)   { s.r += 260 * dt; s.t -= dt; }
  TD.rings = TD.rings.filter(s => s.t > 0);
  for (const h of TD.hits)    { h.t -= dt; h.y -= 24 * dt; }
  TD.hits = TD.hits.filter(h => h.t > 0);
  for (const n of TD.notices) n.t -= dt;
  TD.notices = TD.notices.filter(n => n.t > 0);

  tdShowNotice();
}

// ════════════════════ 限時問題（通用）════════════════════
function tdBuildQuizPool() {
  let pool = [];
  if (typeof WORDS !== 'undefined' && Array.isArray(WORDS)) {
    pool = WORDS.filter(w => w.definition_zh && /^[a-z]{2,12}$/i.test(w.word))
                .map(w => ({ word: w.word, zh: w.definition_zh }));
  }
  if (pool.length < 8) pool = [...TD_QUIZ_FALLBACK];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = 0 | Math.random() * (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

// 開一題：onDone(correct) 由呼叫者決定成敗後果
function tdQuizOpen(timeLimit, onDone) {
  if (TD.quizPool.length < 4) TD.quizPool = tdBuildQuizPool();
  const target = TD.quizPool.pop();
  const wrongs = [];
  for (const c of TD.quizPool) {
    if (wrongs.length >= 3) break;
    if (c.zh !== target.zh) wrongs.push(c.zh);
  }
  const opts = [target.zh, ...wrongs];
  for (let i = opts.length - 1; i > 0; i--) {
    const j = 0 | Math.random() * (i + 1);
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  TD.quiz = { answer: opts.indexOf(target.zh), remain: timeLimit, timeLimit, resolved: false, onDone };

  document.getElementById('tdQuizWord').textContent = target.word;
  document.getElementById('tdQuizOpts').innerHTML = opts.map((o, i) =>
    `<button class="td-quiz-opt" id="tdQOpt${i}" onclick="tdQuizResolve(${i})">${o}</button>`
  ).join('');
  document.getElementById('tdQuizTimeFill').style.width = '100%';
  document.getElementById('tdQuiz').style.display = 'block';
}

// 戰場定時題：答對→狂暴；答錯→三選一負面效果
function tdQuizShowBattle() {
  tdQuizOpen(TD.cfg.quiz.timeLimit, correct => {
    if (correct) {
      TD.rageT = TD.cfg.quiz.rage.duration;
      document.getElementById('tdRageBadge').style.display = 'block';
    } else {
      tdApplyNegative(1 + (0 | Math.random() * 3));
    }
    TD.nextQuizAt = TD.t + TD.cfg.quiz.interval;
  });
}

function tdQuizResolve(choice) {
  if (!TD || !TD.quiz || TD.quiz.resolved) return;
  const q = TD.quiz;
  q.resolved = true;
  const correct = choice === q.answer;

  const ansBtn = document.getElementById(`tdQOpt${q.answer}`);
  if (ansBtn) ansBtn.classList.add('td-qopt-right');
  if (!correct && choice >= 0) {
    const pick = document.getElementById(`tdQOpt${choice}`);
    if (pick) pick.classList.add('td-qopt-wrong');
  }
  document.querySelectorAll('.td-quiz-opt').forEach(b => b.disabled = true);

  const done = q.onDone;
  setTimeout(() => {
    if (!TD) return;
    document.getElementById('tdQuiz').style.display = 'none';
    TD.quiz = null;
    if (done) done(correct);
  }, 850);
}

// 三種答錯負面效果
function tdApplyNegative(kind) {
  if (kind === 1) {
    // ① 敵方增援：立即召喚 3 隻小湯匙
    for (let i = 0; i < 3; i++) TD.units.push(tdMakeUnit(TD.cfg.enemy.unit, TD_BASE_HALF + 24 + i * 20));
    TD.notices.push({ txt: '答錯！敵方緊急增援 🥄×3', t: 1.8, color: '#E0472E' });
  } else if (kind === 2) {
    // ② 我方全體減速 30% 十秒
    for (const u of TD.units) { if (u.side === 'p') { u.slowT = 10; u.slowMul = 0.70; } }
    TD.notices.push({ txt: '答錯！我方全體減速 30%（10 秒）', t: 1.8, color: '#4A8FFF' });
  } else {
    // ③ 敵方飛彈：最前排我方友軍及小範圍內 -50% 當前血量
    const allies = TD.units.filter(u => u.side === 'p');
    if (allies.length) {
      const front = allies.reduce((a, b) => (b.x < a.x ? b : a));   // x 最小 = 最靠近敵方
      for (const u of allies) {
        if (Math.abs(u.x - front.x) <= 42) u.hp -= u.maxHp * 0.5;
      }
      TD.units = TD.units.filter(u => u.hp > 0);
      TD.rings.push({ x: front.x, r: 14, t: 0.8, color: '224,71,46' });
      TD.shakeT = 0.35;
    }
    TD.notices.push({ txt: '答錯！敵方飛彈轟炸前排 💥', t: 1.8, color: '#E0472E' });
  }
}

function tdShowNotice() {
  const el = document.getElementById('tdNotice');
  if (!el) return;
  const n = TD.notices[TD.notices.length - 1];
  if (n) { el.textContent = n.txt; el.style.color = n.color; el.style.display = 'block'; }
  else el.style.display = 'none';
}

// ════════════════════ 勝負 / 三星 / 選單 ════════════════════
function tdEndGame(win) {
  if (TD.over) return;
  TD.over = true;
  let stars = 0;
  if (win) {
    stars = 1;
    if (TD.t <= TD.cfg.starTime) stars++;
    if (TD.bases.p.hp / TD.bases.p.maxHp > TD.cfg.starHpPct) stars++;
    tdSaveClear(TD.levelN, stars);
  }
  const reward = TD.cfg.reward;
  const mm = Math.floor(TD.t / 60), ss = ('0' + Math.floor(TD.t % 60)).slice(-2);
  setTimeout(() => {
    if (!TD) return;
    if (win) {
      const starRow = [0, 1, 2].map(i =>
        `<span class="td-star ${i < stars ? 'on' : ''}">★</span>`).join('');
      const conds =
        `<div class="td-star-cond ${stars >= 1 ? 'ok' : ''}">★ 通關勝利</div>
         <div class="td-star-cond ${TD.t <= TD.cfg.starTime ? 'ok' : ''}">★ ${Math.floor(TD.cfg.starTime/60)} 分鐘內獲勝（${mm}:${ss}）</div>
         <div class="td-star-cond ${TD.bases.p.hp/TD.bases.p.maxHp > TD.cfg.starHpPct ? 'ok' : ''}">★ 冰箱血量保持 50% 以上（${Math.round(TD.bases.p.hp/TD.bases.p.maxHp*100)}%）</div>`;
      tdShowMenu(
        `<div class="td-menu-title">🎉 廚房守住了！</div>
         <div class="td-stars">${starRow}</div>
         ${conds}
         <div class="td-menu-sub">獲得獎勵：🍖 訓練食材 ×${reward.food}</div>
         <button class="td-menu-btn td-menu-main" onclick="tdRestart()">再玩一次</button>
         <button class="td-menu-btn" onclick="tdQuit()">返回首頁</button>`);
    } else {
      tdShowMenu(
        `<div class="td-menu-title">💥 冰箱被攻陷了…</div>
         <div class="td-menu-sub">善用冰箱寒氣技能與答題狂暴，別讓湯匙靠近冰箱！</div>
         <button class="td-menu-btn td-menu-main" onclick="tdRestart()">再挑戰一次</button>
         <button class="td-menu-btn" onclick="tdQuit()">返回首頁</button>`);
    }
  }, 650);
}

function tdTogglePause() {
  if (!TD || TD.over) return;
  if (TD.paused) return tdResume();
  TD.paused = true;
  tdShowMenu(
    `<div class="td-menu-title">⏸ 暫停中</div>
     <button class="td-menu-btn td-menu-main" onclick="tdResume()">繼續戰鬥</button>
     <button class="td-menu-btn" onclick="tdRestart()">重新開始</button>
     <button class="td-menu-btn" onclick="tdQuit()">放棄關卡</button>`);
}
function tdResume() {
  if (!TD) return;
  TD.paused = false; TD.last = performance.now();
  document.getElementById('tdMenu').style.display = 'none';
}
function tdShowMenu(html) {
  const m = document.getElementById('tdMenu');
  m.querySelector('.td-menu-box').innerHTML = html;
  m.style.display = 'flex';
}

function tdToggleSpeed() {
  if (!TD) return;
  TD.speed = TD.speed === 1 ? 2 : 1;
  document.getElementById('tdSpeedBtn').textContent = `⏩ x${TD.speed}`;
  document.getElementById('tdSpeedBtn').classList.toggle('on', TD.speed === 2);
}

// ════════════════════ HUD 更新 ════════════════════
function tdUpdateHud() {
  if (!TD) return;
  const gl = TD_GOLD_LEVELS[TD.goldLv];
  document.getElementById('tdMoneyNow').textContent = Math.floor(TD.money);
  document.getElementById('tdMoneyCap').textContent = gl.max;
  document.getElementById('tdGoldSub').textContent  = `生產 Lv.${TD.goldLv + 1} · +${gl.rate}/秒`;

  // 倒數計時（限時星條件）+ 冰箱血量%
  const left = Math.max(TD.cfg.starTime - TD.t, 0);
  document.getElementById('tdTimer').textContent =
    `${Math.floor(left / 60)}:${('0' + Math.floor(left % 60)).slice(-2)}`;
  document.getElementById('tdTimer').classList.toggle('warn', left <= 0);
  const hpPct = Math.max(Math.round(TD.bases.p.hp / TD.bases.p.maxHp * 100), 0);
  const hpEl = document.getElementById('tdFridgeHp');
  hpEl.textContent = `🧊 ${hpPct}%`;
  hpEl.classList.toggle('low', hpPct <= 50);

  // 召喚卡冷卻/買不起
  const key = TD.cfg.deck[0], card = document.getElementById(`tdCard_${key}`);
  if (card) {
    const u = TD_UNITS[key];
    card.classList.toggle('td-card-poor', TD.money < u.cost);
    document.getElementById(`tdCardCd_${key}`).style.height =
      TD.cardCd > 0 ? (TD.cardCd / u.summonCd * 100) + '%' : '0%';
  }

  // 金幣升級鈕
  const gbtn = document.getElementById('tdGoldUpBtn');
  if (TD.goldLv >= TD_GOLD_LEVELS.length - 1) {
    gbtn.innerHTML = `<span class="tr-ico">💰</span><span class="tr-t">滿級</span><span class="tr-s">MAX</span>`;
    gbtn.classList.add('maxed'); gbtn.classList.remove('afford');
  } else {
    const next = TD_GOLD_LEVELS[TD.goldLv + 1];
    gbtn.innerHTML = `<span class="tr-ico">💰</span><span class="tr-t">Lv.${TD.goldLv + 1}</span><span class="tr-s">${next.up}元</span>`;
    gbtn.classList.toggle('afford', TD.money >= next.up);
  }

  // 冰箱技能鈕
  const fbtn = document.getElementById('tdFridgeBtn');
  if (TD.fridgeReady) {
    fbtn.innerHTML = `<span class="tr-ico">🧊</span><span class="tr-t">寒氣</span><span class="tr-s">就緒</span>`;
    fbtn.classList.add('afford'); fbtn.classList.remove('cooling');
  } else {
    fbtn.innerHTML = `<span class="tr-ico">🧊</span><span class="tr-t">冷卻</span><span class="tr-s">${Math.ceil(TD.fridgeCd)}s</span>`;
    fbtn.classList.remove('afford'); fbtn.classList.add('cooling');
  }
}

// ════════════════════ 繪製 ════════════════════
function tdSizeCanvas() {
  const cv = document.getElementById('tdCanvas');
  const wrap = cv.parentElement;
  const dpr = window.devicePixelRatio || 1;
  cv.width  = wrap.clientWidth * dpr;
  cv.height = wrap.clientHeight * dpr;
  cv.style.width  = wrap.clientWidth + 'px';
  cv.style.height = wrap.clientHeight + 'px';
  if (TD) { TD.fieldW = wrap.clientWidth; TD.fieldH = wrap.clientHeight; TD.dpr = dpr; }
}
window.addEventListener('resize', () => { if (TD) tdSizeCanvas(); });

function tdRender() {
  const cv = document.getElementById('tdCanvas');
  const ctx = cv.getContext('2d');
  const W = TD.fieldW, H = TD.fieldH;
  ctx.setTransform(TD.dpr, 0, 0, TD.dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  if (TD.shakeT > 0) ctx.translate((Math.random() - .5) * 8, (Math.random() - .5) * 8);

  const counterY = H * 0.60;   // 流理臺檯面線
  const floorY   = H * 0.78;   // 地板線（單位站立處）

  tdDrawKitchen(ctx, W, H, counterY, floorY);

  // 塔：左＝廚具櫃(敵)、右＝冰箱(我)
  tdDrawCabinet(ctx, TD_BASE_HALF,     floorY, TD.bases.e, TD.cfg.enemyBase);
  tdDrawFridge(ctx,  W - TD_BASE_HALF, floorY, TD.bases.p, TD.cfg.playerBase);

  // 寒氣覆蓋（技能生效中）
  if (TD.coldT > 0) {
    ctx.fillStyle = `rgba(150,205,255,${Math.min(TD.coldT / 3, .28)})`;
    ctx.fillRect(0, 0, W, floorY + 12);
    for (let i = 0; i < 14; i++) {
      const x = (i * 97 + TD.t * 120) % W;
      const y = (i * 53 + TD.t * 60) % floorY;
      ctx.fillStyle = 'rgba(255,255,255,.7)';
      ctx.fillText('❄', W - x, y);
    }
  }

  // 特效圓環
  for (const s of TD.rings) {
    ctx.strokeStyle = `rgba(${s.color},${s.t})`;
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(s.x, floorY - 18, s.r, 0, Math.PI * 2); ctx.stroke();
  }

  // 單位
  for (const u of TD.units) {
    const bob = Math.abs(Math.sin(TD.t * 8 + u.seed)) * 4;
    const y = floorY - u.cfg.size / 2 - bob;
    if (u.side === 'p' && TD.rageT > 0) {
      ctx.fillStyle = 'rgba(245,146,30,.35)';
      ctx.beginPath(); ctx.ellipse(u.x, floorY - 3, u.cfg.size * .62, 9, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (u.slowT > 0) {
      ctx.fillStyle = 'rgba(74,143,255,.28)';
      ctx.beginPath(); ctx.ellipse(u.x, floorY - 3, u.cfg.size * .55, 8, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.font = `${u.cfg.size}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (u.side === 'e') { ctx.save(); ctx.translate(u.x, y); ctx.scale(-1, 1); ctx.fillText(u.cfg.emoji, 0, 0); ctx.restore(); }
    else ctx.fillText(u.cfg.emoji, u.x, y);
    const bw = 30, bx = u.x - bw / 2, by = y - u.cfg.size / 2 - 9;
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(bx, by, bw, 4);
    ctx.fillStyle = u.side === 'p' ? '#3BA55D' : '#E0472E';
    ctx.fillRect(bx, by, bw * Math.max(u.hp / u.maxHp, 0), 4);
  }

  // 傷害數字
  for (const h of TD.hits) {
    ctx.globalAlpha = Math.min(h.t / 0.3, 1);
    ctx.font = 'bold 13px Nunito, sans-serif';
    ctx.fillStyle = h.side === 'p' ? '#F5921E' : '#E0472E';
    ctx.textAlign = 'center';
    ctx.fillText(h.txt, h.x + (h.side === 'p' ? -6 : 6), floorY - 62 + h.y);
    ctx.globalAlpha = 1;
  }
}

// 廚房背景：磁磚牆、窗戶、流理臺、地板
function tdDrawKitchen(ctx, W, H, counterY, floorY) {
  // 牆
  ctx.fillStyle = '#F3E7D0'; ctx.fillRect(0, 0, W, counterY);
  // 磁磚縫
  ctx.strokeStyle = 'rgba(180,150,110,.35)'; ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 46) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, counterY); ctx.stroke(); }
  for (let y = 0; y <= counterY; y += 34) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  // 窗戶（中央上方）
  const wx = W / 2 - 46, wy = 16, ww = 92, wh = counterY * 0.5;
  ctx.fillStyle = '#BFE6F5'; ctx.fillRect(wx, wy, ww, wh);
  const sky = ctx.createLinearGradient(0, wy, 0, wy + wh);
  sky.addColorStop(0, '#AEDCF7'); sky.addColorStop(1, '#E7F6FF');
  ctx.fillStyle = sky; ctx.fillRect(wx + 4, wy + 4, ww - 8, wh - 8);
  ctx.fillStyle = '#FFF'; ctx.globalAlpha = .8;
  tdCloud(ctx, wx + ww * .35, wy + wh * .4, 12); ctx.globalAlpha = 1;
  ctx.strokeStyle = '#B98E5A'; ctx.lineWidth = 4; ctx.strokeRect(wx, wy, ww, wh);
  ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh);
  ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2); ctx.stroke();
  // 流理臺檯面
  ctx.fillStyle = '#8A5A34'; ctx.fillRect(0, counterY, W, 10);
  ctx.fillStyle = '#C9A06A'; ctx.fillRect(0, counterY + 10, W, floorY - counterY - 10);
  // 地板
  ctx.fillStyle = '#D9CBB4'; ctx.fillRect(0, floorY, W, H - floorY);
  ctx.strokeStyle = 'rgba(150,120,80,.3)';
  for (let x = -floorY; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, floorY); ctx.lineTo(x + (H - floorY), H); ctx.stroke(); }
  ctx.fillStyle = 'rgba(120,90,50,.9)'; ctx.fillRect(0, floorY - 3, W, 3);
}

function tdCloud(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.arc(x + r * .9, y + r * .25, r * .7, 0, Math.PI * 2);
  ctx.arc(x - r * .9, y + r * .3, r * .6, 0, Math.PI * 2);
  ctx.fill();
}

// 敵方廚具櫃（左）
function tdDrawCabinet(ctx, x, floorY, state, cfg) {
  const w = TD_BASE_HALF * 2 + 8, h = 150, y = floorY - h;
  ctx.fillStyle = '#9A6A3C'; ctx.strokeStyle = '#5E3D22'; ctx.lineWidth = 3;
  tdRoundRect(ctx, x - w / 2, y, w, h, 6); ctx.fill(); ctx.stroke();
  // 上層櫃門 + 餐具
  ctx.fillStyle = '#7E5330'; ctx.fillRect(x - w / 2 + 6, y + 8, w - 12, h * 0.42);
  ctx.font = '22px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('🍴', x - 10, y + h * 0.22); ctx.fillText('🔪', x + 12, y + h * 0.22);
  // 把手
  ctx.fillStyle = '#3E2A18'; ctx.fillRect(x - 3, y + 10, 6, h * 0.36);
  // 下層開口（湯匙出沒）
  ctx.fillStyle = '#2A1C10';
  tdRoundRect(ctx, x - w / 2 + 10, floorY - h * 0.34, w - 20, h * 0.34 - 4, 5); ctx.fill();
  tdBaseLabel(ctx, x, y, state, cfg, '#E0472E');
}

// 我方冰箱（右）
function tdDrawFridge(ctx, x, floorY, state, cfg) {
  const w = TD_BASE_HALF * 2 + 6, h = 156, y = floorY - h;
  ctx.fillStyle = TD.coldT > 0 ? '#E8F5FF' : '#F4F6F8';
  ctx.strokeStyle = '#9AA6B2'; ctx.lineWidth = 3;
  tdRoundRect(ctx, x - w / 2, y, w, h, 10); ctx.fill(); ctx.stroke();
  // 冷凍/冷藏分隔
  ctx.beginPath(); ctx.moveTo(x - w / 2, y + h * 0.34); ctx.lineTo(x + w / 2, y + h * 0.34);
  ctx.strokeStyle = '#C3CDD6'; ctx.lineWidth = 2; ctx.stroke();
  // 把手
  ctx.fillStyle = '#B7C1CB'; ctx.fillRect(x + w / 2 - 9, y + 12, 4, h * 0.24);
  ctx.fillRect(x + w / 2 - 9, y + h * 0.42, 4, h * 0.4);
  // 磁鐵
  ctx.font = '15px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('🧲', x - w / 4, y + h * 0.18);
  ctx.fillText(TD.coldT > 0 ? '❄️' : '🍎', x - w / 5, y + h * 0.6);
  // 跳電
  if (TD.blackoutT > 0 && Math.floor(TD.t * 12) % 2) {
    ctx.fillStyle = 'rgba(0,0,0,.5)'; tdRoundRect(ctx, x - w / 2, y, w, h, 10); ctx.fill();
    ctx.font = '26px serif'; ctx.fillText('⚡', x, y + h / 2);
  }
  tdBaseLabel(ctx, x, y, state, cfg, '#3BA55D');
}

function tdBaseLabel(ctx, x, y, state, cfg, hpColor) {
  ctx.font = 'bold 11px Nunito, sans-serif'; ctx.fillStyle = '#4B382A';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(cfg.label, x, y - 22);
  ctx.fillText(`${Math.max(Math.round(state.hp), 0)}/${state.maxHp}`, x, y - 10);
  const bw = 58, bx = x - bw / 2, by = y - 4;
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(bx, by, bw, 5);
  ctx.fillStyle = hpColor; ctx.fillRect(bx, by, bw * Math.max(state.hp / state.maxHp, 0), 5);
}

function tdRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
