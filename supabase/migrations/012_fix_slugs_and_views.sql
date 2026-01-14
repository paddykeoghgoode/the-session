-- The Session - Consolidated Migration to Fix Slugs and Views

-- Step 1: Ensure the unaccent extension is enabled
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Step 2: Define the slugify function
CREATE OR REPLACE FUNCTION public.slugify(text TEXT)
RETURNS TEXT AS $$
DECLARE
    slug TEXT;
BEGIN
    slug := lower(unaccent(text));
    slug := regexp_replace(slug, '[^a-z0-9\-_]+', '-', 'gi');
    slug := regexp_replace(slug, '(^-+|-+$)', '', 'g');
    slug := regexp_replace(slug, '-+', '-', 'g');
    RETURN slug;
END;
$$ LANGUAGE plpgsql STRICT IMMUTABLE;

-- Step 3: Add the slug column to the pubs table if it doesn't exist
ALTER TABLE public.pubs ADD COLUMN IF NOT EXISTS slug TEXT;

-- Step 4: Define the trigger function to set the slug
CREATE OR REPLACE FUNCTION public.set_pub_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INT := 1;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.name = OLD.name AND NEW.slug IS NOT NULL THEN
    RETURN NEW;
  END IF;

  base_slug := slugify(NEW.name);
  final_slug := base_slug;

  WHILE EXISTS (SELECT 1 FROM public.pubs WHERE slug = final_slug AND id != NEW.id) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create the trigger on the pubs table
DROP TRIGGER IF EXISTS trigger_set_pub_slug ON public.pubs;
CREATE TRIGGER trigger_set_pub_slug
BEFORE INSERT OR UPDATE ON public.pubs
FOR EACH ROW
WHEN (pg_trigger_depth() = 0)
EXECUTE FUNCTION public.set_pub_slug();

-- Step 6: Force-populate slugs for all existing pubs
UPDATE public.pubs SET name = name;

-- Step 7: Add a unique constraint now that slugs are populated.
-- This might fail if you have duplicate pub names that resolved to the same slug
-- before the uniqueness logic was added. If it fails, you may need to manually
-- fix the duplicate slugs.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'pubs_slug_unique' AND conrelid = 'public.pubs'::regclass
  ) THEN
    ALTER TABLE public.pubs ADD CONSTRAINT pubs_slug_unique UNIQUE (slug);
  END IF;
END;
$$;


-- Step 8: Drop and recreate the pub_summaries view to include the slug
DROP VIEW IF EXISTS pub_summaries;
CREATE OR REPLACE VIEW pub_summaries AS
SELECT
  p.id,
  p.slug,
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
  p.shows__sports,
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
    WHERE pr.pub_id = p.id AND pr.drink_id = 1
  ) as cheapest_guinness,
  (
    SELECT MIN(pr.price)::numeric(5,2)
    FROM prices pr
    WHERE pr.pub_id = p.id AND pr.drink_id IN (2, 3, 4, 10, 11, 12, 13, 14, 15, 16, 17)
  ) as cheapest_lager,
    (
    SELECT MIN(pr.price)::numeric(5,2)
    FROM prices pr
    WHERE pr.pub_id = p.id AND pr.drink_id IN (5, 6, 7)
  ) as cheapest_cider
FROM pubs p;
