-- 競技場排名系統：ELO 段位 + 每場結果原子更新 RPC（比照 add_xp / increment_gold，避免競態）
-- 在 Supabase SQL Editor 貼上執行一次即可。
--
-- 修正舊有 bug：profiles.wins 過去是前端「讀取→本地相加→整包寫回」（見 script.js _acBump），
-- 跟 gold 當初修掉的 race condition 是同一種問題。這裡把 wins 的更新也一併收進本 RPC，
-- 之後 PVP 勝場一律透過 apply_arena_result 寫入，不再走 _acBump('wins', 1)。

alter table public.profiles
  add column if not exists arena_elo    int not null default 1000,
  add column if not exists arena_wins   int not null default 0,
  add column if not exists arena_losses int not null default 0,
  add column if not exists arena_draws  int not null default 0;

create or replace function public.apply_arena_result(p_elo_delta int, p_result text)
returns table (arena_elo int, arena_wins int, arena_losses int, arena_draws int, wins int)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    return;
  end if;
  if p_result not in ('win', 'loss', 'draw') then
    raise exception 'invalid p_result: %', p_result;
  end if;

  update public.profiles p
     set arena_elo    = greatest(0, coalesce(p.arena_elo, 1000) + p_elo_delta),
         arena_wins   = p.arena_wins   + case when p_result = 'win'  then 1 else 0 end,
         arena_losses = p.arena_losses + case when p_result = 'loss' then 1 else 0 end,
         arena_draws  = p.arena_draws  + case when p_result = 'draw' then 1 else 0 end,
         wins         = p.wins         + case when p_result = 'win'  then 1 else 0 end
   where p.id = uid;

  return query
    select p.arena_elo, p.arena_wins, p.arena_losses, p.arena_draws, p.wins
      from public.profiles p
     where p.id = uid;
end;
$$;

grant execute on function public.apply_arena_result(int, text) to authenticated;

-- 競技場排行榜：僅需公開暱稱、稱號、ELO、對戰場次，不外洩帳號其他欄位
create or replace view public.arena_leaderboard as
  select id, username, arena_elo, arena_wins, arena_losses, arena_draws,
         (arena_wins + arena_losses + arena_draws) as arena_matches
    from public.profiles
   where (arena_wins + arena_losses + arena_draws) >= 5
   order by arena_elo desc;

grant select on public.arena_leaderboard to authenticated, anon;
