-- ============================================================
-- KoriBridge — Hinge-style redesign migration
-- 실행 위치: Supabase SQL Editor
-- 내용:
--   1) profiles.prompts        : 프로필 프롬프트 답변 (jsonb, 최대 3개)
--   2) profiles.last_seen_at   : 최근 접속 시각 (온라인/최근 활동 표시)
--   3) favorites.liked_content : 반응형 좋아요 대상 (사진/프롬프트)
--   4) notifications           : 알림 센터 테이블 + RLS
-- 모든 구문은 idempotent 하게 작성되어 여러 번 실행해도 안전합니다.
-- ============================================================

-- 1) profiles.prompts
--    형식: [{ "id": "why_korean", "answer": "..." }, ...] (최대 3개, 답변 300자 이하 — 클라이언트에서 검증)
--    수정 권한은 기존 profiles 의 "본인 행만 update" RLS 정책 범위에 포함됩니다.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS prompts jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 2) profiles.last_seen_at
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_profiles_last_seen_at
  ON public.profiles (last_seen_at DESC NULLS LAST);

-- 3) favorites.liked_content
--    형식: { "type": "photo" | "prompt" | "profile", "prompt_id": "...", "answer": "...", "message": "..." }
ALTER TABLE public.favorites
  ADD COLUMN IF NOT EXISTS liked_content jsonb;

-- 4) notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id   uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       text NOT NULL CHECK (type IN ('like', 'match', 'reference', 'system')),
  payload    jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON public.notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications (user_id)
  WHERE read_at IS NULL;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 본인 알림만 조회
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- 좋아요/매칭 등 행위자가 상대에게 알림 생성 (본인이 actor 인 행만 insert 가능)
DROP POLICY IF EXISTS "notifications_insert_as_actor" ON public.notifications;
CREATE POLICY "notifications_insert_as_actor"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = actor_id AND auth.uid() <> user_id);

-- 본인 알림만 읽음 처리 (user_id 변경 방지)
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 본인 알림만 삭제
DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
CREATE POLICY "notifications_delete_own"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);
