import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateDigestContent, type DigestData } from '@/lib/digest';

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// This endpoint is called by a cron job to generate weekly digests
// You would need to set up a cron service (Vercel Cron, GitHub Actions, etc.)
// to call this endpoint weekly
export async function POST(request: Request) {
  try {
    // Verify the request is authorized (use a secret key in production)
    const authHeader = request.headers.get('authorization');
    const expectedKey = process.env.CRON_SECRET_KEY;

    if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all users who have opted in to weekly digest
    const { data: preferences, error: prefError } = await supabaseAdmin
      .from('user_preferences')
      .select(`
        user_id,
        home_latitude,
        home_longitude,
        default_radius_km,
        favorite_drinks,
        preferred_vibes
      `)
      .eq('email_weekly_digest', true);

    if (prefError) {
      console.error('Failed to fetch preferences:', prefError);
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
    }

    if (!preferences || preferences.length === 0) {
      return NextResponse.json({ message: 'No subscribers', queued: 0 });
    }

    // Get common data for all digests
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get new deals from the past week
    const { data: newDeals } = await supabaseAdmin
      .from('prices')
      .select(`
        *,
        pub:pubs(id, name, slug, address, latitude, longitude),
        drink:drinks(id, name, category)
      `)
      .eq('is_deal', true)
      .gte('created_at', oneWeekAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(20);

    // Get price drops (prices lower than average for that drink)
    const { data: recentPrices } = await supabaseAdmin
      .from('prices')
      .select(`
        *,
        pub:pubs(id, name, slug, address, latitude, longitude),
        drink:drinks(id, name, category)
      `)
      .eq('is_deal', false)
      .gte('created_at', oneWeekAgo.toISOString())
      .order('price', { ascending: true })
      .limit(30);

    // Get top verified pubs this week
    const { data: topVerified } = await supabaseAdmin
      .from('check_ins')
      .select('pub_id')
      .gte('created_at', oneWeekAgo.toISOString())
      .eq('is_verified', true);

    // Count verifications per pub
    const verificationCounts: Record<string, number> = {};
    topVerified?.forEach(v => {
      verificationCounts[v.pub_id] = (verificationCounts[v.pub_id] || 0) + 1;
    });

    // Get pub details for top verified
    const topPubIds = Object.entries(verificationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pubId]) => pubId);

    const { data: topPubs } = await supabaseAdmin
      .from('pubs')
      .select('id, name, slug, address, cheapest_guinness')
      .in('id', topPubIds);

    // Queue digests for each subscriber
    const scheduledFor = new Date();
    scheduledFor.setHours(9, 0, 0, 0); // 9 AM

    const digestsToQueue = preferences.map(pref => {
      const digestData = generateDigestContent({
        userId: pref.user_id,
        userLocation: pref.home_latitude && pref.home_longitude
          ? { lat: pref.home_latitude, lng: pref.home_longitude }
          : null,
        radiusKm: pref.default_radius_km || 5,
        favoriteDrinks: pref.favorite_drinks || [],
        newDeals: newDeals || [],
        recentPrices: recentPrices || [],
        topPubs: topPubs?.map(p => ({
          ...p,
          verificationCount: verificationCounts[p.id] || 0,
        })) || [],
      });

      return {
        user_id: pref.user_id,
        digest_data: digestData,
        status: 'pending',
        scheduled_for: scheduledFor.toISOString(),
      };
    });

    // Insert all digests
    const { error: insertError } = await supabaseAdmin
      .from('weekly_digest_queue')
      .insert(digestsToQueue);

    if (insertError) {
      console.error('Failed to queue digests:', insertError);
      return NextResponse.json({ error: 'Failed to queue digests' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Digests queued successfully',
      queued: digestsToQueue.length,
    });
  } catch (error) {
    console.error('Digest generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Endpoint to get digest data for a specific user (for preview/testing)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  try {
    // Get user's pending digest
    const { data: digest, error } = await supabaseAdmin
      .from('weekly_digest_queue')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to fetch digest:', error);
      return NextResponse.json({ error: 'Failed to fetch digest' }, { status: 500 });
    }

    return NextResponse.json({ digest: digest || null });
  } catch (error) {
    console.error('Digest fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
