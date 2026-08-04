import { NextRequest, NextResponse } from 'next/server';
import { resolveReferral, normalizeCode } from '@/lib/referral';

// Validate a referral code against a cart total and return the applicable
// discount. Public endpoint — only exposes the ambassador NAME and the discount,
// never the commission rate.
export async function POST(req: NextRequest) {
  try {
    const { code, total } = await req.json();
    const cartTotal = Number(total) || 0;

    if (!normalizeCode(code)) {
      return NextResponse.json({ valid: false, message: 'Code vide.' });
    }

    const r = await resolveReferral(code, cartTotal);

    if (r.promoActive) {
      return NextResponse.json({
        valid: false,
        promo_active: true,
        message: 'Code non cumulable avec la promotion en cours.',
      });
    }

    if (!r.ambassadeur) {
      return NextResponse.json({ valid: false, message: 'Code invalide ou expiré.' });
    }

    return NextResponse.json({
      valid: true,
      nom: r.ambassadeur.nom,
      remise_pct: r.ambassadeur.remise_pct,
      remise_montant: r.remiseMontant,
      new_total: r.amountToPay,
    });
  } catch {
    return NextResponse.json({ valid: false, message: 'Erreur de validation.' }, { status: 500 });
  }
}
