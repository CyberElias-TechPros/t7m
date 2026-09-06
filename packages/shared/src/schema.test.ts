import { describe, it, expect } from 'vitest';
import { answersSchema, submissionRequestSchema, formatZodErrors, isAnswerEmpty } from './schema.js';
import { emptyAnswers, ALL_FIELDS } from './questionnaire.js';

function validAnswers() {
  return {
    ...emptyAnswers(),
    contactName: 'Jane Doe',
    contactEmail: 'jane@example.com',
    brandName: 'Acme Studio',
    description: 'We design useful things.',
    problem: 'Small brands get generic identities.',
    stage: 'early',
    primaryAudience: 'Urban professionals 25–40.',
    geoScope: 'national',
    encounterPoints: ['website', 'social'],
    competitors: ['Contoso', 'Fabrikam'],
    usp: 'Strategy-first branding in days, not months.',
    adjectives: ['Bold', 'Warm', 'Modern'],
    toneOfVoice: ['friendly', 'bold'],
    stylePreference: ['minimal', 'bold'],
    logoType: ['icon-wordmark'],
    applications: ['website', 'app-icon'],
    singleColor: 'yes',
    darkLight: 'both',
    fileFormats: ['svg', 'png'],
    conceptCount: '3',
    revisionRounds: '2',
    timeline: '2-4w',
    budget: '3k-7k',
    signOff: 'Jane Doe, Founder',
  };
}

describe('answersSchema', () => {
  it('accepts a complete valid submission', () => {
    const result = answersSchema.safeParse(validAnswers());
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const answers = emptyAnswers();
    const result = answersSchema.safeParse(answers);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = formatZodErrors(result.error);
      expect(errors.contactName).toBeTruthy();
      expect(errors.contactEmail).toBeTruthy();
      expect(errors.brandName).toBeTruthy();
      expect(errors.stage).toBeTruthy();
    }
  });

  it('rejects invalid email', () => {
    const answers = validAnswers();
    answers.contactEmail = 'not-an-email';
    const result = answersSchema.safeParse(answers);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodErrors(result.error).contactEmail).toMatch(/email/i);
    }
  });

  it('enforces min items on multichoice', () => {
    const answers = validAnswers();
    answers.encounterPoints = [];
    const result = answersSchema.safeParse(answers);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodErrors(result.error).encounterPoints).toMatch(/at least/i);
    }
  });

  it('enforces 3–5 adjectives', () => {
    const tooFew = validAnswers();
    tooFew.adjectives = ['Bold'];
    expect(answersSchema.safeParse(tooFew).success).toBe(false);

    const tooMany = validAnswers();
    tooMany.adjectives = ['A', 'B', 'C', 'D', 'E', 'F'];
    const res = answersSchema.safeParse(tooMany);
    expect(res.success).toBe(false);
  });

  it('rejects options not in the allowed list', () => {
    const answers = validAnswers();
    answers.stage = 'unicorn';
    const result = answersSchema.safeParse(answers);
    expect(result.success).toBe(false);
  });

  it('normalizes chips and string lists (trims, drops blanks)', () => {
    const answers = validAnswers();
    answers.adjectives = ['  Bold ', '', 'Warm', 'Modern'];
    const result = answersSchema.safeParse(answers);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.adjectives).toEqual(['Bold', 'Warm', 'Modern']);
    }
  });

  it('filters out pairlist rows without a name', () => {
    const answers = validAnswers() as Record<string, unknown>;
    answers.admiredBrands = [{ name: '', why: 'whatever' }];
    const result = answersSchema.safeParse(answers);
    // Empty-name entries are filtered out by transform — result is valid with empty list.
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.admiredBrands).toEqual([]);
    }
  });

  it('allows optional fields to be omitted or empty strings', () => {
    const minimal = validAnswers() as unknown as Record<string, unknown>;
    // Omit optional text fields entirely and blank others.
    for (const key of ['tagline', 'legalName', 'secondaryAudience']) delete minimal[key];
    minimal.competitorLikes = '';
    minimal.typographyFeel = [];
    const result = answersSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tagline).toBe('');
      expect(result.data.legalName).toBe('');
    }
  });

  it('honeypot: rejects submission when hidden fields are filled', () => {
    const ok = submissionRequestSchema.safeParse({ answers: validAnswers() });
    expect(ok.success).toBe(true);

    const bot = submissionRequestSchema.safeParse({ answers: validAnswers(), company: 'spam-co' });
    expect(bot.success).toBe(false);
  });

  it('every field definition has a matching schema entry', () => {
    for (const field of ALL_FIELDS) {
      expect(field.id).toBeTruthy();
    }
    const parsed = answersSchema.safeParse(validAnswers());
    if (parsed.success) {
      for (const field of ALL_FIELDS) {
        expect(field.id in parsed.data).toBe(true);
      }
    }
  });
});

describe('isAnswerEmpty', () => {
  it('detects empty values across field types', () => {
    expect(isAnswerEmpty('')).toBe(true);
    expect(isAnswerEmpty('  ')).toBe(true);
    expect(isAnswerEmpty([])).toBe(true);
    expect(isAnswerEmpty(['', ' '])).toBe(true);
    expect(isAnswerEmpty([{ name: '', why: '' }])).toBe(true);
    expect(isAnswerEmpty('x')).toBe(false);
    expect(isAnswerEmpty(['x'])).toBe(false);
    expect(isAnswerEmpty([{ name: 'Apple', why: 'clean' }])).toBe(false);
  });
});
