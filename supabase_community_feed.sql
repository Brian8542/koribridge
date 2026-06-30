-- =============================================================
-- KoriBridge — Community Feed (Moments) schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- Requires: set_updated_at() function (from supabase_references.sql)
-- =============================================================

-- ── posts ──────────────────────────────────────────────────────
create table if not exists public.posts (
  id          bigint generated always as identity primary key,
  author_id   uuid not null references public.profiles(id) on delete cascade,
  content     text not null check (char_length(content) between 1 and 500),
  image_url   text,
  language    text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists idx_posts_author_id   on public.posts (author_id);
create index if not exists idx_posts_language    on public.posts (language);
create index if not exists idx_posts_created_at  on public.posts (created_at desc);

drop trigger if exists trg_posts_updated_at on public.posts;
create trigger trg_posts_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- ── post_likes ─────────────────────────────────────────────────
create table if not exists public.post_likes (
  id          bigint generated always as identity primary key,
  post_id     bigint not null references public.posts(id) on delete cascade,
  user_id     uuid   not null references public.profiles(id) on delete cascade,
  created_at  timestamptz default now(),
  unique (post_id, user_id)
);

create index if not exists idx_post_likes_post_id on public.post_likes (post_id);
create index if not exists idx_post_likes_user_id on public.post_likes (user_id);

-- ── post_comments ──────────────────────────────────────────────
create table if not exists public.post_comments (
  id              bigint generated always as identity primary key,
  post_id         bigint not null references public.posts(id) on delete cascade,
  author_id       uuid   not null references public.profiles(id) on delete cascade,
  content         text   not null check (char_length(content) between 1 and 500),
  is_correction   boolean not null default false,
  corrected_text  text,
  created_at      timestamptz default now()
);

create index if not exists idx_post_comments_post_id   on public.post_comments (post_id);
create index if not exists idx_post_comments_author_id on public.post_comments (author_id);

-- ── Row Level Security ─────────────────────────────────────────
alter table public.posts         enable row level security;
alter table public.post_likes    enable row level security;
alter table public.post_comments enable row level security;

-- posts
drop policy if exists "posts_select" on public.posts;
create policy "posts_select" on public.posts for select to authenticated using (true);

drop policy if exists "posts_insert" on public.posts;
create policy "posts_insert" on public.posts for insert to authenticated
  with check (auth.uid() = author_id);

drop policy if exists "posts_update" on public.posts;
create policy "posts_update" on public.posts for update to authenticated
  using (auth.uid() = author_id) with check (auth.uid() = author_id);

drop policy if exists "posts_delete" on public.posts;
create policy "posts_delete" on public.posts for delete to authenticated
  using (auth.uid() = author_id);

-- post_likes
drop policy if exists "post_likes_select" on public.post_likes;
create policy "post_likes_select" on public.post_likes for select to authenticated using (true);

drop policy if exists "post_likes_insert" on public.post_likes;
create policy "post_likes_insert" on public.post_likes for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "post_likes_delete" on public.post_likes;
create policy "post_likes_delete" on public.post_likes for delete to authenticated
  using (auth.uid() = user_id);

-- post_comments
drop policy if exists "post_comments_select" on public.post_comments;
create policy "post_comments_select" on public.post_comments for select to authenticated using (true);

drop policy if exists "post_comments_insert" on public.post_comments;
create policy "post_comments_insert" on public.post_comments for insert to authenticated
  with check (auth.uid() = author_id);

drop policy if exists "post_comments_update" on public.post_comments;
create policy "post_comments_update" on public.post_comments for update to authenticated
  using (auth.uid() = author_id) with check (auth.uid() = author_id);

drop policy if exists "post_comments_delete" on public.post_comments;
create policy "post_comments_delete" on public.post_comments for delete to authenticated
  using (auth.uid() = author_id);

-- ── Storage: community-images bucket ──────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community-images',
  'community-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "community_images_select" on storage.objects;
create policy "community_images_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'community-images');

drop policy if exists "community_images_insert" on storage.objects;
create policy "community_images_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'community-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "community_images_delete" on storage.objects;
create policy "community_images_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'community-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
