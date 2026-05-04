-- ============================================================
-- NOMA V2 Migration — À exécuter dans l'éditeur SQL Supabase
-- ============================================================

-- 1. Ajouter la colonne description aux boissons
ALTER TABLE drinks_catalog ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Ajouter la colonne category aux extras (pour différencier boissons / salé / sucré)
ALTER TABLE extras_catalog ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'sucre';

-- 3. Ajouter des descriptions aux boissons existantes
UPDATE drinks_catalog SET description = 'Café court et corsé'                    WHERE name = 'Espresso'        AND description IS NULL;
UPDATE drinks_catalog SET description = 'Espresso allongé à l''eau'              WHERE name = 'Americano'       AND description IS NULL;
UPDATE drinks_catalog SET description = 'Espresso, lait vapeur et mousse'        WHERE name = 'Cappuccino'      AND description IS NULL;
UPDATE drinks_catalog SET description = 'Double espresso, lait soyeux'           WHERE name = 'Flat White'      AND description IS NULL;
UPDATE drinks_catalog SET description = 'Espresso avec lait crémeux'             WHERE name = 'Latte'           AND description IS NULL;
UPDATE drinks_catalog SET description = 'Latte avec sirop vanille maison'        WHERE name = 'Latte Vanille'   AND description IS NULL;
UPDATE drinks_catalog SET description = 'Poudre de matcha, lait vapeur'          WHERE name = 'Matcha'          AND description IS NULL;
UPDATE drinks_catalog SET description = 'Matcha avec sirop vanille maison'       WHERE name = 'Matcha Vanille'  AND description IS NULL;
UPDATE drinks_catalog SET description = 'Thé épicé au lait, cardamome & cannelle' WHERE name = 'Chai Latte'    AND description IS NULL;
UPDATE drinks_catalog SET description = 'Chocolat belge chaud et onctueux'       WHERE name = 'Chocolat chaud' AND description IS NULL;
UPDATE drinks_catalog SET description = 'Infusion à la menthe fraîche'           WHERE name = 'Thé menthe'     AND description IS NULL;
UPDATE drinks_catalog SET description = 'Infusion naturellement sucrée, sans théine' WHERE name = 'Rooibos'    AND description IS NULL;
UPDATE drinks_catalog SET description = 'Espresso allongé, servi sur glace'      WHERE name = 'Americano glacé' AND description IS NULL;
UPDATE drinks_catalog SET description = 'Latte crémeux servi sur glace'          WHERE name = 'Latte glacé'    AND description IS NULL;
UPDATE drinks_catalog SET description = 'Matcha onctueux servi sur glace'        WHERE name = 'Matcha glacé'   AND description IS NULL;
UPDATE drinks_catalog SET description = 'Thé chai épicé servi sur glace'         WHERE name = 'Ice Chai Latte' AND description IS NULL;

-- 4. Ajouter les nouveaux thés manquants
INSERT INTO drinks_catalog (name, category, description, is_active, sort_order) VALUES
  ('Thé mangue',       'hot', 'Infusion fruitée à la mangue',       true, 115),
  ('Thé Fruits rouges','hot', 'Infusion aux fruits rouges',         true, 125),
  ('Rooibos vanille',  'hot', 'Rooibos doux avec arôme de vanille', true, 130)
ON CONFLICT DO NOTHING;

-- 5. Ajouter les boissons hors-formule dans les extras (catégorie "boisson")
INSERT INTO extras_catalog (name, category, is_active, sort_order) VALUES
  ('Limonade', 'boisson', true, 5),
  ('Maya',     'boisson', true, 10),
  ('Coca-Cola','boisson', true, 15),
  ('Fuze Tea', 'boisson', true, 20)
ON CONFLICT DO NOTHING;

-- 6. Ajouter Bagels et Wraps (salé)
INSERT INTO extras_catalog (name, category, is_active, sort_order) VALUES
  ('Bagel', 'sale', true, 25),
  ('Wrap',  'sale', true, 30)
ON CONFLICT DO NOTHING;

-- 7. Mettre à jour les extras existants avec leur catégorie
UPDATE extras_catalog SET category = 'sucre' WHERE name IN ('Cookie','Maxi Cookie','Banana Bread','Brownie','Madeleine','Brookie','Carrot Cake','Scone') AND (category IS NULL OR category = 'sucre');
