// ════════════════════════════════
// 常駐卡池抽卡模組（商店）
// 純資料 + 抽卡邏輯，依賴 characters.js（TETRIS_CHARACTERS / getOwnedChars /
// addOwnedChar）。需在 characters.js 之後、script.js 之前載入。
// ════════════════════════════════

const GACHA_POOL = {
  id: 'standing_pool_v1',
  name: '常駐卡池',
  costSingle: 120,
  costTen: 1000,
  // entries.rate 總和 + consolation.rate 須為 1（100%）；tier 純顯示用文字。
  // 飯糰帳號預設就有、鬆餅改走其他獎勵管道發放，兩者都不放進卡池抽獎。
  entries: [
    { charId: 'lobster', tier: '特獎', rate: 0.01, dupRefund: 800 },
    { charId: 'sushi',   tier: '二獎', rate: 0.04, dupRefund: 400 },
    { charId: 'canele',  tier: '三獎', rate: 0.15, dupRefund: 150 },
  ],
  // 沒抽中角色時的金幣安慰獎（不產生任何角色）
  consolation: { tier: '銘謝惠顧', rate: 0.80, gold: 30 },
  // 保底（pity）：連續多少抽沒中對應等級以上，下一抽強制觸發
  pityLegendary: 100,  // 100 抽保底必中傳奇
  pityMythicPlus: 50,  // 50 抽保底必中神話以上（傳奇也算數）
};

const LS_GACHA_PITY = 'voca_gacha_pity';
const LS_GACHA_HISTORY = 'voca_gacha_history';
const GACHA_HISTORY_MAX = 100;   // 只保留最近 100 筆抽獎紀錄

function _gachaLoadHistory() {
  try { return JSON.parse(localStorage.getItem(LS_GACHA_HISTORY) || '[]') || []; }
  catch { return []; }
}
// 給 UI 顯示抽獎紀錄用（最新在前）
function getGachaHistory() { return _gachaLoadHistory(); }
function _gachaPushHistory(entries) {
  const merged = entries.concat(_gachaLoadHistory()).slice(0, GACHA_HISTORY_MAX);
  try { localStorage.setItem(LS_GACHA_HISTORY, JSON.stringify(merged)); } catch { /* ignore */ }
}

function _gachaLoadPity() {
  try {
    const p = JSON.parse(localStorage.getItem(LS_GACHA_PITY) || 'null');
    if (p && typeof p.sinceLegendary === 'number' && typeof p.sinceMythicPlus === 'number') return p;
  } catch { /* 用預設 */ }
  return { sinceLegendary: 0, sinceMythicPlus: 0 };
}

function _gachaSavePity(pity) {
  localStorage.setItem(LS_GACHA_PITY, JSON.stringify(pity));
}

// 給 UI 顯示目前保底進度用
function getGachaPity() {
  return _gachaLoadPity();
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
// 未中獎：{ charId:null, tier, isNew:false, refund:0, isConsolation:true, gold }
// 呼叫端負責先檢查/扣除金幣（本函式不處理金幣支出，只處理抽獎結果 + 角色持有 + 重複/安慰獎金幣 + 保底計數）
function drawGacha(count) {
  const pity = _gachaLoadPity();
  const results = [];
  for (let i = 0; i < count; i++) {
    const entry = _gachaRollOneWithPity(pity);
    if (entry.isConsolation) {
      addGold(entry.gold);
      results.push({ charId: null, tier: entry.tier, isNew: false, refund: 0, isConsolation: true, gold: entry.gold });
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
    gold: r.gold || 0, refund: r.refund || 0,
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
