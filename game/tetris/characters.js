// ════════════════════════════════
// 角色資料模組（俄羅斯方塊出戰角色）
// 純資料定義，供首頁角色欄、收藏頁、遊戲技能三處共用。
// 需在 script.js 之前載入，讓首頁渲染時就能讀到。
// ════════════════════════════════

// 角色成長系統（美食風味露升級，設計中，逐角色確認後才補資料）：
// 收藏頁角色卡底下顯示星級（0★~5★），點開詳細頁看目前星級效果。0★＝未升級的
// 基礎狀態，對應 skill 物件本身的數值；growth[star-1] 描述「升到這顆星做了什麼」：
//   - overrides：直接調整現有 skill 欄位數值（引擎已支援，升級後真的會生效）
//   - passive：額外獲得的全域被動（目前引擎未支援被動系統，先存資料不生效，
//     只有直接改 skill 既有欄位的 overrides 才會真的在遊戲裡起作用）
// 風味露/金幣成本表全角色一致（金幣依稀有度倍率拉開），角色技能設計則逐隻
// 個別確認——只有確認定案的角色才會有 growth 欄位，其餘先維持只有 skill 基礎值。
const GROWTH_COST_DEW  = [6, 10, 16, 24, 36];        // 各星級所需風味露（1★~5★，全角色一致）
const GROWTH_COST_GOLD = [50, 80, 150, 250, 400];    // 各星級基礎金幣（乘稀有度倍率才是實際扣款）
const GROWTH_GOLD_MULT = { common: 1, rare: 1.5, epic: 2, mythic: 3, legendary: 5 };

// 查某角色升到 star（1~5）所需金幣（已套稀有度倍率，四捨五入到整數）
function charGrowthGoldCost(rarity, star) {
  const mult = GROWTH_GOLD_MULT[rarity] ?? 1;
  return Math.round(GROWTH_COST_GOLD[star - 1] * mult);
}

