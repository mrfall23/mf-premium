import { createClient } from '@supabase/supabase-js';

// Service-role client: referral validation and admin CRUD run server-side and
// must bypass RLS. Never import this into a client component.
export const referralAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface Ambassadeur {
  id: string;
  nom: string;
  code: string;
  remise_pct: number;
  commission_pct: number;
  actif: boolean;
}

export function normalizeCode(code: string): string {
  return String(code || '').trim().toUpperCase();
}

// A site-wide promo is active when a promotion is flagged active and not expired.
export async function isPromoActive(): Promise<boolean> {
  const { data } = await referralAdmin
    .from('promotions')
    .select('id')
    .eq('is_active', true)
    .gt('ends_at', new Date().toISOString())
    .limit(1);
  return !!(data && data.length);
}

// Look up an active ambassador by code (case-insensitive).
export async function getAmbassadeurByCode(code: string): Promise<Ambassadeur | null> {
  const c = normalizeCode(code);
  if (!c) return null;
  const { data } = await referralAdmin
    .from('ambassadeurs')
    .select('id, nom, code, remise_pct, commission_pct, actif')
    .eq('code', c)
    .eq('actif', true)
    .maybeSingle();
  return (data as Ambassadeur) || null;
}

export interface ReferralResult {
  ambassadeur: Ambassadeur | null;
  promoActive: boolean;
  // Discount actually applicable right now (0 during a promo).
  remiseMontant: number;
  commissionMontant: number;
  amountToPay: number;
}

/**
 * Resolve a referral code against a cart total.
 *
 * Rule (per business decision): during an active promo the code is fully
 * ignored — no discount and no ambassador credit. Otherwise the discount and
 * commission are computed server-side from the ambassador's stored percentages.
 */
export async function resolveReferral(code: string, total: number): Promise<ReferralResult> {
  const promoActive = await isPromoActive();
  const ambassadeur = promoActive ? null : await getAmbassadeurByCode(code);

  if (!ambassadeur) {
    return { ambassadeur: null, promoActive, remiseMontant: 0, commissionMontant: 0, amountToPay: total };
  }

  const remiseMontant = Math.round((total * ambassadeur.remise_pct) / 100);
  const amountToPay = Math.max(0, total - remiseMontant);
  const commissionMontant = Math.round((amountToPay * ambassadeur.commission_pct) / 100);

  return { ambassadeur, promoActive, remiseMontant, commissionMontant, amountToPay };
}
