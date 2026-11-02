# Multi-Lap System — 설계 문서

> **작성일**: 2026-03-08
> **상태**: Step 3·4 완료 / Step 5 측정 완료

---

## 1. Context (목적)

사용자가 한 바퀴(Lap) 리그를 완료한 후, 동일한 참가자로 추가 회차(Lap 2, 3…)를 이어서 진행할 수 있도록 한다.
각 Lap의 대진표와 순위표는 **회차별로 독립 표시**한다.
모든 데이터는 Supabase DB에 저장되어 새로고침·다기기 접속에서도 복원된다.

---

## 2. Requirements (요구사항)

### 필수 기능
- [x] **Lap 추가**: 현재 Lap이 전부 제출 완료된 후, "다음 회차 시작" 버튼으로 새 Lap 생성
- [x] **대진표 지속성**: 새로고침 시 DB에서 대진표(매치 원본) 복원
- [x] **점수 수정**: 이미 제출된 라운드 취소 → 재수정 가능
- [x] **회차별 순위표**: 현재 보고 있는 Lap 결과만 집계하여 순위 표시
- [x] **Lap 탭 UI**: 회차 탭으로 대진표·순위표 전환
- [x] **핸디캡 반영**: `participants.handicap` 값을 초기 포인트로 유지

### 예외 케이스
- 0점:0점 점수 입력 허용 (무승부 처리)
- Bye(홀수 인원) 엔트리는 매치 집계에서 제외
- 진행 중인 Lap(미제출 라운드 포함)에서도 새 Lap 버튼 비활성화 유지
- **이전 회차 조회 시 "+ 다음 회차" 버튼 숨김** — 최신 Lap에서만 표시
- `lap_number`는 1부터 시작 (0-based 금지)

---

## 3. DB 스키마 변경

### 3-1. 신규 테이블: `matches`

```sql
CREATE TABLE matches (
  id              BIGSERIAL PRIMARY KEY,
  game_id         BIGINT       NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  lap_number      INT          NOT NULL DEFAULT 1,
  round_number    INT          NOT NULL,          -- 1-based
  player1_id      BIGINT       NOT NULL REFERENCES participants(id),
  player2_id      BIGINT       NOT NULL REFERENCES participants(id),
  score1          INT          NOT NULL DEFAULT 0,
  score2          INT          NOT NULL DEFAULT 0,
  is_bye          BOOLEAN      NOT NULL DEFAULT FALSE,
  bye_player_id   BIGINT       REFERENCES participants(id),  -- is_bye=true 시 사용
  submitted_at    TIMESTAMPTZ,                    -- NULL = 미제출
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_matches_game_lap ON matches(game_id, lap_number);
CREATE INDEX idx_matches_game_id  ON matches(game_id);
```

### 3-2. `participants` 테이블 변경 (집계 컬럼 제거)

```sql
ALTER TABLE participants
  DROP COLUMN wins,
  DROP COLUMN draws,
  DROP COLUMN losses,
  DROP COLUMN goals_for,
  DROP COLUMN goals_against,
  DROP COLUMN goal_difference,
  DROP COLUMN points;

-- 최종 participants 스키마
-- id | game_id | name | handicap | created_at
```

### 3-3. 최종 ERD

```
games        → id | created_at
participants → id | game_id | name | handicap
matches      → id | game_id | lap_number | round_number
               player1_id | player2_id | score1 | score2
               is_bye | bye_player_id | submitted_at | created_at
```

---

## 4. TypeScript 타입

```typescript
// participants (집계 컬럼 제거, game_id 추가)
export interface Participant {
  id: number;
  game_id: number;
  name: string;
  handicap: number;
}

// DB matches 테이블 원본 레코드
export interface DbMatch {
  id: number;
  game_id: number;
  lap_number: number;
  round_number: number;
  player1_id: number;
  player2_id: number;
  score1: number;
  score2: number;
  is_bye: boolean;
  bye_player_id: number | null;
  submitted_at: string | null;
}

// computeStandings() 반환값
export interface Standing {
  participant_id: number;
  name: string;
  handicap: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number; // handicap + (wins×3) + draws
}
```

---

## 5. API 설계

### 5-1. 기존 API 변경

| Method | Path | 변경 내용 |
|---|---|---|
| `GET` | `/api/games/[gameId]/participants` | 응답에서 집계 컬럼 제거 |
| `POST` | `/api/games/[gameId]/results` | **삭제** |
| `DELETE` | `/api/games/[gameId]/results` | **삭제** |
| `GET` | `/api/games/[gameId]/standings` | **삭제** — 클라이언트 집계로 대체 |

### 5-2. 신규 API

