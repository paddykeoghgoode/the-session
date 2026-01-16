-- OSM Import Staging Table and Upsert Logic
-- This migration creates infrastructure for importing pub data from OpenStreetMap

-- Create staging table for OSM imports
CREATE TABLE IF NOT EXISTS osm_pubs_staging (
  id SERIAL PRIMARY KEY,
  osm_id TEXT NOT NULL,
  name TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lon DECIMAL(11, 8) NOT NULL,
  amenity TEXT,

  -- Address components
  addr_housenumber TEXT,
  addr_street TEXT,
  addr_city TEXT,
  addr_postcode TEXT,

  -- Contact info
  email TEXT,
  phone TEXT,
  website TEXT,

  -- Social
  facebook TEXT,
  instagram TEXT,
  twitter TEXT,

  -- Additional URLs
  booking_url TEXT,
  menu_url TEXT,

  -- OSM metadata
  opening_hours TEXT,
  wheelchair TEXT,
  alt_name TEXT,
  cuisine TEXT,
  real_ale TEXT,
  outdoor_seating TEXT,
  food TEXT,

  -- Store all tags for reference
  all_tags JSONB,

  -- Import tracking
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,

  -- Prevent duplicate imports
  UNIQUE(osm_id)
);

-- Create index for efficient processing
CREATE INDEX IF NOT EXISTS idx_osm_staging_processed ON osm_pubs_staging(processed);
CREATE INDEX IF NOT EXISTS idx_osm_staging_osm_id ON osm_pubs_staging(osm_id);

-- Function to upsert OSM data into pubs table
CREATE OR REPLACE FUNCTION upsert_osm_pubs()
RETURNS INTEGER AS $$
DECLARE
  rows_affected INTEGER := 0;
  staging_row osm_pubs_staging%ROWTYPE;
BEGIN
  FOR staging_row IN
    SELECT * FROM osm_pubs_staging WHERE processed = FALSE
  LOOP
    INSERT INTO pubs (
      name,
      address,
      latitude,
      longitude,
      source,
      source_id,
      amenity,
      email,
      phone,
      website,
      facebook,
      instagram,
      twitter,
      booking_url,
      menu_url,
      opening_hours_raw,
      wheelchair,
      alt_name,
      osm_tags,
      outdoor_seating,
      serves_food,
      slug
    ) VALUES (
      staging_row.name,
      COALESCE(
        NULLIF(CONCAT_WS(', ',
          NULLIF(CONCAT_WS(' ', staging_row.addr_housenumber, staging_row.addr_street), ''),
          staging_row.addr_city,
          staging_row.addr_postcode
        ), ''),
        'Dublin, Ireland'
      ),
      staging_row.lat,
      staging_row.lon,
      'osm',
      staging_row.osm_id,
      staging_row.amenity,
      staging_row.email,
      staging_row.phone,
      staging_row.website,
      staging_row.facebook,
      staging_row.instagram,
      staging_row.twitter,
      staging_row.booking_url,
      staging_row.menu_url,
      staging_row.opening_hours,
      staging_row.wheelchair,
      staging_row.alt_name,
      staging_row.all_tags,
      COALESCE(staging_row.outdoor_seating = 'yes', FALSE),
      COALESCE(staging_row.food = 'yes' OR staging_row.cuisine IS NOT NULL, FALSE),
      -- Generate slug from name
      LOWER(REGEXP_REPLACE(REGEXP_REPLACE(staging_row.name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
    )
    ON CONFLICT (source_id) WHERE source_id IS NOT NULL
    DO UPDATE SET
      -- Only update if the OSM data has values (preserve manual edits)
      name = COALESCE(EXCLUDED.name, pubs.name),
      address = COALESCE(NULLIF(EXCLUDED.address, 'Dublin, Ireland'), pubs.address),
      latitude = COALESCE(EXCLUDED.latitude, pubs.latitude),
      longitude = COALESCE(EXCLUDED.longitude, pubs.longitude),
      email = COALESCE(EXCLUDED.email, pubs.email),
      phone = COALESCE(EXCLUDED.phone, pubs.phone),
      website = COALESCE(EXCLUDED.website, pubs.website),
      facebook = COALESCE(EXCLUDED.facebook, pubs.facebook),
      instagram = COALESCE(EXCLUDED.instagram, pubs.instagram),
      twitter = COALESCE(EXCLUDED.twitter, pubs.twitter),
      booking_url = COALESCE(EXCLUDED.booking_url, pubs.booking_url),
      menu_url = COALESCE(EXCLUDED.menu_url, pubs.menu_url),
      opening_hours_raw = COALESCE(EXCLUDED.opening_hours_raw, pubs.opening_hours_raw),
      wheelchair = COALESCE(EXCLUDED.wheelchair, pubs.wheelchair),
      alt_name = COALESCE(EXCLUDED.alt_name, pubs.alt_name),
      osm_tags = COALESCE(EXCLUDED.osm_tags, pubs.osm_tags),
      outdoor_seating = COALESCE(EXCLUDED.outdoor_seating, pubs.outdoor_seating),
      serves_food = COALESCE(EXCLUDED.serves_food, pubs.serves_food),
      updated_at = NOW();

    -- Mark as processed
    UPDATE osm_pubs_staging SET processed = TRUE WHERE id = staging_row.id;
    rows_affected := rows_affected + 1;
  END LOOP;

  RETURN rows_affected;
END;
$$ LANGUAGE plpgsql;

-- Add unique constraint on source_id for upsert to work
-- First, drop if exists to allow re-running migration
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pubs_source_id_unique'
  ) THEN
    ALTER TABLE pubs ADD CONSTRAINT pubs_source_id_unique UNIQUE (source_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Comments for documentation
COMMENT ON TABLE osm_pubs_staging IS 'Staging table for OpenStreetMap pub imports. Data is inserted here first, then processed into the main pubs table using upsert_osm_pubs()';
COMMENT ON FUNCTION upsert_osm_pubs() IS 'Processes staged OSM data into pubs table. Uses COALESCE to preserve existing manual data while backfilling from OSM.';
