-- 競技場段位制 + 週結算：解決「排行榜只顯示全站前20，離榜首太遠喪失爭取心」的問題。
-- 段位依永久 ELO 即時計算（不另存欄位，ELO 漲跌段位就跟著變），排行榜預設只顯示「你目前
-- 所在段位」內的排名，比較對象變成同段位的人，而不是遙不可及的全站第一名。
-- 另外新增「本週積分」：每場對戰結算時跟著 ELO 增減（下限 0，不會扣成負的），每週一
-- 00:05（台灣時間）結算一次——每個段位前20名依名次發金幣，發完歸零重新開始。
-- 在 Supabase SQL Editor 貼上執行一次即可。

alter table public.profiles
  add column if not exists arena_weekly_score_vocab  int not null default 0,
  add column if not exists arena_weekly_score_buzzer  int not null default 0;

-- 段位門檻（跟前端 script.js 的 ARENA_TIERS 常數需保持一致，之後要調整兩邊都要改）：
-- 青銅 <900／白銀 900+／黃金 1000+／白金 1100+／鑽石 1200+／神話 1500+／傳奇 1700+

-- apply_arena_result 改成連本週積分一起更新，需先 drop 再重建（改變了 RETURNS TABLE 結構，
-- Postgres 的 CREATE OR REPLACE FUNCTION 不允許直接改回傳型別）。
drop function if exists public.apply_arena_result(int, text, text);

