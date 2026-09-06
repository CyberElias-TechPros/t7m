'use client';

import { useState } from 'react';
import Link from 'next/link';
import { verifyToken } from '@/lib/api';
import { LogoMark } from './Logo';
import { GlowOrbs } from './Reveal';

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
    <main className="relative flex min-h-screen flex-col items-center justify-center px-5">
      <GlowOrbs />
      <Link href="/" className="mb-9 flex flex-col items-center gap-4">
        <LogoMark className="h-14 w-14 text-violet-electric" glow />
        <span className="font-display text-sm font-bold tracking-[0.22em] text-white">THE SEVENTH MAN</span>
      </Link>
      <div className="card w-full max-w-md p-8">
        <h1 className="font-display text-xl font-bold tracking-tight text-white">STUDIO SIGN IN</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Enter the studio access token to review submitted briefs.
        </p>
        <form onSubmit={submit} className="mt-7 space-y-4">
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
            <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300" role="alert">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy || !token.trim()} className="btn-primary w-full">
            {busy ? 'Checking…' : 'Sign in'}
          </button>
        </form>
        <Link href="/" className="mt-5 block text-center text-sm text-ink-faint hover:text-violet-soft">
          ← Back to site
        </Link>
      </div>
    </main>
  );
}
