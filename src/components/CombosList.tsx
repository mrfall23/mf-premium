'use client';
import { useState } from 'react';
import { addToCart } from '@/lib/store';
import { getServiceMeta } from '@/lib/catalog';
import { formatFCFA } from '@/lib/format';
import { ComboDisplay } from '@/lib/combos';
import Link from 'next/link';

interface Props {
  combos: ComboDisplay[];
  images?: Record<string, string | null>;
}

// Visuel composé des services d'un combo — repli quand aucune image n'est
// fournie. Réutilise exactement les gradients/icônes du reste du site.
function ServicesVisual({ services }: { services: string[] }) {
  return (
    <div style={{
      display: 'flex', width: '100%', height: 130, borderRadius: 12,
      overflow: 'hidden', border: '1px solid rgba(168,85,247,0.15)',
    }}>
      {services.map((s) => {
        const meta = getServiceMeta(s);
        return (
          <div key={s} style={{
            flex: 1, background: meta.bg,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 6, position: 'relative',
          }}>
            <span style={{ fontSize: 30 }}>{meta.icon}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.95)',
              textAlign: 'center', padding: '0 4px', letterSpacing: 0.3,
            }}>{s}</span>
          </div>
        );
      })}
    </div>
  );
}

function ComboCard({ combo, image, onAdded }: { combo: ComboDisplay; image?: string | null; onAdded: () => void }) {
  const [idx, setIdx] = useState(0);
  const [added, setAdded] = useState(false);

  const option = combo.options[idx] ?? combo.options[0];

  const handleOrder = () => {
    // Réutilise le système de commande existant : on ajoute au panier l'article
    // de la durée choisie (produit réel Supabase si disponible).
    addToCart(option.cartItem);
    window.dispatchEvent(new Event('cart-updated'));
    setAdded(true);
    onAdded();
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="card-purple" style={{
      padding: 'clamp(20px,4vw,26px)', display: 'flex', flexDirection: 'column',
      gap: 14, height: '100%',
    }}>
      {/* Visuel principal du combo */}
      {image ? (
        <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={`Combo ${combo.name}`} style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} />
        </div>
      ) : (
        <ServicesVisual services={combo.services} />
      )}

      {/* Nom du combo */}
      <div style={{
        fontFamily: 'var(--font-orbitron)', fontWeight: 900, fontSize: 18,
        color: '#fff', letterSpacing: 1,
      }}>{combo.name}</div>

      {/* Services inclus */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {combo.services.map((s) => {
          const meta = getServiceMeta(s);
          return (
            <span key={s} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(168,85,247,0.2)',
              borderRadius: 999, padding: '4px 10px', fontSize: 12, color: '#c4b8d8',
            }}>
              <span style={{ fontSize: 13 }}>{meta.icon}</span>{s}
            </span>
          );
        })}
      </div>

      {/* Sélecteur de durée */}
      <div style={{ marginTop: 2 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: '#7c6d94',
          textTransform: 'uppercase', marginBottom: 8,
        }}>Durée</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${combo.options.length}, 1fr)`, gap: 8 }}>
          {combo.options.map((o, i) => {
            const active = i === idx;
            return (
              <button
                key={o.months}
                onClick={() => setIdx(i)}
                style={{
                  cursor: 'pointer', padding: '10px 6px', borderRadius: 10,
                  fontFamily: 'var(--font-orbitron)', fontWeight: 700, fontSize: 12,
                  transition: 'all .2s',
                  background: active ? 'rgba(168,85,247,0.18)' : 'rgba(255,255,255,0.03)',
                  border: active ? '2px solid #a855f7' : '2px solid rgba(255,255,255,0.08)',
                  color: active ? '#c084fc' : '#9d8fb5',
                }}
              >{o.months} mois</button>
            );
          })}
        </div>
      </div>

      {/* Prix total */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
        <span style={{
          fontFamily: 'var(--font-orbitron)', fontWeight: 900,
          fontSize: 'clamp(20px,3vw,24px)', color: '#a855f7',
        }}>{formatFCFA(option.price)} <span style={{ fontSize: 13 }}>FCFA</span></span>
        <span style={{ fontSize: 12, color: '#7c6d94' }}>/ {option.months} mois</span>
      </div>

      {/* Bouton commande — même système que les produits */}
      <button
        onClick={handleOrder}
        className={added ? undefined : 'btn-purple'}
        style={{
          cursor: 'pointer', width: '100%', padding: '12px 16px',
          fontSize: 11, marginTop: 'auto',
          ...(added ? {
            background: 'linear-gradient(135deg,#16a34a,#15803d)',
            border: 'none', borderRadius: 10, color: '#fff',
            fontFamily: 'var(--font-orbitron)', fontWeight: 700,
            letterSpacing: 2, textTransform: 'uppercase' as const,
          } : {}),
        }}
      >{added ? '✓ AJOUTÉ AU PANIER' : 'COMMANDER'}</button>
    </div>
  );
}

export default function CombosList({ combos, images }: Props) {
  const [hasAdded, setHasAdded] = useState(false);

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,300px),1fr))',
        gap: 24, alignItems: 'stretch',
      }}>
        {combos.map((c) => (
          <ComboCard key={c.slug} combo={c} image={images?.[c.slug]} onAdded={() => setHasAdded(true)} />
        ))}
      </div>

      {hasAdded && (
        <div className="animate-fadeInUp" style={{
          marginTop: 32, display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap',
        }}>
          <Link href="/panier" className="btn-purple" style={{
            padding: '14px 32px', fontSize: 12, textDecoration: 'none', display: 'inline-block',
          }}>VOIR LE PANIER & PAYER →</Link>
          <Link href="/boutique" className="btn-outline-purple" style={{
            padding: '14px 32px', fontSize: 12, textDecoration: 'none', display: 'inline-block',
          }}>CONTINUER MES ACHATS</Link>
        </div>
      )}
    </>
  );
}
