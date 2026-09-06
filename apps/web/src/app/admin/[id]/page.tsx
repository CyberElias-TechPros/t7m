'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getSubmission,
  updateSubmission,
  deleteSubmission,
  fetchAttachment,
  ApiError,
  type SubmissionEvent,
} from '@/lib/api';
import type { Submission, SubmissionStatus, AnswerValue } from '@t7m/shared';
import { SECTIONS } from '@t7m/shared';
import { STATUS_META, STATUS_ORDER } from '@/lib/status';
import { AdminLogin } from '@/components/AdminLogin';
import { AnswerValueRead } from '@/components/AnswerValueRead';
import { LogoMark } from '@/components/Logo';
import { GlowOrbs } from '@/components/Reveal';

const TOKEN_KEY = 't7m:admin-token';

export default function AdminDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<Submission | null>(null);
  const [events, setEvents] = useState<SubmissionEvent[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setToken(window.localStorage.getItem(TOKEN_KEY));
  }, []);

  const load = useCallback(async () => {
    const t = window.localStorage.getItem(TOKEN_KEY);
    if (!t) return;
    setLoading(true);
    try {
      const res = await getSubmission(t, id);
      setData(res.submission);
      setEvents(res.events);
      setNotes(res.submission.notes);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        window.localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      } else if (err instanceof ApiError && err.status === 404) {
        setError('This brief could not be found. It may have been deleted.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  async function changeStatus(status: SubmissionStatus) {
    if (!token || !data || status === data.status) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateSubmission(token, id, { status });
      setData(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed.');
    } finally {
      setSaving(false);
    }
  }

  async function saveNotes() {
    if (!token) return;
    setSaving(true);
    try {
      const updated = await updateSubmission(token, id, { notes });
      setData(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  async function download(filename: string) {
    if (!token) return;
    try {
      const blob = await fetchAttachment(token, id, filename);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed.');
    }
  }

  async function remove() {
    if (!token) return;
    setSaving(true);
    try {
      await deleteSubmission(token, id);
      window.location.href = '/admin';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
      setSaving(false);
    }
  }

  if (!token) {
    return <AdminLogin onAuthed={(t) => { window.localStorage.setItem(TOKEN_KEY, t); setToken(t); }} />;
  }

  if (loading) {
    return (
      <main className="relative mx-auto max-w-4xl px-5 py-24">
        <GlowOrbs />
        <div className="space-y-4">
          <div className="shimmer h-10 w-64 rounded-xl" />
          <div className="shimmer h-40 rounded-3xl" />
          <div className="shimmer h-64 rounded-3xl" />
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="relative mx-auto max-w-2xl px-5 py-24 text-center">
        <GlowOrbs />
        <LogoMark className="mx-auto h-14 w-14 text-violet-bright/60" />
        <p className="mt-6 text-lg font-bold text-red-300">{error ?? 'Not found'}</p>
        <Link href="/admin" className="btn-secondary mt-7 inline-flex">
          ← Back to all briefs
        </Link>
      </main>
    );
  }

  return (
    <main className="relative mx-auto max-w-4xl px-5 pb-24 pt-24">
      <GlowOrbs />
      <Link href="/admin" className="text-sm font-bold text-violet-soft hover:text-white">
        ← All briefs
      </Link>

      <header className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">{data.brandName}</h1>
          <p className="mt-2 text-ink-soft">
            {data.contactName} ·{' '}
            <a href={`mailto:${data.contactEmail}`} className="text-violet-soft hover:underline">
              {data.contactEmail}
            </a>
          </p>
          <p className="mt-1 text-sm text-ink-faint">Received {new Date(data.createdAt).toLocaleString()}</p>
        </div>
        <span
          className="rounded-full px-3.5 py-1.5 text-sm font-bold"
          style={{ backgroundColor: STATUS_META[data.status].bg, color: STATUS_META[data.status].fg }}
        >
          {STATUS_META[data.status].label}
        </span>
      </header>

      {/* Status workflow */}
      <section className="card mt-7 p-6">
        <h2 className="label-base">Pipeline</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => changeStatus(s)}
              disabled={saving || s === data.status}
              className={
                'rounded-full border px-4 py-1.5 text-sm font-bold capitalize transition disabled:cursor-default ' +
                (s === data.status
                  ? 'border-transparent bg-violet-bright text-white shadow-glow-sm'
                  : 'border-line bg-white/[0.03] text-ink-soft hover:border-violet-electric/60 hover:bg-violet/15 hover:text-white')
              }
            >
              {STATUS_META[s].label}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <div className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
          {error}
        </div>
      )}

      {/* Answers */}
      {SECTIONS.map((section, i) => (
        <section key={section.id} className="card mt-6 p-6 sm:p-7">
          <h2 className="flex items-center gap-3 font-display text-base font-bold uppercase tracking-[0.12em] text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet font-display text-xs font-bold text-white">
              {i + 1}
            </span>
            {section.title}
          </h2>
          <dl className="mt-5 space-y-4">
            {section.fields.map((field) => (
              <div key={field.id} className="grid gap-1 sm:grid-cols-[13rem,1fr] sm:gap-5">
                <dt className="text-[13px] font-semibold uppercase tracking-wide text-ink-faint">{field.label}</dt>
                <dd className="text-[15px] text-ink">
                  <AnswerValueRead field={field} value={data.answers[field.id] as AnswerValue} />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      {/* Attachments */}
      {data.attachments.length > 0 && (
        <section className="card mt-6 p-6 sm:p-7">
          <h2 className="font-display text-base font-bold uppercase tracking-[0.12em] text-white">Attachments</h2>
          <ul className="mt-4 space-y-2">
            {data.attachments.map((att) => (
              <li
                key={att.key}
                className="flex items-center justify-between rounded-xl border border-line bg-void-black/60 px-4 py-3"
              >
                <span className="flex items-center gap-3 text-sm">
                  <span aria-hidden>📄</span>
                  <span className="font-medium text-ink">{att.filename}</span>
                  <span className="text-xs text-ink-faint">
                    {Math.max(1, Math.round(att.size / 1024))} KB · {att.contentType}
                  </span>
                </span>
                <button
                  onClick={() => download(att.filename)}
                  className="rounded-lg bg-violet-bright px-3.5 py-1.5 text-sm font-bold text-white transition hover:shadow-glow-sm"
                >
                  Download
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Internal notes */}
      <section className="card mt-6 p-6 sm:p-7">
        <h2 className="font-display text-base font-bold uppercase tracking-[0.12em] text-white">Internal notes</h2>
        <p className="mt-1 text-sm text-ink-faint">Not visible to the client.</p>
        <textarea
          className="input-base mt-4"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Call notes, proposal links, pricing…"
        />
        <div className="mt-3 flex justify-end">
          <button onClick={saveNotes} disabled={saving} className="btn-secondary !py-2 text-sm">
            Save notes
          </button>
        </div>
      </section>

      {/* Activity */}
      <section className="card mt-6 p-6 sm:p-7">
        <h2 className="font-display text-base font-bold uppercase tracking-[0.12em] text-white">Activity</h2>
        <ul className="mt-4 space-y-2.5 text-sm">
          {events.map((ev) => (
            <li key={ev.id} className="flex flex-wrap items-baseline gap-2">
              <span className="text-ink-faint">{new Date(ev.created_at).toLocaleString()}</span>
              <span className="font-bold text-violet-soft">{ev.type}</span>
              {ev.detail && <span className="text-ink-soft">— {ev.detail}</span>}
              <span className="text-xs text-ink-faint/70">({ev.actor})</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Danger zone */}
      <section className="mt-8 rounded-3xl border border-red-500/30 bg-red-500/[0.07] p-6">
        <h2 className="font-bold text-red-300">Delete brief</h2>
        <p className="mt-1 text-sm text-red-200/70">
          Permanently removes the brief, its events, and stored attachments. This cannot be undone.
        </p>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="mt-4 rounded-xl border border-red-500/40 bg-transparent px-5 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/15"
          >
            Delete…
          </button>
        ) : (
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={remove}
              disabled={saving}
              className="rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? 'Deleting…' : 'Yes, delete permanently'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="rounded-xl px-4 py-2 text-sm font-bold text-ink-soft transition hover:bg-white/[0.06]"
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
