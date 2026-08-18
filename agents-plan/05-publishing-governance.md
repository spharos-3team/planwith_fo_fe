# 5단계: 퍼블리싱 거버넌스 (Phase C)

Phase A·B(토큰·공통 컴포넌트) 이후, **에이전트·개발자가 시안 퍼블리싱 시 반드시 따를 규칙과 문서**를 한곳에 정리한다.

**관련 룰:** `.cursor/rules/design-system.mdc`, `.cursor/rules/image-publishing.mdc`, `.cursor/rules/code-quality.mdc`  
**선행:** `agents-plan/04-design-tokens-and-common-components.md`

---

## 구현 완료 요약

| 산출물                               | 결과                                                         |
| ------------------------------------ | ------------------------------------------------------------ |
| `.cursor/rules/design-system.mdc`    | ✅ 토큰·공통 컴포넌트 우선순위, sync 절차                    |
| `.cursor/rules/image-publishing.mdc` | ✅ 시안 workflow, SiteLayout route group, design-system 연동 |
| `.cursor/rules/code-quality.mdc`     | ✅ UI 작업 시 design-system 참조                             |
| `AGENTS.md`                          | ✅ 룰 인덱스, agents-plan 링크, 퍼블리싱 요약                |
| `agents-plan/02` D·E절               | ✅ 통합 workflow·프롬프트                                    |
| `agents-plan/04`                     | ✅ Phase A·B·C 완료 기록                                     |
| `README.md`                          | ✅ 디자인 시스템·Cursor 룰 섹션                              |
| 본 문서                              | ✅ Phase C 실행 가이드                                       |

---

## 1. 룰 적용 범위

| 룰                     | `alwaysApply`  | 언제                    |
| ---------------------- | -------------- | ----------------------- |
| `code-quality.mdc`     | true           | 모든 TS/TSX             |
| `data-fetching.mdc`    | true           | API·Query 작업          |
| `design-system.mdc`    | `src/**/*.tsx` | UI·퍼블리싱             |
| `image-publishing.mdc` | `src/**/*.tsx` | 시안·스크린샷 기반 화면 |

**UI PR은 `design-system.mdc` + `image-publishing.mdc`를 함께 적용한다.**

---

## 2. 퍼블리싱 작업 순서

```
시안·대상 라우트 확인
    ↓
design-system.mdc — 공통 컴포넌트·토큰 매핑
    ↓
SiteLayout route group 결정 — (hero) overlay / (main) solid
    ↓
/globals.css + /design-system 참조
    ↓
섹션 구현 (Button → InputField → SelectField → StatusMessage → Dialog)
    ↓
lint / typecheck / build
```

### Route group 빠른 참조

| URL          | group                                    | Shell                |
| ------------ | ---------------------------------------- | -------------------- |
| `/`          | `(hero)/(with-footer)`                   | overlay              |
| `/schedules` | `(hero)/schedules`                       | overlay, footer 없음 |
| 그 외        | `(main)/(authenticated)` 또는 `(public)` | solid branded        |

신규 페이지: `(main)` 하위 segment layout에 `SiteLayout` — **page에서 import 금지**.

---

## 3. 공통 컴포넌트 우선 (필수)

| UI    | 컴포넌트        | raw HTML 금지                 |
| ----- | --------------- | ----------------------------- |
| 버튼  | `Button`        | styled `<button>`             |
| 입력  | `InputField`    | styled `<input>`              |
| 선택  | `SelectField`   | styled `<select>`             |
| 모달  | `Dialog`        | feature별 modal 복붙          |
| 상태  | `StatusMessage` | 커스텀 empty/error box        |
| shell | `SiteLayout`    | page-level Header/Footer wrap |

전체 API·데모: `/design-system`

---

## 4. 토큰 우선 (필수)

```
semantic token (text-*, bg-*, border-line-*)
  → @utility typography (text-heading-*, text-body-*)
  → spacing token (gap-stack, p-card, py-section-y)
  → Tailwind scale (p-4, gap-6)
  → hex / arbitrary (최후, feature 파일 한정 + PR 메모)
```

Quick reference: `agents-plan/04` §5, `/design-system`

---

## 5. 신규 토큰·컴포넌트 sync (PR 필수)

공통 컴포넌트 또는 semantic 토큰을 추가할 때 **같은 PR**에서:

1. `src/app/globals.css` — primitive → semantic → `@theme`
2. `src/components/common/<Component>.tsx`
3. `DesignSystemShowcase.tsx` — 섹션·swatch
4. `.cursor/rules/design-system.mdc` — 표 갱신
5. `agents-plan/04-design-tokens-and-common-components.md` — §6 매핑표

---

## 6. PR·리뷰 체크리스트

- [ ] `design-system.mdc` 우선순위 준수
- [ ] `SiteLayout` route group 패턴 일치
- [ ] 공통 컴포넌트 검토 후 feature raw UI 없음
- [ ] raw hex / 불필요 arbitrary Tailwind 없음
- [ ] API 없는 영역에 더미 데이터 없음
- [ ] Figma MCP 덤프·외부 asset URL 없음
- [ ] `npm run lint`, `typecheck`, `build` 통과

---

## 7. 에이전트 프롬프트 (복사용)

```text
planwith_fo_fe 시안 퍼블리싱:

- 대상 라우트: <경로>
- 시안: 첨부 이미지 (Figma MCP 금지)
- 룰: design-system.mdc → image-publishing.mdc → code-quality.mdc → data-fetching.mdc
- 가이드: agents-plan/05-publishing-governance.md
- 참고: /design-system, src/components/common/, globals.css
- Shell: (hero) overlay / (main) solid — agents-plan/03 참고
- UI: Button / InputField / SelectField / Dialog / StatusMessage 우선
- 토큰: semantic + text-* utility 우선, hex 금지
- 데이터: API 없으면 더미 금지
- 완료: lint, typecheck, build
```

---

## 8. agents-plan 인덱스

| 문서                                        | 내용                                 |
| ------------------------------------------- | ------------------------------------ |
| `01-quality-tooling-and-cursor-rules.md`    | lint/Husky/CI                        |
| `02-cursor-rules-and-image-publishing.md`   | Cursor 룰 4종 요약                   |
| `03-header-footer-sitelayout.md`            | SiteLayout·Header/Footer·route group |
| `04-design-tokens-and-common-components.md` | 토큰·공통 UI Phase A·B               |
| `05-publishing-governance.md`               | **본 문서** — 퍼블리싱 거버넌스      |
