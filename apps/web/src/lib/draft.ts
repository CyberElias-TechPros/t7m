/** Local draft persistence so respondents never lose progress. */
import { emptyAnswers, type QuestionnaireAnswers } from '@t7m/shared';

const DRAFT_KEY = 't7m:brief-draft:v1';

export interface Draft {
  answers: QuestionnaireAnswers;
  files: { name: string; size: number; type: string }[]; // File objects can't be persisted
  savedAt: string;
}

export function loadDraft(): Draft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Draft;
    // Merge over a fresh answer skeleton so newly-added fields have defaults.
    return {
      answers: { ...emptyAnswers(), ...parsed.answers },
      files: parsed.files ?? [],
      savedAt: parsed.savedAt,
    };
  } catch {
    return null;
  }
}

export function saveDraft(answers: QuestionnaireAnswers, files: File[]): void {
  if (typeof window === 'undefined') return;
  const draft: Draft = {
    answers,
    files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    savedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Storage full / disabled — drafts are a convenience, never block on this.
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}
