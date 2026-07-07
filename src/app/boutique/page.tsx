import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { getServiceMeta, slugify } from '@/lib/catalog';
import Link from 'next/link';

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

export default async function BoutiquePage() {
  const products = await getProducts();

  // Un seul groupe par nom de service, avec le prix minimum
  const grouped: Record<string, Product[]> = {};
  for (const p of products) {
    if (!grouped[p.name]) grouped[p.name] = [];
    grouped[p.name].push(p);
  }

  return (
    <div style={{ paddingTop: 64, paddingBottom: 80 }}>
      <div className="animate-fadeInUp" style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(32px,6vw,48px) clamp(16px,4vw,40px) 80px' }}>
        <h1 style={{
          fontFamily: 'var(--font-orbitron, Orbitron), sans-serif',
          fontSize: 'clamp(22px,4vw,28px)', fontWeight: 900,
          color: '#fff', marginBottom: 8, letterSpacing: 2,
        }}>NOTRE CATALOGUE</h1>
        <p style={{ color: '#7c6d94', marginBottom: 40, fontSize: 14 }}>
          Choisis ton service, découvre les offres et commande en 2 minutes.
        </p>

        {Object.keys(grouped).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#7c6d94' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
            <p>Aucun produit disponible pour le moment.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,300px),1fr))',
            gap: 24,
          }}>
            {Object.entries(grouped).map(([name, variants]) => {
              const meta = getServiceMeta(name);
              const minPrice = Math.min(...variants.map(v => v.price));
              const slug = slugify(name);

              return (
                <Link key={name} href={`/app/${slug}`} style={{ textDecoration: 'none' }}>
                  <div className="card-purple" style={{
                    padding: 'clamp(24px,4vw,32px)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    textAlign: 'center', gap: 16, cursor: 'pointer', height: '100%',
                  }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: 18,
                      background: meta.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 34, boxShadow: `0 6px 24px ${meta.glow}`,
                    }}>{meta.icon}</div>

                    <div>
                      <div style={{
                        fontFamily: 'var(--font-orbitron)', fontWeight: 700,
                        fontSize: 17, color: '#fff', marginBottom: 6, letterSpacing: 1,
                      }}>{name}</div>
                      <div style={{ fontSize: 13, color: '#7c6d94', lineHeight: 1.5 }}>{meta.tagline}</div>
                    </div>

                    <div style={{ fontSize: 12, color: '#9d8fb5' }}>
                      À partir de{' '}
                      <span style={{
                        fontFamily: 'var(--font-orbitron)', fontWeight: 900,
                        fontSize: 16, color: '#a855f7',
                      }}>{minPrice.toLocaleString()} FCFA</span>
                    </div>

                    <span className="btn-purple" style={{
                      padding: '11px 24px', fontSize: 11, display: 'inline-block',
                      marginTop: 'auto', width: '100%',
                    }}>
                      VOIR LES OFFRES →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
