-- ============================================================
-- Vocatopia Migration — 首次進入引導教學
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================
-- 記錄這個帳號是否已經看過首次引導教學，跨裝置同步（同一帳號在別台裝置
-- 登入過、看過一次之後，換裝置登入就不會再跳出來）。

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tutorial_seen BOOLEAN DEFAULT false;
