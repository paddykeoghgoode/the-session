import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient, getUser } from '@/lib/supabase-server';
import type { Pub, PubOwner, Review, Price } from '@/types';
import StarRating from '@/components/StarRating';
import { formatPrice, formatDate } from '@/lib/utils';

export const revalidate = 0; // Always fresh for dashboard

async function getOwnedPubs(userId: string) {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('pub_owners')
    .select(`
      *,
      pub:pubs(*)
    `)
    .eq('user_id', userId)
    .eq('is_active', true);

  return (data || []) as PubOwner[];
}

async function getPubStats(pubId: string) {
  const supabase = await createServerSupabaseClient();

  // Get reviews
  const { data: reviews, count: reviewCount } = await supabase
    .from('reviews')
    .select('*, profile:profiles(username, display_name)', { count: 'exact' })
    .eq('pub_id', pubId)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get recent prices
  const { data: prices } = await supabase
    .from('prices')
    .select('*, drink:drinks(*), profile:profiles(username, display_name)')
    .eq('pub_id', pubId)
    .order('created_at', { ascending: false })
    .limit(10);

  // Get check-ins last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: checkInCount } = await supabase
    .from('check_ins')
    .select('*', { count: 'exact', head: true })
    .eq('pub_id', pubId)
    .gte('created_at', sevenDaysAgo);

  // Get likes
  const { count: likeCount } = await supabase
    .from('pub_likes')
    .select('*', { count: 'exact', head: true })
    .eq('pub_id', pubId);

  return {
    reviews: reviews || [],
    reviewCount: reviewCount || 0,
    prices: prices || [],
    checkInCount: checkInCount || 0,
    likeCount: likeCount || 0,
  };
}

