-- 補三個跨裝置同步缺口（原本只存 localStorage，換裝置登入會遺失）：
-- 1. 文法教學各小節星等進度（grammar_progress，game/grammar.js）
-- 2. 單字卡熟悉度/收藏（fc_marks，依卡組分開存，script.js 的 _fcSaveMarks）
-- 做法比照 owned_chars：本機仍是即時真相來源，背景寫回這裡；登入時合併
-- （文法用「取較高星等」、單字卡用「取聯集」）不會讓玩家進度變差。
-- 在 Supabase SQL Editor 貼上執行一次即可。

alter table public.profiles
  add column if not exists grammar_progress jsonb not null default '{}'::jsonb,
  add column if not exists fc_marks jsonb not null default '{}'::jsonb;

comment on column public.profiles.grammar_progress is
  '文法教學各小節進度，格式 {"<subLessonId>": {"stars": n, ...}}';
comment on column public.profiles.fc_marks is
  '單字卡熟悉度/收藏，依卡組分開存，格式 {"<deckId>": {"learned": [...ids], "fav": [...ids]}}';
