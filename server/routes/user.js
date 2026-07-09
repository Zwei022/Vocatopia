const express  = require('express');
const router   = express.Router();
const supabase = require('../db/supabase');
const { getUserId } = require('../lib/auth');

// POST /api/user/init
// 冪等式初始化：首次登入時設定預設值；重複呼叫安全
router.post('/init', async (req, res) => {
  const userId = await getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { data: profile, error: fetchErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (fetchErr || !profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  if (profile.initialized) {
    return res.json({ profile, already_initialized: true });
  }

  const { data: updated, error: updateErr } = await supabase
    .from('profiles')
    .update({ gold: 0, str_stat: 5, int_stat: 5, fai_stat: 5, initialized: true })
    .eq('id', userId)
    .select()
    .single();

  if (updateErr) return res.status(500).json({ error: updateErr.message });

  res.json({ profile: updated, already_initialized: false });
});

module.exports = router;
