-- 抽卡保底次數（pity）跨裝置同步：目前 game/tetris/gacha.js 的保底計數只存在
-- localStorage（voca_gacha_pity_<poolId>），換裝置登入會被重置成 0，等於保底進度
-- 遺失。比照 owned_chars 的作法：新增一個 JSONB 欄位存「各卡池各自的保底計數」，
-- 本機仍是即時真相來源，背景寫回這裡；登入時取本機與伺服器「較大值」合併
-- （保底次數只會單調上升、中獎才歸零，取較大值不會讓玩家保底進度變差）。
-- 在 Supabase SQL Editor 貼上執行一次即可。

alter table public.profiles
  add column if not exists gacha_pity jsonb not null default '{}'::jsonb;

comment on column public.profiles.gacha_pity is
  '各抽卡池保底進度，格式 {"<poolId>": {"sinceLegendary": n, "sinceMythicPlus": n}}';
