'use client';
import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { slugify } from '@/lib/catalog';
import { isYearEndPromoActive, YEAR_END_PROMO_SERVICES } from '@/lib/year-end-promo';

const serviceStyle: Record<string, { icon: string; bg: string }> = {
  'Netflix': { icon: '🎬', bg: 'linear-gradient(135deg,#e50914,#8b0000)' },
  'Spotify': { icon: '🎵', bg: 'linear-gradient(135deg,#1db954,#146f35)' },
  'Amazon Prime': { icon: '📦', bg: 'linear-gradient(135deg,#00a8e0,#005f80)' },
  'Apple Music': { icon: '🍎', bg: 'linear-gradient(135deg,#fc3c44,#a01c22)' },
};

// La page est pré-rendue : côté serveur on affiche la promo, puis le
// navigateur la masque si la date de fin est passée (sans erreur d'hydratation).
const noopSubscribe = () => () => {};

// `embedded` : placé dans une page qui a déjà ses marges (ex. la boutique).
export default function YearEndPromo({ showCta = true, embedded = false }: { showCta?: boolean; embedded?: boolean }) {
  const active = useSyncExternalStore(noopSubscribe, () => isYearEndPromoActive(), () => true);
  if (!active) return null;

  return (
    <section style={embedded ? { marginBottom: 40 } : { padding: '0 clamp(16px,5vw,40px)', margin: '0 auto 64px', maxWidth: 1200 }}>
      <div style={{
        position: 'relative', overflow: 'hidden', borderRadius: 20,
        border: '1px solid rgba(192,132,252,0.45)',
        background: 'radial-gradient(ellipse 70% 90% at 0% 0%, rgba(124,58,237,0.45) 0%, transparent 70%), linear-gradient(135deg, rgba(168,85,247,0.16), rgba(5,5,8,0.6))',
        boxShadow: '0 0 48px rgba(168,85,247,0.2)',
        padding: 'clamp(24px,5vw,40px)',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 28,
      }}>
        <div style={{ flex: '1 1 340px', minWidth: 0 }}>
          <div style={{
            display: 'inline-block', background: 'rgba(168,85,247,0.18)', border: '1px solid rgba(192,132,252,0.6)',
            borderRadius: 999, padding: '6px 16px', fontSize: 11, fontWeight: 700, letterSpacing: 2,
            color: '#c084fc', textTransform: 'uppercase', marginBottom: 16,
          }}>🎁 Promo fin d&apos;année</div>
          <h2 style={{
            fontFamily: 'var(--font-orbitron, Orbitron), sans-serif', fontWeight: 900,
            fontSize: 'clamp(24px,4.5vw,40px)', lineHeight: 1.1, letterSpacing: 1, marginBottom: 12,
            background: 'linear-gradient(135deg,#fff 40%,#c084fc 80%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>1 MOIS ACHETÉ =<br />1 MOIS OFFERT</h2>
          <p style={{ color: '#c4b8d8', fontSize: 15, lineHeight: 1.6, marginBottom: showCta ? 22 : 0 }}>
            Sur Netflix, Spotify, Amazon Prime et Apple Music, jusqu&apos;au <strong style={{ color: '#fff' }}>31 décembre</strong>.
            Commande 1 mois, on t&apos;en livre 2.
          </p>
          {showCta && (
            <Link href="/boutique" className="btn-purple" style={{ padding: '13px 30px', fontSize: 12, display: 'inline-block', textDecoration: 'none' }}>
              J&apos;en profite →
            </Link>
          )}
        </div>

        <div style={{ flex: '1 1 300px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {YEAR_END_PROMO_SERVICES.map((name) => (
            <Link key={name} href={`/app/${slugify(name)}`} style={{
              textDecoration: 'none', borderRadius: 14, padding: '16px 12px', background: serviceStyle[name].bg,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center',
              boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
            }}>
              <span style={{ fontSize: 28 }}>{serviceStyle[name].icon}</span>
              <span style={{ fontFamily: 'var(--font-orbitron)', fontWeight: 700, fontSize: 13, color: '#fff' }}>{name}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#3b0a73', background: '#fff', borderRadius: 999, padding: '3px 10px' }}>+1 mois offert</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
