import Link from 'next/link';
import Image from 'next/image';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import PubCard from '@/components/PubCard';
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

async function getCheapestGuinness() {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('prices')
    .select(`
      *,
      pub:pubs(id, name, address, slug)
    `)
    .eq('drink_id', 1) // Guinness
    .order('price', { ascending: true })
    .limit(5);

  return data || [];
}

async function getTopRatedPubs() {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('pub_summaries')
    .select('*')
    .not('avg_rating', 'is', null)
    .order('avg_rating', { ascending: false })
    .limit(6);

  return data || [];
}

export default async function HomePage() {
  const [deals, cheapestGuinness, topRated] = await Promise.all([
    getTopDeals(),
    getCheapestGuinness(),
    getTopRatedPubs(),
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
            Find the best pint prices <span className="text-irish-green-500">in Dublin</span>
          </p>
          <p className="text-lg text-stout-400 mb-8 max-w-2xl mx-auto">
            Real prices from real locals. No tourist traps, no guesswork.
            Just honest intel on where to get a good pint at a fair price.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
        </div>
      </section>

      {/* Cheapest Guinness Section */}
      <section className="py-12 bg-stout-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-cream-100">Cheapest Guinness</h2>
              <p className="text-stout-400">Where to get the best value on a pint of the black stuff</p>
            </div>
            <Link href="/leaderboard" className="text-irish-green-500 hover:text-irish-green-400">
              See all &rarr;
            </Link>
          </div>

          {cheapestGuinness.length > 0 ? (
            <div className="grid gap-4">
              {cheapestGuinness.map((price, index) => (
                <Link
                  key={price.id}
                  href={`/pubs/${price.pub?.slug}`}
                  className="flex items-center justify-between bg-stout-800 rounded-lg p-4 border border-stout-700 hover:border-stout-500 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-2xl font-bold ${
                      index === 0 ? 'text-yellow-400' :
                      index === 1 ? 'text-gray-300' :
                      index === 2 ? 'text-amber-600' : 'text-stout-400'
                    }`}>
                      #{index + 1}
                    </span>
                    <div>
                      <p className="text-cream-100 font-medium">{price.pub?.name}</p>
                      <p className="text-sm text-stout-400">{price.pub?.address}</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-irish-green-500">
                    {formatPrice(price.price)}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-stout-400 text-center py-8">No prices submitted yet.</p>
          )}
        </div>
      </section>

      {/* Current Deals Section */}
      {deals.length > 0 && (
        <section className="py-12">
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
                    <span className="text-amber-400 font-medium">{deal.drink?.name}</span>
                    <span className="text-2xl font-bold text-irish-green-500">
                      {formatPrice(deal.price)}
                    </span>
                  </div>
                  <p className="text-cream-100 font-semibold">{deal.pub?.name}</p>
                  {deal.deal_description && (
                    <p className="text-sm text-amber-300 mt-1">{deal.deal_description}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Rated Pubs Section */}
      <section className="py-12 bg-stout-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-cream-100">Top Rated Pubs</h2>
              <p className="text-stout-400">Highest rated by the community</p>
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
