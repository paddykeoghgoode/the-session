import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient, getUser } from '@/lib/supabase-server';
import { formatDate, formatPrice } from '@/lib/utils';
import StarRating from '@/components/StarRating';

export const revalidate = 0; // No caching for user-specific pages

async function getProfile(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

async function getUserPrices(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('prices')
    .select(`
      *,
      drink:drinks(*),
      pub:pubs(id, name)
    `)
    .eq('submitted_by', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  return data || [];
}

async function getUserReviews(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('reviews')
    .select(`
      *,
      pub:pubs(id, name)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  return data || [];
}

export default async function ProfilePage() {
  const user = await getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const [profile, prices, reviews] = await Promise.all([
    getProfile(user.id),
    getUserPrices(user.id),
    getUserReviews(user.id),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-stout-800 rounded-lg border border-stout-700 p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-cream-100">
              {profile?.display_name || profile?.username || 'User'}
              {profile?.is_verified_local && (
                <span className="ml-3 text-sm bg-irish-green-600 text-white px-3 py-1 rounded-full">
                  Verified Local
                </span>
              )}
            </h1>
            <p className="text-stout-400">@{profile?.username || 'anonymous'}</p>
            <p className="text-sm text-stout-500 mt-1">
              Member since {formatDate(profile?.created_at || user.created_at)}
            </p>
          </div>

          <div className="flex gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-irish-green-500">
                {profile?.total_contributions || 0}
              </p>
              <p className="text-sm text-stout-400">Contributions</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-cream-100">{prices.length}</p>
              <p className="text-sm text-stout-400">Prices</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-cream-100">{reviews.length}</p>
              <p className="text-sm text-stout-400">Reviews</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Submitted Prices */}
        <div>
          <h2 className="text-xl font-bold text-cream-100 mb-4">Your Price Submissions</h2>

          {prices.length > 0 ? (
            <div className="space-y-3">
              {prices.map((price) => (
                <Link
                  key={price.id}
                  href={`/pubs/${price.pub?.id}`}
                  className="block bg-stout-800 rounded-lg border border-stout-700 p-4 hover:border-stout-500 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-cream-100 font-medium">{price.pub?.name}</p>
                      <p className="text-sm text-stout-400">
                        {price.drink?.name} - {formatDate(price.created_at)}
                      </p>
                      {price.is_deal && (
                        <span className="inline-block mt-1 text-xs bg-amber-500 text-stout-900 px-2 py-0.5 rounded">
                          DEAL
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-irish-green-500">
                        {formatPrice(price.price)}
                      </p>
                      <p className="text-xs text-stout-400">
                        {price.upvotes - price.downvotes > 0 ? '+' : ''}
                        {price.upvotes - price.downvotes} votes
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-stout-800 rounded-lg border border-stout-700 p-8 text-center">
              <p className="text-stout-400 mb-4">You haven&apos;t submitted any prices yet.</p>
              <Link
                href="/pubs"
                className="text-irish-green-500 hover:text-irish-green-400"
              >
                Browse pubs to add prices
              </Link>
            </div>
          )}
        </div>

        {/* Submitted Reviews */}
        <div>
          <h2 className="text-xl font-bold text-cream-100 mb-4">Your Reviews</h2>

          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((review) => {
                const avgRating = [
                  review.pint_quality,
                  review.ambience,
                  review.food_quality,
                  review.staff_friendliness,
                  review.safety,
                  review.value_for_money,
                ].filter((r): r is number => r !== null);
                const avg = avgRating.length > 0
                  ? avgRating.reduce((a, b) => a + b, 0) / avgRating.length
                  : 0;

                return (
                  <Link
                    key={review.id}
                    href={`/pubs/${review.pub?.id}`}
                    className="block bg-stout-800 rounded-lg border border-stout-700 p-4 hover:border-stout-500 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-cream-100 font-medium">{review.pub?.name}</p>
                        <p className="text-sm text-stout-400">
                          {formatDate(review.created_at)}
                        </p>
                      </div>
                      <StarRating rating={avg} size="sm" showValue />
                    </div>
                    {review.comment && (
                      <p className="text-sm text-stout-300 line-clamp-2">{review.comment}</p>
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-stout-800 rounded-lg border border-stout-700 p-8 text-center">
              <p className="text-stout-400 mb-4">You haven&apos;t written any reviews yet.</p>
              <Link
                href="/pubs"
                className="text-irish-green-500 hover:text-irish-green-400"
              >
                Browse pubs to leave reviews
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Account Actions */}
      <div className="mt-8 pt-8 border-t border-stout-700">
        <h2 className="text-lg font-semibold text-cream-100 mb-4">Account</h2>
        <p className="text-sm text-stout-400 mb-2">
          Signed in as: <span className="text-cream-100">{user.email}</span>
        </p>
      </div>
    </div>
  );
}
