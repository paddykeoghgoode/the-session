import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient, getUser } from '@/lib/supabase-server';
import StarRating from '@/components/StarRating';
import PriceTable from '@/components/PriceTable';
import PriceForm from '@/components/PriceForm';
import ReviewForm from '@/components/ReviewForm';
import { formatDate, getGoogleMapsUrl, getGoogleMapsDirectionsUrl, calculateAverageRating, formatEircode, getEircodeMapUrl, formatDayHours, hasOpeningHours, type DayOfWeek } from '@/lib/utils';
import type { Pub, Price, Review } from '@/types';

export const revalidate = 60;

async function getPub(id: string): Promise<Pub | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('pubs')
    .select('*')
    .eq('id', id)
    .single();
  return data;
}

async function getPrices(pubId: string): Promise<Price[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('prices')
    .select(`
      *,
      drink:drinks(*)
    `)
    .eq('pub_id', pubId)
    .order('created_at', { ascending: false });
  return data || [];
}

async function getReviews(pubId: string): Promise<Review[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('reviews')
    .select(`
      *,
      profile:profiles(username, display_name, is_verified_local)
    `)
    .eq('pub_id', pubId)
    .order('created_at', { ascending: false });
  return data || [];
}

export default async function PubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [pub, prices, reviews, user] = await Promise.all([
    getPub(id),
    getPrices(id),
    getReviews(id),
    getUser(),
  ]);

  if (!pub) {
    notFound();
  }

  // Calculate average rating
  const avgRatings = reviews.reduce(
    (acc, review) => {
      const rating = calculateAverageRating(review);
      if (rating > 0) {
        acc.total += rating;
        acc.count += 1;
      }
      return acc;
    },
    { total: 0, count: 0 }
  );
  const overallRating = avgRatings.count > 0 ? avgRatings.total / avgRatings.count : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link href="/pubs" className="text-stout-400 hover:text-cream-100">
              Pubs
            </Link>
          </li>
          <li className="text-stout-600">/</li>
          <li className="text-cream-100">{pub.name}</li>
        </ol>
      </nav>

      {/* Permanently Closed Banner */}
      {pub.is_permanently_closed && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-4">
          <p className="text-red-300 font-medium text-center">
            This pub is permanently closed
          </p>
        </div>
      )}

      {/* Header */}
      <div className={`bg-stout-800 rounded-lg border border-stout-700 p-6 mb-8 ${pub.is_permanently_closed ? 'opacity-80' : ''}`}>
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-cream-100 mb-2">{pub.name}</h1>
            <p className="text-stout-400 mb-2">{pub.address}</p>

            {/* Eircode */}
            {pub.eircode && (
              <p className="text-sm mb-4">
                <span className="text-stout-500">Eircode: </span>
                <a
                  href={getEircodeMapUrl(pub.eircode)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-irish-green-500 hover:text-irish-green-400"
                >
                  {formatEircode(pub.eircode)}
                </a>
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={overallRating} showValue />
              <span className="text-stout-400">
                ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            {/* Amenities as Yes/No grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stout-400">Food:</span>
                <span className={pub.has_food ? 'text-irish-green-500' : 'text-stout-500'}>
                  {pub.has_food ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stout-400">Live Music:</span>
                <span className={pub.has_live_music ? 'text-irish-green-500' : 'text-stout-500'}>
                  {pub.has_live_music ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stout-400">Sports:</span>
                <span className={pub.shows_sports ? 'text-irish-green-500' : 'text-stout-500'}>
                  {pub.shows_sports ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stout-400">Outdoor Seating:</span>
                <span className={pub.has_outdoor_seating ? 'text-irish-green-500' : 'text-stout-500'}>
                  {pub.has_outdoor_seating ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={getGoogleMapsUrl(pub)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-stout-700 hover:bg-stout-600 text-cream-100 px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              View on Map
            </a>
            <a
              href={getGoogleMapsDirectionsUrl(pub)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-irish-green-600 hover:bg-irish-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Get Directions
            </a>
          </div>
        </div>

        {/* Contact Info */}
        {(pub.phone || pub.website) && (
          <div className="mt-6 pt-6 border-t border-stout-700 flex flex-wrap gap-6">
            {pub.phone && (
              <a href={`tel:${pub.phone}`} className="text-irish-green-500 hover:text-irish-green-400">
                {pub.phone}
              </a>
            )}
            {pub.website && (
              <a
                href={pub.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-irish-green-500 hover:text-irish-green-400"
              >
                Website
              </a>
            )}
          </div>
        )}

        {/* Opening Hours */}
        {hasOpeningHours(pub) && (
          <div className="mt-6 pt-6 border-t border-stout-700">
            <h3 className="text-sm font-semibold text-cream-100 mb-3">Opening Hours</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-sm">
              {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as DayOfWeek[]).map((day) => (
                <div key={day} className="bg-stout-700 rounded p-2">
                  <div className="text-stout-400 text-xs capitalize">{day.slice(0, 3)}</div>
                  <div className="text-cream-100">{formatDayHours(pub, day)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Prices Section */}
          <section>
            <h2 className="text-xl font-bold text-cream-100 mb-4">Pint Prices</h2>
            <PriceTable prices={prices} userId={user?.id} />
          </section>

          {/* Reviews Section */}
          <section>
            <h2 className="text-xl font-bold text-cream-100 mb-4">Reviews</h2>

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-stout-800 rounded-lg border border-stout-700 p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-cream-100 font-medium">
                          {review.profile?.display_name || review.profile?.username || 'Anonymous'}
                          {review.profile?.is_verified_local && (
                            <span className="ml-2 text-xs bg-irish-green-600 text-white px-2 py-0.5 rounded-full">
                              Verified Local
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-stout-400">{formatDate(review.created_at)}</p>
                      </div>
                      <StarRating rating={calculateAverageRating(review)} size="sm" showValue />
                    </div>

                    {/* Individual ratings */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                      {review.pint_quality && (
                        <div className="text-sm">
                          <span className="text-stout-400">Pint:</span>{' '}
                          <span className="text-cream-100">{review.pint_quality}/5</span>
                        </div>
                      )}
                      {review.ambience && (
                        <div className="text-sm">
                          <span className="text-stout-400">Ambience:</span>{' '}
                          <span className="text-cream-100">{review.ambience}/5</span>
                        </div>
                      )}
                      {review.staff_friendliness && (
                        <div className="text-sm">
                          <span className="text-stout-400">Staff:</span>{' '}
                          <span className="text-cream-100">{review.staff_friendliness}/5</span>
                        </div>
                      )}
                      {review.safety && (
                        <div className="text-sm">
                          <span className="text-stout-400">Safety:</span>{' '}
                          <span className="text-cream-100">{review.safety}/5</span>
                        </div>
                      )}
                      {review.value_for_money && (
                        <div className="text-sm">
                          <span className="text-stout-400">Value:</span>{' '}
                          <span className="text-cream-100">{review.value_for_money}/5</span>
                        </div>
                      )}
                      {review.food_quality && (
                        <div className="text-sm">
                          <span className="text-stout-400">Food:</span>{' '}
                          <span className="text-cream-100">{review.food_quality}/5</span>
                        </div>
                      )}
                    </div>

                    {review.comment && (
                      <p className="text-stout-300">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-stout-400 text-center py-8">
                No reviews yet. Be the first to review this pub!
              </p>
            )}
          </section>
        </div>

        {/* Sidebar - Forms */}
        <div className="space-y-6">
          {user ? (
            <>
              {/* Add Price Form */}
              <div className="bg-stout-800 rounded-lg border border-stout-700 p-4">
                <h3 className="text-lg font-semibold text-cream-100 mb-4">Add a Price</h3>
                <PriceForm pubId={pub.id} />
              </div>

              {/* Add Review Form */}
              <div className="bg-stout-800 rounded-lg border border-stout-700 p-4">
                <h3 className="text-lg font-semibold text-cream-100 mb-4">Write a Review</h3>
                <ReviewForm pubId={pub.id} />
              </div>
            </>
          ) : (
            <div className="bg-stout-800 rounded-lg border border-stout-700 p-6 text-center">
              <h3 className="text-lg font-semibold text-cream-100 mb-2">Want to contribute?</h3>
              <p className="text-stout-400 mb-4">
                Sign in to submit prices and reviews
              </p>
              <Link
                href="/auth/login"
                className="inline-block bg-irish-green-600 hover:bg-irish-green-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
