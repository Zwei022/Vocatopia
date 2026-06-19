-- ============================================================
-- Vocatopia Migration — 帳號隔離 / 初始狀態
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. profiles 補充欄位（金幣、角色屬性、初始化旗標）
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gold      INTEGER NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS str_stat  INTEGER NOT NULL DEFAULT 5;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS int_stat  INTEGER NOT NULL DEFAULT 5;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fai_stat  INTEGER NOT NULL DEFAULT 5;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS initialized BOOLEAN NOT NULL DEFAULT false;

-- 2. 自訂卡組表
CREATE TABLE IF NOT EXISTS custom_decks (
  id         TEXT        PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  emoji      TEXT        NOT NULL DEFAULT '📚',
  word_ids   INTEGER[]   NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE custom_decks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own decks" ON custom_decks;
CREATE POLICY "users manage own decks"
  ON custom_decks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
