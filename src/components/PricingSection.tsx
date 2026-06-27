'use client';
import { Product } from '@/types';
import { addToCart } from '@/lib/store';
import { useState } from 'react';

interface Props {
  name: string;
  variants: Product[];
}

const serviceConfig: Record<string, { icon: string; bg: string; glow: string; tagline: string }> = {
  Netflix: { icon: '🎬', bg: 'linear-gradient(135deg,#e50914,#8b0000)', glow: 'rgba(229,9,20,0.4)', tagline: 'Streaming 4K Ultra HD' },
  Spotify: { icon: '🎵', bg: 'linear-gradient(135deg,#1db954,#146f35)', glow: 'rgba(29,185,84,0.4)', tagline: 'Musique sans publicité' },
  'Amazon Prime': { icon: '📦', bg: 'linear-gradient(135deg,#00a8e0,#005f80)', glow: 'rgba(0,168,224,0.4)', tagline: 'Vidéo + Livraison rapide' },
  Crunchyroll: { icon: '⛩️', bg: 'linear-gradient(135deg,#f47521,#a04c10)', glow: 'rgba(244,117,33,0.4)', tagline: 'Anime premium sans limite' },
  'Canva Pro': { icon: '🎨', bg: 'linear-gradient(135deg,#7d2ae8,#4a1589)', glow: 'rgba(125,42,232,0.4)', tagline: 'Design professionnel' },
  'Apple Music': { icon: '🍎', bg: 'linear-gradient(135deg,#fc3c44,#a01c22)', glow: 'rgba(252,60,68,0.4)', tagline: '100M+ titres & exclusivités' },
};

const durationNotes: Record<string, string> = {
  '1 mois': 'Accès complet',
  '3 mois': 'Économisez 10%',
  '1 an': 'Meilleur prix',
};

function getConfig(name: string) {
  for (const [key, val] of Object.entries(serviceConfig)) {
    if (name.includes(key)) return val;
  }
  return { icon: '⭐', bg: 'linear-gradient(135deg,#a855f7,#7c3aed)', glow: 'rgba(168,85,247,0.4)', tagline: 'Abonnement premium' };
}

function PlanRow({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    window.dispatchEvent(new Event('cart-updated'));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isPopular = product.duration === '3 mois';
  const note = durationNotes[product.duration] || product.duration;

  const durationLabel: Record<string, string> = { '1 mois': '1 Mois', '3 mois': '3 Mois', '1 an': '1 An' };
  const label = durationLabel[product.duration] || product.duration;

  return (
    <div className="plan-row" style={{ position: 'relative' }}>
      {isPopular && (
        <div style={{
          position: 'absolute', top: -10, right: 12,
          background: 'linear-gradient(135deg,#a855f7,#7c3aed)',
          color: '#fff', fontSize: 10, fontWeight: 700,
          fontFamily: 'var(--font-orbitron)', letterSpacing: 1,
          padding: '3px 10px', borderRadius: 999,
        }}>★ POPULAIRE</div>
      )}
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#e8e0f7' }}>{label}</div>
        <div style={{ fontSize: 11, color: '#7c6d94', marginTop: 2 }}>{note}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          fontFamily: 'var(--font-orbitron)', fontWeight: 900,
          fontSize: 18, color: '#a855f7', whiteSpace: 'nowrap',
        }}>{product.price.toLocaleString()} FCFA</div>
        <button
          onClick={handleAdd}
          style={{
            cursor: 'pointer', whiteSpace: 'nowrap',
            background: added
              ? 'linear-gradient(135deg,#16a34a,#15803d)'
              : 'linear-gradient(135deg,#a855f7,#7c3aed)',
            border: 'none', borderRadius: 8,
            padding: '8px 14px',
            fontFamily: 'var(--font-orbitron)', fontSize: 11, fontWeight: 700,
            color: '#fff', letterSpacing: 1, transition: 'all .2s',
          }}
        >
          {added ? '✓ AJOUTÉ' : '+ PANIER'}
        </button>
      </div>
    </div>
  );
}

export default function PricingSection({ name, variants }: Props) {
  const cfg = getConfig(name);

  return (
    <div className="card-purple" style={{ padding: 'clamp(20px,4vw,28px)', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 12,
          background: cfg.bg, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, boxShadow: `0 4px 16px ${cfg.glow}`,
        }}>{cfg.icon}</div>
        <div>
          <div style={{
            fontFamily: 'var(--font-orbitron)', fontWeight: 700,
            fontSize: 'clamp(14px,2vw,16px)', color: '#fff',
          }}>{name}</div>
          <div style={{ fontSize: 12, color: '#7c6d94', marginTop: 2 }}>{cfg.tagline}</div>
        </div>
      </div>

      {/* Plan rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {variants.map(v => <PlanRow key={v.id} product={v} />)}
      </div>
    </div>
  );
}
