import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      position: 'relative', zIndex: 1,
      borderTop: '1px solid rgba(168,85,247,0.1)',
      padding: 'clamp(20px,4vw,32px) clamp(16px,4vw,40px)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 16,
    }}>
      <div style={{
        fontFamily: 'var(--font-orbitron, Orbitron), sans-serif',
        fontSize: 13, fontWeight: 700, color: '#5a4e6e', letterSpacing: 2,
      }}>MF PREMIUM</div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {[
          { href: '/', label: 'Accueil' },
          { href: '/boutique', label: 'Boutique' },
          { href: '/faq', label: 'FAQ' },
          { href: '/panier', label: 'Panier' },
        ].map(l => (
          <Link key={l.href} href={l.href} style={{
            fontSize: 12, color: '#3d3450', textDecoration: 'none', transition: 'color .2s',
          }}>{l.label}</Link>
        ))}
      </div>

      <div style={{ fontSize: 12, color: '#3d3450' }}>
        © {new Date().getFullYear()} MF Premium — Tous droits réservés
      </div>
    </footer>
  );
}
