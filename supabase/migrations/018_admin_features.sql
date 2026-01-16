-- Admin Features Migration
-- Adds activation toggle, audit logging, duplicate detection, completeness scoring, and soft moderation flags

-- ================================
-- 1. PUB ACTIVATION & SOFT MODERATION
-- ================================

-- Add is_active flag (defaults to true for existing pubs)
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Soft moderation status for pubs
-- Values: 'active', 'temporarily_closed', 'renovating', 'members_only', 'permanently_closed'
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'active';

-- Deactivation tracking
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS deactivated_by UUID REFERENCES auth.users(id);
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS deactivation_reason TEXT;

-- Index for filtering active pubs
CREATE INDEX IF NOT EXISTS idx_pubs_is_active ON pubs(is_active);
CREATE INDEX IF NOT EXISTS idx_pubs_moderation_status ON pubs(moderation_status);

-- ================================
-- 2. AUDIT LOG TABLE
-- ================================

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'pub', 'price', 'deal', 'review', 'photo'
  entity_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'activate', 'deactivate'
  user_id UUID REFERENCES auth.users(id),
  changes JSONB, -- Stores old_values and new_values
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

-- ================================
-- 3. DUPLICATE DETECTION
-- ================================

-- Table to track potential duplicates
CREATE TABLE IF NOT EXISTS pub_duplicates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pub_id_1 UUID NOT NULL REFERENCES pubs(id) ON DELETE CASCADE,
  pub_id_2 UUID NOT NULL REFERENCES pubs(id) ON DELETE CASCADE,
  similarity_score DECIMAL(5, 4), -- 0.0000 to 1.0000
  distance_meters INTEGER,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed_duplicate', 'not_duplicate', 'merged'
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pub_id_1, pub_id_2)
);

CREATE INDEX IF NOT EXISTS idx_pub_duplicates_status ON pub_duplicates(status);

-- Function to detect potential duplicates
CREATE OR REPLACE FUNCTION detect_pub_duplicates(
  p_pub_id UUID,
  p_distance_threshold_meters INTEGER DEFAULT 100,
  p_name_similarity_threshold DECIMAL DEFAULT 0.6
)
RETURNS TABLE(
  duplicate_pub_id UUID,
  duplicate_name TEXT,
  distance_meters INTEGER,
  name_similarity DECIMAL
) AS $$
DECLARE
  source_pub RECORD;
BEGIN
  -- Get the source pub
  SELECT id, name, latitude, longitude INTO source_pub
  FROM pubs WHERE id = p_pub_id;

  IF source_pub IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.name,
    CAST(
      6371000 * 2 * ASIN(SQRT(
        POWER(SIN(RADIANS(p.latitude - source_pub.latitude) / 2), 2) +
        COS(RADIANS(source_pub.latitude)) * COS(RADIANS(p.latitude)) *
        POWER(SIN(RADIANS(p.longitude - source_pub.longitude) / 2), 2)
      ))
    AS INTEGER) AS distance_meters,
    similarity(LOWER(p.name), LOWER(source_pub.name)) AS name_similarity
  FROM pubs p
  WHERE p.id != source_pub.id
    AND p.latitude IS NOT NULL
    AND p.longitude IS NOT NULL
    AND 6371000 * 2 * ASIN(SQRT(
      POWER(SIN(RADIANS(p.latitude - source_pub.latitude) / 2), 2) +
      COS(RADIANS(source_pub.latitude)) * COS(RADIANS(p.latitude)) *
      POWER(SIN(RADIANS(p.longitude - source_pub.longitude) / 2), 2)
    )) <= p_distance_threshold_meters
  ORDER BY distance_meters ASC, name_similarity DESC;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- 4. COMPLETENESS SCORING
-- ================================

-- Function to calculate pub completeness score
CREATE OR REPLACE FUNCTION calculate_pub_completeness(p_pub_id UUID)
RETURNS TABLE(
  score INTEGER,
  missing_fields TEXT[]
) AS $$
DECLARE
  pub_record RECORD;
  missing TEXT[] := '{}';
  total_points INTEGER := 0;
  max_points INTEGER := 100;
