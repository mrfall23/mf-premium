import { createClient } from '@supabase/supabase-js';
import { NOTCHPAY_BASE, notchpayHeaders, mapNotchpayStatus, type OrderStatus } from '@/lib/notchpay';

// Admin client — needed to write order status from server-side reconciliation.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type { OrderStatus };

/**
 * Ask NotchPay for the real status of a payment and reconcile our DB row.
 *
 * Single source of truth for confirming a payment. Safe to call from anywhere
 * (webhook, status polling, the order confirmation page): the DB is only ever
 * moved OUT of `pending`, and only to match NotchPay's own record.
 */
export async function verifyAndSyncOrder(orderId: string): Promise<OrderStatus> {
  try {
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id, status, payment_reference')
      .eq('id', orderId)
      .single();

    if (!order) return 'pending';
    if (order.status !== 'pending') return order.status as OrderStatus;

    // Pas de référence NotchPay = commande à paiement direct (mobile money vers
    // le vendeur). On ne vérifie rien auprès de NotchPay : le vendeur confirme
    // manuellement depuis l'admin. Ne surtout pas la marquer échouée.
    const ref = order.payment_reference;
    if (!ref) return 'pending';

    const res = await fetch(`${NOTCHPAY_BASE}/payments/${encodeURIComponent(ref)}`, {
      headers: notchpayHeaders(),
      cache: 'no-store',
    });
    const data = await res.json();

    // NotchPay returns the transaction either nested under `transaction` or flat.
    const tx = data?.transaction || data;
    const status = mapNotchpayStatus(tx?.status);

    if (status === 'paid') {
      await supabaseAdmin
        .from('orders')
        .update({ status: 'paid', payment_method: tx?.channel || 'notchpay' })
        .eq('id', orderId)
        .eq('status', 'pending');
    } else if (status === 'failed') {
      await supabaseAdmin
        .from('orders')
        .update({ status: 'failed' })
        .eq('id', orderId)
        .eq('status', 'pending');
    }

    return status;
  } catch {
    // On any network error, don't touch the DB — report unknown as pending.
    return 'pending';
  }
}
