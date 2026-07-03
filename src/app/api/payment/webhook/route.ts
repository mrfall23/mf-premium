import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const signature = req.headers.get('x-sebpay-signature');

    // Verify HMAC signature
    if (signature) {
      const expected = createHmac('sha256', process.env.SEBPAY_SECRET_KEY!)
        .update(JSON.stringify(body))
        .digest('hex');
      if (signature !== expected) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const { external_reference, status } = body;

    if (external_reference && status === 'approved') {
      await supabaseAdmin
        .from('orders')
        .update({ status: 'paid', payment_method: 'mobile_money' })
        .eq('id', external_reference);
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ received: true });
  }
}
