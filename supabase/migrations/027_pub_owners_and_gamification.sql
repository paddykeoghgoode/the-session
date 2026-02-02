-- Migration 027: Pub Owners, Points System, Drink Suggestions, and Spirits
-- Adds verified pub owners, gamification, and user-suggested drinks

-- ============================================
-- PUB OWNERSHIP CLAIMS
-- ============================================
CREATE TABLE IF NOT EXISTS pub_ownership_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pub_id UUID REFERENCES pubs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  -- Claim details
  business_email TEXT NOT NULL,
  business_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'staff')),
  verification_code TEXT,
  verification_sent_at TIMESTAMPTZ,
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'email_sent', 'verified', 'approved', 'rejected')),
  verified_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pub_id, user_id)
);

-- Verified pub owners (after approval)
CREATE TABLE IF NOT EXISTS pub_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pub_id UUID REFERENCES pubs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'staff')),
  -- Permissions
  can_edit_info BOOLEAN DEFAULT true,
  can_add_prices BOOLEAN DEFAULT true,
  can_add_deals BOOLEAN DEFAULT true,
  can_add_events BOOLEAN DEFAULT true,
  can_respond_reviews BOOLEAN DEFAULT true,
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pub_id, user_id)
);

-- Add verified_owner flag to pubs table
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS has_verified_owner BOOLEAN DEFAULT false;
ALTER TABLE pubs ADD COLUMN IF NOT EXISTS owner_verified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_pub_owners_pub_id ON pub_owners(pub_id);
CREATE INDEX IF NOT EXISTS idx_pub_owners_user_id ON pub_owners(user_id);

-- ============================================
-- POINTS AND GAMIFICATION SYSTEM
-- ============================================

-- Points ledger (every point-earning action)
CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  -- Points details
  points INTEGER NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'price_submit', 'price_verified', 'review_submit', 'review_helpful',
    'photo_submit', 'photo_approved', 'check_in', 'check_in_verified',
    'first_price_pub', 'streak_bonus', 'deal_found', 'referral',
    'badge_earned', 'daily_login', 'profile_complete'
  )),
  -- Reference to what earned the points
  reference_type TEXT, -- 'price', 'review', 'photo', 'check_in', etc.
  reference_id UUID,
  -- Metadata
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_created_at ON user_points(created_at DESC);

-- Points configuration
CREATE TABLE IF NOT EXISTS points_config (
  action_type TEXT PRIMARY KEY,
  points INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Insert default point values
INSERT INTO points_config (action_type, points, description) VALUES
  ('price_submit', 10, 'Submit a new price'),
  ('price_verified', 5, 'Your price was verified by another user'),
  ('review_submit', 15, 'Submit a review'),
  ('review_helpful', 3, 'Your review was marked helpful'),
  ('photo_submit', 5, 'Upload a photo'),
  ('photo_approved', 10, 'Your photo was approved'),
  ('check_in', 5, 'Check in at a pub'),
  ('check_in_verified', 10, 'Location-verified check-in'),
  ('first_price_pub', 25, 'First person to add price at a pub'),
  ('streak_bonus', 20, 'Maintain a 7-day streak'),
  ('deal_found', 15, 'Report a new deal'),
  ('referral', 50, 'Refer a friend who signs up'),
  ('badge_earned', 10, 'Earn a new badge'),
  ('daily_login', 2, 'Daily login bonus'),
  ('profile_complete', 20, 'Complete your profile')
ON CONFLICT (action_type) DO NOTHING;

-- Add total_points to profiles for quick access
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS points_this_month INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_rank INTEGER;

-- Monthly leaderboard snapshot
CREATE TABLE IF NOT EXISTS monthly_leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  -- Stats
  total_points INTEGER NOT NULL,
  prices_submitted INTEGER DEFAULT 0,
  reviews_submitted INTEGER DEFAULT 0,
  photos_submitted INTEGER DEFAULT 0,
  check_ins INTEGER DEFAULT 0,
  -- Rank
  rank INTEGER,
  -- Prize info
  prize_won TEXT,
  prize_claimed BOOLEAN DEFAULT false,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(year, month, user_id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_leaderboards_rank ON monthly_leaderboards(year, month, rank);

-- ============================================
-- DRINK SUGGESTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS drink_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Suggestion details
  drink_name TEXT NOT NULL,
  drink_category TEXT NOT NULL CHECK (drink_category IN ('beer', 'cider', 'stout', 'lager', 'ale', 'spirit', 'cocktail', 'wine', 'soft_drink', 'other')),
  brand TEXT,
  description TEXT,
  -- For spirits/cocktails
  base_spirit TEXT, -- vodka, gin, rum, whiskey, etc.
  mixer TEXT, -- coke, tonic, red bull, etc.
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'duplicate')),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  -- If approved, link to created drink
  created_drink_id INTEGER REFERENCES drinks(id),
  -- Metadata
  votes INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User votes on drink suggestions
