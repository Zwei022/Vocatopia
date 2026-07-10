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
};

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

// 執行一次抽卡（count 次），回傳結果陣列：
// 中獎：{ charId, tier, isNew, refund, isConsolation:false }
// 未中獎：{ charId:null, tier, isNew:false, refund:0, isConsolation:true, gold }
// 呼叫端負責先檢查/扣除金幣（本函式不處理金幣支出，只處理抽獎結果 + 角色持有 + 重複/安慰獎金幣）
function drawGacha(count) {
  const results = [];
  for (let i = 0; i < count; i++) {
    const entry = _gachaRollOne();
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
