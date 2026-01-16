import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createServerSupabaseClient, getUser } from '@/lib/supabase-server';
import StarRating from '@/components/StarRating';
import PriceTable from '@/components/PriceTable';
import ReviewForm from '@/components/ReviewForm';
import AmenityVoting from '@/components/AmenityVoting';
import QuickAddPrice from '@/components/QuickAddPrice';
import ShareButton from '@/components/ShareButton';
import PhotoUpload from '@/components/PhotoUpload';
import AdminPubEditor from '@/components/AdminPubEditor';
import SocialLinks from '@/components/SocialLinks';
import OpenStatus from '@/components/OpenStatus';
import PriceFreshness from '@/components/PriceFreshness';
import PubAmenities from '@/components/PubAmenities';
import PubEvents from '@/components/PubEvents';
import PubLikeButton from '@/components/PubLikeButton';
import CreamRating from '@/components/CreamRating';
import PriceHistoryGraph from '@/components/PriceHistoryGraph';
import ReportButton from '@/components/ReportButton';
import AdminDealManager from '@/components/AdminDealManager';
import { formatDate, getGoogleMapsUrl, getGoogleMapsDirectionsUrl, calculateAverageRating, formatEircode, getEircodeMapUrl, formatDayHours, hasOpeningHours, formatPrice, type DayOfWeek } from '@/lib/utils';
import type { Pub, Price, Review, PubPhoto, Drink, Profile } from '@/types';

export const revalidate = 60;

async function getPub(idOrSlug: string): Promise<Pub | null> {
  const supabase = await createServerSupabaseClient();

  // Check if it's a UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isUuid = uuidRegex.test(idOrSlug);

  if (isUuid) {
    const { data } = await supabase
      .from('pubs')
      .select('*')
      .eq('id', idOrSlug)
      .single();
    return data;
  } else {
    const { data } = await supabase
      .from('pubs')
      .select('*')
      .eq('slug', idOrSlug)
      .single();
    return data;
  }
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
    .eq('is_approved', true)
    .order('created_at', { ascending: false });
  return data || [];
}

async function getPhotos(pubId: string): Promise<PubPhoto[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('pub_photos')
    .select('*')
    .eq('pub_id', pubId)
    .eq('is_approved', true)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: false });
  return data || [];
}

async function getDrinks(): Promise<Drink[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('drinks')
    .select('*')
    .order('name');
  return data || [];
}

async function getUserProfile(userId: string): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

