// 建立單一外部測試帳號：品昇補習班 林老師
// 角色全開、金幣 1,000,000、premium 全內容解鎖（含模擬試題、文法教學）
// 用法：node scripts/create_teacher_test_account.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const ALL_CHARS = ['onigiri', 'waffle', 'canele', 'sushi', 'lobster'];
const EMAIL = 'linlaoshi.pinsheng@vocatopia.test';
const USERNAME = '品昇補習班 林老師';
const PASSWORD = 'Test1234!';
const OUT_FILE = path.join(__dirname, '..', 'teacher_test_account.json');

async function findExistingUserId(email) {
  let page = 1;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`列出 users 失敗: ${error.message}`);
    const hit = data.users.find((u) => u.email === email);
    if (hit) return hit.id;
    if (data.users.length < 200) return null;
    page += 1;
  }
}

(async () => {
  let userId = await findExistingUserId(EMAIL);
  if (!userId) {
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { username: USERNAME },
    });
    if (createErr) throw new Error(`建立 auth user 失敗: ${createErr.message}`);
    userId = created.user.id;
  }

  // DB trigger 會在 auth.users 建立時自動插入一筆 profiles（含 friend_code），用 upsert 避免 pkey 衝突
  const { error: profileErr } = await supabase.from('profiles').upsert({
    id: userId,
    username: USERNAME,
    gold: 1000000,
    initialized: true,
    owned_chars: ALL_CHARS,
    deployed_char: 'onigiri',
  });
  if (profileErr) throw new Error(`寫入 profiles 失敗: ${profileErr.message}`);

  const { error: subErr } = await supabase.from('subscriptions').upsert({
    user_id: userId,
    is_premium: true,
    expires_at: '2099-12-31T00:00:00Z',
  });
  if (subErr) throw new Error(`寫入 subscriptions 失敗: ${subErr.message}`);

  const account = { email: EMAIL, password: PASSWORD, username: USERNAME, user_id: userId };
  fs.writeFileSync(
    OUT_FILE,
    JSON.stringify(
      {
        created_at: new Date().toISOString(),
        state: '角色全開（owned_chars 全部 5 種）、金幣 1,000,000、subscriptions.is_premium=true（模擬試題/文法教學等全內容解鎖至 2099-12-31）',
        account,
      },
      null,
      2
    )
  );
  console.log(`✓ ${EMAIL} 建立完成 (${userId})`);
  console.log(`已寫入 ${OUT_FILE}`);
})().catch((err) => {
  console.error('失敗:', err.message);
  process.exit(1);
});
