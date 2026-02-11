-- Performance lint cleanup:
-- 1) prevent per-row auth() re-evaluation in RLS expressions
-- 2) reduce multiple permissive policy warnings by removing SELECT coverage from broad FOR ALL policies
-- 3) remove duplicate indexes reported by Supabase advisor

-- 1) Rewrite policy expressions to wrap auth helpers in SELECT
DO $$
DECLARE
  pol RECORD;
  using_expr TEXT;
  check_expr TEXT;
  new_using TEXT;
  new_check TEXT;
  cmd_clause TEXT;
  permissive_clause TEXT;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    using_expr := pol.qual;
    check_expr := pol.with_check;

    new_using := using_expr;
    new_check := check_expr;

    IF new_using IS NOT NULL THEN
      new_using := regexp_replace(new_using, '\\bauth\\.uid\\s*\\(\\s*\\)', '(select auth.uid())', 'gi');
      new_using := regexp_replace(new_using, '\\bauth\\.role\\s*\\(\\s*\\)', '(select auth.role())', 'gi');
    END IF;

    IF new_check IS NOT NULL THEN
      new_check := regexp_replace(new_check, '\\bauth\\.uid\\s*\\(\\s*\\)', '(select auth.uid())', 'gi');
      new_check := regexp_replace(new_check, '\\bauth\\.role\\s*\\(\\s*\\)', '(select auth.role())', 'gi');
    END IF;

    IF new_using IS DISTINCT FROM using_expr OR new_check IS DISTINCT FROM check_expr THEN
      cmd_clause := CASE pol.cmd
        WHEN 'ALL' THEN 'ALL'
        WHEN 'SELECT' THEN 'SELECT'
        WHEN 'INSERT' THEN 'INSERT'
        WHEN 'UPDATE' THEN 'UPDATE'
        WHEN 'DELETE' THEN 'DELETE'
        ELSE pol.cmd
      END;

      permissive_clause := CASE pol.permissive
        WHEN 'PERMISSIVE' THEN 'AS PERMISSIVE'
        WHEN 'RESTRICTIVE' THEN 'AS RESTRICTIVE'
        ELSE ''
      END;

      EXECUTE format('DROP POLICY %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);

      EXECUTE format(
        'CREATE POLICY %I ON %I.%I %s FOR %s TO %s%s%s',
        pol.policyname,
        pol.schemaname,
        pol.tablename,
        permissive_clause,
        cmd_clause,
        array_to_string(pol.roles, ', '),
        CASE WHEN new_using IS NOT NULL THEN format(' USING (%s)', new_using) ELSE '' END,
        CASE WHEN new_check IS NOT NULL THEN format(' WITH CHECK (%s)', new_check) ELSE '' END
      );
    END IF;
  END LOOP;
END
$$;

-- 2) Split selected FOR ALL policies so SELECT access is handled by dedicated policies only
DO $$
BEGIN
  IF to_regclass('public.events') IS NOT NULL AND EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='events' AND policyname='Admins can manage events'
  ) THEN
    DROP POLICY "Admins can manage events" ON public.events;
    CREATE POLICY "Admins can insert events" ON public.events FOR INSERT WITH CHECK (is_admin((select auth.uid())));
    CREATE POLICY "Admins can update events" ON public.events FOR UPDATE USING (is_admin((select auth.uid()))) WITH CHECK (is_admin((select auth.uid())));
    CREATE POLICY "Admins can delete events" ON public.events FOR DELETE USING (is_admin((select auth.uid())));
  END IF;

  IF to_regclass('public.pub_menus') IS NOT NULL AND EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='pub_menus' AND policyname='Admins can manage menus'
  ) THEN
    DROP POLICY "Admins can manage menus" ON public.pub_menus;
    CREATE POLICY "Admins can insert menus" ON public.pub_menus FOR INSERT WITH CHECK (is_admin((select auth.uid())));
    CREATE POLICY "Admins can update menus" ON public.pub_menus FOR UPDATE USING (is_admin((select auth.uid()))) WITH CHECK (is_admin((select auth.uid())));
    CREATE POLICY "Admins can delete menus" ON public.pub_menus FOR DELETE USING (is_admin((select auth.uid())));
  END IF;

  IF to_regclass('public.pub_owners') IS NOT NULL AND EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='pub_owners' AND policyname='Only admins can manage pub owners'
  ) THEN
    DROP POLICY "Only admins can manage pub owners" ON public.pub_owners;
    CREATE POLICY "Admins can insert pub owners" ON public.pub_owners FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true));
    CREATE POLICY "Admins can update pub owners" ON public.pub_owners FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true)) WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true));
    CREATE POLICY "Admins can delete pub owners" ON public.pub_owners FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true));
  END IF;

  IF to_regclass('public.leaderboard_prizes') IS NOT NULL AND EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='leaderboard_prizes' AND policyname='Admins can manage prizes'
  ) THEN
    DROP POLICY "Admins can manage prizes" ON public.leaderboard_prizes;
    CREATE POLICY "Admins can insert prizes" ON public.leaderboard_prizes FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true));
    CREATE POLICY "Admins can update prizes" ON public.leaderboard_prizes FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true)) WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true));
    CREATE POLICY "Admins can delete prizes" ON public.leaderboard_prizes FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true));
  END IF;

  IF to_regclass('public.prize_winners') IS NOT NULL AND EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='prize_winners' AND policyname='Admins can manage prize winners'
  ) THEN
    DROP POLICY "Admins can manage prize winners" ON public.prize_winners;
    CREATE POLICY "Admins can insert prize winners" ON public.prize_winners FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true));
    CREATE POLICY "Admins can delete prize winners" ON public.prize_winners FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true));
  END IF;

  IF to_regclass('public.sponsor_analytics') IS NOT NULL AND EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sponsor_analytics' AND policyname='Admins can manage analytics'
  ) THEN
    DROP POLICY "Admins can manage analytics" ON public.sponsor_analytics;
    CREATE POLICY "Admins can insert analytics" ON public.sponsor_analytics FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true));
    CREATE POLICY "Admins can update analytics" ON public.sponsor_analytics FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true)) WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true));
    CREATE POLICY "Admins can delete analytics" ON public.sponsor_analytics FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true));
  END IF;

  IF to_regclass('public.sponsors') IS NOT NULL AND EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sponsors' AND policyname='Admins can manage sponsors'
  ) THEN
    DROP POLICY "Admins can manage sponsors" ON public.sponsors;
    CREATE POLICY "Admins can insert sponsors" ON public.sponsors FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true));
    CREATE POLICY "Admins can update sponsors" ON public.sponsors FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true)) WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true));
    CREATE POLICY "Admins can delete sponsors" ON public.sponsors FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true));
  END IF;

  IF to_regclass('public.pub_streaks') IS NOT NULL AND EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='pub_streaks' AND policyname='Users can manage own streaks'
  ) THEN
    DROP POLICY "Users can manage own streaks" ON public.pub_streaks;
    CREATE POLICY "Users can insert own streaks" ON public.pub_streaks FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
    CREATE POLICY "Users can update own streaks" ON public.pub_streaks FOR UPDATE USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
    CREATE POLICY "Users can delete own streaks" ON public.pub_streaks FOR DELETE USING ((select auth.uid()) = user_id);
  END IF;

  IF to_regclass('public.pub_vibe_votes') IS NOT NULL AND EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='pub_vibe_votes' AND policyname='Users can manage own vibe votes'
  ) THEN
    DROP POLICY "Users can manage own vibe votes" ON public.pub_vibe_votes;
    CREATE POLICY "Users can insert own vibe votes" ON public.pub_vibe_votes FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
    CREATE POLICY "Users can update own vibe votes" ON public.pub_vibe_votes FOR UPDATE USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
    CREATE POLICY "Users can delete own vibe votes" ON public.pub_vibe_votes FOR DELETE USING ((select auth.uid()) = user_id);
  END IF;

  IF to_regclass('public.pub_crawl_stops') IS NOT NULL AND EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='pub_crawl_stops' AND policyname='Crawl creators can manage stops'
  ) THEN
    DROP POLICY "Crawl creators can manage stops" ON public.pub_crawl_stops;
    CREATE POLICY "Crawl creators can insert stops" ON public.pub_crawl_stops FOR INSERT WITH CHECK (EXISTS (
      SELECT 1 FROM pub_crawls WHERE pub_crawls.id = crawl_id AND pub_crawls.creator_id = (select auth.uid())
    ));
    CREATE POLICY "Crawl creators can update stops" ON public.pub_crawl_stops FOR UPDATE USING (EXISTS (
      SELECT 1 FROM pub_crawls WHERE pub_crawls.id = pub_crawl_stops.crawl_id AND pub_crawls.creator_id = (select auth.uid())
    )) WITH CHECK (EXISTS (
      SELECT 1 FROM pub_crawls WHERE pub_crawls.id = pub_crawl_stops.crawl_id AND pub_crawls.creator_id = (select auth.uid())
    ));
    CREATE POLICY "Crawl creators can delete stops" ON public.pub_crawl_stops FOR DELETE USING (EXISTS (
      SELECT 1 FROM pub_crawls WHERE pub_crawls.id = pub_crawl_stops.crawl_id AND pub_crawls.creator_id = (select auth.uid())
    ));
  END IF;
