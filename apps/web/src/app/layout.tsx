import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://theseventhman.studio'),
  title: {
    default: 'THE SEVENTH MAN — Brand & Identity Studio',
    template: '%s · THE SEVENTH MAN',
  },
  description:
    'Brand & logo design intake. Start your identity project: a guided brief covering your business, audience, competitors, visual direction, and deliverables.',
  openGraph: {
    title: 'THE SEVENTH MAN — Start Your Brand Brief',
    description: 'A great brand starts with a clear brief. Tell us your vision.',
    type: 'website',
    images: ['/images/hero-model.jpg'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable @next/next/no-page-custom-font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Michroma&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%230a0413'/%3E%3Ctext x='50' y='72' font-size='62' text-anchor='middle' fill='%237c3aed' font-family='Arial Black'%3E7%3C/text%3E%3C/svg%3E"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
