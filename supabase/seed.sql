-- ============================================================
-- NOMA — Données initiales du catalogue
-- ============================================================

-- Boissons chaudes
INSERT INTO drinks_catalog (name, category, is_active, sort_order) VALUES
  ('Espresso',        'hot',  true, 10),
  ('Americano',       'hot',  true, 20),
  ('Cappuccino',      'hot',  true, 30),
  ('Flat White',      'hot',  true, 40),
  ('Latte',           'hot',  true, 50),
  ('Latte Vanille',   'hot',  true, 60),
  ('Matcha',          'hot',  true, 70),
  ('Matcha Vanille',  'hot',  true, 80),
  ('Chai Latte',      'hot',  true, 90),
  ('Chocolat chaud',  'hot',  true, 100),
  ('Thé menthe',      'hot',  true, 110),
  ('Rooibos',         'hot',  true, 120)
ON CONFLICT DO NOTHING;

-- Boissons froides
INSERT INTO drinks_catalog (name, category, is_active, sort_order) VALUES
  ('Americano glacé', 'cold', true, 10),
  ('Latte glacé',     'cold', true, 20),
  ('Matcha glacé',    'cold', true, 30),
  ('Ice Chai Latte',  'cold', true, 40),
  ('Eau pétillante',  'cold', true, 50),
  ('Jus d''orange',  'cold', true, 60)
ON CONFLICT DO NOTHING;

-- Extras / snacks
INSERT INTO extras_catalog (name, is_active, sort_order) VALUES
  ('Cookie',      true, 10),
  ('Maxi Cookie', true, 20),
  ('Banana Bread',true, 30),
  ('Brownie',     true, 40),
  ('Madeleine',   true, 50),
  ('Brookie',     true, 60),
  ('Carrot Cake', true, 70),
  ('Scone',       true, 80)
ON CONFLICT DO NOTHING;

-- Suppléments boissons
INSERT INTO drink_addons (name, price, is_active) VALUES
  ('Sirop vanille',   0.50, true),
  ('Sirop caramel',   0.50, true),
  ('Purée framboise', 0.80, true),
  ('Lait d''avoine',  0.60, true),
  ('Lait de coco',    0.60, true),
  ('Sirop noisette',  0.50, true)
ON CONFLICT DO NOTHING;
