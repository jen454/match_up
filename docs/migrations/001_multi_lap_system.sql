-- ============================================================
-- Multi-Lap System Migration
-- 실행 순서: Supabase Dashboard > SQL Editor 에서 순서대로 실행
-- ============================================================

-- Step 1. matches 테이블 생성
CREATE TABLE IF NOT EXISTS matches (
  id              BIGSERIAL    PRIMARY KEY,
  game_id         BIGINT       NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  lap_number      INT          NOT NULL DEFAULT 1,
  round_number    INT          NOT NULL,
  player1_id      BIGINT       NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  player2_id      BIGINT       NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  score1          INT          NOT NULL DEFAULT 0,
  score2          INT          NOT NULL DEFAULT 0,
  is_bye          BOOLEAN      NOT NULL DEFAULT FALSE,
  bye_player_id   BIGINT       REFERENCES participants(id) ON DELETE SET NULL,
  submitted_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Step 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_matches_game_lap ON matches(game_id, lap_number);
CREATE INDEX IF NOT EXISTS idx_matches_game_id  ON matches(game_id);

-- Step 3. participants 테이블 집계 컬럼 제거
-- ⚠️  주의: 기존 데이터가 있다면 백업 후 실행할 것
-- Step 1, 2 완료 후 실행
ALTER TABLE participants
  DROP COLUMN IF EXISTS wins,
  DROP COLUMN IF EXISTS draws,
  DROP COLUMN IF EXISTS losses,
  DROP COLUMN IF EXISTS goals_for,
  DROP COLUMN IF EXISTS goals_against,
  DROP COLUMN IF EXISTS goal_difference,
  DROP COLUMN IF EXISTS points;

-- Step 4. matches 테이블 RLS 설정
-- Step 1 완료 후 실행
--
-- 이 프로젝트는 Supabase anon key로 익명 접근하는 구조이므로
-- RLS를 활성화하되 전체 허용 정책(public access)을 추가한다.
-- games, participants 테이블과 동일한 정책 방식.
-- ============================================================

-- RLS 활성화
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- 조회 허용 (SELECT)
CREATE POLICY "Allow public read on matches"
  ON matches FOR SELECT
                            USING (true);

-- 생성 허용 (INSERT)
CREATE POLICY "Allow public insert on matches"
  ON matches FOR INSERT
  WITH CHECK (true);

-- 수정 허용 (UPDATE)
CREATE POLICY "Allow public update on matches"
  ON matches FOR UPDATE
                                   USING (true)
                 WITH CHECK (true);

-- 삭제 허용 (DELETE)
CREATE POLICY "Allow public delete on matches"
  ON matches FOR DELETE
USING (true);

-- ============================================================
-- 최종 participants 스키마: id | game_id | name | handicap | created_at
-- 최종 matches 스키마:      id | game_id | lap_number | round_number |
--                           player1_id | player2_id | score1 | score2 |
--                           is_bye | bye_player_id | submitted_at | created_at
-- ============================================================
