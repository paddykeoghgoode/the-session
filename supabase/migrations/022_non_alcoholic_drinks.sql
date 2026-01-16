-- Add non-alcoholic drink category
ALTER TABLE drinks
ALTER COLUMN category TYPE varchar(20);

-- Add non-alcoholic drinks
INSERT INTO drinks (name, category) VALUES
  ('Guinness 0.0', 'non-alcoholic'),
  ('Heineken 0.0', 'non-alcoholic'),
  ('Paulaner 0%', 'non-alcoholic'),
  ('Erdinger Alkoholfrei', 'non-alcoholic'),
  ('Bulmers 0.0%', 'non-alcoholic'),
  ('Kopparberg 0.0', 'non-alcoholic'),
  ('Corona 0.0', 'non-alcoholic'),
  ('Peroni 0.0', 'non-alcoholic')
ON CONFLICT (name) DO NOTHING;

-- Add last_login column to profiles if not exists
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

-- Update pub_summaries view to include cheapest non-alcoholic
DROP VIEW IF EXISTS pub_summaries;

CREATE VIEW pub_summaries AS
SELECT
  p.id,
  p.slug,
  p.name,
  p.address,
  p.eircode,
  p.latitude,
  p.longitude,
  p.phone,
  p.website,
  -- Original amenities
  p.has_food,
  p.has_outdoor_seating,
  p.shows_sports,
  p.has_live_music,
  p.has_pool,
  p.has_darts,
  p.has_board_games,
  p.is_speakeasy,
  -- V2 amenities
  p.has_beer_garden,
  p.is_dog_friendly,
  p.is_late_bar,
  p.is_wheelchair_accessible,
  p.has_traditional_music,
  p.has_quiz_night,
  p.has_snug,
  p.is_craft_beer_focused,
  p.is_cash_only,
  p.is_card_only,
  -- V2 social/engagement fields
  p.like_count,
  p.avg_cream_score,
  p.cream_rating_count,
  -- Status fields
  p.is_permanently_closed,
  p.is_active,
  p.moderation_status,
  -- Opening hours
  p.hours_monday_open,
  p.hours_monday_close,
  p.hours_tuesday_open,
  p.hours_tuesday_close,
  p.hours_wednesday_open,
  p.hours_wednesday_close,
  p.hours_thursday_open,
  p.hours_thursday_close,
  p.hours_friday_open,
  p.hours_friday_close,
  p.hours_saturday_open,
  p.hours_saturday_close,
  p.hours_sunday_open,
  p.hours_sunday_close,
  -- Timestamps
  p.created_at,
  p.updated_at,
  -- Computed review fields (only approved reviews)
  COALESCE(
    (SELECT AVG(
      (COALESCE(pint_quality, 0) + COALESCE(ambience, 0) + COALESCE(staff_friendliness, 0) +
       COALESCE(safety, 0) + COALESCE(value_for_money, 0)) /
      NULLIF(
        (CASE WHEN pint_quality IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN ambience IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN staff_friendliness IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN safety IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN value_for_money IS NOT NULL THEN 1 ELSE 0 END), 0
      )
    ) FROM reviews r WHERE r.pub_id = p.id AND r.is_approved = TRUE), 0
  ) AS avg_rating,
  (SELECT COUNT(*) FROM reviews r WHERE r.pub_id = p.id AND r.is_approved = TRUE) AS review_count,
  -- Computed price fields (exclude deals)
  (SELECT MIN(pr.price) FROM prices pr
   JOIN drinks d ON pr.drink_id = d.id
   WHERE pr.pub_id = p.id AND d.name = 'Guinness' AND pr.is_deal = FALSE) AS cheapest_guinness,
  (SELECT MIN(pr.price) FROM prices pr
   JOIN drinks d ON pr.drink_id = d.id
   WHERE pr.pub_id = p.id AND d.category = 'beer' AND d.name != 'Guinness' AND pr.is_deal = FALSE) AS cheapest_lager,
  (SELECT MIN(pr.price) FROM prices pr
   JOIN drinks d ON pr.drink_id = d.id
   WHERE pr.pub_id = p.id AND d.category = 'cider' AND pr.is_deal = FALSE) AS cheapest_cider,
  (SELECT MIN(pr.price) FROM prices pr
   JOIN drinks d ON pr.drink_id = d.id
   WHERE pr.pub_id = p.id AND d.category = 'non-alcoholic' AND pr.is_deal = FALSE) AS cheapest_non_alcoholic
FROM pubs p
WHERE p.is_active = TRUE AND p.moderation_status = 'active';

COMMENT ON VIEW pub_summaries IS 'Aggregated pub data including ratings, prices (excluding deals), and engagement metrics';
