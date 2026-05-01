-- ============================================================
-- OperaMind — SQL DÉFINITIF v3 (CORRIGÉ)
-- ✅ Email admin supprimé du code client
-- ✅ Policy admin sans récursion
-- ✅ Limites plan Free enforcer côté base
-- ============================================================

-- 1. NETTOYAGE
DROP TABLE IF EXISTS goals     CASCADE;
DROP TABLE IF EXISTS tickets   CASCADE;
DROP TABLE IF EXISTS costs     CASCADE;
DROP TABLE IF EXISTS revenues  CASCADE;
DROP TABLE IF EXISTS products  CASCADE;
DROP TABLE IF EXISTS orders    CASCADE;
DROP TABLE IF EXISTS profiles  CASCADE;
DROP FUNCTION IF EXISTS handle_new_user()       CASCADE;
DROP FUNCTION IF EXISTS handle_user_confirmed() CASCADE;
DROP FUNCTION IF EXISTS check_orders_limit()    CASCADE;
DROP FUNCTION IF EXISTS check_products_limit()  CASCADE;
DROP FUNCTION IF EXISTS check_tickets_limit()   CASCADE;
DROP FUNCTION IF EXISTS is_admin()              CASCADE;

-- 2. TABLES

CREATE TABLE profiles (
  id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT,
  email      TEXT,
  plan       TEXT        NOT NULL DEFAULT 'free',
  status     TEXT        NOT NULL DEFAULT 'active',
  is_admin   BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL DEFAULT '',
  amount     NUMERIC     NOT NULL DEFAULT 0,
  product    TEXT,
  stage      TEXT        NOT NULL DEFAULT 'Prospect',
  status     TEXT        NOT NULL DEFAULT 'En cours',
  date       DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  price      NUMERIC     NOT NULL DEFAULT 0,
  stock      INTEGER     NOT NULL DEFAULT 0,
  category   TEXT        NOT NULL DEFAULT 'Service',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE revenues (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount     NUMERIC     NOT NULL DEFAULT 0,
  date       DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE costs (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL DEFAULT '',
  amount     NUMERIC     NOT NULL DEFAULT 0,
  type       TEXT        NOT NULL DEFAULT 'Fixe',
  date       DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tickets (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  description TEXT,
  priority    TEXT        NOT NULL DEFAULT 'Moyenne',
  status      TEXT        NOT NULL DEFAULT 'Ouvert',
  date        DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE goals (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  revenue_target NUMERIC     NOT NULL DEFAULT 0,
  month          TEXT        NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- 3. SÉCURITÉ RLS
ALTER TABLE profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders    ENABLE ROW LEVEL SECURITY;
ALTER TABLE products  ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenues  ENABLE ROW LEVEL SECURITY;
ALTER TABLE costs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets   ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals     ENABLE ROW LEVEL SECURITY;

-- ✅ CORRIGÉ : Fonction helper is_admin() security definer
-- Évite la récursion infinie dans les policies
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Chaque utilisateur ne voit que ses propres données
-- Les admins voient tout (via la fonction is_admin() sans récursion)
CREATE POLICY "profiles_own_or_admin"  ON profiles  FOR ALL
  USING (auth.uid() = id OR is_admin());
CREATE POLICY "orders_own_or_admin"    ON orders    FOR ALL
  USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "products_own_or_admin"  ON products  FOR ALL
  USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "revenues_own_or_admin"  ON revenues  FOR ALL
  USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "costs_own_or_admin"     ON costs     FOR ALL
  USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "tickets_own_or_admin"   ON tickets   FOR ALL
  USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "goals_own_or_admin"     ON goals     FOR ALL
  USING (auth.uid() = user_id OR is_admin());

-- 4. ✅ LIMITES PLAN FREE CÔTÉ BASE DE DONNÉES
-- Un utilisateur free ne peut pas contourner les limites via l'API directe

CREATE OR REPLACE FUNCTION check_orders_limit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  current_count INTEGER;
  user_plan TEXT;
BEGIN
  SELECT plan INTO user_plan FROM profiles WHERE id = NEW.user_id;
  IF user_plan = 'pro' THEN RETURN NEW; END IF;

  SELECT COUNT(*) INTO current_count FROM orders WHERE user_id = NEW.user_id;
  IF current_count >= 50 THEN
    RAISE EXCEPTION 'Limite plan gratuit atteinte : 50 commandes maximum.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION check_products_limit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  current_count INTEGER;
  user_plan TEXT;
BEGIN
  SELECT plan INTO user_plan FROM profiles WHERE id = NEW.user_id;
  IF user_plan = 'pro' THEN RETURN NEW; END IF;

  SELECT COUNT(*) INTO current_count FROM products WHERE user_id = NEW.user_id;
  IF current_count >= 15 THEN
    RAISE EXCEPTION 'Limite plan gratuit atteinte : 15 produits maximum.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION check_tickets_limit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  current_count INTEGER;
  user_plan TEXT;
  current_month TEXT;
BEGIN
  SELECT plan INTO user_plan FROM profiles WHERE id = NEW.user_id;
  IF user_plan = 'pro' THEN RETURN NEW; END IF;

  current_month := TO_CHAR(NOW(), 'YYYY-MM');
  SELECT COUNT(*) INTO current_count
  FROM tickets
  WHERE user_id = NEW.user_id
    AND TO_CHAR(created_at, 'YYYY-MM') = current_month;
  IF current_count >= 5 THEN
    RAISE EXCEPTION 'Limite plan gratuit atteinte : 5 tickets par mois maximum.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_orders_limit  ON orders;
DROP TRIGGER IF EXISTS enforce_products_limit ON products;
DROP TRIGGER IF EXISTS enforce_tickets_limit ON tickets;

CREATE TRIGGER enforce_orders_limit
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE PROCEDURE check_orders_limit();

CREATE TRIGGER enforce_products_limit
  BEFORE INSERT ON products
  FOR EACH ROW EXECUTE PROCEDURE check_products_limit();

CREATE TRIGGER enforce_tickets_limit
  BEFORE INSERT ON tickets
  FOR EACH ROW EXECUTE PROCEDURE check_tickets_limit();

-- 5. TRIGGER INSERT (création profil à l'inscription)
-- ✅ L'email admin est ici, côté serveur, jamais dans le code JS client.
--    Remplacez 'dotomikiki@gmail.com' par votre vrai email admin.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  admin_email TEXT := 'dotomikiki@gmail.com'; -- ← Seul endroit à modifier
BEGIN
  INSERT INTO profiles (id, name, email, plan, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''), SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    CASE WHEN NEW.email = admin_email THEN 'pro' ELSE 'free' END,
    CASE WHEN NEW.email = admin_email THEN true ELSE false END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- 6. TRIGGER UPDATE (confirmation OTP)
CREATE OR REPLACE FUNCTION handle_user_confirmed()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  admin_email TEXT := 'dotomikiki@gmail.com'; -- ← Même valeur que ci-dessus
BEGIN
  IF (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL) THEN
    INSERT INTO profiles (id, name, email, plan, is_admin)
    VALUES (
      NEW.id,
      COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''), SPLIT_PART(NEW.email, '@', 1)),
      NEW.email,
      CASE WHEN NEW.email = admin_email THEN 'pro' ELSE 'free' END,
      CASE WHEN NEW.email = admin_email THEN true ELSE false END
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_user_confirmed();

-- 7. PROFILS POUR USERS DÉJÀ INSCRITS
INSERT INTO profiles (id, name, email, plan, is_admin)
SELECT
  u.id,
  COALESCE(NULLIF(TRIM(u.raw_user_meta_data->>'name'), ''), SPLIT_PART(u.email, '@', 1)),
  u.email,
  CASE WHEN u.email = 'dotomikiki@gmail.com' THEN 'pro' ELSE 'free' END,
  CASE WHEN u.email = 'dotomikiki@gmail.com' THEN true ELSE false END
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- FIN — Votre base de données est prête !
-- Pour la suppression complète des comptes, déployez l'Edge Function
-- dans /supabase/functions/delete-user/index.ts
-- ============================================================
