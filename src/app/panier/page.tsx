'use client';
import { useState, useEffect } from 'react';
import { CartItem, Customer } from '@/types';
import { getCart, removeFromCart, clearCart, getCartTotal } from '@/lib/store';
import { Loader2, Copy, Check } from 'lucide-react';
import Link from 'next/link';

const iconFor = (name: string) => {
  if (name.includes('Netflix')) return '🎬';
  if (name.includes('Spotify')) return '🎵';
  if (name.includes('Amazon')) return '📦';
  if (name.includes('Apple')) return '🍎';
  if (name.includes('Crunchyroll')) return '⛩️';
  if (name.includes('Canva')) return '🎨';
  return '⭐';
};

const bgFor = (name: string) => {
  if (name.includes('Netflix')) return 'linear-gradient(135deg,#e50914,#8b0000)';
  if (name.includes('Spotify')) return 'linear-gradient(135deg,#1db954,#146f35)';
  if (name.includes('Amazon')) return 'linear-gradient(135deg,#00a8e0,#005f80)';
  if (name.includes('Apple')) return 'linear-gradient(135deg,#fc3c44,#a01c22)';
  if (name.includes('Crunchyroll')) return 'linear-gradient(135deg,#f47521,#a04c10)';
  if (name.includes('Canva')) return 'linear-gradient(135deg,#7d2ae8,#4a1589)';
  return 'linear-gradient(135deg,#a855f7,#7c3aed)';
};

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#4ade80' : '#a855f7', padding: '0 4px' }}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

