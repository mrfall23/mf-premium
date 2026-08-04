import { createClient } from '@supabase/supabase-js';

// Admin client — needed to write order status from server-side reconciliation.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type OrderStatus = 'pending' | 'paid' | 'failed';

/**
 * Ask SebPay for the real status of a collection (keyed by our order id, which we
 * pass to SebPay as external_reference) and reconcile our DB row if it changed.
 *
 * This is the single source of truth for confirming a payment. It is safe to call
 * from anywhere (webhook, status polling, the order confirmation page) because the
 * DB is only ever moved OUT of `pending`, and only to match SebPay's own record.
 */
export async function verifyAndSyncOrder(orderId: string): Promise<OrderStatus> {
  try {
    const res = await fetch(
      `https://newapi.sebpay.bj/api/v1/collections/${orderId}`,
      {
        headers: {
          'X-Public-Key': process.env.SEBPAY_PUBLIC_KEY!,
          'X-Secret-Key': process.env.SEBPAY_SECRET_KEY!,
        },
        cache: 'no-store',
      }
    );
    const data = await res.json();

    // 404 "Transaction not found" => the collection was never initiated on SebPay
    // (a "failed to initiate collection" case). Mark the orphan order as failed.
    if (!data?.success) {
      await supabaseAdmin
        .from('orders')
        .update({ status: 'failed' })
        .eq('id', orderId)
        .eq('status', 'pending');
      return 'failed';
    }

    const status = String(data?.data?.status || '').toLowerCase();

    if (status === 'approved' || status === 'success') {
      await supabaseAdmin
        .from('orders')
        .update({ status: 'paid', payment_method: 'mobile_money' })
        .eq('id', orderId)
        .eq('status', 'pending');
      return 'paid';
    }

    if (status === 'rejected' || status === 'failed') {
      await supabaseAdmin
        .from('orders')
        .update({ status: 'failed' })
        .eq('id', orderId)
        .eq('status', 'pending');
      return 'failed';
    }

    // Still pending on SebPay's side too.
    return 'pending';
  } catch {
    // On any network error, don't touch the DB — just report unknown as pending.
    return 'pending';
  }
}
