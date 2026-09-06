import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type {
  AttachmentMeta,
  SubmissionStatus,
} from '@t7m/shared';
import {
  SECTIONS,
  ALL_FIELDS,
  submissionRequestSchema,
  statusUpdateSchema,
  formatZodErrors,
  SUBMISSION_STATUSES,
  MAX_FILE_BYTES,
  MAX_UPLOAD_BYTES,
  ALLOWED_UPLOAD_TYPES,
} from '@t7m/shared';
import type { AppEnv, Env, SubmissionRow } from './env.js';
import { generateId } from './lib/ids.js';
import { timingSafeEqual, hashIp, rateLimit, clientIp } from './lib/security.js';
import { rowToSubmission, rowToSummary, toPublicView } from './lib/store.js';
import { logEvent, listEvents } from './lib/audit.js';
import { notifyNewSubmission } from './lib/notify.js';
import { toCsv } from './lib/csv.js';
import { sanitizeFilename } from './lib/filename.js';

const MAX_ATTACHMENT_COUNT = 8;

export function createApp() {
  const app = new Hono<AppEnv>();

  // ---- CORS ---------------------------------------------------------------
  app.use('*', async (c, next) => {
    const origin = c.env.CORS_ORIGIN || '*';
    const corsMiddleware = cors({
      origin: origin === '*' ? '*' : origin.split(',').map((s) => s.trim()),
      allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400,
    });
    return corsMiddleware(c, next);
  });

  // ---- Request ID + basic access logging -----------------------------------
  app.use('*', async (c, next) => {
    const requestId = c.req.header('x-request-id') ?? generateId();
    c.set('requestId', requestId);
    c.header('x-request-id', requestId);
    const start = Date.now();
    await next();
    console.log(
      JSON.stringify({
        requestId,
        method: c.req.method,
        path: new URL(c.req.url).pathname,
        status: c.res.status,
        ms: Date.now() - start,
      }),
    );
  });

  // ---- Health --------------------------------------------------------------
  app.get('/health', (c) =>
    c.json({ ok: true, service: 't7m-api', time: new Date().toISOString() }),
  );

  // ---- Questionnaire definition (for API consumers) -------------------------
  app.get('/v1/questionnaire', (c) => c.json({ sections: SECTIONS }));

  // ======================================================================
  //  PUBLIC API
  // ======================================================================

  // ---- Create submission ---------------------------------------------------
  app.post('/v1/submissions', async (c) => {
    const ip = clientIp(c.req.raw.headers);
    const ipHash = await hashIp(ip, c.env.RATE_LIMIT_SECRET || 'unset');

    const rl = await rateLimit(c.env.RATE_LIMIT, `sub:${ipHash}`, 10, 3600);
    if (!rl.allowed) {
      c.header('Retry-After', String(rl.retryAfter));
      return c.json({ error: 'Too many submissions. Please try again later.' }, 429);
    }

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body.' }, 400);
    }

    const parsed = submissionRequestSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Validation failed', fields: formatZodErrors(parsed.error) }, 422);
    }
    const { answers } = parsed.data;

    const id = generateId();
    const now = new Date().toISOString();
    const contactName = String(answers.contactName || '').slice(0, 200);
    const contactEmail = String(answers.contactEmail || '').slice(0, 320);
    const brandName = String(answers.brandName || '').slice(0, 200);

    await c.env.DB.prepare(
      `INSERT INTO submissions
        (id, contact_name, contact_email, brand_name, answers, attachments, status, notes, ip_hash, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, '[]', 'new', '', ?, ?, ?)`,
    )
      .bind(id, contactName, contactEmail, brandName, JSON.stringify(answers), ipHash, now, now)
      .run();

    await logEvent(c.env.DB, { submissionId: id, actor: contactEmail || 'anonymous', type: 'submission.created' });

    // Fire-and-forget notification (no-op if unconfigured).
    c.executionCtx.waitUntil(
      notifyNewSubmission(c.env, { id, brandName, contactName, contactEmail }),
    );

    return c.json({ id, status: 'new' }, 201);
  });

  // ---- Read submission (capability URL — id is an unguessable UUID) ---------
  app.get('/v1/submissions/:id', async (c) => {
    const row = await getSubmission(c.env.DB, c.req.param('id'));
    if (!row) return c.json({ error: 'Submission not found.' }, 404);
    return c.json(toPublicView(rowToSubmission(row)));
  });

  // ---- Upload attachment ----------------------------------------------------
  app.post('/v1/submissions/:id/attachments', async (c) => {
    const id = c.req.param('id');
    const row = await getSubmission(c.env.DB, id);
    if (!row) return c.json({ error: 'Submission not found.' }, 404);

    const ip = clientIp(c.req.raw.headers);
    const ipHash = await hashIp(ip, c.env.RATE_LIMIT_SECRET || 'unset');
    const rl = await rateLimit(c.env.RATE_LIMIT, `upload:${ipHash}`, 40, 3600);
    if (!rl.allowed) {
      c.header('Retry-After', String(rl.retryAfter));
      return c.json({ error: 'Too many uploads. Please try again later.' }, 429);
    }

    let form: FormData;
    try {
      form = await c.req.formData();
    } catch {
      return c.json({ error: 'Expected multipart/form-data with a "file" field.' }, 400);
    }
    // Duck-type: Hono/Workers return a File-like object; string means a form field.
    const rawFile: unknown = form.get('file');
    const isFile =
      rawFile !== null &&
      typeof rawFile === 'object' &&
      typeof (rawFile as File).name === 'string' &&
      typeof (rawFile as File).size === 'number';
    if (!isFile) {
      return c.json({ error: 'No file uploaded. Include a "file" field.' }, 400);
    }
    const file = rawFile as File;

    if (file.size > MAX_FILE_BYTES) {
      return c.json({ error: `File too large. Max ${MAX_FILE_BYTES / 1024 / 1024} MB per file.` }, 413);
    }
    const contentType = file.type || 'application/octet-stream';
    if (!ALLOWED_UPLOAD_TYPES.includes(contentType as (typeof ALLOWED_UPLOAD_TYPES)[number])) {
      return c.json(
        { error: `File type "${contentType}" not allowed. Allowed: images, PDF, ZIP.` },
        415,
      );
    }

    const submission = rowToSubmission(row);
    const currentTotal = submission.attachments.reduce((sum, a) => sum + a.size, 0);
    if (submission.attachments.length >= MAX_ATTACHMENT_COUNT) {
      return c.json({ error: `At most ${MAX_ATTACHMENT_COUNT} files per brief.` }, 400);
    }
    if (currentTotal + file.size > MAX_UPLOAD_BYTES) {
      return c.json(
        { error: `Total attachment size limited to ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.` },
        413,
      );
    }

    const safeName = sanitizeFilename(file.name);
    const key = `${id}/${generateId().slice(0, 8)}-${safeName}`;
    await c.env.ATTACHMENTS.put(key, file.stream(), {
      httpMetadata: { contentType },
      customMetadata: { submissionId: id, originalName: safeName },
    });

    const meta: AttachmentMeta = { key, filename: safeName, size: file.size, contentType };
    const attachments = [...submission.attachments, meta];
    const now = new Date().toISOString();
    await c.env.DB.prepare(
      `UPDATE submissions SET attachments = ?, updated_at = ? WHERE id = ?`,
    )
      .bind(JSON.stringify(attachments), now, id)
      .run();

    await logEvent(c.env.DB, {
      submissionId: id,
      actor: submission.contactEmail || 'anonymous',
      type: 'attachment.uploaded',
      detail: `${safeName} (${file.size} bytes)`,
    });

    return c.json({ ok: true, attachment: meta, count: attachments.length }, 201);
  });

  // ======================================================================
  //  ADMIN API (bearer token)
  // ======================================================================

  const admin = new Hono<AppEnv>();

  admin.use('*', async (c, next) => {
    const expected = c.env.ADMIN_TOKEN;
    // Fail closed if unconfigured or still using the committed dev placeholder.
    if (!expected || expected === 'dev-admin-token-change-me') {
      return c.json({ error: 'Admin token not configured. Set the ADMIN_TOKEN secret.' }, 503);
    }
    const header = c.req.header('Authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    const ok = await timingSafeEqual(token, expected);
    if (!ok) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    // Light throttle on admin endpoints too (per token hash).
    const ipHash = await hashIp(clientIp(c.req.raw.headers), c.env.RATE_LIMIT_SECRET || 'unset');
    const rl = await rateLimit(c.env.RATE_LIMIT, `admin:${ipHash}`, 600, 60);
    if (!rl.allowed) return c.json({ error: 'Rate limited.' }, 429);
    await next();
  });

  admin.get('/submissions', async (c) => {
    const status = c.req.query('status');
    const q = (c.req.query('q') ?? '').trim();
    const page = Math.max(1, Number.parseInt(c.req.query('page') ?? '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(c.req.query('limit') ?? '25', 10) || 25));
    const offset = (page - 1) * limit;

    const where: string[] = [];
    const binds: (string | number)[] = [];
    if (status && SUBMISSION_STATUSES.includes(status as SubmissionStatus)) {
      where.push('status = ?');
      binds.push(status);
    }
    if (q) {
      where.push('(brand_name LIKE ? OR contact_name LIKE ? OR contact_email LIKE ?)');
      const like = `%${q}%`;
      binds.push(like, like, like);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countRow = await c.env.DB.prepare(
      `SELECT COUNT(*) as n FROM submissions ${whereSql}`,
    )
      .bind(...binds)
      .first<{ n: number }>();
    const total = countRow?.n ?? 0;

    const { results } = await c.env.DB.prepare(
      `SELECT id, contact_name, contact_email, brand_name, answers, attachments, status, notes, ip_hash, created_at, updated_at
       FROM submissions ${whereSql}
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    )
      .bind(...binds, limit, offset)
      .all();

    return c.json({
      items: (results ?? []).map((r) => rowToSummary(r)),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  });

  admin.get('/submissions/export.csv', async (c) => {
    const { results } = await c.env.DB.prepare(
      `SELECT * FROM submissions ORDER BY created_at DESC`,
    ).all();
    const submissions = (results ?? []).map((r) => rowToSubmission(r as unknown as SubmissionRow));

    const metaCols = ['contactName', 'contactEmail', 'brandName'];
    const answerCols = ALL_FIELDS.filter((f) => !metaCols.includes(f.id)).map((f) => f.id);
    const columns = ['id', 'createdAt', 'status', ...metaCols, ...answerCols, 'attachments'];
    const rows = submissions.map((s) => {
      const row: Record<string, unknown> = {
        id: s.id,
        createdAt: s.createdAt,
        status: s.status,
        contactName: s.contactName,
        contactEmail: s.contactEmail,
        brandName: s.brandName,
        attachments: s.attachments.map((a) => a.filename).join(' | '),
      };
      for (const col of answerCols) row[col] = (s.answers as Record<string, unknown>)[col] ?? '';
      return row;
    });

    const csv = toCsv(rows, columns);
    return c.body(csv, 200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="brand-briefs-${new Date().toISOString().slice(0, 10)}.csv"`,
    });
  });

  admin.get('/submissions/:id', async (c) => {
    const row = await getSubmission(c.env.DB, c.req.param('id'));
    if (!row) return c.json({ error: 'Submission not found.' }, 404);
    const events = await listEvents(c.env.DB, row.id);
    return c.json({ submission: rowToSubmission(row), events });
  });

  admin.patch('/submissions/:id', async (c) => {
    const id = c.req.param('id');
    const row = await getSubmission(c.env.DB, id);
    if (!row) return c.json({ error: 'Submission not found.' }, 404);

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body.' }, 400);
    }

    const statusParsed = statusUpdateSchema.partial().safeParse(
      typeof body === 'object' && body !== null ? body : {},
    );
    const notes = typeof body === 'object' && body !== null && 'notes' in body ? body.notes : undefined;

    if (!statusParsed.success && typeof notes !== 'string') {
      return c.json({ error: 'Provide a valid status and/or notes.' }, 422);
    }

    const current = rowToSubmission(row);
    const nextStatus = statusParsed.success ? statusParsed.data.status ?? current.status : current.status;
    const nextNotes = typeof notes === 'string' ? notes.slice(0, 5000) : current.notes;
    const now = new Date().toISOString();

    await c.env.DB.prepare(
      `UPDATE submissions SET status = ?, notes = ?, updated_at = ? WHERE id = ?`,
    )
      .bind(nextStatus, nextNotes, now, id)
      .run();

    if (nextStatus !== current.status) {
      await logEvent(c.env.DB, {
        submissionId: id,
        actor: 'admin',
        type: 'status.changed',
        detail: `${current.status} → ${nextStatus}`,
      });
    }

    const updated = await getSubmission(c.env.DB, id);
    if (!updated) return c.json({ error: 'Submission vanished.' }, 500);
    return c.json(rowToSubmission(updated));
  });

  admin.delete('/submissions/:id', async (c) => {
    const id = c.req.param('id');
    const row = await getSubmission(c.env.DB, id);
    if (!row) return c.json({ error: 'Submission not found.' }, 404);

    const submission = rowToSubmission(row);
    // Best-effort removal of stored files.
    for (const att of submission.attachments) {
      try {
        await c.env.ATTACHMENTS.delete(att.key);
      } catch (err) {
        console.error('failed to delete attachment', att.key, err);
      }
    }
    await c.env.DB.prepare(`DELETE FROM submissions WHERE id = ?`).bind(id).run();
    await c.env.DB.prepare(`DELETE FROM submission_events WHERE submission_id = ?`).bind(id).run();
    await logEvent(c.env.DB, { submissionId: null, actor: 'admin', type: 'submission.deleted', detail: id });
    return c.json({ ok: true });
  });

  admin.get('/submissions/:id/files/:filename', async (c) => {
    const row = await getSubmission(c.env.DB, c.req.param('id'));
    if (!row) return c.json({ error: 'Submission not found.' }, 404);
    const target = c.req.param('filename');
    const submission = rowToSubmission(row);
    const meta = submission.attachments.find((a) => a.filename === target);
    if (!meta) return c.json({ error: 'File not found.' }, 404);

    const obj = await c.env.ATTACHMENTS.get(meta.key);
    if (!obj) return c.json({ error: 'File missing from storage.' }, 404);

    // Force download + sandbox — prevents stored SVG/HTML from executing.
    const headers = new Headers();
    obj.writeHttpMetadata(headers);
    headers.set('Content-Type', meta.contentType);
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(meta.filename)}"`);
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Content-Security-Policy', "sandbox; default-src 'none'");
    return new Response(obj.body, { headers });
  });

  app.route('/admin', admin);

  // ---- 404 + error fallbacks ------------------------------------------------
  app.notFound((c) => c.json({ error: 'Not found.' }, 404));
  app.onError((err, c) => {
    console.error('unhandled error', err);
    return c.json({ error: 'Internal server error.', requestId: c.get('requestId') }, 500);
  });

  return app;
}

async function getSubmission(db: D1Database, id: string): Promise<SubmissionRow | null> {
  if (!id || id.length > 100) return null;
  const row = await db
    .prepare(
      `SELECT id, contact_name, contact_email, brand_name, answers, attachments, status, notes, ip_hash, created_at, updated_at
       FROM submissions WHERE id = ?`,
    )
    .bind(id)
    .first<SubmissionRow>();
  return row ?? null;
}

export type { Env };
