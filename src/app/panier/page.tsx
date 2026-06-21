'use client';
import { useState, useEffect } from 'react';
import { CartItem, Customer } from '@/types';
import { getCart, removeFromCart, clearCart, getCartTotal } from '@/lib/store';
import { Trash2, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function PanierPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer>({ name: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setCart(getCart());
  }, []);

  const handleRemove = (id: string) => {
    const updated = removeFromCart(id);
    setCart(updated);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const total = getCartTotal(cart);

  const handlePayment = async () => {
    if (!customer.name || !customer.phone || !customer.email) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (cart.length === 0) {
      setError('Votre panier est vide.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer, cart, total }),
      });

      const data = await res.json();

      if (data.authorization_url) {
        clearCart();
        window.dispatchEvent(new Event('cart-updated'));
        window.location.href = data.authorization_url;
      } else {
        setError(data.error || 'Erreur lors du paiement. Réessayez.');
      }
    } catch {
      setError('Erreur de connexion. Vérifiez votre internet.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto text-center">
        <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Votre panier est vide</h2>
        <p className="text-gray-400 mb-8">Ajoutez des abonnements depuis la boutique.</p>
        <Link href="/boutique" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl inline-flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour à la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Mon Panier</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Articles ({cart.length})</h2>
          {cart.map((item) => (
            <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
              <div className="text-4xl">
                {item.name.includes('Netflix') && '🎬'}
                {item.name.includes('Spotify') && '🎵'}
                {item.name.includes('Amazon') && '📦'}
                {item.name.includes('Apple') && '🍎'}
                {item.name.includes('Crunchyroll') && '🍥'}
                {item.name.includes('Canva') && '🎨'}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{item.name}</p>
                <p className="text-gray-400 text-sm">{item.duration}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{item.price.toLocaleString()} FCFA</p>
                <button onClick={() => handleRemove(item.id)} className="text-red-400 hover:text-red-300 mt-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-4 flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold text-blue-400">{total.toLocaleString()} FCFA</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Vos informations</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Nom complet *</label>
              <input
                type="text"
                placeholder="Ex: Jean Dupont"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Téléphone *</label>
              <input
                type="tel"
                placeholder="Ex: 237699000000"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Email *</label>
              <input
                type="email"
                placeholder="Ex: jean@email.com"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Traitement...</>
              ) : (
                <>💳 Payer {total.toLocaleString()} FCFA</>
              )}
            </button>

            <p className="text-center text-gray-500 text-xs">
              🔒 Paiement sécurisé via Notch Pay · Orange Money · MTN MoMo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
