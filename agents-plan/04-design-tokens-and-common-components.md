# 4단계: 디자인 토큰·공통 컴포넌트 (적용 내역)

`agents-plan/01` 다음 범위 **2번**(디자인 토큰·공통 UI)을 planwith 현재 구조에 맞게 적용한 기록이다.  
**왜:** 시안 퍼블리싱마다 hex·raw Tailwind가 반복되고, 공통 UI 경계가 없어 화면마다 스타일이 갈라지는 것을 막기 위함.

**관련 룰:** `.cursor/rules/design-system.mdc`, `.cursor/rules/image-publishing.mdc`  
**쇼케이스:** `/design-system`  
**퍼블리싱 workflow:** `agents-plan/05-publishing-governance.md`

---

## 1. 적용한 것과 이유

### 1.1 디자인 토큰 (`src/app/globals.css`)

| 적용                                                            | 이유                                                        |
| --------------------------------------------------------------- | ----------------------------------------------------------- |
| Primitive → Semantic color (text, surface, brand, status, line) | Tailwind class 이름을 UI 역할에 맞추고, hex 하드코딩을 줄임 |
| `header-branded`, `header-nav-active`, `footer-bar`             | Header/Footer 시안(하늘색 shell)을 토큰으로 고정            |
| Typography `@utility` (`text-heading-*`, `text-body-*` 등)      | Gothic A1 단일 폰트 + 크기·굵기를 유틸로 통일               |
| Radius `--radius-*`                                             | 버튼·카드·pill 반경을 `/design-system`과 일치               |
| Spacing `--space-section-y`, `--space-card`, `--space-stack`    | 반복 간격(`py-16`, `p-6`, `gap-4`)을 semantic으로 승격      |
| Legacy alias (`--primary`, `--muted` 등) **유지**               | 기존 화면 깨짐 없이 점진 마이그레이션                       |

### 1.2 공통 컴포넌트 (`src/components/common/`)

| 컴포넌트        | 적용                                          | 이유                                                |
| --------------- | --------------------------------------------- | --------------------------------------------------- |
| `Button`        | sm/md/lg, primary/secondary/ghost, pill, icon | CTA·폼 버튼 스타일 중복 제거                        |
| `InputField`    | label, error, icon, disabled                  | 폼 a11y(label 연결, `role="alert"`)와 스타일 일원화 |
| `SelectField`   | InputField와 동일 API 패턴                    | select UI를 feature마다 복붙하지 않도록             |
| `Dialog`        | portal, overlay, Escape, `aria-modal`         | 모달 a11y·동작 최소 공통화                          |
| `StatusMessage` | semantic 토큰 연결                            | 빈/에러 UI를 `code-quality.mdc`와 맞춤              |

### 1.3 쇼케이스 (`/design-system`)

- `DesignSystemShowcase`에 color, typography, radius, spacing, effect, 공통 컴포넌트 데모
- **이유:** 에이전트·개발자가 토큰/컴포넌트를 코드 없이 확인하고, 퍼블리싱 시 “이미 있는 것”을 재사용하게 함

### 1.4 화면 hex 정리

- `ScheduleApplicationForm`: `#1e5eda` → `text-brand-primary`, `#22c58b` → `text-status-success`
- **이유:** semantic 토큰이 있는데 arbitrary color를 쓰지 않도록 `design-system.mdc` 원칙을 코드에 반영

### 1.5 퍼블리싱 거버넌스 (Phase C)

| 산출물                                    | 이유                                                          |
| ----------------------------------------- | ------------------------------------------------------------- |
| `.cursor/rules/design-system.mdc`         | 퍼블리싱 시 **공통 컴포넌트 → 토큰** 우선순위를 Cursor에 강제 |
| `.cursor/rules/image-publishing.mdc`      | 시안 이미지 workflow + design-system 연동                     |
| `code-quality.mdc` UI 절                  | SiteLayout 경계, design-system 참조                           |
| `agents-plan/05-publishing-governance.md` | 룰·체크리스트·프롬프트를 한 문서로 통합                       |
| `AGENTS.md`, `README.md`                  | 진입점에서 룰·경로를 바로 찾게 함                             |

---

## 2. 퍼블리싱 우선순위 (현재 기준)

```
1. src/components/common/*
2. globals.css semantic token + text-* / bg-* / rounded-* / spacing token
3. /design-system 등재 패턴
4. features/<domain>/components/ 화면 전용
5. hex / arbitrary (최후 — feature 한정 + PR에 토큰 후보 메모)
```

---

## 3. 토큰 Quick reference

| 용도                 | Tailwind               | CSS 변수              |
| -------------------- | ---------------------- | --------------------- |
| 본문                 | `text-text-primary`    | `--text-primary`      |
| CTA                  | `bg-brand-primary`     | `--brand-primary`     |
| Header/Footer shell  | `bg-header-branded`    | `--header-branded`    |
| Footer copyright bar | `bg-footer-bar`        | `--footer-bar`        |
| Nav active pill      | `bg-header-nav-active` | `--header-nav-active` |
| 입력 테두리          | `border-line-default`  | `--line-default`      |
| 에러                 | `text-status-error`    | `--status-error`      |
| 섹션 여백            | `py-section-y`         | `--space-section-y`   |
| 카드 패딩            | `p-card`               | `--space-card`        |
| 스택 간격            | `gap-stack`            | `--space-stack`       |

전체: `/design-system`, `DesignSystemShowcase.tsx`

---

## 4. 공통 컴포넌트 ↔ UI 매핑

| UI           | 사용                                    |
| ------------ | --------------------------------------- |
| Primary CTA  | `<Button>`                              |
| 텍스트 입력  | `<InputField>`                          |
| 선택 입력    | `<SelectField>`                         |
| 모달         | `<Dialog>`                              |
| 빈/에러      | `<StatusMessage role="alert">`          |
| 페이지 shell | `SiteLayout` (route group `layout.tsx`) |

Shell·Header/Footer 상세: `agents-plan/03-header-footer-sitelayout.md`

---

## 5. 신규 토큰·컴포넌트 추가 시 (sync)

같은 PR에서:

1. `globals.css` — primitive → semantic → `@theme`
2. `src/components/common/<Component>.tsx`
3. `DesignSystemShowcase` 섹션
4. `.cursor/rules/design-system.mdc` 표
5. 본 문서 §1·§4 갱신

---

## 6. 아직 하지 않은 것 (의도적)

| 항목                       | 이유                                  |
| -------------------------- | ------------------------------------- |
| Legacy alias 일괄 삭제     | 기존 화면 regression 위험             |
| Dialog focus trap 고도화   | 현재 최소 a11y만 — 필요 시 후속       |
| spacing 토큰 추가          | 3회 이상 반복될 때만 `--space-*` 확장 |
| shadow scale (landmark 외) | 사용처 생긴 뒤                        |

---

## 7. 검증

```bash
npm run lint
npm run typecheck
npm run build
```

- [x] `/design-system` — spacing, SelectField, Dialog, StatusMessage
- [x] `StatusMessage` semantic 토큰
- [x] `ScheduleApplicationForm` raw hex 제거

---

## 8. 에이전트 참고

팀원용 workflow·프롬프트는 **`README.md` 「시안 퍼블리싱」** 을 사용한다.  
본 문서는 에이전트/히스토리용 내부 기록이다.
