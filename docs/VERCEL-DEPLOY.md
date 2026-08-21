# Frontend deploy: Organization → Fork → Vercel → AWS Gateway

This repository is a Next.js app. Vercel deploys the **personal GitHub fork**.
The Organization repo stays the source of truth. Existing `ci.yml` is unchanged.
AWS backend/infra workflows are not part of this frontend repo.

```text
Organization Frontend (spharos-3team/planwith_fo_fe)
        │
        │ push (develop)
        ↓
GitHub Actions (sync-fork.yml)
        │
        │ sync
        ↓
Personal Fork (Vercel Git integration)
        │
        │ push 감지
        ↓
Vercel (build + deploy)
        │
        │ HTTPS 페이지 → same-origin /api/v1 → server rewrite
        ↓
AWS Gateway (:8000)
        │
        ├── Member
        ├── Schedule
        ├── Grade
        └── 기타 서비스
```

---

## 1. Current project (do not change casually)

| Item                    | Value                                            |
| ----------------------- | ------------------------------------------------ |
| Organization            | `spharos-3team/planwith_fo_fe`                   |
| Personal fork           | `bonobonocutie/planwith_fo_fe`                   |
| Default / deploy branch | `develop` (`main` exists but is not the default) |
| Framework               | Next.js `16.3.1` (App Router)                    |
| Package manager         | **npm** (`package-lock.json`)                    |
| Node                    | `.nvmrc` → `22` (`engines.node` `>=20.9.0`)      |
| Existing workflow       | `.github/workflows/ci.yml` (`pull_request` only) |
| Vercel config file      | none — Vercel auto-detects Next.js               |
| API entry               | Next.js rewrite `/api/v1/*` → `GATEWAY_URL`      |

Do not create a `vercel.json` unless Vercel stops detecting Next.js.

Build settings Vercel should use (defaults):

| Setting          | Value                                |
| ---------------- | ------------------------------------ |
| Framework Preset | Next.js                              |
| Install Command  | `npm ci` or `npm install`            |
| Build Command    | `npm run build` (`next build`)       |
| Output           | Next.js default (no custom `output`) |
| Node.js Version  | `22` (from `.nvmrc`)                 |

Optional Vercel env if `prepare` (husky) fails on install: `HUSKY=0`.

---

## 2. Organization → Fork sync

Workflow: `.github/workflows/sync-fork.yml`

| Event                                            | Where it runs     | What it does                                  |
| ------------------------------------------------ | ----------------- | --------------------------------------------- |
| `push` to `develop`                              | Organization only | Pushes that commit to the fork `develop`      |
| `workflow_dispatch`                              | Organization      | Manual sync                                   |
| `schedule` (every 6 hours) / `workflow_dispatch` | Fork only         | `merge-upstream` from the Organization parent |

### Why a PAT is required

GitHub Actions `GITHUB_TOKEN` can write to **the same repository** only. It cannot
push to the personal fork. Use a Personal Access Token (or a GitHub App
installation token) stored as a secret.

Recommended: **fine-grained PAT** owned by the fork account.

1. GitHub → Settings → Developer settings → Fine-grained tokens
2. Resource owner: the fork owner
3. Repository access: only the personal fork
4. Permissions: **Contents: Read and write**
5. Copy the token once. Do not put it in source, README, or workflow files.

Classic PAT alternative: `repo` scope (broader — prefer fine-grained).

GitHub App alternative (org-friendly): install the app on both the Organization
repo and the fork; use `actions/create-github-app-token` in the workflow. The
current workflow is written for a PAT secret.

### GitHub Secret / Variable (Organization repo)

Set these on **`spharos-3team/planwith_fo_fe`** (or as an Organization secret
limited to this repo). Not on Vercel.

| Name              | Type                | Value                                                                      |
| ----------------- | ------------------- | -------------------------------------------------------------------------- |
| `FORK_SYNC_TOKEN` | Secret              | PAT that can push to the fork                                              |
| `FORK_REPOSITORY` | Variable (optional) | `owner/name` of the fork. Default if unset: `bonobonocutie/planwith_fo_fe` |

Repository → Settings → Secrets and variables → Actions.

### Loop prevention

- The Organization job has `if: github.repository == 'spharos-3team/planwith_fo_fe'`.
- Pushing to the fork does **not** run that job.
- The fork backup job runs only on `schedule` / `workflow_dispatch`, never on `push`.
- Result: Organization push → fork push → Vercel, without Organization sync firing again.

### First-time fork Actions

Scheduled workflows on a fork stay disabled until someone opens the fork
**Actions** tab and enables workflows.

The workflow **pushes** to the existing fork `develop`. It does not create a new
clone/project.

If `git push` is rejected because the fork `develop` has extra commits, reset
the fork to Organization `develop` locally (only if you intend the fork to be a
deploy mirror), then re-run **Sync fork**.

---

## 3. Fork → Vercel (Git integration)

Do **not** add a GitHub Actions job that calls `vercel deploy`. Connect Vercel
to the fork.

