'use client';
import { useState } from 'react';

const faqs = [
  { q: 'Comment reçois-je mon abonnement ?', a: "Après ta commande et confirmation du paiement, tu reçois tes identifiants par email ou directement sur WhatsApp en quelques minutes." },
  { q: 'Les comptes sont-ils partagés ?', a: "Certains comptes sont en profil dédié (ex: Netflix), d'autres en accès individuel. Tout est précisé lors de la commande." },
  { q: 'Quelle est la durée de validité ?', a: "Tu choisis ta durée : 1 mois, 3 mois ou 1 an. Le renouvellement est possible à l'expiration." },
  { q: 'Que se passe-t-il si le compte ne fonctionne plus ?', a: "MF Premium garantit le bon fonctionnement. En cas de problème, nous remplaçons ton accès rapidement, sans frais supplémentaires." },
  { q: 'Quels moyens de paiement acceptez-vous ?', a: "Nous acceptons Orange Money et MTN Mobile Money. Contacte-nous pour plus d'infos." },
  { q: 'Puis-je commander plusieurs abonnements à la fois ?', a: "Absolument ! Tu peux ajouter plusieurs services au panier et passer une seule commande groupée." },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div style={{ paddingTop: 64 }}>
      <div className="animate-fadeInUp" style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(32px,6vw,48px) clamp(16px,4vw,40px) 80px' }}>
        <h1 style={{
          fontFamily: 'var(--font-orbitron, Orbitron), sans-serif',
          fontSize: 'clamp(22px,4vw,28px)', fontWeight: 900,
          color: '#fff', marginBottom: 8, letterSpacing: 2,
        }}>FAQ</h1>
        <p style={{ color: '#7c6d94', marginBottom: 40, fontSize: 14 }}>
          Tout ce que tu dois savoir sur MF Premium.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {faqs.map((faq, i) => (
            <div key={i} className="faq-item">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '20px 24px', gap: 16, textAlign: 'left',
                }}
              >
                <span style={{ fontWeight: 600, color: '#e8e0f7', fontSize: 15 }}>{faq.q}</span>
                <span style={{
                  color: '#a855f7', fontSize: 20, flexShrink: 0,
                  transition: 'transform .2s',
                  transform: openIndex === i ? 'rotate(90deg)' : 'rotate(0deg)',
                  display: 'inline-block',
                }}>›</span>
              </button>
              {openIndex === i && (
                <div style={{
                  padding: '0 24px 20px',
                  color: '#9d8fb5', fontSize: 14, lineHeight: 1.7,
                  borderTop: '1px solid rgba(168,85,247,0.1)',
                }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact section */}
        <div style={{ marginTop: 48 }}>
          <h2 style={{
            fontFamily: 'var(--font-orbitron)', fontSize: 16, fontWeight: 700,
            color: '#fff', marginBottom: 20, letterSpacing: 1,
          }}>BESOIN D'AIDE ?</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: '📱 WhatsApp', href: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}` },
            ].map(c => (
              <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(168,85,247,0.2)',
                borderRadius: 10, padding: '12px 20px',
                color: '#c084fc', fontSize: 13, fontWeight: 500,
                textDecoration: 'none', transition: 'all .2s',
              }}>{c.label}</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
