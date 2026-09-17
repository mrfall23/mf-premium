import CombosList from '@/components/CombosList';
import { COMBOS } from '@/lib/combos';
import { getComboImage } from '@/lib/catalog-images';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Combos — Plusieurs abonnements Premium à prix réduit — MF Premium',
  description: 'Nos formules combinant plusieurs abonnements Premium (Netflix, Spotify, Amazon Prime, Crunchyroll, Apple Music) au meilleur prix.',
};

export default function CombosPage() {
  // Résolution des images côté serveur (même méthode que les produits).
  const images: Record<string, string | null> = {};
  for (const c of COMBOS) images[c.slug] = getComboImage(c.slug);

  return (
    <div style={{ paddingTop: 64, paddingBottom: 80 }}>
      <div className="animate-fadeInUp" style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(32px,6vw,48px) clamp(16px,4vw,40px) 80px' }}>
        <h1 style={{
          fontFamily: 'var(--font-orbitron, Orbitron), sans-serif',
          fontSize: 'clamp(22px,4vw,28px)', fontWeight: 900,
          color: '#fff', marginBottom: 8, letterSpacing: 2,
        }}>NOS COMBOS</h1>
        <p style={{ color: '#7c6d94', marginBottom: 40, fontSize: 14 }}>
          Combine plusieurs abonnements Premium en une seule formule et paie moins cher. Choisis ta durée, on s&apos;occupe du reste.
        </p>

        <CombosList images={images} />
      </div>
    </div>
  );
}
