-- ============================================================
-- Vocatopia Full Setup — Schema + All Data
-- 在 Supabase Dashboard → SQL Editor 貼上並執行
-- ============================================================

-- ── STEP 1：補齊 words 表缺少的欄位 ──────────────────────────
ALTER TABLE words ADD COLUMN IF NOT EXISTS phonetic text;
ALTER TABLE words ADD COLUMN IF NOT EXISTS tags     text[] NOT NULL DEFAULT '{}';

-- ── STEP 2：建立缺少的資料表 ─────────────────────────────────

-- 使用者資料
CREATE TABLE IF NOT EXISTS profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username   text UNIQUE NOT NULL,
  xp         int  NOT NULL DEFAULT 0,
  streak     int  NOT NULL DEFAULT 0,
  wins       int  NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users can read own profile" ON profiles;
DROP POLICY IF EXISTS "users can update own profile" ON profiles;
CREATE POLICY "users can read own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 使用者單字學習狀態
CREATE TABLE IF NOT EXISTS user_word_status (
  id             serial PRIMARY KEY,
  user_id        uuid REFERENCES profiles(id) ON DELETE CASCADE,
  word_id        int  REFERENCES words(id)    ON DELETE CASCADE,
  status         text NOT NULL DEFAULT 'new',   -- new | learning | mastered
  correct_streak int  NOT NULL DEFAULT 0,
  next_review_at timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now(),
  UNIQUE(user_id, word_id)
);
ALTER TABLE user_word_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own word status" ON user_word_status;
CREATE POLICY "users manage own word status"
  ON user_word_status FOR ALL USING (auth.uid() = user_id);

