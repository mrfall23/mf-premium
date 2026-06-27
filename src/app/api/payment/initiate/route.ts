import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

async function getCampayToken(): Promise<string> {
  const base = process.env.CAMPAY_BASE_URL!;
  const res = await fetch(`${base}/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: process.env.CAMPAY_USERNAME!,
      password: process.env.CAMPAY_PASSWORD!,
    }),
  });
  const data = await res.json();
  if (!data.token) throw new Error('Campay auth failed: ' + JSON.stringify(data));
  return data.token;
}

export async function POST(req: NextRequest) {
  try {
    const { customer, cart, total } = await req.json();

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

    // Create order items
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

    // Call Campay collect
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const token = await getCampayToken();

    const campayRes = await fetch(`${process.env.CAMPAY_BASE_URL}/collect/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: String(total),
        currency: 'XAF',
        from: customer.phone,
        description: `MF Premium - Commande #${order.id.slice(0, 8).toUpperCase()}`,
        external_reference: order.id,
        redirect_url: `${siteUrl}/api/payment/webhook`,
      }),
    });

    const campayData = await campayRes.json();

    if (campayData.status === 'FAILED' || campayData.detail) {
      await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id);
      return NextResponse.json(
        { error: campayData.message || campayData.detail || 'Erreur Campay' },
        { status: 400 }
      );
    }

    // Save Campay reference on the order
    await supabase
      .from('orders')
      .update({ payment_reference: campayData.reference })
      .eq('id', order.id);

    return NextResponse.json({
      order_id: order.id,
      campay_reference: campayData.reference,
      ussd_code: campayData.ussd_code || null,
      operator: campayData.operator || null,
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
