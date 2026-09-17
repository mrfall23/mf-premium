-- ============================================================================
-- COMBOS — enregistrement comme vrais produits Supabase
-- ----------------------------------------------------------------------------
-- À exécuter UNE FOIS dans Supabase → SQL Editor.
-- Crée 6 combos × 3 durées (1 / 2 / 3 mois) dans la table `products`, avec
-- category = 'combo' (ce qui les affiche sur la page /combos et les exclut du
-- catalogue /boutique). Les ids sont générés par Supabase → order_items les
-- référence proprement.
--
-- Ré-exécutable sans créer de doublons (supprime d'abord les combos existants).
-- ============================================================================

begin;

-- On repart propre pour éviter les doublons si on relance le script.
delete from products where category = 'combo';

insert into products (name, description, price, duration, category, is_active) values
  -- STREAM DUO — Netflix + Spotify (3 500 / mois)
  ('STREAM DUO',    'Netflix + Spotify',                        3500,  '1 mois', 'combo', true),
  ('STREAM DUO',    'Netflix + Spotify',                        7000,  '2 mois', 'combo', true),
  ('STREAM DUO',    'Netflix + Spotify',                        10500, '3 mois', 'combo', true),

  -- STREAM TRIO — Netflix + Spotify + Amazon Prime (5 000 / mois)
  ('STREAM TRIO',   'Netflix + Spotify + Amazon Prime',         5000,  '1 mois', 'combo', true),
  ('STREAM TRIO',   'Netflix + Spotify + Amazon Prime',         10000, '2 mois', 'combo', true),
  ('STREAM TRIO',   'Netflix + Spotify + Amazon Prime',         15000, '3 mois', 'combo', true),

  -- ULTIMATE TRIO — Netflix + Crunchyroll + Amazon Prime (4 500 / mois)
  ('ULTIMATE TRIO', 'Netflix + Crunchyroll + Amazon Prime',     4500,  '1 mois', 'combo', true),
  ('ULTIMATE TRIO', 'Netflix + Crunchyroll + Amazon Prime',     9000,  '2 mois', 'combo', true),
  ('ULTIMATE TRIO', 'Netflix + Crunchyroll + Amazon Prime',     13500, '3 mois', 'combo', true),

  -- ANIME & MUSIC — Crunchyroll + Spotify (2 500 / mois)
  ('ANIME & MUSIC', 'Crunchyroll + Spotify',                    2500,  '1 mois', 'combo', true),
  ('ANIME & MUSIC', 'Crunchyroll + Spotify',                    5000,  '2 mois', 'combo', true),
  ('ANIME & MUSIC', 'Crunchyroll + Spotify',                    7500,  '3 mois', 'combo', true),

  -- ULTIMATE 4 — Netflix + Spotify + Amazon Prime + Crunchyroll (5 500 / mois)
  ('ULTIMATE 4',    'Netflix + Spotify + Amazon Prime + Crunchyroll', 5500,  '1 mois', 'combo', true),
  ('ULTIMATE 4',    'Netflix + Spotify + Amazon Prime + Crunchyroll', 11000, '2 mois', 'combo', true),
  ('ULTIMATE 4',    'Netflix + Spotify + Amazon Prime + Crunchyroll', 16500, '3 mois', 'combo', true),

  -- MUSIC DUO — Spotify + Apple Music (3 000 / mois)
  ('MUSIC DUO',     'Spotify + Apple Music',                    3000,  '1 mois', 'combo', true),
  ('MUSIC DUO',     'Spotify + Apple Music',                    6000,  '2 mois', 'combo', true),
  ('MUSIC DUO',     'Spotify + Apple Music',                    9000,  '3 mois', 'combo', true);

commit;

-- Vérification : doit renvoyer 18 lignes.
-- select name, duration, price from products where category = 'combo' order by name, price;
