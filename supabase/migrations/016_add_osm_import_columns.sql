-- Add OSM import columns to pubs table
-- These columns allow importing pub data from OpenStreetMap and storing additional metadata

-- OSM source identification
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS source_id TEXT;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Contact information
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS website TEXT;

-- Social media links
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS facebook TEXT;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS twitter TEXT;

-- Additional URLs
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS booking_url TEXT;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS menu_url TEXT;

-- OSM specific data
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS amenity TEXT;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS opening_hours_raw TEXT;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS wheelchair TEXT;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS alt_name TEXT;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS osm_tags JSONB;

-- Create index on source_id for efficient lookup during upserts
CREATE INDEX IF NOT EXISTS idx_pubs_source_id ON pubs(source_id);

-- Add comment explaining source values
COMMENT ON COLUMN pubs.source IS 'Source of the pub data: manual (user submitted), osm (OpenStreetMap import)';
COMMENT ON COLUMN pubs.source_id IS 'External source identifier, e.g., OSM node ID like node/12345678';
COMMENT ON COLUMN pubs.opening_hours_raw IS 'Raw OpenStreetMap opening_hours format string';
COMMENT ON COLUMN pubs.osm_tags IS 'Additional OSM tags stored as JSONB for future use';
