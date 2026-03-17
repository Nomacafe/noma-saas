-- ============================================================
-- NOMA Café Coworking — Schéma complet V2
-- Compatible Supabase (PostgreSQL)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CATALOGUE BOISSONS
-- ============================================================
CREATE TABLE IF NOT EXISTS drinks_catalog (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  category   TEXT NOT NULL DEFAULT 'hot' CHECK (category IN ('hot', 'cold', 'other')),
  price      DECIMAL(10,2),
  is_active  BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CATALOGUE EXTRAS
-- ============================================================
CREATE TABLE IF NOT EXISTS extras_catalog (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  price      DECIMAL(10,2),
  is_active  BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SUPPLÉMENTS BOISSONS (addons)
-- ============================================================
CREATE TABLE IF NOT EXISTS drink_addons (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  price      DECIMAL(10,2),
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date             DATE NOT NULL DEFAULT CURRENT_DATE,
  first_name       TEXT NOT NULL,
  last_name        TEXT,
  zone_id          UUID,
  zone_name        TEXT,
  arrival_time     TIMESTAMPTZ NOT NULL DEFAULT now(),
  departure_time   TIMESTAMPTZ,
  duration_minutes INT,
  status           TEXT NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active', 'finished', 'cancelled')),
  notes            TEXT,
  is_day_pass      BOOLEAN NOT NULL DEFAULT false,
  day_pass_price   DECIMAL(10,2),
  created_by       UUID,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_date   ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

-- ============================================================
-- BOISSONS DES SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS session_drinks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  drink_id   UUID,
  drink_name TEXT NOT NULL,
  quantity   INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  bar_status TEXT NOT NULL DEFAULT 'preparing'
               CHECK (bar_status IN ('preparing', 'served')),
  added_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  served_at  TIMESTAMPTZ,
  line_total DECIMAL(10,2)
);

CREATE INDEX IF NOT EXISTS idx_session_drinks_session ON session_drinks(session_id);
CREATE INDEX IF NOT EXISTS idx_session_drinks_status  ON session_drinks(bar_status);

-- ============================================================
-- SUPPLÉMENTS DES BOISSONS
-- ============================================================
CREATE TABLE IF NOT EXISTS session_drink_addons (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_drink_id UUID NOT NULL REFERENCES session_drinks(id) ON DELETE CASCADE,
  addon_id         UUID,
  addon_name       TEXT NOT NULL,
  price_snapshot   DECIMAL(10,2),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sda_drink ON session_drink_addons(session_drink_id);

-- ============================================================
-- EXTRAS DES SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS session_extras (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  extra_id   UUID,
  extra_name TEXT NOT NULL,
  quantity   INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_extras_session ON session_extras(session_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sessions_updated_at ON sessions;
CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY — accès total (app interne, pas d'auth)
-- ============================================================
ALTER TABLE drinks_catalog       ENABLE ROW LEVEL SECURITY;
ALTER TABLE extras_catalog       ENABLE ROW LEVEL SECURITY;
ALTER TABLE drink_addons         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_drinks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_drink_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_extras       ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='drinks_catalog'       AND policyname='Full access drinks_catalog')       THEN CREATE POLICY "Full access drinks_catalog"       ON drinks_catalog       FOR ALL TO authenticated, anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='extras_catalog'       AND policyname='Full access extras_catalog')       THEN CREATE POLICY "Full access extras_catalog"       ON extras_catalog       FOR ALL TO authenticated, anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='drink_addons'         AND policyname='Full access drink_addons')         THEN CREATE POLICY "Full access drink_addons"         ON drink_addons         FOR ALL TO authenticated, anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sessions'             AND policyname='Full access sessions')             THEN CREATE POLICY "Full access sessions"             ON sessions             FOR ALL TO authenticated, anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='session_drinks'       AND policyname='Full access session_drinks')       THEN CREATE POLICY "Full access session_drinks"       ON session_drinks       FOR ALL TO authenticated, anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='session_drink_addons' AND policyname='Full access session_drink_addons') THEN CREATE POLICY "Full access session_drink_addons" ON session_drink_addons FOR ALL TO authenticated, anon USING (true) WITH CHECK (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='session_extras'       AND policyname='Full access session_extras')       THEN CREATE POLICY "Full access session_extras"       ON session_extras       FOR ALL TO authenticated, anon USING (true) WITH CHECK (true); END IF;
END $$;
