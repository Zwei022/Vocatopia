const express  = require('express');
const router   = express.Router();
const path     = require('path');
const fs       = require('fs');
const { isPremiumUser } = require('../lib/subscription');

const DATA_FILE = path.resolve(__dirname, '../data/grammar_lessons.json');
const FREE_CHAPTER_MAX = 3; // 第 1-3 章免費試閱，第 4 章起需訂閱

// GET /api/grammar-lessons
// 第 1-3 章一律回傳完整內容；第 4 章起，非付費會員只拿到章節/小節標題（不含教學內容與測驗題），
// 並標記 locked:true，前端據此顯示鎖頭並導去訂閱頁。
router.get('/', async (req, res) => {
  if (!fs.existsSync(DATA_FILE)) return res.status(503).json({ error: 'Grammar data not ready' });

  let chapters;
  try { chapters = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return res.status(500).json({ error: 'Failed to read grammar data' }); }

  const premium = await isPremiumUser(req);

  const result = {};
  for (const [key, ch] of Object.entries(chapters)) {
    const chapterId = ch.chapterId ?? Number(key);
    const unlocked = chapterId <= FREE_CHAPTER_MAX || premium;

    if (unlocked) {
      result[key] = { ...ch, locked: false };
    } else {
      result[key] = {
        chapterId,
        title: ch.title,
        page: ch.page,
        locked: true,
        subLessons: (ch.subLessons || []).map(s => ({ id: s.id, title: s.title })),
      };
    }
  }

  res.json(result);
});

module.exports = router;
