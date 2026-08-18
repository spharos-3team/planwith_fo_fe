# 2단계: Cursor 룰 + 이미지 퍼블리싱 (완료)

careemong Cursor 룰을 planwith_fo_fe 구조에 맞게 적용했다. 커뮤니티 UI 구현과 Figma MCP 워크플로는 범위에서 제외했다.

## B. Cursor 룰 (4종)

| 파일                                 | 적용           | 요약                                                                                     |
| ------------------------------------ | -------------- | ---------------------------------------------------------------------------------------- |
| `.cursor/rules/code-quality.mdc`     | always         | 상태 객체화, `features`/`services`/`common` 경계, `ApiClientError`·`StatusMessage`, a11y |
| `.cursor/rules/data-fetching.mdc`    | always         | Query + `apiClient`, 서버에서 `apiClient` 금지, BFF Route Handler 금지                   |
| `.cursor/rules/design-system.mdc`    | `src/**/*.tsx` | 토큰·공통 컴포넌트 우선, `/design-system` 참조                                           |
| `.cursor/rules/image-publishing.mdc` | `src/**/*.tsx` | 시안 이미지 기준, `design-system.mdc`와 함께 적용, Figma MCP 금지                        |

### careemong 대비 planwith 변경

- `components/ui`, `components/<feature>/` 경로 사용하지 않음
- `lib/*-server.ts`, Server Action 필수 문구 없음 (후속 PR에서 `serverFetch` 도입 시 승격)
- RSC + NextAuth + BFF 예시 블록 없음

## C. AGENTS.md

Next.js 자동 생성 블록(`<!-- BEGIN:nextjs-agent-rules -->`)은 유지하고, 아래를 추가했다.

- Cursor 룰 4종 인덱스 (`design-system.mdc` 포함)
- **퍼블리싱** — README.md 「시안 퍼블리싱」 링크
- agents-plan (내부 기록)
- 핵심 경로·검증 명령

상세: `README.md` 「시안 퍼블리싱」

## D. 퍼블리싱 워크플로 (이미지/스크린샷)

1. 사용자 시안 + 대상 라우트 확인
2. **`.cursor/rules/design-system.mdc`** — 공통 컴포넌트·토큰 우선
3. `globals.css`, `/design-system`, `src/components/common/` 확인
4. 팀원 workflow·프롬프트: **`README.md` 「시안 퍼블리싱」**
5. Header/Footer/`SiteLayout` route group 유지 후 레이아웃 → 섹션 구현
6. 에셋은 `public/images/<feature>/`에 저장 (외부 MCP URL 커밋 금지)
7. `npm run lint`, `typecheck`, `build`

**금지**: Figma MCP, API 없는 더미 데이터, 시안 대상 외 라우트 리디자인, 토큰·공통 컴포넌트 있는데 raw 스타일 재구현

## E. 에이전트 프롬프트 (화면 구현 시)

아래를 그대로 붙여 넣고 시안 이미지·대상 경로를 채운다.

```text
planwith_fo_fe에서 아래 화면을 구현해줘.

- 대상 라우트: <예: /community>
- 시안: 첨부 이미지/스크린샷 기준 (Figma MCP 사용 금지)
- 준수 룰: design-system.mdc → image-publishing.mdc → code-quality.mdc → data-fetching.mdc
- 팀 가이드: README.md 「시안 퍼블리싱」
- 참고: src/app/globals.css, /design-system, src/components/common/
- 레이아웃: SiteLayout route group — (hero) overlay / (main) solid
- UI: Button / InputField / SelectField / Dialog / StatusMessage 우선, semantic token 우선
- 데이터: API·Query가 없으면 더미 데이터 추가하지 말 것
- 완료: npm run lint, typecheck, build 통과
```

## 검증 (본 단계)

```bash
npm run lint
npm run typecheck
```

코드 변경 없이 룰·문서만 추가했다면 위 두 명령으로 충분하다.

## 이후 (선택)

- `commit-style.mdc`, `pr-style.mdc` (develop 기준 PR)
- `server-only` / `serverFetch` 도입 후 `data-fetching.mdc` 승격
- Vitest·Playwright (핵심 로직·흐름 생긴 뒤)