| Method | Path | 역할 |
|---|---|---|
| `GET` | `/api/games/[gameId]/matches?lap=N` | Lap별 매치 조회 (전체 생략 가능) |
| `POST` | `/api/games/[gameId]/laps` | 새 Lap 대진 생성 |
| `PATCH` | `/api/matches/[matchId]` | 개별 매치 점수 저장 |
| `POST` | `/api/games/[gameId]/laps/[n]/rounds/[r]/submit` | 라운드 제출 |
| `DELETE` | `/api/games/[gameId]/laps/[n]/rounds/[r]/submit` | 라운드 제출 취소 |

> **`/standings` API 제거**: 순위 계산을 서버 API 호출 없이 클라이언트의 `computeStandings()`로 처리하여 API 왕복 비용 제거.

---

## 6. 핵심 로직: `computeStandings()`

```typescript
// src/utils/standings.ts
export const computeStandings = (
  matches: DbMatch[],      // 현재 Lap의 matches만 전달
  participants: Participant[],
): Standing[] => {
  const map = new Map<number, Standing>(
    participants.map((p) => [p.id, {
      participant_id: p.id, name: p.name, handicap: p.handicap,
      played: 0, wins: 0, draws: 0, losses: 0,
      goals_for: 0, goals_against: 0, goal_difference: 0,
      points: p.handicap,
    }])
  );

  for (const m of matches) {
    if (m.is_bye || m.submitted_at === null) continue;
    const p1 = map.get(m.player1_id);
    const p2 = map.get(m.player2_id);
    if (!p1 || !p2) continue;

    p1.played++; p2.played++;
    p1.goals_for += m.score1; p1.goals_against += m.score2;
    p2.goals_for += m.score2; p2.goals_against += m.score1;

    if (m.score1 > m.score2)      { p1.wins++; p1.points += 3; p2.losses++; }
    else if (m.score1 < m.score2) { p2.wins++; p2.points += 3; p1.losses++; }
    else                          { p1.draws++; p1.points += 1; p2.draws++; p2.points += 1; }
  }

  return Array.from(map.values())
    .map((s) => ({ ...s, goal_difference: s.goals_for - s.goals_against }))
    .sort((a, b) =>
      b.points - a.points ||
      b.goals_for - a.goals_for ||
      b.goal_difference - a.goal_difference
    );
};
```

**시간 복잡도**: O(M + P log P) — M=매치 수, P=참가자 수

---

## 7. UI 레이아웃

```
┌──────────────────────────────────────────────────────────┐
│  ← 토너먼트 매치             완료: 3/5 라운드 완료         │  ← BackHeader
├────────────────────────┬─────────────────────────────────┤
│                        │  [ 1회차 ] [ 2회차▼ ] [+ 다음]  │  ← LapTabs (최신 Lap에서만 + 버튼)
│   N회차 순위표           │                                 │
│   (현재 Lap만 집계)      │   2회차 경기   [모든 라운드 보기] │
│                        │                                 │
│  순위 이름 승 무 패 승점  │   ◀ 라운드 2 ▶                  │
│  1  홍길동  3  0  0   9 │   [매치카드]                    │
│  2  김철수  2  0  1   6 │   [매치카드]                    │
│  ...                   │                                 │
│                        │   [제출] [취소]                  │
└────────────────────────┴─────────────────────────────────┘

이전 회차 조회 시:
[ 1회차▼ ] [ 2회차 ]          ← + 다음 회차 버튼 없음
```

### 반응형 처리
- **모바일**: 순위표(상단) → 대진표(하단) 수직 스택
- **데스크톱**: 좌(순위표 1/3, `lg:col-span-1`) + 우(대진표 2/3, `lg:col-span-2`)

---

## 8. 상태 관리 (useTournament 훅)

```typescript
// 핵심 state
const [participants, setParticipants] = useState<Participant[]>([]);
const [allMatches, setAllMatches]     = useState<DbMatch[]>([]);
const [currentLap, setCurrentLap]     = useState<number>(1);

// 파생값 (useMemo — 자동 재계산)
const currentLapMatches = useMemo(() => allMatches.filter(m => m.lap_number === currentLap), [...]);
const rounds            = useMemo(() => groupMatchesByRound(currentLapMatches, participantMap), [...]);
const standings         = useMemo(() => computeStandings(currentLapMatches, participants), [...]);
const lapList           = useMemo(() => [...new Set(allMatches.map(m => m.lap_number))].sort(), [...]);
const latestLap         = useMemo(() => Math.max(...lapList), [...]);
const isLatestLap       = currentLap === latestLap;   // 다음 회차 버튼 표시 여부
const submittedRounds   = useMemo(() => [...], [...]);
const isCurrentLapComplete = useMemo(() => submittedRounds.every(Boolean), [...]);
```

> **standings는 별도 state 없음**: `currentLapMatches` 변경 시 `useMemo`로 자동 재계산.
> 라운드 제출/취소 후 API 재호출 불필요.

---

## 9. 구현 순서 (Implementation Plan)

