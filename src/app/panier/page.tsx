'use client';
import { useState, useEffect } from 'react';
import { CartItem, Customer } from '@/types';
import { getCart, removeFromCart, clearCart, getCartTotal } from '@/lib/store';
import { formatFCFA } from '@/lib/format';
import { DIRECT_PAYMENT_METHODS } from '@/lib/direct-payment';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [codeChecking, setCodeChecking] = useState(false);
  const [codeInfo, setCodeInfo] = useState<{ valid: boolean; nom?: string; remise_pct?: number; remise_montant?: number; new_total?: number; message?: string } | null>(null);
  const [placed, setPlaced] = useState<{ orderId: string; total: number; waMsg: string } | null>(null);

  useEffect(() => { setCart(getCart()); }, []);

  const cartTotal = getCartTotal(cart);
  const remise = codeInfo?.valid ? (codeInfo.remise_montant || 0) : 0;
  const totalToPay = Math.max(0, cartTotal - remise);

  const handleRemove = (id: string) => {
    setCart(removeFromCart(id));
    window.dispatchEvent(new Event('cart-updated'));
    setCodeInfo(null); // le total a changé, on invalide la remise affichée
  };

  const applyCode = async () => {
    if (!code.trim()) { setCodeInfo(null); return; }
    setCodeChecking(true);
    setCodeInfo(null);
    try {
      const res = await fetch('/api/referral/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, total: cartTotal }),
      });
      setCodeInfo(await res.json());
    } catch {
      setCodeInfo({ valid: false, message: 'Erreur de vérification.' });
    } finally {
      setCodeChecking(false);
    }
  };

  const handleOrder = async () => {
    if (!customer.name || !customer.email) {
      setError('Veuillez renseigner votre nom et votre email.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/payment/direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer, cart, total: cartTotal, code: codeInfo?.valid ? code : undefined }),
      });
      const data = await res.json();
      if (data.error || !data.order_id) {
        setError(data.error || "La commande n'a pas pu être enregistrée. Réessaie.");
        return;
      }

      // Message WhatsApp pré-rempli (construit avant de vider le panier)
      const ref = '#' + data.order_id.slice(0, 8).toUpperCase();
      const items = cart.map(i => `• ${i.name} (${i.duration})`).join('\n');
      const waMsg = encodeURIComponent(
        `Bonjour MF Premium 👋\nJe viens de passer la commande ${ref} :\n${items}\n\n💰 Montant : ${formatFCFA(data.total)} FCFA\nJe paie par Orange/MTN — voici ma preuve de paiement :`
      );

      setPlaced({ orderId: data.order_id, total: data.total, waMsg });
      clearCart();
      window.dispatchEvent(new Event('cart-updated'));
    } catch {
      setError('Erreur de connexion. Vérifiez votre internet.');
    } finally {
      setLoading(false);
    }
  };

  // ── Écran instructions de paiement direct (après commande) ──
  if (placed) {
    const ref = '#' + placed.orderId.slice(0, 8).toUpperCase();
    const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    return (
      <div style={{ paddingTop: 64, minHeight: '100vh' }}>
        <div className="animate-fadeInUp" style={{ maxWidth: 560, margin: '0 auto', padding: 'clamp(32px,6vw,56px) clamp(16px,4vw,40px) 80px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📲</div>
            <h1 style={{ fontFamily: 'var(--font-orbitron)', fontSize: 'clamp(20px,4vw,26px)', fontWeight: 900, color: '#fff', letterSpacing: 2, marginBottom: 8 }}>DERNIÈRE ÉTAPE : LE PAIEMENT</h1>
            <p style={{ color: '#9d8fb5', fontSize: 14 }}>Envoie le montant à l&apos;un des numéros ci-dessous, puis confirme sur WhatsApp.</p>
          </div>

          <div style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 16, padding: '20px 24px', marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#7c6d94', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Montant à envoyer</div>
            <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 34, fontWeight: 900, color: '#a855f7' }}>{formatFCFA(placed.total)} FCFA</div>
            <div style={{ fontSize: 13, color: '#7c6d94', marginTop: 8 }}>Référence : <strong style={{ color: '#a855f7' }}>{ref}</strong></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {DIRECT_PAYMENT_METHODS.map(m => (
              <div key={m.number} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.03)', border: `1px solid ${m.color}55`, borderRadius: 14, padding: '16px 18px' }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#9d8fb5' }}>{m.operator} — {m.name}</div>
                  <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>{m.number}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: 14, padding: '16px 20px', marginBottom: 24, fontSize: 13, color: '#9d8fb5', lineHeight: 1.9 }}>
            <div><strong style={{ color: '#e8e0f7' }}>1.</strong> Envoie <strong style={{ color: '#fff' }}>{formatFCFA(placed.total)} FCFA</strong> à l&apos;un des numéros ci-dessus.</div>
            <div><strong style={{ color: '#e8e0f7' }}>2.</strong> Clique sur <strong style={{ color: '#25d366' }}>WhatsApp</strong> et envoie ta capture de paiement.</div>
            <div><strong style={{ color: '#e8e0f7' }}>3.</strong> Tu reçois tes accès dès confirmation ✅</div>
          </div>

          <a href={`https://wa.me/${waNumber}?text=${placed.waMsg}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: 16, background: 'linear-gradient(135deg,#25d366,#128c7e)', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', letterSpacing: 1 }}>
            📲 J&apos;AI PAYÉ — ENVOYER MA PREUVE SUR WHATSAPP
          </a>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#7c6d94', marginTop: 16 }}>
            Commande <strong style={{ color: '#a855f7' }}>{ref}</strong> enregistrée · <Link href={`/commande/${placed.orderId}`} style={{ color: '#a855f7' }}>voir ma commande</Link>
          </p>
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
                    {formatFCFA(item.price)} FCFA
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
                <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 28, fontWeight: 900, color: '#a855f7' }}>{formatFCFA(cartTotal)} FCFA</span>
              </div>

              {/* Infos client */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: '#7c6d94', textTransform: 'uppercase', marginBottom: 8 }}>Nom complet</label>
                  <input type="text" placeholder="Jean Dupont" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} className="input-purple" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: '#7c6d94', textTransform: 'uppercase', marginBottom: 8 }}>Email</label>
                  <input type="email" placeholder="jean@email.com" value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} className="input-purple" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: '#7c6d94', textTransform: 'uppercase', marginBottom: 8 }}>Téléphone <span style={{ textTransform: 'none', color: '#5a4e6e' }}>(WhatsApp / Mobile Money)</span></label>
                  <input type="tel" placeholder="+237 6XX XX XX XX" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} className="input-purple" style={{ width: '100%' }} />
                </div>
              </div>

              {/* Code ambassadeur / promo */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: '#7c6d94', textTransform: 'uppercase', marginBottom: 8 }}>Code ambassadeur <span style={{ textTransform: 'none', color: '#5a4e6e' }}>(optionnel)</span></label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Ex : MARIE"
                    value={code}
                    onChange={e => { setCode(e.target.value.toUpperCase()); setCodeInfo(null); }}
                    onBlur={applyCode}
                    className="input-purple"
                    style={{ flex: 1, textTransform: 'uppercase' }}
                  />
                  <button
                    type="button"
                    onClick={applyCode}
                    disabled={codeChecking || !code.trim()}
                    className="btn-outline-purple"
                    style={{ padding: '0 18px', fontSize: 12, cursor: codeChecking || !code.trim() ? 'not-allowed' : 'pointer', opacity: codeChecking || !code.trim() ? 0.5 : 1, whiteSpace: 'nowrap' }}
                  >
                    {codeChecking ? '...' : 'Appliquer'}
                  </button>
                </div>
                {codeInfo && (
                  <p style={{ fontSize: 12, marginTop: 8, color: codeInfo.valid ? '#4ade80' : '#f0a35e' }}>
                    {codeInfo.valid
                      ? `✅ Code ${codeInfo.nom} appliqué : −${codeInfo.remise_pct}% (−${formatFCFA(codeInfo.remise_montant || 0)} FCFA)`
                      : `ℹ️ ${codeInfo.message || 'Code invalide.'}`}
                  </p>
                )}
              </div>

              {/* Récap remise */}
              {remise > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20, paddingTop: 16, borderTop: '1px solid rgba(168,85,247,0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9d8fb5' }}>
                    <span>Sous-total</span><span>{formatFCFA(cartTotal)} FCFA</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#4ade80' }}>
                    <span>Remise ({codeInfo?.nom})</span><span>−{formatFCFA(remise)} FCFA</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-orbitron)', fontSize: 16, fontWeight: 900, color: '#fff', marginTop: 4 }}>
                    <span>À PAYER</span><span style={{ color: '#a855f7' }}>{formatFCFA(totalToPay)} FCFA</span>
                  </div>
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
                  ? <><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> Enregistrement...</>
                  : `Commander · ${formatFCFA(totalToPay)} FCFA →`}
              </button>

              <p style={{ textAlign: 'center', fontSize: 11, color: '#5a4e6e', marginTop: 12 }}>
                🔒 Paiement Mobile Money direct · Orange Money &amp; MTN MoMo
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
