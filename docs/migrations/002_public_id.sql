-- ============================================================
-- Public ID Migration
-- games 테이블에 public_id 컬럼 추가 (URL 노출용 예측 불가 ID)
-- 실행: Supabase Dashboard > SQL Editor
-- ============================================================

-- Step 1. public_id 컬럼 추가
ALTER TABLE games
  ADD COLUMN IF NOT EXISTS public_id TEXT UNIQUE;

-- Step 2. 기존 데이터 임시 채우기 (신규 서비스라면 생략 가능)
UPDATE games SET public_id = 'legacy-' || id::text WHERE public_id IS NULL;

-- Step 3. NOT NULL 제약 추가 (기존 데이터 채운 뒤)
ALTER TABLE games
  ALTER COLUMN public_id SET NOT NULL;

-- Step 4. 인덱스 추가 (public_id로 조회 최적화)
CREATE UNIQUE INDEX IF NOT EXISTS idx_games_public_id ON games(public_id);

