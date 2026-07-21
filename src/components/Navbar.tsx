'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCart } from '@/lib/store';

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const update = () => {
      const cart = getCart();
      setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
    };
    update();
    window.addEventListener('cart-updated', update);
    return () => window.removeEventListener('cart-updated', update);
  }, []);

  const navColor = (path: string) =>
    pathname === path ? '#a855f7' : '#9d8fb5';

  const links = [
    { href: '/', label: 'Accueil' },
    { href: '/boutique', label: 'Boutique' },
    { href: '/faq', label: 'FAQ' },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 'var(--promo-h, 0px)', left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', height: 64,
      background: 'rgba(5,5,8,0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(168,85,247,0.2)',
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{
          width: 38, height: 38,
          background: 'linear-gradient(135deg,#a855f7,#7c3aed)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-orbitron, Orbitron), sans-serif',
          fontWeight: 900, fontSize: 14, color: '#fff', letterSpacing: 1,
          boxShadow: '0 0 16px rgba(168,85,247,0.5)',
          flexShrink: 0,
        }}>MF</div>
        <span style={{
          fontFamily: 'var(--font-orbitron, Orbitron), sans-serif',
          fontWeight: 700, fontSize: 16, color: '#fff', letterSpacing: 2,
        }}>PREMIUM</span>
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex" style={{ alignItems: 'center', gap: 32 }}>
        {links.map(l => (
          <Link key={l.href} href={l.href} style={{
            fontSize: 13, fontWeight: 500, letterSpacing: 1,
            color: navColor(l.href), textTransform: 'uppercase',
            textDecoration: 'none', transition: 'color .2s',
          }}>{l.label}</Link>
        ))}
      </div>

      {/* Cart + mobile burger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/panier" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(168,85,247,0.12)',
          border: '1px solid rgba(168,85,247,0.35)',
          borderRadius: 8, padding: '8px 16px',
          textDecoration: 'none', transition: 'all .2s',
          position: 'relative',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-orbitron)', fontSize: 12, fontWeight: 700, color: '#a855f7' }}>
            {cartCount}
          </span>
        </Link>

        {/* Mobile burger */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', color: '#9d8fb5', cursor: 'pointer', padding: 4 }}
        >
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden" style={{
          position: 'absolute', top: 64, left: 0, right: 0,
          background: 'rgba(5,5,8,0.97)',
          borderBottom: '1px solid rgba(168,85,247,0.2)',
          padding: '16px 24px',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} style={{
              fontSize: 14, fontWeight: 500, letterSpacing: 1,
              color: navColor(l.href), textTransform: 'uppercase',
              textDecoration: 'none',
            }}>{l.label}</Link>
          ))}
          <Link href="/panier" onClick={() => setMenuOpen(false)} style={{
            fontSize: 14, fontWeight: 500, color: '#a855f7', textDecoration: 'none',
          }}>Panier ({cartCount})</Link>
        </div>
      )}
    </nav>
  );
}
