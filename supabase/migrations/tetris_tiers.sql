-- 俄羅斯方塊排行榜段位：跟競技場的 ELO 段位是「分開設計」的兩套系統，門檻完全不同——
-- 方塊分數（best_score）是累積分數（消行+單字題加分），跟 ELO 完全不是同一種尺度，
-- 不能沿用競技場的 900/1000/1100... 那組門檻。這裡依實際分數分佈重新抓級距。
-- （2026-07-24 抽樣現有 tetris_scores 前10名分數：42k/26k/5k/3k/1.2k/910/653/388/0/0，
-- 這組門檻只是依這批早期資料估的，之後玩家變多可能要重新校準。）
-- 在 Supabase SQL Editor 貼上執行一次即可。

-- username 用 profiles.username（即時），不用 tetris_scores.username（存的是舊快照，
-- 玩家改名後會跟排行榜對不上，這個 bug 之前修過一次，這裡不能重踩）。
create or replace view public.tetris_leaderboard as
  select ts.user_id as id, coalesce(p.username, ts.username) as username, p.avatar_id, ts.best_score,
         case
           when ts.best_score >= 50000 then 'legendary'
           when ts.best_score >= 25000 then 'mythic'
           when ts.best_score >= 10000 then 'diamond'
           when ts.best_score >= 4000  then 'platinum'
           when ts.best_score >= 1500  then 'gold'
           when ts.best_score >= 500   then 'silver'
           else 'bronze'
         end as tier
    from public.tetris_scores ts
    left join public.profiles p on p.id = ts.user_id;

grant select on public.tetris_leaderboard to authenticated, anon;
