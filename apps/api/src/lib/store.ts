/** Data-access layer: maps between D1 rows and the Submission domain object. */
import type { ValidatedAnswers, AttachmentMeta, SubmissionStatus, Submission } from '@t7m/shared';
import type { SubmissionRow } from '../env.js';

export function rowToSubmission(row: SubmissionRow | Record<string, unknown>): Submission {
  const r = row as SubmissionRow;
  let answers: ValidatedAnswers;
  try {
    answers = JSON.parse(r.answers) as ValidatedAnswers;
  } catch {
    answers = {} as ValidatedAnswers;
  }
  let attachments: AttachmentMeta[];
  try {
    attachments = JSON.parse(r.attachments) as AttachmentMeta[];
  } catch {
    attachments = [];
  }
  return {
    id: r.id,
    contactName: r.contact_name,
    contactEmail: r.contact_email,
    brandName: r.brand_name,
    answers,
    attachments,
    status: r.status,
    notes: r.notes,
    ipHash: r.ip_hash,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export interface SummaryItem {
  id: string;
  contactName: string;
  contactEmail: string;
  brandName: string;
  status: SubmissionStatus;
  attachments: number;
  createdAt: string;
  updatedAt: string;
}

export function rowToSummary(row: SubmissionRow | Record<string, unknown>): SummaryItem {
  const r = row as SubmissionRow;
  let attachmentCount = 0;
  try {
    attachmentCount = (JSON.parse(r.attachments) as unknown[]).length;
  } catch {
    attachmentCount = 0;
  }
  return {
    id: r.id,
    contactName: r.contact_name,
    contactEmail: r.contact_email,
    brandName: r.brand_name,
    status: r.status,
    attachments: attachmentCount,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/**
 * Public-safe view: no IP hash, no internal notes.
 */
export function toPublicView(s: Submission) {
  const { ipHash, notes, ...pub } = s;
  return pub;
}
