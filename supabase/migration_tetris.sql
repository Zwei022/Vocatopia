-- ============================================================
-- Vocatopia Migration — 俄羅斯方塊對戰排行榜
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 每位玩家一列，只保留最高分
CREATE TABLE IF NOT EXISTS tetris_scores (
  user_id    UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  username   TEXT NOT NULL,
  best_score INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tetris_scores_best_idx ON tetris_scores (best_score DESC);

ALTER TABLE tetris_scores ENABLE ROW LEVEL SECURITY;

-- 排行榜需要能讀到所有人的分數：開放任何已登入使用者讀取
DROP POLICY IF EXISTS "authenticated read tetris scores" ON tetris_scores;
CREATE POLICY "authenticated read tetris scores"
  ON tetris_scores FOR SELECT
  USING (auth.role() = 'authenticated');

-- 只能新增/更新自己的分數
DROP POLICY IF EXISTS "users upsert own tetris score" ON tetris_scores;
CREATE POLICY "users insert own tetris score"
  ON tetris_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users update own tetris score" ON tetris_scores;
CREATE POLICY "users update own tetris score"
  ON tetris_scores FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
