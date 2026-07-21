-- ============================================================
-- Table des promotions (bannière défilante du site premium-mf.com)
-- À exécuter UNE FOIS dans Supabase : Dashboard → SQL Editor → coller → Run
-- ============================================================

create table if not exists public.promotions (
  id         uuid primary key default gen_random_uuid(),
  message    text not null,
  ends_at    timestamptz not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- Lecture publique (le site affiche la promo active), écriture réservée
-- au serveur via la clé service role (route /api/admin/promo).
alter table public.promotions enable row level security;

drop policy if exists "Lecture publique des promotions" on public.promotions;
create policy "Lecture publique des promotions"
  on public.promotions
  for select
  using (true);

-- Index pour retrouver vite la promo active la plus récente.
create index if not exists promotions_active_idx
  on public.promotions (is_active, created_at desc);
