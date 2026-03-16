-- ============================================================
-- RLS 정책 추가: games, participants 테이블
-- 문제: RLS는 활성화되어 있으나 정책이 없어 모든 접근이 차단됨
--
-- 각 테이블별 실제 사용 작업:
--
--   games:
--     - SELECT : resolveGameId()에서 public_id → id 조회
--     - INSERT : 게임 생성 (POST /api/games)
--     - UPDATE : 없음 → 정책 미생성
--     - DELETE : 없음 → 정책 미생성
--
--   participants:
--     - SELECT : 참가자 조회 (standings, laps, participants route)
--     - INSERT : 참가자 저장 (POST /api/games)
--     - UPDATE : 없음 → 정책 미생성
--     - DELETE : 없음 → 정책 미생성
--
-- 실행: Supabase Dashboard > SQL Editor
-- ============================================================

-- ── games ────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Allow public read on games" ON games;
CREATE POLICY "Allow public read on games"
  ON games FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public insert on games" ON games;
CREATE POLICY "Allow public insert on games"
  ON games FOR INSERT
  WITH CHECK (
    public_id IS NOT NULL AND public_id <> ''
  );

-- ── participants ─────────────────────────────────────────────

DROP POLICY IF EXISTS "Allow public read on participants" ON participants;
CREATE POLICY "Allow public read on participants"
  ON participants FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public insert on participants" ON participants;
CREATE POLICY "Allow public insert on participants"
  ON participants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games WHERE games.id = game_id
    )
  );

-- ============================================================
-- 최종 정책 요약
--
-- games
--   SELECT : USING (true)                    — 공개 조회 허용
--   INSERT : WITH CHECK (public_id 유효성)   — 비어있지 않은 public_id만 허용
--
-- participants
--   SELECT : USING (true)                    — 공개 조회 허용
--   INSERT : WITH CHECK (game 존재)          — 유효한 game_id만 허용
-- ============================================================

