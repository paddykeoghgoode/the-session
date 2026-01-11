import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import StarRating from '@/components/StarRating';
import { formatPrice } from '@/lib/utils';

export const revalidate = 60;

async function getCheapestByDrink() {
  const supabase = await createServerSupabaseClient();

  const { data: drinks } = await supabase.from('drinks').select('*').order('id');

  const results = await Promise.all(
    (drinks || []).map(async (drink) => {
      const { data } = await supabase
        .from('prices')
        .select(`
          *,
          pub:pubs(id, name, address)
        `)
        .eq('drink_id', drink.id)
        .order('price', { ascending: true })
        .limit(5);

      return {
        drink,
        prices: data || [],
      };
    })
  );

  return results;
}

async function getTopRatedPubs() {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('pub_summaries')
    .select('*')
    .not('avg_rating', 'is', null)
    .gt('review_count', 0)
    .order('avg_rating', { ascending: false })
    .limit(10);

  return data || [];
}

async function getTopContributors() {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .gt('total_contributions', 0)
    .order('total_contributions', { ascending: false })
    .limit(10);

  return data || [];
}

export default async function LeaderboardPage() {
  const [cheapestByDrink, topRatedPubs, topContributors] = await Promise.all([
    getCheapestByDrink(),
    getTopRatedPubs(),
    getTopContributors(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cream-100 mb-2">Leaderboards</h1>
        <p className="text-stout-400">
          The best prices, top-rated pubs, and most helpful contributors
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Cheapest Prices by Drink */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-cream-100 mb-4">Cheapest Pints</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cheapestByDrink.map(({ drink, prices }) => (
              <div
                key={drink.id}
                className="bg-stout-800 rounded-lg border border-stout-700 overflow-hidden"
              >
                <div className="bg-stout-700 px-4 py-3 flex justify-between items-center">
                  <span className="font-semibold text-cream-100">{drink.name}</span>
                  <span className="text-xs bg-stout-600 text-stout-300 px-2 py-0.5 rounded">
                    {drink.category}
                  </span>
                </div>
                <div className="divide-y divide-stout-700">
                  {prices.length > 0 ? (
                    prices.slice(0, 3).map((price, index) => (
                      <Link
                        key={price.id}
                        href={`/pubs/${price.pub?.id}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-stout-700/50 transition-colors"
                      >
                        <span
                          className={`font-bold ${
                            index === 0
                              ? 'text-yellow-400'
                              : index === 1
                              ? 'text-gray-300'
                              : 'text-amber-600'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-cream-100 text-sm truncate">{price.pub?.name}</p>
                        </div>
                        <span className="text-irish-green-500 font-semibold">
                          {formatPrice(price.price)}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="px-4 py-3 text-sm text-stout-400">No prices yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Rated Pubs */}
        <div>
          <h2 className="text-xl font-bold text-cream-100 mb-4">Top Rated Pubs</h2>
          <div className="bg-stout-800 rounded-lg border border-stout-700 divide-y divide-stout-700">
            {topRatedPubs.length > 0 ? (
              topRatedPubs.map((pub, index) => (
                <Link
                  key={pub.id}
                  href={`/pubs/${pub.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-stout-700/50 transition-colors"
                >
                  <span
                    className={`text-xl font-bold w-8 ${
                      index === 0
                        ? 'text-yellow-400'
                        : index === 1
                        ? 'text-gray-300'
                        : index === 2
                        ? 'text-amber-600'
                        : 'text-stout-500'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-cream-100 font-medium truncate">{pub.name}</p>
                    <p className="text-sm text-stout-400 truncate">{pub.address}</p>
                  </div>
                  <div className="text-right">
                    <StarRating rating={pub.avg_rating || 0} size="sm" />
                    <p className="text-xs text-stout-400 mt-1">
                      {pub.review_count} {pub.review_count === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="p-4 text-stout-400 text-center">No reviews yet</p>
            )}
          </div>
        </div>

        {/* Top Contributors */}
        <div>
          <h2 className="text-xl font-bold text-cream-100 mb-4">Top Contributors</h2>
          <div className="bg-stout-800 rounded-lg border border-stout-700 divide-y divide-stout-700">
            {topContributors.length > 0 ? (
              topContributors.map((profile, index) => (
                <div
                  key={profile.id}
                  className="flex items-center gap-4 p-4"
                >
                  <span
                    className={`text-xl font-bold w-8 ${
                      index === 0
                        ? 'text-yellow-400'
                        : index === 1
                        ? 'text-gray-300'
                        : index === 2
                        ? 'text-amber-600'
                        : 'text-stout-500'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-cream-100 font-medium">
                      {profile.display_name || profile.username || 'Anonymous'}
                      {profile.is_verified_local && (
                        <span className="ml-2 text-xs bg-irish-green-600 text-white px-2 py-0.5 rounded-full">
                          Verified
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-irish-green-500 font-semibold">
                      {profile.total_contributions}
                    </p>
                    <p className="text-xs text-stout-400">contributions</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-4 text-stout-400 text-center">No contributors yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
