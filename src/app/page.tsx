'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

const services = [
  { name: 'Netflix', desc: 'Films & Séries 4K', icon: '🎬', bg: 'linear-gradient(135deg,#e50914,#8b0000)', glow: 'rgba(229,9,20,0.4)', anim: 'animate-float' },
  { name: 'Spotify', desc: 'Musique sans pub', icon: '🎵', bg: 'linear-gradient(135deg,#1db954,#146f35)', glow: 'rgba(29,185,84,0.4)', anim: 'animate-float-2' },
  { name: 'Amazon Prime', desc: 'Vidéo + livraison', icon: '📦', bg: 'linear-gradient(135deg,#00a8e0,#005f80)', glow: 'rgba(0,168,224,0.4)', anim: 'animate-float-3' },
  { name: 'Crunchyroll', desc: 'Anime en streaming', icon: '⛩️', bg: 'linear-gradient(135deg,#f47521,#a04c10)', glow: 'rgba(244,117,33,0.4)', anim: 'animate-float-4' },
  { name: 'Canva Pro', desc: 'Design & créativité', icon: '🎨', bg: 'linear-gradient(135deg,#7d2ae8,#4a1589)', glow: 'rgba(125,42,232,0.4)', anim: 'animate-float-5' },
  { name: 'Apple Music', desc: '100M+ de titres', icon: '🍎', bg: 'linear-gradient(135deg,#fc3c44,#a01c22)', glow: 'rgba(252,60,68,0.4)', anim: 'animate-float-6' },
];

const features = [
  { icon: '⚡', title: 'LIVRAISON INSTANTANÉE', desc: 'Reçois ton compte en quelques minutes après ta commande.' },
  { icon: '🔒', title: '100% SÉCURISÉ', desc: 'Paiements sécurisés via Orange Money & MTN MoMo.' },
  { icon: '💎', title: 'QUALITÉ PREMIUM', desc: 'Comptes vérifiés, accès complet, support réactif.' },
];

// Poster wall — gradient blocks simulating movie/series posters
const posters = [
  'linear-gradient(160deg,#1a1a2e,#e50914)',   // Netflix rouge
  'linear-gradient(160deg,#0d1b2a,#1db954)',   // Spotify vert
  'linear-gradient(160deg,#1a0a2e,#7d2ae8)',   // Violet
  'linear-gradient(160deg,#0a1628,#00a8e0)',   // Amazon bleu
  'linear-gradient(160deg,#2a1000,#f47521)',   // Crunchyroll orange
  'linear-gradient(160deg,#1a0a0e,#fc3c44)',   // Apple rouge
  'linear-gradient(160deg,#001a10,#1db954)',   // Spotify vert foncé
  'linear-gradient(160deg,#0a0a1a,#a855f7)',   // Violet clair
  'linear-gradient(160deg,#1a0500,#e50914)',   // Netflix foncé
  'linear-gradient(160deg,#001520,#00a8e0)',   // Bleu foncé
  'linear-gradient(160deg,#100020,#7d2ae8)',   // Mauve
  'linear-gradient(160deg,#1a1000,#f47521)',   // Orange foncé
  'linear-gradient(160deg,#0a0a0a,#c084fc)',   // Lilas
  'linear-gradient(160deg,#00100a,#1db954)',   // Vert
  'linear-gradient(160deg,#200010,#fc3c44)',   // Rose rouge
  'linear-gradient(160deg,#001a20,#00a8e0)',   // Cyan
  'linear-gradient(160deg,#15001a,#a855f7)',   // Violet moyen
  'linear-gradient(160deg,#200000,#e50914)',   // Rouge vif
];

function PosterWall() {
  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gridTemplateRows: 'repeat(3, 1fr)',
      gap: 4,
    }}>
      {posters.map((bg, i) => (
        <div key={i} style={{
          background: bg,
          opacity: 0.55,
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Shimmer ligne en bas comme un vrai poster */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
          }} />
        </div>
      ))}
      {/* Overlay sombre global pour lisibilité du texte */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(10,8,20,0.7) 0%, rgba(10,8,20,0.5) 40%, rgba(10,8,20,0.85) 100%)',
      }} />
    </div>
  );
}

