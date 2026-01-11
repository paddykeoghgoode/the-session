-- Amenity Voting System
-- Allows users to vote on pub amenities (food, music, sports, outdoor)

-- ============================================
-- AMENITY VOTES TABLE
-- ============================================
CREATE TABLE amenity_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pub_id UUID NOT NULL REFERENCES pubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amenity TEXT NOT NULL CHECK (amenity IN ('has_food', 'has_live_music', 'shows_sports', 'has_outdoor_seating')),
  vote BOOLEAN NOT NULL, -- true = yes it has this, false = no it doesn't
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- One vote per user per pub per amenity
  UNIQUE(pub_id, user_id, amenity)
);

-- Index for fast lookups
CREATE INDEX idx_amenity_votes_pub ON amenity_votes(pub_id);
CREATE INDEX idx_amenity_votes_pub_amenity ON amenity_votes(pub_id, amenity);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE amenity_votes ENABLE ROW LEVEL SECURITY;

-- Everyone can read votes
CREATE POLICY "Amenity votes are viewable by everyone" ON amenity_votes
  FOR SELECT USING (true);

-- Authenticated users can insert their own votes
CREATE POLICY "Authenticated users can vote" ON amenity_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes
CREATE POLICY "Users can update their own votes" ON amenity_votes
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete their own votes" ON amenity_votes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTION: Update pub amenity based on votes
-- Auto-updates when there are 3+ votes with >60% agreement
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

-- Trigger to auto-update amenities after votes
CREATE TRIGGER on_amenity_vote
  AFTER INSERT OR UPDATE ON amenity_votes
  FOR EACH ROW EXECUTE FUNCTION update_pub_amenity_from_votes();

-- ============================================
-- VIEW: Get vote summary per pub
-- ============================================
CREATE OR REPLACE VIEW pub_amenity_vote_summary AS
SELECT
  pub_id,
  amenity,
  COUNT(*) as total_votes,
  COUNT(*) FILTER (WHERE vote = true) as yes_votes,
  COUNT(*) FILTER (WHERE vote = false) as no_votes
FROM amenity_votes
GROUP BY pub_id, amenity;
