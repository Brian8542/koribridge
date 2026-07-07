-- ============================================================
-- KoriBridge — v2.1 마이그레이션 (supabase_profile_prompts.sql 이후 실행)
-- 내용:
--   1) profiles.photos : 다중 프로필 사진 갤러리 (jsonb, URL 배열, 최대 6장)
--   2) favorites INSERT 트리거 → 좋아요/매칭 알림 자동 생성
--      (클라이언트 임의 알림 생성 경로를 대체하는 서버 권위 방식)
-- 모든 구문은 idempotent 하게 작성되어 여러 번 실행해도 안전합니다.
-- ============================================================

-- 1) profiles.photos
--    형식: ["https://.../gallery-1.jpg", ...] (avatar_url 외 추가 사진, 최대 6장 — 클라이언트에서 검증)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS photos jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 2) 좋아요/매칭 알림 트리거
--    SECURITY DEFINER: RLS를 우회해 상대방 알림 행을 서버가 직접 생성.
--    payload 는 favorites.liked_content 를 그대로 사용하되 검증된 키만 통과시킵니다.
CREATE OR REPLACE FUNCTION public.handle_favorite_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_mutual boolean;
  safe_payload jsonb;
BEGIN
  IF NEW.user_id = NEW.partner_id THEN
    RETURN NEW;
  END IF;

  -- liked_content 에서 허용된 키만 추출 (type / prompt_id / answer / photo_index)
  safe_payload := jsonb_strip_nulls(jsonb_build_object(
    'type', COALESCE(NEW.liked_content->>'type', 'profile'),
    'prompt_id', NEW.liked_content->>'prompt_id',
    'answer', left(NEW.liked_content->>'answer', 120),
    'photo_index', NEW.liked_content->'photo_index'
  ));

  INSERT INTO public.notifications (user_id, actor_id, type, payload)
  VALUES (NEW.partner_id, NEW.user_id, 'like', safe_payload);

  SELECT EXISTS (
    SELECT 1 FROM public.favorites
    WHERE user_id = NEW.partner_id AND partner_id = NEW.user_id
  ) INTO is_mutual;

  IF is_mutual THEN
    INSERT INTO public.notifications (user_id, actor_id, type, payload)
    VALUES
      (NEW.partner_id, NEW.user_id, 'match', '{}'::jsonb),
      (NEW.user_id, NEW.partner_id, 'match', '{}'::jsonb);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_favorite_notification ON public.favorites;
CREATE TRIGGER trg_favorite_notification
  AFTER INSERT ON public.favorites
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_favorite_notification();

-- 트리거가 알림을 생성하므로 클라이언트 직접 insert 정책은 더 이상 필요 없음.
-- (호환을 위해 정책 자체는 유지하되, 앱 코드는 v2.1부터 직접 insert 하지 않습니다.)
