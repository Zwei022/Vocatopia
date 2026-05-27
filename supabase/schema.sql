-- ============================================================
-- Vocatopia Migration — 適配現有 words 表 + 建立缺少的表
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. 補齊 words 表缺少的欄位
alter table words add column if not exists phonetic text;
alter table words add column if not exists tags     text[] not null default '{}';

-- 依 level 自動補上 tags（可之後手動細調）
update words set tags = array['cap_2000', 'Level 1'] where level = 1 and tags = '{}';
update words set tags = array['cap_2000', 'Level 2'] where level = 2 and tags = '{}';

-- 2. 使用者資料（擴充 Supabase Auth）
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text unique not null,
  xp         int  not null default 0,
  streak     int  not null default 0,
  wins       int  not null default 0,
  created_at timestamptz default now()
);
alter table profiles enable row level security;

create policy "users can read own profile"
  on profiles for select using (auth.uid() = id);
create policy "users can update own profile"
  on profiles for update using (auth.uid() = id);

-- 3. 使用者單字學習狀態
create table if not exists user_word_status (
  id             serial primary key,
  user_id        uuid references profiles(id) on delete cascade,
  word_id        int  references words(id)    on delete cascade,
  status         text not null default 'new', -- new | learning | mastered
  correct_streak int  not null default 0,
  next_review_at timestamptz default now(),
  updated_at     timestamptz default now(),
  unique(user_id, word_id)
);
alter table user_word_status enable row level security;

create policy "users manage own word status"
  on user_word_status for all using (auth.uid() = user_id);

-- 4. 閱讀文章
create table if not exists articles (
  id         serial primary key,
  title      text    not null,
  content    text    not null default '',
  emoji      text    not null default '📖',
  tag        text    not null default '精選',
  locked     boolean not null default false,
  year       int,
  created_at timestamptz default now()
);
alter table articles enable row level security;

create policy "articles are public"
  on articles for select using (true);

-- 5. PVP 對局紀錄
create table if not exists pvp_matches (
  id         serial primary key,
  player1_id uuid references profiles(id),
  player2_id uuid references profiles(id),
  winner_id  uuid references profiles(id),
  score_p1   int  not null default 0,
  score_p2   int  not null default 0,
  created_at timestamptz default now()
);
alter table pvp_matches enable row level security;

create policy "players can read own matches"
  on pvp_matches for select
  using (auth.uid() = player1_id or auth.uid() = player2_id);
