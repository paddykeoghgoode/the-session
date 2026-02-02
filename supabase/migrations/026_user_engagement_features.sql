-- Migration 026: User Engagement Features
-- Adds user preferences, check-ins, streaks, alerts, pub crawls, and vibes

-- ============================================
-- USER PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  -- Drink preferences (array of drink IDs user cares about)
  favorite_drinks INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  -- Location preferences
  home_latitude DOUBLE PRECISION,
  home_longitude DOUBLE PRECISION,
  default_radius_km DOUBLE PRECISION DEFAULT 2.0,
  -- Notification preferences
  email_weekly_digest BOOLEAN DEFAULT false,
  email_price_alerts BOOLEAN DEFAULT false,
  email_deal_alerts BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT false,
  -- Vibe preferences (array of vibe tags)
  preferred_vibes TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHECK-INS TABLE (with photo proof)
-- ============================================
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pub_id UUID REFERENCES pubs(id) ON DELETE CASCADE NOT NULL,
  -- Check-in details
  verified_price_id UUID REFERENCES prices(id) ON DELETE SET NULL,
  photo_path TEXT, -- Storage path for proof photo
  photo_verified BOOLEAN DEFAULT false,
  notes TEXT,
  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  -- Location verification
  check_in_latitude DOUBLE PRECISION,
  check_in_longitude DOUBLE PRECISION,
  location_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying user check-ins and pub check-ins
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_pub_id ON check_ins(pub_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_created_at ON check_ins(created_at DESC);

-- ============================================
-- PUB STREAKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pub_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pub_id UUID REFERENCES pubs(id) ON DELETE CASCADE NOT NULL,
  current_streak INTEGER DEFAULT 1,
  longest_streak INTEGER DEFAULT 1,
  last_check_in_date DATE NOT NULL,
  streak_started_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pub_id)
);

-- ============================================
-- PRICE ALERTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  -- Alert criteria
  drink_id INTEGER REFERENCES drinks(id) ON DELETE CASCADE,
  max_price DECIMAL(5,2),
  -- Location (optional - if not set, use user preferences)
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 2.0,
  -- Specific pub (optional)
  pub_id UUID REFERENCES pubs(id) ON DELETE CASCADE,
  -- Alert status
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON price_alerts(is_active) WHERE is_active = true;

-- ============================================
-- DEAL ALERTS TABLE (for new deals near you)
-- ============================================
CREATE TABLE IF NOT EXISTS deal_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  price_id UUID REFERENCES prices(id) ON DELETE CASCADE NOT NULL,
  pub_id UUID REFERENCES pubs(id) ON DELETE CASCADE NOT NULL,
  -- Alert details
  alert_type TEXT NOT NULL CHECK (alert_type IN ('new_deal', 'price_drop', 'verified_price')),
  is_read BOOLEAN DEFAULT false,
  is_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deal_alerts_user_id ON deal_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_deal_alerts_unread ON deal_alerts(user_id, is_read) WHERE is_read = false;

-- ============================================
-- PUB CRAWL PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pub_crawls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  -- Route details
  start_latitude DOUBLE PRECISION,
  start_longitude DOUBLE PRECISION,
  -- Settings
  is_public BOOLEAN DEFAULT false,
  estimated_duration_mins INTEGER,
  total_distance_km DOUBLE PRECISION,
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'planned', 'in_progress', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pub crawl stops (ordered list of pubs)
CREATE TABLE IF NOT EXISTS pub_crawl_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crawl_id UUID REFERENCES pub_crawls(id) ON DELETE CASCADE NOT NULL,
  pub_id UUID REFERENCES pubs(id) ON DELETE CASCADE NOT NULL,
  stop_order INTEGER NOT NULL,
  -- Stop details
  planned_drink_id INTEGER REFERENCES drinks(id),
  estimated_spend DECIMAL(5,2),
  notes TEXT,
  -- Progress tracking
  visited BOOLEAN DEFAULT false,
  visited_at TIMESTAMPTZ,
  actual_spend DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pub_crawl_stops_crawl_id ON pub_crawl_stops(crawl_id);

-- ============================================
-- PUB VIBES TABLE (user-contributed tags)
-- ============================================
CREATE TABLE IF NOT EXISTS pub_vibes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pub_id UUID REFERENCES pubs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  vibe TEXT NOT NULL,
  vote_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Predefined vibe options
CREATE TABLE IF NOT EXISTS vibe_options (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('atmosphere', 'crowd', 'style', 'occasion')),
  icon TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Insert predefined vibes
