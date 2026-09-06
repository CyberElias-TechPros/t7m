import { SUBMISSION_STATUSES, type SubmissionStatus } from '@t7m/shared';

export const STATUS_META: Record<
  SubmissionStatus,
  { label: string; bg: string; fg: string }
> = {
  new: { label: 'New', bg: '#e4eeea', fg: '#234539' },
  reviewed: { label: 'Reviewed', bg: '#e8eef7', fg: '#274469' },
  contacted: { label: 'Contacted', bg: '#fdf0d9', fg: '#7a5410' },
  won: { label: 'Won', bg: '#e2f3e6', fg: '#1f6b35' },
  lost: { label: 'Lost', fg: '#8a2b2b', bg: '#f9e4e4' },
  archived: { label: 'Archived', fg: '#5b5863', bg: '#eceae6' },
};

export const STATUS_ORDER = SUBMISSION_STATUSES;
