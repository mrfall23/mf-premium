// Métadonnées visuelles du catalogue — mêmes icônes/gradients que le reste du site.
// La liste des produits vient de Supabase ; ce fichier ne fait que l'habillage.

export interface ServiceMeta {
  icon: string;
  bg: string;
  glow: string;
  tagline: string;
}

const SERVICE_META: Record<string, ServiceMeta> = {
  Netflix: { icon: '🎬', bg: 'linear-gradient(135deg,#e50914,#8b0000)', glow: 'rgba(229,9,20,0.4)', tagline: 'Films & séries en 4K Ultra HD' },
  Spotify: { icon: '🎵', bg: 'linear-gradient(135deg,#1db954,#146f35)', glow: 'rgba(29,185,84,0.4)', tagline: 'Musique sans publicité' },
  'Amazon Prime': { icon: '📦', bg: 'linear-gradient(135deg,#00a8e0,#005f80)', glow: 'rgba(0,168,224,0.4)', tagline: 'Vidéo + livraison rapide' },
  Crunchyroll: { icon: '⛩️', bg: 'linear-gradient(135deg,#f47521,#a04c10)', glow: 'rgba(244,117,33,0.4)', tagline: 'Anime premium sans limite' },
  'Canva Pro': { icon: '🎨', bg: 'linear-gradient(135deg,#7d2ae8,#4a1589)', glow: 'rgba(125,42,232,0.4)', tagline: 'Design professionnel' },
  'Apple Music': { icon: '🍎', bg: 'linear-gradient(135deg,#fc3c44,#a01c22)', glow: 'rgba(252,60,68,0.4)', tagline: '100M+ titres & exclusivités' },
  ChatGPT: { icon: '🤖', bg: 'linear-gradient(135deg,#10a37f,#0a6e56)', glow: 'rgba(16,163,127,0.4)', tagline: 'IA la plus avancée au monde' },
  'CapCut Pro': { icon: '✂️', bg: 'linear-gradient(135deg,#00e0d5,#008a83)', glow: 'rgba(0,224,213,0.4)', tagline: 'Montage vidéo professionnel' },
};

export function getServiceMeta(name: string): ServiceMeta {
  for (const [key, val] of Object.entries(SERVICE_META)) {
    if (name.includes(key)) return val;
  }
  return { icon: '⭐', bg: 'linear-gradient(135deg,#a855f7,#7c3aed)', glow: 'rgba(168,85,247,0.4)', tagline: 'Abonnement premium' };
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const DURATION_ORDER: Record<string, number> = {
  '1 mois': 0,
  '3 mois': 1,
  '6 mois': 2,
  '1 an': 3,
};

export const DURATION_NOTES: Record<string, string> = {
  '1 mois': 'Accès complet',
  '3 mois': 'Économisez 10%',
  '6 mois': 'Économisez 15%',
  '1 an': 'Meilleur prix',
};

