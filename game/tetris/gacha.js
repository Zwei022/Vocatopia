// ════════════════════════════════
// 常駐卡池抽卡模組（商店）
// 純資料 + 抽卡邏輯，依賴 characters.js（TETRIS_CHARACTERS / getOwnedChars /
// addOwnedChar）。需在 characters.js 之後、script.js 之前載入。
// ════════════════════════════════

// 2026-08-10 拆成常駐/限時兩個獨立卡池（Notion「VOCATOPIA角色總覽」第五節定案）：
// 各卡池的機率/角色/保底/抽獎紀錄互相獨立，靠 GACHA_POOLS[poolId].id 當 localStorage key 字首區隔。
// GACHA_POOL 保留當作「目前選取中的卡池」這個可變指標，商店 UI 切換分頁時呼叫 switchGachaPool()
// 重新指向，這樣 script.js 原本一大堆直接讀 GACHA_POOL.xxx 的地方完全不用改。
const GACHA_POOLS = {
  standing: {
    id: 'standing',
    name: '常駐卡池',
    costSingle: 120,
    costTen: 1000,
    // entries.rate 總和 + consolation.rate 須為 1（100%）；tier 純顯示用文字。
    // 飯糰/水餃帳號預設就有，鬆餅/花生麻糬/焗烤龍蝦/香煎鵝肝改走其他獎勵管道發放，都不進卡池。
    entries: [
      { charId: 'honore',       tier: '特獎', rate: 0.01, dupRefund: 800 },
      { charId: 'canele',       tier: '二獎', rate: 0.04, dupRefund: 400 },
      { charId: 'millefeuille', tier: '三獎', rate: 0.15, dupRefund: 150 },
    ],
    consolation: { tier: '銘謝惠顧', rate: 0.80, flavorDew: 1 },
    pityLegendary: 100,
    pityMythicPlus: 50,
  },
  limited: {
    id: 'limited',
    name: '限時卡池',
    costSingle: 120,
    costTen: 1000,
    entries: [
      { charId: 'bluefin', tier: '特獎', rate: 0.01, dupRefund: 800 },
      { charId: 'uni',     tier: '二獎', rate: 0.04, dupRefund: 400 },
      { charId: 'sushi',   tier: '三獎', rate: 0.15, dupRefund: 150 },
    ],
    consolation: { tier: '銘謝惠顧', rate: 0.80, flavorDew: 1 },
    pityLegendary: 100,
    pityMythicPlus: 50,
  },
};

let GACHA_POOL = GACHA_POOLS.standing; // 目前選取中的卡池，switchGachaPool() 會重新指向

// 切換目前選取的卡池（商店分頁按鈕呼叫），回傳新卡池物件供 UI 立即取用
function switchGachaPool(poolId) {
  if (!GACHA_POOLS[poolId]) return GACHA_POOL;
  GACHA_POOL = GACHA_POOLS[poolId];
  return GACHA_POOL;
}
function getCurrentGachaPoolId() { return GACHA_POOL.id; }

const GACHA_HISTORY_MAX = 100;   // 只保留最近 100 筆抽獎紀錄（各卡池各自 100 筆）

function _gachaLoadHistory() {
  try { return JSON.parse(localStorage.getItem('voca_gacha_history_' + GACHA_POOL.id) || '[]') || []; }
  catch { return []; }
}
// 給 UI 顯示抽獎紀錄用（最新在前，目前選取中的卡池）
function getGachaHistory() { return _gachaLoadHistory(); }
function _gachaPushHistory(entries) {
  const merged = entries.concat(_gachaLoadHistory()).slice(0, GACHA_HISTORY_MAX);
  try { localStorage.setItem('voca_gacha_history_' + GACHA_POOL.id, JSON.stringify(merged)); } catch { /* ignore */ }
}

function _gachaLoadPity() {
  try {
    const p = JSON.parse(localStorage.getItem('voca_gacha_pity_' + GACHA_POOL.id) || 'null');
    if (p && typeof p.sinceLegendary === 'number' && typeof p.sinceMythicPlus === 'number') return p;
  } catch { /* 用預設 */ }
  return { sinceLegendary: 0, sinceMythicPlus: 0 };
}

function _gachaSavePity(pity) {
  localStorage.setItem('voca_gacha_pity_' + GACHA_POOL.id, JSON.stringify(pity));
  _syncGachaPityToServer();
}

// 給 UI 顯示目前保底進度用（目前選取中的卡池）
function getGachaPity() {
  return _gachaLoadPity();
}

// 保底進度跨裝置同步：本機 localStorage 仍是即時真相來源（抽卡當下不等網路），
// 這裡只是背景把「所有卡池」目前的保底進度整包寫回 Supabase profiles.gacha_pity，
// 失敗就算了，不影響已經完成的抽卡結果（比照 _syncCharsToServer 的做法）。
function _syncGachaPityToServer() {
  if (typeof currentUser === 'undefined' || !currentUser || typeof authClient === 'undefined') return;
  const all = {};
  Object.keys(GACHA_POOLS).forEach(poolId => {
    try {
      const p = JSON.parse(localStorage.getItem('voca_gacha_pity_' + poolId) || 'null');
      if (p && typeof p.sinceLegendary === 'number' && typeof p.sinceMythicPlus === 'number') all[poolId] = p;
    } catch { /* 跳過壞掉的本機資料 */ }
  });
  if (typeof currentProfile !== 'undefined' && currentProfile) currentProfile.gacha_pity = all;
  authClient
    .from('profiles')
    .update({ gacha_pity: all })
    .eq('id', currentUser.id)
    .then(({ error }) => { if (error) console.warn('[_syncGachaPityToServer] 同步失敗：', error.message); });
}

