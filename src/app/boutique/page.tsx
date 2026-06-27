import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import PricingSection from '@/components/PricingSection';

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erreur chargement produits:', error);
    return [];
  }
  return data || [];
}

const durationOrder: Record<string, number> = { '1 mois': 0, '3 mois': 1, '1 an': 2 };

export default async function BoutiquePage() {
  const products = await getProducts();

  const grouped: Record<string, Product[]> = {};
  for (const p of products) {
    if (!grouped[p.name]) grouped[p.name] = [];
    grouped[p.name].push(p);
  }
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => (durationOrder[a.duration] ?? 99) - (durationOrder[b.duration] ?? 99));
  }

  return (
    <div style={{ paddingTop: 64, paddingBottom: 80 }}>
      <div className="animate-fadeInUp" style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(32px,6vw,48px) clamp(16px,4vw,40px) 80px' }}>
        <h1 style={{
          fontFamily: 'var(--font-orbitron, Orbitron), sans-serif',
          fontSize: 'clamp(22px,4vw,28px)', fontWeight: 900,
          color: '#fff', marginBottom: 8, letterSpacing: 2,
        }}>BOUTIQUE</h1>
        <p style={{ color: '#7c6d94', marginBottom: 40, fontSize: 14 }}>
          Sélectionne ton abonnement et la durée souhaitée.
        </p>

        {Object.keys(grouped).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#7c6d94' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
            <p>Aucun produit disponible pour le moment.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,340px),1fr))',
            gap: 24,
          }}>
            {Object.entries(grouped).map(([name, variants]) => (
              <PricingSection key={name} name={name} variants={variants} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
