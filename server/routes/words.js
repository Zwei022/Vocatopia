const express  = require('express');
const router   = express.Router();
const supabase = require('../db/supabase');

// GET /api/words?limit=20&offset=0&tag=cap_2000
router.get('/', async (req, res) => {
  const limit  = Math.min(parseInt(req.query.limit)  || 20, 2000);
  const offset = parseInt(req.query.offset) || 0;
  const tag    = req.query.tag;

  let query = supabase
    .from('words')
    .select('id, word, pos, definition, definition_zh, phonetic, example_en, example_zh, tags, level, frequency_rank')
    .order('word', { ascending: true })
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

// DELETE /api/words/delete/:word
// 刪除指定單字（by word text）
router.delete('/delete/:word', async (req, res) => {
  const word = req.params.word;

  const { error } = await supabase
    .from('words')
    .delete()
    .eq('word', word);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, deleted_word: word });
});

// POST /api/words/restore
// 恢復被刪除的單字（插入新紀錄）
router.post('/restore', async (req, res) => {
  const wordData = req.body;

  if (!wordData.word) {
    return res.status(400).json({ error: 'word field is required' });
  }

  const { data, error } = await supabase
    .from('words')
    .insert([wordData])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, restored_word: wordData.word, data });
});

module.exports = router;
