import { NextRequest, NextResponse } from 'next/server';

// Verify admin credentials server-side. On success the client stores the
// password and sends it as `x-admin-token` on subsequent admin API calls.
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json(
      { error: 'Administration non configurée (ADMIN_PASSWORD manquant).' },
      { status: 500 }
    );
  }

  if (email === adminEmail && password === adminPassword) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Email ou mot de passe incorrect.' }, { status: 401 });
}
