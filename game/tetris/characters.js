// ════════════════════════════════
// 角色資料模組（俄羅斯方塊出戰角色）
// 純資料定義，供首頁角色欄、收藏頁、遊戲技能三處共用。
// 需在 script.js 之前載入，讓首頁渲染時就能讀到。
// ════════════════════════════════

const TETRIS_CHARACTERS = {
  onigiri: {
    id: 'onigiri',
    name: '海苔飯糰',
    nameEn: 'rice ball',
    img: 'public/images/characters/onigiri.webp',
    cardImg: 'public/images/characters/onigiri.webp', // TODO: 換成新版動漫萌少女擬人卡面圖（試畫中）
    rarity: 'common',            // common / rare / epic / mythic / legendary（收藏卡框顏色用）
    acquireHint: '帳號預設擁有',
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
    name: '楓糖鬆餅',
    nameEn: 'waffle',
    img: 'public/images/characters/waffle.webp',
    cardImg: 'public/images/characters/waffle.webp', // TODO: 換成新版動漫萌少女擬人卡面圖
    rarity: 'rare',
    acquireHint: '完成一篇歷屆會考試題，正確率達 70% 以上即可解鎖',
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
    name: '蘭姆可麗露',
    nameEn: 'canelé',
    img: 'public/images/characters/canele.webp',
    cardImg: 'public/images/characters/canele.webp', // TODO: 換成新版動漫萌少女擬人卡面圖
    rarity: 'epic',
    acquireHint: '商店常駐卡池抽卡取得（三獎，機率 15%）',
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
    name: '鮭魚壽司',
    nameEn: 'sushi',
    img: 'public/images/characters/sushi.webp',
    cardImg: 'public/images/characters/sushi.webp', // TODO: 換成新版動漫萌少女擬人卡面圖
    rarity: 'mythic',
    acquireHint: '商店常駐卡池抽卡取得（二獎，機率 4%，50抽保底必中神話以上）',
    desc: '職人手捏的鮭魚握壽司，戴著櫻花毛帽，一身職人氣魄，出手就是一顆震撼彈。',
    skill: {
      type: 'bombPiece',
      name: '壽司炸彈',
      icon: '🍣',
      desc: '施放後，下一個方塊將變成壽司炸彈（單格特殊方塊），落地鎖定時炸開 3×3 範圍，範圍內方塊全部消除。使用後技能封印，需連續答對 2 題英文選擇題（60秒計時題）才能解除封印再次使用。',
      unsealStreak: 2,
    },
  },
  lobster: {
    id: 'lobster',
    name: '焗烤龍蝦',
    nameEn: 'lobster',
    img: 'public/images/characters/lobster.webp',
    cardImg: 'public/images/characters/lobster.webp', // TODO: 換成新版動漫萌少女擬人卡面圖
    rarity: 'legendary',
    acquireHint: '商店常駐卡池抽卡取得（特獎，機率 1%，100抽保底必中傳奇）',
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
  _syncCharsToServer();
}

// 新增一名擁有的角色（抽卡/商店用）。已擁有則回傳 false，不重複加入。
function addOwnedChar(id) {
  if (!TETRIS_CHARACTERS[id]) return false;
  const owned = getOwnedChars();
  if (owned.includes(id)) return false;
  owned.push(id);
  localStorage.setItem(LS_OWNED_CHARS, JSON.stringify(owned));
  _syncCharsToServer();
  return true;
}

// 角色收藏（owned_chars/deployed_char）跨裝置同步：本機是即時真相來源
// （抽卡當下先落地 localStorage，體驗不卡網路），這裡是背景把最新結果
// 補寫回 Supabase profiles，不管成功與否都不影響已經完成的抽卡結果，
// 純粹是「盡量同步」，失敗就算了（下次任何一次 addOwnedChar/setDeployedChar
// 呼叫都會再試一次）。currentUser/authClient 由 auth.js 提供，角色模組
// 本身不依賴登入狀態即可運作（訪客模式純本機）。
function _syncCharsToServer() {
  if (typeof currentUser === 'undefined' || !currentUser || typeof authClient === 'undefined') return;
  authClient
    .from('profiles')
    .update({ owned_chars: getOwnedChars(), deployed_char: getDeployedCharId() })
    .eq('id', currentUser.id)
    .then(({ error }) => { if (error) console.warn('[_syncCharsToServer] 同步失敗：', error.message); });
}

// 登入時從伺服器還原角色收藏：跟本機收藏取聯集（本機可能有伺服器還
// 沒同步到的最新抽卡結果，伺服器可能有其他裝置抽到但這台還沒有的角色），
// 合併後寫回本機，並且如果合併後有新增內容就補寫回伺服器，確保下次在
// 任何裝置登入都能看到完整收藏。由 auth.js 的 _loadProfile() 呼叫。
function restoreOwnedCharsFromServer(serverOwned, serverDeployed) {
  const local = getOwnedChars();
  const merged = Array.from(new Set([...local, ...(Array.isArray(serverOwned) ? serverOwned : [])]));
  const changed = merged.length !== local.length;
  if (changed) localStorage.setItem(LS_OWNED_CHARS, JSON.stringify(merged));

  // 出戰角色：伺服器有紀錄且合法就採用伺服器那份（代表使用者在其他裝置切換過）；
  // 否則維持本機目前設定。
  if (serverDeployed && TETRIS_CHARACTERS[serverDeployed]) {
    localStorage.setItem(LS_DEPLOYED_CHAR, serverDeployed);
  }

  if (changed || !serverDeployed) _syncCharsToServer();
}

// ════════════════════════════════
// 頭像（個人資料／競技場識別用）
// 頭像素材與解鎖狀態直接沿用上面的角色收藏（owned_chars），不另開一套獨立經濟。
// 「目前選哪隻角色當頭像」跟「俄羅斯方塊出戰角色」是兩件事，各自獨立存放。
// ════════════════════════════════
const LS_AVATAR_ID = 'voca_avatar_id';

// 回傳目前選定的頭像角色 id；未選過、或選到的角色已不在擁有清單內（理論上不會發生，
// 保險起見還是檢查）時回傳 null，由呼叫端自行 fallback 成預設圖示。
function getAvatarId() {
  const id = localStorage.getItem(LS_AVATAR_ID);
  if (id && TETRIS_CHARACTERS[id] && getOwnedChars().includes(id)) return id;
  return null;
}
function avatarImgOf(id) {
  return (id && TETRIS_CHARACTERS[id]) ? TETRIS_CHARACTERS[id].img : null;
}
// 設定頭像：只能選已擁有的角色，回傳是否設定成功
function setAvatarId(id) {
  if (!TETRIS_CHARACTERS[id] || !getOwnedChars().includes(id)) return false;
  localStorage.setItem(LS_AVATAR_ID, id);
  _syncAvatarToServer();
  return true;
}
function _syncAvatarToServer() {
  if (typeof currentUser === 'undefined' || !currentUser || typeof authClient === 'undefined') return;
  authClient
    .from('profiles')
    .update({ avatar_id: getAvatarId() })
    .eq('id', currentUser.id)
    .then(({ error }) => { if (error) console.warn('[_syncAvatarToServer] 同步失敗：', error.message); });
}
// 登入時從伺服器還原頭像選擇：伺服器有紀錄且該角色仍在（合併後的）擁有清單內就採用，
// 由 auth.js 的 _loadProfile() 呼叫（跟 restoreOwnedCharsFromServer 同一批一起呼叫）。
function restoreAvatarFromServer(serverAvatarId) {
  if (serverAvatarId && TETRIS_CHARACTERS[serverAvatarId] && getOwnedChars().includes(serverAvatarId)) {
    localStorage.setItem(LS_AVATAR_ID, serverAvatarId);
  }
}