INSERT INTO vibe_options (name, category, icon) VALUES
  -- Atmosphere
  ('cozy', 'atmosphere', '🔥'),
  ('lively', 'atmosphere', '🎉'),
  ('quiet', 'atmosphere', '🤫'),
  ('romantic', 'atmosphere', '💕'),
  ('casual', 'atmosphere', '😎'),
  ('upscale', 'atmosphere', '✨'),
  -- Crowd
  ('locals', 'crowd', '🏠'),
  ('tourists', 'crowd', '🧳'),
  ('students', 'crowd', '📚'),
  ('professionals', 'crowd', '💼'),
  ('mixed-age', 'crowd', '👥'),
  ('young-crowd', 'crowd', '🎓'),
  -- Style
  ('traditional', 'style', '🍀'),
  ('modern', 'style', '🆕'),
  ('hipster', 'style', '🧔'),
  ('sports-bar', 'style', '📺'),
  ('cocktail-bar', 'style', '🍸'),
  ('dive-bar', 'style', '🍺'),
  -- Occasion
  ('first-date', 'occasion', '💝'),
  ('catch-up', 'occasion', '☕'),
  ('celebration', 'occasion', '🎊'),
  ('work-drinks', 'occasion', '🤝'),
  ('solo-drink', 'occasion', '🧘'),
  ('big-group', 'occasion', '👨‍👩‍👧‍👦')
ON CONFLICT (name) DO NOTHING;

-- User vibe votes (upvote/downvote vibes for accuracy)
CREATE TABLE IF NOT EXISTS pub_vibe_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pub_id UUID REFERENCES pubs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vibe TEXT NOT NULL,
  vote BOOLEAN NOT NULL, -- true = agree, false = disagree
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pub_id, user_id, vibe)
);

CREATE INDEX IF NOT EXISTS idx_pub_vibes_pub_id ON pub_vibes(pub_id);
CREATE INDEX IF NOT EXISTS idx_pub_vibe_votes_pub_id ON pub_vibe_votes(pub_id);

-- ============================================
-- WEEKLY DIGEST TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS weekly_digest_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  -- Content snapshot for the email
  digest_data JSONB NOT NULL,
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weekly_digest_pending ON weekly_digest_queue(status, scheduled_for)
  WHERE status = 'pending';

-- ============================================
-- BADGES AND ACHIEVEMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_type TEXT NOT NULL,
  badge_level INTEGER DEFAULT 1,
  -- Context (e.g., which pub for local expert)
  pub_id UUID REFERENCES pubs(id) ON DELETE CASCADE,
  -- Metadata
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- For temporary badges like "verified this week"
  metadata JSONB DEFAULT '{}'::JSONB,
  UNIQUE(user_id, badge_type, pub_id)
);

-- Badge type definitions
CREATE TABLE IF NOT EXISTS badge_types (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT NOT NULL CHECK (category IN ('contribution', 'streak', 'expertise', 'special')),
  is_active BOOLEAN DEFAULT true
);

INSERT INTO badge_types (name, display_name, description, icon, category) VALUES
  ('verified_this_week', 'Verified This Week', 'Verified a price this week', '✓', 'contribution'),
  ('local_expert', 'Local Expert', 'Expert on a specific pub (10+ contributions)', '🏆', 'expertise'),
  ('pub_regular', 'Pub Regular', 'Checked in 5+ times at one pub', '🍺', 'streak'),
  ('streak_7', '7-Day Streak', 'Checked in 7 days in a row', '🔥', 'streak'),
  ('streak_30', '30-Day Streak', 'Checked in 30 days in a row', '⚡', 'streak'),
  ('price_hunter', 'Price Hunter', 'Found 10+ deals', '🎯', 'contribution'),
  ('photo_pro', 'Photo Pro', 'Uploaded 10+ approved photos', '📸', 'contribution'),
  ('early_adopter', 'Early Adopter', 'One of the first 100 users', '🌟', 'special'),
  ('crawl_master', 'Crawl Master', 'Completed 5+ pub crawls', '🗺️', 'special')
ON CONFLICT (name) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_type ON user_badges(badge_type);

-- ============================================
-- PUB RECOMMENDATIONS (if you like this...)
-- ============================================
CREATE TABLE IF NOT EXISTS pub_similarities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pub_id UUID REFERENCES pubs(id) ON DELETE CASCADE NOT NULL,
  similar_pub_id UUID REFERENCES pubs(id) ON DELETE CASCADE NOT NULL,
  similarity_score DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
  -- Reason for similarity
  shared_amenities TEXT[],
  shared_vibes TEXT[],
  similar_price_range BOOLEAN DEFAULT false,
  similar_ratings BOOLEAN DEFAULT false,
  -- Cache management
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pub_id, similar_pub_id),
  CHECK (pub_id != similar_pub_id)
);

CREATE INDEX IF NOT EXISTS idx_pub_similarities_pub_id ON pub_similarities(pub_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- User preferences: users can only see/edit their own
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Check-ins: public view, users can only insert their own
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Check-ins are viewable by all" ON check_ins
  FOR SELECT USING (true);
CREATE POLICY "Users can insert own check-ins" ON check_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Pub streaks: public view
ALTER TABLE pub_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pub streaks are viewable by all" ON pub_streaks
  FOR SELECT USING (true);
CREATE POLICY "Users can manage own streaks" ON pub_streaks
  FOR ALL USING (auth.uid() = user_id);

-- Price alerts: private to user
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own price alerts" ON price_alerts
  FOR ALL USING (auth.uid() = user_id);

-- Deal alerts: private to user
ALTER TABLE deal_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own deal alerts" ON deal_alerts
  FOR ALL USING (auth.uid() = user_id);

-- Pub crawls: public if shared, private otherwise
ALTER TABLE pub_crawls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public crawls viewable by all" ON pub_crawls
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can manage own crawls" ON pub_crawls
  FOR ALL USING (auth.uid() = user_id);

-- Pub crawl stops: follows parent crawl permissions
ALTER TABLE pub_crawl_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Crawl stops viewable with crawl" ON pub_crawl_stops
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pub_crawls
      WHERE id = pub_crawl_stops.crawl_id
      AND (is_public = true OR user_id = auth.uid())
    )
  );
