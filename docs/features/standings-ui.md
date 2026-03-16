# 순위표 UI 개선 — 설계 문서

> **작성일**: 2026-03-10
> **상태**: ✅ 완료

---

## 1. Context (목적)

순위표(`StandingsTable`)의 가독성 및 UX를 개선한다.

- 이름이 한글 4글자 기준으로 줄바꿈 없이 한 줄에 표시되어야 한다.
- 1등과 꼴등을 시각적으로 즉시 구분할 수 있어야 한다.

---

## 2. Requirements (요구사항)

- [x] 이름 셀: 한글 4글자(4em)까지 줄바꿈 없이 표시
- [x] 1등: 🥇 아이콘이 순위 숫자를 대체
- [x] 꼴등: 💀 아이콘이 순위 숫자를 대체
- [x] 1등 행: 노란 배경(`bg-yellow-50`) + 굵은 글씨
- [x] 꼴등 행: 빨간 배경(`bg-red-50`)
- [x] 참가자 1명일 경우 꼴등 표시 없음
- [x] 아이콘에 `title` 속성으로 실제 순위 숫자 툴팁 제공

---

## 3. 디자인 결정

### 아이콘 배치 방식

표준적인 스포츠 순위표(FIFA 등)를 참고하여 **아이콘이 숫자를 대체**하는 방식을 채택.

| 방식 | 결정 | 이유 |
|------|------|------|
| 아이콘이 숫자를 **대체** | ✅ 채택 | 표준적, 셀 낭비 없음 |
| 아이콘이 숫자 **옆에** | ❌ | 셀 너비 낭비 |
| 아이콘이 숫자 **위에** | ❌ | 행 높이 증가, 비표준 |

```
순위 열:  🥇  /  2  /  3  /  💀
```

### 이름 셀 너비

한글 1글자 ≈ 1em 기준으로 `minWidth: 4em` + `whitespace-nowrap` 조합 적용.
5글자 이상 이름도 줄바꿈 없이 표시되며, 테이블 레이아웃이 일정하게 유지된다.

---

## 4. 변경 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/components/StandingsTable.tsx` | 아이콘 배지, 행 배경색, 이름 셀 nowrap 적용 |
| `src/components/TournamentTable.tsx` | **삭제** — `StandingsTable`로 완전 대체됨 |
| `src/components/index.ts` | `TournamentTable` export 제거 |

---

## 5. 코드 상세

```typescript
// 순위 배지 결정
const getRankBadge = (index: number) => {
  if (index === 0) return "🥇";
  if (index === lastIndex && standings.length > 1) return "💀";
  return null;
};

// 행 배경색 결정
const getRowClass = (index: number) => {
  if (index === 0) return "text-center bg-yellow-50 font-semibold";
  if (index === lastIndex && standings.length > 1) return "text-center bg-red-50";
  return "text-center";
};

// 이름 셀 — 4글자까지 줄바꿈 없이
<span className="whitespace-nowrap" style={{ minWidth: "4em", display: "inline-block" }}>
  {standing.name}
</span>

// 순위 셀 — 아이콘이 숫자 대체, title로 실제 순위 툴팁
{badge ? <span title={`${index + 1}위`}>{badge}</span> : index + 1}
```