CREATE TABLE IF NOT EXISTS drink_suggestion_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID REFERENCES drink_suggestions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(suggestion_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_drink_suggestions_status ON drink_suggestions(status);

-- ============================================
-- ADD SPIRITS AND COCKTAILS TO DRINKS
-- ============================================

-- Add category column to drinks if not exists
ALTER TABLE drinks ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'beer';
ALTER TABLE drinks ADD COLUMN IF NOT EXISTS base_spirit TEXT;
ALTER TABLE drinks ADD COLUMN IF NOT EXISTS mixer TEXT;
ALTER TABLE drinks ADD COLUMN IF NOT EXISTS is_shot BOOLEAN DEFAULT false;
ALTER TABLE drinks ADD COLUMN IF NOT EXISTS typical_price_min DECIMAL(5,2);
ALTER TABLE drinks ADD COLUMN IF NOT EXISTS typical_price_max DECIMAL(5,2);

-- Insert spirits and cocktails
INSERT INTO drinks (name, category, base_spirit, mixer, is_shot, typical_price_min, typical_price_max) VALUES
  -- Vodka drinks
  ('Vodka & Coke', 'spirit', 'vodka', 'coke', false, 6.00, 9.00),
  ('Vodka & Red Bull', 'spirit', 'vodka', 'red_bull', false, 8.00, 12.00),
  ('Vodka Soda', 'spirit', 'vodka', 'soda_water', false, 6.00, 9.00),
  ('Vodka & Dash', 'spirit', 'vodka', 'dash', false, 6.00, 8.00),

  -- Gin drinks
  ('Gin & Tonic', 'spirit', 'gin', 'tonic', false, 7.00, 12.00),
  ('Gordon''s G&T', 'spirit', 'gin', 'tonic', false, 7.00, 10.00),
  ('Hendrick''s G&T', 'spirit', 'gin', 'tonic', false, 10.00, 14.00),

  -- Rum drinks
  ('Rum & Coke', 'spirit', 'rum', 'coke', false, 6.00, 9.00),
  ('Bacardi & Coke', 'spirit', 'rum', 'coke', false, 6.50, 9.50),
  ('Captain Morgan & Coke', 'spirit', 'rum', 'coke', false, 6.50, 9.50),

  -- Whiskey drinks
  ('Whiskey & Ginger', 'spirit', 'whiskey', 'ginger_ale', false, 7.00, 10.00),
  ('Jameson & Ginger', 'spirit', 'whiskey', 'ginger_ale', false, 7.50, 11.00),
  ('Jack & Coke', 'spirit', 'whiskey', 'coke', false, 7.50, 11.00),

  -- Cocktails
  ('Aperol Spritz', 'cocktail', 'aperol', 'prosecco', false, 9.00, 14.00),
  ('Espresso Martini', 'cocktail', 'vodka', 'coffee', false, 10.00, 15.00),
  ('Mojito', 'cocktail', 'rum', 'lime_soda', false, 10.00, 14.00),
  ('Long Island Iced Tea', 'cocktail', 'mixed', 'coke', false, 12.00, 16.00),
  ('Pornstar Martini', 'cocktail', 'vodka', 'passion_fruit', false, 11.00, 15.00),
  ('Cosmopolitan', 'cocktail', 'vodka', 'cranberry', false, 10.00, 14.00),
  ('Margarita', 'cocktail', 'tequila', 'lime', false, 10.00, 14.00),
  ('Pina Colada', 'cocktail', 'rum', 'coconut', false, 10.00, 14.00),
  ('Sex on the Beach', 'cocktail', 'vodka', 'mixed', false, 10.00, 14.00),

  -- Shots
  ('Jägerbomb', 'spirit', 'jagermeister', 'red_bull', true, 7.00, 10.00),
  ('Baby Guinness', 'spirit', 'kahlua', 'baileys', true, 5.00, 8.00),
  ('Tequila Shot', 'spirit', 'tequila', null, true, 5.00, 8.00),
  ('Sambuca Shot', 'spirit', 'sambuca', null, true, 5.00, 8.00),
  ('Fireball Shot', 'spirit', 'fireball', null, true, 5.00, 8.00),

  -- Wine
  ('House Red Wine (glass)', 'wine', null, null, false, 6.00, 10.00),
  ('House White Wine (glass)', 'wine', null, null, false, 6.00, 10.00),
  ('Prosecco (glass)', 'wine', null, null, false, 7.00, 11.00),

  -- Non-alcoholic
  ('Heineken 0.0', 'soft_drink', null, null, false, 4.50, 6.50),
  ('Guinness 0.0', 'soft_drink', null, null, false, 4.50, 6.50)
ON CONFLICT DO NOTHING;

-- Update existing drinks with categories
UPDATE drinks SET category = 'stout' WHERE name ILIKE '%guinness%' AND category = 'beer';
UPDATE drinks SET category = 'lager' WHERE name ILIKE '%heineken%' OR name ILIKE '%carlsberg%' OR name ILIKE '%budweiser%';
UPDATE drinks SET category = 'cider' WHERE name ILIKE '%cider%' OR name ILIKE '%bulmers%' OR name ILIKE '%orchard%';

-- ============================================
-- REFERRAL SYSTEM
-- ============================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referral_code TEXT NOT NULL,
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  completed_at TIMESTAMPTZ,
  rewarded_at TIMESTAMPTZ,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referred_id)
);

