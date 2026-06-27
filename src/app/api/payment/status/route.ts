import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('order_id');

  if (!orderId) return NextResponse.json({ error: 'order_id requis' }, { status: 400 });

  const { data: order } = await supabase
    .from('orders')
    .select('id, status, payment_reference')
    .eq('id', orderId)
    .single();

  if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });

  // If still pending, also check Campay directly
  if (order.status === 'pending' && order.payment_reference) {
    try {
      const base = process.env.CAMPAY_BASE_URL!;

      // Get token
      const tokenRes = await fetch(`${base}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: process.env.CAMPAY_USERNAME!,
          password: process.env.CAMPAY_PASSWORD!,
        }),
      });
      const { token } = await tokenRes.json();

      // Check transaction
      const txRes = await fetch(`${base}/transaction/${order.payment_reference}/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      const tx = await txRes.json();

      if (tx.status === 'SUCCESSFUL') {
        await supabase
          .from('orders')
          .update({ status: 'paid', payment_method: tx.operator || 'mobile_money' })
          .eq('id', orderId);
        return NextResponse.json({ status: 'paid' });
      }

      if (tx.status === 'FAILED') {
        await supabase.from('orders').update({ status: 'failed' }).eq('id', orderId);
        return NextResponse.json({ status: 'failed' });
      }
    } catch {
      // If Campay check fails, just return DB status
    }
  }

  return NextResponse.json({ status: order.status });
}