export default async function PubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idOrSlug } = await params;

  const pub = await getPub(idOrSlug);

  if (!pub) {
    notFound();
  }

  const [prices, reviews, photos, drinks, user] = await Promise.all([
    getPrices(pub.id),
    getReviews(pub.id),
    getPhotos(pub.id),
    getDrinks(),
    getUser(),
  ]);

  // Check if user is admin
  const userProfile = user ? await getUserProfile(user.id) : null;
  const isAdmin = userProfile?.is_admin ?? false;

  // Separate regular prices from deals
  const regularPrices = prices.filter(p => !p.is_deal);
  const deals = prices.filter(p => p.is_deal);

  // Calculate average rating (exclude food rating if pub doesn't serve food)
  const excludeFood = !pub.has_food;
  const avgRatings = reviews.reduce(
    (acc, review) => {
      const rating = calculateAverageRating(review, { excludeFood });
      if (rating > 0) {
        acc.total += rating;
        acc.count += 1;
      }
      return acc;
    },
    { total: 0, count: 0 }
  );
  const overallRating = avgRatings.count > 0 ? avgRatings.total / avgRatings.count : 0;

  // Get cheapest pint (excluding deals)
  const cheapestPint = regularPrices.length > 0
    ? regularPrices.reduce((min, p) => (!min || p.price < min.price) ? p : min, regularPrices[0])
    : null;

  // Get most recent price update
  const mostRecentPrice = prices.length > 0
    ? prices.reduce((latest, p) => {
        const pDate = new Date(p.created_at);
        const latestDate = new Date(latest.created_at);
        return pDate > latestDate ? p : latest;
      }, prices[0])
    : null;

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

      {/* Admin Editor */}
      {isAdmin && (
        <div className="space-y-4 mb-6">
          <AdminPubEditor pub={pub} />
          <AdminDealManager pubId={pub.id} pubName={pub.name} drinks={drinks} existingDeals={deals} />
        </div>
      )}

      {/* Moderation Status Banners */}
      {pub.moderation_status === 'temporarily_closed' && (
        <div className="bg-amber-900/50 border border-amber-700 rounded-lg p-4 mb-4">
          <p className="text-amber-300 font-medium text-center">
            This pub is temporarily closed
          </p>
        </div>
      )}
      {pub.moderation_status === 'renovating' && (
        <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4 mb-4">
          <p className="text-blue-300 font-medium text-center">
            This pub is currently renovating
          </p>
        </div>
      )}
      {pub.moderation_status === 'members_only' && (
        <div className="bg-purple-900/50 border border-purple-700 rounded-lg p-4 mb-4">
          <p className="text-purple-300 font-medium text-center">
            This is a members-only venue
          </p>
        </div>
      )}
      {(pub.is_permanently_closed || pub.moderation_status === 'permanently_closed') && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-4">
          <p className="text-red-300 font-medium text-center">
            This pub is permanently closed
          </p>
        </div>
      )}

      {/* Header */}
      <div className={`bg-stout-800 rounded-lg border border-stout-700 p-6 mb-8 ${pub.is_permanently_closed ? 'opacity-80' : ''}`}>
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-3xl font-bold text-cream-100">{pub.name}</h1>
              {/* Open/Closed Status */}
              {hasOpeningHours(pub) && !pub.is_permanently_closed && (
                <OpenStatus pub={pub} />
              )}
            </div>
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
            {reviews.length > 0 ? (
              <div className="flex items-center gap-3 mb-4">
                <StarRating rating={overallRating} showValue />
                <span className="text-stout-400">
                  ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            ) : (
              <p className="text-stout-500 mb-4">No ratings yet</p>
            )}

            {/* Social Links & Contact - Enhanced */}
            <div className="mb-4">
              <SocialLinks
                phone={pub.phone}
                email={pub.email}
                website={pub.website}
                facebook={pub.facebook}
                instagram={pub.instagram}
                twitter={pub.twitter}
              />
            </div>

            {/* Amenities - V2 display */}
            <PubAmenities pub={pub} variant="compact" />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
            {/* Like Button */}
            <PubLikeButton
              pubId={pub.id}
              initialLikeCount={pub.like_count || 0}
              size="md"
            />
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
            <ShareButton
              title={`${pub.name} - The Session`}
              text={`Check out ${pub.name} on The Session - Dublin's pub price tracker!`}
            />
            <ReportButton
              entityType="pub"
              entityId={pub.id}
              entityName={pub.name}
            />
          </div>
        </div>

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

      {/* Quick Decision Summary - Now with separated metrics */}
      {regularPrices.length > 0 && (
        <div className="bg-gradient-to-r from-stout-800 to-stout-800/50 rounded-lg border border-stout-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-cream-100">At a Glance</h2>
            {mostRecentPrice && (
              <PriceFreshness lastUpdated={mostRecentPrice.created_at} />
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Cheapest Pint - From regular prices only */}
            {cheapestPint && (
              <div className="bg-stout-700/50 rounded-lg p-3">
                <p className="text-xs text-stout-400 mb-1">Cheapest Pint</p>
                <p className="text-xl font-bold text-irish-green-500">{formatPrice(cheapestPint.price)}</p>
                <p className="text-xs text-stout-300">{cheapestPint.drink?.name}</p>
              </div>
            )}

            {/* Price Range - From regular prices only */}
            {regularPrices.length > 0 && (
              <div className="bg-stout-700/50 rounded-lg p-3">
                <p className="text-xs text-stout-400 mb-1">Price Range</p>
                <p className="text-xl font-bold text-cream-100">
                  {formatPrice(Math.min(...regularPrices.map(p => p.price)))} - {formatPrice(Math.max(...regularPrices.map(p => p.price)))}
                </p>
                <p className="text-xs text-stout-300">{regularPrices.length} {regularPrices.length === 1 ? 'drink' : 'drinks'} tracked</p>
              </div>
            )}

            {/* Rating */}
            <div className="bg-stout-700/50 rounded-lg p-3">
              <p className="text-xs text-stout-400 mb-1">Rating</p>
              {overallRating > 0 ? (
                <>
                  <p className="text-xl font-bold text-cream-100">{overallRating.toFixed(1)}/5</p>
                  <p className="text-xs text-stout-300">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold text-stout-500">-</p>
                  <p className="text-xs text-stout-400">No reviews yet</p>
                </>
              )}
            </div>

            {/* Photos Count */}
            <div className="bg-stout-700/50 rounded-lg p-3">
              <p className="text-xs text-stout-400 mb-1">Photos</p>
              <p className="text-xl font-bold text-cream-100">{photos.length}</p>
              <p className="text-xs text-stout-300">{photos.length === 1 ? 'photo' : 'photos'} uploaded</p>
            </div>
          </div>
        </div>
      )}

      {/* Active Deals Section - Separate from prices */}
      {deals.length > 0 && (
        <div className="bg-gradient-to-r from-amber-900/20 to-amber-900/5 rounded-lg border border-amber-700/50 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
            </svg>
            <h2 className="text-lg font-semibold text-amber-400">Active Deals</h2>
            <span className="ml-auto text-sm text-amber-500">{deals.length} {deals.length === 1 ? 'deal' : 'deals'}</span>
          </div>
          <div className="space-y-3">
            {deals.map((deal) => (
              <div key={deal.id} className="bg-stout-800/50 rounded-lg p-4 border border-stout-700">
                <div className="flex justify-between items-start">
                  <div>
                    {deal.deal_title && (
                      <p className="font-semibold text-cream-100">{deal.deal_title}</p>
                    )}
                    <p className="text-stout-300">
                      {deal.deal_type === 'food_combo' && deal.food_item && deal.drink ? (
                        <>{deal.food_item} + {deal.drink.name}</>
                      ) : deal.deal_type === 'food_only' && deal.food_item ? (
                        deal.food_item
                      ) : deal.drink ? (
                        deal.drink.name
                      ) : (
                        deal.deal_description || 'Special Deal'
                      )}
                    </p>
                    {deal.deal_description && deal.deal_title && (
                      <p className="text-sm text-stout-400 mt-1">{deal.deal_description}</p>
                    )}
                    {deal.deal_schedule && (
                      <p className="text-xs text-amber-400 mt-1">{deal.deal_schedule}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-amber-500">{formatPrice(deal.price)}</p>
                    <PriceFreshness lastUpdated={deal.created_at} showLabel={false} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-stout-500 mt-3">
            Deals are time-limited promotions and don&apos;t affect regular pint prices
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Prices Section - Regular prices only */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-cream-100">Pint Prices</h2>
              {mostRecentPrice && regularPrices.length > 0 && (
                <span className="text-xs text-stout-400">
                  {regularPrices.length} {regularPrices.length === 1 ? 'drink' : 'drinks'} tracked
                </span>
              )}
            </div>
            <PriceTable prices={regularPrices} userId={user?.id} pubId={pub.id} drinks={drinks} />
          </section>

          {/* Photos Section */}
          {photos.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-cream-100 mb-4">Photos</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.slice(0, 6).map((photo) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square bg-stout-800 rounded-lg overflow-hidden border border-stout-700"
                  >
                    <Image
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pub-photos/${photo.storage_path}`}
                      alt={photo.caption || pub.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform"
                    />
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <p className="text-white text-xs truncate">{photo.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

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
                      <StarRating rating={calculateAverageRating(review, { excludeFood })} size="sm" showValue />
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
                      {pub.has_food && review.food_quality && (
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
          {/* Cream Index Rating */}
          <CreamRating
            pubId={pub.id}
            avgCreamScore={pub.avg_cream_score}
            creamRatingCount={pub.cream_rating_count}
          />

          {/* Guinness Price History */}
          <PriceHistoryGraph
            pubId={pub.id}
            drinkId={1}
            drinkName="Guinness"
          />

          {/* Events & Sessions */}
          <PubEvents pubId={pub.id} />

          {user ? (
            <>
              {/* Add Review Form */}
              <div className="bg-stout-800 rounded-lg border border-stout-700 p-4">
                <h3 className="text-lg font-semibold text-cream-100 mb-4">Write a Review</h3>
                <ReviewForm pubId={pub.id} hasFood={pub.has_food} />
              </div>

              {/* Add Photo */}
              <PhotoUpload pubId={pub.id} userId={user.id} />
            </>
          ) : (
            <div className="bg-stout-800 rounded-lg border border-stout-700 p-6 text-center">
              <h3 className="text-lg font-semibold text-cream-100 mb-2">Want to contribute?</h3>
              <p className="text-stout-400 mb-4">
                Sign in to submit reviews
              </p>
              <Link
                href="/auth/login"
                className="inline-block bg-irish-green-600 hover:bg-irish-green-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Amenity Voting */}
          <AmenityVoting
            pubId={pub.id}
            currentValues={{
              has_food: pub.has_food,
              has_live_music: pub.has_live_music,
              shows_sports: pub.shows_sports,
              has_outdoor_seating: pub.has_outdoor_seating,
              has_pool: pub.has_pool,
              has_darts: pub.has_darts,
              has_board_games: pub.has_board_games,
              is_speakeasy: pub.is_speakeasy,
            }}
            userId={user?.id}
          />
        </div>
      </div>

      {/* Quick Add Price Button */}
      <QuickAddPrice pubId={pub.id} pubName={pub.name} userId={user?.id} />
    </div>
  );
}
