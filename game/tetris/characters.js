// ════════════════════════════════
// 角色資料模組（俄羅斯方塊出戰角色）
// 純資料定義，供首頁角色欄、收藏頁、遊戲技能三處共用。
// 需在 script.js 之前載入，讓首頁渲染時就能讀到。
// ════════════════════════════════

const TETRIS_CHARACTERS = {
  onigiri: {
    id: 'onigiri',
    name: '飯糰人',
    img: 'public/images/characters/onigiri.webp',
    rarity: 'common',            // common / rare / epic（收藏卡框顏色用）
    desc: '香噴噴的海苔飯糰戰士，臨危不亂，總能為自己多爭取一點思考的時間。',
    skill: {
      name: '從容一刻',
      icon: '⏱️',
      desc: '施放後，當前正在回答的題目 +10 秒作答時間。使用後需等下一輪計時題結束才能再次施放。',
      bonusSeconds: 10,
    },
  },
};

// 預設擁有的角色（之後可從商店/抽卡擴充）
const DEFAULT_OWNED_CHARS = ['onigiri'];

// localStorage keys
const LS_OWNED_CHARS    = 'voca_owned_chars';    // 已擁有角色 id 陣列
const LS_DEPLOYED_CHAR  = 'voca_deployed_char';  // 出戰中的角色 id
const LS_TETRIS_BEST    = 'voca_tetris_best';     // 本機最高分（未登入時的暫存）

function getOwnedChars() {
  try {
    const arr = JSON.parse(localStorage.getItem(LS_OWNED_CHARS) || 'null');
    if (Array.isArray(arr) && arr.length) return arr;
  } catch { /* 用預設 */ }
  return [...DEFAULT_OWNED_CHARS];
}

function getDeployedCharId() {
  const id = localStorage.getItem(LS_DEPLOYED_CHAR);
  if (id && TETRIS_CHARACTERS[id]) return id;
  return DEFAULT_OWNED_CHARS[0];   // 預設出戰第一隻
}

function getDeployedChar() {
  return TETRIS_CHARACTERS[getDeployedCharId()] || null;
}

function setDeployedChar(id) {
  if (!TETRIS_CHARACTERS[id]) return;
  localStorage.setItem(LS_DEPLOYED_CHAR, id);
}
