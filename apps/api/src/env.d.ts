import type { SubmissionStatus } from '@t7m/shared';

export interface Env {
  DB: D1Database;
  ATTACHMENTS: R2Bucket;
  RATE_LIMIT: KVNamespace;

  /** Allowed browser origin for CORS. "*" in dev; set to the Vercel URL in production. */
  CORS_ORIGIN: string;
  /** Bearer token used by the admin dashboard. Set via `wrangler secret put ADMIN_TOKEN`. */
  ADMIN_TOKEN: string;
  /** Secret salt for hashing client IPs before storage. */
  RATE_LIMIT_SECRET: string;
  /** Base URL of the API (used for attachment links / notification emails). */
  PUBLIC_BASE_URL: string;
  /** Optional: inbox for new-brief notifications. Empty disables notifications. */
  NOTIFY_EMAIL: string;
  /** Optional: Resend API key. Empty disables notifications. */
  RESEND_API_KEY: string;
}

export interface SubmissionRow {
  id: string;
  contact_name: string;
  contact_email: string;
  brand_name: string;
  answers: string;
  attachments: string;
  status: SubmissionStatus;
  notes: string;
  ip_hash: string;
  created_at: string;
  updated_at: string;
}

export interface EventRow {
  id: number;
  submission_id: string | null;
  actor: string;
  type: string;
  detail: string;
  created_at: string;
}

export type AppEnv = { Bindings: Env; Variables: { requestId: string } };
