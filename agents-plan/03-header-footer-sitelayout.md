# 3단계: SiteLayout + Header/Footer 시안 적용

시안 이미지 기준 Header(하늘색·로그인) / Footer(검정 + 하단 블루 바)를 공통 컴포넌트에 반영하고,  
`ScheduleLayout` → **`SiteLayout`** rename + **route group** 으로 shell variant를 관리한다.

**퍼블리싱:** Figma MCP 없음 — 첨부 스크린샷 기준 (`.cursor/rules/image-publishing.mdc`)  
**검증:** `npm run lint` / `typecheck` / `build`

---

## 구현 완료 요약 (2026-08-18)

### Phase 0 — SiteLayout rename ✅

| 항목                      | 결과                                               |
| ------------------------- | -------------------------------------------------- |
| `ScheduleLayout.tsx` 삭제 | ✅                                                 |
| `SiteLayout.tsx` 신규     | ✅ `footerVariant` prop 포함                       |
| 코드 참조                 | ✅ `ScheduleLayout` import 0건 (문서·룰 파일 제외) |

### Phase 1 — Route group ✅

실제 구조 (Next.js nested layout으로 footer/auth override):

```
app/
  layout.tsx
  (hero)/
    layout.tsx                         # pass-through
    (with-footer)/
      layout.tsx                       # SiteLayout overlay + footer
      page.tsx                         # /
    schedules/
      layout.tsx                       # SiteLayout overlay, showFooter=false
      page.tsx                         # /schedules
  (main)/
    layout.tsx                         # pass-through
    (authenticated)/
      layout.tsx                       # SiteLayout solid, authenticated
      schedules/calendar/page.tsx      # /schedules/calendar
    (public)/
      layout.tsx                       # SiteLayout solid, authenticated=false
      design-system/page.tsx           # /design-system
```

| URL                   | group                | Header          | Footer | showFooter |
| --------------------- | -------------------- | --------------- | ------ | ---------- |
| `/`                   | hero/(with-footer)   | overlay         | —      | false      |
| `/schedules`          | hero/schedules       | overlay         | —      | false      |
| `/schedules/calendar` | main/(authenticated) | solid (branded) | solid  | true       |
| `/design-system`      | main/(public)        | solid           | solid  | true       |

삭제된 구 경로: `app/page.tsx`, `app/schedules/**`, `app/design-system/**`

### Phase 2 — Header/Footer 시안 ✅

**Header (`solid`)**

- 배경: `bg-header-branded` (`#7ab8ff`)
- nav: 텍스트 **홈 · 일정관리 · 커뮤니티 · 마이페이지 · 검색** + dropdown chevron
- active: `bg-header-nav-active` pill
- 로그인 우측: 채팅 → 알림 → 500 → 태고왕님 → 프로필
- `overlay` (`/`, `/schedules`): 투명 배경 유지, 동일 텍스트 nav + 여행 하기 CTA

**Footer**

- `variant="solid"`: `bg-black` + `bg-footer-bar` copyright bar
- `variant="overlay"`: 투명 본문, copyright bar **미표시**
- 카피: Juseok MatJib, YOON HWI MYUING 반영

**토큰 (`globals.css`)**

- `--header-branded: #7ab8ff`
- `--header-nav-active: var(--primitive-blue-700)`
- `--footer-bar: #78b7f3` (기존 유지)

### Phase 3 — 문서·검증 ✅

| 항목                               | 결과                              |
| ---------------------------------- | --------------------------------- |
| `DesignSystemShowcase` Layout 섹션 | ✅ SiteLayout / variant 설명 갱신 |
| `npm run lint`                     | ✅                                |
| `npm run typecheck`                | ✅ (`.next` stale 후 재생성)      |
| `npm run build`                    | ✅                                |

### 검증 체크리스트

- [x] `/` — Header/Footer overlay
- [x] `/schedules` — Header overlay, Footer 없음
- [x] `/schedules/calendar`, `/design-system` — Header branded, Footer solid
- [x] solid active — 일정관리 pill + chevron
- [x] solid 로그인 — 채팅·알림·500·이름·프로필 순서
- [x] `(main)` 신규 페이지는 segment layout에 SiteLayout 추가만 하면 shell 적용
- [x] `ScheduleLayout` 코드 참조 0건
- [x] lint / typecheck / build 통과

### 후속 (미구현)

