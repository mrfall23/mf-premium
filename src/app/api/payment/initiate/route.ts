import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSebpayCountry } from '@/lib/sebpay';

export async function POST(req: NextRequest) {
  try {
    const { customer, cart, total, country, operator, otp_code } = await req.json();

    // Validate country + operator
    const countryData = getSebpayCountry(country || 'CM');
    if (!countryData) {
      return NextResponse.json({ error: 'Pays non supporté' }, { status: 400 });
    }
    const operatorData = countryData.operators.find(o => o.code === operator);
    if (!operatorData) {
      return NextResponse.json({ error: 'Opérateur non supporté pour ce pays' }, { status: 400 });
    }
    if (operatorData.otp && !otp_code) {
      return NextResponse.json({ error: 'Code OTP requis pour cet opérateur' }, { status: 400 });
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

    // Format phone: strip spaces and +, prepend country prefix if missing
    let phone = customer.phone.replace(/\s+/g, '').replace(/^\+/, '');
    if (!phone.startsWith(countryData.prefix)) phone = countryData.prefix + phone;

    // Call SebPay API
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const payload: Record<string, unknown> = {
      amount: total,
      currency: countryData.currency,
      phone,
      operator: operatorData.code,
      country: countryData.code,
      external_reference: order.id,
      callback_url: `${siteUrl}/api/payment/webhook`,
    };
    if (otp_code) payload.otp_code = otp_code;

    const sebpayRes = await fetch('https://newapi.sebpay.bj/api/v1/collections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Public-Key': process.env.SEBPAY_PUBLIC_KEY!,
        'X-Secret-Key': process.env.SEBPAY_SECRET_KEY!,
      },
      body: JSON.stringify(payload),
    });

    const sebpayData = await sebpayRes.json();

    if (!sebpayData.success) {
      return NextResponse.json({ error: sebpayData.message || 'Erreur paiement' }, { status: 400 });
    }

    // Store SebPay transaction id for status checks
    if (sebpayData.data?.transaction_id) {
      await supabase
        .from('orders')
        .update({ payment_reference: sebpayData.data.transaction_id })
        .eq('id', order.id);
    }

    return NextResponse.json({
      order_id: order.id,
      total,
      payment_url: sebpayData.data?.provider_link || null,
    });

  } catch (error) {
    console.error('Order error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
