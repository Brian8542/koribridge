-- ============================================================
-- KoriBridge Admin 스키마 업데이트
-- Supabase Dashboard → SQL Editor 에서 실행하세요
-- ============================================================

-- 1. profiles 테이블에 is_admin 컬럼 추가
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- 2. reports 테이블에 상태 컬럼 추가
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz DEFAULT NULL;

-- 3. 관리자가 모든 신고를 조회할 수 있도록 RLS 정책 추가
CREATE POLICY "Admins can select all reports"
  ON public.reports FOR SELECT
  USING (
    auth.uid() = reporter_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 4. 관리자가 신고 상태를 업데이트할 수 있도록 RLS 정책 추가
CREATE POLICY "Admins can update reports"
  ON public.reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 5. 관리자가 모든 프로필을 수정할 수 있도록 RLS 정책 추가
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 6. 관리자가 차단할 수 있도록 blocked_users 정책 추가
CREATE POLICY "Admins can insert blocked users"
  ON public.blocked_users FOR INSERT
  WITH CHECK (
    auth.uid() = blocker_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================================
-- 초기 관리자 지정 방법 (직접 SQL 실행)
-- 아래 <user_id>를 실제 유저 UUID로 교체하세요
-- Supabase → Authentication → Users 에서 UUID 확인 가능
-- ============================================================
-- UPDATE public.profiles SET is_admin = true WHERE id = '<user_id>';
