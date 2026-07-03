import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('order_id');

  if (!orderId) return NextResponse.json({ error: 'order_id requis' }, { status: 400 });

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .single();

  if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });

  // If still pending, check SebPay directly (by external_reference = order id)
  if (order.status === 'pending') {
    try {
      const res = await fetch(`https://newapi.sebpay.bj/api/v1/collections/${orderId}`, {
        headers: {
          'X-Public-Key': process.env.SEBPAY_PUBLIC_KEY!,
          'X-Secret-Key': process.env.SEBPAY_SECRET_KEY!,
        },
      });
      const data = await res.json();
      const txStatus = data?.data?.status;

      if (data.success && txStatus === 'approved') {
        await supabaseAdmin
          .from('orders')
          .update({ status: 'paid', payment_method: 'mobile_money' })
          .eq('id', orderId);
        return NextResponse.json({ status: 'paid' });
      }

      if (data.success && txStatus === 'rejected') {
        await supabaseAdmin.from('orders').update({ status: 'failed' }).eq('id', orderId);
        return NextResponse.json({ status: 'failed' });
      }
    } catch {
      // If SebPay check fails, just return DB status
    }
  }

  return NextResponse.json({ status: order.status });
}
