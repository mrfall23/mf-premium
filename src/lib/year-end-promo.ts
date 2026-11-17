// Promo de fin d'année : 1 mois acheté = 1 mois offert, sur une sélection de
// services, jusqu'au 31 décembre 2026 à minuit (heure du Cameroun, UTC+1).
// Le mois offert est ajouté à la livraison : les prix du catalogue ne changent pas.

export const YEAR_END_PROMO_END = new Date('2026-12-31T23:59:59+01:00');

export const YEAR_END_PROMO_SERVICES = ['Netflix', 'Spotify', 'Amazon Prime', 'Apple Music'];

export function isYearEndPromoActive(now: Date = new Date()): boolean {
  return now.getTime() <= YEAR_END_PROMO_END.getTime();
}

export function isYearEndPromoProduct(name: string): boolean {
  return YEAR_END_PROMO_SERVICES.some((s) => name.includes(s));
}
