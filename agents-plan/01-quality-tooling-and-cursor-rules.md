# 1단계: 품질 검증 (완료)

## 실행한 것

- 스크립트: `typecheck`, `format`, `format:check`, `prepare`
  - `typecheck`: TypeScript 타입만 검사한다. 앱을 실행하지 않고 잘못된 props·타입 오류를 찾는다.
  - `format` / `format:check`: 코드를 Prettier 스타일로 맞추거나, 안 맞춘 파일이 있는지만 확인한다.
  - `prepare`: `npm install` 때 Husky를 설치해서 git 훅이 동작하게 한다.
- Prettier, lint-staged, Husky (`pre-commit`: lint-staged + typecheck, `pre-push`: lint)
  - Prettier: 세미콜론, 따옴표, 줄 길이 같은 코드 모양을 자동으로 통일한다.
  - lint-staged: 커밋에 올라가는 파일만 lint/format 한다. 저장소 전체를 매번 돌리지 않는다.
  - Husky: git 훅이다. 커밋 전에 포맷·타입 검사, push 전에 lint를 강제한다.
- ESLint `simple-import-sort`
  - ESLint는 버그·안티패턴을 잡는 검사기다. `simple-import-sort`는 import 순서를 자동으로 맞춘다.
- `.nvmrc` Node 22
  - 이 프로젝트가 쓰는 Node 메이저 버전이다. 로컬 nvm과 CI가 같은 Node 22를 쓰게 한다.
- PR CI: `pull_request` → `npm ci` → lint → typecheck → format:check → build
  - CI는 GitHub에서 PR마다 자동으로 도는 검사다. 로컬에서 건너뛴 lint/타입/포맷/빌드 오류가 머지 전에 드러난다. `npm ci`는 lockfile 그대로 의존성을 설치한다.
- README 검증 명령 갱신
  - 팀원이 `lint`뿐 아니라 `typecheck`, `format:check`도 돌릴 수 있게 실행 방법을 적어 둔다.

## 다음 범위

1. 데이터 패칭 본분리: 브라우저 `clientFetch` + React Query, 서버 `serverFetch` + `server-only`
2. 디자인 토큰: primitive/semantic, spacing/radius/typography, 프로젝트 폰트, 공통 Button/Input/Select/Dialog
3. `engines.node`와 `packageManager`로 npm/Node 버전 고정
4. 커밋/PR 형식이 필요하면 `commit-style.mdc`, `pr-style.mdc`만 추가
5. 테스트 러너(Vitest)와 Playwright는 핵심 로직·사용자 흐름이 생긴 뒤