export default function HomePage() {
  return (
    <div style={{ paddingTop: 64 }}>
      {/* Hero */}
      <section style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', padding: 'clamp(60px,10vw,100px) clamp(16px,5vw,40px) 80px',
        position: 'relative', overflow: 'hidden', minHeight: 520,
      }}>
        {/* Poster wall background */}
        <PosterWall />

        {/* Glow orb */}
        <div className="animate-glow-pulse" style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 'clamp(300px,50vw,600px)', height: 'clamp(300px,50vw,600px)',
          background: 'radial-gradient(circle,rgba(168,85,247,0.2) 0%,transparent 70%)',
          pointerEvents: 'none', zIndex: 1,
        }} />

        {/* Badge */}
        <div className="animate-fadeInUp" style={{
          position: 'relative', zIndex: 2,
          display: 'inline-block',
          background: 'rgba(168,85,247,0.15)',
          border: '1px solid rgba(168,85,247,0.5)',
          borderRadius: 999, padding: '6px 18px',
          fontSize: 11, fontWeight: 600, letterSpacing: 2,
          color: '#c084fc', textTransform: 'uppercase', marginBottom: 28,
        }}>⚡ Abonnements Premium à Prix Réduits</div>

        {/* Title */}
        <h1 className="animate-fadeInUp" style={{
          position: 'relative', zIndex: 2,
          fontFamily: 'var(--font-orbitron, Orbitron), sans-serif',
          fontSize: 'clamp(36px,7vw,80px)',
          fontWeight: 900, lineHeight: 1.05, letterSpacing: -1,
          marginBottom: 24,
          background: 'linear-gradient(135deg,#fff 30%,#c084fc 70%,#a855f7 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>MF PREMIUM<br />L'ACCÈS ILLIMITÉ</h1>

        {/* Subtitle */}
        <p className="animate-fadeInUp" style={{
          position: 'relative', zIndex: 2,
          fontSize: 'clamp(15px,2vw,18px)', color: '#c4b8d8',
          maxWidth: 520, lineHeight: 1.7, marginBottom: 40, fontWeight: 300,
        }}>
          Netflix, Spotify, Amazon, Crunchyroll, Canva, Apple Music — tous vos abonnements au meilleur prix, livrés instantanément.
        </p>

        {/* CTAs */}
        <div className="animate-fadeInUp" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          <Link href="/boutique" className="btn-purple" style={{ padding: '14px 36px', fontSize: 13, display: 'inline-block', textDecoration: 'none' }}>
            Voir la boutique →
          </Link>
          <Link href="/faq" className="btn-outline-purple" style={{ padding: '14px 36px', fontSize: 13, display: 'inline-block', textDecoration: 'none' }}>
            Comment ça marche ?
          </Link>
        </div>
      </section>

      {/* Services grid */}
      <section style={{ padding: '0 clamp(16px,5vw,40px) 80px' }}>
        <h2 style={{
          fontFamily: 'var(--font-orbitron, Orbitron), sans-serif',
          fontSize: 22, fontWeight: 700, color: '#fff',
          textAlign: 'center', marginBottom: 48, letterSpacing: 2,
        }}>NOS SERVICES</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
          gap: 20, maxWidth: 1200, margin: '0 auto',
        }}>
          {services.map((svc) => (
            <Link key={svc.name} href="/boutique" style={{ textDecoration: 'none' }}>
              <div className={`card-purple ${svc.anim}`} style={{
                padding: 28, display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer',
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: svc.bg, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, boxShadow: `0 4px 16px ${svc.glow}`,
                }}>{svc.icon}</div>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-orbitron)', fontWeight: 700,
                    fontSize: 15, color: '#fff', marginBottom: 4,
                  }}>{svc.name}</div>
                  <div style={{ fontSize: 12, color: '#7c6d94' }}>{svc.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features strip */}
      <section style={{
        padding: 'clamp(40px,6vw,60px) clamp(16px,5vw,40px)',
        background: 'rgba(168,85,247,0.04)',
        borderTop: '1px solid rgba(168,85,247,0.1)',
        borderBottom: '1px solid rgba(168,85,247,0.1)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
          gap: 32, maxWidth: 900, margin: '0 auto', textAlign: 'center',
        }}>
          {features.map(f => (
            <div key={f.title}>
              <div style={{
                fontFamily: 'var(--font-orbitron)', fontSize: 32,
                fontWeight: 900, color: '#a855f7', marginBottom: 8,
              }}>{f.icon}</div>
              <div style={{
                fontFamily: 'var(--font-orbitron)', fontSize: 13,
                fontWeight: 700, color: '#fff', marginBottom: 6, letterSpacing: 1,
              }}>{f.title}</div>
              <div style={{ fontSize: 13, color: '#7c6d94' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
