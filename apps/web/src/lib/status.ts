import { SUBMISSION_STATUSES, type SubmissionStatus } from '@t7m/shared';

export const STATUS_META: Record<
  SubmissionStatus,
  { label: string; bg: string; fg: string }
> = {
  new: { label: 'New', bg: 'rgba(124,58,237,0.28)', fg: '#c4b5fd' },
  reviewed: { label: 'Reviewed', bg: 'rgba(59,130,246,0.22)', fg: '#93c5fd' },
  contacted: { label: 'Contacted', bg: 'rgba(234,179,8,0.22)', fg: '#fde68a' },
  won: { label: 'Won', bg: 'rgba(34,197,94,0.22)', fg: '#86efac' },
  lost: { label: 'Lost', bg: 'rgba(239,68,68,0.22)', fg: '#fca5a5' },
  archived: { label: 'Archived', bg: 'rgba(148,140,170,0.18)', fg: '#b9aed4' },
};

export const STATUS_ORDER = SUBMISSION_STATUSES;
