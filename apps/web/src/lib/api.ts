/** Typed client for the Cloudflare Worker API. Runs in the browser. */
import {
  submissionRequestSchema,
  type FieldErrors,
  type SubmissionStatus,
} from '@t7m/shared';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') ?? 'http://localhost:8787';

export class ApiError extends Error {
  status: number;
  fields?: FieldErrors;
  constructor(message: string, status: number, fields?: FieldErrors) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, init);
  } catch {
    throw new ApiError('Network problem — check your connection and try again.', 0);
  }
  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : {};
  if (!res.ok) {
    const err = data as { error?: string; fields?: FieldErrors };
    throw new ApiError(err.error ?? `Request failed (${res.status})`, res.status, err.fields);
  }
  return data as T;
}

function postJson<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export interface SubmissionCreated {
  id: string;
  status: SubmissionStatus;
}

export async function createSubmission(answers: Record<string, unknown>): Promise<SubmissionCreated> {
  // Validate client-side first; the Worker re-validates as the authority.
  const parsed = submissionRequestSchema.safeParse({ answers });
  if (!parsed.success) {
    const fields: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] === 'answers' ? String(issue.path[1]) : String(issue.path[0]);
      if (!fields[key]) fields[key] = issue.message;
    }
    throw new ApiError('Please review the highlighted fields.', 422, fields);
  }
  return postJson<SubmissionCreated>('/v1/submissions', { answers: parsed.data.answers });
}

export async function uploadAttachment(
  submissionId: string,
  file: File,
): Promise<{ ok: boolean; count: number }> {
  const form = new FormData();
  form.append('file', file);
  return request(`/v1/submissions/${submissionId}/attachments`, { method: 'POST', body: form });
}

// ---- Admin -----------------------------------------------------------------

export interface SubmissionSummary {
  id: string;
  contactName: string;
  contactEmail: string;
  brandName: string;
  status: SubmissionStatus;
  attachments: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionListResponse {
  items: SubmissionSummary[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SubmissionEvent {
  id: number;
  submission_id: string;
  actor: string;
  type: string;
  detail: string;
  created_at: string;
}

export interface SubmissionDetail {
  submission: import('@t7m/shared').Submission;
  events: SubmissionEvent[];
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function listSubmissions(
  token: string,
  params: { page?: number; status?: string; q?: string } = {},
): Promise<SubmissionListResponse> {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.status) qs.set('status', params.status);
  if (params.q) qs.set('q', params.q);
  return request(`/admin/submissions?${qs.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
}

export async function getSubmission(token: string, id: string): Promise<SubmissionDetail> {
  return request(`/admin/submissions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
}

export async function updateSubmission(
  token: string,
  id: string,
  patch: { status?: SubmissionStatus; notes?: string },
): Promise<import('@t7m/shared').Submission> {
  return request(`/admin/submissions/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(patch),
  });
}

export async function deleteSubmission(token: string, id: string): Promise<{ ok: boolean }> {
  return request(`/admin/submissions/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function attachmentUrl(id: string, filename: string): string {
  // Browsers cannot send the Authorization header on navigations; the dashboard
  // fetches via getAttachment() with the token header instead.
  return `${API_BASE}/admin/submissions/${id}/files/${encodeURIComponent(filename)}`;
}

export async function fetchAttachment(
  token: string,
  id: string,
  filename: string,
): Promise<Blob> {
  const res = await fetch(attachmentUrl(id, filename), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new ApiError('Could not download file.', res.status);
  return res.blob();
}

export async function exportCsvUrl(token: string): Promise<string> {
  // Fetch with auth and return an object URL the dashboard can link/click.
  const res = await fetch(`${API_BASE}/admin/submissions/export.csv`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new ApiError('Export failed.', res.status);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await listSubmissions(token, { page: 1 });
    return true;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return false;
    throw err;
  }
}

export { API_BASE };
