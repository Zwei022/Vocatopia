-- 角色成長系統：升星 RPC。地基（char_levels/flavor_dew 欄位 + 風味露加減）已在
-- character_growth_foundation.sql 建好，這支補上真正「花素材升星」的原子操作。
-- 不能用 increment_flavor_dew/increment_gold 兩支分開呼叫湊出來：那兩支各自用
-- greatest(x,0) 防止扣成負數，餘額不夠時只會「扣到 0」而不是「拒絕」，等於升級
-- 可以少扣錢；升星必須先驗證兩筆餘額都夠，再一次性原子扣款+加星級。
-- 在 Supabase SQL Editor 貼上執行一次即可。

create or replace function public.upgrade_character(p_char_id text, p_dew_cost integer, p_gold_cost integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cur_levels jsonb;
  cur_star integer;
  cur_dew integer;
  cur_gold integer;
  new_star integer;
begin
  if p_dew_cost < 0 or p_gold_cost < 0 then
    raise exception 'invalid cost';
  end if;

  select coalesce(char_levels, '{}'::jsonb), coalesce(flavor_dew, 0), coalesce(gold, 0)
    into cur_levels, cur_dew, cur_gold
    from public.profiles where id = auth.uid() for update;

  cur_star := coalesce((cur_levels->>p_char_id)::integer, 0);
  if cur_star >= 5 then
    raise exception '角色已達最高星級';
  end if;
  if cur_dew < p_dew_cost then
    raise exception '美食風味露不足';
  end if;
  if cur_gold < p_gold_cost then
    raise exception '金幣不足';
  end if;

  new_star := cur_star + 1;

  update public.profiles
  set char_levels = jsonb_set(cur_levels, array[p_char_id], to_jsonb(new_star)),
      flavor_dew = cur_dew - p_dew_cost,
      gold = cur_gold - p_gold_cost
  where id = auth.uid();

  return jsonb_build_object('star', new_star, 'flavor_dew', cur_dew - p_dew_cost, 'gold', cur_gold - p_gold_cost);
end;
$$;

grant execute on function public.upgrade_character(text, integer, integer) to authenticated;
