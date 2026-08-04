import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { NOTCHPAY_BASE, notchpayHeaders } from '@/lib/notchpay';

// Service-role client: the anon key can INSERT orders but RLS blocks UPDATEs,
// which silently dropped payment_reference (and the failure flag) before.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { customer, cart, total } = await req.json();

    if (!customer?.email || !customer?.name) {
      return NextResponse.json({ error: 'Nom et email requis' }, { status: 400 });
    }
    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 });
    }

    // Upsert customer
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

    // Create order
    const { data: order, error: oe } = await supabase
      .from('orders')
      .insert({ customer_id: customerId, total_amount: total, status: 'pending' })
      .select('id')
      .single();
    if (oe || !order) return NextResponse.json({ error: 'Erreur création commande' }, { status: 500 });

    // Order items (fire alongside the NotchPay call — both only need order.id)
    const itemsInsert = supabase.from('order_items').insert(
      cart.map((item: { id: string; name: string; price: number; duration: string; quantity: number }) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        price: item.price,
        duration: item.duration,
        quantity: item.quantity,
      }))
    );

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const phone = customer.phone ? String(customer.phone).replace(/\s+/g, '') : undefined;

    // Initialize a NotchPay payment. The customer is then redirected to the
    // hosted checkout (authorization_url), which handles card + mobile money,
    // OTP, and 3-D Secure itself. Amount is in XAF (no minor unit — 2500 = 2500 FCFA).
    const payload: Record<string, unknown> = {
      amount: total,
      currency: 'XAF',
      email: customer.email,
      name: customer.name,
      reference: order.id,
      callback: `${siteUrl}/commande/${order.id}`,
      description: cart.map((i: { name: string }) => i.name).join(', ').slice(0, 140),
    };
    if (phone) payload.phone = phone;

    const [notchRes] = await Promise.all([
      fetch(`${NOTCHPAY_BASE}/payments`, {
        method: 'POST',
        headers: notchpayHeaders(),
        body: JSON.stringify(payload),
      }),
      itemsInsert,
    ]);

    const notch = await notchRes.json();
    const authUrl = notch?.authorization_url || notch?.data?.authorization_url;
    const notchRef = notch?.transaction?.reference || notch?.transaction?.id;

    if (!notchRes.ok || !authUrl) {
      console.error('NotchPay initiate failed', { http: notchRes.status, response: notch, payload });
      await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id);
      return NextResponse.json(
        { error: "Le paiement n'a pas pu être lancé. Réessaie dans un instant, ou contacte-nous sur WhatsApp." },
        { status: 400 }
      );
    }

    // Store NotchPay's own reference so we can verify the payment later.
    if (notchRef) {
      await supabase.from('orders').update({ payment_reference: notchRef }).eq('id', order.id);
    }

    return NextResponse.json({
      order_id: order.id,
      total,
      payment_url: authUrl,
    });
  } catch (error) {
    console.error('Order error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
