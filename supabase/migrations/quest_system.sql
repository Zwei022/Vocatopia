-- #14 主線 / 支線任務系統
-- 任務內容與獎勵定義在前端 QUESTS 陣列（比照成就系統 ACHIEVEMENTS 的 data-driven 寫法）。
-- 這裡只新增「已領獎任務 id」的伺服器紀錄，以及原子領取 RPC。
-- 在 Supabase SQL Editor 貼上執行一次即可。

-- 已領獎任務 id 陣列（防重複領取；比照 achievements_claimed）
alter table public.profiles add column if not exists quests_claimed jsonb not null default '[]'::jsonb;

-- ── 原子領取任務獎勵：未領過才同時發放金幣＋經驗值並記錄，回傳新的 {gold, xp}；
--    已領過則 update 不命中、回傳 null（比照 claim_achievement 的樂觀防重複寫法）
create or replace function public.claim_quest(p_id text, p_gold int, p_xp int)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  new_gold int;
  new_xp   int;
begin
  update public.profiles
    set gold = greatest(0, coalesce(gold, 0) + p_gold),
        xp   = greatest(0, coalesce(xp, 0) + p_xp),
        quests_claimed = quests_claimed || to_jsonb(p_id)
    where id = auth.uid()
      and not (quests_claimed ? p_id)
    returning gold, xp into new_gold, new_xp;

  if new_gold is null then
    return null;
  end if;
  return json_build_object('gold', new_gold, 'xp', new_xp);
end;
$$;

grant execute on function public.claim_quest(text, int, int) to authenticated;
