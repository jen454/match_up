# Public Game ID — 설계 문서

> **작성일**: 2026-03-10  
> **상태**: ✅ 완료

---

## 1. Context (목적)

기존 `gameId`는 Supabase `BIGSERIAL` (자동 증가 정수)로, URL에 그대로 노출되어 있었다.

```
/tournament/1
/tournament/2   ← 순차 탐색으로 타인의 게임에 접근 가능
```

이를 예측 불가능한 문자열 ID(`nanoid`)로 교체하여 **IDOR(Insecure Direct Object Reference) 공격**을 방어한다.  
내부 DB의 `BIGSERIAL id`는 외래 키·조인 성능을 위해 그대로 유지하고, URL에는 `public_id`만 노출한다.

---

## 2. Requirements (요구사항)

- [x] URL에서 순차 정수 `gameId` 제거 → 예측 불가능한 문자열 ID 사용
- [x] 내부 DB 구조(`BIGSERIAL id`, 외래 키) 변경 없음
- [x] 기존 API 경로 구조 유지 (파라미터 타입만 `number → string` 변경)
- [x] 존재하지 않는 `public_id` 접근 시 404 반환

---

## 3. 기술 결정

### nanoid 채택 이유

| 방식 | 길이 | URL-safe | 비고 |
|------|------|----------|------|
| **nanoid** | 21자 | ✅ | 채택 — 짧고 깔끔한 URL |
| UUID v4 | 36자 | ❌ (하이픈 포함) | 추가 의존성 없음 |
| ULID | 26자 | ✅ | 시간순 정렬 필요 시 고려 |

```
/tournament/V1StGXR8_Z5jdHi6B   ← public_id (예측 불가)
```

---

## 4. DB 스키마 변경

### 마이그레이션: `docs/migrations/002_public_id.sql`

```sql
-- games 테이블에 public_id 컬럼 추가
ALTER TABLE games
  ADD COLUMN IF NOT EXISTS public_id TEXT UNIQUE;

-- 기존 데이터 임시 채우기
UPDATE games SET public_id = 'legacy-' || id::text WHERE public_id IS NULL;

-- NOT NULL 제약 추가
ALTER TABLE games
  ALTER COLUMN public_id SET NOT NULL;

-- 조회 최적화 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS idx_games_public_id ON games(public_id);
```

### 최종 `games` 스키마

```
games → id (BIGSERIAL, 내부용) | public_id (TEXT, URL 노출용) | created_at
```

---

## 5. 아키텍처

### 데이터 흐름

```
클라이언트 URL: /tournament/V1StGXR8_Z5jdHi6B
       │
       ▼
app/api/games/[gameId]/...  (gameId = "V1StGXR8_Z5jdHi6B")
       │
       ▼
resolveGameId(publicId)  →  SELECT id FROM games WHERE public_id = $1
       │
       ▼
internalId (number)  →  이후 모든 Supabase 쿼리에 사용
```

### 핵심 원칙

- **`public_id`**: URL 노출 전용. 클라이언트 ↔ API Route 간 통신에만 사용
- **내부 `id`**: DB 외래 키, 조인, matches/participants 쿼리에 사용
- **`resolveGameId()`**: 두 ID 간 변환을 담당하는 단일 진입점

---

## 6. 변경 파일 목록

### 신규 파일

| 파일 | 역할 |
|------|------|
| `src/utils/resolveGameId.ts` | `public_id → 내부 id` 변환 헬퍼 |
| `docs/migrations/002_public_id.sql` | DB 마이그레이션 SQL |

### 수정 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/app/api/games/route.ts` | 게임 생성 시 `nanoid()` 생성, `public_id` 반환 |
| `src/app/api/games/[gameId]/matches/route.ts` | `Number(gameId)` → `resolveGameId()` |
| `src/app/api/games/[gameId]/participants/route.ts` | 동일 |
| `src/app/api/games/[gameId]/standings/route.ts` | 동일 |
| `src/app/api/games/[gameId]/laps/route.ts` | 동일 |
| `src/app/api/games/[gameId]/.../submit/route.ts` | 동일 |
| `src/utils/api.ts` | `gameId: number → string` |
| `src/hooks/useTournament.ts` | `gameId: number → string` |
| `src/app/tournament/[gameId]/page.tsx` | `Number(params.gameId)` → `params.gameId as string` |

---

## 7. 코드 상세

### `resolveGameId.ts`

```typescript
export async function resolveGameId(publicId: string): Promise<number | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select("id")
    .eq("public_id", publicId)
    .single();

  if (error || !data) return null;
  return data.id;
}
```

### API Route 패턴 (변경 전 → 후)

```typescript
// ❌ 변경 전: 숫자 변환 → 직접 쿼리
const parsedGameId = Number(gameId);
if (isNaN(parsedGameId)) return 400;
.eq("game_id", parsedGameId)

// ✅ 변경 후: public_id로 내부 id 조회
const internalId = await resolveGameId(gameId);
if (internalId === null) return 404;
.eq("game_id", internalId)
```

---

## 8. 한계 및 향후 과제

| 항목 | 현황 | 향후 개선 방향 |
|------|------|----------------|
| 인증 없음 | `public_id`를 알면 누구나 접근 가능 | Supabase Auth + RLS 정책 강화 |
| `matchId` 노출 | `/api/matches/123` 에 숫자 ID 노출 | URL에 직접 표시되지 않아 우선순위 낮음 |
| `resolveGameId` 추가 쿼리 | 매 요청마다 games 테이블 조회 1회 추가 | 트래픽 증가 시 Redis 캐싱 고려 |

