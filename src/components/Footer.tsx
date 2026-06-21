import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-blue-500 w-5 h-5" />
              <span className="text-lg font-bold">MF <span className="text-blue-500">Premium</span></span>
            </div>
            <p className="text-gray-400 text-sm">
              Vos abonnements digitaux premium au meilleur prix. Paiement sécurisé via Orange Money et MTN Mobile Money.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Accueil</Link></li>
              <li><Link href="/boutique" className="hover:text-white transition-colors">Boutique</Link></li>
              <li><Link href="/panier" className="hover:text-white transition-colors">Panier</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Paiement accepté</h3>
            <div className="flex flex-col gap-2 text-gray-400 text-sm">
              <span>📱 Orange Money</span>
              <span>📱 MTN Mobile Money</span>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} MF Premium. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
