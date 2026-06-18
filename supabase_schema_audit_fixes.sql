-- ============================================================
-- KoriBridge 안정성 점검 패치 (2026-06-18)
-- Supabase Dashboard → SQL Editor 에서 실행하세요
-- 이 파일은 기존 supabase_schema*.sql 실행을 모두 마친 뒤에 실행해야 합니다.
-- 모든 구문은 멱등(idempotent)하며 기존 데이터를 삭제/변경하지 않습니다.
-- ============================================================

-- 1. profiles.is_verified 컬럼 누락 — ProfileSetupPage.jsx의 upsert가
--    이 컬럼을 보내는데 테이블에 컬럼이 없어 프로필 저장(최초 가입 온보딩) 자체가
--    전부 실패하는 심각한 버그였습니다. 즉시 실행 필요.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- 2. reports.detail 컬럼 누락 — supabase_safety_tables.sql의
--    "CREATE TABLE IF NOT EXISTS public.reports (...)" 는 reports 테이블이
--    이미 존재하는 상태(schema_update.sql 에서 먼저 생성됨)에서는 아무 효과가
--    없어 detail 컬럼이 실제로는 추가되지 않았습니다.
--    ReportModal.jsx가 매번 detail을 insert payload에 포함하므로 신고 제출이
--    전부 실패하는 버그였습니다.
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS detail text;

-- 3. messages 테이블에 DELETE 정책이 한 번도 추가된 적이 없었습니다.
--    RLS가 켜진 상태에서 정책이 없으면 DELETE는 항상 0 rows affected로
--    "성공"하지만 실제로는 아무것도 지워지지 않습니다 (ChatPage.jsx의
--    메시지 삭제 기능이 사용자에게는 성공한 것처럼 보이지만 새로고침하면
--    메시지가 다시 나타나는 버그).
DROP POLICY IF EXISTS "Users can delete own messages" ON public.messages;
CREATE POLICY "Users can delete own messages"
  ON public.messages FOR DELETE
  USING (auth.uid() = sender_id);

-- 4. profiles 테이블에도 DELETE 정책이 한 번도 추가된 적이 없었습니다.
--    DeleteAccountModal.jsx가 호출하는 "계정 삭제"가 실제로는 프로필 행을
--    전혀 지우지 못하고 그냥 로그아웃만 시키는 상태였습니다 (개인정보 삭제
--    요청을 처리하지 못하는 심각한 신뢰/프라이버시 문제).
--    주의: 이 정책을 추가해도 auth.users 행 자체는 지워지지 않습니다.
--    완전한 계정 삭제(인증 계정 포함)는 service_role 권한이 필요한 별도의
--    Edge Function이 있어야 하며, 이번 점검에서는 위험도가 높아 자동으로
--    배포하지 않았습니다 — 8번 보고서의 "남은 위험요소"를 확인하세요.
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- 5. messages / profiles UPDATE 정책에 WITH CHECK가 없어, 만약 향후
--    prevent_unsafe_message_update / prevent_self_admin_change 트리거가
--    실수로 삭제되거나 비활성화되면 RLS만으로는 sender_id 위조나 self-admin
--    승격을 막지 못합니다. 트리거가 1차 방어선이고 이 정책은 2차 방어선
--    (defense-in-depth)입니다.
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
CREATE POLICY "Users can update own messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update message read status" ON public.messages;
CREATE POLICY "Users can update message read status"
  ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.current_user_is_admin())
  WITH CHECK (auth.uid() = id OR public.current_user_is_admin());

-- 6. 차단(blocked_users)이 메시지 전송을 실제로 막지 못하고 있었습니다.
--    "Users can view profiles excluding blocked" 정책은 차단한 사람을
--    홈/스와이프 목록에서만 숨길 뿐이고, messages INSERT 정책은
--    auth.uid() = sender_id 만 검사해서 차단된 상대가 ChatPage URL을
--    직접 알면(/chat/:partnerId) 계속 메시지를 보낼 수 있었습니다
--    (양방향 모두). 신고/차단 안전 기능의 핵심 전제가 깨져 있던 상태라
--    가장 먼저 막아야 할 항목입니다.
DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;
CREATE POLICY "Users can insert messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND NOT EXISTS (
      SELECT 1 FROM public.blocked_users
      WHERE (blocker_id = sender_id AND blocked_id = receiver_id)
         OR (blocker_id = receiver_id AND blocked_id = sender_id)
    )
  );