END
$$;

-- 2b) Consolidate duplicated permissive policies for same action
DO $$
BEGIN
  IF to_regclass('public.prices') IS NOT NULL
     AND EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='prices' AND policyname='Authenticated users can insert prices')
     AND EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='prices' AND policyname='Users can insert prices') THEN
    DROP POLICY "Authenticated users can insert prices" ON public.prices;
  END IF;

  IF to_regclass('public.pubs') IS NOT NULL
     AND EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='pubs' AND policyname='Pubs are viewable by everyone')
     AND EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='pubs' AND policyname='Anyone can view active pubs') THEN
    DROP POLICY "Pubs are viewable by everyone" ON public.pubs;
  END IF;

  IF to_regclass('public.pub_likes') IS NOT NULL
     AND EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='pub_likes' AND policyname='Anyone can view likes')
     AND EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='pub_likes' AND policyname='Pub likes are viewable by all') THEN
    DROP POLICY "Anyone can view likes" ON public.pub_likes;
  END IF;

  IF to_regclass('public.pub_photos') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Approved photos are viewable by all" ON public.pub_photos;
    DROP POLICY IF EXISTS "Users can view own photos" ON public.pub_photos;
    DROP POLICY IF EXISTS "Admins can view all photos" ON public.pub_photos;
    CREATE POLICY "Unified pub photos select policy" ON public.pub_photos
      FOR SELECT USING (
        is_approved = true
        OR user_id = (select auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true)
      );

    DROP POLICY IF EXISTS "Users can delete own pending photos" ON public.pub_photos;
    DROP POLICY IF EXISTS "Admins can delete any photo" ON public.pub_photos;
    CREATE POLICY "Unified pub photos delete policy" ON public.pub_photos
      FOR DELETE USING (
        (user_id = (select auth.uid()) AND is_approved = false)
        OR EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true)
      );
  END IF;

  IF to_regclass('public.pub_ownership_claims') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Users can view own claims" ON public.pub_ownership_claims;
    DROP POLICY IF EXISTS "Admins can view all claims" ON public.pub_ownership_claims;
    CREATE POLICY "Unified ownership claims select policy" ON public.pub_ownership_claims
      FOR SELECT USING (
        user_id = (select auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true)
      );
  END IF;

  IF to_regclass('public.user_points') IS NOT NULL
     AND EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_points' AND policyname='Users can view own points')
     AND EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_points' AND policyname='Points are viewable by all') THEN
    DROP POLICY "Users can view own points" ON public.user_points;
  END IF;

  IF to_regclass('public.events') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Anyone can view active events" ON public.events;
    CREATE POLICY "Unified events select policy" ON public.events
      FOR SELECT USING (is_active = true OR is_admin((select auth.uid())));
  END IF;

  IF to_regclass('public.pub_menus') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Anyone can view approved menus" ON public.pub_menus;
    CREATE POLICY "Unified pub menus select policy" ON public.pub_menus
      FOR SELECT USING (is_approved = true OR is_admin((select auth.uid())));
  END IF;

  IF to_regclass('public.leaderboard_prizes') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Active prizes are viewable by all" ON public.leaderboard_prizes;
    CREATE POLICY "Unified leaderboard prizes select policy" ON public.leaderboard_prizes
      FOR SELECT USING (is_active = true OR EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true));
  END IF;

  IF to_regclass('public.prize_winners') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Users can view their own prizes" ON public.prize_winners;
    DROP POLICY IF EXISTS "Admins can view all prize winners" ON public.prize_winners;
    CREATE POLICY "Unified prize winners select policy" ON public.prize_winners
      FOR SELECT USING (
        user_id = (select auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true)
      );
  END IF;

  IF to_regclass('public.sponsor_analytics') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Sponsors can view their own analytics" ON public.sponsor_analytics;
    CREATE POLICY "Unified sponsor analytics select policy" ON public.sponsor_analytics
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM sponsors
          WHERE id = sponsor_analytics.sponsor_id
            AND contact_email = (SELECT email FROM auth.users WHERE id = (select auth.uid()))
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true)
      );
  END IF;

  IF to_regclass('public.sponsors') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Active sponsors are viewable by all" ON public.sponsors;
    CREATE POLICY "Unified sponsors select policy" ON public.sponsors
      FOR SELECT USING (
        is_active = true
        OR EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true)
      );
  END IF;
END
$$;

-- 3) Remove duplicate indexes flagged by the linter
DROP INDEX IF EXISTS public.idx_pub_likes_pub;
DROP INDEX IF EXISTS public.idx_pub_likes_user;
DROP INDEX IF EXISTS public.pubs_source_id_uq;
