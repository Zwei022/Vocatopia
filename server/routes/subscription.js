const express  = require('express');
const router   = express.Router();
const supabase = require('../db/supabase');
const { getUserId } = require('../lib/auth');

// RevenueCat 事件類型對應到「目前是否為付費會員」
// 參考：https://www.revenuecat.com/docs/webhooks/event-types-and-fields
const GRANTS_PREMIUM = new Set([
  'INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION', 'PRODUCT_CHANGE', 'TRANSFER',
]);
const REVOKES_PREMIUM = new Set(['EXPIRATION']);
// CANCELLATION 只是關閉自動續訂，訂閱到期前仍應保有權限，故不在此立即撤銷

// GET /api/user/subscription-status
router.get('/user/subscription-status', async (req, res) => {
  const userId = await getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { data, error } = await supabase
    .from('subscriptions')
    .select('is_premium, expires_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.json({ is_premium: false, expires_at: null });

  // expires_at 過了才算真的失效（保留 EXPIRATION webhook 尚未送達前的緩衝）
  const stillValid = data.expires_at ? new Date(data.expires_at) > new Date() : data.is_premium;
  res.json({ is_premium: data.is_premium && stillValid, expires_at: data.expires_at });
});

// 註：原本這裡有一組「測試用兌換碼」可以繞過 App Store 付費訂閱、或免費發放金幣，
// 純粹是內部 QA 測試用的後門，從未打算給一般使用者用。已依 Apple App Review 回饋
// （Guideline 3.1.1 — 不得用 App Store 以外的機制解鎖付費數位功能）整組移除。
// 之後若需要內部測試付費會員/金幣，請直接在 Supabase 後台操作對應資料表，
// 不要再透過 App 內任何機制解鎖。

// POST /api/webhooks/revenuecat
// RevenueCat 在 Dashboard 設定 webhook 時可以帶一組 Authorization Bearer token，
// 這裡用同一組密鑰驗證請求真的來自 RevenueCat，避免任何人偽造請求把自己設成付費會員。
router.post('/webhooks/revenuecat', express.json(), async (req, res) => {
  const authHeader = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!process.env.REVENUECAT_WEBHOOK_SECRET || authHeader !== process.env.REVENUECAT_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized webhook' });
  }

  const event = req.body?.event;
  if (!event || !event.app_user_id) {
    return res.status(400).json({ error: 'Malformed webhook payload' });
  }

  const userId = event.app_user_id; // App 端以 Supabase user id 當作 RevenueCat 的 app_user_id
  const expiresAt = event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null;

  let isPremium;
  if (GRANTS_PREMIUM.has(event.type)) isPremium = true;
  else if (REVOKES_PREMIUM.has(event.type)) isPremium = false;
  else return res.json({ ok: true, ignored: event.type }); // 其他事件類型（如 BILLING_ISSUE）先記錄、不改狀態

  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      is_premium: isPremium,
      expires_at: expiresAt,
      revenuecat_customer_id: event.original_app_user_id || event.app_user_id,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

module.exports = router;
