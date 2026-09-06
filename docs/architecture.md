# Architecture

## System overview

```text
                         Prospective clients
                                │
                                ▼
                    ┌───────────────────────┐
                    │   Vercel (Next.js)    │
                    │  /         landing    │
                    │  /brief    wizard     │
                    │  /admin    dashboard  │
                    └───────────┬───────────┘
                                │ HTTPS (JSON / multipart)
                                ▼
                    ┌───────────────────────┐
                    │  Cloudflare Worker    │
                    │  Hono REST API        │
                    └───────────┬───────────┘
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                  ▼
        ┌──────────┐      ┌──────────┐       ┌──────────┐
        │   D1     │      │   R2     │       │   KV     │
        │ briefs,  │      │ attached│       │ rate     │
        │ events   │      │ files   │       │ limits   │
        └──────────┘      └──────────┘       └──────────┘
              │
              ▔ waitUntil → Resend (optional new-brief notification email)
```

The frontend is fully static/client-rendered (no server secrets in the Next app):
the only public configuration is `NEXT_PUBLIC_API_BASE_URL`. All privileged operations
live behind the Worker's bearer-token middleware.

## Packages

- **`packages/shared`** — single source of truth:
  - `questionnaire.ts` — the 9 sections / ~45 fields, their types, options, hints.
  - `schema.ts` — Zod schemas derived from the field definitions, shared validation
    helpers (`formatZodErrors`, `isAnswerEmpty`), domain types.
  - Imported by both the Worker (authoritative server validation) and the Next app
    (inline UX validation + rendering), so the two can never drift.
- **`apps/api`** — Cloudflare Worker (Hono). Data access in `src/lib`, routes in
  `src/app.ts`, entry in `src/index.ts`, D1 migrations in `migrations/`.
- **`apps/web`** — Next.js App Router. Field renderers in `src/components/fields.tsx`,
  wizard in `src/app/brief/page.tsx`, agency UI in `src/app/admin/`.

## Data model (D1)

**`submissions`**

| column | notes |
| --- | --- |
| `id` | UUID (capability URL for the public confirmation view) |
| `contact_name`, `contact_email`, `brand_name` | denormalized for search/list |
| `answers` | JSON of the full validated questionnaire |
| `attachments` | JSON metadata array: R2 key, filename, size, content type |
| `status` | `new` / `reviewed` / `contacted` / `won` / `lost` / `archived` (CHECK) |
| `notes` | internal agency notes (never exposed publicly) |
| `ip_hash` | salted SHA-256 of client IP for abuse control (never raw IP) |
| `created_at`, `updated_at` | ISO timestamps |

Indexes on `created_at DESC`, `status`, `contact_email`.

**`submission_events`** — append-only audit log (`submission_id`, `actor`, `type`,
`detail`, `created_at`) for creation, uploads, status changes, deletes.

## File uploads (R2)

Clients POST `multipart/form-data` to `/v1/submissions/:id/attachments`. The Worker
enforces a MIME allow-list (images, PDF, ZIP), per-file (10 MB) and aggregate (25 MB,
8 files) caps, and sanitizes filenames. Objects are keyed
`<submission-id>/<rand>-<safe-filename>` and never made public; agency downloads go
through the authenticated admin route, which sets `Content-Disposition: attachment`,
`X-Content-Type-Options: nosniff`, and a sandbox CSP — uploaded SVG/HTML cannot execute
in the dashboard's origin.

## Abuse protection (KV)

A fixed-window limiter (`src/lib/security.ts`) throttles submissions (10/hour/IP-hash),
uploads (40/hour), and admin requests (600/min). KV's eventual consistency means limits
are best-effort (adequate for form abuse, not billing). A hidden honeypot field pair
silently drops automated submissions.

## Authentication / authorization

- **Public**: create brief, fetch own brief by unguessable UUID, upload to that UUID.
- **Admin** (`/admin/*` sub-router): `Authorization: Bearer <ADMIN_TOKEN>` compared with
  a constant-time SHA-256 digest comparison. List, detail, notes, status, CSV export,
  file download, and delete all require it. The browser keeps the token in
  `localStorage` and sends it per request; on 401 the user is returned to the sign-in
  screen.

## Observability

- Structured per-request JSON logs with `x-request-id`, method, path, status, latency.
- Worker `observability.logs` enabled in `wrangler.jsonc` (Cloudflare dashboard logs).
- Audit events in D1 give the business-level trail (who/when/what).
- No secrets, tokens, or raw IPs are logged.

## Notifications (optional)

`src/lib/notify.ts` sends a Resend transactional email on new briefs via
`ctx.waitUntil` (never blocks the response). It is a no-op when `RESEND_API_KEY` /
`NOTIFY_EMAIL` are unset, so the API runs identically with or without it.

## Architectural Decision Records

- **Monorepo with a shared validation package instead of duplicating the form schema.**
  The questionnaire is the product; deriving both UI and server validation from one
  definition removes an entire class of drift bugs.
- **Workers + Hono instead of a Node server / framework.** Matches the Cloudflare target
  architecture, cold-starts instantly at the edge, and avoids all Node-only dependencies.
- **D1 for briefs, R2 for attachments, KV only for rate limiting.** Relational data
  stays relational; large binaries never enter D1; KV is not used for source-of-truth
  data given its eventual consistency.
- **No Durable Objects / Queues / Cron.** Nothing requires strongly consistent
  stateful coordination or background pipelines; notification email is fire-and-forget
  via `waitUntil`. Adding them would be complexity without a driving requirement.
- **UUID capability URLs for the public read endpoint** instead of client accounts:
  clients need no password to see their confirmation; IDs are 122-bit random UUIDs and
  the view excludes internal fields. Admin access still requires the bearer token.
- **Token-based admin auth instead of a full user system.** A single studio access
  token matches the real operator (a small agency team) without building registration,
  password resets, or session infrastructure the product doesn't call for.
- **Next.js exported as a static-first client app.** No server-side Next runtime is
  required — it deploys to Vercel as static/CDN assets and talks only to the Worker,
  keeping secrets out of the frontend entirely.
