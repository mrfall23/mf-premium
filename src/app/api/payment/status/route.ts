import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAndSyncOrder } from '@/lib/sebpay-verify';

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

  // If still pending, ask SebPay directly and reconcile the DB.
  if (order.status === 'pending') {
    const status = await verifyAndSyncOrder(orderId);
    return NextResponse.json({ status });
  }

  return NextResponse.json({ status: order.status });
}