- [ ] `/community` 등 `(main)/(public)` 또는 `(authenticated)` 하위 페이지
- [ ] Header 드롭다운 패널 (chevron UI만 존재)
- [ ] 사용자명·토큰 auth API 연동
- [ ] `agents-plan/02`, `.cursor/rules/image-publishing.mdc`의 ScheduleLayout → SiteLayout 문구 정리

---

## 1. 목표 (원 계획)

| 항목         | 내용                                                        |
| ------------ | ----------------------------------------------------------- |
| Shell rename | `ScheduleLayout` → `SiteLayout` (전역 공통 레이아웃 shell)  |
| Route group  | `(hero)` overlay / `(main)` branded 기본값 분리             |
| Header       | solid = 하늘색 시안, overlay = 투명 (히어로 위)             |
| Footer       | solid = 검정 + 블루 바, overlay = 투명 (copyright bar 숨김) |
| 투명 예외    | **`/`**, **`/schedules`** 만 overlay                        |
| 그 외        | branded Header + branded Footer                             |

---

## 2. 아키텍처 — Route group + SiteLayout

### 2.1 SiteLayout props

```tsx
interface SiteLayoutProps {
  children: ReactNode;
  authenticated?: boolean;
  activeHref?: string;
  headerVariant?: "overlay" | "solid";
  footerVariant?: "overlay" | "solid"; // 생략 시 headerVariant와 동일
  showFooter?: boolean;
}
```

### 2.2 variant 전달 원칙

- ✅ layout segment props로 선언
- ❌ Header/Footer 내부 `usePathname()` 분기
- ❌ `app/layout.tsx`에 Header/Footer 직접 배치

---

## 3. Header 시안 (`solid` variant)

| variant   | 배경                | nav                      | 우측                                           |
| --------- | ------------------- | ------------------------ | ---------------------------------------------- |
| `overlay` | transparent         | 텍스트 nav + active pill | 비로그인: 여행 하기                            |
| `solid`   | `bg-header-branded` | 텍스트 nav + active pill | 로그인: MessageCircle, Bell, 500, 이름, 프로필 |

---

## 4. Footer 시안

| variant   | 본문             | copyright bar        |
| --------- | ---------------- | -------------------- |
| `solid`   | `bg-black`       | `bg-footer-bar` 표시 |
| `overlay` | `bg-transparent` | **렌더링 안 함**     |

---

## 5. Design tokens

```css
--header-branded: #7ab8ff;
--header-nav-active: var(--primitive-blue-700);
--footer-bar: #78b7f3;
```

---

## 6. 변경 파일 목록 (구현됨)

| 작업   | 파일                                                                             |
| ------ | -------------------------------------------------------------------------------- |
| rename | `ScheduleLayout.tsx` → `SiteLayout.tsx`                                          |
| 신규   | `app/(hero)/**`, `app/(main)/**` segment layouts                                 |
| 수정   | `Header.tsx`, `Footer.tsx`, `globals.css`, `DesignSystemShowcase.tsx`            |
| 삭제   | `app/page.tsx`, `app/schedules/**`, `app/design-system/**`, `ScheduleLayout.tsx` |

---

## 7. 확정 의사결정

| 항목                  | 결정                                                                                          |
| --------------------- | --------------------------------------------------------------------------------------------- |
| Shell 이름            | **SiteLayout**                                                                                |
| 레이아웃 구조         | **route group `(hero)` / `(main)`** + nested `(with-footer)` / `(authenticated)` / `(public)` |
| overlay 경로          | **`/`**, **`/schedules`** only                                                                |
| `/schedules/calendar` | **solid** (`(main)/(authenticated)`)                                                          |
| 네비 라벨             | **일정관리**                                                                                  |
| `/` Footer            | overlay — copyright bar 숨김                                                                  |
| 사용자명              | 하드코딩 `태고왕님` → 후속 auth                                                               |

---

## 8. 에이전트 프롬프트 (신규 페이지 추가 시)

```text
(main) route group 하위에 페이지를 추가할 때:

- 로그인 UI: app/(main)/(authenticated)/<route>/page.tsx
- 비로그인 UI: app/(main)/(public)/<route>/page.tsx
- shell은 segment layout의 SiteLayout이 제공 — page에서 SiteLayout import 금지
- overlay가 필요하면 (hero) group 하위로 분리
```
