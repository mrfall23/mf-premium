import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Props { params: Promise<{ id: string }> }

async function getOrder(id: string) {
  const { data } = await supabase
    .from('orders')
    .select('*, customers(name, email, phone), order_items(product_name, price, duration, quantity)')
    .eq('id', id)
    .single();
  return data;
}

export default async function CommandePage({ params }: Props) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    return (
      <div style={{ paddingTop: 64, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❓</div>
          <h1 style={{ fontFamily: 'var(--font-orbitron)', fontSize: 20, color: '#fff', marginBottom: 12 }}>Commande introuvable</h1>
          <Link href="/boutique" className="btn-purple" style={{ padding: '12px 24px', fontSize: 12, textDecoration: 'none', display: 'inline-block', marginTop: 8 }}>
            RETOUR À LA BOUTIQUE
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = order.status === 'paid';
  const isPending = order.status === 'pending';

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh' }}>
      <div className="animate-fadeInUp" style={{ maxWidth: 600, margin: '0 auto', padding: 'clamp(40px,8vw,80px) clamp(16px,4vw,40px)' }}>

        {/* Status icon */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>
            {isPaid ? '✅' : isPending ? '⏳' : '❌'}
          </div>
          <h1 style={{
            fontFamily: 'var(--font-orbitron)', fontSize: 'clamp(20px,4vw,26px)',
            fontWeight: 900, color: '#fff', letterSpacing: 2, marginBottom: 8,
          }}>
            {isPaid ? 'COMMANDE CONFIRMÉE !' : isPending ? 'EN ATTENTE DE PAIEMENT' : 'PAIEMENT ÉCHOUÉ'}
          </h1>
          <p style={{ color: '#9d8fb5', fontSize: 14 }}>
            {isPaid
              ? 'Ton paiement a été reçu. Tu vas recevoir tes accès très bientôt.'
              : isPending
              ? 'Ton paiement est en cours de traitement.'
              : 'Le paiement n\'a pas abouti. Contacte-nous si nécessaire.'}
          </p>
        </div>

        {/* Order card */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 20, padding: 'clamp(20px,4vw,28px)', marginBottom: 20 }}>

          {/* Order ID */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(168,85,247,0.1)' }}>
            <span style={{ fontSize: 11, color: '#7c6d94', letterSpacing: 1, textTransform: 'uppercase' }}>Commande</span>
            <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 14, fontWeight: 700, color: '#a855f7' }}>
              #{id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          {/* Customer */}
          <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(168,85,247,0.1)' }}>
            <div style={{ fontSize: 11, color: '#7c6d94', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Client</div>
            <div style={{ fontSize: 14, color: '#e8e0f7', fontWeight: 600 }}>{order.customers?.name}</div>
            <div style={{ fontSize: 13, color: '#7c6d94' }}>{order.customers?.email}</div>
            <div style={{ fontSize: 13, color: '#7c6d94' }}>{order.customers?.phone}</div>
          </div>

          {/* Items */}
          <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(168,85,247,0.1)' }}>
            <div style={{ fontSize: 11, color: '#7c6d94', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Articles</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {order.order_items?.map((item: { product_name: string; duration: string; price: number; quantity: number }, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, color: '#e8e0f7', fontWeight: 500 }}>{item.product_name}</div>
                    <div style={{ fontSize: 12, color: '#7c6d94' }}>{item.duration}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 14, fontWeight: 700, color: '#a855f7' }}>
                    {item.price.toLocaleString()} FCFA
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 14, color: '#9d8fb5', letterSpacing: 1 }}>TOTAL PAYÉ</span>
            <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 24, fontWeight: 900, color: isPaid ? '#4ade80' : '#a855f7' }}>
              {order.total_amount?.toLocaleString()} FCFA
            </span>
          </div>
        </div>

        {/* Next steps */}
        {isPaid && (
          <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 16, padding: '20px 24px', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#4ade80', marginBottom: 8 }}>📬 Prochaine étape</div>
            <p style={{ fontSize: 13, color: '#9d8fb5', lineHeight: 1.6 }}>
              Tu vas recevoir tes identifiants de connexion par <strong style={{ color: '#e8e0f7' }}>email</strong> ou via <strong style={{ color: '#e8e0f7' }}>WhatsApp</strong> dans les prochaines minutes. Contacte-nous si tu ne reçois rien sous 30 minutes.
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/boutique" className="btn-purple" style={{ flex: 1, padding: '12px 20px', fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 140 }}>
            NOUVELLE COMMANDE
          </Link>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Bonjour, j'ai passé la commande %23${id.slice(0, 8).toUpperCase()}`}
            target="_blank" rel="noopener noreferrer"
            className="btn-outline-purple"
            style={{ flex: 1, padding: '12px 20px', fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 140 }}
          >
            📱 WHATSAPP
          </a>
        </div>
      </div>
    </div>
  );
}
