-- ============================================================
-- Vocatopia Migration — 意見回饋
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 使用者只能新增（送出回饋），不能讀取/修改/刪除任何人的回饋（含自己的），
-- 避免有人把這張表當公開留言板來查看別人寫了什麼。匯出成 Excel 一律由
-- 後端 service role key（開發者本機執行匯出腳本）讀取。
create table if not exists feedback (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete set null,
  username   text,
  message    text not null check (char_length(message) between 1 and 2000),
  created_at timestamptz not null default now()
);
alter table feedback enable row level security;

create policy "users can submit feedback"
  on feedback for insert
  with check (auth.uid() = user_id);
-- 刻意不建立 select/update/delete policy：一般使用者完全看不到任何回饋內容，
-- 只能新增。讀取只能靠 SUPABASE_SECRET_KEY 的後端 service role 繞過 RLS。
