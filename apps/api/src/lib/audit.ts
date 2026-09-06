/** Audit-event writer: records meaningful admin/client actions in D1. */
import type { Env } from '../env.js';

export async function logEvent(
  db: D1Database,
  params: { submissionId: string | null; actor: string; type: string; detail?: string },
): Promise<void> {
  try {
    await db
      .prepare(
        `INSERT INTO submission_events (submission_id, actor, type, detail, created_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(
        params.submissionId,
        params.actor.slice(0, 200),
        params.type.slice(0, 100),
        (params.detail ?? '').slice(0, 2000),
        new Date().toISOString(),
      )
      .run();
  } catch (err) {
    // Auditing must never break the primary request path.
    console.error('audit log failed', err);
  }
}

export async function listEvents(db: D1Database, submissionId: string, limit = 50) {
  const { results } = await db
    .prepare(
      `SELECT id, submission_id, actor, type, detail, created_at
       FROM submission_events WHERE submission_id = ?
       ORDER BY created_at DESC, id DESC LIMIT ?`,
    )
    .bind(submissionId, limit)
    .all();
  return results ?? [];
}

export type { Env };
