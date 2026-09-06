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
import { LogoMark } from './Logo';

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
  return (
    <div>
      <p className="kicker">Final check</p>
      <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
        REVIEW &amp; SUBMIT
      </h1>
      <p className="mt-2.5 text-ink-soft">
        Check everything over — jump back to any chapter to edit, attach references, then submit.
      </p>

      <div className="mt-9 space-y-8">
        {SECTIONS.map((section, i) => {
          const sectionErrors = section.fields.filter((f) => errors[f.id]);
          return (
            <section key={section.id} className="rounded-2xl border border-line bg-white/[0.02] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
                <h2 className="flex items-center gap-3 font-display text-sm font-bold uppercase tracking-[0.14em] text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet font-display text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  {section.title}
                </h2>
                <button
                  type="button"
                  onClick={() => onEditSection(i)}
                  className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-bold text-violet-soft transition hover:bg-violet/15 hover:text-white"
                >
                  Edit →
                </button>
              </div>
              {sectionErrors.length > 0 && (
                <p className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-[13px] font-medium text-red-300">
                  Missing: {sectionErrors.map((f) => f.label).join(', ')}
                </p>
              )}
              <dl className="mt-4 space-y-3.5">
                {section.fields.map((field) => (
                  <ReviewRow key={field.id} field={field} value={answers[field.id]} error={errors[field.id]} />
                ))}
              </dl>
            </section>
          );
        })}

        <section className="rounded-2xl border border-violet-bright/40 bg-violet/10 p-5 sm:p-6">
          <div className="flex items-center gap-3 border-b border-line pb-3">
            <LogoMark className="h-6 w-6 text-violet-electric" />
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white">
              Attachments (optional)
            </h2>
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            Old logos, sketches, mood boards, brand guidelines — anything that helps.
          </p>
          <div className="mt-4">
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
      <dt className="text-[13px] font-semibold uppercase tracking-wide text-ink-faint">{field.label}</dt>
      <dd className={empty ? 'text-sm italic text-ink-faint' : 'text-[15px] text-ink'}>
        {empty ? (
          <span className={error ? 'font-medium not-italic text-red-400' : ''}>
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
    const opt = field.options?.find((o) => o.value === value);
    return <span className="whitespace-pre-wrap">{opt?.label ?? value}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="italic text-ink-faint">—</span>;
    if (typeof value[0] === 'string') {
      const strings = value as string[];
      const labels = strings.map((v) => field.options?.find((o) => o.value === v)?.label ?? v);
      return (
        <span className="flex flex-wrap gap-1.5">
          {labels.map((l, i) => (
            <span
              key={`${l}-${i}`}
              className="rounded-full border border-violet-bright/40 bg-violet/20 px-2.5 py-0.5 text-[13px] font-semibold text-violet-soft"
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
              <strong className="text-white">{p.name}</strong>
              {p.why && <span className="text-ink-soft"> — {p.why}</span>}
            </li>
          ))}
      </ul>
    );
  }

  return <span>{String(value)}</span>;
}