export default function PanierPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer>({ name: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => { setCart(getCart()); }, []);

  const cartTotal = getCartTotal(cart);

  const handleRemove = (id: string) => {
    setCart(removeFromCart(id));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleOrder = async () => {
    if (!customer.name || !customer.phone || !customer.email) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer, cart, total: cartTotal }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setOrderId(data.order_id);
      setTotal(data.total);
      clearCart();
      window.dispatchEvent(new Event('cart-updated'));
    } catch {
      setError('Erreur de connexion. Vérifiez votre internet.');
    } finally {
      setLoading(false);
    }
  };

  const ref = orderId ? '#' + orderId.slice(0, 8).toUpperCase() : '';
  const waMsg = encodeURIComponent(`Bonjour, j'ai passé la commande ${ref} de ${total.toLocaleString()} FCFA. J'ai effectué le paiement. Merci de confirmer.`);
  const waUrl = `https://wa.me/237651536287?text=${waMsg}`;

  // ── Confirmation screen ──
  if (orderId) {
    return (
      <div style={{ paddingTop: 64, minHeight: '100vh' }}>
        <div className="animate-fadeInUp" style={{ maxWidth: 560, margin: '0 auto', padding: 'clamp(40px,8vw,64px) clamp(16px,4vw,32px)' }}>

          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
            <h1 style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'clamp(18px,4vw,22px)', fontWeight: 900, color: '#fff', letterSpacing: 2, marginBottom: 8 }}>
              COMMANDE ENREGISTRÉE !
            </h1>
            <p style={{ color: '#9d8fb5', fontSize: 14 }}>
              Référence : <span style={{ color: '#a855f7', fontWeight: 700, fontFamily: 'var(--font-orbitron)' }}>{ref}</span>
            </p>
          </div>

          {/* Instructions paiement */}
          <div style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 20, padding: 'clamp(20px,4vw,28px)', marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 13, color: '#a855f7', letterSpacing: 1, marginBottom: 20 }}>
              ÉTAPES DU PAIEMENT
            </div>

            {/* Step 1 */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#a855f7,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#fff', flexShrink: 0 }}>1</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e8e0f7', marginBottom: 12 }}>
                  Envoie <span style={{ color: '#a855f7', fontFamily: 'var(--font-orbitron)', fontWeight: 900 }}>{total.toLocaleString()} FCFA</span> à l'un de ces numéros :
                </div>

                {/* Orange Money */}
                <div style={{ background: 'rgba(255,137,29,0.08)', border: '1px solid rgba(255,137,29,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: '#ff891d', fontWeight: 600, letterSpacing: 1, marginBottom: 6 }}>📱 ORANGE MONEY</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 20, fontWeight: 900, color: '#fff' }}>697 275 048</div>
                      <div style={{ fontSize: 12, color: '#9d8fb5', marginTop: 2 }}>André Mbarga</div>
                    </div>
                    <CopyBtn text="697275048" />
                  </div>
                </div>

                {/* MTN MoMo */}
                <div style={{ background: 'rgba(255,204,0,0.06)', border: '1px solid rgba(255,204,0,0.2)', borderRadius: 12, padding: '12px 16px' }}>
                  <div style={{ fontSize: 11, color: '#ffcc00', fontWeight: 600, letterSpacing: 1, marginBottom: 6 }}>📱 MTN MOBILE MONEY</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 20, fontWeight: 900, color: '#fff' }}>651 536 287</div>
                      <div style={{ fontSize: 12, color: '#9d8fb5', marginTop: 2 }}>André Mbarga</div>
                    </div>
                    <CopyBtn text="651536287" />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#a855f7,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#fff', flexShrink: 0 }}>2</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e8e0f7', marginBottom: 10 }}>
                  Confirme ton paiement sur WhatsApp
                </div>
                <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: 'linear-gradient(135deg,#25d366,#128c7e)',
                  borderRadius: 12, padding: '13px 20px',
                  color: '#fff', fontWeight: 700, fontSize: 14,
                  textDecoration: 'none', boxShadow: '0 4px 16px rgba(37,211,102,0.3)',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Confirmer sur WhatsApp
                </a>
                <p style={{ fontSize: 11, color: '#5a4e6e', marginTop: 8, textAlign: 'center' }}>
                  Mentionne la référence <strong style={{ color: '#a855f7' }}>{ref}</strong> dans ton message
                </p>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#9d8fb5', lineHeight: 1.6 }}>
            ⚡ Tu recevras tes accès dans les <strong style={{ color: '#4ade80' }}>30 minutes</strong> suivant la confirmation de ton paiement.
          </div>

          <Link href="/boutique" style={{ display: 'block', textAlign: 'center', marginTop: 20, fontSize: 13, color: '#5a4e6e', textDecoration: 'none' }}>
            ← Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  // ── Cart screen ──
  return (
    <div style={{ paddingTop: 64 }}>
      <div className="animate-fadeInUp" style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(32px,6vw,48px) clamp(16px,4vw,40px) 80px' }}>
        <h1 style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'clamp(22px,4vw,28px)', fontWeight: 900, color: '#fff', marginBottom: 8, letterSpacing: 2 }}>PANIER</h1>
        <p style={{ color: '#7c6d94', marginBottom: 40, fontSize: 14 }}>
          {cart.length > 0 ? `${cart.length} article${cart.length > 1 ? 's' : ''} dans ton panier` : 'Ton panier est vide'}
        </p>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
            <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 16, color: '#7c6d94', marginBottom: 24 }}>Ton panier est vide</div>
            <Link href="/boutique" className="btn-purple" style={{ padding: '12px 28px', fontSize: 12, textDecoration: 'none', display: 'inline-block' }}>
              VOIR LA BOUTIQUE
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {cart.map(item => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(168,85,247,0.2)',
                  borderRadius: 14, padding: 'clamp(14px,3vw,18px) clamp(14px,3vw,20px)', flexWrap: 'wrap',
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: bgFor(item.name), flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {iconFor(item.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <div style={{ fontWeight: 600, color: '#e8e0f7', fontSize: 15 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: '#7c6d94', marginTop: 2 }}>{item.duration}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-orbitron)', fontWeight: 900, fontSize: 18, color: '#a855f7', marginRight: 8 }}>
                    {item.price.toLocaleString()} FCFA
                  </div>
                  <button onClick={() => handleRemove(item.id)} style={{
                    cursor: 'pointer', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#f87171', fontSize: 18,
                  }}>×</button>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 16, padding: 'clamp(20px,4vw,28px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 14, color: '#9d8fb5', letterSpacing: 1 }}>TOTAL</span>
                <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 28, fontWeight: 900, color: '#a855f7' }}>{cartTotal.toLocaleString()} FCFA</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: '#7c6d94', textTransform: 'uppercase', marginBottom: 8 }}>Nom complet</label>
                    <input type="text" placeholder="Jean Dupont" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} className="input-purple" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: '#7c6d94', textTransform: 'uppercase', marginBottom: 8 }}>Téléphone</label>
                    <input type="tel" placeholder="6XXXXXXXX" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} className="input-purple" />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: '#7c6d94', textTransform: 'uppercase', marginBottom: 8 }}>Email</label>
                  <input type="email" placeholder="jean@email.com" value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} className="input-purple" />
                </div>
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', color: '#f87171', fontSize: 13, marginBottom: 16 }}>
                  {error}
                </div>
              )}

              <button onClick={handleOrder} disabled={loading} className="btn-purple" style={{
                width: '100%', padding: 16, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                {loading
                  ? <><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> Traitement...</>
                  : `Commander — ${cartTotal.toLocaleString()} FCFA`}
              </button>

              <p style={{ textAlign: 'center', fontSize: 11, color: '#5a4e6e', marginTop: 12 }}>
                🔒 Paiement manuel sécurisé · Orange Money · MTN MoMo
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
