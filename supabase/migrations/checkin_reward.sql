-- 每日簽到獎勵：擴充 daily_checkin() 讓簽到直接發金幣，並提供可設定的獎勵表。
-- 在 Supabase SQL Editor 貼上執行一次即可。前置條件：daily_checkin.sql、migration_atomic_gold.sql 已套用。
--
-- 設計：
--   - 7 天一循環，第幾天的獎勵存在 checkin_reward_config，之後要改獎勵內容
--     只需要 update 這張表，不必動 RPC 或前端程式碼。
--   - reward_day = ((streak - 1) % 7) + 1（streak 已由既有邏輯處理中斷重置為 1）
--   - 同一天重複呼叫 daily_checkin() 不會重複發獎勵（changed=false 時直接跳過）

-- 1) 獎勵設定表（day_index 1-7，可直接改 amount 調整獎勵內容）
create table if not exists public.checkin_reward_config (
  day_index   int primary key check (day_index between 1 and 7),
  reward_type text not null default 'gold',
  amount      int not null check (amount >= 0)
);

insert into public.checkin_reward_config (day_index, reward_type, amount) values
  (1, 'gold', 10),
  (2, 'gold', 10),
  (3, 'gold', 15),
  (4, 'gold', 15),
  (5, 'gold', 20),
  (6, 'gold', 20),
  (7, 'gold', 50)
on conflict (day_index) do nothing;

-- 公開唯讀（前端要畫 7 天月曆需要知道每天獎勵內容，不含使用者資料，可放行 anon）
grant select on public.checkin_reward_config to anon, authenticated;
alter table public.checkin_reward_config enable row level security;
drop policy if exists checkin_reward_config_read_all on public.checkin_reward_config;
create policy checkin_reward_config_read_all on public.checkin_reward_config
  for select using (true);

-- 2) daily_checkin() 改寫：在既有的連續天數邏輯之後，一併算出並發放本次獎勵
--    回傳新增欄位：reward_day, reward_type, reward_amount, gold（發放後餘額）
create or replace function public.daily_checkin()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  uid          uuid := auth.uid();
  today        date := (timezone('Asia/Taipei', now()))::date;
  prev_date    date;
  prev_streak  int;
  new_streak   int;
  r_day        int;
  r_type       text;
  r_amount     int;
  new_gold     int;
begin
  if uid is null then
    return json_build_object('error', 'not authenticated');
  end if;

  select last_checkin, coalesce(streak, 0)
    into prev_date, prev_streak
    from public.profiles
   where id = uid
     for update;

  if prev_date = today then
    -- 今天已經簽到過，不重複發獎勵
    return json_build_object('streak', prev_streak, 'changed', false,
                             'isFirst', false, 'today', today);
  elsif prev_date = today - 1 then
    new_streak := prev_streak + 1;
  else
    new_streak := 1;
  end if;

  update public.profiles
     set streak = new_streak, last_checkin = today
   where id = uid;

  r_day := ((new_streak - 1) % 7) + 1;
  select reward_type, amount into r_type, r_amount
    from public.checkin_reward_config
   where day_index = r_day;

  if r_type = 'gold' and r_amount > 0 then
    new_gold := public.increment_gold(uid, r_amount);
  else
    select gold into new_gold from public.profiles where id = uid;
  end if;

  return json_build_object('streak', new_streak, 'changed', true,
                           'isFirst', prev_date is null, 'today', today,
                           'reward_day', r_day, 'reward_type', r_type,
                           'reward_amount', r_amount, 'gold', new_gold);
end;
$$;

grant execute on function public.daily_checkin() to authenticated;
