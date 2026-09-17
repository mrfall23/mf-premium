// Formules "COMBOS" — regroupent plusieurs abonnements Premium.
//
// Ce fichier ne porte QUE les métadonnées visuelles des combos (nom, services,
// prix de repli) — exactement comme catalog.ts habille les produits. Les combos
// vendables viennent de Supabase (products, category='combo') quand ils y sont
// enregistrés ; sinon la page utilise le prix de repli ci-dessous. Le panier et
// le système de commande existants sont réutilisés tels quels.

import { Product } from '@/types';

export interface Combo {
  slug: string;
  name: string;
  services: string[]; // doivent correspondre aux clés de getServiceMeta()
  monthlyPrice: number; // prix pour 1 mois, en FCFA (repli si pas en base)
}

// Une durée sélectionnable + l'article prêt à ajouter au panier (produit réel
// Supabase si disponible, sinon article de repli au même format).
export interface ComboOption {
  months: number;
  price: number;
  cartItem: Product;
}

// Ce que la page transmet au composant d'affichage.
export interface ComboDisplay {
  slug: string;
  name: string;
  services: string[];
  options: ComboOption[];
}

export const COMBOS: Combo[] = [
  { slug: 'stream-duo', name: 'STREAM DUO', services: ['Netflix', 'Spotify'], monthlyPrice: 3500 },
  { slug: 'stream-trio', name: 'STREAM TRIO', services: ['Netflix', 'Spotify', 'Amazon Prime'], monthlyPrice: 5000 },
  { slug: 'ultimate-trio', name: 'ULTIMATE TRIO', services: ['Netflix', 'Crunchyroll', 'Amazon Prime'], monthlyPrice: 4500 },
  { slug: 'anime-music', name: 'ANIME & MUSIC', services: ['Crunchyroll', 'Spotify'], monthlyPrice: 2500 },
  { slug: 'ultimate-4', name: 'ULTIMATE 4', services: ['Netflix', 'Spotify', 'Amazon Prime', 'Crunchyroll'], monthlyPrice: 5500 },
  { slug: 'music-duo', name: 'MUSIC DUO', services: ['Spotify', 'Apple Music'], monthlyPrice: 3000 },
];

// Durées proposées sur chaque combo (en mois).
export const COMBO_MONTHS = [1, 2, 3];

export function comboDurationLabel(months: number): string {
  return `${months} mois`;
}
