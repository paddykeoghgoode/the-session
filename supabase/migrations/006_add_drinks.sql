-- The Session - Add more drink options
-- Adds Irish stouts, popular lagers, and ales

-- Insert new drinks (IDs 8-18)
INSERT INTO drinks (name, category) VALUES
  ('Beamish', 'beer'),        -- 8 - Irish Stout
  ('Murphys', 'beer'),        -- 9 - Irish Stout
  ('Carlsberg', 'beer'),      -- 10 - Lager
  ('Tuborg', 'beer'),         -- 11 - Lager
  ('Birra Moretti', 'beer'),  -- 12 - Lager
  ('San Miguel', 'beer'),     -- 13 - Lager
  ('Hop House 13', 'beer'),   -- 14 - Lager
  ('Budweiser', 'beer'),      -- 15 - Lager
  ('Madri', 'beer'),          -- 16 - Lager
  ('Asahi', 'beer'),          -- 17 - Lager
  ('Smithwicks', 'beer')      -- 18 - Irish Red Ale
ON CONFLICT (name) DO NOTHING;

-- Update pub_summaries view to include all stouts and expanded lagers
-- Using numeric(5,2) cast for compatibility with existing column types
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
  -- Cheapest Guinness (drink_id = 1) - keep for backward compatibility
  (
    SELECT MIN(pr.price)::numeric(5,2)
    FROM prices pr
    WHERE pr.pub_id = p.id AND pr.drink_id = 1
  ) as cheapest_guinness,
  -- Cheapest Lager (Heineken=2, Coors=3, Rockshore=4, Carlsberg=10, Tuborg=11, Moretti=12, San Miguel=13, Hop House=14, Budweiser=15, Madri=16, Asahi=17)
  (
    SELECT MIN(pr.price)::numeric(5,2)
    FROM prices pr
    WHERE pr.pub_id = p.id AND pr.drink_id IN (2, 3, 4, 10, 11, 12, 13, 14, 15, 16, 17)
  ) as cheapest_lager,
  -- Cheapest Cider (Bulmers=5, Orchard Thieves=6, Rockshore Cider=7)
  (
    SELECT MIN(pr.price)::numeric(5,2)
    FROM prices pr
    WHERE pr.pub_id = p.id AND pr.drink_id IN (5, 6, 7)
  ) as cheapest_cider
FROM pubs p;
