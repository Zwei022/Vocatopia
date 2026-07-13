-- ============================================================
-- Vocatopia Migration — 角色收藏（出戰角色）跨裝置同步
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================
-- 角色收藏（抽卡/商店取得的出戰角色）原本只存在裝置本機（localStorage），
-- 同一帳號換裝置登入時，localStorage 是空的，會被誤判成只有預設角色，
-- 讓已經抽到的角色看起來「又變回未解鎖」。這裡加兩欄把角色收藏跟目前
-- 出戰角色存進 profiles，之後所有裝置都讀寫同一份。
--
-- owned_chars 結構（JSONB 陣列）：["onigiri","canele","sushi",...]
-- deployed_char 結構（TEXT）：目前出戰角色 id，例如 "canele"

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS owned_chars JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deployed_char TEXT;
