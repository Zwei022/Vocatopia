-- ============================================================
-- Vocatopia Migration — 單字卡「更多用法」豐富內容欄位
-- Run in: Supabase Dashboard → SQL Editor
--
-- 只有 Unit1-32（主題式分類）的單字會填這個欄位，
-- 一般透過查詢功能即時生成的字（tags 含 user_lookup）維持 NULL，不受影響。
-- 前端只在 rich_content 不是 NULL 時才顯示「更多用法」書本按鈕。
--
-- rich_content JSON 結構：
-- {
--   "senses": [{"pos":"n.","definition_zh":"...","example_en":"...","example_zh":"..."}],  // 其他詞性/義項
--   "phrases": [{"phrase":"...","meaning_zh":"...","example_en":"...","example_zh":"..."}], // 片語搭配
--   "synonyms": ["..."],      // 同義字
--   "antonyms": ["..."],      // 反義字
--   "extensions": [{"word":"...","meaning_zh":"..."}],  // 衍生字
--   "verb_forms": {"past":"...","pastParticiple":"...","presentParticiple":"..."}  // 不規則動詞三態（規則變化不填）
-- }
-- ============================================================

ALTER TABLE words ADD COLUMN IF NOT EXISTS rich_content JSONB;
