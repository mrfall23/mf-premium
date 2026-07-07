// Images personnalisées du catalogue — CÔTÉ SERVEUR UNIQUEMENT (utilise fs).
// Convention : public/images/products/<slug>.jpg  → bannière page produit
//              public/images/offers/<slug>-<durée>.jpg → carte d'une offre
// Extensions acceptées : jpg, jpeg, png, webp. Si absente → design par défaut.

import { existsSync } from 'fs';
import { join } from 'path';
import { slugify } from './catalog';

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp'];

function findPublicImage(relBase: string): string | null {
  for (const ext of IMAGE_EXTS) {
    if (existsSync(join(process.cwd(), 'public', ...`${relBase}.${ext}`.split('/')))) {
      return `/${relBase}.${ext}`;
    }
  }
  return null;
}

export function getProductHeroImage(slug: string): string | null {
  return findPublicImage(`images/products/${slug}`);
}

export function getOfferImage(slug: string, duration: string): string | null {
  return findPublicImage(`images/offers/${slug}-${slugify(duration)}`);
}
