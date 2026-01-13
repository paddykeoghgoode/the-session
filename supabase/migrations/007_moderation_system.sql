-- The Session - Moderation System
-- Adds photo uploads, review moderation, trusted users, and admin controls

-- ============================================
-- PROFILE MODERATION FIELDS
-- ============================================

-- Trusted users get auto-approved for reviews/photos
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_trusted BOOLEAN DEFAULT false;

-- Admin flag for moderation access
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Daily upload tracking (resets daily via cron or on check)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS uploads_today INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS uploads_reset_date DATE DEFAULT CURRENT_DATE;

-- ============================================
-- REVIEW MODERATION
-- ============================================

-- Reviews need approval (unless from trusted users)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS moderation_note TEXT;

-- Index for finding pending reviews
CREATE INDEX IF NOT EXISTS idx_reviews_pending ON reviews(is_approved) WHERE is_approved = false;

-- ============================================
-- PUB PHOTOS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS pub_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pub_id UUID NOT NULL REFERENCES pubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  original_filename TEXT,
  file_size INTEGER NOT NULL, -- in bytes
  width INTEGER,
  height INTEGER,
  caption TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT false, -- Featured photo for pub
  moderation_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pub_photos_pub ON pub_photos(pub_id);
CREATE INDEX IF NOT EXISTS idx_pub_photos_user ON pub_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_pub_photos_pending ON pub_photos(is_approved) WHERE is_approved = false;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE pub_photos ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved photos
CREATE POLICY "Approved photos are viewable by all"
  ON pub_photos FOR SELECT
  USING (is_approved = true);

-- Users can view their own pending photos
CREATE POLICY "Users can view own photos"
  ON pub_photos FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all photos
CREATE POLICY "Admins can view all photos"
  ON pub_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Users can upload photos
CREATE POLICY "Users can upload photos"
  ON pub_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can update photos (for approval)
CREATE POLICY "Admins can update photos"
  ON pub_photos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Users can delete their own pending photos
CREATE POLICY "Users can delete own pending photos"
  ON pub_photos FOR DELETE
  USING (auth.uid() = user_id AND is_approved = false);

-- Admins can delete any photo
CREATE POLICY "Admins can delete any photo"
  ON pub_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to check and increment upload count
CREATE OR REPLACE FUNCTION check_upload_limit(user_uuid UUID, max_daily INTEGER DEFAULT 5)
RETURNS BOOLEAN AS $$
DECLARE
  profile_record RECORD;
BEGIN
  SELECT uploads_today, uploads_reset_date, is_trusted, is_admin
  INTO profile_record
  FROM profiles
  WHERE id = user_uuid;

  -- Reset counter if new day
  IF profile_record.uploads_reset_date < CURRENT_DATE THEN
    UPDATE profiles
    SET uploads_today = 1, uploads_reset_date = CURRENT_DATE
    WHERE id = user_uuid;
    RETURN true;
  END IF;

  -- Admins and trusted users have no limit
  IF profile_record.is_admin OR profile_record.is_trusted THEN
    UPDATE profiles SET uploads_today = uploads_today + 1 WHERE id = user_uuid;
    RETURN true;
  END IF;

  -- Check limit
  IF profile_record.uploads_today >= max_daily THEN
    RETURN false;
  END IF;

  -- Increment counter
  UPDATE profiles SET uploads_today = uploads_today + 1 WHERE id = user_uuid;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-approve for trusted users
CREATE OR REPLACE FUNCTION auto_approve_trusted()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user is trusted
  IF EXISTS (SELECT 1 FROM profiles WHERE id = NEW.user_id AND (is_trusted = true OR is_admin = true)) THEN
    NEW.is_approved := true;
    NEW.approved_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for reviews
DROP TRIGGER IF EXISTS auto_approve_review ON reviews;
CREATE TRIGGER auto_approve_review
  BEFORE INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_trusted();

-- Trigger for photos
DROP TRIGGER IF EXISTS auto_approve_photo ON pub_photos;
CREATE TRIGGER auto_approve_photo
  BEFORE INSERT ON pub_photos
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_trusted();

-- ============================================
-- UPDATE EXISTING REVIEWS
-- ============================================

-- Approve all existing reviews (they're already live)
UPDATE reviews SET is_approved = true WHERE is_approved IS NULL OR is_approved = false;

-- ============================================
-- STORAGE BUCKET (run in Supabase dashboard)
-- ============================================
-- Note: Create a storage bucket called 'pub-photos' in Supabase dashboard
-- with the following policies:
-- - Public read access for approved photos
-- - Authenticated users can upload to their own folder
-- - Max file size: 5MB
-- - Allowed types: image/jpeg, image/png, image/webp
