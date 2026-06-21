import Link from 'next/link';
import { ArrowRight, Shield, Zap, Headphones } from 'lucide-react';

export default function HomePage() {
  const services = [
    { emoji: '🎬', name: 'Netflix' },
    { emoji: '🎵', name: 'Spotify' },
    { emoji: '📦', name: 'Amazon Prime' },
    { emoji: '🍎', name: 'Apple Music' },
    { emoji: '🍥', name: 'Crunchyroll' },
    { emoji: '🎨', name: 'Canva Pro' },
  ];

  return (
    <div className="pt-16">
      <section className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-black" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">Paiement 100% sécurisé</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Vos abonnements{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              Premium
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Netflix, Spotify, Amazon Prime et plus — payez avec Orange Money ou MTN Mobile Money. Livraison instantanée.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/boutique"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-500/30"
            >
              Voir la boutique <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-16">
            {services.map((service) => (
              <div key={service.name} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-blue-500/50 transition-all">
                <div className="text-3xl mb-2">{service.emoji}</div>
                <div className="text-xs text-gray-400">{service.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Pourquoi choisir MF Premium ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Shield className="w-8 h-8 text-blue-400" />, title: 'Paiement sécurisé', desc: 'Orange Money et MTN Mobile Money. Pas de données bancaires requises.' },
            { icon: <Zap className="w-8 h-8 text-blue-400" />, title: 'Livraison rapide', desc: 'Votre abonnement est activé dès la validation du paiement.' },
            { icon: <Headphones className="w-8 h-8 text-blue-400" />, title: 'Support WhatsApp', desc: 'Notre équipe est disponible 24h/24 sur WhatsApp pour vous aider.' },
          ].map((feature, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all">
              <div className="bg-blue-500/10 rounded-xl p-3 w-fit mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
