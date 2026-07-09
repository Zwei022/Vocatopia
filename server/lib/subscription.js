const supabase = require('../db/supabase');
const { getUserId } = require('./auth');

// 給任何路由使用：判斷這個 request 背後的使用者目前是否為有效付費會員
async function isPremiumUser(req) {
  const userId = await getUserId(req);
  if (!userId) return false;
  const { data } = await supabase
    .from('subscriptions')
    .select('is_premium, expires_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (!data) return false;
  const stillValid = data.expires_at ? new Date(data.expires_at) > new Date() : data.is_premium;
  return data.is_premium && stillValid;
}

module.exports = { isPremiumUser };
