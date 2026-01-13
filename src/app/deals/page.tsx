import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { formatPrice, formatRelativeTime } from '@/lib/utils';

export const revalidate = 60;

async function getDeals() {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('prices')
    .select(`
      *,
      drink:drinks(*),
      pub:pubs(*)
    `)
    .eq('is_deal', true)
    .order('created_at', { ascending: false });

  return data || [];
}

export default async function DealsPage() {
  const deals = await getDeals();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-cream-100 mb-2">Current Deals</h1>
          <p className="text-stout-400">
            Happy hours, specials, and limited-time offers from pubs across Dublin
          </p>
        </div>
        <Link
          href="/deals/add"
          className="inline-block bg-irish-green-600 hover:bg-irish-green-700 text-white font-medium px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
        >
          + Add a Deal
        </Link>
      </div>

      {deals.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => (
            <Link
              key={deal.id}
              href={`/pubs/${deal.pub?.id}`}
              className="bg-gradient-to-br from-amber-900/30 to-stout-800 rounded-lg border border-amber-700/50 hover:border-amber-600 transition-all hover:scale-[1.02] p-6"
            >
              {/* Deal Badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-amber-500 text-stout-900 text-xs font-bold px-2 py-1 rounded">
                  DEAL
                </span>
                <span className="text-sm text-stout-400">
                  {formatRelativeTime(deal.created_at)}
                </span>
              </div>

              {/* Drink and Price */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-lg font-semibold text-cream-100">{deal.drink?.name}</p>
                  <p className="text-sm text-stout-400">
                    {deal.drink?.category === 'cider' ? 'Cider' : 'Beer'}
                  </p>
                </div>
                <span className="text-3xl font-bold text-irish-green-500">
                  {formatPrice(deal.price)}
                </span>
              </div>

              {/* Pub Info */}
              <div className="pt-3 border-t border-stout-700">
                <p className="text-cream-100 font-medium">{deal.pub?.name}</p>
                <p className="text-sm text-stout-400">{deal.pub?.address}</p>
              </div>

              {/* Deal Description */}
              {deal.deal_description && (
                <div className="mt-3 bg-amber-500/10 rounded p-3">
                  <p className="text-amber-300 text-sm">{deal.deal_description}</p>
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <svg
            className="w-16 h-16 text-stout-600 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-cream-100 mb-2">No deals at the moment</h2>
          <p className="text-stout-400 mb-4">
            Know about a deal? Help the community by sharing it!
          </p>
          <Link
            href="/deals/add"
            className="inline-block bg-irish-green-600 hover:bg-irish-green-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Add a Deal
          </Link>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-12 bg-stout-800 rounded-lg border border-stout-700 p-6">
        <h2 className="text-lg font-semibold text-cream-100 mb-3">About Deals</h2>
        <p className="text-stout-400 text-sm">
          Deals are submitted by users and may have specific times or conditions.
          We recommend confirming with the pub before visiting. If you find a deal
          that&apos;s no longer valid, please report it so we can keep the information accurate.
        </p>
      </div>
    </div>
  );
}
