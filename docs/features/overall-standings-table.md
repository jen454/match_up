# 통합 순위표 추가 — 설계 문서

> **작성일**: 2026-04-23
> **상태**: ✅ 완료 (Step 5)

---

## 1. Context (기능 목적)

현재 토너먼트 결과 화면에서는 선택된 라운드 기준 순위표만 보여준다.
사용자는 라운드별 흐름뿐 아니라, 모든 라운드 누적 기준의 전체 순위를 한눈에 확인하고 싶다.

목표는 `라운드별 순위표` 아래에 `전체 라운드 통합 순위표`를 추가해 내전/내기 상황에서 최종 순위를 빠르게 확인할 수 있게 하는 것이다.

---

## 2. Requirements (요구사항)

### 2.1 필수 기능

- [x] 현재 라운드 순위표는 기존과 동일하게 유지한다.
- [x] 해당 테이블 아래에 전체 라운드 통합 순위표를 추가한다.
- [x] 통합 순위표는 현재 게임의 모든 라운드(`allMatches`) 결과를 반영한다.
- [x] 기존 정렬/동률 처리 규칙(승점, 득실차, 다득점 등)은 현재 로직과 동일하게 적용한다.
- [x] 기존 `StandingsTable` UI를 재사용하여 일관된 시각 스타일을 유지한다.

### 2.2 예외/경계 케이스

- [x] 특정 라운드가 아직 진행 중(미입력 점수 존재)이어도 입력 완료된 매치만 기준으로 통합 순위를 계산한다.
- [x] 매치가 0개인 게임에서는 통합 순위표를 빈 상태 안내 문구와 함께 노출한다.
- [x] 참가자 수가 1명인 경우에도 테이블이 깨지지 않도록 유지한다.

---

## 3. Tech Stack & Data Flow

- Framework: Next.js 15 (App Router)
- Language: TypeScript
- UI: React + TailwindCSS
- Test: Vitest (Unit), Playwright (선택 E2E)

### 데이터 흐름

1. `useTournament`에서 기존처럼 `allMatches`, `currentLapMatches`를 보유한다.
2. 기존 `currentLapMatches` 기반 `currentLapStandings` 계산을 유지한다.
3. `allMatches` 기반 `overallStandings`를 추가 계산한다.
4. `tournament/[gameId]/page.tsx`에서 `StandingsTable`을 2회 렌더링한다.

---

## 4. UI Layout (Responsive)

### 배치 원칙

- 상단: 현재 라운드 진행/매치 UI
- 중단: 현재 라운드 순위표
- 하단(신규): 전체 라운드 통합 순위표

### 반응형

- 모바일: 두 순위표를 세로 스택으로 배치, 각 섹션 간 여백(`space-y-*`) 확보
- 데스크톱: 동일하게 세로 배치하되 테이블 최대 너비와 읽기 간격 유지

### 섹션 타이틀(초안)

- 현재 라운드 순위
- 전체 라운드 통합 순위

---

## 5. Data Schema / 타입 영향

기존 타입을 그대로 사용한다.

- `Match`
- `Standing`

추가 예정 파생 데이터:

- `currentLapStandings: Standing[]`
- `overallStandings: Standing[]`

별도 DB 스키마 변경은 없다.

---

## 6. 테스트 케이스

### 6.1 Unit (Vitest)

대상: `src/utils/standings.ts` 및 이를 호출하는 집계 경로

- [x] 여러 라운드 매치 입력 시 `overallStandings`가 전체 라운드 합산 결과를 반환한다.
- [x] `currentLapStandings`는 기존과 동일하게 현재 라운드 결과만 반영한다.
- [x] 일부 매치 점수가 비어 있는 경우 입력 완료 매치만 반영한다.
- [x] 동률 케이스에서 기존 정렬 우선순위가 유지된다.

### 6.2 E2E (Playwright, 선택)

- [ ] 토너먼트 페이지 진입 시 순위표 2개(현재/통합)가 순서대로 보인다.
- [ ] 라운드 탭을 변경해도 통합 순위는 전체 라운드 기준으로 유지된다.
- [ ] 점수 입력 후 현재 라운드 순위와 통합 순위가 각각 기대대로 갱신된다.

---

## 7. Implementation Plan (Step 3~4)

1. 테스트 추가: 통합 순위 계산 검증 Unit 테스트 먼저 작성
2. 로직 구현: `useTournament`에 `overallStandings` 계산 추가
3. UI 반영: `tournament/[gameId]/page.tsx`에서 통합 순위표 섹션 추가
4. 상태/표시 점검: 데이터 없음/부분 입력 케이스 처리
5. 회귀 확인: 기존 라운드별 순위, 점수 입력 플로우 영향 점검

---

## 8. Performance & Metrics (Step 5 작성용)

| 항목 | 변경 전 (V1) | 변경 후 (V2) | 개선/영향 |
|------|--------------|--------------|-----------|
| 코드 복잡도(분기 수) | `computeStandings` 단일 사용 | `computeTournamentStandings`로 current/overall 동시 계산 | 계산 책임을 한 함수로 모아 유지보수성 향상 |
| LOC(관련 파일) | 단일 순위표 렌더링 | +106 / -14 (net +92) | 테스트 포함 기능 확장 대비 변경 범위 제한 |
| 순위 계산 시간(ms) | 기존 `computeStandings` | 기존 + Lap 필터 1회 + 집계 1회 추가 | 참가자 수가 작은 내전 시 체감 영향 미미(단위 테스트 14개 4ms 통과) |
| 메모리/의존성 변화 | 기존 의존성 | 변경 없음 | 신규 라이브러리 추가 없음 |
| UI/상태 관리 단순성 | 단일 순위표 | 이중 순위표(현재/통합) | 라운드 진행 상황 + 최종 누적 순위를 동시에 확인 가능 |

검증 로그:
- Vitest: `src/utils/__tests__/standings.test.ts` 14 tests passed
- Type check: `npx tsc --noEmit` 통과

