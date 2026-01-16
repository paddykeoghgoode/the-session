'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { getDistanceKm, formatDistance, formatPrice } from '@/lib/utils';
import StarRating from '@/components/StarRating';
import type { Pub } from '@/types';

interface PubWithDistance extends Pub {
  distance: number;
}

export default function NearbyPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [pubs, setPubs] = useState<PubWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(2); // km
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'rating'>('distance');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    hasFood: false,
    hasOutdoor: false,
    openNow: false,
  });
  const supabase = createClient();

  // Check if pub is currently open
  const isOpenNow = (pub: Pub): boolean => {
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[now.getDay()] as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    const openKey = `hours_${today}_open` as keyof Pub;
    const closeKey = `hours_${today}_close` as keyof Pub;
    const openTime = pub[openKey] as string | null;
    const closeTime = pub[closeKey] as string | null;

    if (!openTime || !closeTime) return false;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = openTime.split(':').map(Number);
    const [closeH, closeM] = closeTime.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    let closeMinutes = closeH * 60 + closeM;

    // Handle closing after midnight
    if (closeMinutes < openMinutes) closeMinutes += 24 * 60;

    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  };

  // Get user's location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError('Location access denied. Please enable location to find pubs near you.');
        } else {
          setError('Unable to get your location. Please try again.');
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Fetch pubs when location is available
  useEffect(() => {
    if (!location) return;

    const currentLocation = location; // Capture for closure

    async function fetchNearbyPubs() {
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from('pub_summaries')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (fetchError) {
        setError('Failed to load pubs');
        setLoading(false);
        return;
      }

      if (data) {
        // Calculate distance, apply filters, and sort
        let pubsWithDistance = data
          .map((pub) => ({
            ...pub,
            distance: getDistanceKm(
              currentLocation.lat,
              currentLocation.lng,
              pub.latitude!,
              pub.longitude!
            ),
          }))
          .filter((pub) => pub.distance <= maxDistance);

        // Apply filters
        if (filters.hasFood) {
          pubsWithDistance = pubsWithDistance.filter(p => p.has_food);
        }
        if (filters.hasOutdoor) {
          pubsWithDistance = pubsWithDistance.filter(p => p.has_outdoor_seating);
        }
        if (filters.openNow) {
          pubsWithDistance = pubsWithDistance.filter(p => isOpenNow(p));
        }
        if (maxPrice !== null) {
          pubsWithDistance = pubsWithDistance.filter(p =>
            p.cheapest_guinness && p.cheapest_guinness <= maxPrice
          );
        }

        // Sort
        if (sortBy === 'distance') {
          pubsWithDistance.sort((a, b) => a.distance - b.distance);
        } else if (sortBy === 'price') {
          pubsWithDistance.sort((a, b) => {
            const aPrice = a.cheapest_guinness || 999;
            const bPrice = b.cheapest_guinness || 999;
            return aPrice - bPrice;
          });
        } else if (sortBy === 'rating') {
          pubsWithDistance.sort((a, b) => {
            const aRating = a.avg_rating || 0;
            const bRating = b.avg_rating || 0;
            return bRating - aRating;
          });
        }

        setPubs(pubsWithDistance);
      }

      setLoading(false);
    }

    fetchNearbyPubs();
  }, [location, maxDistance, maxPrice, sortBy, filters, supabase]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cream-100 mb-2">Pubs Near You</h1>
        <p className="text-stout-400">Find the closest pints to your location</p>
      </div>

      {/* Filters */}
      {location && (
        <div className="mb-6 space-y-4">
          {/* Quick Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Distance */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-stout-400">Within:</span>
              <div className="flex gap-1">
                {[0.5, 1, 2, 5].map((km) => (
                  <button
                    key={km}
                    onClick={() => setMaxDistance(km)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      maxDistance === km
                        ? 'bg-irish-green-600 text-white'
                        : 'bg-stout-700 text-stout-300 hover:bg-stout-600'
                    }`}
                  >
                    {km < 1 ? `${km * 1000}m` : `${km}km`}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-stout-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'distance' | 'price' | 'rating')}
                className="px-3 py-1.5 rounded-lg bg-stout-700 text-cream-100 text-sm border border-stout-600 focus:outline-none focus:border-irish-green-500"
              >
                <option value="distance">Distance</option>
                <option value="price">Cheapest</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {/* More Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                showFilters || filters.hasFood || filters.hasOutdoor || filters.openNow || maxPrice
                  ? 'bg-irish-green-600 text-white'
                  : 'bg-stout-700 text-stout-300 hover:bg-stout-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {(filters.hasFood || filters.hasOutdoor || filters.openNow || maxPrice) && (
                <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded text-xs">
                  {[filters.hasFood, filters.hasOutdoor, filters.openNow, maxPrice].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="bg-stout-800 rounded-lg border border-stout-700 p-4 space-y-4">
              {/* Max Price */}
              <div>
                <label className="block text-sm text-stout-400 mb-2">Max Guinness Price</label>
                <div className="flex gap-2">
                  {[null, 6, 7, 8].map((price) => (
                    <button
                      key={price ?? 'any'}
                      onClick={() => setMaxPrice(price)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        maxPrice === price
                          ? 'bg-irish-green-600 text-white'
                          : 'bg-stout-700 text-stout-300 hover:bg-stout-600'
                      }`}
                    >
                      {price === null ? 'Any' : `€${price}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Toggles */}
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.openNow}
                    onChange={(e) => setFilters({ ...filters, openNow: e.target.checked })}
                    className="w-4 h-4 rounded border-stout-600 bg-stout-700 text-irish-green-600"
                  />
                  <span className="text-sm text-cream-100">Open Now</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasFood}
                    onChange={(e) => setFilters({ ...filters, hasFood: e.target.checked })}
                    className="w-4 h-4 rounded border-stout-600 bg-stout-700 text-irish-green-600"
                  />
                  <span className="text-sm text-cream-100">Serves Food</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasOutdoor}
                    onChange={(e) => setFilters({ ...filters, hasOutdoor: e.target.checked })}
                    className="w-4 h-4 rounded border-stout-600 bg-stout-700 text-irish-green-600"
                  />
                  <span className="text-sm text-cream-100">Outdoor Seating</span>
                </label>
              </div>

              {/* Clear Filters */}
              {(filters.hasFood || filters.hasOutdoor || filters.openNow || maxPrice) && (
                <button
                  onClick={() => {
                    setFilters({ hasFood: false, hasOutdoor: false, openNow: false });
                    setMaxPrice(null);
                  }}
                  className="text-sm text-stout-400 hover:text-cream-100 underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-stout-600 border-t-irish-green-500 mb-4"></div>
          <p className="text-stout-400">
            {location ? 'Finding nearby pubs...' : 'Getting your location...'}
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📍</div>
          <p className="text-stout-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-irish-green-600 hover:bg-irish-green-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Results */}
      {!loading && !error && location && (
        <>
          <div className="mb-4 text-sm text-stout-400">
            {pubs.length} pub{pubs.length !== 1 ? 's' : ''} within {maxDistance < 1 ? `${maxDistance * 1000}m` : `${maxDistance}km`}
          </div>

          {pubs.length > 0 ? (
            <div className="space-y-3">
              {pubs.map((pub) => (
                <Link
                  key={pub.id}
                  href={`/pubs/${pub.slug}`}
                  className="block bg-stout-800 rounded-lg p-4 border border-stout-700 hover:border-stout-500 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-cream-100 truncate">
                          {pub.name}
                        </h3>
                        <span className="text-sm text-irish-green-500 font-medium whitespace-nowrap">
                          {formatDistance(pub.distance)}
                        </span>
                      </div>
                      <p className="text-sm text-stout-400 truncate">{pub.address}</p>

                      {/* Rating */}
                      {pub.avg_rating && pub.avg_rating > 0 ? (
                        <div className="flex items-center gap-2 mt-2">
                          <StarRating rating={pub.avg_rating} size="sm" showValue />
                          <span className="text-xs text-stout-400">
                            ({pub.review_count || 0} {(pub.review_count || 0) === 1 ? 'review' : 'reviews'})
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-stout-500 mt-2">No ratings yet</p>
                      )}

                      {/* Amenities */}
                      <div className="flex gap-2 mt-2">
                        {pub.has_food && <span className="text-xs" title="Food">🍴</span>}
                        {pub.has_live_music && <span className="text-xs" title="Live Music">🎵</span>}
                        {pub.shows_sports && <span className="text-xs" title="Sports">⚽</span>}
                        {pub.has_outdoor_seating && <span className="text-xs" title="Outdoor Seating">🌳</span>}
                      </div>
                    </div>

                    {/* Pint Prices */}
                    <div className="text-right shrink-0">
                      <div className="text-xs text-stout-400 mb-1">Pint Prices</div>
                      <div className="space-y-1">
                        {pub.cheapest_guinness && (
                          <div className="flex justify-between gap-3 text-sm">
                            <span className="text-stout-400">Guinness</span>
                            <span className="text-irish-green-500 font-semibold">
                              {formatPrice(pub.cheapest_guinness)}
                            </span>
                          </div>
                        )}
                        {pub.cheapest_lager && (
                          <div className="flex justify-between gap-3 text-sm">
                            <span className="text-stout-400">Lager</span>
                            <span className="text-cream-100 font-semibold">
                              {formatPrice(pub.cheapest_lager)}
                            </span>
                          </div>
                        )}
                        {pub.cheapest_cider && (
                          <div className="flex justify-between gap-3 text-sm">
                            <span className="text-stout-400">Cider</span>
                            <span className="text-cream-100 font-semibold">
                              {formatPrice(pub.cheapest_cider)}
                            </span>
                          </div>
                        )}
                        {!pub.cheapest_guinness && !pub.cheapest_lager && !pub.cheapest_cider && (
                          <span className="text-xs text-stout-500">No prices yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🍺</div>
              <p className="text-stout-400">No pubs found within {maxDistance}km</p>
              <p className="text-sm text-stout-500 mt-2">Try increasing the distance</p>
            </div>
          )}
        </>
      )}

      {/* CTA for adding pubs */}
      {!loading && !error && location && pubs.length < 5 && (
        <div className="mt-8 bg-stout-800 rounded-lg border border-stout-700 p-6 text-center">
          <p className="text-stout-400 mb-2">Know a pub that&apos;s missing?</p>
          <Link
            href="/contact"
            className="text-irish-green-500 hover:text-irish-green-400 font-medium"
          >
            Suggest a pub →
          </Link>
        </div>
      )}
    </div>
  );
}
