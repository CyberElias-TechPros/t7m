/**
 * Zod validation for questionnaire submissions.
 * Used by the Cloudflare Worker (server-side authority) and reused by the
 * Next.js frontend for per-field/per-section error messaging.
 */
import { z } from 'zod';
import { ALL_FIELDS, type AnswerValue, type PairEntry } from './questionnaire.js';

/**
 * Pair entries (e.g. admired brands) are optional rows: rows with a blank name
 * are dropped by the transform rather than rejected.
 */
export const pairEntrySchema = z.object({
  name: z.string().trim().max(200),
  why: z.string().trim().max(1000).default(''),
});

const trimmedString = (max: number) => z.string().trim().max(max, `Too long (max ${max} characters)`);
const nonEmpty = (max: number, label = 'This field is required') =>
  z.string().trim().min(1, label).max(max, `Too long (max ${max} characters)`);

/** Build the answers Zod object from the questionnaire field definitions. */
function buildAnswersSchema() {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of ALL_FIELDS) {
    switch (field.type) {
      case 'text':
      case 'textarea':
      case 'choice': {
        const max = field.type === 'textarea' ? 4000 : 500;
        let schema: z.ZodTypeAny;
        if (field.options) {
          const allowed = field.options.map((o) => o.value);
          const inList = (v: string) => allowed.includes(v);
          schema = field.required
            ? z.string().trim().min(1, 'Please choose an option').refine(inList, 'Choose a listed option')
            : z
                .string()
                .trim()
                .refine((v) => v === '' || inList(v), 'Choose a listed option');
        } else {
          schema = field.required ? nonEmpty(max) : trimmedString(max);
        }
        // Optional fields default to empty when omitted from the payload.
        shape[field.id] = field.required ? schema : schema.or(z.undefined()).transform((v) => v ?? '');
        break;
      }
      case 'email': {
        const requiredEmail = z.string().trim().email('Enter a valid email address').max(320);
        const optionalEmail = z
          .string()
          .trim()
          .max(320)
          .refine((v) => v === '' || z.string().email().safeParse(v).success, 'Enter a valid email address')
          .or(z.undefined())
          .transform((v) => v ?? '');
        shape[field.id] = field.required ? requiredEmail : optionalEmail;
        break;
      }
      case 'multichoice': {
        let schema: z.ZodTypeAny = z.array(
          z.string().refine((v) => field.options!.some((o) => o.value === v), 'Invalid option'),
        );
        if (field.minItems) {
          const min = field.minItems;
          schema = schema.refine((arr: unknown[]) => arr.length >= min, `Choose at least ${min}`);
        }
        if (field.maxItems) {
          const max = field.maxItems;
          schema = schema.refine((arr: unknown[]) => arr.length <= max, `Choose at most ${max}`);
        }
        shape[field.id] = field.required
          ? schema
          : schema.or(z.undefined()).transform((v) => v ?? []);
        break;
      }
      case 'chips': {
        let schema: z.ZodTypeAny = z
          .array(z.string().trim().max(80))
          .transform((arr) => Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean))));
        if (field.minItems) {
          const min = field.minItems;
          schema = schema.refine((arr: unknown[]) => arr.length >= min, `Add at least ${min}`);
        }
        if (field.maxItems) {
          const max = field.maxItems;
          schema = schema.refine((arr: unknown[]) => arr.length <= max, `At most ${max} allowed`);
        }
        shape[field.id] = field.required
          ? schema
          : schema.or(z.undefined()).transform((v) => v ?? []);
        break;
      }
      case 'stringlist': {
        let schema: z.ZodTypeAny = z
          .array(z.string().trim().max(500))
          .transform((arr) => Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean))));
        if (field.minItems) {
          const min = field.minItems;
          schema = schema.refine((arr: unknown[]) => arr.length >= min, `Add at least ${min}`);
        }
        if (field.maxItems) {
          const max = field.maxItems;
          schema = schema.refine((arr: unknown[]) => arr.length <= max, `At most ${max} entries`);
        }
        shape[field.id] = field.required
          ? schema
          : schema.or(z.undefined()).transform((v) => v ?? []);
        break;
      }
      case 'pairlist': {
        schema: {
          let schema: z.ZodTypeAny = z
            .array(pairEntrySchema)
            .max(20, 'At most 20 entries')
            .transform((arr) => arr.filter((p) => p.name.trim() !== ''));
          if (field.minItems) {
            const min = field.minItems;
            schema = schema.refine((arr: unknown[]) => arr.length >= min, `Add at least ${min}`);
          }
          shape[field.id] = field.required
            ? schema
            : schema.or(z.undefined()).transform((v) => v ?? []);
        }
        break;
      }
    }
  }

  return z.object(shape);
}

export const answersSchema = buildAnswersSchema();

export type AnswersInput = Record<string, AnswerValue>;
export type ValidatedAnswers = z.infer<typeof answersSchema>;

/** Honeypot anti-spam: bots fill hidden fields, humans don't. */
export const submissionRequestSchema = z.object({
  answers: answersSchema,
  company: z.string().max(0).optional(), // honeypot — must be empty
  notes: z.string().max(0).optional(), // honeypot — must be empty
});

export type SubmissionRequest = z.infer<typeof submissionRequestSchema>;

export const SUBMISSION_STATUSES = ['new', 'reviewed', 'contacted', 'won', 'lost', 'archived'] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export const statusUpdateSchema = z.object({
  status: z.enum(SUBMISSION_STATUSES),
});

export interface AttachmentMeta {
  key: string;
  filename: string;
  size: number;
  contentType: string;
}

export interface Submission {
  id: string;
  contactName: string;
  contactEmail: string;
  brandName: string;
  answers: ValidatedAnswers;
  attachments: AttachmentMeta[];
  status: SubmissionStatus;
  notes: string;
  ipHash: string;
  createdAt: string;
  updatedAt: string;
}

/** Flat list of field issues: { fieldId: message }. */
export type FieldErrors = Record<string, string>;

export function formatZodErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const path = issue.path;
    if (path.length === 0) continue;
    const key = path[0] === 'answers' ? String(path[1]) : String(path[0]);
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function isAnswerEmpty(value: AnswerValue | undefined): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) {
    if (value.length === 0) return true;
    if (typeof value[0] === 'string') return (value as string[]).every((s) => !s || !s.trim());
    return (value as PairEntry[]).every((p) => !p?.name?.trim());
  }
  return false;
}
