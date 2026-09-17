import CombosList from '@/components/CombosList';
import { COMBOS, COMBO_MONTHS, comboDurationLabel, ComboDisplay, ComboOption } from '@/lib/combos';
import { getComboImage } from '@/lib/catalog-images';
import { supabase } from '@/lib/supabase';
import { slugify } from '@/lib/catalog';
import { Product } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Combos — Plusieurs abonnements Premium à prix réduit — MF Premium',
  description: 'Nos formules combinant plusieurs abonnements Premium (Netflix, Spotify, Amazon Prime, Crunchyroll, Apple Music) au meilleur prix.',
};

// Toujours refléter l'état de la base (les combos apparaissent dès le SQL exécuté,
// sans attendre un redéploiement).
export const dynamic = 'force-dynamic';

// Combos vendables enregistrés en base (script supabase-combos.sql).
async function getComboProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('category', 'combo');
  if (error) {
    console.error('Erreur chargement combos:', error);
    return [];
  }
  return data || [];
}

export default async function CombosPage() {
  const dbProducts = await getComboProducts();

  // Pour chaque combo (métadonnées visuelles), on construit ses durées : on
  // utilise le produit réel Supabase s'il existe (id réel → order_items propre),
  // sinon un article de repli au même format (la page marche même sans le SQL).
  const combos: ComboDisplay[] = COMBOS.map((c) => {
    const variants = dbProducts.filter((p) => slugify(p.name) === c.slug);

    const options: ComboOption[] = COMBO_MONTHS.map((m) => {
      const label = comboDurationLabel(m);
      const dbVariant = variants.find((v) => v.duration === label);

      if (dbVariant) {
        return { months: m, price: dbVariant.price, cartItem: dbVariant };
      }

      const price = c.monthlyPrice * m;
      return {
        months: m,
        price,
        cartItem: {
          id: `combo-${c.slug}-${m}m`,
          name: `Combo ${c.name} — ${c.services.join(' + ')}`,
          description: `${c.services.join(' + ')} — ${label}`,
          price,
          duration: label,
          image_url: '',
          category: 'combo',
          is_active: true,
        } as Product,
      };
    });

    return { slug: c.slug, name: c.name, services: c.services, options };
  });

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

        <CombosList combos={combos} images={images} />
      </div>
    </div>
  );
}
