'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  SECTIONS,
  emptyAnswers,
  answersSchema,
  formatZodErrors,
  type FieldErrors,
  type QuestionnaireAnswers,
  type AnswerValue,
} from '@t7m/shared';
import { FieldRenderer } from '@/components/fields';
import { LogoMark } from '@/components/Logo';
import { GlowOrbs } from '@/components/Reveal';
import { createSubmission, uploadAttachment, ApiError } from '@/lib/api';
import { loadDraft, saveDraft, clearDraft } from '@/lib/draft';
import { ReviewStep } from '@/components/ReviewStep';
import { FileDropzone } from '@/components/FileDropzone';

const TOTAL_STEPS = SECTIONS.length + 1; // sections + review
const HONEYPOT_HINT = 'Please leave this field empty.';

type Phase = 'form' | 'submitting' | 'success' | 'error';

export default function BriefPage() {
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(() => emptyAnswers());
  const [files, setFiles] = useState<File[]>([]);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [phase, setPhase] = useState<Phase>('form');
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [draftResumed, setDraftResumed] = useState(false);
  const [honeypot, setHoneypot] = useState({ company: '', notes: '' });
  const touched = useRef(false);

  const isReview = step === SECTIONS.length;
  const section = SECTIONS[Math.min(step, SECTIONS.length - 1)];

  // ---- Draft persistence ---------------------------------------------------
  useEffect(() => {
    const draft = loadDraft();
    if (draft && hasContent(draft.answers)) {
      setAnswers(draft.answers);
      setDraftResumed(true);
    }
  }, []);

  useEffect(() => {
    if (phase !== 'form' || !touched.current) return;
    const t = setTimeout(() => saveDraft(answers, files), 600);
    return () => clearTimeout(t);
  }, [answers, files, phase]);

  const setAnswer = useCallback((id: string, value: AnswerValue) => {
    touched.current = true;
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  // ---- Validation ------------------------------------------------------------
  const validateStep = useCallback(
    (stepIndex: number): FieldErrors => {
      const result = answersSchema.safeParse(answers);
      if (result.success) return {};
      const all = formatZodErrors(result.error);
      if (stepIndex >= SECTIONS.length) return all; // review: report everything
      const fields = new Set(SECTIONS[stepIndex].fields.map((f) => f.id));
      return Object.fromEntries(Object.entries(all).filter(([k]) => fields.has(k)));
    },
    [answers],
  );

  const goNext = useCallback(() => {
    const stepErrors = validateStep(step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, SECTIONS.length));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, validateStep]);

  const goBack = useCallback(() => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goToStep = useCallback((target: number) => {
    setErrors({});
    setStep(Math.max(0, Math.min(target, SECTIONS.length)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ---- Submission -------------------------------------------------------------
  const handleSubmit = useCallback(async () => {
    const allErrors = validateStep(SECTIONS.length);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      for (let i = 0; i < SECTIONS.length; i++) {
        const ids = SECTIONS[i].fields.map((f) => f.id);
        if (ids.some((id) => allErrors[id])) {
          setStep(i);
          window.scrollTo({ top: 0 });
          return;
        }
      }
      return;
    }
    if (honeypot.company || honeypot.notes) return; // bot trap: silently swallow
    setPhase('submitting');
    setFatalError(null);
    try {
      const created = await createSubmission(answers as unknown as Record<string, unknown>);
      setSubmissionId(created.id);
      if (files.length > 0) {
        setUploadProgress({ done: 0, total: files.length });
        for (let i = 0; i < files.length; i++) {
          try {
            await uploadAttachment(created.id, files[i]);
          } catch (err) {
            console.error('attachment failed', files[i].name, err);
          }
          setUploadProgress({ done: i + 1, total: files.length });
        }
      }
      clearDraft();
      setPhase('success');
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.status === 422
            ? 'Please review the highlighted fields.'
            : err.message
          : 'Something went wrong. Please try again.';
      if (err instanceof ApiError && err.fields) setErrors(err.fields);
      setFatalError(message);
      setPhase('error');
    }
  }, [answers, files, honeypot, validateStep]);

  const progressPct = useMemo(() => Math.round((step / TOTAL_STEPS) * 100), [step]);

  // ---- Success screen -----------------------------------------------------------
  if (phase === 'success' && submissionId) {
    return <SuccessScreen id={submissionId} filesCount={files.length} brandName={String(answers.brandName || 'your brand')} />;
  }

  return (
    <main className="relative mx-auto max-w-3xl px-5 pb-24 pt-28">
      <GlowOrbs />
      <Link href="/" className="inline-flex items-center gap-3">
        <LogoMark className="h-9 w-9 text-violet-electric" glow />
        <span className="font-display text-sm font-bold tracking-[0.18em] text-white">THE SEVENTH MAN</span>
      </Link>

      {draftResumed && step === 0 && (
        <div className="mt-6 rounded-xl border border-violet-electric/40 bg-violet/15 px-4 py-3 text-sm text-violet-soft backdrop-blur">
          ✓ We picked up your saved draft from this device. Progress saves automatically as you type.
        </div>
      )}

      {/* Progress */}
      <div className="mt-10">
        <div className="flex items-center justify-between text-sm font-semibold">
          <span className="kicker">
            {isReview ? 'Review & submit' : `${section.title}`}
          </span>
          <span className="font-display text-violet-soft">{progressPct}%</span>
        </div>
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-bright to-violet-soft shadow-glow-sm transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <nav className="mt-5 flex flex-wrap gap-1.5" aria-label="Sections">
          {SECTIONS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goToStep(i)}
              aria-current={i === step}
              className={
                'rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition ' +
                (i === step
                  ? 'bg-violet-bright text-white shadow-glow-sm'
                  : i < step
                    ? 'bg-violet/20 text-violet-soft hover:bg-violet/30'
                    : 'bg-white/[0.04] text-ink-faint hover:bg-white/[0.08]')
              }
            >
              {i + 1}. {s.title}
            </button>
          ))}
          <button
            type="button"
            onClick={() => goToStep(SECTIONS.length)}
            aria-current={isReview}
            className={
              'rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition ' +
              (isReview ? 'bg-violet-bright text-white shadow-glow-sm' : 'bg-white/[0.04] text-ink-faint hover:bg-white/[0.08]')
            }
          >
            ✓ Review
          </button>
        </nav>
      </div>

      {/* Card */}
      <div className="card mt-7 p-6 sm:p-10">
        {!isReview ? (
          <>
            <p className="kicker">
              Chapter {step + 1} of {SECTIONS.length}
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {section.title}
            </h1>
            {section.subtitle && <p className="mt-2.5 text-ink-soft">{section.subtitle}</p>}

            <div className="mt-9 space-y-8">
              {section.fields.map((field) => (
                <div key={field.id}>
                  <FieldRenderer
                    field={field}
                    value={answers[field.id]}
                    error={errors[field.id]}
                    onChange={(v) => setAnswer(field.id, v)}
                  />
                </div>
              ))}
            </div>

            {/* Honeypot */}
            <div className="sr-only-ish" aria-hidden>
              <label>
                Company (leave empty)
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot.company}
                  onChange={(e) => setHoneypot((h) => ({ ...h, company: e.target.value }))}
                />
              </label>
              <label>
                Notes (leave empty)
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot.notes}
                  onChange={(e) => setHoneypot((h) => ({ ...h, notes: e.target.value }))}
                />
              </label>
              <p>{HONEYPOT_HINT}</p>
            </div>
          </>
        ) : (
          <ReviewStep
            answers={answers}
            files={files}
            errors={errors}
            onEditSection={(i) => goToStep(i)}
            onFilesChange={setFiles}
          />
        )}

        {fatalError && phase === 'error' && (
          <div className="mt-6 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300" role="alert">
            {fatalError} Your answers are saved on this device — feel free to retry.
          </div>
        )}

        {phase === 'submitting' && (
          <div className="mt-6 rounded-xl border border-violet-electric/40 bg-violet/15 px-4 py-4 text-sm text-violet-soft">
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-soft border-t-transparent" />
              <span>
                {uploadProgress
                  ? `Uploading references… ${uploadProgress.done}/${uploadProgress.total}`
                  : 'Sending your brief…'}
              </span>
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-7">
          <button type="button" onClick={goBack} disabled={step === 0 || phase === 'submitting'} className="btn-secondary">
            ← Back
          </button>
          {!isReview ? (
            <button type="button" onClick={goNext} className="btn-primary">
              Continue →
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={phase === 'submitting'} className="btn-primary">
              {phase === 'submitting' ? 'Submitting…' : 'Submit brief ✓'}
            </button>
          )}
        </div>
      </div>

      <p className="mt-7 text-center text-sm text-ink-faint">
        Your answers go directly to the studio. We never share your brief.
      </p>
    </main>
  );
}

function hasContent(a: QuestionnaireAnswers): boolean {
  return Object.values(a).some((v) => {
    if (typeof v === 'string') return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    return false;
  });
}

function SuccessScreen({ id, filesCount, brandName }: { id: string; filesCount: number; brandName: string }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-5">
      <GlowOrbs />
      <div className="card w-full max-w-2xl p-8 text-center sm:p-14">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-violet-bright shadow-glow animate-float">
          <LogoMark className="h-10 w-10 text-white" glow />
        </div>
        <p className="kicker mt-8 justify-center">Brief received</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          YOU&apos;RE IN.
        </h1>
        <p className="mt-4 text-lg text-ink-soft">
          We&apos;ve got everything we need for <strong className="text-white">{brandName}</strong>.
          {filesCount > 0 && ` ${filesCount} reference file${filesCount === 1 ? '' : 's'} uploaded.`}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-ink-faint">
          We review every brief personally and will reply to your contact email within 2 business
          days with initial thoughts and a tailored proposal.
        </p>
        <dl className="mx-auto mt-7 max-w-xs rounded-2xl border border-line bg-void-black/60 px-5 py-4 text-left">
          <dt className="text-[11px] uppercase tracking-[0.2em] text-ink-faint">Brief reference</dt>
          <dd className="mt-1 font-mono text-[13px] font-semibold text-violet-soft">{id.slice(0, 13)}…</dd>
        </dl>
        <div className="mt-9 flex justify-center gap-3">
          <Link href="/" className="btn-primary">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
