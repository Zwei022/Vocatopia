const express = require('express');
const router  = express.Router();
const path    = require('path');
const fs      = require('fs');
const { isPremiumUser } = require('../lib/subscription');

const DATA_DIR   = path.resolve(__dirname, '../data');

// 每日題數（依題型）：閱讀／克漏字較花時間 → 3 題；其餘 → 5 題
const DAILY_SIZE_BY_TYPE = {
  reading: 3,
  cloze:   3,
  vocab:   5,
  phrase:  5,
  grammar: 5,
  listening: 5,
};
const DEFAULT_DAILY_SIZE = 5;
const VALID_TYPES = new Set(Object.keys(DAILY_SIZE_BY_TYPE));

// vocab 每日練習題庫與競技場 PVP 備援題庫分開維護：
// question_bank_vocab.json 保留給 PVP 對戰備援使用，練習室改讀較大量、含進階難度的 practice 版本
const FILE_BY_TYPE = {
  vocab: 'question_bank_vocab_practice.json',
};

function seededShuffle(arr, seed) {
  let s = seed >>> 0;
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    s += 0x6D2B79F5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    const j = ((t ^ (t >>> 14)) >>> 0) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

router.get('/:type', async (req, res) => {
  const { type } = req.params;
  if (!VALID_TYPES.has(type)) return res.status(400).json({ error: `Unknown type: ${type}` });

  const filePath = path.join(DATA_DIR, FILE_BY_TYPE[type] || `question_bank_${type}.json`);
  if (!fs.existsSync(filePath)) return res.status(503).json({ error: `Question bank not ready: ${type}` });

  let bank;
  try { bank = JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return res.status(500).json({ error: 'Failed to read question bank' }); }

  const questions = Array.isArray(bank) ? bank : (bank.questions || []);
  if (!questions.length) return res.status(503).json({ error: 'Question bank is empty' });

  const premium = await isPremiumUser(req);
  // 無限題庫模式：付費解鎖，回傳整個（已洗牌）題庫、不截斷（見 #5）。
  // 每日測驗（預設）一律截成日配額，付費會員也一樣 → 進度永遠顯示 1/5，不洩漏題庫總數。
  const unlimited = req.query.unlimited === '1' && premium;
  // 無限題庫每次都要不同的隨機序，不用固定日期種子；每日測驗維持日期種子（同一天同一份）。
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const seed  = unlimited
    ? ((Math.random() * 0xffffffff) >>> 0)
    : parseInt(today) + type.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const dailySize = DAILY_SIZE_BY_TYPE[type] || DEFAULT_DAILY_SIZE;

  let daily;
  if (type === 'listening') {
    // 聽力保證三部分均有出現：辨識句意×1、基本問答×2、言談理解×2（無限題庫模式各部分題量加倍）
    const mult = unlimited ? 2 : 1;
    const bySection = {};
    for (const q of questions) {
      const s = q.section || 'other';
      if (!bySection[s]) bySection[s] = [];
      bySection[s].push(q);
    }
    const s1 = seededShuffle(bySection['辨識句意'] || [], seed).slice(0, 1 * mult);
    const s2 = seededShuffle(bySection['基本問答'] || [], seed + 1).slice(0, 2 * mult);
    const s3 = seededShuffle(bySection['言談理解'] || [], seed + 2).slice(0, 2 * mult);
    daily = seededShuffle([...s1, ...s2, ...s3], seed + 3);
  } else if (unlimited) {
    // 無限題庫：不截斷，整個題庫（已洗牌）都可以練習
    daily = seededShuffle(questions, seed);
  } else {
    daily = seededShuffle(questions, seed).slice(0, dailySize);
  }

  res.json({ type, date: new Date().toISOString().split('T')[0], questions: daily, premium, unlimited });
});

module.exports = router;
