-- The Session - Initial Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PUBS TABLE
-- ============================================
CREATE TABLE pubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  eircode TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_place_id TEXT,
  phone TEXT,
  website TEXT,
  has_food BOOLEAN DEFAULT false,
  has_outdoor_seating BOOLEAN DEFAULT false,
  shows_sports BOOLEAN DEFAULT false,
  has_live_music BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DRINKS TABLE
-- ============================================
CREATE TABLE drinks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('beer', 'cider'))
);

-- Insert default drinks
INSERT INTO drinks (name, category) VALUES
  ('Guinness', 'beer'),
  ('Heineken', 'beer'),
  ('Coors Light', 'beer'),
  ('Rockshore Lager', 'beer'),
  ('Bulmers', 'cider'),
  ('Orchard Thieves', 'cider'),
  ('Rockshore Cider', 'cider');

-- ============================================
-- USER PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  is_verified_local BOOLEAN DEFAULT false,
  total_contributions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRICES TABLE
-- ============================================
CREATE TABLE prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pub_id UUID NOT NULL REFERENCES pubs(id) ON DELETE CASCADE,
  drink_id INTEGER NOT NULL REFERENCES drinks(id) ON DELETE CASCADE,
  price DECIMAL(5, 2) NOT NULL CHECK (price > 0),
  is_deal BOOLEAN DEFAULT false,
  deal_description TEXT,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pub_id UUID NOT NULL REFERENCES pubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pint_quality INTEGER CHECK (pint_quality BETWEEN 1 AND 5),
  ambience INTEGER CHECK (ambience BETWEEN 1 AND 5),
  food_quality INTEGER CHECK (food_quality BETWEEN 1 AND 5),
  staff_friendliness INTEGER CHECK (staff_friendliness BETWEEN 1 AND 5),
  safety INTEGER CHECK (safety BETWEEN 1 AND 5),
  value_for_money INTEGER CHECK (value_for_money BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- One review per user per pub
  UNIQUE(pub_id, user_id)
);

-- ============================================
-- PRICE VOTES TABLE (for upvote/downvote tracking)
-- ============================================
CREATE TABLE price_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  price_id UUID NOT NULL REFERENCES prices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(price_id, user_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_prices_pub_id ON prices(pub_id);
CREATE INDEX idx_prices_drink_id ON prices(drink_id);
CREATE INDEX idx_prices_created_at ON prices(created_at DESC);
CREATE INDEX idx_reviews_pub_id ON reviews(pub_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_pubs_location ON pubs(latitude, longitude);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE pubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE drinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_votes ENABLE ROW LEVEL SECURITY;

-- Pubs: Everyone can read, only authenticated users can insert
CREATE POLICY "Pubs are viewable by everyone" ON pubs
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert pubs" ON pubs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Drinks: Everyone can read
CREATE POLICY "Drinks are viewable by everyone" ON drinks
  FOR SELECT USING (true);

-- Profiles: Everyone can read, users can update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Prices: Everyone can read, authenticated users can insert their own
CREATE POLICY "Prices are viewable by everyone" ON prices
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert prices" ON prices
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

-- Reviews: Everyone can read, authenticated users can manage their own
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Price votes: Users can manage their own votes
CREATE POLICY "Price votes are viewable by everyone" ON price_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert votes" ON price_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON price_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON price_votes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update contribution count for prices
CREATE OR REPLACE FUNCTION public.update_price_contribution_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.submitted_by IS NOT NULL THEN
    UPDATE profiles
    SET total_contributions = total_contributions + 1
    WHERE id = NEW.submitted_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update contribution count for reviews
CREATE OR REPLACE FUNCTION public.update_review_contribution_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.user_id IS NOT NULL THEN
    UPDATE profiles
    SET total_contributions = total_contributions + 1
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for contribution counting
CREATE TRIGGER on_price_submitted
  AFTER INSERT ON prices
  FOR EACH ROW EXECUTE FUNCTION public.update_price_contribution_count();

CREATE TRIGGER on_review_submitted
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_review_contribution_count();

-- Function to update upvote/downvote counts
CREATE OR REPLACE FUNCTION public.update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'up' THEN
      UPDATE prices SET upvotes = upvotes + 1 WHERE id = NEW.price_id;
    ELSE
      UPDATE prices SET downvotes = downvotes + 1 WHERE id = NEW.price_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE prices SET upvotes = upvotes - 1 WHERE id = OLD.price_id;
    ELSE
      UPDATE prices SET downvotes = downvotes - 1 WHERE id = OLD.price_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type = 'up' AND NEW.vote_type = 'down' THEN
      UPDATE prices SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = NEW.price_id;
    ELSIF OLD.vote_type = 'down' AND NEW.vote_type = 'up' THEN
      UPDATE prices SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id = NEW.price_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON price_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_vote_counts();

-- ============================================
-- VIEWS
-- ============================================

-- View for getting pubs with their latest prices and average ratings
CREATE OR REPLACE VIEW pub_summaries AS
SELECT
  p.*,
  (
    SELECT AVG(rating_avg)
    FROM (
      SELECT
        (
          COALESCE(r.pint_quality, 0) +
          COALESCE(r.ambience, 0) +
          COALESCE(r.staff_friendliness, 0) +
          COALESCE(r.safety, 0) +
          COALESCE(r.value_for_money, 0)
        )::float / NULLIF(
          (CASE WHEN r.pint_quality IS NOT NULL THEN 1 ELSE 0 END) +
          (CASE WHEN r.ambience IS NOT NULL THEN 1 ELSE 0 END) +
          (CASE WHEN r.staff_friendliness IS NOT NULL THEN 1 ELSE 0 END) +
          (CASE WHEN r.safety IS NOT NULL THEN 1 ELSE 0 END) +
          (CASE WHEN r.value_for_money IS NOT NULL THEN 1 ELSE 0 END)
        , 0) as rating_avg
      FROM reviews r
      WHERE r.pub_id = p.id
    ) subq
  ) as avg_rating,
  (SELECT COUNT(*) FROM reviews r WHERE r.pub_id = p.id) as review_count,
  (
    SELECT pr.price
    FROM prices pr
    WHERE pr.pub_id = p.id AND pr.drink_id = 1
    ORDER BY pr.created_at DESC
    LIMIT 1
  ) as cheapest_guinness
FROM pubs p;
