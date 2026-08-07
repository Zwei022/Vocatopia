-- #15 角色成長系統（美食風味露）地基：資料欄位 + 風味露原子加減 RPC
-- 對應 Notion「VOCATOPIA角色總覽」第八節設計。本次只建地基（欄位+掉落機制），
-- 角色頁面「升級」的實際扣素材/加等級 RPC 留到 UI 階段一起做。
-- 在 Supabase SQL Editor 貼上執行一次即可。

-- 1) 角色等級（每個角色 Lv.0~5，未升級的角色不會出現在這個 jsonb 裡）
alter table public.profiles add column if not exists char_levels jsonb not null default '{}'::jsonb;

-- 2) 美食風味露持有量（抽卡「銘謝惠顧」80%機率掉落，用來升級角色）
alter table public.profiles add column if not exists flavor_dew integer not null default 0;

-- 3) 原子加減風味露（比照 increment_gold 已修好的安全寫法：auth.uid() 內建判斷，
--    不像舊版 increment_gold 一開始那樣把 user_id 當參數傳，從一開始就避免同一類漏洞）
create or replace function public.increment_flavor_dew(p_delta integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_dew integer;
begin
  update public.profiles
  set flavor_dew = greatest(coalesce(flavor_dew, 0) + p_delta, 0)
  where id = auth.uid()
  returning flavor_dew into new_dew;

  return new_dew;
end;
$$;

grant execute on function public.increment_flavor_dew(integer) to authenticated;
