## 1. 프로젝트 원칙 (Core Principles)
- 실용주의: 과한 추상화나 복잡한 디자인 패턴을 지양하고, 직관적이고 읽기 쉬운 코드를 작성한다.
- 근거 중심 개발: 모든 기술적 결정(라이브러리, 알고리즘)은 선택 후보군을 비교하고 선택 사유를 명시한 뒤 진행한다.
- 문서화 기반 구현: 코드를 작성하기 전, 반드시 해당 기능의 설계 문서를 먼저 생성한다.
---
## 2. 기능 구현 워크플로우 (Step-by-Step)
새로운 기능을 구현할 때 Claude는 반드시 아래 순서를 따른다.

**중요: 각 Step이 끝날 때마다 사용자의 승인(Go/No-go)을 확인한다.**

### Step 1: 기술 제안 (Technical Proposal)
기능 구현에 적합한 알고리즘이나 라이브러리 후보군을 제시한다.
1. 후보군: 2~3가지 대안 제시.
2. 비교 분석: 각 대안의 장단점(복잡도, 유지보수성, Next.js 15 호환성) 비교.
3. 최종 추천 및 사유: MatchUp 프로젝트 성격에 비추어 왜 이 방식이 최선인지 설명.
4. **[Checkpoint]** 승인 시 Step 2로 이동.

### Step 2: 설계 문서 작성 (Documentation)
사용자의 승인을 받은 후, docs/features/{feature-name}.md 파일을 생성한다.
- UI 레이아웃(반응형 구조), 데이터 스키마, 테스트 케이스(Unit/E2E)를 명세한다.
- Context: 기능의 목적.
- Requirements: 필수 기능 및 예외 케이스.
- Tech Stack: 확정된 기술 및 데이터 흐름.
- Implementation Plan: 단계별 구현 순서.
- **[Checkpoint]** 사용자가 문서를 검토하고 승인하면 Step 3로 이동.

### Step 3: 코드 작성 (Implementation)
설계 문서에 따라 실제 코드를 작성하되, 아래 규칙을 준수한다.
- app/ (Next.js 15 App Router) 패러다임 준수
- 먼저 `Vitest`를 사용하여 로직을 검증하는 테스트 코드를 작성한다.
- 테스트를 통과하는 핵심 비즈니스 로직(함수/클래스)을 구현한다.
- 과한 추상화 금지: 불필요한 제네릭이나 고차 컴포넌트 대신 명확한 Props와 로직 사용.
- UI 프레임워크(React)에 의존하지 않는 순수 TypeScript 로직은 반드시 src/utils/에 작성.
- **[Checkpoint]** 로직 정확성 확인 시 Step 4로 이동.

### Step 4: UI 및 상태 관리 구현 (UI & State Management)
* **반응형 UI:** TailwindCSS로 데스크톱/모바일 동시 대응.
* **유연한 데이터 처리:** - 서버 저장이 필요한 경우에만 `Server Actions` 혹은 `Supabase Client` 사용.
    - 빠른 피드백이 필요한 UI 인터랙션은 클라이언트 상태(React State)를 우선 고려.
* 최종 결과물 제출.

### Step 5: 성과 측정 및 결과 리포트 (Metrics & Verification)
기능 구현이 완료되면, 이전 구현체(V1)가 있거나 대안 방식이 있을 경우 아래 지표를 바탕으로 정량적/정성적 개선 사항을 보고한다.

1. **코드 및 로직 효율 (Code Efficiency):**
    - **복잡도 개선:** 불필요한 분기(if/else), 중첩 루프의 제거 또는 시간 복잡도(Big O)의 최적화 여부.
    - **코드 경량화:** 중복 코드 제거를 통한 라인 수(LOC) 변화 및 가독성 향상 정도.

2. **실행 성능 (Runtime Performance):**
    - **처리 속도:** 대량의 데이터 처리나 반복 실행 시 소요 시간(ms) 변화 (Vitest `bench` 또는 `console.time` 활용).
    - **리소스 활용:** 불필요한 메모리 점유나 무거운 라이브러리 의존성 제거 여부.

3. **데이터 및 UI 구조 (Architecture & UX):**
    - **접근성:** 데이터 구조 개선으로 인한 프론트엔드 컴포넌트의 Props 단순화 및 상태 관리 편의성.
    - **유연성:** 향후 요구사항 변경(기능 확장) 시 기존 코드를 얼마나 적게 수정해도 되는지(결합도) 기술.

4. **문서 업데이트 (Final Documentation):**
    - 측정된 수치와 개선 사유를 `docs/features/{feature-name}.md` 하단의 **'Performance & Metrics'** 섹션에 표 형태로 기록한다.
---
## 3. 기술 스택 및 환경 (Tech Stack)
- **Framework**: Next.js 15 (App Router), React 19
- **Language**: TypeScript
- **Styling**: TailwindCSS (Responsive Layout)
- **Backend**: Supabase (Database)
- **Icons**: Lucide React (가벼운 아이콘 라이브러리)
- **Testing:** Vitest (단위 테스트), Playwright (E2E 선택)
---
## 4. 디렉토리 구조 (Directory Structure)
```
/root
├── docs/                # [필수] 모든 기획 및 설계 문서
│   └── features/        # 기능별 스펙 문서 (.md)
├── src/
│   ├── app/             # Page, Layout, Server Actions
│   ├── components/      # Responsive UI Components
│   ├── utils/             # Utils, Shared Algorithms (예: Round Robin)
│   ├── hooks/           # Reusable Hooks (필요시 최소화)
│   └── types/           # TypeScript Definitions
```
