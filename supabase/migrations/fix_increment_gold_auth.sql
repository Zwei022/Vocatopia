-- 修補 increment_gold() 的權限漏洞：原本沒有檢查 p_user_id 是不是呼叫者本人，
-- 任何已登入使用者可以在瀏覽器 Console 直接呼叫這支 RPC，幫自己加無限金幣、
-- 或傳別人的 id + 負數把別人的金幣扣光。
-- 在 Supabase SQL Editor 貼上執行一次即可。
--
-- 修法：函式一開頭檢查 p_user_id 必須等於 auth.uid()，不符合就直接擋掉。
-- 唯一的內部呼叫者是 daily_checkin()（傳的是 auth.uid() 自己），不受影響。

create or replace function increment_gold(p_user_id uuid, p_delta integer)
returns integer
language plpgsql
security definer
as $$
declare
  new_gold integer;
begin
  if p_user_id is distinct from auth.uid() then
    raise exception '無權限操作他人金幣';
  end if;

  update profiles
  set gold = greatest(coalesce(gold, 0) + p_delta, 0)
  where id = p_user_id
  returning gold into new_gold;

  return new_gold;
end;
$$;

grant execute on function increment_gold(uuid, integer) to authenticated;
