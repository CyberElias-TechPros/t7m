# T7M — Brand Brief Intake

A production-ready client-intake **brand & logo design questionnaire** for a design
agency. Prospective clients fill in a guided, multi-section brief (business fundamentals,
audience, competition, brand personality, visual direction, logo specifics, usage
constraints, deliverables, wrap-up), can attach reference files, and the agency reviews
and manages incoming briefs in an admin dashboard.

## What's inside

| App | Stack | Where it runs |
| --- | --- | --- |
| [`apps/web`](apps/web) — questionnaire + agency dashboard | Next.js 15 (App Router), React 19, Tailwind CSS | **Vercel** |
| [`apps/api`](apps/api) — REST API, submissions, file uploads, admin endpoints | Cloudflare Workers + Hono | **Cloudflare** |
| [`packages/shared`](packages/shared) — questionnaire definition & Zod validation | TypeScript (shared by web & api) | — |

**Cloudflare services used**

- **Workers** — the API runtime.
- **D1** — relational storage of briefs & audit events (`apps/api/migrations`).
- **R2** — client file attachments (sketches, old logos, mood boards, PDFs/ZIPs).
- **KV** — fixed-window rate limiting on submission / upload / admin endpoints.

Durable Objects, Queues, and Cron are intentionally **not** used: the product has no
stateful realtime coordination, no heavy async pipeline (email notifications run via
`waitUntil`), and no scheduled workload. See
[`docs/architecture.md`](docs/architecture.md) for the decision record.

## Product features

**For clients**

- 9-section guided wizard covering every question in the brief, with smart field types:
  radio cards, multi-select chips, tag inputs (adjectives), repeated key/value rows
  (admired brands), textareas, and an "open to suggestions" choice on visual questions.
- Per-section validation with inline errors; free navigation; a final review screen.
- **Draft auto-save** to `localStorage` — closing the tab never loses progress.
- **File attachments** with client-side validation (type/size/count), drag & drop.
- Honeypot spam trap, rate limiting, and a success screen with a brief reference ID.
- Fully responsive and accessible (labelled controls, keyboard support, ARIA).

**For the agency**

- Token-protected admin dashboard: list briefs with search, status filter, pagination.
- Brief detail with all answers rendered by section, attachment downloads, internal
  notes, and a pipeline status workflow (new → reviewed → contacted → won / lost /
  archived).
- **CSV export** of all briefs (one column per questionnaire field).
- Full audit/activity log per brief; delete removes D1 rows, events, and R2 objects.

## Quick start (local development)

Requirements: Node 20+, and [Wrangler](https://developers.cloudflare.com/workers/wrangler/)
(installed automatically as a dev dependency).

```bash
npm install

# 1. API — create local config and run the Worker (local D1/R2/KV emulation)
cp apps/api/.dev.vars.example apps/api/.dev.vars
npm run db:migrate:local
npm run dev:api          # http://localhost:8787

# 2. Web — in another terminal
cp apps/web/.env.example apps/web/.env.local   # points at http://localhost:8787
npm run dev:web          # http://localhost:3000
```

Open http://localhost:3000/brief to fill in the questionnaire, and
http://localhost:3000/admin to sign in (use the `ADMIN_TOKEN` from `apps/api/.dev.vars`).

## Tests & checks

```bash
npm test          # Vitest unit tests (shared schema + api utilities)
npm run typecheck # tsc --noEmit across all workspaces
npm run lint      # ESLint (Next.js)
npm run build     # worker dry-run bundle + Next.js production build
```

## Deployment

### Cloudflare (API)

```bash
cd apps/api

# One-time resource creation (capture the returned IDs)
npx wrangler login
npx wrangler d1 create t7m
npx wrangler r2 bucket create t7m-attachments
npx wrangler kv namespace create RATE_LIMIT
# -> put the D1 database_id and KV id into wrangler.jsonc

# Apply migrations to the remote D1 database
npm run db:migrate:remote

# Secrets (never put real values in wrangler.jsonc)
npx wrangler secret put ADMIN_TOKEN        # strong random token for /admin/*
npx wrangler secret put RATE_LIMIT_SECRET  # long random salt
# Optional: new-brief email notifications via Resend
npx wrangler secret put NOTIFY_EMAIL       # inbox@yourstudio.com
npx wrangler secret put RESEND_API_KEY

# Public (non-secret) vars:
npx wrangler deploy --var CORS_ORIGIN:https://your-app.vercel.app \
  --var PUBLIC_BASE_URL:https://t7m-api.<your-subdomain>.workers.dev

npm run deploy:api
```

### Vercel (frontend)

1. Import the repository in Vercel. The included
   [`apps/web/vercel.json`](apps/web/vercel.json) sets the workspace-aware
   install/build commands (root `npm install` + root `npm run build`).
2. Set the project root to `apps/web` if Vercel asks, or rely on `vercel.json`.
3. Environment variable:
   - `NEXT_PUBLIC_API_BASE_URL` = your deployed Worker URL
     (e.g. `https://t7m-api.<your-subdomain>.workers.dev`).
4. After the first Vercel deploy, set the Worker's `CORS_ORIGIN` to the Vercel URL.

## API overview

| Method & path | Auth | Purpose |
| --- | --- | --- |
| `GET /health` | — | Health check |
| `GET /v1/questionnaire` | — | Questionnaire definition |
| `POST /v1/submissions` | rate-limited | Validate + create a brief |
| `GET /v1/submissions/:id` | capability URL | Public confirmation view of a brief |
| `POST /v1/submissions/:id/attachments` | rate-limited | Multipart file upload (R2) |
| `GET /admin/submissions` | Bearer token | List/search/filter/paginate |
| `GET /admin/submissions/export.csv` | Bearer token | CSV export |
| `GET /admin/submissions/:id` | Bearer token | Brief detail + activity |
| `PATCH /admin/submissions/:id` | Bearer token | Update status / notes |
| `DELETE /admin/submissions/:id` | Bearer token | Delete brief, events & files |
| `GET /admin/submissions/:id/files/:filename` | Bearer token | Download attachment |

Validation is defined once in [`packages/shared`](packages/shared) and enforced
server-side in the Worker; the browser uses the same schema for inline errors.

## Security notes

- Server-side validation is authoritative (Zod) — client validation is UX only.
- Admin endpoints require a constant-time-compared bearer token.
- IPs are never stored raw — only a salted SHA-256 hash for rate limiting.
- File uploads: MIME allow-list, per-file and total size caps, filename sanitization;
  downloads are served with `Content-Disposition: attachment`, `nosniff`, and a
  sandbox CSP so uploaded SVG/HTML can never execute in the dashboard origin.
- Honeypot fields and KV rate limiting blunt bot/form spam.
- Public read uses an unguessable UUID (capability URL) and never exposes internal
  notes or IP hashes.

See [`docs/architecture.md`](docs/architecture.md) for the full architecture and ADRs.
