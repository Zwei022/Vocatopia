-- 修正金幣不穩定/消失問題：
-- 原本前端用「讀取快取值 + 本地加總 + 整值覆寫」的方式同步金幣，
-- 多分頁/多裝置同時操作時會互相覆蓋（後寫的贏，先寫的憑空消失）。
-- 改用資料庫端原子加減，不論幾個分頁同時打，最終金幣一定是所有異動的正確總和。
create or replace function increment_gold(p_user_id uuid, p_delta integer)
returns integer
language plpgsql
security definer
as $$
declare
  new_gold integer;
begin
  update profiles
  set gold = greatest(coalesce(gold, 0) + p_delta, 0)
  where id = p_user_id
  returning gold into new_gold;

  return new_gold;
end;
$$;

grant execute on function increment_gold(uuid, integer) to authenticated;
