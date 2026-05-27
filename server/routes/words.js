const express  = require('express');
const router   = express.Router();
const supabase = require('../db/supabase');

// GET /api/words?limit=20&offset=0&tag=cap_2000
router.get('/', async (req, res) => {
  const limit  = Math.min(parseInt(req.query.limit)  || 20, 100);
  const offset = parseInt(req.query.offset) || 0;
  const tag    = req.query.tag;

  let query = supabase
    .from('words')
    .select('id, word, pos, definition, phonetic, example_en, example_zh, tags, level, frequency_rank')
    .order('frequency_rank', { ascending: true })
    .range(offset, offset + limit - 1);

  if (tag) query = query.contains('tags', [tag]);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/words/count
router.get('/count', async (req, res) => {
  const { count, error } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ count });
});

module.exports = router;
