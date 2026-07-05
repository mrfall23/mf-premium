import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://premium-mf.com';

  return [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/boutique`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/faq`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/panier`, changeFrequency: 'monthly', priority: 0.3 },
  ];
}
