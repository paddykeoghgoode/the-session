-- Sponsorship and Prize System
-- Enables monthly leaderboard prizes and pub/brand sponsorships

-- Sponsors Table
CREATE TABLE IF NOT EXISTS sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('pub', 'delivery_platform', 'brewery', 'brand')),
  sponsorship_level VARCHAR(20) NOT NULL CHECK (sponsorship_level IN ('bronze', 'silver', 'gold', 'platinum')),
  monthly_contribution DECIMAL(10, 2) NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  pub_id UUID REFERENCES pubs(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  benefits_received TEXT[],
  promotional_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sponsors_type ON sponsors(type);
CREATE INDEX IF NOT EXISTS idx_sponsors_level ON sponsors(sponsorship_level);
CREATE INDEX IF NOT EXISTS idx_sponsors_pub_id ON sponsors(pub_id);
CREATE INDEX IF NOT EXISTS idx_sponsors_active ON sponsors(is_active);

-- Leaderboard Prizes Table
CREATE TABLE IF NOT EXISTS leaderboard_prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2025),
  rank INTEGER NOT NULL CHECK (rank >= 1),
  prize_type VARCHAR(50) NOT NULL CHECK (prize_type IN ('bar_tab', 'delivery_voucher', 'merchandise', 'cash', 'other')),
  prize_value DECIMAL(10, 2) NOT NULL,
  prize_description TEXT NOT NULL,
  sponsor_type VARCHAR(50) NOT NULL CHECK (sponsor_type IN ('pub', 'delivery_platform', 'brewery', 'other')),
  sponsor_id UUID REFERENCES sponsors(id) ON DELETE SET NULL,
  sponsor_name VARCHAR(200) NOT NULL,
  sponsor_logo_url TEXT,
  terms TEXT,
  redemption_instructions TEXT,
  expiry_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(month, year, rank)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_prizes_month_year ON leaderboard_prizes(year, month);
CREATE INDEX IF NOT EXISTS idx_leaderboard_prizes_sponsor_id ON leaderboard_prizes(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_prizes_active ON leaderboard_prizes(is_active);

-- Prize Winners Table
CREATE TABLE IF NOT EXISTS prize_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prize_id UUID NOT NULL REFERENCES leaderboard_prizes(id) ON DELETE CASCADE,
  final_rank INTEGER NOT NULL,
  final_points INTEGER NOT NULL,
  claimed BOOLEAN NOT NULL DEFAULT false,
  claim_date TIMESTAMPTZ,
  voucher_code VARCHAR(100),
  redemption_location TEXT,
  notes TEXT,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, prize_id)
);

CREATE INDEX IF NOT EXISTS idx_prize_winners_user_id ON prize_winners(user_id);
CREATE INDEX IF NOT EXISTS idx_prize_winners_prize_id ON prize_winners(prize_id);
CREATE INDEX IF NOT EXISTS idx_prize_winners_claimed ON prize_winners(claimed);

-- Sponsor Analytics Table
CREATE TABLE IF NOT EXISTS sponsor_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2025),
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  prize_redemptions INTEGER NOT NULL DEFAULT 0,
  estimated_reach INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(sponsor_id, month, year)
);

CREATE INDEX IF NOT EXISTS idx_sponsor_analytics_sponsor_id ON sponsor_analytics(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_analytics_month_year ON sponsor_analytics(year, month);

-- Row Level Security Policies

-- Sponsors (Public read, admin write)
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active sponsors are viewable by all" ON sponsors
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage sponsors" ON sponsors
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- Leaderboard Prizes (Public read, admin write)
ALTER TABLE leaderboard_prizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active prizes are viewable by all" ON leaderboard_prizes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage prizes" ON leaderboard_prizes
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- Prize Winners (Users can see own, admins see all)
ALTER TABLE prize_winners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own prizes" ON prize_winners
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all prize winners" ON prize_winners
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can manage prize winners" ON prize_winners
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Winners can update claim status" ON prize_winners
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Sponsor Analytics (Sponsor and admin read, admin write)
ALTER TABLE sponsor_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sponsors can view their own analytics" ON sponsor_analytics
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM sponsors WHERE id = sponsor_analytics.sponsor_id AND contact_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Admins can manage analytics" ON sponsor_analytics
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- Functions

-- Get current month's prizes
CREATE OR REPLACE FUNCTION get_current_month_prizes()
RETURNS TABLE(
  id UUID,
  rank INTEGER,
  prize_type VARCHAR,
  prize_value DECIMAL,
  prize_description TEXT,
  sponsor_name VARCHAR,
  sponsor_logo_url TEXT
) AS $$
  SELECT
    id,
    rank,
    prize_type,
    prize_value,
    prize_description,
    sponsor_name,
    sponsor_logo_url
  FROM leaderboard_prizes
  WHERE month = EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER
    AND year = EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
    AND is_active = true
  ORDER BY rank;
$$ LANGUAGE SQL STABLE;

-- Calculate sponsor ROI
CREATE OR REPLACE FUNCTION calculate_sponsor_roi(sponsor_uuid UUID, target_month INTEGER, target_year INTEGER)
RETURNS TABLE(
  investment DECIMAL,
  impressions INTEGER,
  clicks INTEGER,
  cpm DECIMAL,
  cpc DECIMAL
) AS $$
  SELECT
    s.monthly_contribution as investment,
    COALESCE(sa.impressions, 0) as impressions,
    COALESCE(sa.clicks, 0) as clicks,
    CASE
      WHEN COALESCE(sa.impressions, 0) > 0
      THEN (s.monthly_contribution / sa.impressions * 1000)
      ELSE 0
    END as cpm,
    CASE
      WHEN COALESCE(sa.clicks, 0) > 0
      THEN (s.monthly_contribution / sa.clicks)
      ELSE 0
    END as cpc
  FROM sponsors s
  LEFT JOIN sponsor_analytics sa ON sa.sponsor_id = s.id
    AND sa.month = target_month
    AND sa.year = target_year
  WHERE s.id = sponsor_uuid;
$$ LANGUAGE SQL STABLE;

-- Award prizes to monthly winners (called by cron job or admin)
CREATE OR REPLACE FUNCTION award_monthly_prizes(target_month INTEGER, target_year INTEGER)
RETURNS INTEGER AS $$
DECLARE
  prize_record RECORD;
  winner_record RECORD;
  prizes_awarded INTEGER := 0;
BEGIN
  -- Get all prizes for the month
  FOR prize_record IN
    SELECT * FROM leaderboard_prizes
    WHERE month = target_month
      AND year = target_year
      AND is_active = true
    ORDER BY rank
  LOOP
    -- Get the winner at this rank from monthly_leaderboards
    SELECT user_id, total_points INTO winner_record
    FROM monthly_leaderboards
    WHERE month = target_month
      AND year = target_year
    ORDER BY total_points DESC
    LIMIT 1 OFFSET (prize_record.rank - 1);

    IF winner_record.user_id IS NOT NULL THEN
      -- Insert prize winner record
      INSERT INTO prize_winners (user_id, prize_id, final_rank, final_points)
      VALUES (winner_record.user_id, prize_record.id, prize_record.rank, winner_record.total_points)
      ON CONFLICT (user_id, prize_id) DO NOTHING;

      prizes_awarded := prizes_awarded + 1;
    END IF;
  END LOOP;

  RETURN prizes_awarded;
END;
$$ LANGUAGE plpgsql;
