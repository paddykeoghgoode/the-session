-- Social Features: Friend Relationships and Pub Crawls
-- Enables social networking features for users

-- Drop old pub_crawls tables if they exist with wrong schema
-- (In case they were created earlier with different structure)
DROP TABLE IF EXISTS pub_crawl_participants CASCADE;
DROP TABLE IF EXISTS pub_crawl_stops CASCADE;
DROP TABLE IF EXISTS pub_crawls CASCADE;

-- Friend Relationships Table
CREATE TABLE IF NOT EXISTS friend_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friend_relationships_user_id ON friend_relationships(user_id);
CREATE INDEX IF NOT EXISTS idx_friend_relationships_friend_id ON friend_relationships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friend_relationships_status ON friend_relationships(status);

-- Pub Crawls Table
CREATE TABLE IF NOT EXISTS pub_crawls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pub_crawls_creator_id ON pub_crawls(creator_id);
CREATE INDEX IF NOT EXISTS idx_pub_crawls_scheduled_date ON pub_crawls(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_pub_crawls_status ON pub_crawls(status);

-- Pub Crawl Stops Table
CREATE TABLE IF NOT EXISTS pub_crawl_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crawl_id UUID NOT NULL REFERENCES pub_crawls(id) ON DELETE CASCADE,
  pub_id UUID NOT NULL REFERENCES pubs(id) ON DELETE CASCADE,
  stop_order INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(crawl_id, stop_order),
  UNIQUE(crawl_id, pub_id)
);

CREATE INDEX IF NOT EXISTS idx_pub_crawl_stops_crawl_id ON pub_crawl_stops(crawl_id);
CREATE INDEX IF NOT EXISTS idx_pub_crawl_stops_pub_id ON pub_crawl_stops(pub_id);

-- Pub Crawl Participants Table
CREATE TABLE IF NOT EXISTS pub_crawl_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crawl_id UUID NOT NULL REFERENCES pub_crawls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined', 'maybe')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(crawl_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_pub_crawl_participants_crawl_id ON pub_crawl_participants(crawl_id);
CREATE INDEX IF NOT EXISTS idx_pub_crawl_participants_user_id ON pub_crawl_participants(user_id);

-- Pub Likes Table (for user favorites)
CREATE TABLE IF NOT EXISTS pub_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pub_id UUID NOT NULL REFERENCES pubs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, pub_id)
);

CREATE INDEX IF NOT EXISTS idx_pub_likes_user_id ON pub_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_pub_likes_pub_id ON pub_likes(pub_id);

-- Row Level Security Policies

-- Friend Relationships
ALTER TABLE friend_relationships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own friend relationships" ON friend_relationships;
DROP POLICY IF EXISTS "Users can create friend requests" ON friend_relationships;
DROP POLICY IF EXISTS "Users can update friend relationships they're part of" ON friend_relationships;
DROP POLICY IF EXISTS "Users can delete their own friend relationships" ON friend_relationships;

CREATE POLICY "Users can view their own friend relationships" ON friend_relationships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friend requests" ON friend_relationships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friend relationships they're part of" ON friend_relationships
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete their own friend relationships" ON friend_relationships
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Pub Crawls
ALTER TABLE pub_crawls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public crawls are viewable by all" ON pub_crawls;
DROP POLICY IF EXISTS "Users can create crawls" ON pub_crawls;
DROP POLICY IF EXISTS "Creators can update their crawls" ON pub_crawls;
DROP POLICY IF EXISTS "Creators can delete their crawls" ON pub_crawls;

