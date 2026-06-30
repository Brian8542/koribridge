-- =============================================================
-- KoriBridge — user_references schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- =============================================================

-- updated_at auto-trigger function (idempotent)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- user_references table
create table if not exists public.user_references (
  id          bigint generated always as identity primary key,
  author_id   uuid not null references public.profiles(id) on delete cascade,
  target_id   uuid not null references public.profiles(id) on delete cascade,
  rating      smallint not null check (rating between 1 and 5),
  content     text check (char_length(content) <= 500),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (author_id, target_id),
  check (author_id <> target_id)
);

-- Index for fast avg/count queries by target
create index if not exists idx_user_references_target_id
  on public.user_references (target_id);

-- updated_at auto-update trigger
drop trigger if exists trg_user_references_updated_at on public.user_references;
create trigger trg_user_references_updated_at
  before update on public.user_references
  for each row execute function public.set_updated_at();

-- =============================================================
-- Row Level Security
-- =============================================================
alter table public.user_references enable row level security;

-- SELECT: any authenticated user can read all references (public trust signal)
drop policy if exists "references_select" on public.user_references;
create policy "references_select"
  on public.user_references for select
  to authenticated
  using (true);

-- INSERT: must be own author_id AND a real message exchange must exist
drop policy if exists "references_insert" on public.user_references;
create policy "references_insert"
  on public.user_references for insert
  to authenticated
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.messages m
      where
        (m.sender_id = auth.uid() and m.receiver_id = target_id)
        or (m.sender_id = target_id and m.receiver_id = auth.uid())
      limit 1
    )
  );

-- UPDATE: only the author can update their own reference
drop policy if exists "references_update" on public.user_references;
create policy "references_update"
  on public.user_references for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- DELETE: only the author can delete their own reference
drop policy if exists "references_delete" on public.user_references;
create policy "references_delete"
  on public.user_references for delete
  to authenticated
  using (auth.uid() = author_id);