const TETRIS_CHARACTERS = {
  onigiri: {
    id: 'onigiri',
    name: '海苔飯糰',
    nameEn: 'rice ball',
    img: 'public/images/characters/onigiri.webp',
    cardImg: 'public/images/characters/onigiri.webp',
    deployImg: 'public/images/characters/deploy/onigiri.webp',
    avatarImg: 'public/images/avatars/onigiri.webp',
    rarity: 'common',            // common / rare / epic / mythic / legendary（收藏卡框顏色用）
    acquireHint: '帳號預設擁有',
    desc: '捏得紮實的海苔飯糰新兵，話不多，但每次都準時出現在你需要冷靜的那一刻。',
    skill: {
      type: 'bonusSeconds',
      name: '從容一刻',
      icon: '⏱️',
      desc: '只能用在英文選擇題：施放後，當前這題 +5 秒作答時間。使用後需等下一輪英文選擇題結束才能再次施放（3★後移除此限制）。',
      bonusSeconds: 5,
      cooldownRounds: 1,   // 0★基礎狀態：用後需冷卻一輪；3★之後 overrides 會把這個蓋成 0
    },
    growth: [
      { star: 1, desc: '+5秒 → +7秒', overrides: { bonusSeconds: 7 } },
      { star: 2, desc: '+7秒 → +10秒', overrides: { bonusSeconds: 10 } },
      { star: 3, desc: '拿掉冷卻限制，改成每一輪都能使用', overrides: { cooldownRounds: 0 } },
      { star: 4, desc: '+10秒 → +15秒', overrides: { bonusSeconds: 15 } },
      { star: 5, desc: '+15秒 → +20秒；額外獲得被動：每答對一題英文選擇題，俄羅斯方塊遊戲分數額外 +100', overrides: { bonusSeconds: 20 }, passive: { tetrisScorePerCorrect: 100 } },
    ],
  },
  dumpling: {
    id: 'dumpling',
    name: '韭菜水餃',
    nameEn: 'chive dumpling',
    img: 'public/images/characters/dumpling.webp',
    cardImg: 'public/images/characters/dumpling.webp',
    deployImg: 'public/images/characters/deploy/dumpling.webp',
    avatarImg: 'public/images/avatars/dumpling.webp',
    rarity: 'common',
    acquireHint: '帳號預設擁有',
    desc: '手工現包的水餃，皮薄餡多卻從不搶快，寧可多咬幾口，也要把每個單字嚼透。',
    // ⚠️ bonusSecondsWord 是全新技能類型：只能用在消行快問（單字選擇題，限時7秒），
    // 目前 quiz.js 的 ttShowQuiz() 只有 timed=true（計時題）才會顯示技能按鈕，
    // 消行快問完全沒有技能掛勾點，需要先擴充引擎才會真正在遊戲裡生效。
    skill: {
      type: 'bonusSecondsWord',
      name: '細嚼慢嚥',
      icon: '🥟',
      desc: '只能用在消行快問（單字選擇題）：施放後，當前這題 +2 秒作答時間。使用後需等下一輪消行快問結束才能再次施放（3★後有機率免冷卻）。',
      bonusSeconds: 2,
      cooldownRounds: 1,
    },
    growth: [
      { star: 1, desc: '+2秒 → +3秒', overrides: { bonusSeconds: 3 } },
      { star: 2, desc: '+3秒 → +4秒', overrides: { bonusSeconds: 4 } },
      { star: 3, desc: '追加效果：每次消行單字題答對，有 50% 機率讓技能直接免冷卻，下一題可再次施放' },
      { star: 4, desc: '+4秒 → +5秒', overrides: { bonusSeconds: 5 } },
      { star: 5, desc: '覺醒被動：施放後若這題答對，連勝加乘額外 +0.1（例如原本×1.2變成×1.3）' },
    ],
  },
  waffle: {
    id: 'waffle',
    name: '楓糖鬆餅',
    nameEn: 'waffle',
    img: 'public/images/characters/waffle.webp',
    cardImg: 'public/images/characters/waffle.webp',
    deployImg: 'public/images/characters/deploy/waffle.webp',
    avatarImg: 'public/images/avatars/waffle.webp',
    rarity: 'rare',
    acquireHint: '完成一篇歷屆會考試題，正確率達 70% 以上即可解鎖',
    desc: '格紋鬆餅裹著融化奶油，個性像它的糖漿一樣黏人，答錯了也會軟軟地接住你。',
    skill: {
      type: 'comboShield',
      name: '暖心護盾',
      icon: '🧇',
      desc: '被動技能：消行單字題答錯時自動觸發，抵擋這次連勝中斷（連勝倍率不會被重置）。每局限用 1 次。',
      usesPerGame: 1,
      offsetPenalty: false, // 0★：觸發時原本要扣的分數照扣；1★之後才連帶抵銷
    },
    growth: [
      { star: 1, desc: '觸發時連帶抵銷這題原本要扣的 -30 分', overrides: { offsetPenalty: true } },
      { star: 2, desc: '每局可用次數 1 → 2 次', overrides: { usesPerGame: 2 } },
      { star: 3, desc: '質變：觸發時連勝額外 +1（視同答對）' },
      { star: 4, desc: '每局可用次數 2 → 3 次', overrides: { usesPerGame: 3 } },
      { star: 5, desc: '覺醒被動：每答對 5 題自動恢復 1 次使用次數', passive: { recoverEvery: 5 } },
    ],
  },
  canele: {
    id: 'canele',
    name: '蘭姆可麗露',
    nameEn: 'canelé',
    img: 'public/images/characters/canele.webp',
    cardImg: 'public/images/characters/canele.webp',
    deployImg: 'public/images/characters/deploy/canele.webp',
    avatarImg: 'public/images/avatars/canele.webp',
    rarity: 'epic',
    acquireHint: '商店常駐卡池抽卡取得（三獎，機率 15%）',
    desc: '外皮焦脆、內裡濕潤的法式甜點貴族，做事前總愛先在心裡排好接下來三步棋。',
    skill: {
      type: 'choosePiece',
      name: '焦糖布局',
      icon: '🍮',
      desc: '施放後可從方塊表格中點選，指定下一個出現的方塊。使用後技能封印，需連續答對 2 題英文選擇題（60秒計時題）才能解除封印再次使用。',
      unsealStreak: 2,
      previewCount: 1, // 0★：一次只能指定下一顆
    },
    growth: [
      { star: 1, desc: '解封門檻 2 → 1 題', overrides: { unsealStreak: 1 } },
      { star: 2, desc: '施放時同時指定「下一顆＋下下一顆」兩個方塊', overrides: { previewCount: 2 } },
      { star: 3, desc: '質變：封印期間也能看到接下來 2 顆方塊預覽（不用等解封）' },
      { star: 4, desc: '解封後可連續指定兩次才會重新封印', overrides: { consecutiveUses: 2 } },
      { star: 5, desc: '覺醒被動：封印中每答對一題有 25% 機率提前解封', passive: { earlyUnsealChance: 0.25 } },
    ],
  },
  sushi: {
    id: 'sushi',
    name: '鮭魚壽司',
    nameEn: 'sushi',
    img: 'public/images/characters/sushi.webp',
    cardImg: 'public/images/characters/sushi.webp',
    deployImg: 'public/images/characters/deploy/sushi.webp',
    avatarImg: 'public/images/avatars/sushi.webp',
    rarity: 'mythic',
    acquireHint: '商店常駐卡池抽卡取得（二獎，機率 4%，50抽保底必中神話以上）',
    desc: '職人現捏的鮭魚握壽司，出手俐落像刀工一樣精準，一次出招就是滿場喝采。',
    skill: {
      type: 'bombPiece',
      name: '壽司炸彈',
      icon: '🍣',
      desc: '施放後，下一個方塊將變成壽司炸彈（單格特殊方塊），落地鎖定時炸開 3×3 範圍，範圍內方塊全部消除。使用後技能封印，需連續答對 2 題英文選擇題（60秒計時題）才能解除封印再次使用。',
      unsealStreak: 2,
      fixedScore: 400,
    },
    growth: [
      { star: 1, desc: '解封門檻 2 → 1 題', overrides: { unsealStreak: 1 } },
      { star: 2, desc: '固定分數 400 → 550', overrides: { fixedScore: 550 } },
      { star: 3, desc: '質變：炸彈落地時，額外讓消行單字題連勝 +1', passive: { streakBonusOnTrigger: 1 } },
      { star: 4, desc: '固定分數 550 → 700', overrides: { fixedScore: 700 } },
      { star: 5, desc: '覺醒被動：每局第一次施放時，爆炸範圍自動擴大一階（3×3 → 5×5）', passive: { firstCastRadiusBoost: true } },
    ],
  },
  lobster: {
    id: 'lobster',
    name: '焗烤龍蝦',
    nameEn: 'lobster',
    img: 'public/images/characters/lobster.webp',
    cardImg: 'public/images/characters/lobster.webp',
    deployImg: 'public/images/characters/deploy/lobster.webp',
    rarity: 'legendary',
    acquireHint: '首次訂閱贈送（限定角色，不進任何卡池）',
    desc: '宴席桌上的焗烤主角，龍蝦鉗一開一合，什麼樣的殘局到牠手上都能重新收拾。',
    skill: {
      type: 'clearBottom',
      name: '王者清盤',
      icon: '🦞',
      desc: '施放後直接清空棋盤最底 2 行，無論該行是否已被鎖住（含懲罰的灰色行）。使用後技能封印，需連續答對 3 題英文選擇題（60秒計時題）才能解除封印再次使用。',
      unsealStreak: 3,
      clearRows: 2, // _ttCastClearBottom() 已改讀這個欄位，4★升級後真的會清 3 行
    },
    growth: [
      { star: 1, desc: '解封門檻 3 → 2 題', overrides: { unsealStreak: 2 } },
      { star: 2, desc: '解封門檻 2 → 1 題', overrides: { unsealStreak: 1 } },
      { star: 3, desc: '質變：清空時額外讓連勝 +2', passive: { streakBonusOnTrigger: 2 } },
      { star: 4, desc: '清空行數 2 → 3 行（引擎目前寫死 2 行，需擴充才會生效）', overrides: { clearRows: 3 } },
      { star: 5, desc: '覺醒被動：每局開局自動附贈 1 次免費施放機會（不消耗封印狀態）', passive: { freeFirstCast: true } },
    ],
  },
  uni: {
    id: 'uni',
    name: '海膽軍艦',
    nameEn: 'uni gunkan',
    img: 'public/images/characters/uni.webp',
    cardImg: 'public/images/characters/uni.webp',
    deployImg: 'public/images/characters/deploy/uni.webp',
    avatarImg: 'public/images/avatars/uni.webp',
    rarity: 'mythic',
    acquireHint: '商店限時卡池抽卡取得（二獎，機率 4%，50抽保底必中神話以上）',
    desc: '產季限定的頂級海膽，賣相嬌貴、脾氣卻很穩，總在你快撐不住的瞬間悄悄補位。',
    skill: {
      type: 'autoShield',
      name: '軍艦護盾',
      icon: '🍱',
      desc: '被動技能：堆疊快觸頂時自動觸發，清空最底 3 行並直接獲得 300 分，每局限用 2 次，無需封印。',
      clearRows: 3,
      usesPerGame: 2,
      triggerScore: 300, // 測試回饋比壽司的主動技能弱很多，追加觸發即得分，並把base次數1→2次
      triggerMarginRows: 0, // 0★：堆疊到頂端才觸發；4★之後提前到距頂 3 行就觸發
    },
    growth: [
      { star: 1, desc: '清空行數 3 → 4 行', overrides: { clearRows: 4 } },
      { star: 2, desc: '每局可觸發次數 2 → 3 次', overrides: { usesPerGame: 3 } },
      { star: 3, desc: '質變：觸發時額外讓連勝 +2', passive: { streakBonusOnTrigger: 2 } },
      { star: 4, desc: '觸發判定提前：board 堆疊到距離頂端還剩 3 行就會觸發，容錯空間更大', overrides: { triggerMarginRows: 3 } },
      { star: 5, desc: '覺醒被動：觸發後，本局剩餘時間分數獲取額外 +10%', passive: { postTriggerScoreBonusPct: 10 } },
    ],
  },
  bluefin: {
    id: 'bluefin',
    name: '黑鮪魚刺身',
    nameEn: 'bluefin tuna sashimi',
    img: 'public/images/characters/bluefin.webp',
    cardImg: 'public/images/characters/bluefin.webp',
    deployImg: 'public/images/characters/deploy/bluefin.webp',
    avatarImg: 'public/images/avatars/bluefin.webp',
    rarity: 'legendary',
    acquireHint: '商店限時卡池抽卡取得（特獎，機率 1%，100抽保底必中傳奇）',
    desc: '師傅一刀落下才切得出的大腹肉切片，油脂布滿紋理，出招時整條直線都會讓開。',
    // 2026-08-06 Notion 定案：技術上比照壽司炸彈的封印/解封架構，engine.js 需仿
    // markNextAsBomb/explodeBomb 新增 markNextAsColumnClear/explodeColumns（尚未寫入 code）。
    skill: {
      type: 'columnClearPiece',
      name: '鮪魚魚雷',
      icon: '🐟',
      desc: '施放後，下一個方塊變成鮪魚魚雷（沿用引擎既有雙格骨牌形狀，橫置兩格）。落地鎖定時，清空該方塊所在的兩個直排（整欄由上到下全清，不影響其他欄位）。使用後技能封印，需連續答對 3 題英文選擇題（30秒計時題）解除封印。',
      unsealStreak: 3,
      columns: 2, // 0★：清兩欄；4★之後擴大為三欄（形狀改三格橫條 I3）
      bonusScore: 0, // 0★：無額外固定分；3★之後 overrides 蓋成 300
    },
    growth: [
      { star: 1, desc: '解封門檻 3 → 2 題', overrides: { unsealStreak: 2 } },
      { star: 2, desc: '解封門檻 2 → 1 題', overrides: { unsealStreak: 1 } },
      { star: 3, desc: '質變：清空兩直排時，固定額外 +300 分', overrides: { bonusScore: 300 } },
      { star: 4, desc: '清除範圍從兩欄擴大為三欄（形狀由雙格骨牌升級成三格橫條）', overrides: { columns: 3 } },
      { star: 5, desc: '覺醒被動：每局開局自動附贈 1 次免費施放機會（不消耗封印狀態）', passive: { freeFirstCast: true } },
    ],
  },
  mochi: {
    id: 'mochi',
    name: '花生麻糬',
    nameEn: 'peanut mochi',
    img: 'public/images/characters/mochi.webp',
    cardImg: 'public/images/characters/mochi.webp',
    deployImg: 'public/images/characters/deploy/mochi.webp',
    avatarImg: 'public/images/avatars/mochi.webp',
    rarity: 'rare',
    acquireHint: '競技場獲勝 20 次解鎖',
    desc: '剛搗好的花生麻糬，外表軟綿綿，被壓扁了也能咻地彈回原本的圓潤模樣。',
    skill: {
      type: 'streakShield',
      name: 'Q彈護體',
      icon: '🍡',
      desc: '被動技能，全程生效：連續答對 5 題觸發一次「彈力反彈」，抵銷下一次即將發生的懲罰（灰色列生成或側牆鎖定），彈開後里程碑重新計算。',
      milestone: 5,
    },
    growth: [
      { star: 1, desc: '里程碑 5 題 → 4 題', overrides: { milestone: 4 } },
      { star: 2, desc: '里程碑 4 題 → 3 題', overrides: { milestone: 3 } },
      { star: 3, desc: '質變：觸發彈開時，額外獲得 +50 分' },
      { star: 4, desc: '里程碑 3 題 → 2 題', overrides: { milestone: 2 } },
      { star: 5, desc: '覺醒被動：觸發彈開時，有 20% 機率不消耗（里程碑不歸零，直接朝下一次累積）', passive: { noConsumeChance: 0.2 } },
    ],
  },
  millefeuille: {
    id: 'millefeuille',
    name: '奶油千層蛋糕',
    nameEn: 'cream mille-feuille',
    img: 'public/images/characters/millefeuille.webp',
    cardImg: 'public/images/characters/millefeuille.webp',
    deployImg: 'public/images/characters/deploy/millefeuille.webp',
    avatarImg: 'public/images/avatars/millefeuille.webp',
    rarity: 'epic',
    acquireHint: '商店常駐卡池抽卡取得（三獎，機率 15%）',
    desc: '一層酥皮疊一層卡士達的千層小姐，凡事講求鋪陳，蓄力愈久、關鍵一擊愈扎實。',
    skill: {
      type: 'chargeStack',
      name: '千層疊運',
      icon: '🍰',
      desc: '施放後進入蓄力狀態，之後每答對一題英文選擇題疊加 1 層（最高 5 層），答錯則疊層全歸零。玩家可隨時手動「開動」，依當下疊層數清空棋盤最底 N 行，但無法清除已被懲罰鎖住的格子（灰色列/側牆鎖定格）。每局限使用 2 次，觸發後蓄力歸零並封印，需連對 2 題才能重新開始蓄力。',
      maxStack: 5,
      usesPerGame: 2,
      unsealStreak: 2,
      failResetAll: true, // 0★：答錯疊層全歸零；2★之後改成只扣1層
    },
    growth: [
      { star: 1, desc: '疊層上限 5 → 6 層', overrides: { maxStack: 6 } },
      { star: 2, desc: '質變：答錯不再全歸零，改成只扣 1 層', overrides: { failResetAll: false } },
      { star: 3, desc: '質變：疊到滿層時自動額外 +300 分' },
      { star: 4, desc: '疊層上限 6 → 8 層', overrides: { maxStack: 8 } },
      { star: 5, desc: '覺醒被動：每局第一次觸發時，額外視為多疊 2 層計算', passive: { firstCastBonusStack: 2 } },
    ],
  },
  foiegras: {
    id: 'foiegras',
    name: '香煎鵝肝',
    nameEn: 'pan-seared foie gras',
    img: 'public/images/characters/foiegras.webp',
    cardImg: 'public/images/characters/foiegras.webp',
    deployImg: 'public/images/characters/deploy/foiegras.webp',
    avatarImg: 'public/images/avatars/foiegras.webp',
    rarity: 'legendary',
    acquireHint: '即將上線',
    desc: '整份菜單裡最壓軸的一道，煎到恰到好處的外酥內滑，出場自帶加成的氣場。',
    skill: {
      type: 'lineScoreBonus',
      name: '頂級饗宴',
      icon: '🥩',
      desc: '被動技能，全程生效，不需施放不需封印：每消一行（不論任何方式）額外 +5% 分數加成。',
      bonusPct: 5,
    },
    growth: [
      { star: 1, desc: '加成 +5% → +8%', overrides: { bonusPct: 8 } },
      { star: 2, desc: '加成 +8% → +12%', overrides: { bonusPct: 12 } },
      { star: 3, desc: '質變：連續兩次操作都有消行時，本次加成翻倍' },
      { star: 4, desc: '加成 +12% → +16%', overrides: { bonusPct: 16 } },
      { star: 5, desc: '覺醒被動：單局分數達成 20000 分後，之後本局所有分數獲取直接雙倍計算（取代百分比堆疊）', passive: { doubleAfterScore: 20000 } },
    ],
  },
  honore: {
    id: 'honore',
    name: '聖多諾黑',
    nameEn: 'saint-honoré',
    img: 'public/images/characters/honore.webp',
    cardImg: 'public/images/characters/honore.webp',
    deployImg: 'public/images/characters/deploy/honore.webp',
    rarity: 'legendary',
    acquireHint: '商店常駐卡池抽卡取得（特獎，機率 1%，100抽保底必中傳奇）',
    desc: '泡芙、焦糖與鮮奶油疊成的法式甜點之王，是烏托邦送給每位新朋友的見面禮，答錯了也不會讓你難堪太久。',
    skill: {
      type: 'streakSoftFail',
      name: '開幕獻禮',
      icon: '🎂',
      desc: '被動技能，全程生效，不需施放不需封印：消行單字題答錯時連勝倍率不直接歸零，改成打對折（÷2）。',
      penaltyScore: 30,       // 0★：答錯照舊扣 30 分；星級提升逐步降低
      streakRetainRatio: 0.5, // 0★：連勝打對折
    },
    growth: [
      { star: 1, desc: '答錯扣分 -30 → -20', overrides: { penaltyScore: 20 } },
      { star: 2, desc: '連勝對折 → 改為打七折（保留70%）', overrides: { streakRetainRatio: 0.7 } },
      { star: 3, desc: '質變：閱讀理解關卡答錯的側牆鎖定行數變成只鎖一半', passive: { sideLockRows: 3 } },
      { star: 4, desc: '答錯扣分 -20 → -10', overrides: { penaltyScore: 10 } },
      { star: 5, desc: '覺醒被動：連勝永遠不會因答錯而降低（完全免疫連勝損失，僅分數仍會扣）', passive: { streakImmune: true } },
    ],
  },
};

