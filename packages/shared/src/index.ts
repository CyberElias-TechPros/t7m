export * from './questionnaire.js';
export * from './schema.js';

export const APP_NAME = 'T7M — Brand Brief';
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25 MB total per submission
export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB per file
export const ALLOWED_UPLOAD_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'application/zip',
] as const;
