-- ============================================================
-- Vocatopia Migration — 好友系統
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. profiles 新增好友碼欄位（8位數字亂碼，用來加好友，不是帳號名稱）
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS friend_code TEXT UNIQUE;

CREATE OR REPLACE FUNCTION generate_friend_code() RETURNS TEXT AS $$
DECLARE code TEXT;
BEGIN
  LOOP
    code := lpad((floor(random() * 100000000))::text, 8, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE friend_code = code);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_friend_code() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.friend_code IS NULL THEN
    NEW.friend_code := generate_friend_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_friend_code ON profiles;
CREATE TRIGGER trg_set_friend_code
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_friend_code();

-- 補齊既有帳號的好友碼
UPDATE profiles SET friend_code = generate_friend_code() WHERE friend_code IS NULL;

-- 2. 放寬 profiles 讀取權限：好友搜尋/檢視他人資料需要能查到其他使用者
--    （只放寬 SELECT，UPDATE 仍然只能改自己的資料，email/密碼不在 profiles 表內不受影響）
DROP POLICY IF EXISTS "users can read own profile" ON profiles;
DROP POLICY IF EXISTS "authenticated users can read profiles" ON profiles;
CREATE POLICY "authenticated users can read profiles"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- 3. 好友邀請/好友關係表
--    一列代表一段關係：pending（邀請中）/ accepted（好友）/ declined（已拒絕）
CREATE TABLE IF NOT EXISTS friend_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  CHECK (sender_id <> receiver_id)
);

-- 同一對使用者（不論誰先發出邀請）只能存在一筆關係紀錄
CREATE UNIQUE INDEX IF NOT EXISTS friend_pair_unique
  ON friend_requests (LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id));

ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select own friend requests" ON friend_requests;
CREATE POLICY "select own friend requests"
  ON friend_requests FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "insert own friend requests" ON friend_requests;
CREATE POLICY "insert own friend requests"
  ON friend_requests FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "update received friend requests" ON friend_requests;
CREATE POLICY "update received friend requests"
  ON friend_requests FOR UPDATE
  USING (auth.uid() = receiver_id OR auth.uid() = sender_id)
  WITH CHECK (auth.uid() = receiver_id OR auth.uid() = sender_id);

DROP POLICY IF EXISTS "delete own friend requests" ON friend_requests;
CREATE POLICY "delete own friend requests"
  ON friend_requests FOR DELETE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
