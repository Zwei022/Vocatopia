-- ============================================================
-- Vocatopia Migration — 訂閱功能（Apple/Google 官方訂閱 + RevenueCat）
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 訂閱狀態獨立成表，不放進 profiles：
-- profiles 目前允許使用者用 client SDK 直接 update 自己的資料列（見 schema.sql 的
-- "users can update own profile" policy），訂閱狀態若混在同一張表，使用者可以直接
-- 竄改自己的付費狀態。這張表只允許使用者「讀」，「寫」只能靠後端 service role key
-- （由 RevenueCat webhook 觸發），使用者端完全沒有 update/insert 權限。
create table if not exists subscriptions (
  user_id               uuid primary key references profiles(id) on delete cascade,
  is_premium            boolean not null default false,
  expires_at            timestamptz,
  revenuecat_customer_id text,
  updated_at            timestamptz not null default now()
);
alter table subscriptions enable row level security;

create policy "users can read own subscription"
  on subscriptions for select using (auth.uid() = user_id);
-- 刻意不建立 insert/update/delete policy：一般使用者（anon/authenticated role）
-- 完全無法寫入這張表，只有用 SUPABASE_SECRET_KEY 的後端 service role 能繞過 RLS 寫入。
