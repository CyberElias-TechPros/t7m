import Link from 'next/link';
import { LogoMark } from '@/components/Logo';
import { Reveal } from '@/components/Reveal';
import { SECTIONS } from '@t7m/shared';

const SERVICES = [
  { n: '01', t: 'Brand Identity', d: 'Logos, wordmarks and icon systems that hold up from a favicon to a façade.' },
  { n: '02', t: 'Strategy & Direction', d: 'Positioning, personality and visual direction that make every later choice obvious.' },
  { n: '03', t: 'Application & Rollout', d: 'Type, color, merch, digital and packaging — the identity living in the world.' },
];

const PROCESS = ['Your brief', 'Deep research', 'Concept directions', 'Refine & perfect', 'Full delivery'];

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">
      {/* ---------- Nav ---------- */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-void-deep/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <LogoMark className="h-8 w-8 text-violet-electric" glow />
            <span className="font-display text-sm font-bold tracking-[0.2em] text-white">
              THE SEVENTH MAN
            </span>
          </Link>
          <nav className="hidden items-center gap-1 text-sm font-semibold md:flex">
            <a href="#work" className="btn-ghost">Work</a>
            <a href="#services" className="btn-ghost">Services</a>
            <a href="#process" className="btn-ghost">Process</a>
            <Link href="/admin" className="btn-ghost text-ink-faint">Studio login</Link>
            <Link href="/brief" className="btn-primary ml-2 !py-2.5 text-xs">
              Start your brief
            </Link>
          </nav>
          <Link href="/brief" className="btn-primary !px-4 !py-2 text-xs md:hidden">
            Start
          </Link>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="relative min-h-screen pt-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 lg:grid-cols-[1.05fr,0.95fr] lg:pt-12">
          <div className="animate-fade-up">
            <p className="kicker flex items-center gap-3">
              <span className="inline-block h-px w-10 bg-violet-electric" />
              Brand & Identity Studio
            </p>
            <h1 className="mt-6 font-display text-[2.6rem] font-bold leading-[1.06] tracking-tight text-white sm:text-6xl lg:text-[4.6rem]">
              WE BUILD
              <br />
              <span className="bg-gradient-to-r from-violet-soft via-violet-electric to-violet-bright bg-clip-text text-transparent text-glow">
                ICONIC
              </span>{' '}
              BRANDS.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-soft">
              You bring the vision. We bring the strategy, the craft, and the logo that
              makes people stop scrolling. Start with a brief — ten minutes that shape
              the identity you&apos;ll carry for years.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/brief" className="btn-primary text-base">
                Start the questionnaire
                <span aria-hidden>→</span>
              </Link>
              <a href="#work" className="btn-secondary text-base">
                See the work
              </a>
            </div>
            <dl className="mt-14 grid max-w-md grid-cols-3 gap-6">
              {[
                ['120+', 'Identities launched'],
                ['9yr', 'Of studio craft'],
                ['48hr', 'Brief → proposal'],
              ].map(([n, l]) => (
                <div key={l} className="border-l-2 border-violet pl-4">
                  <dt className="font-display text-2xl font-bold text-white">{n}</dt>
                  <dd className="mt-1 text-xs uppercase tracking-wider text-ink-faint">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Hero visual */}
          <div className="relative animate-fade-up [animation-delay:180ms]">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-violet-bright/30 to-transparent blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-line shadow-glow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero-model.jpg"
                alt="High-fashion model in neon violet studio light"
                className="aspect-[4/5] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void-deep via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                <span className="chip-tag !bg-void-black/60 backdrop-blur">Editorial · Identity</span>
                <LogoMark className="h-9 w-9 text-white" glow />
              </div>
            </div>
            {/* Floating accent card */}
            <div className="absolute -left-6 bottom-16 hidden animate-float rounded-2xl border border-line bg-void-black/80 px-5 py-4 backdrop-blur-xl sm:block">
              <p className="text-[11px] uppercase tracking-[0.2em] text-ink-faint">Now crafting</p>
              <p className="mt-1 font-display text-sm font-bold text-white">77 / STREETWEAR</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Marquee ---------- */}
      <div className="border-y border-line bg-void-black/50 py-5">
        <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
          <div className="flex shrink-0 animate-marquee items-center gap-10 pr-10 font-display text-sm font-bold uppercase tracking-[0.25em] text-ink-faint">
            {Array.from({ length: 2 }).map((_, dup) => (
              <span key={dup} className="flex items-center gap-10">
                {['Logo Design', 'Brand Strategy', 'Visual Identity', 'Packaging', 'Art Direction', 'Merch', 'Type Systems', 'Motion'].map(
                  (w) => (
                    <span key={`${dup}-${w}`} className="flex items-center gap-10">
                      {w} <LogoMark className="h-4 w-4 text-violet-bright" />
                    </span>
                  ),
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- Work / mood ---------- */}
      <section id="work" className="mx-auto max-w-7xl px-6 py-24">
        <Reveal>
          <p className="kicker">Selected work</p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold leading-tight text-white sm:text-5xl">
            IDENTITY WITH <span className="text-violet-electric">ATTITUDE.</span>
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Reveal className="lg:col-span-2 lg:row-span-2">
            <div className="group relative h-full min-h-[26rem] overflow-hidden rounded-3xl border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/hero-model.jpg" alt="Campaign visual" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-void-black via-void-black/20 to-transparent" />
              <div className="absolute bottom-0 p-7">
                <p className="kicker">Fashion · Streetwear</p>
                <h3 className="mt-2 font-display text-2xl font-bold text-white">THE SEVENTH MAN</h3>
                <p className="mt-1 max-w-sm text-sm text-ink-soft">Full identity — geometric 77 mark, editorial art direction, merch & digital rollout.</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="relative flex min-h-[16rem] flex-col justify-between overflow-hidden rounded-3xl border border-line bg-violet p-7">
              <LogoMark className="h-16 w-16 text-white" glow />
              <div>
                <h3 className="font-display text-lg font-bold text-white">The Mark</h3>
                <p className="mt-1 text-sm text-white/80">Two sevens. One figure. Instantly recognizable in white, violet or black.</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={220}>
            <div className="relative flex min-h-[16rem] flex-col justify-between overflow-hidden rounded-3xl border border-line bg-void-black p-7">
              <div className="flex gap-2">
                {['#5921b5', '#160238', '#06020e', '#f4f1fb'].map((c) => (
                  <span key={c} className="h-10 w-10 rounded-full border border-line" style={{ backgroundColor: c }} />
                ))}
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">The Palette</h3>
                <p className="mt-1 text-sm text-ink-soft">Electric violet against the void — night-club energy with gallery restraint.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Services ---------- */}
      <section id="services" className="border-y border-line bg-void-black/40">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <Reveal>
            <p className="kicker">What we do</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold text-white sm:text-5xl">
              EVERY TOUCHPOINT, <span className="text-violet-electric">ON BRAND.</span>
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {SERVICES.map((s, i) => (
              <Reveal key={s.n} delay={i * 120}>
                <div className="card group h-full p-8 transition duration-300 hover:-translate-y-1.5 hover:border-violet-bright/50 hover:shadow-glow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-bold text-violet-soft">{s.n}</span>
                    <LogoMark className="h-7 w-7 text-violet-bright/40 transition group-hover:text-violet-electric" />
                  </div>
                  <h3 className="mt-8 font-display text-xl font-bold text-white">{s.t}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Brief / process ---------- */}
      <section id="process" className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-14 lg:grid-cols-[0.9fr,1.1fr] lg:items-center">
          <Reveal>
            <p className="kicker">The brief</p>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-white sm:text-5xl">
              {SECTIONS.length} CHAPTERS. <br /> ONE CLEAR DIRECTION.
            </h2>
            <p className="mt-6 text-lg text-ink-soft">
              Our intake walks you through business, audience, competition, personality,
              visual direction, logo needs, usage, deliverables and budget. Progress saves
              automatically, you can attach sketches and references, and the result is a
              brief precise enough to design from on day one.
            </p>
            <Link href="/brief" className="btn-primary mt-9 text-base">
              Begin your brief <span aria-hidden>→</span>
            </Link>
          </Reveal>
          <Reveal delay={150}>
            <ol className="space-y-3">
              {PROCESS.map((step, i) => (
                <li
                  key={step}
                  className="card flex items-center gap-5 px-6 py-5 transition hover:border-violet-bright/50"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet font-display text-sm font-bold text-white shadow-glow-sm">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white sm:text-base">
                    {step}
                  </span>
                  {i < PROCESS.length - 1 && <span className="ml-auto text-violet-electric">↓</span>}
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="relative px-6 pb-28">
        <Reveal>
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-violet-bright/40 bg-gradient-to-br from-violet to-void p-12 text-center shadow-glow sm:p-20">
            <LogoMark className="mx-auto h-16 w-16 text-white animate-float" glow />
            <h2 className="mt-8 font-display text-3xl font-bold leading-tight text-white sm:text-5xl">
              READY TO BE <br className="sm:hidden" /> UNFORGETTABLE?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-white/85">
              Your brand deserves more than a template. Tell us your story — we&apos;ll
              make it iconic.
            </p>
            <Link
              href="/brief"
              className="mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-[15px] font-bold uppercase tracking-[0.08em] text-void transition hover:scale-[1.03] hover:shadow-glow"
            >
              Start the questionnaire →
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-line bg-void-black/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
          <div className="flex items-center gap-3">
            <LogoMark className="h-7 w-7 text-violet-electric" />
            <span className="font-display text-xs font-bold tracking-[0.2em] text-ink-soft">
              THE SEVENTH MAN — BRAND & IDENTITY STUDIO
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-ink-faint">
            <a href="https://www.tiktok.com/@theseventhman_" target="_blank" rel="noreferrer" className="hover:text-violet-soft">
              TikTok
            </a>
            <Link href="/brief" className="hover:text-violet-soft">Start a brief</Link>
            <Link href="/admin" className="hover:text-violet-soft">Studio login</Link>
          </div>
        </div>
        <p className="pb-6 text-center text-xs text-ink-faint/60">
          © {new Date().getFullYear()} The Seventh Man. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
