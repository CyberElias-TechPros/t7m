'use client';

import { useEffect, useRef, useState } from 'react';

/** Fade-up reveal on scroll using IntersectionObserver (no animation dependency). */
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function GlowOrbs() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -right-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-violet/30 blur-[140px] animate-pulse-glow" />
      <div
        className="absolute -left-52 top-1/3 h-[30rem] w-[30rem] rounded-full bg-violet-bright/20 blur-[150px] animate-pulse-glow"
        style={{ animationDelay: '1.4s' }}
      />
    </div>
  );
}
