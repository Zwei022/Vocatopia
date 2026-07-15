-- #1/#4 每日登入連續天數（streak）
-- 在 Supabase SQL Editor 貼上執行一次即可。
-- 設計：連續天數以「台灣時區的日期」判定（每天 00:00 台灣時間換日 = 使用者要的晚上12點刷新）。
--   - 今天已簽到      → 不變、changed=false
--   - 昨天有簽到      → streak + 1（連勝）
--   - 中斷或第一次    → streak 重設為 1

-- 1) 新增「上次簽到日期」欄位
alter table public.profiles add column if not exists last_checkin date;

-- 2) 每日簽到 RPC（原子、伺服器權威）。回傳 JSON：
--    { streak, changed, isFirst, today }
create or replace function public.daily_checkin()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  uid        uuid := auth.uid();
  today      date := (timezone('Asia/Taipei', now()))::date;   -- 台灣時區的今天
  prev_date  date;
  prev_streak int;
  new_streak int;
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
    -- 今天已經簽到過，不重複加
    return json_build_object('streak', prev_streak, 'changed', false,
                             'isFirst', false, 'today', today);
  elsif prev_date = today - 1 then
    new_streak := prev_streak + 1;          -- 昨天有登入 → 連勝 +1
  else
    new_streak := 1;                        -- 中斷過或第一次 → 從 1 開始
  end if;

  update public.profiles
     set streak = new_streak, last_checkin = today
   where id = uid;

  return json_build_object('streak', new_streak, 'changed', true,
                           'isFirst', prev_date is null, 'today', today);
end;
$$;

-- 3) 允許登入使用者呼叫
grant execute on function public.daily_checkin() to authenticated;