-- Add referral code to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id);

-- Generate referral codes for existing users
UPDATE profiles
SET referral_code = UPPER(SUBSTRING(MD5(id::text || 'session') FROM 1 FOR 8))
WHERE referral_code IS NULL;

-- ============================================
-- ADVERTISING / FEATURED LISTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS ad_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Contact info
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  -- Interest
  ad_type TEXT NOT NULL CHECK (ad_type IN ('featured_deal', 'sponsored_listing', 'banner_ad', 'pub_promotion', 'event_promotion')),
  message TEXT,
  budget_range TEXT,
  -- Related pub (optional)
  pub_id UUID REFERENCES pubs(id),
  -- Status
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'negotiating', 'active', 'completed', 'declined')),
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Featured/sponsored content
CREATE TABLE IF NOT EXISTS featured_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Content type
  content_type TEXT NOT NULL CHECK (content_type IN ('pub', 'deal', 'event', 'banner')),
  pub_id UUID REFERENCES pubs(id),
  price_id UUID REFERENCES prices(id),
  -- Display settings
  title TEXT,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  -- Placement
  placement TEXT NOT NULL CHECK (placement IN ('deals_page', 'homepage', 'search_results', 'pub_page', 'leaderboard')),
  priority INTEGER DEFAULT 0,
  -- Schedule
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  -- Tracking
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  -- Status
  is_active BOOLEAN DEFAULT true,
  -- Billing
  cost_per_day DECIMAL(8,2),
  total_cost DECIMAL(8,2),
  paid BOOLEAN DEFAULT false,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_featured_content_active ON featured_content(is_active, placement, start_date, end_date);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Pub ownership claims
ALTER TABLE pub_ownership_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own claims" ON pub_ownership_claims
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create claims" ON pub_ownership_claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all claims" ON pub_ownership_claims
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Pub owners
ALTER TABLE pub_owners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pub owners viewable by all" ON pub_owners
  FOR SELECT USING (true);
CREATE POLICY "Only admins can manage pub owners" ON pub_owners
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- User points
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points" ON user_points
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Points are viewable by all" ON user_points
  FOR SELECT USING (true);

-- Drink suggestions
ALTER TABLE drink_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Suggestions viewable by all" ON drink_suggestions
  FOR SELECT USING (true);
