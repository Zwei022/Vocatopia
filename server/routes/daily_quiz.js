const express = require('express');
const router  = express.Router();
const path    = require('path');
const fs      = require('fs');

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

router.get('/:type', (req, res) => {
  const { type } = req.params;
  if (!VALID_TYPES.has(type)) return res.status(400).json({ error: `Unknown type: ${type}` });

  const filePath = path.join(DATA_DIR, FILE_BY_TYPE[type] || `question_bank_${type}.json`);
  if (!fs.existsSync(filePath)) return res.status(503).json({ error: `Question bank not ready: ${type}` });

  let bank;
  try { bank = JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return res.status(500).json({ error: 'Failed to read question bank' }); }

  const questions = Array.isArray(bank) ? bank : (bank.questions || []);
  if (!questions.length) return res.status(503).json({ error: 'Question bank is empty' });

  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const seed  = parseInt(today) + type.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const dailySize = DAILY_SIZE_BY_TYPE[type] || DEFAULT_DAILY_SIZE;

  let daily;
  if (type === 'listening') {
    // 聽力保證三部分均有出現：辨識句意×1、基本問答×2、言談理解×2
    const bySection = {};
    for (const q of questions) {
      const s = q.section || 'other';
      if (!bySection[s]) bySection[s] = [];
      bySection[s].push(q);
    }
    const s1 = seededShuffle(bySection['辨識句意'] || [], seed).slice(0, 1);
    const s2 = seededShuffle(bySection['基本問答'] || [], seed + 1).slice(0, 2);
    const s3 = seededShuffle(bySection['言談理解'] || [], seed + 2).slice(0, 2);
    daily = seededShuffle([...s1, ...s2, ...s3], seed + 3);
  } else {
    daily = seededShuffle(questions, seed).slice(0, dailySize);
  }

  res.json({ type, date: new Date().toISOString().split('T')[0], questions: daily });
});

module.exports = router;
