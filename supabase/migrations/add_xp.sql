-- #2 經驗值系統：原子加 XP RPC（比照 increment_gold，避免多來源同時加 XP 競態）
-- 在 Supabase SQL Editor 貼上執行一次即可。
-- 累積總經驗存在 profiles.xp（既有欄位），等級由前端依曲線反推。

create or replace function public.add_xp(p_delta int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  uid    uuid := auth.uid();
  new_xp int;
begin
  if uid is null then
    return null;
  end if;
  update public.profiles
     set xp = greatest(0, coalesce(xp, 0) + p_delta)
   where id = uid
   returning xp into new_xp;
  return new_xp;
end;
$$;

grant execute on function public.add_xp(int) to authenticated;