// 預設擁有的角色（之後可從商店/抽卡擴充）
const DEFAULT_OWNED_CHARS = ['onigiri', 'dumpling'];

// localStorage keys
const LS_OWNED_CHARS    = 'voca_owned_chars';    // 已擁有角色 id 陣列
const LS_DEPLOYED_CHAR  = 'voca_deployed_char';  // 出戰中的角色 id
const LS_TETRIS_BEST    = 'voca_tetris_best';     // 本機最高分（未登入時的暫存）
const LS_FLAVOR_DEW     = 'voca_flavor_dew';      // 美食風味露持有量（未登入時的暫存）

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

// 俄羅斯方塊對戰最高分跨裝置同步：voca_tetris_best 只是「訪客暫存 + 避免
// 每次要顯示都多打一次API的本機快取」，換裝置登入或清過瀏覽器資料時本機
// 會是空的或過時的舊值，害遊戲結束彈窗顯示錯的「最佳」分數、甚至誤判成
// 新紀錄。取本機與伺服器（tetris_scores.best_score）兩者較大值寫回本機。
// 由 auth.js 的 _loadProfile() 呼叫。
async function restoreTetrisBestFromServer() {
  if (typeof currentUser === 'undefined' || !currentUser || typeof authClient === 'undefined') return;
  try {
    const { data, error } = await authClient
      .from('tetris_scores')
      .select('best_score')
      .eq('user_id', currentUser.id)
      .maybeSingle();
    if (error) { console.warn('[restoreTetrisBestFromServer] 讀取失敗：', error.message); return; }
    const serverBest = data?.best_score || 0;
    let localBest = 0;
    try { localBest = parseInt(localStorage.getItem(LS_TETRIS_BEST) || '0', 10) || 0; } catch { /* ignore */ }
    if (serverBest > localBest) localStorage.setItem(LS_TETRIS_BEST, String(serverBest));
  } catch (err) {
    console.warn('[restoreTetrisBestFromServer] 例外：', err?.message || err);
  }
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
// 角色成長系統素材：美食風味露
// 抽卡「銘謝惠顧」80%機率掉落（見 gacha.js），用來升級角色（Lv.0→Lv.5）。
// 存取模式比照 script.js 的 getGold()/addGold()：登入時以 currentProfile 為準、
// 樂觀更新畫面後背景用原子 RPC 同步（避免多裝置同時操作互相覆蓋覆寫成整值）；
// 未登入（訪客模式）純本機 localStorage。角色升級本身（扣素材+加等級）的 RPC
// 留到角色頁面 UI 階段一起做，這裡只提供風味露的加減。
// ════════════════════════════════
function getFlavorDew() {
  if (typeof currentProfile !== 'undefined' && currentProfile) {
    return currentProfile.flavor_dew ?? 0;
  }
  return parseInt(localStorage.getItem(LS_FLAVOR_DEW) || '0');
}

function addFlavorDew(amount) {
  let next;
  if (typeof currentProfile !== 'undefined' && currentProfile) {
    next = (currentProfile.flavor_dew || 0) + amount;
    currentProfile.flavor_dew = next;
    _syncFlavorDewAtomic(amount);
  } else {
    next = parseInt(localStorage.getItem(LS_FLAVOR_DEW) || '0') + amount;
    localStorage.setItem(LS_FLAVOR_DEW, next);
  }
  return next;
}

let _dewSyncPending = 0;
let _dewSyncChain = Promise.resolve();
function _syncFlavorDewAtomic(delta) {
  _dewSyncPending++;
  _dewSyncChain = _dewSyncChain.then(() => _doDewRpc(delta));
  return _dewSyncChain;
}

async function _doDewRpc(delta) {
  if (typeof currentUser === 'undefined' || !currentUser || typeof authClient === 'undefined') { _dewSyncPending--; return; }
  try {
    const { data, error } = await authClient.rpc('increment_flavor_dew', { p_delta: delta });
    if (error) throw error;
    // 只有序列中最後一筆 RPC 回傳時才用權威值校正，避免連續操作時中間值互相覆蓋（比照 _doGoldRpc）
    if (typeof data === 'number' && currentProfile && _dewSyncPending <= 1) {
      currentProfile.flavor_dew = data;
    }
  } catch (e) {
    console.warn('[_doDewRpc] 風味露同步失敗：', e.message);
  } finally {
    _dewSyncPending--;
  }
}

// ════════════════════════════════
// 角色升星（花風味露+金幣把角色從 Lv.0 升到 Lv.5）
// 登入時走 upgrade_character RPC（見 supabase/migrations/character_upgrade_rpc.sql），
// 一次性驗證兩筆餘額並原子扣款+加星級，不能用 addFlavorDew/addGold 分開呼叫湊
// （那兩支各自 floor 在 0，餘額不夠時只會扣到 0 而不是拒絕，等於能少花錢升級）。
// 訪客模式純本機：升級前手動檢查餘額夠不夠，狀態存 LS_CHAR_LEVELS。
// ════════════════════════════════
const LS_CHAR_LEVELS = 'voca_char_levels';

function _loadLocalCharLevels() {
  try { return JSON.parse(localStorage.getItem(LS_CHAR_LEVELS) || '{}') || {}; }
  catch { return {}; }
}

// 目前星級（0~5）
function getCharStar(charId) {
  if (typeof currentProfile !== 'undefined' && currentProfile) {
    return currentProfile.char_levels?.[charId] ?? 0;
  }
  return _loadLocalCharLevels()[charId] ?? 0;
}

// 升到下一星所需風味露/金幣（角色已滿 5★ 時回傳 null）
function nextUpgradeCost(charId) {
  const ch = TETRIS_CHARACTERS[charId];
  if (!ch) return null;
  const star = getCharStar(charId);
  if (star >= 5) return null;
  const nextStar = star + 1;
  return {
    star: nextStar,
    dew: GROWTH_COST_DEW[nextStar - 1],
    gold: charGrowthGoldCost(ch.rarity, nextStar),
  };
}

// 執行升星。回傳 { ok:true, star } 或 { ok:false, reason }
async function upgradeCharacter(charId) {
  const cost = nextUpgradeCost(charId);
  if (!cost) return { ok: false, reason: '已達最高星級' };

  if (typeof currentUser !== 'undefined' && currentUser && typeof authClient !== 'undefined') {
    try {
      const { data, error } = await authClient.rpc('upgrade_character', {
        p_char_id: charId, p_dew_cost: cost.dew, p_gold_cost: cost.gold,
      });
      if (error) throw error;
      if (currentProfile) {
        currentProfile.char_levels = { ...(currentProfile.char_levels || {}), [charId]: data.star };
        currentProfile.flavor_dew = data.flavor_dew;
        currentProfile.gold = data.gold;
      }
      return { ok: true, star: data.star };
    } catch (e) {
      return { ok: false, reason: e.message?.includes('風味露') ? '美食風味露不足' : (e.message?.includes('金幣') ? '金幣不足' : '升級失敗，請稍後再試') };
    }
  }

  // 訪客模式：純本機扣款
  const dew = getFlavorDew();
  const gold = (typeof getGold === 'function') ? getGold() : 0;
  if (dew < cost.dew) return { ok: false, reason: '美食風味露不足' };
  if (gold < cost.gold) return { ok: false, reason: '金幣不足' };
  addFlavorDew(-cost.dew);
  if (typeof addGold === 'function') addGold(-cost.gold);
  const levels = _loadLocalCharLevels();
  levels[charId] = cost.star;
  localStorage.setItem(LS_CHAR_LEVELS, JSON.stringify(levels));
  return { ok: true, star: cost.star };
}

// 依目前星級套用 growth[] 的 overrides，回傳「實際生效」的技能物件（不改動原始資料）
function effectiveSkill(charId) {
  const ch = TETRIS_CHARACTERS[charId];
  if (!ch) return null;
  const star = getCharStar(charId);
  let skill = { ...ch.skill };
  (ch.growth || []).forEach(g => {
    if (g.star <= star && g.overrides) skill = { ...skill, ...g.overrides };
  });
  return skill;
}

// 依目前星級合併 growth[].passive 欄位（累加所有 <= 目前星級的 passive object），
// 用來讀「覺醒被動」（通常是5★）之類的額外效果。跟 effectiveSkill 是同一套資料來源，
// 差在 effectiveSkill 處理 overrides（改 skill 既有欄位），這個處理 passive（全新欄位）。
function activePassives(charId) {
  const ch = TETRIS_CHARACTERS[charId];
  if (!ch) return {};
  const star = getCharStar(charId);
  let out = {};
  (ch.growth || []).forEach(g => { if (g.star <= star && g.passive) out = { ...out, ...g.passive }; });
  return out;
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
  if (id && TETRIS_CHARACTERS[id]?.avatarImg && getOwnedChars().includes(id)) return id;
  return null;
}
function avatarImgOf(id) {
  return (id && TETRIS_CHARACTERS[id]) ? (TETRIS_CHARACTERS[id].avatarImg || null) : null;
}
// 設定頭像：只能選已擁有的角色，回傳是否設定成功
function setAvatarId(id) {
  if (!TETRIS_CHARACTERS[id]?.avatarImg || !getOwnedChars().includes(id)) return false;
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
  if (serverAvatarId && TETRIS_CHARACTERS[serverAvatarId]?.avatarImg && getOwnedChars().includes(serverAvatarId)) {
    localStorage.setItem(LS_AVATAR_ID, serverAvatarId);
  }
}
