import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Client service role : écrit dans Supabase en contournant la RLS (comme mark-paid).
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const action = body.action;

  // --- Arrêter la promo en cours ---
  if (action === 'stop') {
    const { error } = await adminSupabase
      .from('promotions')
      .update({ is_active: false })
      .eq('is_active', true);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // --- Publier / remplacer la promo ---
  if (action === 'publish') {
    const message = (body.message || '').trim();
    const endsAt = body.ends_at; // chaîne ISO envoyée par le client

    if (!message) return NextResponse.json({ error: 'Le message est vide.' }, { status: 400 });
    if (!endsAt || isNaN(new Date(endsAt).getTime())) {
      return NextResponse.json({ error: 'Date de fin invalide.' }, { status: 400 });
    }

    // Une seule promo active à la fois : on désactive les précédentes…
    const { error: offErr } = await adminSupabase
      .from('promotions')
      .update({ is_active: false })
      .eq('is_active', true);
    if (offErr) return NextResponse.json({ error: offErr.message }, { status: 500 });

    // …puis on insère la nouvelle.
    const { error: insErr } = await adminSupabase
      .from('promotions')
      .insert({ message, ends_at: endsAt, is_active: true });
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Action inconnue.' }, { status: 400 });
}
