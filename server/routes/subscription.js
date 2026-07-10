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

// POST /api/user/redeem-code
// 測試用兌換碼，代碼只存在伺服器端，不會出現在前端程式碼裡，避免任何人打開瀏覽器
// 開發者工具看到。目前有兩組：
//  1. REDEEM_CODE          — 升級為付費會員（走 subscriptions 表，跟真實訂閱共用同一套
//                             權限判斷，差別只在 revenuecat_customer_id 標記為 redeem_code）
//  2. GOLD_REDEEM_CODE     — 測試用金幣，每次兌換 +10000 金幣、無兌換次數上限（方便測試
//                             商店抽卡等消耗金幣的功能，不需要真的刷練習賺金幣）
const REDEEM_CODE = 'Qaz515922$';
const GOLD_REDEEM_CODE = 'K123384027';
const GOLD_REDEEM_AMOUNT = 10000;

router.post('/user/redeem-code', express.json(), async (req, res) => {
  const userId = await getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const code = (req.body?.code || '').trim();

  if (code === REDEEM_CODE) {
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        is_premium: true,
        expires_at: null,
        revenuecat_customer_id: 'redeem_code',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true, type: 'subscription' });
  }

  if (code === GOLD_REDEEM_CODE) {
    const { data: profile, error: fetchErr } = await supabase
      .from('profiles')
      .select('gold')
      .eq('id', userId)
      .single();
    if (fetchErr || !profile) return res.status(404).json({ error: 'Profile not found' });

    const nextGold = (profile.gold || 0) + GOLD_REDEEM_AMOUNT;
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ gold: nextGold })
      .eq('id', userId);
    if (updateErr) return res.status(500).json({ error: updateErr.message });

    return res.json({ ok: true, type: 'gold', amount: GOLD_REDEEM_AMOUNT, gold: nextGold });
  }

  return res.status(400).json({ error: '兌換碼錯誤' });
});

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
