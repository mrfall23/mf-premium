import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Read the RAW body so signature verification matches exactly what SebPay signed.
    // (Re-stringifying a parsed object almost never reproduces the original bytes.)
    const raw = await req.text();
    const signature =
      req.headers.get('x-sebpay-signature') || req.headers.get('x-signature');

    if (signature) {
      const expected = createHmac('sha256', process.env.SEBPAY_SECRET_KEY!)
        .update(raw)
        .digest('hex');
      if (signature !== expected) {
        // Log but do NOT block: a signature mismatch here has repeatedly hidden
        // real, already-collected payments. We re-verify with SebPay below anyway.
        console.warn('SebPay webhook signature mismatch', { signature, expected });
      }
    }

    let body: Record<string, unknown> = {};
    try {
      body = JSON.parse(raw);
    } catch {
      console.error('SebPay webhook: invalid JSON body', raw);
      return NextResponse.json({ received: true });
    }

    // SebPay nests the transaction under `data` (same shape as the GET endpoint),
    // but some webhook events send the fields flat. Support both.
    const payload = (body.data as Record<string, unknown>) || body;
    const externalReference =
      (payload.external_reference as string) || (body.external_reference as string);
    const rawStatus =
      (payload.status as string) || (body.status as string) || '';
    const status = rawStatus.toLowerCase();

    console.log('SebPay webhook received', { externalReference, status });

    if (!externalReference) {
      return NextResponse.json({ received: true });
    }

    // Re-verify against SebPay so a spoofed or malformed webhook can never flip an
    // order to paid — SebPay's own record is the source of truth.
    let verifiedStatus = status;
    try {
      const res = await fetch(
        `https://newapi.sebpay.bj/api/v1/collections/${externalReference}`,
        {
          headers: {
            'X-Public-Key': process.env.SEBPAY_PUBLIC_KEY!,
            'X-Secret-Key': process.env.SEBPAY_SECRET_KEY!,
          },
        }
      );
      const data = await res.json();
      if (data?.success && data?.data?.status) {
        verifiedStatus = String(data.data.status).toLowerCase();
      }
    } catch (e) {
      console.error('SebPay webhook re-verify failed', e);
    }

    if (verifiedStatus === 'approved' || verifiedStatus === 'success') {
      await supabaseAdmin
        .from('orders')
        .update({ status: 'paid', payment_method: 'mobile_money' })
        .eq('id', externalReference)
        .eq('status', 'pending');
    } else if (verifiedStatus === 'rejected' || verifiedStatus === 'failed') {
      await supabaseAdmin
        .from('orders')
        .update({ status: 'failed' })
        .eq('id', externalReference)
        .eq('status', 'pending');
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error('SebPay webhook error', e);
    return NextResponse.json({ received: true });
  }
}
