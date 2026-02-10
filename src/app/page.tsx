import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import PubCard from '@/components/PubCard';
import StoutIndex from '@/components/StoutIndex';
import QuickActionGrid from '@/components/QuickActionGrid';
import WhatsOnTonight from '@/components/WhatsOnTonight';
import DealsCarousel from '@/components/DealsCarousel';
import SmartSearch from '@/components/SmartSearch';
import { formatPrice } from '@/lib/utils';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'The Session - Find the Best Pint Prices in Dublin',
  description: 'Discover the best pubs, compare pint prices, and find deals across Dublin. Crowdsourced reviews and prices from 5,000+ pub enthusiasts.',
  keywords: ['Dublin pubs', 'pint prices', 'Guinness price', 'pub deals', 'Dublin nightlife', 'best pubs Dublin', 'Dublin events', 'sports bars Dublin'],
  openGraph: {
    title: 'The Session - Find the Best Pint Prices in Dublin',
    description: 'Discover the best pubs, compare pint prices, and find deals across Dublin.',
    url: 'https://thesession.ie',
    siteName: 'The Session',
    images: [
      {
        url: 'https://thesession.ie/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'The Session - Dublin Pub Finder',
      },
    ],
    locale: 'en_IE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Session - Find the Best Pint Prices in Dublin',
    description: 'Discover the best pubs, compare pint prices, and find deals across Dublin.',
    images: ['https://thesession.ie/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://thesession.ie',
  },
};

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
    .limit(8);

  return data || [];
}

async function getTopRatedPubs() {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('pub_summaries')
    .select('*')
    .not('avg_rating', 'is', null)
    .gte('review_count', 1)
    .order('avg_rating', { ascending: false })
    .limit(6);

  return data || [];
}

async function getBestValuePubs() {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('pub_summaries')
    .select('*')
    .not('avg_rating', 'is', null)
    .not('cheapest_guinness', 'is', null)
    .gte('avg_rating', 3.5)
    .order('cheapest_guinness', { ascending: true })
    .limit(5);

  return data || [];
}

async function getTodayEvents() {
  const supabase = await createServerSupabaseClient();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  const { data } = await supabase
    .from('pub_events')
    .select(`
      id, title, event_type, start_time,
      pub:pubs(name, slug)
    `)
    .eq('is_active', true)
    .or(`specific_date.eq.${new Date().toISOString().split('T')[0]},day_of_week.cs.{${today}}`)
    .order('start_time', { ascending: true })
    .limit(10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    pub_name: item.pub?.name || 'Unknown',
    pub_slug: item.pub?.slug || '',
    event_type: item.event_type,
    start_time: item.start_time,
  }));
}

