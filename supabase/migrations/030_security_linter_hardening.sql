-- Security hardening migration to address Supabase linter findings:
-- - SECURITY DEFINER views
-- - Public tables without RLS enabled
-- - Functions with mutable search_path
-- - unaccent extension installed in public schema
-- - Overly permissive ad_inquiries INSERT policy

-- Move unaccent out of public schema when present there
CREATE SCHEMA IF NOT EXISTS extensions;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_extension e
    JOIN pg_namespace n ON n.oid = e.extnamespace
    WHERE e.extname = 'unaccent'
      AND n.nspname = 'public'
  ) THEN
    EXECUTE 'ALTER EXTENSION unaccent SET SCHEMA extensions';
  END IF;
END
$$;

-- Ensure targeted views run with invoking-user permissions (not definer)
DO $$
DECLARE
  v_name TEXT;
BEGIN
  FOREACH v_name IN ARRAY ARRAY[
    'pub_summaries',
    'price_history',
    'pub_amenity_vote_summary',
    'stout_index',
    'current_stout_index',
    'contributor_stats'
  ]
  LOOP
    IF to_regclass(format('public.%I', v_name)) IS NOT NULL THEN
      EXECUTE format('ALTER VIEW public.%I SET (security_invoker = true)', v_name);
    END IF;
  END LOOP;
END
$$;

-- Enable RLS on all lint-flagged public tables that exist
DO $$
DECLARE
  t_name TEXT;
BEGIN
  FOREACH t_name IN ARRAY ARRAY[
    'vibe_options',
    'weekly_digest_queue',
    'badge_types',
    'osm_pubs_import',
    'osm_import_stage',
    'points_config',
    'monthly_leaderboards',
    'drink_suggestion_votes',
    'referrals',
    'sports_matches',
    'pub_analytics'
  ]
  LOOP
    IF to_regclass(format('public.%I', t_name)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t_name);
    END IF;
  END LOOP;
END
$$;

-- Public read policies for lookup/leaderboard data
DO $$
BEGIN
  IF to_regclass('public.vibe_options') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'vibe_options' AND policyname = 'vibe_options_public_read') THEN
    EXECUTE 'CREATE POLICY vibe_options_public_read ON public.vibe_options FOR SELECT USING (is_active = true)';
  END IF;

  IF to_regclass('public.badge_types') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'badge_types' AND policyname = 'badge_types_public_read') THEN
    EXECUTE 'CREATE POLICY badge_types_public_read ON public.badge_types FOR SELECT USING (is_active = true)';
  END IF;

  IF to_regclass('public.points_config') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'points_config' AND policyname = 'points_config_public_read') THEN
    EXECUTE 'CREATE POLICY points_config_public_read ON public.points_config FOR SELECT USING (is_active = true)';
  END IF;

  IF to_regclass('public.monthly_leaderboards') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'monthly_leaderboards' AND policyname = 'monthly_leaderboards_public_read') THEN
    EXECUTE 'CREATE POLICY monthly_leaderboards_public_read ON public.monthly_leaderboards FOR SELECT USING (true)';
  END IF;

  IF to_regclass('public.sports_matches') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'sports_matches' AND policyname = 'sports_matches_public_read') THEN
    EXECUTE 'CREATE POLICY sports_matches_public_read ON public.sports_matches FOR SELECT USING (true)';
  END IF;
END
$$;

-- User-scoped policies for personal/internal tables
DO $$
BEGIN
  IF to_regclass('public.weekly_digest_queue') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'weekly_digest_queue' AND policyname = 'weekly_digest_queue_user_select') THEN
      EXECUTE 'CREATE POLICY weekly_digest_queue_user_select ON public.weekly_digest_queue FOR SELECT USING (auth.uid() = user_id)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'weekly_digest_queue' AND policyname = 'weekly_digest_queue_user_insert') THEN
      EXECUTE 'CREATE POLICY weekly_digest_queue_user_insert ON public.weekly_digest_queue FOR INSERT WITH CHECK (auth.uid() = user_id)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'weekly_digest_queue' AND policyname = 'weekly_digest_queue_user_update') THEN
      EXECUTE 'CREATE POLICY weekly_digest_queue_user_update ON public.weekly_digest_queue FOR UPDATE USING (auth.uid() = user_id)';
    END IF;
  END IF;

  IF to_regclass('public.drink_suggestion_votes') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'drink_suggestion_votes' AND policyname = 'drink_suggestion_votes_public_read') THEN
      EXECUTE 'CREATE POLICY drink_suggestion_votes_public_read ON public.drink_suggestion_votes FOR SELECT USING (true)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'drink_suggestion_votes' AND policyname = 'drink_suggestion_votes_user_insert') THEN
      EXECUTE 'CREATE POLICY drink_suggestion_votes_user_insert ON public.drink_suggestion_votes FOR INSERT WITH CHECK (auth.uid() = user_id)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'drink_suggestion_votes' AND policyname = 'drink_suggestion_votes_user_delete') THEN
      EXECUTE 'CREATE POLICY drink_suggestion_votes_user_delete ON public.drink_suggestion_votes FOR DELETE USING (auth.uid() = user_id)';
    END IF;
  END IF;

  IF to_regclass('public.referrals') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'referrals' AND policyname = 'referrals_user_read') THEN
      EXECUTE 'CREATE POLICY referrals_user_read ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'referrals' AND policyname = 'referrals_user_insert') THEN
      EXECUTE 'CREATE POLICY referrals_user_insert ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id)';
    END IF;
  END IF;
END
$$;

-- Replace permissive ad inquiry policy with basic input validation-based check
DO $$
BEGIN
  IF to_regclass('public.ad_inquiries') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'ad_inquiries'
        AND policyname = 'Anyone can create ad inquiry'
    ) THEN
      EXECUTE 'DROP POLICY "Anyone can create ad inquiry" ON public.ad_inquiries';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'ad_inquiries'
        AND policyname = 'Anyone can create ad inquiry'
    ) THEN
      EXECUTE $policy$
        CREATE POLICY "Anyone can create ad inquiry"
        ON public.ad_inquiries
        FOR INSERT
        WITH CHECK (
          length(trim(coalesce(business_name, ''))) > 0
          AND length(trim(coalesce(contact_name, ''))) > 0
          AND contact_email ~* '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'
        )
      $policy$;
    END IF;
  END IF;
END
$$;

-- Pin search_path for public-schema functions to avoid mutable role-based path resolution
DO $$
DECLARE
  f regprocedure;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
  LOOP
    EXECUTE format(
      'ALTER FUNCTION %s SET search_path = pg_catalog, public, extensions',
      f
    );
  END LOOP;
END
$$;
