# PLAN&WITH Frontend

PLAN&WITH 화면 개발을 위한 Next.js 프론트엔드 프로젝트입니다.

## 기술 스택

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- TanStack Query
- React Hook Form · Zod
- Gothic A1 (`next/font`)
- Native Fetch (`src/utils/apiClient.ts`)

## 프로젝트 구조

```text
src/
├─ app/
│  ├─ layout.tsx              # html, Providers (Header/Footer 없음)
│  ├─ (hero)/                 # overlay shell — URL에 안 보임
│  │  ├─ (with-footer)/page.tsx     → /
│  │  └─ schedules/
│  │     ├─ page.tsx                → /schedules (AI 일정 소개 진입)
│  │     └─ ai/new/page.tsx         → /schedules/ai/new (AI 일정 정보 입력)
│  ├─ (main)/                 # solid branded shell
│  │  ├─ (authenticated)/schedules/
│  │  │  ├─ calendar/                → /schedules/calendar
│  │  │  ├─ new/                     → /schedules/new
│  │  │  ├─ [scheduleId]/            → /schedules/[scheduleId]
│  │  │  └─ ai/[generationId]/       → /schedules/ai/[generationId]
│  │  └─ (public)/design-system/              → /design-system
│  └─ globals.css             # 디자인 토큰 (primitive → semantic)
│
├─ features/<domain>/
│  ├─ components/             # 도메인 UI·상호작용
│  ├─ hooks/                  # useQuery / useMutation
│  ├─ schemas/ · types/       # 도메인 전용
│  └─ data/                   # mock (API 없을 때만, 더미 금지 원칙)
│
├─ components/common/         # 2개 이상 도메인 공통 UI
│  ├─ Button.tsx, InputField.tsx, SelectField.tsx, Dialog.tsx, StatusMessage.tsx
│  └─ layout/                 # SiteLayout, Header, Footer, BrandLogo
│
├─ services/<domain>/         # Gateway API 함수
├─ hooks/                     # useApiError 등 전역 hook
├─ types/ · utils/            # apiClient, 공통 타입
└─ ...
```

### 레이어 역할

| 경로                     | 역할                                          |
| ------------------------ | --------------------------------------------- |
| `app/**/page.tsx`        | 라우트, metadata, (가능하면) 서버 데이터 조립 |
| `app/**/layout.tsx`      | **SiteLayout** 으로 Header/Footer shell 제공  |
| `features/*/components/` | 화면 본문 UI. page는 얇게, UI는 feature에     |
| `features/*/hooks/`      | TanStack Query (`services` 호출)              |
| `services/*/`            | `apiClient`로 GET/POST — UI import 금지       |
| `components/common/`     | Button, Input, layout 등 **재사용 UI**        |

### SiteLayout · Header/Footer

- **`SiteLayout`**: Header + `<main>` + Footer. **page에서 import하지 않고** route group `layout.tsx`에서만 사용.
- **variant**
  - `(hero)`: Header **overlay** (투명), Footer 숨김 — `/`, `/schedules`, `/schedules/ai/new`
  - `(main)`: Header **solid** (`bg-header-branded`) + 중립색 Footer — 그 외 페이지
- 신규 페이지: `(main)/(authenticated)` 또는 `(main)/(public)` 하위에 `page.tsx` 추가 → shell 자동 상속

### 데이터 패칭

- 브라우저: `services/*` + TanStack Query (`features/*/hooks`)
- `apiClient`는 **클라이언트 전용** — Server Component / Server Action에서 import하지 않음
- mutation용 `app/api/**` BFF 프록시를 새로 만들지 않음
- API가 없는 영역: 더미/mock 데이터를 임의로 추가하지 않음

## 디자인 시스템

