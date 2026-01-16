-- Add RLS policies allowing admins to update pubs
-- This is needed for the AdminPubEditor to work

-- First ensure the is_admin function exists (from migration 018)
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = p_user_id AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies if they exist (to allow re-running)
DROP POLICY IF EXISTS "Admins can update pubs" ON pubs;
DROP POLICY IF EXISTS "Admins can insert pubs" ON pubs;
DROP POLICY IF EXISTS "Anyone can view active pubs" ON pubs;
DROP POLICY IF EXISTS "Admins can view all pubs" ON pubs;

-- Enable RLS on pubs if not already enabled
ALTER TABLE pubs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view active pubs
CREATE POLICY "Anyone can view active pubs" ON pubs
  FOR SELECT
  USING (is_active = TRUE OR is_active IS NULL);

-- Allow admins to view ALL pubs (including inactive)
CREATE POLICY "Admins can view all pubs" ON pubs
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Allow admins to update any pub
CREATE POLICY "Admins can update pubs" ON pubs
  FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Allow admins to insert new pubs
CREATE POLICY "Admins can insert pubs" ON pubs
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Also add policy for prices table updates (for inline price editing)
DROP POLICY IF EXISTS "Users can insert prices" ON prices;
DROP POLICY IF EXISTS "Admins can update prices" ON prices;

-- Allow authenticated users to insert prices
CREATE POLICY "Users can insert prices" ON prices
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow admins to update/delete prices
CREATE POLICY "Admins can update prices" ON prices
  FOR UPDATE
  USING (is_admin(auth.uid()));

COMMENT ON POLICY "Admins can update pubs" ON pubs IS 'Allows admin users to update any pub details';
