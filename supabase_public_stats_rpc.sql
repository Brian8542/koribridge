-- ============================================================
-- KoriBridge 공개 통계 RPC 함수
-- Supabase Dashboard → SQL Editor 에서 실행하세요
-- 개인정보를 집계 데이터로만 반환하며, anon(비로그인) 사용자도 호출 가능합니다.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_users', (
      SELECT count(*)::int FROM profiles WHERE is_public = true
    ),
    'verified_count', (
      SELECT count(*)::int FROM profiles WHERE is_verified = true AND is_public = true
    ),
    'joined_this_month', (
      SELECT count(*)::int FROM profiles
      WHERE created_at >= date_trunc('month', now()) AND is_public = true
    ),
    'nationality_dist', (
      SELECT coalesce(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT nationality, count(*)::int AS count
        FROM profiles
        WHERE is_public = true
          AND nationality IS NOT NULL
          AND nationality <> ''
        GROUP BY nationality
        ORDER BY count DESC
        LIMIT 10
      ) t
    ),
    'learning_lang_dist', (
      SELECT coalesce(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT learning_language AS language, count(*)::int AS count
        FROM profiles
        WHERE is_public = true
          AND learning_language IS NOT NULL
          AND learning_language <> ''
        GROUP BY learning_language
        ORDER BY count DESC
        LIMIT 8
      ) t
    ),
    'level_dist', (
      SELECT json_build_object(
        '초급', (SELECT count(*)::int FROM profiles WHERE language_level = '초급' AND is_public = true),
        '중급', (SELECT count(*)::int FROM profiles WHERE language_level = '중급' AND is_public = true),
        '고급', (SELECT count(*)::int FROM profiles WHERE language_level = '고급' AND is_public = true)
      )
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- anon(비로그인) 및 인증 사용자 모두 호출 가능
GRANT EXECUTE ON FUNCTION public.get_public_stats() TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_stats() TO authenticated;
