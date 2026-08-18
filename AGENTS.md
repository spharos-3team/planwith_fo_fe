<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Cursor rules

| 파일                                 | 내용                                               |
| ------------------------------------ | -------------------------------------------------- |
| `.cursor/rules/code-quality.mdc`     | 상태, 컴포넌트 경계, import 순서, a11y             |
| `.cursor/rules/data-fetching.mdc`    | React Query + `apiClient` 가드레일                 |
| `.cursor/rules/design-system.mdc`    | **디자인 토큰·공통 컴포넌트 우선** (퍼블리싱 필수) |
| `.cursor/rules/image-publishing.mdc` | 사진/스크린샷 기반 퍼블리싱 (Figma MCP 없음)       |

## 퍼블리싱 (시안 적용 시)

Cursor 에이전트·팀원 공통: **`README.md` 「시안 퍼블리싱」** 참고.

- 룰: `design-system.mdc` → `image-publishing.mdc`
- 참고: `/design-system`, `src/components/common/`, `globals.css`
- Shell: `SiteLayout` route group — `(hero)` overlay / `(main)` solid

## agents-plan (내부)

에이전트·히스토리용. **팀원 퍼블리싱 가이드는 `README.md`.**

## 핵심 경로

- HTTP: `src/utils/apiClient.ts`, `src/types/api.ts`, `src/hooks/useApiError.ts`
- 도메인: `src/features/<domain>/`, `src/services/<domain>/`
- 공통 UI: `src/components/common/` (`Button`, `InputField`, `SelectField`, `Dialog`, `Modal`, `Badge`, `StatusMessage`), `src/app/globals.css`
- Shell: `src/components/common/layout/SiteLayout.tsx`, `app/(hero)/`, `app/(main)/`
- 디자인 참고: `/design-system` (`src/app/design-system/`)

## 검증

- `npm run lint` / `typecheck` / `build`
- 로컬 브라우저 확인은 사용자가 수행한다.
