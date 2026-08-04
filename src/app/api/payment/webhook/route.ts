import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';
import { verifyAndSyncOrder } from '@/lib/notchpay-verify';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Read the RAW body so signature verification matches exactly what NotchPay
    // signed. (Re-stringifying a parsed object never reproduces the bytes.)
    const raw = await req.text();
    const signature =
      req.headers.get('x-notch-signature') || req.headers.get('x-notch-signature'.toUpperCase());

    if (signature && process.env.NOTCHPAY_HASH_KEY) {
      const expected = createHmac('sha256', process.env.NOTCHPAY_HASH_KEY)
        .update(raw)
        .digest('hex');
      if (signature !== expected) {
        // Log but do NOT block — we re-verify with NotchPay below anyway, so a
        // signature quirk can never hide an already-collected payment.
        console.warn('NotchPay webhook signature mismatch', { signature, expected });
      }
    }

    let body: Record<string, unknown> = {};
    try {
      body = JSON.parse(raw);
    } catch {
      console.error('NotchPay webhook: invalid JSON body', raw);
      return NextResponse.json({ received: true });
    }

    const data = (body.data as Record<string, unknown>) || body;
    const reference = (data.reference as string) || (data.merchant_reference as string);

    console.log('NotchPay webhook received', { type: body.type, reference, status: data.status });

    if (!reference) return NextResponse.json({ received: true });

    // The webhook may carry NotchPay's own reference (trx.…) or our order id
    // (a UUID). Match on payment_reference first; if the reference is a UUID and
    // nothing matched, treat it as our order id. (Avoids casting trx.… to uuid.)
    let orderId: string | undefined;

    const { data: byRef } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('payment_reference', reference)
      .maybeSingle();
    orderId = byRef?.id;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reference);
    if (!orderId && isUuid) {
      const { data: byId } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('id', reference)
        .maybeSingle();
      orderId = byId?.id;
    }

    if (orderId) {
      await verifyAndSyncOrder(orderId);
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error('NotchPay webhook error', e);
    return NextResponse.json({ received: true });
  }
}
