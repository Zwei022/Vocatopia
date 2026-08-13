-- 連續紀錄保護道具（streak freeze，比照多鄰國）
-- 前置條件：daily_checkin.sql、checkin_reward.sql 已套用。
-- 在 Supabase SQL Editor 貼上執行一次即可。
--
-- 設計：
--   - profiles.streak_freeze：目前持有的保護道具數量，上限 2（避免無限囤積失去急迫感）
--   - 每完成一次 7 天循環（new_streak 為 7 的倍數）自動 +1 道具（若未達上限）
--   - 只中斷「恰好 1 天」且手上有道具時才自動消耗保護：中斷當天視同有登入，
--     streak 延續 +1；中斷 2 天以上道具救不回來，直接歸零重算（比照多鄰國規則）

alter table public.profiles add column if not exists streak_freeze int not null default 0 check (streak_freeze >= 0);

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
  prev_freeze  int;
  new_streak   int;
  new_freeze   int;
  freeze_used  boolean := false;
  r_day        int;
  r_type       text;
  r_amount     int;
  new_gold     int;
begin
  if uid is null then
    return json_build_object('error', 'not authenticated');
  end if;

  select last_checkin, coalesce(streak, 0), coalesce(streak_freeze, 0)
    into prev_date, prev_streak, prev_freeze
    from public.profiles
   where id = uid
     for update;

  if prev_date = today then
    -- 今天已經簽到過，不重複發獎勵
    return json_build_object('streak', prev_streak, 'changed', false,
                             'isFirst', false, 'today', today,
                             'streak_freeze', prev_freeze, 'freeze_used', false);
  elsif prev_date = today - 1 then
    new_streak := prev_streak + 1;
    new_freeze := prev_freeze;
  elsif prev_date = today - 2 and prev_freeze > 0 then
    -- 剛好斷了 1 天，且手上有保護道具 → 自動消耗一個，紀錄視同沒中斷
    new_streak := prev_streak + 1;
    new_freeze := prev_freeze - 1;
    freeze_used := true;
  else
    new_streak := 1;
    new_freeze := prev_freeze;
  end if;

  -- 每滿 7 天循環發 1 個保護道具，上限 2 個
  if new_streak % 7 = 0 and new_freeze < 2 then
    new_freeze := new_freeze + 1;
  end if;

  update public.profiles
     set streak = new_streak, last_checkin = today, streak_freeze = new_freeze
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
                           'reward_amount', r_amount, 'gold', new_gold,
                           'streak_freeze', new_freeze, 'freeze_used', freeze_used);
end;
$$;

grant execute on function public.daily_checkin() to authenticated;
