-- Add support for food+drink combo deals (e.g., "pint and a toastie")

-- ============================================
-- ADD DEAL TYPE AND FOOD ITEM COLUMNS
-- ============================================

-- Deal type: 'drink_only' for regular drink deals, 'food_combo' for food+drink combos
ALTER TABLE prices ADD COLUMN IF NOT EXISTS deal_type TEXT DEFAULT 'drink_only'
  CHECK (deal_type IN ('drink_only', 'food_combo'));

-- Food item for combo deals (e.g., "toastie", "carvery", "soup", "burger")
ALTER TABLE prices ADD COLUMN IF NOT EXISTS food_item TEXT;

-- ============================================
-- COMMON FOOD ITEMS REFERENCE TABLE (optional, for suggestions)
-- ============================================
CREATE TABLE IF NOT EXISTS food_items (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('sandwich', 'hot_meal', 'snack', 'other'))
);

-- Seed common food items
INSERT INTO food_items (name, category) VALUES
  ('Toastie', 'sandwich'),
  ('Soup', 'hot_meal'),
  ('Carvery', 'hot_meal'),
  ('Burger', 'hot_meal'),
  ('Fish & Chips', 'hot_meal'),
  ('Sandwich', 'sandwich'),
  ('Wings', 'snack'),
  ('Nachos', 'snack'),
  ('Chips', 'snack'),
  ('Stew', 'hot_meal'),
  ('Pie', 'hot_meal'),
  ('Pasta', 'hot_meal')
ON CONFLICT (name) DO NOTHING;

-- Allow public read access to food_items
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Food items are viewable by everyone" ON food_items
  FOR SELECT USING (true);