create function public.apply_arena_result(p_elo_delta int, p_result text, p_mode text)
returns table (
  arena_elo_vocab int, arena_wins_vocab int, arena_losses_vocab int, arena_draws_vocab int,
  arena_weekly_score_vocab int,
  arena_elo_buzzer int, arena_wins_buzzer int, arena_losses_buzzer int, arena_draws_buzzer int,
  arena_weekly_score_buzzer int,
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
       set arena_elo_vocab          = greatest(0, coalesce(p.arena_elo_vocab, 1000) + p_elo_delta),
           arena_wins_vocab         = p.arena_wins_vocab   + case when p_result = 'win'  then 1 else 0 end,
           arena_losses_vocab       = p.arena_losses_vocab + case when p_result = 'loss' then 1 else 0 end,
           arena_draws_vocab        = p.arena_draws_vocab  + case when p_result = 'draw' then 1 else 0 end,
           arena_weekly_score_vocab = greatest(0, coalesce(p.arena_weekly_score_vocab, 0) + p_elo_delta),
           wins                     = p.wins               + case when p_result = 'win'  then 1 else 0 end
     where p.id = uid;
  else
    update public.profiles p
       set arena_elo_buzzer          = greatest(0, coalesce(p.arena_elo_buzzer, 1000) + p_elo_delta),
           arena_wins_buzzer         = p.arena_wins_buzzer   + case when p_result = 'win'  then 1 else 0 end,
           arena_losses_buzzer       = p.arena_losses_buzzer + case when p_result = 'loss' then 1 else 0 end,
           arena_draws_buzzer        = p.arena_draws_buzzer  + case when p_result = 'draw' then 1 else 0 end,
           arena_weekly_score_buzzer = greatest(0, coalesce(p.arena_weekly_score_buzzer, 0) + p_elo_delta),
           wins                      = p.wins                + case when p_result = 'win'  then 1 else 0 end
     where p.id = uid;
  end if;

  return query
    select p.arena_elo_vocab, p.arena_wins_vocab, p.arena_losses_vocab, p.arena_draws_vocab,
           p.arena_weekly_score_vocab,
           p.arena_elo_buzzer, p.arena_wins_buzzer, p.arena_losses_buzzer, p.arena_draws_buzzer,
           p.arena_weekly_score_buzzer,
           p.wins
      from public.profiles p
     where p.id = uid;
end;
$$;

grant execute on function public.apply_arena_result(int, text, text) to authenticated;

-- 排行榜 view 補上 tier（段位）與 weekly_score（本週積分）欄位，且不再要求「至少5場」門檻——
-- 段位制本身就已經把新手跟高手分開了，不需要再用場次數字擋新手看不到自己的段位排行。
drop view if exists public.arena_leaderboard_vocab;
drop view if exists public.arena_leaderboard_buzzer;

create view public.arena_leaderboard_vocab as
  select id, username, avatar_id,
         arena_elo_vocab as arena_elo,
         arena_weekly_score_vocab as weekly_score,
         case
           when arena_elo_vocab >= 1700 then 'legendary'
           when arena_elo_vocab >= 1500 then 'mythic'
           when arena_elo_vocab >= 1200 then 'diamond'
           when arena_elo_vocab >= 1100 then 'platinum'
           when arena_elo_vocab >= 1000 then 'gold'
           when arena_elo_vocab >= 900  then 'silver'
           else 'bronze'
         end as tier,
         arena_wins_vocab as arena_wins, arena_losses_vocab as arena_losses, arena_draws_vocab as arena_draws,
         (arena_wins_vocab + arena_losses_vocab + arena_draws_vocab) as arena_matches
    from public.profiles;

create view public.arena_leaderboard_buzzer as
  select id, username, avatar_id,
         arena_elo_buzzer as arena_elo,
         arena_weekly_score_buzzer as weekly_score,
         case
           when arena_elo_buzzer >= 1700 then 'legendary'
           when arena_elo_buzzer >= 1500 then 'mythic'
           when arena_elo_buzzer >= 1200 then 'diamond'
           when arena_elo_buzzer >= 1100 then 'platinum'
           when arena_elo_buzzer >= 1000 then 'gold'
           when arena_elo_buzzer >= 900  then 'silver'
           else 'bronze'
         end as tier,
         arena_wins_buzzer as arena_wins, arena_losses_buzzer as arena_losses, arena_draws_buzzer as arena_draws,
         (arena_wins_buzzer + arena_losses_buzzer + arena_draws_buzzer) as arena_matches
    from public.profiles;

grant select on public.arena_leaderboard_vocab  to authenticated, anon;
grant select on public.arena_leaderboard_buzzer to authenticated, anon;

-- 週結算：兩種模式各自結算，同段位內依本週積分排名，前20名依名次發金幣，結算完歸零。
-- 只給 service_role 執行（後端 cron 用 service-role key 呼叫），一般使用者不能自己觸發。
create or replace function public.settle_arena_week()
returns table (mode text, tier text, rnk int, user_id uuid, gold_awarded int)
language plpgsql
security definer
set search_path = public
as $$
declare
  m text;
  elo_col text;
  score_col text;
begin
  foreach m in array array['vocab', 'buzzer'] loop
    elo_col := 'arena_elo_' || m;
    score_col := 'arena_weekly_score_' || m;

    return query execute format($f$
      with ranked as (
        select p.id,
               case
                 when p.%1$I >= 1700 then 'legendary'
                 when p.%1$I >= 1500 then 'mythic'
                 when p.%1$I >= 1200 then 'diamond'
                 when p.%1$I >= 1100 then 'platinum'
                 when p.%1$I >= 1000 then 'gold'
                 when p.%1$I >= 900  then 'silver'
                 else 'bronze'
               end as tier_name,
               row_number() over (
                 partition by case
                   when p.%1$I >= 1700 then 'legendary'
                   when p.%1$I >= 1500 then 'mythic'
                   when p.%1$I >= 1200 then 'diamond'
                   when p.%1$I >= 1100 then 'platinum'
                   when p.%1$I >= 1000 then 'gold'
                   when p.%1$I >= 900  then 'silver'
                   else 'bronze'
                 end
                 order by p.%2$I desc
               ) as rnk
          from public.profiles p
         where p.%2$I > 0
      ),
      winners as (
        select id, tier_name, rnk,
               case when rnk <= 3 then 150 when rnk <= 10 then 100 else 60 end as gold_awarded
          from ranked
         where rnk <= 20
      )
      update public.profiles p
         set gold = greatest(0, coalesce(p.gold, 0) + w.gold_awarded)
        from winners w
       where p.id = w.id
      returning %3$L, w.tier_name, w.rnk, w.id, w.gold_awarded
    $f$, elo_col, score_col, m);

    execute format('update public.profiles set %I = 0', score_col);
  end loop;
end;
$$;

grant execute on function public.settle_arena_week() to service_role;