CREATE POLICY "Public crawls are viewable by all" ON pub_crawls
  FOR SELECT USING (
    pub_crawls.is_public = true OR
    pub_crawls.creator_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM pub_crawl_participants
      WHERE pub_crawl_participants.crawl_id = pub_crawls.id
      AND pub_crawl_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create crawls" ON pub_crawls
  FOR INSERT WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can update their crawls" ON pub_crawls
  FOR UPDATE USING (pub_crawls.creator_id = auth.uid());

CREATE POLICY "Creators can delete their crawls" ON pub_crawls
  FOR DELETE USING (pub_crawls.creator_id = auth.uid());

-- Pub Crawl Stops
ALTER TABLE pub_crawl_stops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Crawl stops are viewable with crawl" ON pub_crawl_stops;
DROP POLICY IF EXISTS "Crawl creators can manage stops" ON pub_crawl_stops;

CREATE POLICY "Crawl stops are viewable with crawl" ON pub_crawl_stops
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM pub_crawls
    WHERE pub_crawls.id = pub_crawl_stops.crawl_id
    AND (
      pub_crawls.is_public = true OR
      pub_crawls.creator_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM pub_crawl_participants
        WHERE pub_crawl_participants.crawl_id = pub_crawls.id
        AND pub_crawl_participants.user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Crawl creators can manage stops" ON pub_crawl_stops
  FOR ALL USING (EXISTS (
    SELECT 1 FROM pub_crawls
    WHERE pub_crawls.id = pub_crawl_stops.crawl_id
    AND pub_crawls.creator_id = auth.uid()
  ));

-- Pub Crawl Participants
ALTER TABLE pub_crawl_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants are viewable with crawl" ON pub_crawl_participants;
DROP POLICY IF EXISTS "Crawl creators can invite participants" ON pub_crawl_participants;
DROP POLICY IF EXISTS "Participants can update their own status" ON pub_crawl_participants;
DROP POLICY IF EXISTS "Creators and participants can remove participation" ON pub_crawl_participants;

CREATE POLICY "Participants are viewable with crawl" ON pub_crawl_participants
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM pub_crawls
    WHERE pub_crawls.id = pub_crawl_participants.crawl_id
    AND (
      pub_crawls.is_public = true OR
      pub_crawls.creator_id = auth.uid() OR
      pub_crawl_participants.user_id = auth.uid()
    )
  ));

CREATE POLICY "Crawl creators can invite participants" ON pub_crawl_participants
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM pub_crawls
    WHERE pub_crawls.id = crawl_id
    AND pub_crawls.creator_id = auth.uid()
  ));

CREATE POLICY "Participants can update their own status" ON pub_crawl_participants
  FOR UPDATE USING (pub_crawl_participants.user_id = auth.uid());

CREATE POLICY "Creators and participants can remove participation" ON pub_crawl_participants
  FOR DELETE USING (
    pub_crawl_participants.user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM pub_crawls
      WHERE pub_crawls.id = pub_crawl_participants.crawl_id
      AND pub_crawls.creator_id = auth.uid()
    )
  );

-- Pub Likes
ALTER TABLE pub_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pub likes are viewable by all" ON pub_likes;
DROP POLICY IF EXISTS "Users can like pubs" ON pub_likes;
DROP POLICY IF EXISTS "Users can unlike pubs" ON pub_likes;

CREATE POLICY "Pub likes are viewable by all" ON pub_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like pubs" ON pub_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike pubs" ON pub_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Functions

-- Get friend count for a user
CREATE OR REPLACE FUNCTION get_friend_count(user_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM friend_relationships
  WHERE (user_id = user_uuid OR friend_id = user_uuid) AND status = 'accepted';
$$ LANGUAGE SQL STABLE;

-- Get mutual friends between two users
CREATE OR REPLACE FUNCTION get_mutual_friends(user1_uuid UUID, user2_uuid UUID)
RETURNS TABLE(friend_id UUID) AS $$
  SELECT DISTINCT
    CASE
      WHEN fr1.user_id = user1_uuid THEN fr1.friend_id
      ELSE fr1.user_id
    END as friend_id
  FROM friend_relationships fr1
  WHERE (fr1.user_id = user1_uuid OR fr1.friend_id = user1_uuid)
    AND fr1.status = 'accepted'
    AND EXISTS (
      SELECT 1 FROM friend_relationships fr2
      WHERE (fr2.user_id = user2_uuid OR fr2.friend_id = user2_uuid)
        AND fr2.status = 'accepted'
        AND (
          (fr2.user_id = CASE WHEN fr1.user_id = user1_uuid THEN fr1.friend_id ELSE fr1.user_id END)
          OR (fr2.friend_id = CASE WHEN fr1.user_id = user1_uuid THEN fr1.friend_id ELSE fr1.user_id END)
        )
    );
$$ LANGUAGE SQL STABLE;
