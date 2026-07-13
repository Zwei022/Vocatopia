const express  = require('express');
const router   = express.Router();
const supabase = require('../db/supabase');
const { getUserId } = require('../lib/auth');

// POST /api/feedback
router.post('/feedback', express.json(), async (req, res) => {
  const userId = await getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const message = (req.body?.message || '').trim();
  if (!message) return res.status(400).json({ error: '請輸入意見內容' });
  if (message.length > 2000) return res.status(400).json({ error: '內容過長（上限 2000 字）' });

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .maybeSingle();

  const { error } = await supabase
    .from('feedback')
    .insert({ user_id: userId, username: profile?.username || null, message });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

module.exports = router;
