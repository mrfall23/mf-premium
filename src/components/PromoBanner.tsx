'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Promo {
  message: string;
  ends_at: string;
}

// Hauteur de la bannière (px). Poussée dans une variable CSS pour décaler
// la Navbar (fixée) et le contenu quand une promo est active.
const BANNER_H = 40;

function setBannerHeight(px: number) {
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--promo-h', px + 'px');
  }
}

function tempsRestant(endsAt: string) {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const j = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (j > 0) return `${j}j ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

export default function PromoBanner() {
  const [promo, setPromo] = useState<Promo | null>(null);
  const [reste, setReste] = useState<string | null>(null);

  // Charger la promo active (non expirée)
  useEffect(() => {
    let annule = false;
    (async () => {
      const { data } = await supabase
        .from('promotions')
        .select('message, ends_at')
        .eq('is_active', true)
        .gt('ends_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);
      if (!annule && data && data.length > 0) {
        setPromo(data[0] as Promo);
      }
    })();
    return () => { annule = true; };
  }, []);

  // Compte à rebours + gestion de la hauteur de bannière
  useEffect(() => {
    if (!promo) { setBannerHeight(0); return; }
    const maj = () => {
      const t = tempsRestant(promo.ends_at);
      if (t === null) { setPromo(null); setBannerHeight(0); return; }
      setReste(t);
      setBannerHeight(BANNER_H);
    };
    maj();
    const id = setInterval(maj, 1000);
    return () => clearInterval(id);
  }, [promo]);

  useEffect(() => () => setBannerHeight(0), []);

  if (!promo || reste === null) return null;

  // Le message est dupliqué pour un défilement en boucle sans coupure.
  const texte = promo.message;

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 101,
        height: BANNER_H, overflow: 'hidden',
        background: 'linear-gradient(90deg,#7c3aed,#a855f7,#7c3aed)',
        display: 'flex', alignItems: 'center',
        boxShadow: '0 2px 16px rgba(168,85,247,0.4)',
      }}
    >
      {/* Piste défilante */}
      <div
        style={{
          display: 'flex', whiteSpace: 'nowrap',
          willChange: 'transform',
          animation: 'promo-scroll 22s linear infinite',
        }}
      >
        <span style={promoTexteStyle}>{texte}</span>
        <span style={promoTexteStyle}>{texte}</span>
        <span style={promoTexteStyle}>{texte}</span>
      </div>

      {/* Badge compte à rebours (fixe, à droite) */}
      <div
        style={{
          position: 'absolute', top: 0, right: 0, height: BANNER_H,
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '0 14px 0 22px',
          background: 'linear-gradient(90deg,rgba(124,58,237,0) 0%,#6d28d9 30%,#6d28d9 100%)',
          fontWeight: 700, fontSize: 13, color: '#fff',
          fontFamily: 'var(--font-orbitron, Orbitron), sans-serif',
          letterSpacing: 0.5, whiteSpace: 'nowrap',
        }}
      >
        <span aria-hidden>⏳</span>
        <span>Fin dans {reste}</span>
      </div>
    </div>
  );
}

const promoTexteStyle: React.CSSProperties = {
  fontWeight: 700, fontSize: 13.5, color: '#fff',
  letterSpacing: 0.6, padding: '0 40px',
  fontFamily: 'var(--font-space, Space Grotesk), sans-serif',
  textShadow: '0 1px 2px rgba(0,0,0,0.25)',
};
