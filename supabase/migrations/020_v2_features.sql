-- V2 Features Migration
-- Adds support for: new amenities, events, pub likes, cream index,
-- price verification, reports, promoted deals, and more

-- ================================
-- 1. NEW AMENITIES ON PUBS
-- ================================

-- Add new amenity columns
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS has_beer_garden BOOLEAN DEFAULT FALSE;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS is_dog_friendly BOOLEAN DEFAULT FALSE;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS is_late_bar BOOLEAN DEFAULT FALSE;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS is_wheelchair_accessible BOOLEAN DEFAULT FALSE;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS has_traditional_music BOOLEAN DEFAULT FALSE;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS has_quiz_night BOOLEAN DEFAULT FALSE;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS has_snug BOOLEAN DEFAULT FALSE;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS is_craft_beer_focused BOOLEAN DEFAULT FALSE;

-- Payment options
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS is_cash_only BOOLEAN DEFAULT FALSE;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS is_card_only BOOLEAN DEFAULT FALSE;

-- ================================
-- 2. PUB LIKES
-- ================================

CREATE TABLE IF NOT EXISTS pub_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pub_id UUID NOT NULL REFERENCES pubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pub_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_pub_likes_pub ON pub_likes(pub_id);
CREATE INDEX IF NOT EXISTS idx_pub_likes_user ON pub_likes(user_id);

-- Add like count to pubs for quick access
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- Function to update like count
CREATE OR REPLACE FUNCTION update_pub_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE pubs SET like_count = like_count + 1 WHERE id = NEW.pub_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE pubs SET like_count = like_count - 1 WHERE id = OLD.pub_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_pub_like_count ON pub_likes;
CREATE TRIGGER trigger_update_pub_like_count
  AFTER INSERT OR DELETE ON pub_likes
  FOR EACH ROW EXECUTE FUNCTION update_pub_like_count();

-- ================================
-- 3. CREAM INDEX (Guinness Quality)
-- ================================

