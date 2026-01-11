-- The Session - Enhanced pub_summaries view with more price columns
-- Adds cheapest_lager and cheapest_cider to the view

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
  -- Cheapest Guinness (drink_id = 1)
  (
    SELECT MIN(pr.price)
    FROM prices pr
    WHERE pr.pub_id = p.id AND pr.drink_id = 1
  ) as cheapest_guinness,
  -- Cheapest Lager (Heineken=2, Coors Light=3, Rockshore Lager=4)
  (
    SELECT MIN(pr.price)
    FROM prices pr
    WHERE pr.pub_id = p.id AND pr.drink_id IN (2, 3, 4)
  ) as cheapest_lager,
  -- Cheapest Cider (Bulmers=5, Orchard Thieves=6, Rockshore Cider=7)
  (
    SELECT MIN(pr.price)
    FROM prices pr
    WHERE pr.pub_id = p.id AND pr.drink_id IN (5, 6, 7)
  ) as cheapest_cider
FROM pubs p;
