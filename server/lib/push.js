// 推播通知（FCM）共用發送邏輯。所有觸發點（每日提醒 cron、好友邀請、
// 訂閱到期提醒…）都呼叫這裡的 sendPushToUsers()，不要各自重複寫
// firebase-admin 呼叫邏輯。
// 注意：firebase-admin v12+ 改用模組化 API，舊版 admin.credential.cert()／
// admin.messaging() 這種寫法在新版已經不存在了，要從對應子模組 import。
const { initializeApp, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');

let _app = null;
let _initTried = false;

function _getApp() {
  if (_app) return _app;
  if (_initTried) return null; // 已經試過失敗，不要每次呼叫都重新噴錯誤 log
  _initTried = true;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    console.warn('[push] 缺少 FIREBASE_SERVICE_ACCOUNT_JSON，推播功能停用');
    return null;
  }
  try {
    const serviceAccount = JSON.parse(raw);
    _app = initializeApp({ credential: cert(serviceAccount) });
    return _app;
  } catch (e) {
    console.error('[push] Firebase Admin 初始化失敗：', e.message);
    return null;
  }
}

// 對一批 user_id 發送同一則通知內容。查出這些使用者目前註冊的所有裝置
// token（一人可能多台裝置），一次發送；失效的 token（使用者解除安裝/
// 清資料）會自動從 push_tokens 清掉，避免之後一直對死 token 重複發送。
//
// supabase：呼叫端傳入 server/db/supabase.js 的 service role client
// userIds：user_id 陣列
// options：{ title, body, data? }
async function sendPushToUsers(supabase, userIds, { title, body, data } = {}) {
  const app = _getApp();
  if (!app) return { sent: 0, failed: 0, reason: 'not_configured' };
  if (!Array.isArray(userIds) || userIds.length === 0) return { sent: 0, failed: 0 };

  const { data: rows, error } = await supabase
    .from('push_tokens')
    .select('token')
    .in('user_id', userIds);
  if (error) { console.error('[push] 查詢 token 失敗：', error.message); return { sent: 0, failed: 0 }; }
  if (!rows || rows.length === 0) return { sent: 0, failed: 0 };

  const tokens = [...new Set(rows.map(r => r.token))];
  const resp = await getMessaging(app).sendEachForMulticast({
    notification: { title, body },
    data: Object.fromEntries(Object.entries(data || {}).map(([k, v]) => [k, String(v)])), // FCM data 值必須是字串
    tokens,
  });

  const deadTokens = [];
  resp.responses.forEach((r, i) => {
    const code = r.error?.code;
    if (!r.success && (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token')) {
      deadTokens.push(tokens[i]);
    }
  });
  if (deadTokens.length > 0) {
    await supabase.from('push_tokens').delete().in('token', deadTokens);
  }

  return { sent: resp.successCount, failed: resp.failureCount };
}

module.exports = { sendPushToUsers };
