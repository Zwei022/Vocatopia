// 一次性測試腳本：用 service key 查使用者 id 並塞一封測試系統郵件到 inbox。
// 用法：
//   node scripts/_test_inbox.js find <email>          → 印出該 email 的 user_id
//   node scripts/_test_inbox.js send <user_id> [gold] → 塞一封系統補償郵件（預設 500 金幣）
//   node scripts/_test_inbox.js list <user_id>        → 列出該使用者現有 inbox
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const [, , cmd, arg1, arg2] = process.argv;

(async () => {
  if (cmd === 'find') {
    // auth.users 需用 admin API 查
    const { data, error } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) return console.error('listUsers 失敗:', error.message);
    const u = data.users.find(x => (x.email || '').toLowerCase() === String(arg1).toLowerCase());
    if (!u) return console.log('查無此 email:', arg1);
    console.log('user_id =', u.id, '| email =', u.email);
  } else if (cmd === 'send') {
    const gold = parseInt(arg2 || '500', 10);
    const { data, error } = await sb.from('inbox').insert([{
      user_id: arg1,
      type: 'system',
      title: '🎁 測試系統補償',
      message: `這是一封測試郵件，領取後會得到 ${gold} 金幣（用來驗證收件夾領取流程）。`,
      gold_reward: gold,
      claimed: false,
    }]).select();
    if (error) return console.error('insert 失敗:', error.message);
    console.log('已塞入測試郵件:', JSON.stringify(data, null, 2));
  } else if (cmd === 'code') {
    // 用 8 位 friend_code（帳號ID）反查 profile 的 UUID
    const { data, error } = await sb.from('profiles')
      .select('id,username,friend_code,gold').eq('friend_code', String(arg1)).maybeSingle();
    if (error) return console.error('查詢失敗:', error.message);
    if (!data) return console.log('查無此帳號ID:', arg1);
    console.log(`user_id = ${data.id} | username = ${data.username} | friend_code = ${data.friend_code} | 目前金幣 = ${data.gold}`);
  } else if (cmd === 'list') {
    const { data, error } = await sb.from('inbox').select('*')
      .eq('user_id', arg1).order('created_at', { ascending: false }).limit(20);
    if (error) return console.error('查詢失敗:', error.message);
    console.log(`共 ${data.length} 封：`);
    data.forEach(r => console.log(`- [${r.claimed ? '已領' : '未領'}] ${r.type} | ${r.title} | 🪙${r.gold_reward || 0} | ${r.created_at}`));
  } else {
    console.log('用法: find <email> | send <user_id> [gold] | list <user_id>');
  }
})();
