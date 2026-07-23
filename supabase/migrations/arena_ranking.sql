-- 競技場排名系統：兩種模式（單字對決 vocab／單字搶答 buzzer）各自獨立的 ELO 段位，
-- 原子更新 RPC 比照 add_xp / increment_gold，避免競態。
-- 在 Supabase SQL Editor 貼上執行一次即可。
--
-- 修正舊有 bug：profiles.wins 過去是前端「讀取→本地相加→整包寫回」（見 script.js _acBump），
-- 跟 gold 當初修掉的 race condition 是同一種問題。這裡把 wins 的更新也一併收進本 RPC，
-- 之後 PVP 勝場一律透過 apply_arena_result 寫入，不再走 _acBump('wins', 1)。
-- wins 維持「兩種模式合計」，供既有的「首戰告捷」等成就沿用；排行榜看的是各模式獨立的 arena_elo_*。

alter table public.profiles
  add column if not exists arena_elo_vocab     int not null default 1000,
  add column if not exists arena_wins_vocab    int not null default 0,
  add column if not exists arena_losses_vocab  int not null default 0,
  add column if not exists arena_draws_vocab   int not null default 0,
  add column if not exists arena_elo_buzzer    int not null default 1000,
  add column if not exists arena_wins_buzzer   int not null default 0,
  add column if not exists arena_losses_buzzer int not null default 0,
  add column if not exists arena_draws_buzzer  int not null default 0;

create or replace function public.apply_arena_result(p_elo_delta int, p_result text, p_mode text)
returns table (
  arena_elo_vocab int, arena_wins_vocab int, arena_losses_vocab int, arena_draws_vocab int,
  arena_elo_buzzer int, arena_wins_buzzer int, arena_losses_buzzer int, arena_draws_buzzer int,
  wins int
)
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
  if p_mode not in ('vocab', 'buzzer') then
    raise exception 'invalid p_mode: %', p_mode;
  end if;

  if p_mode = 'vocab' then
    update public.profiles p
       set arena_elo_vocab    = greatest(0, coalesce(p.arena_elo_vocab, 1000) + p_elo_delta),
           arena_wins_vocab   = p.arena_wins_vocab   + case when p_result = 'win'  then 1 else 0 end,
           arena_losses_vocab = p.arena_losses_vocab + case when p_result = 'loss' then 1 else 0 end,
           arena_draws_vocab  = p.arena_draws_vocab  + case when p_result = 'draw' then 1 else 0 end,
           wins               = p.wins               + case when p_result = 'win'  then 1 else 0 end
     where p.id = uid;
  else
    update public.profiles p
       set arena_elo_buzzer    = greatest(0, coalesce(p.arena_elo_buzzer, 1000) + p_elo_delta),
           arena_wins_buzzer   = p.arena_wins_buzzer   + case when p_result = 'win'  then 1 else 0 end,
           arena_losses_buzzer = p.arena_losses_buzzer + case when p_result = 'loss' then 1 else 0 end,
           arena_draws_buzzer  = p.arena_draws_buzzer  + case when p_result = 'draw' then 1 else 0 end,
           wins                = p.wins                + case when p_result = 'win'  then 1 else 0 end
     where p.id = uid;
  end if;

  return query
    select p.arena_elo_vocab, p.arena_wins_vocab, p.arena_losses_vocab, p.arena_draws_vocab,
           p.arena_elo_buzzer, p.arena_wins_buzzer, p.arena_losses_buzzer, p.arena_draws_buzzer, p.wins
      from public.profiles p
     where p.id = uid;
end;
$$;

grant execute on function public.apply_arena_result(int, text, text) to authenticated;

-- 兩個模式各自獨立的排行榜：僅需公開暱稱、ELO、對戰場次，不外洩帳號其他欄位。
-- 至少打滿 5 場才上榜，避免 1 場僥倖就霸榜。
create or replace view public.arena_leaderboard_vocab as
  select id, username, arena_elo_vocab as arena_elo,
         arena_wins_vocab as arena_wins, arena_losses_vocab as arena_losses, arena_draws_vocab as arena_draws,
         (arena_wins_vocab + arena_losses_vocab + arena_draws_vocab) as arena_matches
    from public.profiles
   where (arena_wins_vocab + arena_losses_vocab + arena_draws_vocab) >= 5
   order by arena_elo_vocab desc;

create or replace view public.arena_leaderboard_buzzer as
  select id, username, arena_elo_buzzer as arena_elo,
         arena_wins_buzzer as arena_wins, arena_losses_buzzer as arena_losses, arena_draws_buzzer as arena_draws,
         (arena_wins_buzzer + arena_losses_buzzer + arena_draws_buzzer) as arena_matches
    from public.profiles
   where (arena_wins_buzzer + arena_losses_buzzer + arena_draws_buzzer) >= 5
   order by arena_elo_buzzer desc;

grant select on public.arena_leaderboard_vocab  to authenticated, anon;
grant select on public.arena_leaderboard_buzzer to authenticated, anon;
