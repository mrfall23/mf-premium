// Formules "COMBOS" — regroupent plusieurs abonnements Premium.
// Données statiques (comme l'habillage du catalogue dans catalog.ts) : la page
// COMBOS ne dépend pas de Supabase, elle réutilise simplement le panier existant.
// Les prix indiqués sont pour 1 MOIS ; la page calcule le total selon la durée.

export interface Combo {
  slug: string;
  name: string;
  services: string[]; // doivent correspondre aux clés de getServiceMeta()
  monthlyPrice: number; // prix pour 1 mois, en FCFA
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
