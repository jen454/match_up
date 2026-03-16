# RLS 정책 보강 — 설계 문서

> **작성일**: 2026-03-11
> **상태**: ✅ 완료

---

## 1. Context (목적)

Supabase 보안 어드바이저가 세 테이블에 대해 아래 두 종류의 경고를 발생시켰다.

| 경고 | 대상 |
|------|------|
| RLS policy allows unrestricted access (always true) | `matches` — INSERT / UPDATE / DELETE |
| RLS enabled but no policies exist | `games`, `participants` |

각 테이블의 실제 비즈니스 로직에 맞는 조건으로 정책을 추가/교체한다.

---

## 2. 테이블별 실제 사용 작업

### games

| 작업 | 사용처 | 정책 필요 |
|------|--------|-----------|
| SELECT | `resolveGameId()` — `public_id → id` 조회 | ✅ |
| INSERT | `POST /api/games` — 게임 생성 | ✅ |
| UPDATE | 없음 | ❌ |
| DELETE | 없음 | ❌ |

### participants

| 작업 | 사용처 | 정책 필요 |
|------|--------|-----------|
| SELECT | standings, laps, participants route | ✅ |
| INSERT | `POST /api/games` — 참가자 저장 | ✅ |
| UPDATE | 없음 | ❌ |
| DELETE | 없음 | ❌ |

### matches

| 작업 | 사용처 | 정책 필요 |
|------|--------|-----------|
| SELECT | matches, standings route | ✅ (기존 유지) |
| INSERT | 게임/Lap 생성 시 대진표 일괄 insert | ✅ |
| UPDATE | 점수 저장, 라운드 제출/취소 | ✅ |
| DELETE | 없음 (라운드 취소 = `submitted_at → NULL` UPDATE) | ❌ |

> **DELETE 정책이 불필요한 이유**  
> HTTP `DELETE` 메서드를 사용하는 라운드 취소 API는 DB 행을 삭제하지 않는다.  
> 실제 동작은 `submitted_at → NULL` **UPDATE**이므로 DELETE 정책이 없어야 더 안전하다.

---

## 3. 정책 상세

### games — 신규 추가 (`004_games_participants_rls.sql`)

```sql
-- SELECT: 공개 조회 허용
CREATE POLICY "Allow public read on games"
  ON games FOR SELECT
  USING (true);

-- INSERT: public_id가 비어있지 않은 경우만 허용
-- ※ games는 최상위 테이블이라 EXISTS 조건 적용 불가
--    public_id 유효성 검증으로 WITH CHECK (true) 경고 회피
CREATE POLICY "Allow public insert on games"
  ON games FOR INSERT
  WITH CHECK (
    public_id IS NOT NULL AND public_id <> ''
  );
```

### participants — 신규 추가 (`004_games_participants_rls.sql`)

```sql
-- SELECT: 공개 조회 허용
CREATE POLICY "Allow public read on participants"
  ON participants FOR SELECT
  USING (true);

-- INSERT: 유효한 game_id가 존재하는 경우만 허용
CREATE POLICY "Allow public insert on participants"
  ON participants FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM games WHERE games.id = game_id)
  );
```

### matches — 기존 정책 교체 (`003_matches_rls_fix.sql`)

```sql
-- INSERT: 유효한 game_id가 존재하는 경우만 허용
CREATE POLICY "Allow public insert on matches"
  ON matches FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM games WHERE games.id = game_id)
  );

-- UPDATE: 동일 조건
CREATE POLICY "Allow public update on matches"
  ON matches FOR UPDATE
  USING (EXISTS (SELECT 1 FROM games WHERE games.id = game_id))
  WITH CHECK (EXISTS (SELECT 1 FROM games WHERE games.id = game_id));

-- DELETE: 정책 없음 (행 삭제 차단)
```

---

## 4. 최종 정책 요약

| 테이블 | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| `games` | `true` | `public_id` 유효성 검증 | 정책 없음 | 정책 없음 |
| `participants` | `true` | game 존재 | 정책 없음 | 정책 없음 |
| `matches` | `true` | game 존재 | game 존재 | 정책 없음 |

---

## 5. 마이그레이션 실행 순서

Supabase Dashboard > SQL Editor 에서 순서대로 실행한다.

1. `003_matches_rls_fix.sql` — matches 기존 정책 교체
2. `004_games_participants_rls.sql` — games / participants 정책 신규 추가

> 이미 일부 정책이 생성되어 있어도 각 SQL 파일에 `DROP POLICY IF EXISTS`가 포함되어 있으므로 중복 실행해도 안전하다.

---

## 6. 한계 및 향후 과제

현재 인증(Auth)이 없는 구조이므로 `game_id` 존재 여부까지만 검증한다.  
추후 Supabase Auth 도입 시 게임 소유자(`owner_id`)를 기반으로 수정/삭제 권한을 제한할 수 있다.

```sql
-- 향후 인증 도입 시 예시
USING (
  EXISTS (
    SELECT 1 FROM games
    WHERE games.id = game_id
      AND games.owner_id = auth.uid()
  )
)
```
