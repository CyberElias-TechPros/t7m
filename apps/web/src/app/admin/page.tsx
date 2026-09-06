'use client';

import { useEffect, useState } from 'react';
import {
  listSubmissions,
  exportCsvUrl,
  ApiError,
  type SubmissionSummary,
} from '@/lib/api';
import { AdminLogin } from '@/components/AdminLogin';
import { STATUS_META } from '@/lib/status';
import Link from 'next/link';

const TOKEN_KEY = 't7m:admin-token';
const STATUS_FILTERS = ['all', 'new', 'reviewed', 'contacted', 'won', 'lost', 'archived'] as const;

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [items, setItems] = useState<SubmissionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('all');
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const saved = window.localStorage.getItem(TOKEN_KEY);
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    listSubmissions(token, {
      page,
      status: statusFilter === 'all' ? undefined : statusFilter,
      q: query || undefined,
    })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setTotalPages(res.totalPages);
        setTotal(res.total);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          window.localStorage.removeItem(TOKEN_KEY);
          setToken(null);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load submissions.');
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [token, page, statusFilter, query]);

  function logout() {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }

  async function handleExport() {
    if (!token) return;
    try {
      const url = await exportCsvUrl(token);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brand-briefs-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed.');
    }
  }

  if (!token) {
    return <AdminLogin onAuthed={(t) => { window.localStorage.setItem(TOKEN_KEY, t); setToken(t); }} />;
  }

  return (
    <main className="mx-auto max-w-6xl px-5 pb-20 pt-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/" className="font-display text-xl font-bold tracking-tight">
            T7M<span className="text-accent">.</span>Studio
          </Link>
          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">Brand briefs</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="btn-secondary py-2 text-sm">
            ↓ Export CSV
          </button>
          <button onClick={logout} className="btn-secondary py-2 text-sm">
            Sign out
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <form
          className="flex flex-1 items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setQuery(searchInput.trim());
          }}
        >
          <input
            type="search"
            className="input-base py-2"
            placeholder="Search brand, name, or email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search submissions"
          />
          <button type="submit" className="btn-secondary py-2 text-sm">
            Search
          </button>
        </form>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={
                'rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ' +
                (statusFilter === s ? 'bg-ink text-white' : 'bg-white text-ink-soft hover:bg-paper')
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="card mt-5 overflow-hidden">
        {loading ? (
          <div className="px-6 py-16 text-center text-ink-faint">Loading…</div>
        ) : items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-lg font-semibold">No briefs found</p>
            <p className="mt-1 text-sm text-ink-faint">
              {query || statusFilter !== 'all'
                ? 'Try adjusting your filters.'
                : 'When clients submit the questionnaire, their briefs will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-ink-faint">
                <tr>
                  <th className="px-5 py-3 font-semibold">Brand</th>
                  <th className="px-5 py-3 font-semibold">Contact</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Files</th>
                  <th className="px-5 py-3 font-semibold">Received</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                    <td className="px-5 py-4 font-semibold">
                      <Link href={`/admin/${item.id}`} className="hover:text-accent">
                        {item.brandName}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-ink-soft">
                      <div>{item.contactName}</div>
                      <div className="text-xs text-ink-faint">{item.contactEmail}</div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-4 text-ink-soft">{item.attachments > 0 ? `📎 ${item.attachments}` : '—'}</td>
                    <td className="px-5 py-4 text-ink-faint">{formatDate(item.createdAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/${item.id}`}
                        className="rounded-lg px-3 py-1.5 text-sm font-semibold text-accent hover:bg-accent-soft"
                      >
                        Open →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="mt-5 flex items-center justify-between text-sm text-ink-faint">
          <span>
            {total} brief{total === 1 ? '' : 's'} · page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn-secondary py-2 text-sm"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn-secondary py-2 text-sm"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status as keyof typeof STATUS_META];
  return (
    <span
      className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ backgroundColor: meta?.bg ?? '#eee', color: meta?.fg ?? '#333' }}
    >
      {meta?.label ?? status}
    </span>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}
