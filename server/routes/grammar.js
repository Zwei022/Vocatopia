const express  = require('express');
const router   = express.Router();
const path     = require('path');
const fs       = require('fs');
const { isPremiumUser } = require('../lib/subscription');
const { getUserId } = require('../lib/auth');
const supabase = require('../db/supabase');
const { levelFromXp, unlockedGrammarSections } = require('../lib/xp');

const DATA_FILE = path.resolve(__dirname, '../data/grammar_lessons.json');

// GET /api/grammar-lessons
// #2 逐小節解鎖：依使用者等級（由 profiles.xp 反推）解鎖前 N 個小節（依章節順序累計）；
// 付費會員全解。未解鎖的小節只回標題（不含 teaching / 測驗題），並標記 locked:true。
// 章節層級也回一個 locked（該章所有小節都鎖住時為 true），方便前端顯示整章鎖頭。
router.get('/', async (req, res) => {
  if (!fs.existsSync(DATA_FILE)) return res.status(503).json({ error: 'Grammar data not ready' });

  let chapters;
  try { chapters = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return res.status(500).json({ error: 'Failed to read grammar data' }); }

  const premium = await isPremiumUser(req);

  // 依 xp 算解鎖節數（訪客/未登入 → 等級 0，只享免費節）
  let unlockedCount = unlockedGrammarSections(0);
  if (!premium) {
    const userId = await getUserId(req);
    if (userId) {
      const { data } = await supabase.from('profiles').select('xp').eq('id', userId).maybeSingle();
      unlockedCount = unlockedGrammarSections(levelFromXp(data?.xp || 0));
    }
  }

  // 依章節順序累計小節序號（1-based），決定每個小節是否解鎖
  let sectionIdx = 0;
  const result = {};
  for (const [key, ch] of Object.entries(chapters)) {
    const chapterId = ch.chapterId ?? Number(key);
    const subs = ch.subLessons || [];
    let anyUnlocked = false;

    const outSubs = subs.map(s => {
      sectionIdx += 1;
      const unlocked = premium || sectionIdx <= unlockedCount;
      if (unlocked) { anyUnlocked = true; return { ...s, locked: false, unlockLevel: Math.max(1, sectionIdx - 4) }; }
      // 未解鎖：只給標題 + 需要的等級（sectionIdx - 4 = 需要達到的等級）
      return { id: s.id, title: s.title, locked: true, unlockLevel: Math.max(1, sectionIdx - 4) };
    });

    result[key] = {
      chapterId,
      title: ch.title,
      page: ch.page,
      locked: !anyUnlocked,        // 整章都鎖住才算章鎖
      subLessons: outSubs,
    };
  }

  res.json(result);
});

module.exports = router;
