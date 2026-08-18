# PLAN&WITH Frontend

PLAN&WITH 화면 개발을 위한 Next.js 프론트엔드 기본 프로젝트입니다.

## 기술 스택

- Next.js App Router
- TypeScript
- Tailwind CSS
- TanStack Query
- React Hook Form
- Zod
- Native Fetch

## 프로젝트 구조

도메인 폴더는 해당 기능을 개발할 때 생성합니다. 아래의 `schedule`, `member`는 배치 예시입니다.

```text
src/
├─ app/
│  └─ schedules/                 # 페이지와 URL 라우팅
│
├─ features/
│  └─ schedule/
│     ├─ components/             # 일정 기능 전용 UI
│     ├─ hooks/                  # 일정 전용 상태와 Query
│     ├─ schemas/                # 일정 Form 검증
│     └─ types/                  # 일정 전용 타입
│
├─ components/
│  └─ common/                    # 여러 도메인에서 사용하는 공통 UI
│
├─ services/
│  ├─ schedule/                  # 일정 API 통신
│  └─ member/                    # 회원 API 통신
│
├─ hooks/                        # 전역 공통 Hook
├─ types/                        # 공통 API 타입
├─ schemas/                      # 도메인 공통 Schema
└─ utils/                        # HTTP, 날짜 등 공통 유틸
```

### 디렉터리 책임

- `app`: App Router 페이지와 레이아웃만 담당합니다.
- `features`: 도메인 기능의 UI, 상태, Form 및 비즈니스 흐름을 구성합니다.
- `components/common`: 두 개 이상의 도메인에서 재사용하는 UI만 배치합니다.
- `services`: Gateway를 통해 호출하는 백엔드 API를 서비스별로 분리합니다.
- `hooks`, `types`, `schemas`, `utils`: 여러 도메인에서 공유하는 코드만 배치합니다.
- 특정 도메인에서만 사용하는 Hook, 타입, Schema는 해당 `features` 내부에 둡니다.

## 로컬 실행

Node.js 20.9 이상이 필요합니다.

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

Windows에서 상위 경로에 `&`가 포함되어 npm script 실행이 실패하면 다음과 같이 직접 실행합니다.

```powershell
node node_modules/next/dist/bin/next dev
```

## API 연결

브라우저 요청은 Next.js rewrite를 거쳐 Gateway로 전달됩니다.

```text
Browser → Next.js → Gateway(:8000) → Backend Services
```

환경 변수:

```env
GATEWAY_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=/api/v1
```

별도의 Express 서버는 사용하지 않습니다.

## 검증

```powershell
npm run lint
npm run typecheck
npm run format:check
npm run build
```

경로에 `&`가 포함된 Windows 환경에서는 다음 명령을 사용합니다.

```powershell
node node_modules/eslint/bin/eslint.js .
node node_modules/typescript/bin/tsc --noEmit
node node_modules/prettier/bin/prettier.cjs --check .
node node_modules/next/dist/bin/next build
```
