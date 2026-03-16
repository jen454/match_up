-- ============================================================
-- RLS 정책 보강: matches 테이블
-- 문제: INSERT / UPDATE / DELETE 정책이 USING(true) / WITH CHECK(true)로
--       완전 개방되어 있어 Supabase 보안 어드바이저 경고 발생
--
-- 변경 내용:
--   - INSERT : game_id가 games 테이블에 실제 존재하는 경우만 허용
--   - UPDATE : 동일 조건 + 수정 대상 행도 games에 존재하는 경우만 허용
--   - DELETE : 서비스에서 DB 행 삭제를 하지 않으므로 정책 제거
--
-- 실행: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. 기존 과도한 정책 제거
DROP POLICY IF EXISTS "Allow public insert on matches" ON matches;
DROP POLICY IF EXISTS "Allow public update on matches" ON matches;
DROP POLICY IF EXISTS "Allow public delete on matches"  ON matches;

-- 2. INSERT — 해당 game_id가 games 테이블에 존재하는 경우만 허용
CREATE POLICY "Allow public insert on matches"
  ON matches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games WHERE games.id = game_id
    )
  );

-- 3. UPDATE — 수정 대상 행(USING)과 수정 후 값(WITH CHECK) 모두
--             game_id가 games 테이블에 존재하는 경우만 허용
CREATE POLICY "Allow public update on matches"
  ON matches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM games WHERE games.id = game_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games WHERE games.id = game_id
    )
  );

-- 4. DELETE 정책은 생성하지 않음
--    서비스에서 matches 행을 직접 삭제하는 작업이 없음
--    (라운드 취소 = submitted_at → NULL UPDATE, DELETE가 아님)

-- ============================================================
-- 결과 정책 목록
-- SELECT : USING (true)          — 공개 조회 허용 (기존 유지)
-- INSERT : WITH CHECK (game 존재) — 유효한 game_id만 허용
-- UPDATE : USING + WITH CHECK    — 유효한 game_id만 허용
-- DELETE : 정책 없음             — 행 삭제 차단
-- ============================================================

