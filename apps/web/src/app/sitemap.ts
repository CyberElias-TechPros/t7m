import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://t7m.example';
  return [
    { url: base, priority: 1 },
    { url: `${base}/brief`, priority: 0.9 },
  ];
}
