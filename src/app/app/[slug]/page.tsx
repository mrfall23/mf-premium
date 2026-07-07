import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { getServiceMeta, slugify, DURATION_ORDER } from '@/lib/catalog';
import OfferList from '@/components/OfferList';
import Link from 'next/link';
import type { Metadata } from 'next';

interface Props { params: Promise<{ slug: string }> }

async function getVariants(slug: string): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true);

  const variants = (data || []).filter((p: Product) => slugify(p.name) === slug);
  variants.sort((a: Product, b: Product) =>
    (DURATION_ORDER[a.duration] ?? 99) - (DURATION_ORDER[b.duration] ?? 99)
  );
  return variants;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const variants = await getVariants(slug);
  if (variants.length === 0) return { title: 'Produit introuvable — MF Premium' };
  const name = variants[0].name;
  const minPrice = Math.min(...variants.map(v => v.price));
  return {
    title: `${name} à partir de ${minPrice.toLocaleString()} FCFA — MF Premium`,
    description: variants[0].description,
  };
}

export default async function AppOffresPage({ params }: Props) {
  const { slug } = await params;
  const variants = await getVariants(slug);

  if (variants.length === 0) {
    return (
      <div style={{ paddingTop: 64, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❓</div>
          <h1 style={{ fontFamily: 'var(--font-orbitron)', fontSize: 20, color: '#fff', marginBottom: 12 }}>Produit introuvable</h1>
          <Link href="/boutique" className="btn-purple" style={{ padding: '12px 24px', fontSize: 12, textDecoration: 'none', display: 'inline-block', marginTop: 8 }}>
            RETOUR AU CATALOGUE
          </Link>
        </div>
      </div>
    );
  }

  const name = variants[0].name;
  const description = variants[0].description;
  const meta = getServiceMeta(name);

  return (
    <div style={{ paddingTop: 64, paddingBottom: 80 }}>
      <div className="animate-fadeInUp" style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(32px,6vw,48px) clamp(16px,4vw,40px) 80px' }}>

        {/* Fil d'ariane */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, fontSize: 13 }}>
          <Link href="/boutique" style={{ color: '#7c6d94', textDecoration: 'none' }}>Catalogue</Link>
          <span style={{ color: '#5a4e6e' }}>›</span>
          <span style={{ color: '#a855f7', fontWeight: 600 }}>{name}</span>
        </div>

        {/* En-tête produit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: meta.bg, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 38, boxShadow: `0 6px 28px ${meta.glow}`,
          }}>{meta.icon}</div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-orbitron, Orbitron), sans-serif',
              fontSize: 'clamp(22px,4vw,30px)', fontWeight: 900,
              color: '#fff', letterSpacing: 2, marginBottom: 6,
            }}>{name.toUpperCase()}</h1>
            <div style={{ fontSize: 13, color: '#9d8fb5' }}>{meta.tagline}</div>
          </div>
        </div>

        <p style={{ color: '#7c6d94', fontSize: 14, lineHeight: 1.7, maxWidth: 640, marginBottom: 48 }}>
          {description}
        </p>

        {/* Offres */}
        <h2 style={{
          fontFamily: 'var(--font-orbitron, Orbitron), sans-serif',
          fontSize: 'clamp(15px,2.5vw,18px)', fontWeight: 700,
          color: '#fff', letterSpacing: 2, marginBottom: 28,
        }}>CHOISISSEZ VOTRE OFFRE</h2>

        <OfferList variants={variants} />

        {/* Réassurance */}
        <div style={{
          marginTop: 48, display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16,
        }}>
          {[
            { icon: '⚡', text: 'Livraison en quelques minutes' },
            { icon: '🔒', text: 'Paiement Mobile Money sécurisé' },
            { icon: '💬', text: 'Support WhatsApp réactif' },
          ].map(f => (
            <div key={f.text} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(168,85,247,0.04)',
              border: '1px solid rgba(168,85,247,0.1)',
              borderRadius: 12, padding: '12px 16px',
            }}>
              <span style={{ fontSize: 18 }}>{f.icon}</span>
              <span style={{ fontSize: 12, color: '#9d8fb5' }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
