import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient, getUser } from '@/lib/supabase-server';
import type { Pub, UserPreferences, PersonalizedRecommendation } from '@/types';
import { getPersonalizedRecommendations } from '@/lib/personalization';
import PubCard from '@/components/PubCard';
import { formatPrice } from '@/lib/utils';

export const revalidate = 0; // Always fresh for personalized content

async function getUserPreferences(userId: string) {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  return data as UserPreferences | null;
}

async function getUserBehavior(userId: string) {
  const supabase = await createServerSupabaseClient();

  // Get visited pubs (from check-ins)
  const { data: checkIns } = await supabase
    .from('check_ins')
    .select('pub_id')
    .eq('user_id', userId)
    .limit(100);

  const visitedPubIds = Array.from(new Set((checkIns || []).map((c) => c.pub_id)));

  // Get liked pubs
  const { data: likes } = await supabase
    .from('pub_likes')
    .select('pub_id')
    .eq('user_id', userId);

  const likedPubIds = (likes || []).map((l) => l.pub_id);

  // Get favorite drinks from price submissions
  const { data: prices } = await supabase
    .from('prices')
    .select('drink_id')
    .eq('submitted_by', userId)
    .not('drink_id', 'is', null);

  const drinkCounts: Record<number, number> = {};
  (prices || []).forEach((p) => {
    if (p.drink_id) {
      drinkCounts[p.drink_id] = (drinkCounts[p.drink_id] || 0) + 1;
    }
  });

  const favoriteDrinks = Object.entries(drinkCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id]) => parseInt(id));

  return {
    visitedPubIds,
    likedPubIds,
    favoriteDrinks,
    preferredVibes: [],
  };
}

async function getAllPubs() {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('pub_summaries')
    .select('*')
    .eq('is_active', true)
    .limit(500);

  return (data || []) as Pub[];
}

