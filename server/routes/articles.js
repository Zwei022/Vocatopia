const express  = require('express');
const router   = express.Router();
const supabase = require('../db/supabase');

// GET /api/articles
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, emoji, tag, locked, year')
    .order('id', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/articles/:id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: 'Article not found' });
  if (data.locked) return res.status(403).json({ error: 'locked' });
  res.json(data);
});

module.exports = router;
