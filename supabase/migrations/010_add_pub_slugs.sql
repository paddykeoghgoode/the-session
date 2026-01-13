-- The Session - Add Pub Slugs for SEO-friendly URLs

-- 1. Enable the unaccent extension for handling special characters
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 2. Create the slugify function to generate URL-friendly slugs from text
CREATE OR REPLACE FUNCTION public.slugify(text TEXT)
RETURNS TEXT AS $$
DECLARE
    slug TEXT;
BEGIN
    -- Convert to lowercase and remove accents
    slug := lower(unaccent(text));

    -- Replace non-alphanumeric characters (except hyphens and underscores) with a single hyphen
    slug := regexp_replace(slug, '[^a-z0-9\-_]+', '-', 'gi');

    -- Remove leading and trailing hyphens
    slug := regexp_replace(slug, '(^-+|-+$)', '', 'g');

    -- Replace multiple hyphens with a single hyphen
    slug := regexp_replace(slug, '-+', '-', 'g');

    RETURN slug;
END;
$$ LANGUAGE plpgsql STRICT IMMUTABLE;

-- 3. Add the slug column to the pubs table
-- It can't be unique yet until we populate it
ALTER TABLE public.pubs ADD COLUMN IF NOT EXISTS slug TEXT;

-- 4. Create a function that sets the slug, ensuring uniqueness
CREATE OR REPLACE FUNCTION public.set_pub_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INT := 1;
BEGIN
  -- If name is not changing and slug already exists, do nothing
  IF TG_OP = 'UPDATE' AND NEW.name = OLD.name AND NEW.slug = OLD.slug THEN
    RETURN NEW;
  END IF;

  base_slug := slugify(NEW.name);
  final_slug := base_slug;

  -- Check for conflicts and append a number if necessary
  WHILE EXISTS (SELECT 1 FROM public.pubs WHERE slug = final_slug AND id != NEW.id) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create a trigger to automatically call the function when a pub is created or updated
DROP TRIGGER IF EXISTS trigger_set_pub_slug ON public.pubs;
CREATE TRIGGER trigger_set_pub_slug
BEFORE INSERT OR UPDATE ON public.pubs
FOR EACH ROW
WHEN (pg_trigger_depth() = 0) -- prevent recursive trigger calls
EXECUTE FUNCTION public.set_pub_slug();

-- 6. Run an UPDATE to trigger slug generation for all existing pubs
-- This sets the name to itself, which fires the UPDATE trigger
UPDATE public.pubs SET name = name;

-- 7. Now that all slugs are populated and unique, add the UNIQUE constraint
ALTER TABLE public.pubs ADD CONSTRAINT pubs_slug_unique UNIQUE (slug);
