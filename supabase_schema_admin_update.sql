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

-- 관리자 여부 확인 함수
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND is_admin = true
  );
$$;

-- 일반 사용자가 API를 우회해 is_admin 값을 바꾸지 못하도록 차단
CREATE OR REPLACE FUNCTION public.prevent_self_admin_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin
     AND auth.uid() IS NOT NULL
     AND NOT public.current_user_is_admin() THEN
    RAISE EXCEPTION 'Only admins can change is_admin';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_self_admin_change_on_profiles ON public.profiles;
CREATE TRIGGER prevent_self_admin_change_on_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_admin_change();

-- 3. 관리자가 모든 신고를 조회할 수 있도록 RLS 정책 추가
DROP POLICY IF EXISTS "Admins can select all reports" ON public.reports;
CREATE POLICY "Admins can select all reports"
  ON public.reports FOR SELECT
  USING (
    auth.uid() = reporter_id OR
    public.current_user_is_admin()
  );

-- 4. 관리자가 신고 상태를 업데이트할 수 있도록 RLS 정책 추가
DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;
CREATE POLICY "Admins can update reports"
  ON public.reports FOR UPDATE
  USING (public.current_user_is_admin());

-- 5. 관리자가 모든 프로필을 수정할 수 있도록 RLS 정책 추가
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() = id OR
    public.current_user_is_admin()
  );

-- 6. 관리자가 차단할 수 있도록 blocked_users 정책 추가
DROP POLICY IF EXISTS "Admins can insert blocked users" ON public.blocked_users;
CREATE POLICY "Admins can insert blocked users"
  ON public.blocked_users FOR INSERT
  WITH CHECK (
    auth.uid() = blocker_id OR
    public.current_user_is_admin()
  );

-- ============================================================
-- 초기 관리자 지정 방법 (직접 SQL 실행)
-- 아래 <user_id>를 실제 유저 UUID로 교체하세요
-- Supabase → Authentication → Users 에서 UUID 확인 가능
-- ============================================================
-- UPDATE public.profiles SET is_admin = true WHERE id = '<user_id>';
