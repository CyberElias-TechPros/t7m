import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://t7m.example'),
  title: {
    default: 'T7M Studio — Brand & Logo Design Brief',
    template: '%s · T7M Studio',
  },
  description:
    'Start your brand identity project: a guided questionnaire covering your business, audience, competitors, visual direction, and logo deliverables.',
  openGraph: {
    title: 'T7M Studio — Start Your Brand Brief',
    description: 'Tell us about your brand. Get a logo and identity that fits.',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
