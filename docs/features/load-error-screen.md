# 토너먼트 불러오기 실패 화면 — 설계 문서

> **작성일**: 2026-11-03
> **상태**: ✅ 완료

---

## 1. Context (목적)

토너먼트 화면의 초기 로드(`fetchAll`)는 try/finally만 있어서, 실패하면 처리되지 않은 Promise가 남고 "0 / 0 라운드 완료"인 빈 화면이 보였다.
잘못된 링크인지 서버 문제인지 사용자가 알 수 없었다.

또 `resolveGameId`는 DB 오류도 `null`로 돌려줘서, 일시적인 장애가 "존재하지 않는 게임"(404)으로 응답됐다.

## 2. Requirements (요구사항)

- [x] 없는 게임(404)이면 "게임을 찾을 수 없습니다" 화면과 새 토너먼트 만들기 · 홈으로 버튼을 보여준다.
- [x] 네트워크 · 서버 오류면 원인에 맞는 안내와 다시 시도 버튼을 보여준다.
- [x] 다시 시도는 페이지 새로고침 없이 데이터만 다시 불러온다.
- [x] 서버는 "없는 게임"(404)과 "DB 장애"(500)를 구분해서 응답한다.
- [x] participants API도 다른 라우트처럼 try/catch로 감싸고 DB 원본 에러 메시지를 노출하지 않는다.

## 3. 기술 결정

| 방식 | 장점 | 단점 |
|---|---|---|
| `notFound()` + `not-found.tsx` | Next.js 기본 방식 | 페이지가 클라이언트 컴포넌트라 데이터 조회가 클라이언트에서 일어나 적용이 어색함 |
| `error.tsx`로 throw | 기존 에러 경계 재사용 | 404와 장애를 구분하기 어렵고, 404에 "다시 시도"는 맞지 않음 |
| **훅의 `loadError` 상태 + `LoadErrorScreen` (채택)** | 원인별 화면 · 버튼 구분, 다시 시도가 데이터만 재요청 | 컴포넌트 1개 추가 |

`resolveGameId`는 `.single()` → `.maybeSingle()`로 바꿔, 행이 없으면 `null`, DB 오류면 throw 하도록 했다.

## 4. 화면 구분

| 원인 | 제목 | 버튼 |
|---|---|---|
| 404 | 게임을 찾을 수 없습니다 | 새 토너먼트 만들기 · 홈으로 |
| 네트워크 (status 0) | 토너먼트를 불러오지 못했습니다 — 인터넷 연결 확인 | 다시 시도 · 홈으로 |
| 그 외 | 토너먼트를 불러오지 못했습니다 — 잠시 후 다시 시도 | 다시 시도 · 홈으로 |

## 5. 테스트 케이스

| ID | 시나리오 | 결과 |
|---|---|---|
| L01 | 404 → not-found | ✅ |
| L02 | 네트워크 오류 → retryable, 연결 확인 안내 | ✅ |
| L03 | 500 → retryable, 잠시 후 다시 시도 | ✅ |
| L04 | ApiError가 아닌 값 → retryable | ✅ |

로컬 개발 서버에서 Supabase에 접근할 수 없는 상태로 없는 게임 ID를 요청했을 때, 기존에는 404로 응답했을 상황이 500(다시 시도 화면)으로 응답되는 것을 확인했다.

## 6. 변경 파일

| 파일 | 내용 |
|---|---|
| `src/utils/resolveGameId.ts` | `maybeSingle()`, DB 오류 throw |
| `src/app/api/games/[gameId]/participants/route.ts` | try/catch 추가, 500 응답에서 DB 메시지 제거 |
| `src/utils/errorMessage.ts` | `toLoadErrorView()` 추가 |
| `src/hooks/useTournament.ts` | `loadError` · `retryLoad` 반환 |
| `src/components/LoadErrorScreen.tsx` | 실패 화면 (신규) |
| `src/app/tournament/[gameId]/page.tsx` | 실패 시 화면 전환 |
