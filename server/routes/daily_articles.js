const express  = require('express');
const router   = express.Router();
const supabase = require('../db/supabase');

// GET /api/daily-articles?date=YYYY-MM-DD  （預設今天）
router.get('/', async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_articles')
    .select('id, date, slot, title, emoji, tag, topic, word_count, difficulty')
    .eq('date', date)
    .order('slot');

  if (error) return res.status(500).json({ error: error.message });
  res.json({ date, articles: data || [] });
});

// GET /api/daily-articles/:id  （含題目）
router.get('/:id', async (req, res) => {
  const { data: article, error } = await supabase
    .from('daily_articles')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: '找不到文章' });

  const { data: questions } = await supabase
    .from('article_questions')
    .select('id, sort_order, question, options, answer, explanation')
    .eq('article_id', req.params.id)
    .order('sort_order');

  res.json({ ...article, questions: questions || [] });
});

module.exports = router;