// 登入時從伺服器還原保底進度：逐卡池取本機與伺服器「較大值」合併寫回本機
// （保底次數只會單調上升、中獎才歸零，取較大值不會讓玩家的保底進度變差）。
// 由 auth.js 的 _loadProfile() 呼叫。
function restoreGachaPityFromServer(serverPity) {
  if (!serverPity || typeof serverPity !== 'object') return;
  let changed = false;
  Object.keys(GACHA_POOLS).forEach(poolId => {
    const sp = serverPity[poolId];
    if (!sp || typeof sp.sinceLegendary !== 'number' || typeof sp.sinceMythicPlus !== 'number') return;
    let lp;
    try { lp = JSON.parse(localStorage.getItem('voca_gacha_pity_' + poolId) || 'null'); } catch { lp = null; }
    if (!lp || typeof lp.sinceLegendary !== 'number') lp = { sinceLegendary: 0, sinceMythicPlus: 0 };
    const merged = {
      sinceLegendary: Math.max(lp.sinceLegendary, sp.sinceLegendary),
      sinceMythicPlus: Math.max(lp.sinceMythicPlus, sp.sinceMythicPlus),
    };
    if (merged.sinceLegendary !== lp.sinceLegendary || merged.sinceMythicPlus !== lp.sinceMythicPlus) {
      localStorage.setItem('voca_gacha_pity_' + poolId, JSON.stringify(merged));
      changed = true;
    }
  });
  if (changed && typeof currentProfile !== 'undefined' && currentProfile) _syncGachaPityToServer();
}

function _gachaEntryRarity(entry) {
  if (!entry || entry.isConsolation || !entry.charId) return null;
  return TETRIS_CHARACTERS[entry.charId]?.rarity || null;
}

// 依權重隨機抽出一個卡池項目；miss 時回傳 consolation 標記
function _gachaRollOne() {
  const r = Math.random();
  let acc = 0;
  for (const entry of GACHA_POOL.entries) {
    acc += entry.rate;
    if (r < acc) return entry;
  }
  return { isConsolation: true, ...GACHA_POOL.consolation };
}

// 抽一次並套用保底：連續 N 抽沒中傳奇 / 神話以上，強制觸發保底
function _gachaRollOneWithPity(pity) {
  pity.sinceLegendary += 1;
  pity.sinceMythicPlus += 1;

  let entry = _gachaRollOne();
  let rarity = _gachaEntryRarity(entry);

  if (rarity !== 'legendary' && pity.sinceLegendary >= GACHA_POOL.pityLegendary) {
    const forced = GACHA_POOL.entries.find(e => _gachaEntryRarity(e) === 'legendary');
    if (forced) { entry = forced; rarity = 'legendary'; }
  } else if (rarity !== 'legendary' && rarity !== 'mythic' && pity.sinceMythicPlus >= GACHA_POOL.pityMythicPlus) {
    const forced = GACHA_POOL.entries.find(e => _gachaEntryRarity(e) === 'mythic');
    if (forced) { entry = forced; rarity = 'mythic'; }
  }

  if (rarity === 'legendary') { pity.sinceLegendary = 0; pity.sinceMythicPlus = 0; }
  else if (rarity === 'mythic') { pity.sinceMythicPlus = 0; }

  return entry;
}

// 執行一次抽卡（count 次），回傳結果陣列：
// 中獎：{ charId, tier, isNew, refund, isConsolation:false }
// 未中獎：{ charId:null, tier, isNew:false, refund:0, isConsolation:true, flavorDew }
// 呼叫端負責先檢查/扣除金幣（本函式不處理金幣支出，只處理抽獎結果 + 角色持有 + 重複退幣/安慰獎風味露 + 保底計數）
function drawGacha(count) {
  const pity = _gachaLoadPity();
  const results = [];
  for (let i = 0; i < count; i++) {
    const entry = _gachaRollOneWithPity(pity);
    if (entry.isConsolation) {
      addFlavorDew(entry.flavorDew);
      results.push({ charId: null, tier: entry.tier, isNew: false, refund: 0, isConsolation: true, flavorDew: entry.flavorDew });
      continue;
    }
    const isNew = addOwnedChar(entry.charId);
    const refund = isNew ? 0 : entry.dupRefund;
    if (refund > 0) addGold(refund);
    results.push({ charId: entry.charId, tier: entry.tier, isNew, refund, isConsolation: false });
  }
  _gachaSavePity(pity);
  if (typeof _acOnGacha === 'function') _acOnGacha(count);   // #13 成就：抽卡次數累計
  // 記錄抽獎紀錄（最新在前）：時間 + 抽到什麼
  _gachaPushHistory(results.map(r => ({
    t: Date.now(),
    charId: r.charId, tier: r.tier,
    isNew: r.isNew, isConsolation: r.isConsolation,
    flavorDew: r.flavorDew || 0, refund: r.refund || 0,
  })));
  return results;
}

// 抽卡所需金幣是否足夠
function canAffordGacha(count) {
  const cost = count === 10 ? GACHA_POOL.costTen : GACHA_POOL.costSingle * count;
  return getGold() >= cost;
}

function gachaCost(count) {
  return count === 10 ? GACHA_POOL.costTen : GACHA_POOL.costSingle * count;
}
