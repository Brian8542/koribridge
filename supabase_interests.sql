-- =============================================================
-- KoriBridge — interests column GIN index + filter indexes
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- =============================================================

-- interests column already exists; this is idempotent and safe
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}';

-- GIN index for fast array-overlap queries (interest filter)
CREATE INDEX IF NOT EXISTS idx_profiles_interests
  ON public.profiles USING GIN (interests);

-- Index for verified-only filter
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified
  ON public.profiles (is_verified);

-- Index for native language filter
CREATE INDEX IF NOT EXISTS idx_profiles_native_language
  ON public.profiles (native_language);

-- Verify: no existing data is affected (interests defaults to {})
-- SELECT id, interests FROM public.profiles LIMIT 5;
