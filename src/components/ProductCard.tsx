'use client';
import { Product } from '@/types';
import { ShoppingCart, Check, Clock } from 'lucide-react';
import { addToCart } from '@/lib/store';
import { useState } from 'react';

interface Props {
  product: Product;
}

const categoryColors: Record<string, string> = {
  streaming: 'bg-red-500/20 text-red-400',
  music: 'bg-green-500/20 text-green-400',
  anime: 'bg-orange-500/20 text-orange-400',
  design: 'bg-purple-500/20 text-purple-400',
};

export default function ProductCard({ product }: Props) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    window.dispatchEvent(new Event('cart-updated'));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10 group">
      <div className="relative h-48 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
        <div className="text-6xl">
          {product.name.includes('Netflix') && '🎬'}
          {product.name.includes('Spotify') && '🎵'}
          {product.name.includes('Amazon') && '📦'}
          {product.name.includes('Apple') && '🍎'}
          {product.name.includes('Crunchyroll') && '🍥'}
          {product.name.includes('Canva') && '🎨'}
        </div>
        <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full font-medium ${categoryColors[product.category] || 'bg-blue-500/20 text-blue-400'}`}>
          {product.category}
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors">{product.name}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>

        <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
          <Clock className="w-4 h-4" />
          <span>{product.duration}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-white">{product.price.toLocaleString()}</span>
            <span className="text-gray-400 text-sm ml-1">FCFA</span>
          </div>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              added
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {added ? (
              <><Check className="w-4 h-4" /> Ajouté</>
            ) : (
              <><ShoppingCart className="w-4 h-4" /> Ajouter</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
