-- =============================================================================
-- KoriBridge 테스트용 더미 데이터
-- =============================================================================
-- 실행 방법:
--   1. Supabase 대시보드 → SQL Editor → New Query
--   2. 이 파일의 전체 내용을 붙여넣기
--   3. Run 버튼 클릭
--
-- 주의:
--   - ON CONFLICT DO NOTHING 으로 중복 실행해도 안전합니다.
--   - auth.users 에 먼저 삽입한 뒤 profiles 를 삽입합니다.
--   - 삭제하려면 아래 UUID 목록을 참고해 DELETE 하거나
--     Supabase Authentication → Users 에서 직접 삭제하세요.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. auth.users 더미 계정 삽입
--    (profiles 외래키가 auth.users.id 를 참조하므로 먼저 삽입)
-- -----------------------------------------------------------------------------
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
VALUES
  -- 1. 미국 / Emma Johnson
  (
    'a1000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'dummy_emma@koribridge.test',
    '$2a$10$abcdefghijklmnopqrstuuDummyHashForTestingPurposesOnly00',
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false, '', '', '', ''
  ),
  -- 2. 일본 / Kenji Tanaka
  (
    'a1000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'dummy_kenji@koribridge.test',
    '$2a$10$abcdefghijklmnopqrstuuDummyHashForTestingPurposesOnly00',
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false, '', '', '', ''
  ),
  -- 3. 베트남 / Linh Nguyen
  (
    'a1000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'dummy_linh@koribridge.test',
    '$2a$10$abcdefghijklmnopqrstuuDummyHashForTestingPurposesOnly00',
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false, '', '', '', ''
  ),
  -- 4. 브라질 / Lucas Silva
  (
    'a1000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'dummy_lucas@koribridge.test',
    '$2a$10$abcdefghijklmnopqrstuuDummyHashForTestingPurposesOnly00',
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false, '', '', '', ''
  ),
  -- 5. 인도 / Priya Sharma
  (
    'a1000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'dummy_priya@koribridge.test',
    '$2a$10$abcdefghijklmnopqrstuuDummyHashForTestingPurposesOnly00',
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false, '', '', '', ''
  ),
  -- 6. 프랑스 / Claire Dubois
  (
    'a1000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'dummy_claire@koribridge.test',
    '$2a$10$abcdefghijklmnopqrstuuDummyHashForTestingPurposesOnly00',
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false, '', '', '', ''
  ),
  -- 7. 중국 / Wei Zhang
  (
    'a1000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'dummy_wei@koribridge.test',
    '$2a$10$abcdefghijklmnopqrstuuDummyHashForTestingPurposesOnly00',
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false, '', '', '', ''
  ),
  -- 8. 호주 / Oliver Brown
  (
    'a1000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'dummy_oliver@koribridge.test',
    '$2a$10$abcdefghijklmnopqrstuuDummyHashForTestingPurposesOnly00',
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false, '', '', '', ''
  ),
  -- 9. 멕시코 / Sofia Ramirez
  (
    'a1000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'dummy_sofia@koribridge.test',
    '$2a$10$abcdefghijklmnopqrstuuDummyHashForTestingPurposesOnly00',
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false, '', '', '', ''
  ),
  -- 10. 태국 / Napat Chaiyasit
  (
    'a1000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'dummy_napat@koribridge.test',
    '$2a$10$abcdefghijklmnopqrstuuDummyHashForTestingPurposesOnly00',
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false, '', '', '', ''
  )
ON CONFLICT (id) DO NOTHING;


-- -----------------------------------------------------------------------------
-- 2. profiles 테이블 컬럼 보장
--    (업데이트 스크립트 미실행 환경에서도 동작하도록 먼저 컬럼을 추가)
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS language_level text DEFAULT '초급';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;


