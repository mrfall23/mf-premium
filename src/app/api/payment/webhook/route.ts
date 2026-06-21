import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reference, status, payment } = body;

    if (status === 'complete' || status === 'success') {
      await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_reference: payment?.reference || reference,
          payment_method: payment?.channel || 'mobile_money',
        })
        .eq('id', reference);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
