-- 收件夾：系統補償 / 錯過的好友對戰邀請，讓使用者事後還能找得到、領得到
create table if not exists inbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,              -- 'system'（系統補償）｜'invite'（對戰邀請記錄）
  title text not null,
  message text,
  gold_reward integer not null default 0,
  meta jsonb,                      -- invite 類型會存 { code, fromUsername, mode }
  claimed boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists inbox_user_id_created_idx on inbox(user_id, created_at desc);

alter table inbox enable row level security;

-- 使用者只能看到/更新（標記已領取）自己的收件夾
create policy "inbox_select_own" on inbox for select using (auth.uid() = user_id);
create policy "inbox_update_own" on inbox for update using (auth.uid() = user_id);
-- 沒有開放 insert policy 給一般使用者：寫入只能透過伺服器（service role key）進行，
-- 避免有人自己塞假的補償訊息進收件夾。