-- -----------------------------------------------------------------------------
-- 3. profiles 더미 데이터 삽입
-- -----------------------------------------------------------------------------
INSERT INTO profiles (
  id,
  display_name,
  nationality,
  native_language,
  learning_language,
  language_level,
  bio,
  interests,
  avatar_url,
  is_public,
  is_admin,
  created_at,
  updated_at
)
VALUES
  -- 1. 미국 / Emma Johnson — 영어 모국어, 한국어 학습, 초급
  (
    'a1000000-0000-0000-0000-000000000001',
    'Emma Johnson',
    '미국',
    '영어',
    '한국어',
    '초급',
    'Hi! I''m Emma from New York. I started learning Korean because of K-dramas and K-pop. I love BTS and would love to practice Korean with native speakers!',
    ARRAY['음악', 'K-드라마', '요리'],
    NULL, true, false,
    NOW() - INTERVAL '30 days', NOW() - INTERVAL '2 days'
  ),
  -- 2. 일본 / Kenji Tanaka — 일본어 모국어, 한국어 학습, 중급
  (
    'a1000000-0000-0000-0000-000000000002',
    'Kenji Tanaka',
    '일본',
    '일본어',
    '한국어',
    '중급',
    '안녕하세요! 저는 도쿄에 사는 켄지입니다. 한국 문화에 관심이 많고 한국 음식을 정말 좋아해요. 같이 언어 교환해요!',
    ARRAY['요리', '여행', '사진'],
    NULL, true, false,
    NOW() - INTERVAL '45 days', NOW() - INTERVAL '5 days'
  ),
  -- 3. 베트남 / Linh Nguyen — 베트남어 모국어, 한국어 학습, 고급
  (
    'a1000000-0000-0000-0000-000000000003',
    'Linh Nguyen',
    '베트남',
    '베트남어',
    '한국어',
    '고급',
    '안녕하세요! 저는 하노이 출신 링입니다. 한국어를 5년째 공부하고 있어요. 한국 드라마와 영화를 자막 없이 볼 수 있을 정도예요. 영어나 베트남어도 가르쳐 드릴 수 있어요.',
    ARRAY['K-드라마', '독서', '영화'],
    NULL, true, false,
    NOW() - INTERVAL '60 days', NOW() - INTERVAL '1 day'
  ),
  -- 4. 브라질 / Lucas Silva — 포르투갈어 모국어, 한국어 학습, 초급
  (
    'a1000000-0000-0000-0000-000000000004',
    'Lucas Silva',
    '브라질',
    '포르투갈어',
    '한국어',
    '초급',
    'Oi! I''m Lucas from São Paulo. I recently got into Korean culture through gaming and now I want to learn the language. I can help you with Portuguese or English in return!',
    ARRAY['게임', '음악', '스포츠'],
    NULL, true, false,
    NOW() - INTERVAL '15 days', NOW() - INTERVAL '3 days'
  ),
  -- 5. 인도 / Priya Sharma — 힌디어 모국어, 한국어 학습, 중급
  (
    'a1000000-0000-0000-0000-000000000005',
    'Priya Sharma',
    '인도',
    '힌디어',
    '한국어',
    '중급',
    '안녕하세요! 저는 뭄바이 출신 프리야예요. K-뷰티에 관심이 많아서 한국어를 배우기 시작했어요. 힌디어나 영어 교환도 환영해요!',
    ARRAY['뷰티', 'K-드라마', '요리'],
    NULL, true, false,
    NOW() - INTERVAL '90 days', NOW() - INTERVAL '7 days'
  ),
  -- 6. 프랑스 / Claire Dubois — 프랑스어 모국어, 한국어 학습, 고급
  (
    'a1000000-0000-0000-0000-000000000006',
    'Claire Dubois',
    '프랑스',
    '프랑스어',
    '한국어',
    '고급',
    '안녕하세요! 저는 파리에서 온 클레르예요. 한국 문학과 영화를 사랑해서 한국어를 열심히 공부했어요. TOPIK 5급 합격했습니다. 프랑스어나 영어 교환해요!',
    ARRAY['독서', '영화', '여행'],
    NULL, true, false,
    NOW() - INTERVAL '120 days', NOW() - INTERVAL '10 days'
  ),
  -- 7. 중국 / Wei Zhang — 중국어 모국어, 한국어 학습, 중급
  (
    'a1000000-0000-0000-0000-000000000007',
    'Wei Zhang',
    '중국',
    '중국어',
    '한국어',
    '중급',
    '你好! I''m Wei from Beijing. I''ve been learning Korean for 2 years and enjoy K-pop and Korean webtoons. Happy to exchange Chinese or English!',
    ARRAY['음악', '독서', '게임'],
    NULL, true, false,
    NOW() - INTERVAL '75 days', NOW() - INTERVAL '4 days'
  ),
  -- 8. 호주 / Oliver Brown — 영어 모국어, 한국어 학습, 초급
  (
    'a1000000-0000-0000-0000-000000000008',
    'Oliver Brown',
    '호주',
    '영어',
    '한국어',
    '초급',
    'G''day! I''m Oliver from Melbourne. I visited Seoul last year and fell in love with the city. Now I''m learning Korean so I can go back and actually talk to people! Can teach English in return.',
    ARRAY['여행', '스포츠', '요리'],
    NULL, true, false,
    NOW() - INTERVAL '20 days', NOW() - INTERVAL '6 days'
  ),
  -- 9. 멕시코 / Sofia Ramirez — 스페인어 모국어, 한국어 학습, 고급
  (
    'a1000000-0000-0000-0000-000000000009',
    'Sofia Ramirez',
    '멕시코',
    '스페인어',
    '한국어',
    '고급',
    '안녕하세요! 저는 멕시코시티에서 온 소피아예요. 한국어 공부한 지 4년 됐고 한국 교환학생도 다녀왔어요. 스페인어 배우고 싶은 분 연락 주세요!',
    ARRAY['K-드라마', '요리', '음악'],
    NULL, true, false,
    NOW() - INTERVAL '180 days', NOW() - INTERVAL '12 days'
  ),
  -- 10. 태국 / Napat Chaiyasit — 태국어 모국어, 한국어 학습, 중급
  (
    'a1000000-0000-0000-0000-000000000010',
    'Napat Chaiyasit',
    '태국',
    '태국어',
    '한국어',
    '중급',
    '안녕하세요! 방콕 출신 나팟이에요. 태국에서 한류 열풍이 엄청 세서 저도 한국어를 배우게 됐어요. 태국어나 영어 가르쳐 드릴 수 있어요!',
    ARRAY['음악', '뷰티', 'K-드라마'],
    NULL, true, false,
    NOW() - INTERVAL '55 days', NOW() - INTERVAL '8 days'
  )
ON CONFLICT (id) DO NOTHING;


-- -----------------------------------------------------------------------------
-- 4. 삽입 확인 쿼리 (실행 후 결과 확인용)
-- -----------------------------------------------------------------------------
SELECT
  p.display_name,
  p.nationality,
  p.native_language,
  p.learning_language,
  p.language_level,
  p.is_public
FROM profiles p
WHERE p.id LIKE 'a1000000-0000-0000-0000-00000000000%'
ORDER BY p.created_at DESC;
