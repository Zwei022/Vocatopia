-- 頭像功能：沿用既有的俄羅斯方塊角色收藏（profiles.owned_chars）作為頭像解鎖來源，
-- 不另開一套獨立的頭像解鎖經濟——玩家已擁有的角色，同時可以拿來當頭像用。
-- 新增一個欄位單純記錄「目前選擇哪個已擁有角色當頭像」，跟「出戰角色」(deployed_char) 脫鉤，
-- 因為頭像是給別人看的個人資料/競技場識別，跟俄羅斯方塊出戰用的角色不必然是同一隻。
-- 在 Supabase SQL Editor 貼上執行一次即可。

alter table public.profiles
  add column if not exists avatar_id text;

-- 競技場排行榜要一併顯示頭像，重建這兩個 view 補上 avatar_id 欄位
-- （這兩個 view 本來就是 arena_ranking.sql 建的，這裡是加欄位重建，不影響既有資料）
create or replace view public.arena_leaderboard_vocab as
  select id, username, avatar_id, arena_elo_vocab as arena_elo,
         arena_wins_vocab as arena_wins, arena_losses_vocab as arena_losses, arena_draws_vocab as arena_draws,
         (arena_wins_vocab + arena_losses_vocab + arena_draws_vocab) as arena_matches
    from public.profiles
   where (arena_wins_vocab + arena_losses_vocab + arena_draws_vocab) >= 5
   order by arena_elo_vocab desc;

create or replace view public.arena_leaderboard_buzzer as
  select id, username, avatar_id, arena_elo_buzzer as arena_elo,
         arena_wins_buzzer as arena_wins, arena_losses_buzzer as arena_losses, arena_draws_buzzer as arena_draws,
         (arena_wins_buzzer + arena_losses_buzzer + arena_draws_buzzer) as arena_matches
    from public.profiles
   where (arena_wins_buzzer + arena_losses_buzzer + arena_draws_buzzer) >= 5
   order by arena_elo_buzzer desc;

grant select on public.arena_leaderboard_vocab  to authenticated, anon;
grant select on public.arena_leaderboard_buzzer to authenticated, anon;
