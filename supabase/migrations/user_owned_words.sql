alter table public.words
  add column if not exists owner_id uuid references auth.users(id) on delete cascade;

create index if not exists words_owner_id_idx on public.words(owner_id);

drop policy if exists "words are publicly readable" on public.words;
drop policy if exists "Public words are readable" on public.words;
drop policy if exists "Readable words" on public.words;
create policy "Readable words"
  on public.words for select
  using (owner_id is null or owner_id = auth.uid());

revoke insert, update, delete on public.words from anon, authenticated;