-- 閱讀文章
CREATE TABLE IF NOT EXISTS articles (
  id         serial PRIMARY KEY,
  title      text    NOT NULL,
  content    text    NOT NULL DEFAULT '',
  emoji      text    NOT NULL DEFAULT '📖',
  tag        text    NOT NULL DEFAULT '精選',
  locked     boolean NOT NULL DEFAULT false,
  year       int,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "articles are public" ON articles;
CREATE POLICY "articles are public" ON articles FOR SELECT USING (true);

-- PVP 對局紀錄
CREATE TABLE IF NOT EXISTS pvp_matches (
  id         serial PRIMARY KEY,
  player1_id uuid REFERENCES profiles(id),
  player2_id uuid REFERENCES profiles(id),
  winner_id  uuid REFERENCES profiles(id),
  score_p1   int  NOT NULL DEFAULT 0,
  score_p2   int  NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE pvp_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "players can read own matches" ON pvp_matches;
CREATE POLICY "players can read own matches"
  ON pvp_matches FOR SELECT
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- ── STEP 3：更新 100 個單字的音標與 tags ─────────────────────

UPDATE words SET phonetic = '/ˈeɪbəl/',       tags = ARRAY['cap_2000','基礎'] WHERE word = 'able';
UPDATE words SET phonetic = '/ˈæbsəns/',       tags = ARRAY['cap_2000','進階'] WHERE word = 'absence';
UPDATE words SET phonetic = '/əkˈsept/',       tags = ARRAY['cap_2000','基礎'] WHERE word = 'accept';
UPDATE words SET phonetic = '/ˈæksɪdənt/',     tags = ARRAY['cap_2000','基礎'] WHERE word = 'accident';
UPDATE words SET phonetic = '/əˈtʃiːv/',       tags = ARRAY['cap_2000','基礎'] WHERE word = 'achieve';
UPDATE words SET phonetic = '/ˈækʃən/',         tags = ARRAY['cap_2000','基礎'] WHERE word = 'action';
UPDATE words SET phonetic = '/ˈæktʃuəli/',     tags = ARRAY['cap_2000','基礎'] WHERE word = 'actually';
UPDATE words SET phonetic = '/ˈædʌlt/',         tags = ARRAY['cap_2000','基礎'] WHERE word = 'adult';
UPDATE words SET phonetic = '/ədˈvaɪs/',        tags = ARRAY['cap_2000','基礎'] WHERE word = 'advice';
UPDATE words SET phonetic = '/əˈfɔːrd/',        tags = ARRAY['cap_2000','基礎'] WHERE word = 'afford';
UPDATE words SET phonetic = '/əˈɡriː/',         tags = ARRAY['cap_2000','基礎'] WHERE word = 'agree';
UPDATE words SET phonetic = '/əˈlaʊ/',          tags = ARRAY['cap_2000','基礎'] WHERE word = 'allow';
UPDATE words SET phonetic = '/ˈɔːlməʊst/',     tags = ARRAY['cap_2000','基礎'] WHERE word = 'almost';
UPDATE words SET phonetic = '/əˈləʊn/',         tags = ARRAY['cap_2000','基礎'] WHERE word = 'alone';
UPDATE words SET phonetic = '/ɔːlˈðəʊ/',       tags = ARRAY['cap_2000','基礎'] WHERE word = 'although';
UPDATE words SET phonetic = '/əˈmaʊnt/',        tags = ARRAY['cap_2000','基礎'] WHERE word = 'amount';
UPDATE words SET phonetic = '/ˈæŋɡri/',         tags = ARRAY['cap_2000','基礎'] WHERE word = 'angry';
UPDATE words SET phonetic = '/ˈænɪməl/',        tags = ARRAY['cap_2000','基礎'] WHERE word = 'animal';
UPDATE words SET phonetic = '/əˈnʌðər/',        tags = ARRAY['cap_2000','基礎'] WHERE word = 'another';
UPDATE words SET phonetic = '/əˈpɪər/',         tags = ARRAY['cap_2000','基礎'] WHERE word = 'appear';
UPDATE words SET phonetic = '/əˈtenʃən/',       tags = ARRAY['cap_2000','基礎'] WHERE word = 'attention';
UPDATE words SET phonetic = '/ˈætɪtjuːd/',     tags = ARRAY['cap_2000','進階'] WHERE word = 'attitude';
UPDATE words SET phonetic = '/əˈvɔɪd/',         tags = ARRAY['cap_2000','基礎'] WHERE word = 'avoid';
UPDATE words SET phonetic = '/bɪˈlɒŋ/',         tags = ARRAY['cap_2000','基礎'] WHERE word = 'belong';
UPDATE words SET phonetic = '/ˈbenɪfɪt/',       tags = ARRAY['cap_2000','進階'] WHERE word = 'benefit';
UPDATE words SET phonetic = '/bɪˈliːv/',        tags = ARRAY['cap_2000','高頻'] WHERE word = 'believe';
UPDATE words SET phonetic = '/ˈbɔːrɪŋ/',        tags = ARRAY['cap_2000','基礎'] WHERE word = 'boring';
UPDATE words SET phonetic = '/ˈbɒðər/',         tags = ARRAY['cap_2000','進階'] WHERE word = 'bother';
UPDATE words SET phonetic = '/breɪv/',           tags = ARRAY['cap_2000','基礎'] WHERE word = 'brave';
UPDATE words SET phonetic = '/breθ/',            tags = ARRAY['cap_2000','基礎'] WHERE word = 'breath';
UPDATE words SET phonetic = '/kɑːm/',            tags = ARRAY['cap_2000','基礎'] WHERE word = 'calm';
UPDATE words SET phonetic = '/ˈkeəfəl/',        tags = ARRAY['cap_2000','基礎'] WHERE word = 'careful';
UPDATE words SET phonetic = '/kɔːz/',            tags = ARRAY['cap_2000','基礎'] WHERE word = 'cause';
UPDATE words SET phonetic = '/ˈsɜːrtən/',       tags = ARRAY['cap_2000','基礎'] WHERE word = 'certain';
UPDATE words SET phonetic = '/tʃɑːns/',          tags = ARRAY['cap_2000','高頻'] WHERE word = 'chance';
UPDATE words SET phonetic = '/tʃeɪndʒ/',        tags = ARRAY['cap_2000','高頻'] WHERE word = 'change';
UPDATE words SET phonetic = '/ˈkærɪktər/',      tags = ARRAY['cap_2000','進階'] WHERE word = 'character';
UPDATE words SET phonetic = '/tʃɔɪs/',          tags = ARRAY['cap_2000','基礎'] WHERE word = 'choice';
UPDATE words SET phonetic = '/kəˈlekt/',        tags = ARRAY['cap_2000','基礎'] WHERE word = 'collect';
UPDATE words SET phonetic = '/ˈkʌmftəbəl/',    tags = ARRAY['cap_2000','基礎'] WHERE word = 'comfortable';
UPDATE words SET phonetic = '/kəˈmjuːnɪkeɪt/',tags = ARRAY['cap_2000','進階'] WHERE word = 'communicate';
UPDATE words SET phonetic = '/kəmˈpeər/',       tags = ARRAY['cap_2000','基礎'] WHERE word = 'compare';
UPDATE words SET phonetic = '/kəmˈpliːt/',      tags = ARRAY['cap_2000','基礎'] WHERE word = 'complete';
UPDATE words SET phonetic = '/kənˈdɪʃən/',      tags = ARRAY['cap_2000','進階'] WHERE word = 'condition';
UPDATE words SET phonetic = '/ˈkɒnfɪdənt/',    tags = ARRAY['cap_2000','基礎'] WHERE word = 'confident';
UPDATE words SET phonetic = '/kəˈnekt/',        tags = ARRAY['cap_2000','基礎'] WHERE word = 'connect';
UPDATE words SET phonetic = '/kənˈsɪdər/',      tags = ARRAY['cap_2000','進階'] WHERE word = 'consider';
UPDATE words SET phonetic = '/kənˈtɪnjuː/',     tags = ARRAY['cap_2000','基礎'] WHERE word = 'continue';
UPDATE words SET phonetic = '/kənˈtrəʊl/',      tags = ARRAY['cap_2000','基礎'] WHERE word = 'control';
UPDATE words SET phonetic = '/kəˈrekt/',        tags = ARRAY['cap_2000','基礎'] WHERE word = 'correct';
UPDATE words SET phonetic = '/kriˈeɪt/',        tags = ARRAY['cap_2000','基礎'] WHERE word = 'create';
UPDATE words SET phonetic = '/ˈkʌltʃər/',       tags = ARRAY['cap_2000','進階'] WHERE word = 'culture';
UPDATE words SET phonetic = '/dɪˈsaɪd/',        tags = ARRAY['cap_2000','基礎'] WHERE word = 'decide';
UPDATE words SET phonetic = '/dɪˈskraɪb/',      tags = ARRAY['cap_2000','基礎'] WHERE word = 'describe';
UPDATE words SET phonetic = '/dɪˈveləp/',       tags = ARRAY['cap_2000','進階'] WHERE word = 'develop';
UPDATE words SET phonetic = '/ˈdɪfrənt/',       tags = ARRAY['cap_2000','高頻'] WHERE word = 'different';
UPDATE words SET phonetic = '/ˈdɪfɪkəlt/',     tags = ARRAY['cap_2000','基礎'] WHERE word = 'difficult';
UPDATE words SET phonetic = '/dɪˈskʌvər/',      tags = ARRAY['cap_2000','會考必考'] WHERE word = 'discover';
UPDATE words SET phonetic = '/dɪˈskʌs/',        tags = ARRAY['cap_2000','基礎'] WHERE word = 'discuss';
UPDATE words SET phonetic = '/dɪˈziːz/',        tags = ARRAY['cap_2000','進階'] WHERE word = 'disease';
UPDATE words SET phonetic = '/driːm/',           tags = ARRAY['cap_2000','基礎'] WHERE word = 'dream';
UPDATE words SET phonetic = '/ɜːrθ/',           tags = ARRAY['cap_2000','基礎'] WHERE word = 'earth';
UPDATE words SET phonetic = '/ˌedʒuˈkeɪʃən/', tags = ARRAY['cap_2000','進階'] WHERE word = 'education';
UPDATE words SET phonetic = '/ɪˈfekt/',         tags = ARRAY['cap_2000','進階'] WHERE word = 'effect';
UPDATE words SET phonetic = '/ˈenədʒi/',        tags = ARRAY['cap_2000','高頻'] WHERE word = 'energy';
UPDATE words SET phonetic = '/ɪnˈvaɪrənmənt/', tags = ARRAY['cap_2000','進階'] WHERE word = 'environment';
UPDATE words SET phonetic = '/ɪˈspeʃəli/',     tags = ARRAY['cap_2000','基礎'] WHERE word = 'especially';
UPDATE words SET phonetic = '/ɪɡˈzɑːmpəl/',   tags = ARRAY['cap_2000','基礎'] WHERE word = 'example';
UPDATE words SET phonetic = '/ˈeksələnt/',      tags = ARRAY['cap_2000','基礎'] WHERE word = 'excellent';
UPDATE words SET phonetic = '/ɪkˈspɪəriəns/', tags = ARRAY['cap_2000','高頻'] WHERE word = 'experience';
UPDATE words SET phonetic = '/ɪkˈspleɪn/',     tags = ARRAY['cap_2000','基礎'] WHERE word = 'explain';
UPDATE words SET phonetic = '/feɪl/',           tags = ARRAY['cap_2000','基礎'] WHERE word = 'fail';
UPDATE words SET phonetic = '/ˈfeɪməs/',        tags = ARRAY['cap_2000','基礎'] WHERE word = 'famous';
UPDATE words SET phonetic = '/fiːl/',           tags = ARRAY['cap_2000','基礎'] WHERE word = 'feel';
UPDATE words SET phonetic = '/ˈfaɪnəli/',       tags = ARRAY['cap_2000','基礎'] WHERE word = 'finally';
UPDATE words SET phonetic = '/ˈfəʊkəs/',        tags = ARRAY['cap_2000','基礎'] WHERE word = 'focus';
UPDATE words SET phonetic = '/ˈfɒrən/',         tags = ARRAY['cap_2000','基礎'] WHERE word = 'foreign';
UPDATE words SET phonetic = '/fəˈɡet/',         tags = ARRAY['cap_2000','基礎'] WHERE word = 'forget';
UPDATE words SET phonetic = '/ˈfriːdəm/',       tags = ARRAY['cap_2000','進階'] WHERE word = 'freedom';
UPDATE words SET phonetic = '/ˈfrendli/',       tags = ARRAY['cap_2000','基礎'] WHERE word = 'friendly';
UPDATE words SET phonetic = '/ˈfjuːtʃər/',      tags = ARRAY['cap_2000','基礎'] WHERE word = 'future';
UPDATE words SET phonetic = '/ɡəʊl/',           tags = ARRAY['cap_2000','基礎'] WHERE word = 'goal';
UPDATE words SET phonetic = '/ˈɡʌvənmənt/',    tags = ARRAY['cap_2000','進階'] WHERE word = 'government';
UPDATE words SET phonetic = '/ˈɡreɪtfəl/',     tags = ARRAY['cap_2000','進階'] WHERE word = 'grateful';
UPDATE words SET phonetic = '/ɡrəʊ/',           tags = ARRAY['cap_2000','基礎'] WHERE word = 'grow';
UPDATE words SET phonetic = '/ˈhæbɪt/',         tags = ARRAY['cap_2000','高頻'] WHERE word = 'habit';
UPDATE words SET phonetic = '/ˈhæpən/',         tags = ARRAY['cap_2000','基礎'] WHERE word = 'happen';
UPDATE words SET phonetic = '/helθ/',           tags = ARRAY['cap_2000','高頻'] WHERE word = 'health';
UPDATE words SET phonetic = '/ˈhelpfəl/',       tags = ARRAY['cap_2000','基礎'] WHERE word = 'helpful';
UPDATE words SET phonetic = '/ˈɒnɪst/',         tags = ARRAY['cap_2000','基礎'] WHERE word = 'honest';
UPDATE words SET phonetic = '/haʊˈevər/',       tags = ARRAY['cap_2000','基礎'] WHERE word = 'however';
UPDATE words SET phonetic = '/ɪˈmædʒɪn/',      tags = ARRAY['cap_2000','基礎'] WHERE word = 'imagine';
UPDATE words SET phonetic = '/ɪmˈpruːv/',       tags = ARRAY['cap_2000','高頻'] WHERE word = 'improve';
UPDATE words SET phonetic = '/ɪnˈkluːd/',       tags = ARRAY['cap_2000','基礎'] WHERE word = 'include';
UPDATE words SET phonetic = '/ˈɪnfluəns/',      tags = ARRAY['cap_2000','進階'] WHERE word = 'influence';
UPDATE words SET phonetic = '/ˈɪntrəst/',       tags = ARRAY['cap_2000','基礎'] WHERE word = 'interest';
UPDATE words SET phonetic = '/ˌɪntrəˈdjuːs/',  tags = ARRAY['cap_2000','基礎'] WHERE word = 'introduce';
UPDATE words SET phonetic = '/ɪnˈvaɪt/',        tags = ARRAY['cap_2000','基礎'] WHERE word = 'invite';
UPDATE words SET phonetic = '/ˈaɪlənd/',        tags = ARRAY['cap_2000','基礎'] WHERE word = 'island';
UPDATE words SET phonetic = '/ˈdʒɜːrni/',       tags = ARRAY['cap_2000','進階'] WHERE word = 'journey';

-- ── STEP 4：插入閱讀文章 ─────────────────────────────────────

INSERT INTO articles (title, content, emoji, tag, locked, year) VALUES
(
  'The Power of Habit',
  'A habit is a behavior that you repeat regularly and do without thinking about it. According to research, about 43% of what we do every day happens because of habits, not because we decide to do it. Habits can be good, like exercising every day, or bad, like eating too many snacks. The interesting thing is that habits become automatic in our brains over time, so we don''t need to use willpower to do them.

Every habit follows a simple pattern called the habit loop. It has three parts: the cue, the routine, and the reward. First, a cue is something that triggers your habit—like finishing homework or feeling stressed. Next, the routine is the actual habit you do. Finally, the reward is what you get from doing the habit, which makes you want to do it again. For example, if you feel bored (cue), you might check your phone (routine), and this makes you feel happy (reward).

To build good habits, you need to repeat the same behavior in the same situation many times. Research shows it takes about 66 days on average for a new behavior to become automatic. The key is consistency—doing your habit at the same time and place every day helps your brain learn it faster. If you want to replace a bad habit with a good one, you can keep the same cue and reward but change the routine to something healthier.',
  '🌿', '精選', false, null
),
(
  'Ocean Plastic Pollution',
  'Plastic pollution is one of the biggest challenges facing our oceans today. Every year, millions of tons of plastic waste end up in the sea. Much of this plastic comes from everyday items like bottles, bags, and fishing nets that people throw away or lose. The problem keeps getting worse because plastic breaks down very slowly in the ocean, sometimes taking hundreds of years.

This pollution harms marine animals in many ways. Fish, dolphins, sea turtles, and seabirds can get trapped in plastic nets or swallow plastic pieces, which can make them sick or kill them. Additionally, tiny plastic particles called microplastics are now found everywhere in the ocean, even in drinking water and the food we eat. Scientists worry that microplastics may affect our health too.

We can help reduce this problem by making better choices every day. We should use less plastic, recycle more, and dispose of waste properly so it doesn''t reach the ocean. Supporting companies that use sustainable packaging and participating in beach cleanups are also helpful actions. Through awareness and individual effort, we can work together to protect our oceans for future generations.',
  '🌊', '精選', false, null
),
(
  '2023 會考閱讀理解',
  'Dear Lisa,

I am writing to thank you for your help last month. When I first arrived in Taiwan, I felt lost and nervous. I could not speak Chinese, and everything was different from my home country.

You were the first person to speak to me in English. You helped me find the school office and showed me around the campus. Your kindness made a huge difference.

Now I have many friends and I love studying here. I hope we can stay in touch. Please come visit me someday.

Your friend,
Sarah',
  '📖', '歷屆', false, 2023
),
(
  'Benefits of Exercise',
  'Exercise is physical activity that helps your body stay strong and healthy. It can improve your fitness, help you maintain a good weight, and make your bones and muscles stronger. Beyond physical benefits, exercise is very good for your mental health too. Studies show that regular activity makes you feel happier, reduces stress, and helps you sleep better. Even small amounts of exercise help—adding just a few minutes of activity each day reduces the risk of early death.

There are three main types of exercise. Aerobic exercise uses large muscles and includes running, cycling, and swimming. Anaerobic exercise builds muscle strength through activities like weight lifting and push-ups. Flexibility exercises, such as stretching, help keep your joints moving well and prevent injuries. You can choose any type that you enjoy, and mixing different types is ideal for complete fitness.

Health experts recommend about 150 minutes of moderate exercise each week. This might seem like a lot, but you can spread it throughout the week. Young people should aim for 60 minutes daily. The most important thing is to find activities you like and do them regularly—consistency is the real secret to a healthy life.',
  '🏃', '精選', false, null
)
(
  'Climate Change and Our Future',
  'Climate change means the ongoing increase in global average temperature and its effects on Earth. It happens mainly because humans burn fossil fuels like coal and oil, which release gases that trap heat in our atmosphere. These greenhouse gases act like a blanket around Earth, making our planet warmer each year. Scientists agree that this is one of the most serious challenges facing humanity today.

Climate change causes serious problems for our environment. We see more frequent heat waves and wildfires. Ocean levels are rising, which threatens coastal cities. Arctic ice is melting, and many animal species cannot survive in warmer conditions. Weather is becoming more extreme with stronger storms and longer droughts. These changes damage nature and make life harder for people everywhere.

Young people can help fight climate change in many ways. You can learn about clean energy like solar and wind power. Reduce waste by recycling and using less plastic. Use public transport or bicycles instead of cars. Most importantly, talk to your friends and family about why climate change matters. Young people have the power to create real change for a better future.',
  '🌍', '精選', false, null
),
(
  'Taiwan: A Beautiful Island',
  'Taiwan is an island in East Asia, located between the East and South China Seas. The main island measures about 36,000 square kilometers. Mountain ranges cover most of the eastern part, while the western plains are home to most of the population. The island has a subtropical climate with warm weather for most of the year and beautiful natural landscapes that attract visitors from around the world.

The people of Taiwan have a rich cultural heritage. With nearly 24 million inhabitants, Taiwan is quite densely populated. Most people speak Mandarin Chinese, but many also use Taiwanese Hokkien and other local languages in daily conversation. Buddhism, Taoism, and folk religions are important to many people''s lives, and colorful temples can be found in cities and towns across the island.

Taiwanese food is delicious and famous worldwide. Night markets are central to daily life, offering snacks like dumplings, noodle soups, scallion pancakes, and bubble tea. People enjoy fresh seafood, rice dishes, and a wide variety of vegetables. Meals often bring families together, and eating out at affordable local restaurants is a popular activity. Traditional festivals feature special foods that connect people to their history and culture.',
  '🏝️', '精選', false, null
),
(
  '2022 會考閱讀理解',
  '',
  '🤖', '歷屆', true, 2022
)
ON CONFLICT DO NOTHING;

-- ── 完成確認 ────────────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM words WHERE phonetic IS NOT NULL) AS words_with_phonetics,
  (SELECT COUNT(*) FROM articles) AS total_articles,
  (SELECT COUNT(*) FROM profiles) AS total_profiles;
