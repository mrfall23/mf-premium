import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Monetbil calls this via POST when payment completes
export async function POST(req: NextRequest) {
  try {
    const body = await req.formData().catch(() => null);
    let payment_ref: string | null = null;
    let status: string | null = null;

    if (body) {
      payment_ref = body.get('payment_ref') as string;
      status = body.get('status') as string;
    } else {
      const json = await req.json().catch(() => ({}));
      payment_ref = json.payment_ref;
      status = json.status;
    }

    // Monetbil: status "1" = success
    if (payment_ref && String(status) === '1') {
      await supabaseAdmin
        .from('orders')
        .update({ status: 'paid', payment_method: 'mobile_money' })
        .eq('id', payment_ref);
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ received: true });
  }
}

// Monetbil also redirects client via GET to return_url — handled by /commande/[id] directly
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const payment_ref = searchParams.get('payment_ref');
  const status = searchParams.get('status');

  if (payment_ref && String(status) === '1') {
    await supabaseAdmin
      .from('orders')
      .update({ status: 'paid', payment_method: 'mobile_money' })
      .eq('id', payment_ref);
  }

  return NextResponse.redirect(
    new URL(`/commande/${payment_ref}`, req.url)
  );
}
