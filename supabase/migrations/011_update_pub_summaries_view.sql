-- Recreate the pub_summaries view to include the new 'slug' column.
-- This ensures that components relying on this view can access the slug for URLs.

DROP VIEW IF EXISTS pub_summaries;

CREATE OR REPLACE VIEW pub_summaries AS
SELECT
  p.id,
  p.slug, -- Include the new slug column
  p.name,
  p.address,
  p.eircode,
  p.latitude,
  p.longitude,
  p.google_place_id,
  p.phone,
  p.website,
  p.has_food,
  p.has_outdoor_seating,
  p.shows_sports,
  p.has_live_music,
  p.is_permanently_closed,
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
  p.created_at,
  p.updated_at,
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
      WHERE r.pub_id = p.id AND r.is_approved = true
    ) subq
  ) as avg_rating,
  (SELECT COUNT(*) FROM reviews r WHERE r.pub_id = p.id AND r.is_approved = true) as review_count,
  (
    SELECT MIN(pr.price)::numeric(5,2)
    FROM prices pr
    WHERE pr.pub_id = p.id AND pr.drink_id = 1 -- Guinness
  ) as cheapest_guinness,
  (
    SELECT MIN(pr.price)::numeric(5,2)
    FROM prices pr
    WHERE pr.pub_id = p.id AND pr.drink_id IN (2, 3, 4, 10, 11, 12, 13, 14, 15, 16, 17) -- Lagers
  ) as cheapest_lager,
    (
    SELECT MIN(pr.price)::numeric(5,2)
    FROM prices pr
    WHERE pr.pub_id = p.id AND pr.drink_id IN (5, 6, 7) -- Ciders
  ) as cheapest_cider
FROM pubs p;
