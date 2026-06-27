import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Campay calls this URL via GET with query params when payment completes
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get('reference');
  const status = searchParams.get('status');
  const externalRef = searchParams.get('external_reference');

  if (reference && (status === 'SUCCESSFUL' || status === 'SUCCESS')) {
    const orderId = externalRef || reference;
    await supabase
      .from('orders')
      .update({ status: 'paid', payment_method: 'mobile_money' })
      .eq('id', orderId);
  }

  return NextResponse.redirect(
    new URL(`/commande/${externalRef || reference}`, req.url)
  );
}

// Also handle POST webhook from Campay
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reference, status, external_reference } = body;

    if (status === 'SUCCESSFUL' || status === 'SUCCESS') {
      const orderId = external_reference || reference;
      await supabase
        .from('orders')
        .update({ status: 'paid', payment_method: 'mobile_money' })
        .eq('id', orderId);
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ received: true });
  }
}
