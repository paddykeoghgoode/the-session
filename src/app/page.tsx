import Link from 'next/link';
import Image from 'next/image';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import PubCard from '@/components/PubCard';
import StoutIndex from '@/components/StoutIndex';
import { formatPrice } from '@/lib/utils';

export const revalidate = 60; // Revalidate every minute

async function getTopDeals() {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('prices')
    .select(`
      *,
      drink:drinks(*),
      pub:pubs(id, name, address, slug)
    `)
    .eq('is_deal', true)
    .order('created_at', { ascending: false })
    .limit(6);

  return data || [];
}

async function getTopRatedPubs() {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('pub_summaries')
    .select('*')
    .not('avg_rating', 'is', null)
    .gte('review_count', 1) // At least 1 review
    .order('avg_rating', { ascending: false })
    .limit(6);

  return data || [];
}

async function getBestValuePubs() {
  // Pubs with good ratings AND reasonable prices
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('pub_summaries')
    .select('*')
    .not('avg_rating', 'is', null)
    .not('cheapest_guinness', 'is', null)
    .gte('avg_rating', 3.5) // Minimum 3.5 rating
    .order('cheapest_guinness', { ascending: true })
    .limit(5);

  return data || [];
}

async function getRecentlyVerified() {
  const supabase = await createServerSupabaseClient();

  // Get pubs with recent price verifications
  const { data } = await supabase
    .from('pub_summaries')
    .select('*')
    .not('cheapest_guinness', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(5);

  return data || [];
}

export default async function HomePage() {
  const [deals, topRated, bestValue, recentlyVerified] = await Promise.all([
    getTopDeals(),
    getTopRatedPubs(),
    getBestValuePubs(),
    getRecentlyVerified(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-stout-900 to-stout-950 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/pint.svg"
              alt=""
              width={80}
              height={80}
              className="w-20 h-20"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-title text-cream-100 mb-6">
            The Session
          </h1>
          <p className="text-2xl sm:text-3xl text-stout-300 mb-4">
            Find the best pubs <span className="text-irish-green-500">in Dublin</span>
          </p>
          <p className="text-lg text-stout-400 mb-8 max-w-2xl mx-auto">
            Real reviews from real locals. No tourist traps, no guesswork.
            Just honest intel on where to get a quality pint at a fair price.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/pubs"
              className="bg-irish-green-600 hover:bg-irish-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Find a Pub
            </Link>
            <Link
              href="/map"
              className="bg-stout-700 hover:bg-stout-600 text-cream-100 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              View Map
            </Link>
          </div>

          {/* Stout Index Widget */}
          <div className="max-w-md mx-auto">
            <StoutIndex />
          </div>
        </div>
      </section>

      {/* Top Rated Pubs Section - NOW FIRST */}
      <section className="py-12 bg-stout-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-cream-100">Top Rated Pubs</h2>
              <p className="text-stout-400">Highest rated by the community for quality and experience</p>
            </div>
            <Link href="/pubs?sort=rating" className="text-irish-green-500 hover:text-irish-green-400">
              See all &rarr;
            </Link>
          </div>

          {topRated.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topRated.map((pub) => (
                <PubCard key={pub.id} pub={pub} />
              ))}
            </div>
          ) : (
            <p className="text-stout-400 text-center py-8">No reviews yet. Be the first to rate a pub!</p>
          )}
        </div>
      </section>

      {/* Best Value Section - Quality + Price */}
      {bestValue.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-cream-100">Best Value</h2>
                <p className="text-stout-400">Quality pubs with fair prices - the best of both worlds</p>
              </div>
              <Link href="/pubs?sort=value" className="text-irish-green-500 hover:text-irish-green-400">
                See all &rarr;
              </Link>
            </div>

            <div className="grid gap-4">
              {bestValue.map((pub, index) => (
                <Link
                  key={pub.id}
                  href={`/pubs/${pub.slug}`}
                  className="flex items-center justify-between bg-stout-800 rounded-lg p-4 border border-stout-700 hover:border-irish-green-600 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-irish-green-600/20 rounded-full flex items-center justify-center">
                      <span className="text-irish-green-500 font-bold">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-cream-100 font-medium">{pub.name}</p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-yellow-400 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {pub.avg_rating?.toFixed(1)}
                        </span>
                        <span className="text-stout-400">{pub.address}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-irish-green-500">
                      {formatPrice(pub.cheapest_guinness)}
                    </span>
                    <p className="text-xs text-stout-400">Guinness</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Current Deals Section */}
      {deals.length > 0 && (
        <section className="py-12 bg-stout-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-cream-100">Current Deals</h2>
                <p className="text-stout-400">Happy hours, specials, and offers around Dublin</p>
              </div>
              <Link href="/deals" className="text-irish-green-500 hover:text-irish-green-400">
                See all &rarr;
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {deals.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/pubs/${deal.pub?.slug}`}
                  className="bg-gradient-to-br from-amber-900/30 to-stout-800 rounded-lg p-4 border border-amber-700/50 hover:border-amber-600 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-amber-400 font-medium">
                      {deal.deal_title || deal.drink?.name || deal.food_item || 'Special Deal'}
                    </span>
                    <span className="text-2xl font-bold text-irish-green-500">
                      {formatPrice(deal.price)}
                    </span>
                  </div>
                  <p className="text-cream-100 font-semibold">{deal.pub?.name}</p>
                  {deal.deal_type === 'food_combo' && deal.food_item && deal.drink?.name && (
                    <p className="text-sm text-stout-300 mt-1">{deal.food_item} + {deal.drink.name}</p>
                  )}
                  {deal.deal_type === 'food_only' && deal.food_item && (
                    <p className="text-sm text-stout-300 mt-1">{deal.food_item}</p>
                  )}
                  {deal.deal_description && (
                    <p className="text-sm text-amber-300 mt-1">{deal.deal_description}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recently Updated Section */}
      {recentlyVerified.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-cream-100">Recently Updated</h2>
                <p className="text-stout-400">Fresh prices verified by the community</p>
              </div>
              <Link href="/pubs" className="text-irish-green-500 hover:text-irish-green-400">
                See all &rarr;
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentlyVerified.slice(0, 3).map((pub) => (
                <PubCard key={pub.id} pub={pub} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-irish-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Know Your Local?
          </h2>
          <p className="text-lg text-irish-green-100 mb-8">
            Share what you know. Submit prices, write reviews, and help your fellow Dubliners find a good pint without breaking the bank.
          </p>
          <Link
            href="/auth/register"
            className="inline-block bg-white hover:bg-cream-100 text-irish-green-700 font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Join The Session
          </Link>
        </div>
      </section>
    </div>
  );
}
