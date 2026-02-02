import Link from 'next/link';
import { createServerSupabaseClient, getUser } from '@/lib/supabase-server';

export const metadata = {
  title: 'Dublin Pub Guides - The Session',
  description: 'Expert guides to Dublin\'s best pubs - from local favorites to hidden gems',
};

interface Guide {
  id: string;
  title: string;
  description: string;
  icon: string;
  isPremium: boolean;
  slug: string;
}

const guides: Guide[] = [
  {
    id: '1',
    title: 'Best Guinness in Dublin',
    description: 'Our curated list of the top 10 pubs serving the creamiest, best-poured pints of Guinness in the city.',
    icon: '🍺',
    isPremium: true,
    slug: 'best-guinness',
  },
  {
    id: '2',
    title: 'Hidden Gems & Local Secrets',
    description: 'Discover the pubs that tourists don\'t know about - authentic local spots away from the crowds.',
    icon: '💎',
    isPremium: true,
    slug: 'hidden-gems',
  },
  {
    id: '3',
    title: 'Tourist Trap Warning List',
    description: 'Avoid overpriced drinks and mediocre experiences. We reveal which Temple Bar spots to skip.',
    icon: '⚠️',
    isPremium: true,
    slug: 'tourist-traps',
  },
  {
    id: '4',
    title: 'Best Late Night Bars',
    description: 'Where to go when everywhere else closes. Late bars with atmosphere and fair prices.',
    icon: '🌙',
    isPremium: true,
    slug: 'late-night',
  },
  {
    id: '5',
    title: 'Traditional Irish Pubs',
    description: 'Experience authentic Irish pub culture - pubs with real character, history, and trad sessions.',
    icon: '🎵',
    isPremium: false,
    slug: 'traditional-pubs',
  },
  {
    id: '6',
    title: 'Best Pub Food in Dublin',
    description: 'From hearty stews to gourmet gastropub fare - where to eat well with your pint.',
    icon: '🍽️',
    isPremium: true,
    slug: 'best-pub-food',
  },
  {
    id: '7',
    title: 'Best Beer Gardens',
    description: 'Outdoor drinking spots for when the sun comes out (yes, it happens!).',
    icon: '☀️',
    isPremium: false,
    slug: 'beer-gardens',
  },
  {
    id: '8',
    title: 'Best Nightclubs & Late Venues',
    description: 'The definitive guide to Dublin nightlife - from buzzing clubs to intimate late bars.',
    icon: '🎉',
    isPremium: true,
    slug: 'nightclubs',
  },
];

export default async function GuidesPage() {
  const user = await getUser();
  const isPremiumUser = false; // TODO: Check if user has premium subscription

  const freeGuides = guides.filter(g => !g.isPremium);
  const premiumGuides = guides.filter(g => g.isPremium);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-cream-100 mb-4">Dublin Pub Guides</h1>
        <p className="text-stout-400 max-w-2xl mx-auto">
          Expert guides curated by locals who know Dublin's pub scene inside out.
          From the best Guinness to hidden gems the tourists never find.
        </p>
      </div>

      {/* Free Guides */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-cream-100 mb-6">Free Guides</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {freeGuides.map((guide) => (
            <Link
              key={guide.id}
              href={`/guides/${guide.slug}`}
              className="bg-stout-800 rounded-lg border border-stout-700 p-6 hover:border-irish-green-600 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">{guide.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-cream-100 group-hover:text-irish-green-400 transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-stout-400 text-sm mt-2">{guide.description}</p>
                  <span className="inline-block mt-3 text-irish-green-500 text-sm font-medium">
                    Read guide &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Premium Guides */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-cream-100">Premium Guides</h2>
          {!isPremiumUser && (
            <span className="text-amber-400 text-sm bg-amber-500/10 px-3 py-1 rounded-full">
              Unlock all for €4.99
            </span>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {premiumGuides.map((guide) => (
            <div
              key={guide.id}
              className={`bg-stout-800 rounded-lg border p-6 relative ${
                isPremiumUser
                  ? 'border-stout-700 hover:border-irish-green-600 cursor-pointer'
                  : 'border-amber-700/30'
              }`}
            >
              {!isPremiumUser && (
                <div className="absolute top-3 right-3">
                  <span className="bg-amber-500 text-stout-900 text-xs font-bold px-2 py-1 rounded">
                    PREMIUM
                  </span>
                </div>
              )}
              <div className="flex items-start gap-4">
                <span className="text-4xl opacity-80">{guide.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-cream-100 pr-16">
                    {guide.title}
                  </h3>
                  <p className="text-stout-400 text-sm mt-2">{guide.description}</p>
                  {isPremiumUser ? (
                    <Link
                      href={`/guides/${guide.slug}`}
                      className="inline-block mt-3 text-irish-green-500 text-sm font-medium"
                    >
                      Read guide &rarr;
                    </Link>
                  ) : (
                    <span className="inline-block mt-3 text-amber-400 text-sm">
                      🔒 Premium only
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Premium CTA */}
        {!isPremiumUser && (
          <div className="mt-12 bg-gradient-to-br from-amber-900/30 to-stout-800 rounded-lg border border-amber-700/50 p-8 text-center">
            <h3 className="text-2xl font-bold text-cream-100 mb-4">
              Unlock All Premium Guides
            </h3>
            <p className="text-stout-300 mb-6 max-w-xl mx-auto">
              Get lifetime access to all premium guides including our exclusive lists of
              the best Guinness spots, hidden gems, and places to avoid. One payment, forever access.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={user ? '/premium/checkout' : '/auth/login?redirect=/guides'}
                className="bg-amber-500 hover:bg-amber-600 text-stout-900 font-bold py-3 px-8 rounded-lg transition-colors"
              >
                Get Premium Access - €4.99
              </Link>
              <span className="text-stout-400 text-sm">One-time payment, no subscription</span>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-stout-400">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-irish-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                6 premium guides
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-irish-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Curated by locals
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-irish-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Updated regularly
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
