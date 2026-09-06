import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-line bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight">
            T7M<span className="text-accent">.</span>Studio
          </Link>
          <nav className="text-sm font-medium text-ink-soft">
            <Link href="/brief" className="rounded-lg px-3 py-2 hover:bg-paper">
              Start a brief
            </Link>
            <Link href="/admin" className="rounded-lg px-3 py-2 text-ink-faint hover:bg-paper">
              Agency login
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-10 pt-16 sm:pt-24">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          Brand &amp; logo design intake
        </p>
        <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
          A great logo starts with a clear brief.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
          Answer a few guided questions about your business, audience, competitors, and the look you
          love. It takes about 10–15 minutes, your progress is saved automatically, and the result is
          everything we need to design an identity that fits.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/brief" className="btn-accent text-base">
            Start the questionnaire
            <span aria-hidden>→</span>
          </Link>
          <span className="text-sm text-ink-faint">9 short sections · progress saved on this device</span>
        </div>

        <dl className="mt-16 grid gap-6 sm:grid-cols-3">
          {[
            {
              t: 'Guided, not generic',
              d: 'Questions written for branding work — strategy, personality, visual direction, and usage constraints.',
            },
            {
              t: 'Attach your references',
              d: 'Upload old logos, sketches, and mood boards alongside your answers. Images, PDF, or ZIP.',
            },
            {
              t: 'Built for decisions',
              d: 'Scope your formats, concepts, revisions, timeline, and budget so proposals match expectations.',
            },
          ].map((f) => (
            <div key={f.t} className="card p-6">
              <dt className="font-semibold">{f.t}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-soft">{f.d}</dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className="border-t border-line py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 text-sm text-ink-faint">
          <span>© {new Date().getFullYear()} T7M Studio</span>
          <Link href="/admin" className="hover:text-ink">
            Agency login
          </Link>
        </div>
      </footer>
    </main>
  );
}
