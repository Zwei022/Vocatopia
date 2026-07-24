-- 新玩家的競技場起始 ELO 從 1000（落在黃金段）改成 800（落在青銅段，<900），
-- 讓「一開始都是青銅」符合直覺——青銅本來就該是新手起點，不是黃金。
-- 在 Supabase SQL Editor 貼上執行一次即可。

alter table public.profiles
  alter column arena_elo_vocab  set default 800,
  alter column arena_elo_buzzer set default 800;

-- 回填：只調整「從沒打過競技場」（0場）且目前仍停在舊預設值1000的帳號，避免動到
-- 已經靠實際對戰把ELO推高/推低過的玩家（他們的1000可能是真的打出來的，不能亂改）。
update public.profiles
   set arena_elo_vocab = 800
 where arena_elo_vocab = 1000
   and (arena_wins_vocab + arena_losses_vocab + arena_draws_vocab) = 0;

update public.profiles
   set arena_elo_buzzer = 800
 where arena_elo_buzzer = 1000
   and (arena_wins_buzzer + arena_losses_buzzer + arena_draws_buzzer) = 0;