1. [Vercel Dashboard](https://vercel.com) → Add New → Project
2. Import **`bonobonocutie/planwith_fo_fe`** (the fork, not the Organization repo)
3. Confirm Framework = Next.js, install/build as in the table above
4. Production Branch: **`develop`**
5. Add Environment Variables (next section) **before** the first production deploy
6. Deploy

After that, each fork `develop` push (including Organization sync) triggers Vercel.

---

## 4. API Base URL (AWS Gateway)

The browser must not call Member / Schedule / Grade ports. All HTTP goes:

```text
Frontend → AWS Gateway → Member / Schedule / Grade / ...
```

This app already uses **one Gateway URL** plus a same-origin prefix:

| Env                        | Where                             | Role                    |
| -------------------------- | --------------------------------- | ----------------------- |
| `GATEWAY_URL`              | server (`next.config.ts` rewrite) | Real Gateway origin     |
| `NEXT_PUBLIC_API_BASE_URL` | browser `apiClient`               | `/api/v1` (same origin) |

`next.config.ts` reads `GATEWAY_URL` at **build time**. After changing it on
Vercel, trigger a new deploy.

### Local (`.env.local`, gitignored)

```env
GATEWAY_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=/api/v1
```

Copy from `.env.example`:

```bash
cp .env.example .env.local
```

Windows PowerShell: `Copy-Item .env.example .env.local`

### Vercel Dashboard → Settings → Environment Variables

Apply to Production and Preview (and Development if you use `vercel dev`).

| Name                       | Value                          | Notes                                                                                                                                                                                                 |
| -------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GATEWAY_URL`              | `https://<AWS-GATEWAY-DOMAIN>` | Paste the public Gateway URL yourself. Do not commit it. If Gateway is still HTTP, `http://<AWS-GATEWAY-HOST>:8000` works **only because the rewrite runs on the Vercel server**, not in the browser. |
| `NEXT_PUBLIC_API_BASE_URL` | `/api/v1`                      | Same as local. Do not set this to the AWS host.                                                                                                                                                       |
| `HUSKY`                    | `0`                            | Optional. Skips git hooks during Vercel `npm install`.                                                                                                                                                |

Do not put `localhost` in Vercel env vars.

Why not `NEXT_PUBLIC_API_URL=https://<AWS-GATEWAY-DOMAIN>` on the client?

- A `NEXT_PUBLIC_` value is inlined into the browser bundle.
- Vercel pages are HTTPS. The current AWS Gateway is typically `http://<EIP>:8000`.
  The browser would block that as mixed content.
- Direct browser → Gateway also needs extra CORS origins.
- The existing rewrite keeps the browser on the Vercel origin and lets the
  Next.js server call Gateway.

---

## 5. CORS (Gateway) — analysis only, no backend change

Gateway CORS today (`planwith_gateway` `SecurityConfig` / `application.yaml`)
allows four origins, all on **port 8000** (Gateway itself), via:

- `CORS_ALLOWED_ORIGIN_LOCAL`
- `CORS_ALLOWED_ORIGIN_AWS`
- `CORS_ALLOWED_ORIGIN_LOCALHOST`
- `CORS_ALLOWED_ORIGIN_LOOPBACK`

With the current rewrite, the browser origin is `http://localhost:3000` or
`https://<vercel-domain>`, and it calls **that same origin** `/api/v1`. The
Vercel/Next server then calls Gateway. **Browser CORS against Gateway is not
required** for this path.

If you later change `NEXT_PUBLIC_API_BASE_URL` to the Gateway host, Gateway
must allow:

- `http://localhost:3000`
- `https://<production-vercel-domain>`
- optionally `https://<project>.vercel.app` for previews

Do not set `allowed-origins: *` while `allow-credentials: true`.
Do not add those origins until you actually switch off the rewrite.

---

## 6. Auth (JWT)

Login issues an `accessToken`. Gateway verifies `Authorization: Bearer …`,
strips client identity headers, and sets `X-Auth-User-Id` from JWT `sub`.

The frontend must:

- send `Authorization: Bearer {accessToken}`
- **not** send `X-Auth-User-Id` / `X-Member-UUID` (Gateway ignores client values)

`src/utils/apiClient.ts` attaches the Bearer header when
`setAccessToken()` has stored a token (`src/lib/auth/access-token.ts`, memory only).
Call `setAccessToken(accessToken)` after login and `setAccessToken(null)` on logout.

---

## 7. Local run

Node 22 (`.nvmrc`). npm.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

Checks:

```bash
npm run lint
npm run typecheck
npm run format:check
npm run build
```

---

## 8. Vercel deploy test

1. Organization and fork `develop` match (or run **Sync fork**).
2. Vercel project is connected to the **fork**, production branch `develop`.
3. `GATEWAY_URL` and `NEXT_PUBLIC_API_BASE_URL` are set on Vercel.
4. Push (or sync) to fork `develop` → Vercel deployment succeeds.
5. Open the Vercel URL. Pages load over HTTPS.
6. In the browser Network tab, API calls go to `https://<vercel-domain>/api/v1/...`
   (not to a service port like `:8082` / `:8083`).
7. Gateway on AWS receives `/api/v1/...` and routes to Member / Schedule / Grade.

---

## 9. File / workflow checklist

| File                              | Role                                       |
| --------------------------------- | ------------------------------------------ |
| `.github/workflows/sync-fork.yml` | Organization → fork (and fork backup pull) |
| `.github/workflows/ci.yml`        | Unchanged PR CI                            |
| `.env.example`                    | Local Gateway placeholder                  |
| `docs/VERCEL-DEPLOY.md`           | This document                              |
| `src/lib/auth/access-token.ts`    | accessToken memory storage                 |
| `src/utils/apiClient.ts`          | Optional `Authorization: Bearer`           |