| Step | 작업 내용 | 파일 | 상태 |
|---|---|---|---|
| 3-1 | DB 마이그레이션 | Supabase Dashboard | ✅ |
| 3-2 | TypeScript 타입 정의 변경 | `src/types/type.ts` | ✅ |
| 3-3 | `computeStandings()` + Vitest 테스트 | `src/utils/standings.ts` | ✅ |
| 3-4 | `groupMatchesByRound()` 유틸 | `src/utils/matchGrouper.ts` | ✅ |
| 3-5 | 신규 API Route 구현 | `src/app/api/games/[gameId]/matches` 등 | ✅ |
| 3-6 | 기존 `/results` API 제거 | 삭제 완료 | ✅ |
| 3-7 | `useTournament` 훅 재설계 | `src/hooks/useTournament.ts` | ✅ |
| 3-8 | `StandingsTable` 컴포넌트 | `src/components/StandingsTable.tsx` | ✅ |
| 3-9 | `LapTabs` 컴포넌트 | `src/components/LapTabs.tsx` | ✅ |
| 3-10 | TournamentPage UI 업데이트 | `src/app/tournament/[gameId]/page.tsx` | ✅ |
| 버그수정 | 점수 수정 즉시 반영 (race condition 수정) | `useScoreModal.ts`, `useTournament.ts` | ✅ |
| 버그수정 | 모든 라운드 보기에서 제출 버튼 미표시 수정 | `page.tsx` | ✅ |
| 예외처리 | 이전 회차 조회 시 다음 회차 버튼 숨김 | `LapTabs.tsx`, `useTournament.ts` | ✅ |
| 예외처리 | 순위표 회차별 분리 (전체 합산 → Lap 단위) | `useTournament.ts`, `StandingsTable.tsx` | ✅ |

---

## 10. 테스트 케이스

### Unit Tests (`src/utils/__tests__/standings.test.ts`) — 12/12 통과

| ID | 케이스 | 결과 |
|---|---|---|
| S01 | 2명, 1경기 승리 — 승점 정확히 반영 | ✅ |
| S02 | 무승부 처리 — 양쪽 각 1점 | ✅ |
| S03 | 0-0 무승부 | ✅ |
| S04 | handicap이 초기 points에 반영 | ✅ |
| S05 | 매치 없이 handicap만 있어도 반영 | ✅ |
| S06 | submitted_at=null 미제출 매치 집계 제외 | ✅ |
| S07 | is_bye=true 매치 집계 제외 | ✅ |
| S08 | Lap 1 + Lap 2 누적 합산 | ✅ |
| S09 | Lap 10회 반복 — 정확성 | ✅ |
| S10 | 승점 우선 정렬 | ✅ |
| S11 | 승점 동점 시 다득점 우선, 이후 골득실 | ✅ |
| S12 | 득점/실점/골득실 정확히 계산 | ✅ |

---

## 11. Performance & Metrics

### 실행 성능 (1,000회 반복 기준, Vitest / console.time)

| 시나리오 | 매치 수 | 1,000회 총 소요 | 회당 평균 |
|---|---|---|---|
| Lap 1, 6명 | 15 | 7.3 ms | **0.007 ms** |
| Lap 5, 6명 | 75 | 8.0 ms | **0.008 ms** |
| Lap 10, 6명 | 150 | 2.7 ms | **0.003 ms** |
| Lap 50, 6명 | 750 | 11.6 ms | **0.012 ms** |

> Lap 50회(750 매치) 기준으로도 **회당 0.012 ms** — 일반적인 리그(10회 이하)에서 체감 지연 없음.

### 아키텍처 개선

| 항목 | V1 (집계 컬럼) | V2 (matches 집계) |
|---|---|---|
| 순위 계산 방식 | DB 컬럼 직접 읽기 | `computeStandings()` 클라이언트 집계 |
| 라운드 제출 후 순위 갱신 | API 재호출 필요 | `useMemo` 자동 재계산 (0 API 호출) |
| 멀티 Lap 지원 | ❌ 불가 | ✅ `lap_number` 필터로 자연스럽게 분리 |
| 새로고침 복원 | ❌ 매치 원본 없음 | ✅ DB에서 전체 복원 |
| 점수 수정 | 집계 컬럼 재계산 필요 | `PATCH /matches/:id` 단일 업데이트 |
| 코드 복잡도 | results POST/DELETE 복잡한 가감 로직 | 순수 함수 1개로 대체 |

### 향후 확장 시 대응 방안

| 상황 | 대응 |
|---|---|
| Lap 100개 이상 (극단적 케이스) | Supabase PostgreSQL View 또는 `/standings` API 서버 집계로 전환 |
| 참가자 20명 이상 대규모 리그 | `useMemo` dependency 최적화 또는 Web Worker 분리 고려 |