CREATE POLICY "Users can manage own crawl stops" ON pub_crawl_stops
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pub_crawls
      WHERE id = pub_crawl_stops.crawl_id AND user_id = auth.uid()
    )
  );

-- Pub vibes: public view, authenticated insert
ALTER TABLE pub_vibes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vibes are viewable by all" ON pub_vibes
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add vibes" ON pub_vibes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Pub vibe votes: users manage their own
ALTER TABLE pub_vibe_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vibe votes viewable by all" ON pub_vibe_votes
  FOR SELECT USING (true);
CREATE POLICY "Users can manage own vibe votes" ON pub_vibe_votes
  FOR ALL USING (auth.uid() = user_id);

-- User badges: public view
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are viewable by all" ON user_badges
  FOR SELECT USING (true);

-- Pub similarities: public view
ALTER TABLE pub_similarities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Similarities are viewable by all" ON pub_similarities
  FOR SELECT USING (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update user streak on check-in
CREATE OR REPLACE FUNCTION update_pub_streak()
RETURNS TRIGGER AS $$
DECLARE
  existing_streak RECORD;
  yesterday DATE;
BEGIN
  yesterday := CURRENT_DATE - INTERVAL '1 day';

  -- Check for existing streak
  SELECT * INTO existing_streak
  FROM pub_streaks
  WHERE user_id = NEW.user_id AND pub_id = NEW.pub_id;

  IF existing_streak IS NULL THEN
    -- Create new streak
    INSERT INTO pub_streaks (user_id, pub_id, current_streak, longest_streak, last_check_in_date)
    VALUES (NEW.user_id, NEW.pub_id, 1, 1, CURRENT_DATE);
  ELSIF existing_streak.last_check_in_date = yesterday THEN
    -- Continue streak
    UPDATE pub_streaks
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_check_in_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE user_id = NEW.user_id AND pub_id = NEW.pub_id;
  ELSIF existing_streak.last_check_in_date < yesterday THEN
    -- Reset streak
    UPDATE pub_streaks
    SET current_streak = 1,
        last_check_in_date = CURRENT_DATE,
        streak_started_at = NOW(),
        updated_at = NOW()
    WHERE user_id = NEW.user_id AND pub_id = NEW.pub_id;
  END IF;
  -- If same day, do nothing

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update streak on check-in
DROP TRIGGER IF EXISTS trigger_update_pub_streak ON check_ins;
CREATE TRIGGER trigger_update_pub_streak
  AFTER INSERT ON check_ins
  FOR EACH ROW
  EXECUTE FUNCTION update_pub_streak();

-- Function to award badges automatically
CREATE OR REPLACE FUNCTION check_and_award_badges()
RETURNS TRIGGER AS $$
BEGIN
  -- Award "verified this week" badge for price verifications
  IF TG_TABLE_NAME = 'price_verifications' THEN
    INSERT INTO user_badges (user_id, badge_type, expires_at)
    VALUES (NEW.user_id, 'verified_this_week', DATE_TRUNC('week', NOW()) + INTERVAL '1 week')
    ON CONFLICT (user_id, badge_type, pub_id)
    DO UPDATE SET expires_at = DATE_TRUNC('week', NOW()) + INTERVAL '1 week';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for badge awards on price verification
DROP TRIGGER IF EXISTS trigger_award_verification_badge ON price_verifications;
CREATE TRIGGER trigger_award_verification_badge
  AFTER INSERT ON price_verifications
  FOR EACH ROW
  EXECUTE FUNCTION check_and_award_badges();

-- Function to check for local expert badge
CREATE OR REPLACE FUNCTION check_local_expert_badge(p_user_id UUID, p_pub_id UUID)
RETURNS VOID AS $$
DECLARE
  contribution_count INTEGER;
BEGIN
  -- Count contributions (prices + reviews + photos) for this pub
  SELECT
    (SELECT COUNT(*) FROM prices WHERE submitted_by = p_user_id AND pub_id = p_pub_id) +
    (SELECT COUNT(*) FROM reviews WHERE user_id = p_user_id AND pub_id = p_pub_id) +
    (SELECT COUNT(*) FROM pub_photos WHERE user_id = p_user_id AND pub_id = p_pub_id AND is_approved = true)
  INTO contribution_count;

  IF contribution_count >= 10 THEN
    INSERT INTO user_badges (user_id, badge_type, pub_id)
    VALUES (p_user_id, 'local_expert', p_pub_id)
    ON CONFLICT (user_id, badge_type, pub_id) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
