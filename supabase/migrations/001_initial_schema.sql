-- Включаем необходимые расширения
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;

-- Создаем enum для ролей пользователей
create type user_role as enum ('reader', 'editor', 'admin');

-- Создаем таблицу профилей
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  bio text,
  email text unique not null,
  role user_role default 'reader' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Создаем таблицу тегов
create table public.tags (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Создаем таблицу категорий
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Создаем таблицу постов
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  content text not null,
  description text,
  cover_url text,
  author_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'draft' not null,
  views integer default 0 not null,
  likes_count integer default 0 not null,
  comments_count integer default 0 not null,
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  fts tsvector generated always as (
    setweight(to_tsvector('russian', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('russian', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('russian', coalesce(content, '')), 'C')
  ) stored
);

-- Создаем таблицу связей постов и тегов
create table public.post_tags (
  post_id uuid references public.posts(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- Создаем таблицу связей постов и категорий
create table public.post_categories (
  post_id uuid references public.posts(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  primary key (post_id, category_id)
);

-- Создаем таблицу лайков
create table public.post_likes (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (post_id, user_id)
);

-- Создаем таблицу комментариев
create table public.post_comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  parent_id uuid references public.post_comments(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Создаем индексы
create index posts_fts_idx on public.posts using gin(fts);
create index posts_author_id_idx on public.posts(author_id);
create index posts_created_at_idx on public.posts(created_at desc);
create index posts_status_idx on public.posts(status);
create index post_tags_post_id_idx on public.post_tags(post_id);
create index post_tags_tag_id_idx on public.post_tags(tag_id);
create index post_categories_post_id_idx on public.post_categories(post_id);
create index post_categories_category_id_idx on public.post_categories(category_id);
create index post_comments_post_id_idx on public.post_comments(post_id);
create index post_comments_user_id_idx on public.post_comments(user_id);
create index post_comments_parent_id_idx on public.post_comments(parent_id);

-- Создаем триггеры для обновления updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

create trigger handle_posts_updated_at
  before update on public.posts
  for each row
  execute function public.handle_updated_at();

create trigger handle_comments_updated_at
  before update on public.post_comments
  for each row
  execute function public.handle_updated_at();

-- Создаем триггер для обновления счетчиков
create or replace function public.handle_post_counters()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.posts
    set 
      likes_count = likes_count + 1
    where id = new.post_id;
  elsif (TG_OP = 'DELETE') then
    update public.posts
    set 
      likes_count = likes_count - 1
    where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger handle_post_likes_counter
  after insert or delete on public.post_likes
  for each row
  execute function public.handle_post_counters(); 