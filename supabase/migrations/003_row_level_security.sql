-- Включаем RLS для всех таблиц
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.tags enable row level security;
alter table public.categories enable row level security;
alter table public.post_tags enable row level security;
alter table public.post_categories enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;

-- Политики для profiles
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Политики для posts
create policy "Published posts are viewable by everyone"
  on public.posts for select
  using (status = 'published');

create policy "Editors can create posts"
  on public.posts for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('editor', 'admin')
    )
  );

create policy "Authors can update own posts"
  on public.posts for update
  using (author_id = auth.uid());

-- Остальные политики безопасности... 