'use client';
import { useState } from 'react';
import { Product } from '@/types';
import { addToCart } from '@/lib/store';
import { DURATION_NOTES } from '@/lib/catalog';
import Link from 'next/link';

interface Props {
  variants: Product[];
  images?: Record<string, string | null>;
}

const durationLabel: Record<string, string> = {
  '1 mois': '1 Mois',
  '3 mois': '3 Mois',
  '6 mois': '6 Mois',
  '1 an': '1 An',
};

function OfferCard({ product, image, onAdded }: { product: Product; image?: string | null; onAdded: () => void }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    window.dispatchEvent(new Event('cart-updated'));
    setAdded(true);
    onAdded();
    setTimeout(() => setAdded(false), 2000);
  };

  const isPopular = product.duration === '3 mois';
  const label = durationLabel[product.duration] || product.duration;
  const note = DURATION_NOTES[product.duration] || 'Accès complet';

  return (
    <div className="card-purple" style={{
      position: 'relative', padding: 'clamp(20px,4vw,28px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center', gap: 12,
      ...(isPopular ? { borderColor: 'rgba(168,85,247,0.6)', boxShadow: '0 0 32px rgba(168,85,247,0.2)' } : {}),
    }}>
      {image && (
        <div style={{ position: 'relative', width: '100%', borderRadius: 12, overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={`${product.name} ${label}`}
            style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}
      {isPopular && (
        <div style={{
          position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg,#a855f7,#7c3aed)',
          color: '#fff', fontSize: 10, fontWeight: 700,
          fontFamily: 'var(--font-orbitron)', letterSpacing: 1,
          padding: '4px 14px', borderRadius: 999, whiteSpace: 'nowrap',
        }}>★ POPULAIRE</div>
      )}

      <div style={{
        fontFamily: 'var(--font-orbitron)', fontWeight: 700,
        fontSize: 16, color: '#fff', letterSpacing: 1, marginTop: isPopular ? 6 : 0,
      }}>{label}</div>

      <div style={{ fontSize: 12, color: '#7c6d94' }}>{note}</div>

      <div style={{
        fontFamily: 'var(--font-orbitron)', fontWeight: 900,
        fontSize: 'clamp(20px,3vw,24px)', color: '#a855f7',
      }}>
        {product.price.toLocaleString()} <span style={{ fontSize: 13 }}>FCFA</span>
      </div>

      <button
        onClick={handleAdd}
        className={added ? undefined : 'btn-purple'}
        style={{
          cursor: 'pointer', width: '100%', padding: '12px 16px',
          fontSize: 11, marginTop: 4,
          ...(added ? {
            background: 'linear-gradient(135deg,#16a34a,#15803d)',
            border: 'none', borderRadius: 10, color: '#fff',
            fontFamily: 'var(--font-orbitron)', fontWeight: 700,
            letterSpacing: 2, textTransform: 'uppercase' as const,
          } : {}),
        }}
      >
        {added ? '✓ AJOUTÉ AU PANIER' : '+ AJOUTER AU PANIER'}
      </button>
    </div>
  );
}

export default function OfferList({ variants, images }: Props) {
  const [hasAdded, setHasAdded] = useState(false);

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))',
        gap: 20, alignItems: 'stretch',
      }}>
        {variants.map(v => (
          <OfferCard key={v.id} product={v} image={images?.[v.id]} onAdded={() => setHasAdded(true)} />
        ))}
      </div>

      {hasAdded && (
        <div className="animate-fadeInUp" style={{
          marginTop: 28, display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap',
        }}>
          <Link href="/panier" className="btn-purple" style={{
            padding: '14px 32px', fontSize: 12, textDecoration: 'none', display: 'inline-block',
          }}>
            VOIR LE PANIER & PAYER →
          </Link>
          <Link href="/boutique" className="btn-outline-purple" style={{
            padding: '14px 32px', fontSize: 12, textDecoration: 'none', display: 'inline-block',
          }}>
            CONTINUER MES ACHATS
          </Link>
        </div>
      )}
    </>
  );
}
