-- ============================================================
-- Vocatopia Migration — 推播通知 device token
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================
-- 一個使用者可能有多台裝置（手機+平板），所以是獨立表、一對多，不是像
-- daily_deck_state 那樣塞進 profiles 一欄。RLS 不開放任何 client 端讀寫，
-- 完全由後端 service role 存取（跟 subscriptions/feedback 同一套security posture）。

create table if not exists push_tokens (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  token      text not null,
  platform   text not null check (platform in ('android', 'ios')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, token)
);
alter table push_tokens enable row level security;
-- 刻意不建立任何 policy：一般使用者完全無法讀寫這張表，只能透過
-- POST /api/push/register 這支後端 API（用 service role）寫入。
