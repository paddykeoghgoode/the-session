-- The Session - Pub Enhancements Migration
-- Adds closed status and per-day opening hours

-- ============================================
-- CLOSED STATUS
-- ============================================
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS is_permanently_closed BOOLEAN DEFAULT false;

-- ============================================
-- OPENING HOURS (per day, TIME type)
-- NULL means closed on that day
-- ============================================

-- Monday
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS hours_monday_open TIME;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS hours_monday_close TIME;

-- Tuesday
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS hours_tuesday_open TIME;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS hours_tuesday_close TIME;

-- Wednesday
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS hours_wednesday_open TIME;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS hours_wednesday_close TIME;

-- Thursday
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS hours_thursday_open TIME;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS hours_thursday_close TIME;

-- Friday
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS hours_friday_open TIME;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS hours_friday_close TIME;

-- Saturday
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS hours_saturday_open TIME;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS hours_saturday_close TIME;

-- Sunday
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS hours_sunday_open TIME;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS hours_sunday_close TIME;

-- ============================================
-- UPDATE pub_summaries VIEW
-- ============================================
CREATE OR REPLACE VIEW pub_summaries AS
SELECT
  p.*,
  (
    SELECT AVG(rating_avg)
    FROM (
      SELECT
        (
          COALESCE(r.pint_quality, 0) +
          COALESCE(r.ambience, 0) +
          COALESCE(r.staff_friendliness, 0) +
          COALESCE(r.safety, 0) +
          COALESCE(r.value_for_money, 0)
        )::float / NULLIF(
          (CASE WHEN r.pint_quality IS NOT NULL THEN 1 ELSE 0 END) +
          (CASE WHEN r.ambience IS NOT NULL THEN 1 ELSE 0 END) +
          (CASE WHEN r.staff_friendliness IS NOT NULL THEN 1 ELSE 0 END) +
          (CASE WHEN r.safety IS NOT NULL THEN 1 ELSE 0 END) +
          (CASE WHEN r.value_for_money IS NOT NULL THEN 1 ELSE 0 END)
        , 0) as rating_avg
      FROM reviews r
      WHERE r.pub_id = p.id
    ) subq
  ) as avg_rating,
  (SELECT COUNT(*) FROM reviews r WHERE r.pub_id = p.id) as review_count,
  (
    SELECT pr.price
    FROM prices pr
    WHERE pr.pub_id = p.id AND pr.drink_id = 1
    ORDER BY pr.created_at DESC
    LIMIT 1
  ) as cheapest_guinness
FROM pubs p;
