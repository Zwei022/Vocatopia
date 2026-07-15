// #2 經驗值曲線（伺服器端）— 必須與前端 script.js 的 XP_BASE/XP_STEP 一致。
// 升級：Lv.L→L+1 需要 XP_BASE + (L-1)*XP_STEP。文法解鎖：4 + 等級（上限 92）。
const XP_BASE = 100, XP_STEP = 7, XP_MAX_LEVEL = 100;
const GRAMMAR_FREE_SECTIONS = 4;      // 第1、2章免費
const GRAMMAR_TOTAL_SECTIONS = 92;

function xpForLevel(level) {
  const n = Math.max(0, level - 1);
  return n * XP_BASE + XP_STEP * n * (n - 1) / 2;
}

function levelFromXp(xp) {
  xp = Math.max(0, xp || 0);
  let level = 1;
  while (level < XP_MAX_LEVEL && xp >= xpForLevel(level + 1)) level++;
  return level;
}

// 等級 → 已解鎖文法小節數（不含付費全解，由呼叫端另外處理 premium）
function unlockedGrammarSections(level) {
  return Math.min(GRAMMAR_TOTAL_SECTIONS, GRAMMAR_FREE_SECTIONS + level);
}

module.exports = { levelFromXp, unlockedGrammarSections, GRAMMAR_FREE_SECTIONS, GRAMMAR_TOTAL_SECTIONS };
