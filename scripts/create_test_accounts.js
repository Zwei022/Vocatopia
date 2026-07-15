// 建立 10 組內部測試帳號：角色全開、內容全解鎖（premium）、金幣 1,000,000
// 用法：node scripts/create_test_accounts.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const ALL_CHARS = ['onigiri', 'waffle', 'canele', 'sushi', 'lobster'];
const PASSWORD = 'Test1234!';
const COUNT = 10;
const OUT_FILE = path.join(__dirname, '..', 'test_accounts.json');

async function findExistingUserId(email) {
  // admin.listUsers 不支援用 email 過濾查單筆，逐頁掃描到找到為止
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

async function createOne(index) {
  const email = `test${index}@vocatopia.test`;
  const username = `測試帳號${index}`;

  let userId = await findExistingUserId(email);
  if (!userId) {
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { username },
    });
    if (createErr) throw new Error(`建立 auth user 失敗 (${email}): ${createErr.message}`);
    userId = created.user.id;
  }

  // 注意：Supabase 有 DB trigger 會在 auth.users 建立時自動插入一筆 profiles（含 friend_code），
  // 所以這裡用 upsert 而非 insert，避免 pkey 衝突。
  const { error: profileErr } = await supabase.from('profiles').upsert({
    id: userId,
    username,
    gold: 1000000,
    initialized: true,
    owned_chars: ALL_CHARS,
    deployed_char: 'onigiri',
  });
  if (profileErr) throw new Error(`寫入 profiles 失敗 (${email}): ${profileErr.message}`);

  const { error: subErr } = await supabase.from('subscriptions').upsert({
    user_id: userId,
    is_premium: true,
    expires_at: '2099-12-31T00:00:00Z',
  });
  if (subErr) throw new Error(`寫入 subscriptions 失敗 (${email}): ${subErr.message}`);

  return { email, password: PASSWORD, username, user_id: userId };
}

(async () => {
  const results = [];
  for (let i = 1; i <= COUNT; i++) {
    const account = await createOne(i);
    results.push(account);
    console.log(`✓ ${account.email} 建立完成 (${account.user_id})`);
  }

  fs.writeFileSync(
    OUT_FILE,
    JSON.stringify(
      {
        created_at: new Date().toISOString(),
        password_note: '10 組帳號共用同一組密碼',
        password: PASSWORD,
        state: '角色全開（owned_chars 全部 5 種）、金幣 1,000,000、subscriptions.is_premium=true（全內容解鎖至 2099-12-31）',
        accounts: results,
      },
      null,
      2
    )
  );
  console.log(`\n已寫入 ${OUT_FILE}`);
})().catch((err) => {
  console.error('失敗:', err.message);
  process.exit(1);
});
