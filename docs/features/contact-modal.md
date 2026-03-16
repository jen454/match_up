# 📬 문의하기 기능 구현 문서

## 개요

Footer에 있던 "피드백" 항목을 제거하고, "문의하기" 클릭 시 모달 폼이 열려
사용자가 제목과 문의 내용을 작성하면 EmailJS를 통해 관리자 이메일로 전송되는 기능을 구현했습니다.

---

## 기술 스택

| 항목 | 내용 |
|------|------|
| 메일 전송 | [EmailJS](https://www.emailjs.com) (`@emailjs/browser`) |
| 이메일 서비스 | Gmail API (EmailJS Gmail 연동) |
| 프론트엔드 | Next.js 15 / React / Tailwind CSS |

---

## 변경 파일 목록

### 1. `src/components/ContactModal.tsx` (신규 생성)

문의 폼 모달 컴포넌트입니다.

- **입력 필드**: 제목(필수), 문의 내용(필수)
- **전송**: EmailJS `send()` 호출 → 관리자 이메일로 전송
- **상태 관리**: `idle` / `loading` / `success` / `error`
- 전송 성공 시 완료 메시지 표시
- 전송 실패 시 에러 메시지 표시
- 모달 외부 클릭 시 닫기

**EmailJS 전송 파라미터**

| 변수 | 설명 |
|------|------|
| `title` | 사용자가 입력한 제목 |
| `message` | 사용자가 입력한 문의 내용 |

---

### 2. `src/components/footers/Footer.tsx` (수정)

- `"use client"` 추가 (useState 사용을 위해)
- `footerSections`에서 `"피드백"` 제거
- `isContactOpen` 상태 추가
- `"문의하기"` 클릭 시 `ContactModal` 오픈

---

### 3. `src/components/footers/FooterSection.tsx` (수정)

- `onLinkClick?: (link: string) => void` prop 추가
- 각 링크 클릭 시 콜백 호출

---

### 4. `src/components/index.ts` (수정)

- `ContactModal` export 추가

---

### 5. `.env.local` (수정)

EmailJS 연동에 필요한 환경변수 3개 추가

```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=...
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=...
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=...
```

---

## EmailJS 템플릿 설정

### 템플릿 변수

| 항목 | 값 |
|------|----|
| To Email | `stukids2765@gmail.com` (고정) |
| From Name | `MatchUp 문의` (고정) |
| From Email | Use Default |
| Reply To | 비워둠 |

### 템플릿 HTML Body

```html
<div style="font-family: system-ui, sans-serif, Arial; font-size: 12px">
  <div>MatchUp 문의가 접수되었습니다.</div>
  <div style="margin-top: 20px; padding: 15px 0; border-width: 1px 0; border-style: dashed; border-color: lightgrey;">
    <table role="presentation">
      <tr>
        <td style="vertical-align: top">
          <div style="padding: 6px 10px; margin: 0 10px; background-color: aliceblue; border-radius: 5px; font-size: 26px;" role="img">
            ✉️
          </div>
        </td>
        <td style="vertical-align: top">
          <div style="color: #2c3e50; font-size: 16px;">
            <strong>{{title}}</strong>
          </div>
          <p style="font-size: 16px;">{{message}}</p>
        </td>
      </tr>
    </table>
  </div>
</div>
```

---

## 동작 흐름

```
사용자: Footer "문의하기" 클릭
  → ContactModal 오픈
  → 제목 / 문의 내용 입력
  → "문의 보내기" 클릭
  → EmailJS API 호출 (title, message 전송)
  → 관리자 Gmail 수신
  → 모달에 "문의가 접수되었습니다 ✅" 표시
```

---

## 설치 패키지

```bash
npm install @emailjs/browser
```