export default async function OwnerDashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const ownedPubs = await getOwnedPubs(user.id);

  if (ownedPubs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-stout-800 rounded-lg border border-stout-700 p-8 text-center">
          <h1 className="text-2xl font-bold text-cream-100 mb-4">
            Claim Your Pub
          </h1>
          <p className="text-stout-300 mb-6">
            You don't have any claimed pubs yet. If you own or manage a pub,
            you can claim it to access analytics, respond to reviews, and promote deals.
          </p>
          <Link
            href="/pubs"
            className="inline-block bg-irish-green-600 hover:bg-irish-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Find Your Pub to Claim
          </Link>
        </div>
      </div>
    );
  }

  // For now, show the first pub (later we can add multi-pub management)
  const pubOwnership = ownedPubs[0];
  const pub = pubOwnership.pub as Pub;
  const stats = await getPubStats(pub.id);

  const avgRating = pub.avg_rating || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cream-100 mb-2">
          {pub.name}
        </h1>
        <p className="text-stout-400">{pub.address}</p>
        <div className="flex gap-4 mt-4">
          <Link
            href={`/pubs/${pub.id}`}
            className="text-irish-green-500 hover:text-irish-green-400 text-sm"
          >
            View Public Page →
          </Link>
          <Link
            href={`/owner/pubs/${pub.id}/edit`}
            className="text-irish-green-500 hover:text-irish-green-400 text-sm"
          >
            Edit Info →
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-stout-800 rounded-lg border border-stout-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-stout-400 text-sm">Average Rating</p>
              <p className="text-3xl font-bold text-cream-100">{avgRating.toFixed(1)}</p>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
          <p className="text-sm text-stout-400 mt-2">
            {stats.reviewCount} {stats.reviewCount === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        <div className="bg-stout-800 rounded-lg border border-stout-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-stout-400 text-sm">Check-ins (7 days)</p>
              <p className="text-3xl font-bold text-cream-100">{stats.checkInCount}</p>
            </div>
            <div className="text-4xl">📍</div>
          </div>
          <p className="text-sm text-stout-400 mt-2">People visited</p>
        </div>

        <div className="bg-stout-800 rounded-lg border border-stout-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-stout-400 text-sm">Likes</p>
              <p className="text-3xl font-bold text-cream-100">{stats.likeCount}</p>
            </div>
            <div className="text-4xl">❤️</div>
          </div>
          <p className="text-sm text-stout-400 mt-2">Saved by users</p>
        </div>

        <div className="bg-stout-800 rounded-lg border border-stout-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-stout-400 text-sm">Cheapest Pint</p>
              <p className="text-3xl font-bold text-cream-100">
                {pub.cheapest_guinness ? formatPrice(pub.cheapest_guinness) : 'N/A'}
              </p>
            </div>
            <div className="text-4xl">🍺</div>
          </div>
          <p className="text-sm text-stout-400 mt-2">Guinness price</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Reviews */}
        <div className="bg-stout-800 rounded-lg border border-stout-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-cream-100">Recent Reviews</h2>
            {pubOwnership.can_respond_reviews && (
              <Link
                href={`/owner/pubs/${pub.id}/reviews`}
                className="text-sm text-irish-green-500 hover:text-irish-green-400"
              >
                Respond →
              </Link>
            )}
          </div>

          {stats.reviews.length > 0 ? (
            <div className="space-y-4">
              {stats.reviews.map((review) => (
                <div key={review.id} className="border-b border-stout-700 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm text-stout-400">
                        {review.profile?.display_name || review.profile?.username || 'Anonymous'}
                      </p>
                      <p className="text-xs text-stout-500">
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                    <StarRating rating={review.avg_rating || 0} size="sm" />
                  </div>
                  {review.comment && (
                    <p className="text-sm text-cream-100">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-stout-400">No reviews yet</p>
          )}
        </div>

        {/* Recent Price Updates */}
        <div className="bg-stout-800 rounded-lg border border-stout-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-cream-100">Recent Prices</h2>
            {pubOwnership.can_add_prices && (
              <Link
                href={`/pubs/${pub.id}#prices`}
                className="text-sm text-irish-green-500 hover:text-irish-green-400"
              >
                Add Price →
              </Link>
            )}
          </div>

          {stats.prices.length > 0 ? (
            <div className="space-y-3">
              {stats.prices.map((price) => (
                <div key={price.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-cream-100">{price.drink?.name}</p>
                    <p className="text-xs text-stout-400">
                      by {price.submitter?.display_name || price.submitter?.username || 'Anonymous'}
                      {' • '}
                      {formatDate(price.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-irish-green-500">
                      {formatPrice(price.price)}
                    </p>
                    {price.is_deal && (
                      <span className="text-xs bg-amber-500 text-stout-900 px-2 py-0.5 rounded">
                        DEAL
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-stout-400">No prices submitted</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-stout-800 rounded-lg border border-stout-700 p-6">
        <h2 className="text-xl font-bold text-cream-100 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pubOwnership.can_edit_info && (
            <Link
              href={`/owner/pubs/${pub.id}/edit`}
              className="bg-stout-700 hover:bg-stout-600 border border-stout-600 rounded-lg p-4 transition-colors"
            >
              <div className="text-2xl mb-2">✏️</div>
              <p className="font-medium text-cream-100">Edit Pub Info</p>
              <p className="text-sm text-stout-400">Update hours, photos, amenities</p>
            </Link>
          )}

          {pubOwnership.can_add_deals && (
            <Link
              href={`/owner/pubs/${pub.id}/deals/new`}
              className="bg-stout-700 hover:bg-stout-600 border border-stout-600 rounded-lg p-4 transition-colors"
            >
              <div className="text-2xl mb-2">🎉</div>
              <p className="font-medium text-cream-100">Post a Deal</p>
              <p className="text-sm text-stout-400">Happy hours, specials</p>
            </Link>
          )}

          {pubOwnership.can_add_events && (
            <Link
              href={`/owner/pubs/${pub.id}/events/new`}
              className="bg-stout-700 hover:bg-stout-600 border border-stout-600 rounded-lg p-4 transition-colors"
            >
              <div className="text-2xl mb-2">📅</div>
              <p className="font-medium text-cream-100">Create Event</p>
              <p className="text-sm text-stout-400">Trad sessions, quiz nights</p>
            </Link>
          )}

          <Link
            href="/owner/upgrade"
            className="bg-irish-green-600 hover:bg-irish-green-700 border border-irish-green-500 rounded-lg p-4 transition-colors"
          >
            <div className="text-2xl mb-2">⭐</div>
            <p className="font-medium text-white">Upgrade to Pro</p>
            <p className="text-sm text-irish-green-100">Get analytics & promotion</p>
          </Link>
        </div>
      </div>

      {/* Upgrade Prompt */}
      <div className="mt-8 bg-gradient-to-r from-irish-green-600 to-irish-green-700 rounded-lg p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Upgrade to Pro</h3>
            <p className="text-irish-green-100 mb-4">
              Get detailed analytics, featured placement, and push notifications to nearby customers.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <span>✓</span>
                <span>Detailed analytics & insights</span>
              </li>
              <li className="flex items-center gap-2">
                <span>✓</span>
                <span>Featured in "Tonight" feed</span>
              </li>
              <li className="flex items-center gap-2">
                <span>✓</span>
                <span>Push deals to nearby users</span>
              </li>
              <li className="flex items-center gap-2">
                <span>✓</span>
                <span>Competitor pricing analysis</span>
              </li>
            </ul>
            <Link
              href="/owner/upgrade"
              className="inline-block bg-white text-irish-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-cream-100 transition-colors"
            >
              Upgrade Now - €49/month
            </Link>
          </div>
          <div className="text-6xl">📊</div>
        </div>
      </div>
    </div>
  );
}
