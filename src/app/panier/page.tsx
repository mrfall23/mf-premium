'use client';
import { useState, useEffect } from 'react';
import { CartItem, Customer } from '@/types';
import { getCart, removeFromCart, clearCart, getCartTotal } from '@/lib/store';
import { SEBPAY_COUNTRIES, getSebpayCountry } from '@/lib/sebpay';
import { Loader2 } from 'lucide-react';
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

export default function PanierPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer>({ name: '', phone: '', email: '' });
  const [countryCode, setCountryCode] = useState('CM');
  const [operator, setOperator] = useState('orange');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [payStatus, setPayStatus] = useState<'pending' | 'paid' | 'failed'>('pending');
  const [orderId, setOrderId] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => { setCart(getCart()); }, []);

  // Poll payment status while waiting
  useEffect(() => {
    if (!waiting || !orderId || payStatus !== 'pending') return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/status?order_id=${orderId}`);
        const data = await res.json();
        if (data.status === 'paid') {
          setPayStatus('paid');
          clearInterval(interval);
          setTimeout(() => { window.location.href = `/commande/${orderId}`; }, 1500);
        } else if (data.status === 'failed') {
          setPayStatus('failed');
          clearInterval(interval);
        }
      } catch { /* retry next tick */ }
    }, 4000);
    return () => clearInterval(interval);
  }, [waiting, orderId, payStatus]);

  const cartTotal = getCartTotal(cart);

  const selectedCountry = getSebpayCountry(countryCode) || SEBPAY_COUNTRIES[0];
  const selectedOperator = selectedCountry.operators.find(o => o.code === operator) || selectedCountry.operators[0];

  const handleCountryChange = (code: string) => {
    setCountryCode(code);
    const c = getSebpayCountry(code);
    if (c) setOperator(c.operators[0].code);
    setOtpCode('');
  };

  const handleRemove = (id: string) => {
    setCart(removeFromCart(id));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleOrder = async () => {
    if (!customer.name || !customer.phone || !customer.email) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (selectedOperator.otp && !otpCode) {
      setError(`${selectedOperator.name} exige un code OTP. Génère-le depuis ton application ou le code USSD de ton opérateur, puis saisis-le.`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer, cart, total: cartTotal,
          country: selectedCountry.code,
          operator: selectedOperator.code,
          otp_code: otpCode || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }

      setOrderId(data.order_id);
      setTotal(data.total);
      clearCart();
      window.dispatchEvent(new Event('cart-updated'));

      if (data.payment_url) {
        // Some operators use a redirect page
        window.location.href = data.payment_url;
      } else {
        // Orange/MTN: push USSD sent to the customer's phone
        setWaiting(true);
      }
    } catch {
      setError('Erreur de connexion. Vérifiez votre internet.');
    } finally {
      setLoading(false);
    }
  };

  // ── Waiting for phone confirmation screen ──
  if (waiting && orderId) {
    const ref = '#' + orderId.slice(0, 8).toUpperCase();
    const opName = selectedOperator.name;
    const ussd = selectedCountry.code === 'CM'
      ? (selectedOperator.code === 'orange' ? '#150#' : '*126#')
      : null;

    return (
      <div style={{ paddingTop: 64, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-fadeInUp" style={{ maxWidth: 500, margin: '0 auto', padding: '40px 24px', textAlign: 'center' }}>

          {payStatus === 'paid' ? (
            <>
              <div style={{ fontSize: 56, marginBottom: 20 }}>✅</div>
              <h1 style={{ fontFamily: 'var(--font-orbitron)', fontSize: 20, fontWeight: 900, color: '#4ade80', letterSpacing: 2, marginBottom: 12 }}>
                PAIEMENT CONFIRMÉ !
              </h1>
              <p style={{ color: '#9d8fb5', fontSize: 14 }}>Redirection vers ta commande...</p>
            </>
          ) : payStatus === 'failed' ? (
            <>
              <div style={{ fontSize: 56, marginBottom: 20 }}>❌</div>
              <h1 style={{ fontFamily: 'var(--font-orbitron)', fontSize: 20, fontWeight: 900, color: '#f87171', letterSpacing: 2, marginBottom: 12 }}>
                PAIEMENT ÉCHOUÉ
              </h1>
              <p style={{ color: '#9d8fb5', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
                Le paiement a été refusé ou a expiré.<br />Réessaie ou contacte-nous sur WhatsApp.
              </p>
              <Link href="/boutique" className="btn-purple" style={{ padding: '12px 28px', fontSize: 12, textDecoration: 'none', display: 'inline-block' }}>
                RETOUR À LA BOUTIQUE
              </Link>
            </>
          ) : (
            <>
              <div style={{ fontSize: 56, marginBottom: 20 }}>📲</div>
              <h1 style={{ fontFamily: 'var(--font-orbitron)', fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: 2, marginBottom: 12 }}>
                CONFIRME SUR TON TÉLÉPHONE
              </h1>
              <p style={{ color: '#9d8fb5', fontSize: 14, marginBottom: 20, lineHeight: 1.7 }}>
                Une demande de paiement <strong style={{ color: '#e8e0f7' }}>{opName}</strong> de{' '}
                <strong style={{ color: '#a855f7' }}>{total.toLocaleString()} FCFA</strong> a été envoyée au{' '}
                <strong style={{ color: '#e8e0f7' }}>{customer.phone}</strong>.
              </p>
              <div style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 14, padding: '16px 20px', marginBottom: 20, textAlign: 'left' }}>
                <div style={{ fontSize: 12, color: '#c084fc', fontWeight: 600, marginBottom: 8 }}>💡 Tu n'as pas reçu la demande ?</div>
                <div style={{ fontSize: 13, color: '#9d8fb5', lineHeight: 1.6 }}>
                  {ussd ? (
                    <>Tape <strong style={{ color: '#fff', fontFamily: 'var(--font-orbitron)' }}>{ussd}</strong> sur ton téléphone pour valider la transaction en attente.</>
                  ) : (
                    <>Ouvre ton application {opName} ou vérifie tes notifications pour valider la transaction en attente.</>
                  )}
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 14, color: '#7c6d94', marginBottom: 20 }}>
                Référence : <span style={{ color: '#a855f7', fontWeight: 700 }}>{ref}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#a855f7', fontSize: 13 }}>
                <Loader2 style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} />
                Vérification automatique du paiement...
              </div>
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

              {/* Infos client */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: '#7c6d94', textTransform: 'uppercase', marginBottom: 8 }}>Nom complet</label>
                    <input type="text" placeholder="Jean Dupont" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} className="input-purple" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: '#7c6d94', textTransform: 'uppercase', marginBottom: 8 }}>Téléphone Mobile Money</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ flexShrink: 0, fontSize: 13, fontWeight: 700, color: '#a855f7', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 10, padding: '12px 10px' }}>
                        +{selectedCountry.prefix}
                      </span>
                      <input type="tel" placeholder="6XXXXXXXX" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} className="input-purple" style={{ flex: 1 }} />
                    </div>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: '#7c6d94', textTransform: 'uppercase', marginBottom: 8 }}>Email</label>
                  <input type="email" placeholder="jean@email.com" value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} className="input-purple" />
                </div>
              </div>

              {/* Choix pays */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: '#7c6d94', textTransform: 'uppercase', marginBottom: 8 }}>Pays</label>
                <select
                  value={countryCode}
                  onChange={e => handleCountryChange(e.target.value)}
                  className="input-purple"
                  style={{ width: '100%', cursor: 'pointer', appearance: 'none' }}
                >
                  {SEBPAY_COUNTRIES.map(c => (
                    <option key={c.code} value={c.code} style={{ background: '#14101f', color: '#e8e0f7' }}>
                      {c.flag} {c.name} (+{c.prefix})
                    </option>
                  ))}
                </select>
              </div>

              {/* Choix opérateur */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: '#7c6d94', textTransform: 'uppercase', marginBottom: 12 }}>Moyen de paiement</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
                  {selectedCountry.operators.map(op => {
                    const active = operator === op.code;
                    return (
                      <button
                        key={op.code}
                        onClick={() => { setOperator(op.code); setOtpCode(''); }}
                        style={{
                          padding: '14px 12px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                          background: active ? `${op.color}22` : 'rgba(255,255,255,0.03)',
                          border: active ? `2px solid ${op.color}` : '2px solid rgba(255,255,255,0.08)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        }}
                      >
                        <span style={{ width: 22, height: 22, borderRadius: '50%', background: op.color, display: 'inline-block' }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: active ? op.color : '#9d8fb5' }}>{op.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Code OTP si l'opérateur l'exige */}
              {selectedOperator.otp && (
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: '#7c6d94', textTransform: 'uppercase', marginBottom: 8 }}>Code OTP {selectedOperator.name}</label>
                  <input
                    type="text"
                    placeholder="Ex: 123456"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    className="input-purple"
                    style={{ width: '100%' }}
                  />
                  <p style={{ fontSize: 11, color: '#7c6d94', marginTop: 8, lineHeight: 1.5 }}>
                    💡 Génère un code de paiement depuis ton application {selectedOperator.name} ou via le code USSD de ton opérateur, puis saisis-le ici avant de payer.
                  </p>
                </div>
              )}

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
                  : `Payer ${cartTotal.toLocaleString()} FCFA →`}
              </button>

              <p style={{ textAlign: 'center', fontSize: 11, color: '#5a4e6e', marginTop: 12 }}>
                🔒 Paiement Mobile Money sécurisé · 12 pays d'Afrique
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