CREATE TABLE IF NOT EXISTS cream_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pub_id UUID NOT NULL REFERENCES pubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creaminess INTEGER CHECK (creaminess >= 1 AND creaminess <= 5),
  temperature INTEGER CHECK (temperature >= 1 AND temperature <= 5),
  stick INTEGER CHECK (stick >= 1 AND stick <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pub_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_cream_ratings_pub ON cream_ratings(pub_id);

-- Add cream score to pubs
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS avg_cream_score DECIMAL(3, 2);
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS cream_rating_count INTEGER DEFAULT 0;

-- Function to update cream score
CREATE OR REPLACE FUNCTION update_pub_cream_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE pubs SET
    avg_cream_score = (
      SELECT AVG((creaminess + temperature + stick) / 3.0)
      FROM cream_ratings WHERE pub_id = COALESCE(NEW.pub_id, OLD.pub_id)
    ),
    cream_rating_count = (
      SELECT COUNT(*) FROM cream_ratings WHERE pub_id = COALESCE(NEW.pub_id, OLD.pub_id)
    )
  WHERE id = COALESCE(NEW.pub_id, OLD.pub_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_cream_score ON cream_ratings;
CREATE TRIGGER trigger_update_cream_score
  AFTER INSERT OR UPDATE OR DELETE ON cream_ratings
  FOR EACH ROW EXECUTE FUNCTION update_pub_cream_score();

-- ================================
-- 4. PRICE VERIFICATION
-- ================================

-- Add verification fields to prices
ALTER TABLE prices ADD COLUMN IF NOT EXISTS verification_count INTEGER DEFAULT 0;
ALTER TABLE prices ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE prices ADD COLUMN IF NOT EXISTS confidence_level TEXT DEFAULT 'low';

-- Verification log
CREATE TABLE IF NOT EXISTS price_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price_id UUID NOT NULL REFERENCES prices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_accurate BOOLEAN NOT NULL,
  new_price DECIMAL(6, 2), -- If is_accurate = false, store suggested price
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(price_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_price_verifications_price ON price_verifications(price_id);

-- Function to update verification count
CREATE OR REPLACE FUNCTION update_price_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_accurate = TRUE THEN
    UPDATE prices SET
      verification_count = verification_count + 1,
      last_verified_at = NOW(),
      confidence_level = CASE
        WHEN verification_count >= 5 THEN 'high'
        WHEN verification_count >= 2 THEN 'medium'
        ELSE 'low'
      END
    WHERE id = NEW.price_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_price_verification ON price_verifications;
CREATE TRIGGER trigger_price_verification
  AFTER INSERT ON price_verifications
  FOR EACH ROW EXECUTE FUNCTION update_price_verification();

-- ================================
-- 5. REPORTS / INACCURACY FLAGS
-- ================================

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'pub', 'price', 'deal', 'review'
  entity_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL, -- 'price_wrong', 'deal_expired', 'pub_closed', 'inappropriate', 'other'
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_entity ON reports(entity_type, entity_id);

-- ================================
-- 6. EVENTS / SESSIONS
-- ================================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pub_id UUID NOT NULL REFERENCES pubs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'trad_session', 'quiz', 'live_music', 'match_day', 'other'
  description TEXT,

  -- Scheduling
  start_time TIME,
  end_time TIME,
  day_of_week TEXT[], -- ['monday', 'wednesday'] for recurring
  specific_date DATE, -- For one-off events
  is_recurring BOOLEAN DEFAULT FALSE,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_pub ON events(pub_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active);

-- ================================
-- 7. ENHANCED DEALS
-- ================================

-- Add new deal fields
ALTER TABLE prices ADD COLUMN IF NOT EXISTS deal_discount_type TEXT; -- 'fixed', 'percentage', 'bundle', 'happy_hour'
ALTER TABLE prices ADD COLUMN IF NOT EXISTS deal_discount_value DECIMAL(6, 2); -- e.g., 20 for 20% off
ALTER TABLE prices ADD COLUMN IF NOT EXISTS deal_target TEXT; -- 'all_pints', 'all_drinks', 'specific'
ALTER TABLE prices ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT FALSE;
ALTER TABLE prices ADD COLUMN IF NOT EXISTS promoted_until TIMESTAMP WITH TIME ZONE;

-- ================================
-- 8. MENU UPLOADS
-- ================================

CREATE TABLE IF NOT EXISTS pub_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pub_id UUID NOT NULL REFERENCES pubs(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  original_filename TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pub_menus_pub ON pub_menus(pub_id);

-- ================================
-- 9. STOUT INDEX (Materialized View)
-- ================================

-- Create a view for Stout Index calculations
CREATE OR REPLACE VIEW stout_index AS
SELECT
  DATE_TRUNC('day', created_at) AS date,
  AVG(price) AS avg_guinness_price,
  COUNT(*) AS sample_size
FROM prices p
JOIN drinks d ON p.drink_id = d.id
WHERE d.name = 'Guinness'
  AND p.is_deal = FALSE
  AND p.created_at >= NOW() - INTERVAL '1 year'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Current stout index
CREATE OR REPLACE VIEW current_stout_index AS
SELECT
  AVG(price) AS current_avg,
  (SELECT AVG(price) FROM prices p
   JOIN drinks d ON p.drink_id = d.id
   WHERE d.name = 'Guinness' AND p.is_deal = FALSE
   AND p.created_at >= NOW() - INTERVAL '1 month'
   AND p.created_at < NOW() - INTERVAL '1 week') AS last_week_avg,
  (SELECT AVG(price) FROM prices p
   JOIN drinks d ON p.drink_id = d.id
   WHERE d.name = 'Guinness' AND p.is_deal = FALSE
   AND p.created_at >= NOW() - INTERVAL '2 months'
   AND p.created_at < NOW() - INTERVAL '1 month') AS last_month_avg,
  COUNT(*) AS sample_size
FROM prices p
JOIN drinks d ON p.drink_id = d.id
WHERE d.name = 'Guinness'
  AND p.is_deal = FALSE
  AND p.created_at >= NOW() - INTERVAL '1 week';

-- ================================
-- 10. PRICE HISTORY VIEW
-- ================================

CREATE OR REPLACE VIEW price_history AS
SELECT
  p.pub_id,
  p.drink_id,
  d.name AS drink_name,
  p.price,
  p.verification_count,
  p.confidence_level,
  p.created_at
FROM prices p
JOIN drinks d ON p.drink_id = d.id
WHERE p.is_deal = FALSE
ORDER BY p.created_at DESC;

-- ================================
-- 11. CONTRIBUTOR STATS
-- ================================

CREATE OR REPLACE VIEW contributor_stats AS
SELECT
  pr.id AS user_id,
  pr.username,
  pr.display_name,
  (SELECT COUNT(*) FROM prices WHERE submitted_by = pr.id AND created_at >= DATE_TRUNC('month', NOW())) AS prices_this_month,
  (SELECT COUNT(*) FROM price_verifications WHERE user_id = pr.id AND created_at >= DATE_TRUNC('month', NOW())) AS verifications_this_month,
  (SELECT COUNT(*) FROM reviews WHERE user_id = pr.id AND created_at >= DATE_TRUNC('month', NOW())) AS reviews_this_month,
  (SELECT COUNT(*) FROM pub_photos WHERE user_id = pr.id AND created_at >= DATE_TRUNC('month', NOW())) AS photos_this_month,
  pr.total_contributions
FROM profiles pr
WHERE pr.total_contributions > 0
ORDER BY (
  (SELECT COUNT(*) FROM prices WHERE submitted_by = pr.id AND created_at >= DATE_TRUNC('month', NOW())) +
  (SELECT COUNT(*) FROM price_verifications WHERE user_id = pr.id AND created_at >= DATE_TRUNC('month', NOW())) +
  (SELECT COUNT(*) FROM reviews WHERE user_id = pr.id AND created_at >= DATE_TRUNC('month', NOW()))
) DESC;

-- ================================
-- 12. RLS POLICIES
-- ================================

-- Pub Likes
ALTER TABLE pub_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON pub_likes FOR SELECT USING (true);
CREATE POLICY "Users can like pubs" ON pub_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike pubs" ON pub_likes FOR DELETE USING (auth.uid() = user_id);

-- Cream Ratings
ALTER TABLE cream_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cream ratings" ON cream_ratings FOR SELECT USING (true);
CREATE POLICY "Users can add cream ratings" ON cream_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cream ratings" ON cream_ratings FOR UPDATE USING (auth.uid() = user_id);

-- Price Verifications
ALTER TABLE price_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verifications" ON price_verifications FOR SELECT USING (true);
CREATE POLICY "Users can verify prices" ON price_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit reports" ON reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can view reports" ON reports FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update reports" ON reports FOR UPDATE USING (is_admin(auth.uid()));

-- Events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active events" ON events FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage events" ON events FOR ALL USING (is_admin(auth.uid()));

-- Pub Menus
ALTER TABLE pub_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved menus" ON pub_menus FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "Users can upload menus" ON pub_menus FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage menus" ON pub_menus FOR ALL USING (is_admin(auth.uid()));

-- ================================
-- 13. COMMENTS
-- ================================

COMMENT ON TABLE pub_likes IS 'Stores user likes for pubs (social signal only, does not affect rankings)';
COMMENT ON TABLE cream_ratings IS 'Guinness quality ratings: creaminess, temperature, stick';
COMMENT ON TABLE price_verifications IS 'User confirmations of price accuracy';
COMMENT ON TABLE reports IS 'User-submitted reports for inaccurate data';
COMMENT ON TABLE events IS 'Pub events: trad sessions, quizzes, live music, etc.';
COMMENT ON TABLE pub_menus IS 'Uploaded drink/food menu images';
COMMENT ON VIEW stout_index IS 'Daily average Guinness prices for The Stout Index feature';
COMMENT ON VIEW current_stout_index IS 'Current week Stout Index with comparison to previous periods';
