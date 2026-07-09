const express = require('express');
const router  = express.Router();
const path    = require('path');
const fs      = require('fs');
const { isPremiumUser } = require('../lib/subscription');

const DATA_DIR = path.resolve(__dirname, '../data');

// GET /api/mock-exam/:filename
// 模擬試題（非歷屆真題）需要訂閱才能取得完整內容，歷屆真題不受影響、維持原本的靜態檔案存取。
router.get('/:filename', async (req, res) => {
  const filename = req.params.filename;
  if (!/^[a-zA-Z0-9_.-]+\.json$/.test(filename)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  const premium = await isPremiumUser(req);
  if (!premium) return res.status(403).json({ error: 'locked' });

  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Failed to read exam data' });
  }
});

module.exports = router;
