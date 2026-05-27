-- ── 每日閱讀文章（AI 自動生成）──────────────────────────────

CREATE TABLE IF NOT EXISTS daily_articles (
  id         uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  date       date    NOT NULL,
  slot       int     NOT NULL CHECK (slot BETWEEN 1 AND 5),
  title      text    NOT NULL,
  emoji      text    DEFAULT '📖',
  tag        text    DEFAULT '每日閱讀',
  topic      text    NOT NULL,
  content    text    NOT NULL,
  difficulty text    DEFAULT 'B1',
  word_count int,
  created_at timestamptz DEFAULT now(),
  UNIQUE(date, slot)
);

CREATE TABLE IF NOT EXISTS article_questions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id  uuid REFERENCES daily_articles(id) ON DELETE CASCADE,
  sort_order  int  NOT NULL DEFAULT 1,
  question    text NOT NULL,
  options     jsonb NOT NULL,   -- string[4]
  answer      int  NOT NULL,    -- 0-3
  explanation text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_article_progress (
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id uuid REFERENCES daily_articles(id) ON DELETE CASCADE,
  score      int     DEFAULT 0,
  completed  boolean DEFAULT false,
  done_at    timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, article_id)
);

-- RLS
ALTER TABLE daily_articles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_questions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_article_progress  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read daily_articles"
  ON daily_articles FOR SELECT USING (true);

CREATE POLICY "public read article_questions"
  ON article_questions FOR SELECT USING (true);

CREATE POLICY "owner daily_progress"
  ON daily_article_progress USING (auth.uid() = user_id);

CREATE POLICY "insert daily_progress"
  ON daily_article_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update daily_progress"
  ON daily_article_progress FOR UPDATE USING (auth.uid() = user_id);

-- service role 有完整 bypass RLS 權限，無需額外 policy
