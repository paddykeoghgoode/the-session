-- Fix the drink requirement constraint to support:
-- 1. deal_target = 'all_pints' or 'all_drinks' (no specific drink_id needed)
-- 2. Multi-drink deals using drink_ids array instead of drink_id

-- Drop the old constraint
ALTER TABLE prices DROP CONSTRAINT IF EXISTS prices_drink_required_for_drink_deals;

-- Add updated constraint that accounts for deal_target and drink_ids
ALTER TABLE prices ADD CONSTRAINT prices_drink_required_for_drink_deals
  CHECK (
    -- Food-only deals: no drink required
    (deal_type = 'food_only' AND drink_id IS NULL AND drink_ids IS NULL) OR
    -- All pints/all drinks deals: no specific drink required
    (deal_type != 'food_only' AND deal_target IN ('all_pints', 'all_drinks')) OR
    -- Specific drink deals: need either drink_id OR drink_ids
    (deal_type != 'food_only' AND deal_target = 'specific' AND (drink_id IS NOT NULL OR drink_ids IS NOT NULL)) OR
    -- Legacy/null deal_target with drink_id (backward compatibility)
    (deal_type != 'food_only' AND deal_target IS NULL AND drink_id IS NOT NULL) OR
    -- Regular prices (not deals): drink_id required
    (is_deal = false AND drink_id IS NOT NULL)
  );

COMMENT ON CONSTRAINT prices_drink_required_for_drink_deals ON prices IS
  'Ensures drink_id/drink_ids is provided appropriately based on deal_type and deal_target';
