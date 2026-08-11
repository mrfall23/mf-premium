import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resolveReferral } from '@/lib/referral';

// Service-role client (les UPDATE sont bloqués par la RLS avec la clé anon).
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Paiement DIRECT (mobile money vers le compte du vendeur, sans agrégateur).
// On crée simplement une commande "pending" ; le vendeur confirme la réception
// depuis l'admin ("Marquer payé") après vérification. L'argent n'est jamais
// détenu par un tiers.
export async function POST(req: NextRequest) {
  try {
    const { customer, cart, total, code } = await req.json();

    if (!customer?.email || !customer?.name) {
      return NextResponse.json({ error: 'Nom et email requis' }, { status: 400 });
    }
    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 });
    }

    // Remise ambassadeur recalculée côté serveur.
    const referral = await resolveReferral(code || '', Number(total) || 0);
    const amountToPay = referral.amountToPay;

    // Upsert client
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('email', customer.email)
      .single();

    let customerId: string;
    if (existing) {
      customerId = existing.id;
    } else {
      const { data: newC, error: ce } = await supabase
        .from('customers')
        .insert({ name: customer.name, phone: customer.phone, email: customer.email })
        .select('id')
        .single();
      if (ce || !newC) return NextResponse.json({ error: 'Erreur création client' }, { status: 500 });
      customerId = newC.id;
    }

    // Commande "pending", méthode = direct (pas de référence agrégateur → la
    // page de confirmation ne tentera aucune vérification NotchPay).
    const { data: order, error: oe } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        total_amount: amountToPay,
        status: 'pending',
        payment_method: 'direct',
        code_ambassadeur: referral.ambassadeur?.code ?? null,
        remise_montant: referral.remiseMontant,
        commission_montant: referral.commissionMontant,
      })
      .select('id')
      .single();
    if (oe || !order) return NextResponse.json({ error: 'Erreur création commande' }, { status: 500 });

    await supabase.from('order_items').insert(
      cart.map((item: { id: string; name: string; price: number; duration: string; quantity: number }) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        price: item.price,
        duration: item.duration,
        quantity: item.quantity,
      }))
    );

    return NextResponse.json({ order_id: order.id, total: amountToPay });
  } catch (error) {
    console.error('Direct order error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
