-- 題庫消耗量追蹤：記錄每次每日練習（含付費會員的「無限題庫」模式）實際被抽走幾題，
-- 之後才有真實數據判斷哪個分類的題庫先被刷完、要優先擴充。
-- 只給後端（service role）寫入/查詢，一般使用者不能直接存取這張表。

create table if not exists question_bank_usage (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  type text not null,             -- reading / cloze / vocab / phrase / grammar / listening
  mode text not null,             -- 'daily'（每日固定配額）或 'unlimited'（付費無限題庫）
  question_count int not null,    -- 這次請求實際回傳幾題
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_qbu_type_created on question_bank_usage(type, created_at);
create index if not exists idx_qbu_user on question_bank_usage(user_id);

alter table question_bank_usage enable row level security;

drop policy if exists "no client access" on question_bank_usage;
create policy "no client access" on question_bank_usage for all using (false);