- **쇼케이스:** [http://localhost:3000/design-system](http://localhost:3000/design-system)
- **토큰:** `src/app/globals.css` — color, typography `@utility`, radius, spacing (`gap-stack`, `p-card`, `py-section-y`)
- **폰트:** Gothic A1 only

### 공통 컴포넌트 (있으면 반드시 사용)

| UI      | 컴포넌트                        |
| ------- | ------------------------------- |
| 버튼    | `Button`                        |
| 입력    | `InputField`                    |
| 선택    | `SelectField`                   |
| 모달    | `Dialog`                        |
| 빈/에러 | `StatusMessage`                 |
| shell   | `SiteLayout` (layout.tsx에서만) |

### 스타일 우선순위

```
1. 공통 컴포넌트 (src/components/common/)
2. semantic 토큰 + text-* / bg-* / rounded-* utility
3. /design-system 에 등재된 패턴
4. features/<domain>/ 화면 전용 스타일
5. hex / arbitrary color (최후 — feature 파일 한정)
```

## 시안 퍼블리싱

**Figma MCP는 사용하지 않습니다.** 시안은 **이미지·스크린샷**을 첨부하고, Cursor(또는 IDE)로 구현합니다.

### 작업 순서

1. 시안 이미지 + **대상 URL** 확인 (예: `/community`)
2. `/design-system`에서 토큰·컴포넌트 확인
3. **어느 route group에 넣을지** 결정 — overlay `(hero)` vs solid `(main)`
4. `features/<domain>/components/`에 섹션 단위 구현
5. `npm run lint` · `typecheck` · `build`

### Cursor 프롬프트 템플릿

아래를 복사해 시안 이미지와 함께 붙여 넣습니다.

```text
planwith_fo_fe에서 아래 화면을 시안 이미지 기준으로 퍼블리싱해줘.

【대상】
- 라우트: /community
- 시안: 첨부 스크린샷 (Figma MCP 사용 금지)

【레이아웃】
- route group: (main)/(public) 또는 (authenticated) — SiteLayout solid 상속
- Header/Footer: page에서 SiteLayout import 금지, segment layout 사용

【UI 규칙】
- 공통 컴포넌트 우선: Button, InputField, SelectField, Dialog, StatusMessage
- semantic 토큰 우선: globals.css, /design-system 참고
- raw hex·styled <button>/<input> 새로 만들지 말 것
- Gothic A1, text-heading-* / text-body-* utility 사용

【데이터】
- API·Query 없으면 더미 데이터 추가하지 말 것
- 빈/에러 UI는 StatusMessage

【범위】
- 이 화면만 구현. 다른 라우트 레이아웃·크기 변경 금지

【완료 조건】
- npm run lint, typecheck, build 통과
```

### route group 선택 가이드

| 조건                                                       | group                    |
| ---------------------------------------------------------- | ------------------------ |
| 히어로 위 투명 Header (`/`, `/schedules` 같은 전면 이미지) | `(hero)`                 |
| 일반 페이지 (로그인 Header 하늘색, Footer 포함)            | `(main)/(authenticated)` |
| 비로그인 solid 페이지 (예: design-system)                  | `(main)/(public)`        |

### 체크리스트 (PR 전)

- [ ] `Button` / `InputField` / `SelectField` / `StatusMessage` 등 common 검토했는가
- [ ] `text-text-primary`, `bg-brand-primary` 등 토큰을 썼는가 (hex 없음)
- [ ] `SiteLayout`을 page가 아닌 `layout.tsx`에서 감쌌는가
- [ ] API 없는 목록/카드에 가짜 데이터 넣지 않았는가
- [ ] lint / typecheck / build 통과

### Cursor 룰 (에이전트용)

| 파일                                 | 내용                      |
| ------------------------------------ | ------------------------- |
| `.cursor/rules/design-system.mdc`    | 토큰·공통 컴포넌트 우선   |
| `.cursor/rules/image-publishing.mdc` | 시안 이미지 workflow      |
| `.cursor/rules/code-quality.mdc`     | 상태, 컴포넌트 경계, a11y |
| `.cursor/rules/data-fetching.mdc`    | Query + apiClient         |

에이전트 진입점: `AGENTS.md`

## 로컬 실행

Node.js 22 권장 (`.nvmrc`).

```bash
cp .env.example .env.local   # Windows: copy
npm install
npm run dev
```

`http://localhost:3000`

## API 연결

```text
Browser → Next.js rewrite → Gateway(:8000) → Backend
```

로컬:

```env
GATEWAY_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=/api/v1
```

Vercel은 브라우저에 AWS 주소를 넣지 않습니다. Dashboard → Settings →
Environment Variables 에 다음을 넣습니다 (값은 커밋하지 않음).

```env
GATEWAY_URL=https://<AWS-GATEWAY-DOMAIN>
NEXT_PUBLIC_API_BASE_URL=/api/v1
```

배포 흐름 (Organization `develop` → 개인 Fork → Vercel → AWS Gateway),
GitHub Secret, CORS, JWT 헤더는 [docs/VERCEL-DEPLOY.md](docs/VERCEL-DEPLOY.md)
를 따릅니다.

## 검증

```bash
npm run lint
npm run typecheck
npm run format:check
npm run build
```

PR은 CI에서 동일 검사를 실행합니다 (`pull_request` 트리거).
