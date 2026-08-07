-- 敏感進度不可由前端直接覆寫；一般設定欄位仍允許本人更新。
revoke update on public.profiles from authenticated;
grant update (username, last_active_at, push_prefs, daily_deck_state, tutorial_seen,
  title, owned_chars, deployed_char, avatar_id, str_stat, int_stat, fai_stat)
on public.profiles to authenticated;

create table if not exists public.player_daily_rewards (
  user_id uuid not null references public.profiles(id) on delete cascade,
  reward_date date not null default (timezone('Asia/Taipei', now()))::date,
  xp_earned integer not null default 0,
  gold_earned integer not null default 0,
  primary key (user_id, reward_date)
);
alter table public.player_daily_rewards enable row level security;
drop policy if exists "users read own daily rewards" on public.player_daily_rewards;
create policy "users read own daily rewards" on public.player_daily_rewards
  for select using (auth.uid() = user_id);

create or replace function public.add_xp(p_delta integer)
returns integer language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); today_tw date := (timezone('Asia/Taipei', now()))::date;
declare earned integer; new_xp integer;
begin
  if uid is null or p_delta < 0 or p_delta > 100 then raise exception 'invalid xp delta'; end if;
  insert into player_daily_rewards(user_id, reward_date, xp_earned) values(uid, today_tw, p_delta)
    on conflict(user_id, reward_date) do update set xp_earned = player_daily_rewards.xp_earned + excluded.xp_earned
    returning xp_earned into earned;
  if earned > 500 then raise exception 'daily xp limit exceeded'; end if;
  update profiles set xp = coalesce(xp, 0) + p_delta where id = uid returning xp into new_xp;
  return new_xp;
end $$;

create or replace function public.increment_gold(p_user_id uuid, p_delta integer)
returns integer language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); today_tw date := (timezone('Asia/Taipei', now()))::date;
declare earned integer; current_gold integer; new_gold integer;
begin
  if uid is null or p_user_id is distinct from uid or p_delta < -5000 or p_delta > 250 then
    raise exception 'invalid gold adjustment';
  end if;
  select gold into current_gold from profiles where id = uid for update;
  if coalesce(current_gold, 0) + p_delta < 0 then raise exception 'insufficient gold'; end if;
  if p_delta > 0 then
    insert into player_daily_rewards(user_id, reward_date, gold_earned) values(uid, today_tw, p_delta)
      on conflict(user_id, reward_date) do update set gold_earned = player_daily_rewards.gold_earned + excluded.gold_earned
      returning gold_earned into earned;
    if earned > 500 then raise exception 'daily gold limit exceeded'; end if;
  end if;
  update profiles set gold = coalesce(gold, 0) + p_delta where id = uid returning gold into new_gold;
  return new_gold;
end $$;

revoke execute on function public.apply_arena_result(integer, text, text) from authenticated, anon;

create or replace function public.settle_arena_player(
  p_user_id uuid, p_elo_delta integer, p_result text, p_mode text, p_gold integer, p_xp integer
) returns public.profiles language plpgsql security definer set search_path = public as $$
declare result_row public.profiles;
begin
  if auth.role() <> 'service_role' then raise exception 'service role required'; end if;
  if p_result not in ('win','loss','draw') or p_mode not in ('vocab','buzzer')
     or abs(p_elo_delta) > 32 or p_gold not between 0 and 30 or p_xp not between 0 and 20 then
    raise exception 'invalid arena result';
  end if;
  if p_mode = 'vocab' then
    update profiles set arena_elo_vocab=greatest(0,arena_elo_vocab+p_elo_delta),
      arena_weekly_score_vocab=greatest(0,arena_weekly_score_vocab+p_elo_delta),
      arena_wins_vocab=arena_wins_vocab+(p_result='win')::int,
      arena_losses_vocab=arena_losses_vocab+(p_result='loss')::int,
      arena_draws_vocab=arena_draws_vocab+(p_result='draw')::int,
      wins=wins+(p_result='win')::int,gold=gold+p_gold,xp=xp+p_xp
      where id=p_user_id returning * into result_row;
  else
    update profiles set arena_elo_buzzer=greatest(0,arena_elo_buzzer+p_elo_delta),
      arena_weekly_score_buzzer=greatest(0,arena_weekly_score_buzzer+p_elo_delta),
      arena_wins_buzzer=arena_wins_buzzer+(p_result='win')::int,
      arena_losses_buzzer=arena_losses_buzzer+(p_result='loss')::int,
      arena_draws_buzzer=arena_draws_buzzer+(p_result='draw')::int,
      wins=wins+(p_result='win')::int,gold=gold+p_gold,xp=xp+p_xp
      where id=p_user_id returning * into result_row;
  end if;
  return result_row;
end $$;
revoke all on function public.settle_arena_player(uuid,integer,text,text,integer,integer) from public,anon,authenticated;
grant execute on function public.settle_arena_player(uuid,integer,text,text,integer,integer) to service_role;
