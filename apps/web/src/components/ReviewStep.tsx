'use client';

import {
  SECTIONS,
  isAnswerEmpty,
  type AnswerValue,
  type FieldDef,
  type FieldErrors,
  type QuestionnaireAnswers,
} from '@t7m/shared';
import { FileDropzone } from './FileDropzone';

export function ReviewStep({
  answers,
  files,
  errors,
  onEditSection,
  onFilesChange,
}: {
  answers: QuestionnaireAnswers;
  files: File[];
  errors: FieldErrors;
  onEditSection: (index: number) => void;
  onFilesChange: (files: File[]) => void;
}) {
  const errorSections = new Set(
    SECTIONS.filter((s) => s.fields.some((f) => errors[f.id])).map((_, i) => i),
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Review &amp; submit</h1>
      <p className="mt-2 text-ink-soft">
        Check everything over — jump back to any section to edit, attach references, then submit.
      </p>

      <div className="mt-8 space-y-8">
        {SECTIONS.map((section, i) => {
          const sectionErrors = section.fields.filter((f) => errors[f.id]);
          return (
            <section key={section.id}>
              <div className="flex items-center justify-between gap-4 border-b border-line pb-2">
                <h2 className="font-semibold">
                  <span className="mr-2 text-ink-faint">{i + 1}.</span>
                  {section.title}
                </h2>
                <button
                  type="button"
                  onClick={() => onEditSection(i)}
                  className="shrink-0 text-sm font-semibold text-accent hover:text-accent-dark"
                >
                  Edit →
                </button>
              </div>
              {sectionErrors.length > 0 && (
                <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-[13px] font-medium text-red-700">
                  Missing: {sectionErrors.map((f) => f.label).join(', ')}
                </p>
              )}
              <dl className="mt-3 space-y-3">
                {section.fields.map((field) => (
                  <ReviewRow key={field.id} field={field} value={answers[field.id]} error={errors[field.id]} />
                ))}
              </dl>
            </section>
          );
        })}
        {errorSections.size > 0 && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            A few required answers are missing — click “Edit” on the highlighted sections.
          </p>
        )}

        <section>
          <div className="border-b border-line pb-2">
            <h2 className="font-semibold">Attachments (optional)</h2>
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            Old logos, sketches, mood boards, brand guidelines — anything that helps.
          </p>
          <div className="mt-3">
            <FileDropzone files={files} onChange={onFilesChange} />
          </div>
        </section>
      </div>
    </div>
  );
}

function ReviewRow({ field, value, error }: { field: FieldDef; value: AnswerValue | undefined; error?: string }) {
  const empty = isAnswerEmpty(value);
  return (
    <div className="grid gap-1 sm:grid-cols-[12rem,1fr] sm:gap-4">
      <dt className="text-[13px] font-semibold text-ink-faint">{field.label}</dt>
      <dd className={empty ? 'text-sm italic text-ink-faint' : 'text-[15px]'}>
        {empty ? (
          <span className={error ? 'font-medium not-italic text-red-600' : ''}>
            {error ?? 'Not answered'}
          </span>
        ) : (
          <AnswerDisplay field={field} value={value as AnswerValue} />
        )}
      </dd>
    </div>
  );
}

function AnswerDisplay({ field, value }: { field: FieldDef; value: AnswerValue }) {
  if (typeof value === 'string') {
    // Map choice values back to labels.
    const opt = field.options?.find((o) => o.value === value);
    const text = opt?.label ?? value;
    return <span className="whitespace-pre-wrap">{text}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="italic text-ink-faint">—</span>;
    if (typeof value[0] === 'string') {
      const strings = value as string[];
      // multichoice → option labels; chips/stringlist → as entered
      const labels = strings.map((v) => field.options?.find((o) => o.value === v)?.label ?? v);
      return (
        <span className="flex flex-wrap gap-1.5">
          {labels.map((l, i) => (
            <span
              key={`${l}-${i}`}
              className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[13px] font-medium text-accent-dark"
            >
              {l}
            </span>
          ))}
        </span>
      );
    }
    const pairs = value as { name: string; why: string }[];
    return (
      <ul className="space-y-1">
        {pairs
          .filter((p) => p.name.trim())
          .map((p, i) => (
            <li key={i} className="text-[15px]">
              <strong>{p.name}</strong>
              {p.why && <span className="text-ink-soft"> — {p.why}</span>}
            </li>
          ))}
      </ul>
    );
  }

  return <span>{String(value)}</span>;
}