export default async function ForYouPage() {
  const user = await getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const [preferences, behavior, allPubs] = await Promise.all([
    getUserPreferences(user.id),
    getUserBehavior(user.id),
    getAllPubs(),
  ]);

  // If no preferences yet, redirect to setup
  if (!preferences) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-stout-800 rounded-lg border border-stout-700 p-8 text-center">
          <h1 className="text-2xl font-bold text-cream-100 mb-4">
            Set Up Your Preferences
          </h1>
          <p className="text-stout-300 mb-6">
            Tell us what you like so we can recommend pubs just for you.
          </p>
          <Link
            href="/profile/preferences"
            className="inline-block bg-irish-green-600 hover:bg-irish-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Set Preferences
          </Link>
        </div>
      </div>
    );
  }

  const userLocation = preferences.home_latitude && preferences.home_longitude
    ? { latitude: preferences.home_latitude, longitude: preferences.home_longitude }
    : undefined;

  const recommendations = getPersonalizedRecommendations(
    allPubs,
    preferences,
    behavior,
    userLocation,
    20
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cream-100 mb-2">
          ✨ For You
        </h1>
        <p className="text-stout-400">
          Personalized pub recommendations based on your taste
        </p>
        <Link
          href="/profile/preferences"
          className="text-sm text-irish-green-500 hover:text-irish-green-400 mt-2 inline-block"
        >
          Update preferences →
        </Link>
      </div>

      {/* User Insights */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-stout-800 rounded-lg border border-stout-700 p-4">
          <p className="text-stout-400 text-sm mb-1">Favorite Drinks</p>
          <p className="text-cream-100 font-medium">
            {behavior.favoriteDrinks.length > 0
              ? behavior.favoriteDrinks.map((id) => {
                  const drinkNames: Record<number, string> = {
                    1: 'Guinness',
                    2: 'Heineken',
                    5: 'Bulmers',
                  };
                  return drinkNames[id] || `Drink ${id}`;
                }).join(', ')
              : 'Not enough data'}
          </p>
        </div>

        <div className="bg-stout-800 rounded-lg border border-stout-700 p-4">
          <p className="text-stout-400 text-sm mb-1">Pubs Visited</p>
          <p className="text-cream-100 font-medium text-2xl">
            {behavior.visitedPubIds.length}
          </p>
        </div>

        <div className="bg-stout-800 rounded-lg border border-stout-700 p-4">
          <p className="text-stout-400 text-sm mb-1">Favorite Pubs</p>
          <p className="text-cream-100 font-medium text-2xl">
            {behavior.likedPubIds.length}
          </p>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 ? (
        <>
          <h2 className="text-xl font-bold text-cream-100 mb-4">
            Recommended For You
          </h2>
          <div className="space-y-6">
            {recommendations.slice(0, 5).map((rec, index) => (
              <div
                key={rec.pub.id}
                className="bg-stout-800 rounded-lg border border-stout-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold text-stout-600">
                        #{index + 1}
                      </span>
                      <Link
                        href={`/pubs/${rec.pub.id}`}
                        className="text-xl font-bold text-cream-100 hover:text-irish-green-500"
                      >
                        {rec.pub.name}
                      </Link>
                    </div>
                    <p className="text-sm text-stout-400">{rec.pub.address}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-irish-green-500">
                      {rec.score}
                    </div>
                    <p className="text-xs text-stout-400">match score</p>
                  </div>
                </div>

                {/* Reasons */}
                {rec.reasons.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {rec.reasons.map((reason, i) => (
                      <span
                        key={i}
                        className="text-xs bg-irish-green-600/20 text-irish-green-400 px-3 py-1 rounded-full border border-irish-green-600/30"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                )}

                {/* Quick Stats */}
                <div className="flex gap-6 text-sm">
                  {rec.pub.avg_rating && (
                    <div>
                      <span className="text-stout-400">Rating:</span>
                      <span className="text-cream-100 ml-1">
                        ⭐ {rec.pub.avg_rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  {rec.pub.cheapest_guinness && (
                    <div>
                      <span className="text-stout-400">Guinness:</span>
                      <span className="text-cream-100 ml-1">
                        {formatPrice(rec.pub.cheapest_guinness)}
                      </span>
                    </div>
                  )}
                  {rec.pub.review_count && (
                    <div>
                      <span className="text-stout-400">Reviews:</span>
                      <span className="text-cream-100 ml-1">
                        {rec.pub.review_count}
                      </span>
                    </div>
                  )}
                </div>

                <Link
                  href={`/pubs/${rec.pub.id}`}
                  className="mt-4 inline-block bg-irish-green-600 hover:bg-irish-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  View Pub →
                </Link>
              </div>
            ))}
          </div>

          {/* More Recommendations */}
          {recommendations.length > 5 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold text-cream-100 mb-4">
                More Recommendations
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.slice(5).map((rec) => (
                  <PubCard key={rec.pub.id} pub={rec.pub} />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-stout-800 rounded-lg border border-stout-700 p-12 text-center">
          <p className="text-stout-400 mb-4">
            We need more data to personalize recommendations
          </p>
          <p className="text-sm text-stout-500 mb-6">
            Check in at pubs, submit prices, and like your favorites to help us learn your taste!
          </p>
          <Link
            href="/pubs"
            className="inline-block bg-irish-green-600 hover:bg-irish-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Browse All Pubs
          </Link>
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 bg-stout-800 rounded-lg border border-stout-700 p-6">
        <h3 className="text-lg font-bold text-cream-100 mb-3">
          💡 Improve Your Recommendations
        </h3>
        <ul className="space-y-2 text-sm text-stout-300">
          <li className="flex items-start gap-2">
            <span className="text-irish-green-500">✓</span>
            <span>Check in at pubs you visit to track your history</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-irish-green-500">✓</span>
            <span>Like pubs you enjoy to save them as favorites</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-irish-green-500">✓</span>
            <span>Submit prices for drinks you regularly order</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-irish-green-500">✓</span>
            <span>Update your preferences to match your current mood</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
