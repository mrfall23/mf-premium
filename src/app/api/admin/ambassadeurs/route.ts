import { NextRequest, NextResponse } from 'next/server';
import { referralAdmin, normalizeCode } from '@/lib/referral';

// Keep percentages sane even if the (currently unauthenticated) admin surface
// is abused — a code can never wipe out a price or an entire margin.
function clampPct(v: unknown): number {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return 0;
  return Math.min(90, Math.max(0, n));
}

// GET: list ambassadors with their sales stats (paid orders only).
export async function GET() {
  const { data: ambs, error } = await referralAdmin
    .from('ambassadeurs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: orders } = await referralAdmin
    .from('orders')
    .select('code_ambassadeur, total_amount, commission_montant, status')
    .not('code_ambassadeur', 'is', null)
    .eq('status', 'paid');

  const stats: Record<string, { ventes: number; total: number; commission: number }> = {};
  for (const o of orders || []) {
    const key = String(o.code_ambassadeur);
    if (!stats[key]) stats[key] = { ventes: 0, total: 0, commission: 0 };
    stats[key].ventes += 1;
    stats[key].total += Number(o.total_amount) || 0;
    stats[key].commission += Number(o.commission_montant) || 0;
  }

  const result = (ambs || []).map(a => ({
    ...a,
    ventes: stats[a.code]?.ventes || 0,
    total_genere: stats[a.code]?.total || 0,
    commission_due: stats[a.code]?.commission || 0,
  }));

  return NextResponse.json({ ambassadeurs: result });
}

// POST: create an ambassador.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const nom = String(body.nom || '').trim();
  const code = normalizeCode(body.code);

  if (!nom) return NextResponse.json({ error: 'Le nom est requis.' }, { status: 400 });
  if (!code) return NextResponse.json({ error: 'Le code est requis.' }, { status: 400 });
  if (!/^[A-Z0-9]{2,20}$/.test(code)) {
    return NextResponse.json({ error: 'Le code doit faire 2 à 20 lettres/chiffres, sans espace.' }, { status: 400 });
  }

  const { error } = await referralAdmin.from('ambassadeurs').insert({
    nom,
    code,
    remise_pct: clampPct(body.remise_pct),
    commission_pct: clampPct(body.commission_pct),
    actif: body.actif !== false,
  });

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Ce code existe déjà.' }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

// PATCH: update an ambassador (name, percentages, active flag). Code is immutable
// once created so existing sales stay correctly attributed.
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const id = body.id;
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (typeof body.nom === 'string') patch.nom = body.nom.trim();
  if (body.remise_pct !== undefined) patch.remise_pct = clampPct(body.remise_pct);
  if (body.commission_pct !== undefined) patch.commission_pct = clampPct(body.commission_pct);
  if (typeof body.actif === 'boolean') patch.actif = body.actif;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'Rien à modifier.' }, { status: 400 });
  }

  const { error } = await referralAdmin.from('ambassadeurs').update(patch).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
