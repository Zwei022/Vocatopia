// ════════════════════════════════
// 角色資料模組（俄羅斯方塊出戰角色）
// 純資料定義，供首頁角色欄、收藏頁、遊戲技能三處共用。
// 需在 script.js 之前載入，讓首頁渲染時就能讀到。
// ════════════════════════════════

const TETRIS_CHARACTERS = {
  onigiri: {
    id: 'onigiri',
    name: '飯糰',
    nameEn: 'rice ball',
    img: 'public/images/characters/onigiri.webp',
    rarity: 'common',            // common / rare / epic / mythic / legendary（收藏卡框顏色用）
    desc: '香噴噴的海苔飯糰戰士，臨危不亂，總能為自己多爭取一點思考的時間。',
    skill: {
      type: 'bonusSeconds',
      name: '從容一刻',
      icon: '⏱️',
      desc: '只能用在英文選擇題：施放後，當前這題 +10 秒作答時間。使用後需等下一輪英文選擇題結束才能再次施放。',
      bonusSeconds: 10,
    },
  },
  waffle: {
    id: 'waffle',
    name: '鬆餅',
    nameEn: 'waffle',
    img: 'public/images/characters/waffle.webp',
    rarity: 'rare',
    desc: '格紋外皮裹著滿滿奶油蜂蜜的暖心鬆餅，圍著格紋領巾，總能溫暖地陪你撐過一次失手。',
    skill: {
      type: 'comboShield',
      name: '暖心護盾',
      icon: '🧇',
      desc: '被動技能：消行單字題答錯時自動觸發，抵擋這次連勝中斷（連勝倍率不會被重置）。每局限用 1 次。',
    },
  },
  canele: {
    id: 'canele',
    name: '可麗露',
    nameEn: 'canelé',
    img: 'public/images/characters/canele.webp',
    rarity: 'epic',
    desc: '外酥內軟的貴族甜點，圍著針織圍巾、踩著毛襪，總能提前替下一步鋪好路。',
    skill: {
      type: 'choosePiece',
      name: '焦糖布局',
      icon: '🍮',
      desc: '施放後可從方塊表格中點選，指定下一個出現的方塊。使用後技能封印，需連續答對 2 題英文選擇題（60秒計時題）才能解除封印再次使用。',
      unsealStreak: 2,
    },
  },
  sushi: {
    id: 'sushi',
    name: '壽司',
    nameEn: 'sushi',
    img: 'public/images/characters/sushi.webp',
    rarity: 'mythic',
    desc: '職人手捏的鮪魚握壽司，戴著櫻花毛帽，一身職人氣魄，出手就是一顆震撼彈。',
    skill: {
      type: 'bombPiece',
      name: '壽司炸彈',
      icon: '🍣',
      desc: '施放後，下一個方塊將變成壽司炸彈（單格特殊方塊），落地鎖定時炸開 9×9 範圍，範圍內方塊全部消除。使用後技能封印，需連續答對 2 題英文選擇題（60秒計時題）才能解除封印再次使用。',
      unsealStreak: 2,
    },
  },
  lobster: {
    id: 'lobster',
    name: '龍蝦',
    nameEn: 'lobster',
    img: 'public/images/characters/lobster.webp',
    rarity: 'legendary',
    desc: '披著針織毛衣、圍著毛線圍巾的宴席王者，巨螯一舉，就能把整個底盤清空。',
    skill: {
      type: 'clearBottom',
      name: '王者清盤',
      icon: '🦞',
      desc: '施放後直接清空棋盤最底 2 行，無論該行是否已被鎖住（含懲罰的灰色行）。使用後技能封印，需連續答對 3 題英文選擇題（60秒計時題）才能解除封印再次使用。',
      unsealStreak: 3,
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

// 新增一名擁有的角色（抽卡/商店用）。已擁有則回傳 false，不重複加入。
function addOwnedChar(id) {
  if (!TETRIS_CHARACTERS[id]) return false;
  const owned = getOwnedChars();
  if (owned.includes(id)) return false;
  owned.push(id);
  localStorage.setItem(LS_OWNED_CHARS, JSON.stringify(owned));
  return true;
}
