import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { customer, cart, total } = await req.json();

    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', customer.email)
      .single();

    let customerId: string;

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
        })
        .select('id')
        .single();

      if (customerError || !newCustomer) {
        return NextResponse.json({ error: 'Erreur création client' }, { status: 500 });
      }
      customerId = newCustomer.id;
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        total_amount: total,
        status: 'pending',
      })
      .select('id')
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Erreur création commande' }, { status: 500 });
    }

    const orderItems = cart.map((item: { id: string; name: string; price: number; duration: string; quantity: number }) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      price: item.price,
      duration: item.duration,
      quantity: item.quantity,
    }));

    await supabase.from('order_items').insert(orderItems);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const notchPayResponse = await fetch('https://api.notchpay.co/payments/initialize', {
      method: 'POST',
      headers: {
        'Authorization': process.env.NOTCHPAY_PUBLIC_KEY!,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        amount: total,
        currency: 'XAF',
        reference: order.id,
        callback: `${siteUrl}/commande/${order.id}`,
        description: `Commande MF Premium #${order.id.slice(0, 8)}`,
      }),
    });

    const notchData = await notchPayResponse.json();

    if (!notchData.authorization_url) {
      return NextResponse.json(
        { error: 'Erreur Notch Pay: ' + JSON.stringify(notchData) },
        { status: 500 }
      );
    }

    return NextResponse.json({
      authorization_url: notchData.authorization_url,
      order_id: order.id,
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
