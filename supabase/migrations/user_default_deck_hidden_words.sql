-- 每位使用者可隱藏官方預設卡組中的單字；官方 words 資料不會被刪除。
create table if not exists public.user_default_deck_hidden_words (
  user_id uuid not null references public.profiles(id) on delete cascade,
  word_id integer not null references public.words(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, word_id)
);

alter table public.user_default_deck_hidden_words enable row level security;

drop policy if exists "users manage own hidden default words"
  on public.user_default_deck_hidden_words;
create policy "users manage own hidden default words"
  on public.user_default_deck_hidden_words for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.user_default_deck_additions (
  user_id uuid not null references auth.users(id) on delete cascade,
  deck_id text not null check (deck_id = 'cap2000' or deck_id ~ '^unit([1-9]|[12][0-9]|3[0-2])$'),
  word_id bigint not null references public.words(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, deck_id, word_id)
);
alter table public.user_default_deck_additions enable row level security;
drop policy if exists "users manage own default additions" on public.user_default_deck_additions;
create policy "users manage own default additions" on public.user_default_deck_additions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, delete on public.user_default_deck_hidden_words to authenticated;
