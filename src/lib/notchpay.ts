// NotchPay integration helpers.
// Auth: the PUBLIC key goes in the `Authorization` header for standard
// payment operations (initialize, verify). The PRIVATE key is only needed
// for money-out (transfers) which we don't do. Webhooks are verified with
// the HASH key (see webhook route).

export const NOTCHPAY_BASE = 'https://api.notchpay.co';

export function notchpayHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: process.env.NOTCHPAY_PUBLIC_KEY!,
  };
}

// NotchPay statuses -> our order statuses.
// complete = paid. failed/canceled/expired/rejected = failed. Otherwise pending.
export type OrderStatus = 'pending' | 'paid' | 'failed';

export function mapNotchpayStatus(raw: string | undefined | null): OrderStatus {
  const s = String(raw || '').toLowerCase();
  if (s === 'complete' || s === 'completed' || s === 'success') return 'paid';
  if (s === 'failed' || s === 'canceled' || s === 'cancelled' || s === 'expired' || s === 'rejected') {
    return 'failed';
  }
  return 'pending';
}
