-- Migration: Add support for multiple drinks in deals
-- This allows deals to specify multiple specific drinks (e.g., "Toastie + Guinness or Rockshore")

-- Add drink_ids column as an array of integers
ALTER TABLE prices ADD COLUMN IF NOT EXISTS drink_ids integer[] DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN prices.drink_ids IS 'Array of drink IDs when deal_target is specific and multiple drinks apply';

-- Create an index for array queries
CREATE INDEX IF NOT EXISTS idx_prices_drink_ids ON prices USING GIN (drink_ids);
