import Link from 'next/link';
import { LogoMark } from '@/components/Logo';
import { GlowOrbs } from '@/components/Reveal';

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <GlowOrbs />
      <LogoMark className="h-16 w-16 text-violet-electric animate-float" glow />
      <p className="mt-6 font-display text-7xl font-bold text-violet-electric text-glow">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-white">LOST IN THE VOID</h1>
      <p className="mt-3 text-ink-soft">The page you’re looking for doesn’t exist or has moved.</p>
      <Link href="/" className="btn-primary mt-9">
        Back to home
      </Link>
    </main>
  );
}