async function getRecentlyVerified() {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('pub_summaries')
    .select('*')
    .not('cheapest_guinness', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(5);

  return data || [];
}

export default async function HomePage() {
  const [deals, topRated, bestValue, todayEvents, recentlyVerified] = await Promise.all([
    getTopDeals(),
    getTopRatedPubs(),
    getBestValuePubs(),
    getTodayEvents(),
    getRecentlyVerified(),
  ]);

  return (
    <div className="min-h-screen">
      {/* === MOBILE-FIRST HERO === */}
      <section className="bg-gradient-to-b from-stout-900 to-stout-950 pt-6 pb-4 sm:pt-12 sm:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Compact Mobile Hero */}
          <div className="flex flex-col items-center text-center mb-6 sm:mb-10">
            <Image
              src="/pint.svg"
              alt=""
              width={56}
              height={56}
              className="w-14 h-14 sm:w-20 sm:h-20 mb-3 sm:mb-4"
            />
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-title text-cream-100 mb-2 sm:mb-4">
              The Session
            </h1>
            <p className="text-lg sm:text-2xl text-stout-300 mb-1 sm:mb-3">
              Dublin&apos;s pub companion
            </p>
            <p className="text-sm sm:text-base text-stout-400 max-w-lg mx-auto hidden sm:block">
              Real reviews from real locals. No tourist traps, no guesswork.
              Just honest intel on pubs, prices, and what&apos;s on tonight.
            </p>
          </div>

          {/* Search Bar - Mobile Prominent */}
          <div className="max-w-xl mx-auto mb-6">
            <SmartSearch
              placeholder="Search pubs, areas, or drinks..."
              className="w-full"
            />
          </div>

          {/* Stout Index - Compact */}
          <div className="max-w-sm mx-auto">
            <StoutIndex />
          </div>
        </div>
      </section>

      {/* === QUICK ACTIONS === */}
      <QuickActionGrid />

      {/* === WHAT'S ON - Sports & Events === */}
      <WhatsOnTonight pubEvents={todayEvents} />

      {/* === ACTIVE DEALS === */}
      <DealsCarousel deals={deals} />

      {/* === TOP RATED PUBS === */}
      <section className="py-6 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-cream-100">Top Rated</h2>
              <p className="text-sm text-stout-400">Highest rated by the community</p>
            </div>
            <Link href="/pubs?sort=rating" className="text-sm text-irish-green-500 hover:text-irish-green-400 font-medium">
              See all
            </Link>
          </div>

          {topRated.length > 0 ? (
            <>
              {/* Mobile: horizontal scroll */}
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 sm:hidden">
                {topRated.map((pub) => (
                  <div key={pub.id} className="flex-shrink-0 w-[280px] snap-start">
                    <PubCard pub={pub} />
                  </div>
                ))}
              </div>
              {/* Desktop: grid */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {topRated.map((pub) => (
                  <PubCard key={pub.id} pub={pub} />
                ))}
              </div>
            </>
          ) : (
            <p className="text-stout-400 text-center py-8">No reviews yet. Be the first to rate a pub!</p>
          )}
        </div>
      </section>

      {/* === BEST VALUE === */}
      {bestValue.length > 0 && (
        <section className="py-6 sm:py-10 bg-stout-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-cream-100">Best Value</h2>
                <p className="text-sm text-stout-400">Quality pubs, fair prices</p>
              </div>
              <Link href="/pubs?sort=value" className="text-sm text-irish-green-500 hover:text-irish-green-400 font-medium">
                See all
              </Link>
            </div>

            <div className="grid gap-2 sm:gap-3">
              {bestValue.map((pub, index) => (
                <Link
                  key={pub.id}
                  href={`/pubs/${pub.slug}`}
                  className="flex items-center justify-between bg-stout-800 rounded-xl p-3 sm:p-4 border border-stout-700 hover:border-irish-green-600 transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-irish-green-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-irish-green-500 font-bold text-sm sm:text-base">#{index + 1}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-cream-100 font-medium text-sm sm:text-base truncate">{pub.name}</p>
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span className="text-yellow-400 flex items-center gap-0.5">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {pub.avg_rating?.toFixed(1)}
                        </span>
                        <span className="text-stout-400 truncate">{pub.address}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <span className="text-lg sm:text-2xl font-bold text-irish-green-500">
                      {formatPrice(pub.cheapest_guinness)}
                    </span>
                    <p className="text-[10px] sm:text-xs text-stout-400">Guinness</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* === RECENTLY UPDATED === */}
      {recentlyVerified.length > 0 && (
        <section className="py-6 sm:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-cream-100">Fresh Prices</h2>
                <p className="text-sm text-stout-400">Recently verified by the community</p>
              </div>
              <Link href="/pubs" className="text-sm text-irish-green-500 hover:text-irish-green-400 font-medium">
                See all
              </Link>
            </div>

            {/* Mobile: horizontal scroll */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 sm:hidden">
              {recentlyVerified.slice(0, 5).map((pub) => (
                <div key={pub.id} className="flex-shrink-0 w-[280px] snap-start">
                  <PubCard pub={pub} />
                </div>
              ))}
            </div>
            {/* Desktop: grid */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentlyVerified.slice(0, 3).map((pub) => (
                <PubCard key={pub.id} pub={pub} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* === CTA SECTION === */}
      <section className="py-10 sm:py-16 bg-gradient-to-r from-irish-green-700 to-irish-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
            Know Your Local?
          </h2>
          <p className="text-base sm:text-lg text-irish-green-100 mb-6 sm:mb-8 max-w-xl mx-auto">
            Share prices, write reviews, and help Dubliners find a good pint without breaking the bank.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/register"
              className="inline-block bg-white hover:bg-cream-100 text-irish-green-700 font-semibold py-3 px-8 rounded-xl transition-colors"
            >
              Join The Session
            </Link>
            <Link
              href="/pubs/join"
              className="inline-block bg-irish-green-800/50 hover:bg-irish-green-800 text-white font-semibold py-3 px-8 rounded-xl transition-colors border border-irish-green-500/30"
            >
              List Your Pub
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
