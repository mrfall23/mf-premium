import { NextRequest } from 'next/server';

// Server-side guard for /api/admin/* routes. The dashboard sends the admin
// password (obtained at login) in the `x-admin-token` header; we compare it to
// the ADMIN_PASSWORD secret. Without a configured secret, access is denied.
export function isAdmin(req: NextRequest): boolean {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false;
  return req.headers.get('x-admin-token') === secret;
}