CREATE POLICY "Users can create suggestions" ON drink_suggestions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ad inquiries
ALTER TABLE ad_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create ad inquiry" ON ad_inquiries
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view inquiries" ON ad_inquiries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Featured content
ALTER TABLE featured_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Featured content viewable by all" ON featured_content
  FOR SELECT USING (is_active = true AND start_date <= NOW() AND end_date >= NOW());

-- ============================================
-- FUNCTIONS FOR POINTS
-- ============================================

-- Function to award points
CREATE OR REPLACE FUNCTION award_points(
  p_user_id UUID,
  p_action_type TEXT,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_points INTEGER;
BEGIN
  -- Get points for this action
  SELECT points INTO v_points
  FROM points_config
  WHERE action_type = p_action_type AND is_active = true;

  IF v_points IS NULL THEN
    RETURN 0;
  END IF;

  -- Insert points record
  INSERT INTO user_points (user_id, points, action_type, reference_type, reference_id, description)
  VALUES (p_user_id, v_points, p_action_type, p_reference_type, p_reference_id, p_description);

  -- Update profile totals
  UPDATE profiles
  SET total_points = COALESCE(total_points, 0) + v_points,
      points_this_month = COALESCE(points_this_month, 0) + v_points
  WHERE id = p_user_id;

  RETURN v_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to award points on price submission
CREATE OR REPLACE FUNCTION trigger_award_price_points()
RETURNS TRIGGER AS $$
DECLARE
  is_first_price BOOLEAN;
BEGIN
  -- Check if this is the first price for this pub
  SELECT NOT EXISTS (
    SELECT 1 FROM prices
    WHERE pub_id = NEW.pub_id
    AND id != NEW.id
  ) INTO is_first_price;

  -- Award points for price submission
  PERFORM award_points(NEW.submitted_by, 'price_submit', 'price', NEW.id, 'Submitted price for ' || (SELECT name FROM pubs WHERE id = NEW.pub_id));

  -- Bonus for first price at pub
  IF is_first_price THEN
    PERFORM award_points(NEW.submitted_by, 'first_price_pub', 'price', NEW.id, 'First price at ' || (SELECT name FROM pubs WHERE id = NEW.pub_id));
  END IF;

  -- Award points for deal
  IF NEW.is_deal THEN
    PERFORM award_points(NEW.submitted_by, 'deal_found', 'price', NEW.id, 'Found deal at ' || (SELECT name FROM pubs WHERE id = NEW.pub_id));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_price_points ON prices;
CREATE TRIGGER trigger_price_points
  AFTER INSERT ON prices
  FOR EACH ROW
  EXECUTE FUNCTION trigger_award_price_points();

-- Trigger to award points on review submission
CREATE OR REPLACE FUNCTION trigger_award_review_points()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM award_points(NEW.user_id, 'review_submit', 'review', NEW.id, 'Submitted review');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_review_points ON reviews;
CREATE TRIGGER trigger_review_points
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION trigger_award_review_points();

-- Trigger to award points on check-in
CREATE OR REPLACE FUNCTION trigger_award_checkin_points()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.location_verified THEN
    PERFORM award_points(NEW.user_id, 'check_in_verified', 'check_in', NEW.id, 'Verified check-in');
  ELSE
    PERFORM award_points(NEW.user_id, 'check_in', 'check_in', NEW.id, 'Check-in');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_checkin_points ON check_ins;
CREATE TRIGGER trigger_checkin_points
  AFTER INSERT ON check_ins
  FOR EACH ROW
  EXECUTE FUNCTION trigger_award_checkin_points();

-- Function to reset monthly points (call via cron on 1st of month)
CREATE OR REPLACE FUNCTION reset_monthly_points()
RETURNS void AS $$
BEGIN
  -- Archive last month's leaderboard
  INSERT INTO monthly_leaderboards (year, month, user_id, total_points, rank)
  SELECT
    EXTRACT(YEAR FROM NOW() - INTERVAL '1 month')::INTEGER,
    EXTRACT(MONTH FROM NOW() - INTERVAL '1 month')::INTEGER,
    id,
    points_this_month,
    ROW_NUMBER() OVER (ORDER BY points_this_month DESC)
  FROM profiles
  WHERE points_this_month > 0;

  -- Reset monthly points
  UPDATE profiles SET points_this_month = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