BEGIN
  SELECT * INTO pub_record FROM pubs WHERE id = p_pub_id;

  IF pub_record IS NULL THEN
    RETURN QUERY SELECT 0, ARRAY['Pub not found'];
    RETURN;
  END IF;

  -- Basic info (30 points)
  IF pub_record.name IS NOT NULL AND pub_record.name != '' THEN
    total_points := total_points + 10;
  ELSE
    missing := array_append(missing, 'name');
  END IF;

  IF pub_record.address IS NOT NULL AND pub_record.address != '' THEN
    total_points := total_points + 10;
  ELSE
    missing := array_append(missing, 'address');
  END IF;

  IF pub_record.latitude IS NOT NULL AND pub_record.longitude IS NOT NULL THEN
    total_points := total_points + 10;
  ELSE
    missing := array_append(missing, 'coordinates');
  END IF;

  -- Contact info (20 points)
  IF pub_record.phone IS NOT NULL THEN
    total_points := total_points + 10;
  ELSE
    missing := array_append(missing, 'phone');
  END IF;

  IF pub_record.website IS NOT NULL THEN
    total_points := total_points + 10;
  ELSE
    missing := array_append(missing, 'website');
  END IF;

  -- Opening hours (15 points)
  IF pub_record.hours_monday_open IS NOT NULL THEN
    total_points := total_points + 15;
  ELSE
    missing := array_append(missing, 'opening_hours');
  END IF;

  -- Prices (20 points) - check if pub has any prices
  IF EXISTS (SELECT 1 FROM prices WHERE pub_id = p_pub_id AND is_deal = FALSE LIMIT 1) THEN
    total_points := total_points + 20;
  ELSE
    missing := array_append(missing, 'prices');
  END IF;

  -- Photos (10 points)
  IF EXISTS (SELECT 1 FROM pub_photos WHERE pub_id = p_pub_id AND is_approved = TRUE LIMIT 1) THEN
    total_points := total_points + 10;
  ELSE
    missing := array_append(missing, 'photos');
  END IF;

  -- Recency bonus (5 points) - updated in last 30 days
  IF EXISTS (SELECT 1 FROM prices WHERE pub_id = p_pub_id AND created_at > NOW() - INTERVAL '30 days' LIMIT 1) THEN
    total_points := total_points + 5;
  ELSE
    missing := array_append(missing, 'recent_activity');
  END IF;

  RETURN QUERY SELECT total_points, missing;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- 5. UPDATE PUB_SUMMARIES VIEW
-- ================================

-- Drop and recreate to add new fields
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
  p.has_food,
  p.has_outdoor_seating,
  p.shows_sports,
  p.has_live_music,
  p.has_pool,
  p.has_darts,
  p.has_board_games,
  p.is_speakeasy,
  p.is_permanently_closed,
  p.is_active,
  p.moderation_status,
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
  (SELECT MIN(pr.price) FROM prices pr
   JOIN drinks d ON pr.drink_id = d.id
   WHERE pr.pub_id = p.id AND d.name = 'Guinness' AND pr.is_deal = FALSE) AS cheapest_guinness,
  (SELECT MIN(pr.price) FROM prices pr
   JOIN drinks d ON pr.drink_id = d.id
   WHERE pr.pub_id = p.id AND d.category = 'beer' AND d.name != 'Guinness' AND pr.is_deal = FALSE) AS cheapest_lager,
  (SELECT MIN(pr.price) FROM prices pr
   JOIN drinks d ON pr.drink_id = d.id
   WHERE pr.pub_id = p.id AND d.category = 'cider' AND pr.is_deal = FALSE) AS cheapest_cider
FROM pubs p
WHERE p.is_active = TRUE AND p.moderation_status = 'active';

-- ================================
-- 6. HELPER FUNCTION FOR ADMIN CHECK
-- ================================

CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = p_user_id AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- 7. AUDIT TRIGGER FUNCTION
-- ================================

CREATE OR REPLACE FUNCTION audit_pub_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (entity_type, entity_id, action, user_id, changes)
    VALUES (
      'pub',
      NEW.id,
      'update',
      auth.uid(),
      jsonb_build_object(
        'old', to_jsonb(OLD),
        'new', to_jsonb(NEW)
      )
    );
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (entity_type, entity_id, action, user_id, changes)
    VALUES ('pub', NEW.id, 'create', auth.uid(), jsonb_build_object('new', to_jsonb(NEW)));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for pub changes
DROP TRIGGER IF EXISTS audit_pub_trigger ON pubs;
CREATE TRIGGER audit_pub_trigger
  AFTER INSERT OR UPDATE ON pubs
  FOR EACH ROW EXECUTE FUNCTION audit_pub_changes();

-- ================================
-- 8. ROW LEVEL SECURITY
-- ================================

-- Enable RLS on audit_log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON audit_log
  FOR SELECT USING (is_admin(auth.uid()));

-- Only admins can insert audit logs manually
CREATE POLICY "Admins can insert audit logs" ON audit_log
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- Enable RLS on pub_duplicates
ALTER TABLE pub_duplicates ENABLE ROW LEVEL SECURITY;

-- Only admins can manage duplicates
CREATE POLICY "Admins can manage duplicates" ON pub_duplicates
  FOR ALL USING (is_admin(auth.uid()));

-- ================================
-- 9. COMMENTS
-- ================================

COMMENT ON COLUMN pubs.is_active IS 'Whether the pub is visible to public users. Deactivated pubs are only visible to admins.';
COMMENT ON COLUMN pubs.moderation_status IS 'Soft moderation status: active, temporarily_closed, renovating, members_only, permanently_closed';
COMMENT ON TABLE audit_log IS 'Tracks all changes to pubs, prices, deals, reviews, and photos for accountability';
COMMENT ON TABLE pub_duplicates IS 'Tracks potential duplicate pub entries for admin review';
COMMENT ON FUNCTION calculate_pub_completeness IS 'Returns completeness score (0-100) and list of missing fields for a pub';
COMMENT ON FUNCTION is_admin IS 'Returns TRUE if the given user_id has admin role';
