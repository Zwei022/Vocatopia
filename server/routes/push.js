const express  = require('express');
const router   = express.Router();
const supabase = require('../db/supabase');
const { getUserId } = require('../lib/auth');
const { sendPushToUsers } = require('../lib/push');

// POST /api/push/register — App 啟動且已登入時呼叫，把這台裝置的 FCM token 記錄下來
router.post('/push/register', express.json(), async (req, res) => {
  const userId = await getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { token, platform } = req.body || {};
  if (!token || !['android', 'ios'].includes(platform)) {
    return res.status(400).json({ error: 'Invalid token/platform' });
  }

  const { error } = await supabase
    .from('push_tokens')
    .upsert(
      { user_id: userId, token, platform, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,token' }
    );
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// POST /api/push/test — 開發驗證用：登入狀態下呼叫，發一則測試通知給自己
// 目前這台（以及這個帳號註冊過的所有其他裝置）的 token。
router.post('/push/test', express.json(), async (req, res) => {
  const userId = await getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const result = await sendPushToUsers(supabase, [userId], {
    title: 'Vocatopia 測試通知',
    body: '推播設定成功！收到這則代表一切正常運作 🎉',
  });
  res.json(result);
});

module.exports = router;
