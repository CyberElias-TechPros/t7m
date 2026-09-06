'use client';

import { useState } from 'react';
import Link from 'next/link';
import { verifyToken } from '@/lib/api';

export function AdminLogin({ onAuthed }: { onAuthed: (token: string) => void }) {
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const ok = await verifyToken(token.trim());
      if (ok) onAuthed(token.trim());
      else setError('That token was not accepted. Check with your administrator.');
    } catch {
      setError('Could not reach the API. Is the backend running?');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-5">
      <Link href="/" className="mb-8 text-center font-display text-2xl font-bold tracking-tight">
        T7M<span className="text-accent">.</span>Studio
      </Link>
      <div className="card p-8">
        <h1 className="font-display text-2xl font-bold tracking-tight">Agency sign in</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Enter the studio access token to review submitted briefs.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="token" className="label-base mb-2">
              Access token
            </label>
            <input
              id="token"
              type="password"
              autoComplete="current-password"
              className="input-base"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="••••••••••••"
            />
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy || !token.trim()} className="btn-primary w-full">
            {busy ? 'Checking…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}
