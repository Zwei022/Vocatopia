-- ============================================================
-- Vocatopia Migration — 每日單字卡組跨裝置同步
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================
-- 每日單字卡組原本只存在裝置本機（localStorage），同一帳號在平板/手機
-- 各自登入時會各自獨立抽字，導致內容對不上。這裡加一欄把當天抽到的結果
-- 存進 profiles，之後所有裝置都讀寫同一份，就會看到一樣的每日單字。
--
-- 結構（JSONB）：
-- { "date": "2026-07-11", "deck_id": "cap2000", "daily_goal": 20, "word_ids": [101,102,...] }

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_deck_state JSONB;
