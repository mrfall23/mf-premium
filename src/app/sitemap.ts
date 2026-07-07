import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { slugify } from '@/lib/catalog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://premium-mf.com';

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/boutique`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/faq`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/panier`, changeFrequency: 'monthly', priority: 0.3 },
  ];

  const { data } = await supabase
    .from('products')
    .select('name')
    .eq('is_active', true);

  const slugs = [...new Set((data || []).map(p => slugify(p.name)))];
  const productPages: MetadataRoute.Sitemap = slugs.map(slug => ({
    url: `${base}/app/${slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
