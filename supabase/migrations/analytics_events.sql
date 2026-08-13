-- 自建行為記錄表：供之後自己用 SQL 檢討使用狀況（誰在用、用了哪些功能），
-- 不經第三方分析工具，資料完全留在既有的 Supabase（已在隱私權政策揭露範圍內）。
-- 在 Supabase SQL Editor 貼上執行一次即可。
--
-- 設計：
--   - 單一 events 表，event_type 用字串區分事件種類（screen_view / app_open / checkin /
--     gacha_pull / tetris_game_over ...），metadata 存各事件各自的附加資訊
--   - 只開放「新增自己的事件」，不開放用戶端查詢（RLS 沒有 select policy）。
--     要看數據時用 Supabase SQL Editor（service role，繞過 RLS）查，不會被前端誤用查到別人資料。

create table if not exists public.events (
  id         bigint generated always as identity primary key,
  user_id    uuid references public.profiles(id) on delete cascade,
  event_type text not null,
  metadata   jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists events_type_created_idx on public.events (event_type, created_at);
create index if not exists events_user_created_idx  on public.events (user_id, created_at);

alter table public.events enable row level security;

drop policy if exists events_insert_own on public.events;
create policy events_insert_own on public.events
  for insert
  with check (auth.uid() = user_id);

grant insert on public.events to authenticated;
grant usage on sequence public.events_id_seq to authenticated;
