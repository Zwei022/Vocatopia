-- ============================================================
-- Vocatopia Migration — 俄羅斯方塊分數提交改成單次 RPC
-- Run in: Supabase Dashboard → SQL Editor
--
-- 背景：原本前端要「先查詢目前最高分、比較、再視情況 upsert」，
-- 一次分數提交要跑 2 次網路來回。改成一個 Postgres function，
-- 把「比較 + 寫入」都放進資料庫內部一次處理，前端只呼叫 1 次。
-- SECURITY INVOKER（預設）：以呼叫者身分執行，原本 RLS 政策
-- （auth.uid() = user_id）依然有效保護，不需要放寬權限。
-- ============================================================

CREATE OR REPLACE FUNCTION submit_tetris_score(p_username TEXT, p_score INTEGER)
RETURNS void AS $$
BEGIN
  INSERT INTO tetris_scores (user_id, username, best_score, updated_at)
  VALUES (auth.uid(), p_username, p_score, now())
  ON CONFLICT (user_id) DO UPDATE
    SET best_score = p_score, username = p_username, updated_at = now()
    WHERE tetris_scores.best_score < p_score;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

GRANT EXECUTE ON FUNCTION submit_tetris_score(TEXT, INTEGER) TO authenticated;
