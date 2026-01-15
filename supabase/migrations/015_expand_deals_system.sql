-- Expand deals system to support food-only deals, titles, and dates

-- ============================================
-- ADD NEW DEAL FIELDS TO PRICES TABLE
-- ============================================

-- Deal title for display
ALTER TABLE prices ADD COLUMN IF NOT EXISTS deal_title TEXT;

-- Start and end dates for time-limited deals
ALTER TABLE prices ADD COLUMN IF NOT EXISTS deal_start_date DATE;
ALTER TABLE prices ADD COLUMN IF NOT EXISTS deal_end_date DATE;

-- Recurring schedule (e.g., "Mon-Fri", "Weekends", "Daily 5-7pm")
ALTER TABLE prices ADD COLUMN IF NOT EXISTS deal_schedule TEXT;

-- ============================================
-- UPDATE DEAL_TYPE TO INCLUDE FOOD_ONLY
-- ============================================
-- Drop the old constraint
ALTER TABLE prices DROP CONSTRAINT IF EXISTS prices_deal_type_check;

-- Add new constraint with food_only option
ALTER TABLE prices ADD CONSTRAINT prices_deal_type_check
  CHECK (deal_type IN ('drink_only', 'food_combo', 'food_only'));

-- ============================================
-- MAKE DRINK_ID OPTIONAL FOR FOOD-ONLY DEALS
-- ============================================
-- First drop the NOT NULL constraint if it exists
ALTER TABLE prices ALTER COLUMN drink_id DROP NOT NULL;

-- Add a check constraint to ensure drink_id is provided for drink deals
ALTER TABLE prices ADD CONSTRAINT prices_drink_required_for_drink_deals
  CHECK (
    (deal_type = 'food_only' AND drink_id IS NULL) OR
    (deal_type != 'food_only' AND drink_id IS NOT NULL) OR
    (is_deal = false AND drink_id IS NOT NULL)
  );

-- ============================================
-- CREATE INDEX FOR ACTIVE DEALS
-- ============================================
CREATE INDEX IF NOT EXISTS idx_prices_active_deals ON prices (pub_id, is_deal, deal_end_date)
  WHERE is_deal = true;
