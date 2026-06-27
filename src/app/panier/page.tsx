'use client';
import { useState, useEffect, useRef } from 'react';
import { CartItem, Customer } from '@/types';
import { getCart, removeFromCart, clearCart, getCartTotal } from '@/lib/store';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

type PayStep = 'cart' | 'waiting' | 'done' | 'failed';

export default function PanierPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer>({ name: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<PayStep>('cart');
  const [orderId, setOrderId] = useState('');
  const [ussdCode, setUssdCode] = useState('');
  const [operator, setOperator] = useState('');
  const [dots, setDots] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  useEffect(() => { setCart(getCart()); }, []);

  // Animate dots while waiting
  useEffect(() => {
    if (step !== 'waiting') return;
    const iv = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(iv);
  }, [step]);

  // Poll payment status
  useEffect(() => {
    if (step !== 'waiting' || !orderId) return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/status?order_id=${orderId}`);
        const { status } = await res.json();
        if (status === 'paid') {
          clearInterval(pollRef.current!);
          clearCart();
          window.dispatchEvent(new Event('cart-updated'));
          setStep('done');
          setTimeout(() => router.push(`/commande/${orderId}`), 1500);
        } else if (status === 'failed') {
          clearInterval(pollRef.current!);
          setStep('failed');
        }
      } catch { /* continue polling */ }
    }, 4000);

    return () => clearInterval(pollRef.current!);
  }, [step, orderId, router]);

  const handleRemove = (id: string) => {
    setCart(removeFromCart(id));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleClear = () => {
    clearCart(); setCart([]);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const total = getCartTotal(cart);

  const handlePayment = async () => {
    if (!customer.name || !customer.phone || !customer.email) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (cart.length === 0) { setError('Ton panier est vide.'); return; }

    // Normalise le numéro : ajoute 237 si pas déjà présent
    let phone = customer.phone.replace(/\s+/g, '');
    if (!phone.startsWith('237')) phone = '237' + phone;
    const normalizedCustomer = { ...customer, phone };

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: normalizedCustomer, cart, total }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setOrderId(data.order_id);
      setUssdCode(data.ussd_code || '');
      setOperator(data.operator || '');
      setStep('waiting');
    } catch {
      setError('Erreur de connexion. Vérifiez votre internet.');
    } finally {
      setLoading(false);
    }
  };

  // ── Waiting screen ──
  if (step === 'waiting' || step === 'done' || step === 'failed') {
    return (
      <div style={{ paddingTop: 64, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-fadeInUp" style={{
          maxWidth: 480, width: '100%', margin: '0 auto',
          padding: 'clamp(32px,6vw,48px) clamp(16px,4vw,32px)',
          textAlign: 'center',
        }}>
          {step === 'done' ? (
            <>
              <div style={{ fontSize: 56, marginBottom: 20 }}>✅</div>
              <h2 style={{ fontFamily: 'var(--font-orbitron)', fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 12 }}>
                PAIEMENT CONFIRMÉ !
              </h2>
              <p style={{ color: '#9d8fb5', fontSize: 14 }}>Redirection vers ta commande...</p>
            </>
          ) : step === 'failed' ? (
            <>
              <div style={{ fontSize: 56, marginBottom: 20 }}>❌</div>
              <h2 style={{ fontFamily: 'var(--font-orbitron)', fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 12 }}>
                PAIEMENT ÉCHOUÉ
              </h2>
              <p style={{ color: '#9d8fb5', fontSize: 14, marginBottom: 24 }}>
                La transaction n'a pas abouti. Vérifie ton solde et réessaie.
              </p>
              <button onClick={() => setStep('cart')} className="btn-purple" style={{ padding: '12px 28px', fontSize: 12, cursor: 'pointer' }}>
                RÉESSAYER
              </button>
            </>
          ) : (
            <>
              {/* Pulse animation */}
              <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 24px' }}>
                <div className="animate-glow-pulse" style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(168,85,247,0.3)', borderRadius: '50%',
                }}/>
                <div style={{
                  position: 'absolute', inset: 8,
                  background: 'linear-gradient(135deg,#a855f7,#7c3aed)',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28,
                }}>📱</div>
              </div>

              <h2 style={{ fontFamily: 'var(--font-orbitron)', fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 12 }}>
                VÉRIFIEZ VOTRE TÉLÉPHONE{dots}
              </h2>

              <p style={{ color: '#9d8fb5', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                Un prompt {operator ? <strong style={{ color: '#a855f7' }}>{operator}</strong> : 'USSD'} a été envoyé sur le <strong style={{ color: '#e8e0f7' }}>{customer.phone}</strong>.
                <br />Entrez votre code PIN pour confirmer le paiement de <strong style={{ color: '#a855f7' }}>{total.toLocaleString()} FCFA</strong>.
              </p>

              {ussdCode && (
                <div style={{
                  background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)',
                  borderRadius: 12, padding: '12px 20px', marginBottom: 24,
                }}>
                  <div style={{ fontSize: 11, color: '#7c6d94', marginBottom: 4, letterSpacing: 1 }}>CODE USSD</div>
                  <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 18, fontWeight: 900, color: '#a855f7' }}>
                    {ussdCode}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#7c6d94', fontSize: 13 }}>
                <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                Vérification en cours automatiquement...
              </div>

              <p style={{ fontSize: 11, color: '#3d3450', marginTop: 20 }}>
                Cette page se met à jour automatiquement. Ne la fermez pas.
              </p>
            </>
          )}
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
            {/* Items */}
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

            {/* Form + total */}
            <div style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 16, padding: 'clamp(20px,4vw,28px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 14, color: '#9d8fb5', letterSpacing: 1 }}>TOTAL</span>
                <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 28, fontWeight: 900, color: '#a855f7' }}>{total.toLocaleString()} FCFA</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: '#7c6d94', textTransform: 'uppercase', marginBottom: 8 }}>Nom complet</label>
                    <input type="text" placeholder="Jean Dupont" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} className="input-purple" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: '#7c6d94', textTransform: 'uppercase', marginBottom: 8 }}>Téléphone Mobile Money</label>
                    <input type="tel" placeholder="237699000000" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} className="input-purple" />
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

              <button onClick={handlePayment} disabled={loading} className="btn-purple" style={{
                width: '100%', padding: 16, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                {loading
                  ? <><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> Envoi en cours...</>
                  : `⚡ Payer ${total.toLocaleString()} FCFA via Mobile Money`}
              </button>

              <button onClick={handleClear} style={{ cursor: 'pointer', width: '100%', background: 'transparent', border: 'none', marginTop: 12, fontSize: 12, color: '#5a4e6e', padding: 8 }}>
                Vider le panier
              </button>

              <p style={{ textAlign: 'center', fontSize: 11, color: '#5a4e6e', marginTop: 12 }}>
                🔒 Paiement sécurisé · Orange Money · MTN MoMo · Powered by Campay
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
