-- #13 成就 / 稱號系統
-- 大部分成就由現有數據即時推導（等級/連續天數/掌握字數/角色數/文法解鎖/俄方最高分）。
-- 這裡只新增「無法從現有欄位推導」的累計計數，以及稱號與已領獎紀錄。

-- 累計計數（前端事件時 +1；並發衝突機率低，採樂觀更新）
alter table profiles add column if not exists daily_all_count int not null default 0;   -- 每日六科全解次數
alter table profiles add column if not exists gacha_count     int not null default 0;   -- 抽卡總次數
-- 稱號：存已解鎖成就的 id（前端對照 ACHIEVEMENTS 顯示稱號文字，改名不影響資料）
alter table profiles add column if not exists title text;
-- 已領獎成就 id 陣列（防重複領取）
alter table profiles add column if not exists achievements_claimed jsonb not null default '[]'::jsonb;
-- 註：PVP 勝場沿用既有 profiles.wins 欄位（本次新增前端埋點寫入）；俄方最高分用 leaderboard.best_score / 本機。

-- ── 原子領取成就獎勵：未領過才加金幣並記錄，回傳新金幣總額；已領過則 update 不命中、回傳 null
create or replace function claim_achievement(p_id text, p_reward int)
returns int
language plpgsql
security definer
as $$
declare
  new_gold int;
begin
  update profiles
    set gold = gold + greatest(0, p_reward),
        achievements_claimed = achievements_claimed || to_jsonb(p_id)
    where id = auth.uid()
      and not (achievements_claimed ? p_id)
    returning gold into new_gold;
  return new_gold;
end;
$$;

grant execute on function claim_achievement(text, int) to authenticated;
