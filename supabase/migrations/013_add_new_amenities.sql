-- Add new pub amenities: pool, darts, board games, speakeasy

-- ============================================
-- ADD NEW COLUMNS TO PUBS TABLE
-- ============================================
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS has_pool BOOLEAN DEFAULT false;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS has_darts BOOLEAN DEFAULT false;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS has_board_games BOOLEAN DEFAULT false;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS is_speakeasy BOOLEAN DEFAULT false;

-- ============================================
-- UPDATE AMENITY_VOTES CHECK CONSTRAINT
-- ============================================
-- Drop the old constraint
ALTER TABLE amenity_votes DROP CONSTRAINT IF EXISTS amenity_votes_amenity_check;

-- Add new constraint with additional amenities
ALTER TABLE amenity_votes ADD CONSTRAINT amenity_votes_amenity_check
  CHECK (amenity IN (
    'has_food',
    'has_live_music',
    'shows_sports',
    'has_outdoor_seating',
    'has_pool',
    'has_darts',
    'has_board_games',
    'is_speakeasy'
  ));

-- ============================================
-- UPDATE THE TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_pub_amenity_from_votes()
RETURNS TRIGGER AS $$
DECLARE
  vote_count INTEGER;
  yes_count INTEGER;
  vote_ratio FLOAT;
BEGIN
  -- Count total votes and yes votes for this pub/amenity
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE vote = true)
  INTO vote_count, yes_count
  FROM amenity_votes
  WHERE pub_id = NEW.pub_id AND amenity = NEW.amenity;

  -- Only update if we have at least 3 votes
  IF vote_count >= 3 THEN
    vote_ratio := yes_count::FLOAT / vote_count::FLOAT;

    -- Update pub if >60% say yes or >60% say no
    IF vote_ratio > 0.6 THEN
      EXECUTE format('UPDATE pubs SET %I = true WHERE id = $1', NEW.amenity) USING NEW.pub_id;
    ELSIF vote_ratio < 0.4 THEN
      EXECUTE format('UPDATE pubs SET %I = false WHERE id = $1', NEW.amenity) USING NEW.pub_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
