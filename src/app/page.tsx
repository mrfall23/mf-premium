import Link from 'next/link';

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

export default function HomePage() {
  return (
    <div style={{ paddingTop: 64 }}>
      {/* Hero */}
      <section style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', padding: 'clamp(60px,10vw,100px) clamp(16px,5vw,40px) 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow orb */}
        <div className="animate-glow-pulse" style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 'clamp(300px,50vw,600px)', height: 'clamp(300px,50vw,600px)',
          background: 'radial-gradient(circle,rgba(168,85,247,0.15) 0%,transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Badge */}
        <div className="animate-fadeInUp" style={{
          display: 'inline-block',
          background: 'rgba(168,85,247,0.12)',
          border: '1px solid rgba(168,85,247,0.4)',
          borderRadius: 999, padding: '6px 18px',
          fontSize: 11, fontWeight: 600, letterSpacing: 2,
          color: '#c084fc', textTransform: 'uppercase', marginBottom: 28,
        }}>⚡ Abonnements Premium à Prix Réduits</div>

        {/* Title */}
        <h1 className="animate-fadeInUp" style={{
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
          fontSize: 'clamp(15px,2vw,18px)', color: '#9d8fb5',
          maxWidth: 520, lineHeight: 1.7, marginBottom: 40, fontWeight: 300,
        }}>
          Netflix, Spotify, Amazon, Crunchyroll, Canva, Apple Music — tous vos abonnements au meilleur prix, livrés instantanément.
        </p>

        {/* CTAs */}
        <div className="animate-fadeInUp" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
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
          {services.map((svc, i) => (
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
