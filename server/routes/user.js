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

// DELETE /api/user/account
// App 內自助刪除帳號（符合 Apple Guideline 5.1.1(v) / Google Play 帳號刪除政策要求：
// 不得只靠寄 email 等客服處理，一般 App 必須提供 App 內立即自助刪除）。
// 刪除 auth.users 這筆會透過資料庫的 ON DELETE CASCADE 自動連帶刪除 profiles、
// custom_decks、user_word_status、subscriptions、friend_requests、tetris_scores、
// push_tokens、daily_article_progress 等所有關聯資料；feedback 資料表刻意設計成
// ON DELETE SET NULL（意見回饋內容本身保留供產品改善參考，只斷開跟帳號的關聯）。
router.delete('/account', async (req, res) => {
  const userId = await getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) {
    console.error('[DELETE /api/user/account] 刪除失敗:', error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json({ ok: true });
});

module.exports = router;
