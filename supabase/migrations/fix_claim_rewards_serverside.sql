-- 修復 claim_achievement / claim_quest 的獎勵金額竄改漏洞
-- 問題：舊版 RPC 直接信任客戶端傳入的 p_reward / p_gold / p_xp，任何人能用
--       devtools 或直接呼叫 PostgREST 帶超大數字自我發獎（跟已修復的 increment_gold
--       漏洞同一類問題）。比照 checkin_reward.sql 的作法，改成後端設定表核對。
-- 在 Supabase SQL Editor 貼上執行一次即可。前置條件：achievements.sql、quest_system.sql 已套用。

-- 1) 成就獎勵設定表（id 對應前端 ACHIEVEMENTS 的 id，reward 抄自 script.js 現有數值）
create table if not exists public.achievement_reward_config (
  id     text primary key,
  reward int not null check (reward >= 0)
);

insert into public.achievement_reward_config (id, reward) values
  ('word50',   100), ('word200',  200), ('word500',  400), ('word2000', 1000),
  ('gram10',   150), ('gram30',   300), ('gram92',   800),
  ('lv5',      100), ('lv10',     200), ('lv30',     500), ('lv50',     800), ('lv100', 2000),
  ('streak3',  100), ('streak7',  250), ('streak30', 600), ('streak100',1500),
  ('char3',    150), ('char6',    300), ('charAll',  1000),
  ('daily1',   100), ('daily10',  400), ('daily50',  1200),
  ('win1',     100), ('win10',    400), ('win50',    1200),
  ('tetris5k', 150), ('tetris15k',400), ('tetris30k',900)
on conflict (id) do update set reward = excluded.reward;

grant select on public.achievement_reward_config to anon, authenticated;
alter table public.achievement_reward_config enable row level security;
drop policy if exists achievement_reward_config_read_all on public.achievement_reward_config;
create policy achievement_reward_config_read_all on public.achievement_reward_config
  for select using (true);

-- 2) 任務獎勵設定表（id 對應前端 QUEST_MAIN / QUEST_SIDE 的 id）
create table if not exists public.quest_reward_config (
  id   text primary key,
  gold int not null check (gold >= 0),
  xp   int not null check (xp >= 0)
);

insert into public.quest_reward_config (id, gold, xp) values
  ('mq1_deck5',    50,  80),
  ('mq2_streak3',  70,  100),
  ('mq3_win1',     90,  130),
  ('mq4_tetris10', 130, 180),
  ('mq5_word50',   160, 220),
  ('mq6_gacha1',   100, 150),
  ('sq_fav10',     30,  40),
  ('sq_match15',   30,  40),
  ('sq_cloze1',    30,  40),
  ('sq_listen1',   30,  40),
  ('sq_lookup20',  30,  40),
  ('sq_dailyall1', 40,  60),
  ('sq_gsat1',     40,  60)
on conflict (id) do update set gold = excluded.gold, xp = excluded.xp;

grant select on public.quest_reward_config to anon, authenticated;
alter table public.quest_reward_config enable row level security;
drop policy if exists quest_reward_config_read_all on public.quest_reward_config;
create policy quest_reward_config_read_all on public.quest_reward_config
  for select using (true);

-- 3) 移除舊版可被竄改獎勵金額的函式簽名（避免新舊版並存、被繞過呼叫舊版）
drop function if exists claim_achievement(text, int);
drop function if exists public.claim_quest(text, int, int);

-- 4) claim_achievement 改寫：只收 p_id，獎勵金額查 achievement_reward_config
create or replace function public.claim_achievement(p_id text)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  r_reward int;
  new_gold int;
begin
  select reward into r_reward from public.achievement_reward_config where id = p_id;
  if r_reward is null then
    return null; -- 不存在的成就 id，不發獎
  end if;

  update public.profiles
    set gold = gold + r_reward,
        achievements_claimed = achievements_claimed || to_jsonb(p_id)
    where id = auth.uid()
      and not (achievements_claimed ? p_id)
    returning gold into new_gold;
  return new_gold;
end;
$$;

grant execute on function public.claim_achievement(text) to authenticated;

-- 5) claim_quest 改寫：只收 p_id，獎勵金額/經驗值查 quest_reward_config
create or replace function public.claim_quest(p_id text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  r_gold   int;
  r_xp     int;
  new_gold int;
  new_xp   int;
begin
  select gold, xp into r_gold, r_xp from public.quest_reward_config where id = p_id;
  if r_gold is null then
    return null; -- 不存在的任務 id，不發獎
  end if;

  update public.profiles
    set gold = greatest(0, coalesce(gold, 0) + r_gold),
        xp   = greatest(0, coalesce(xp, 0) + r_xp),
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

grant execute on function public.claim_quest(text) to authenticated;
