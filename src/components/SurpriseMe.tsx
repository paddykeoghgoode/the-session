'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { formatPrice, getDistanceKm, formatDistance, getMapUrl } from '@/lib/utils';
import type { Pub } from '@/types';

interface SurpriseMeProps {
  className?: string;
}

type SurpriseMode = 'random' | 'cheapest' | 'nearest' | 'hidden_gem' | 'highly_rated';

export default function SurpriseMe({ className = '' }: SurpriseMeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pub, setPub] = useState<Pub | null>(null);
  const [mode, setMode] = useState<SurpriseMode>('random');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  const supabase = createClient();

  // Get user location
  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Location not available:', error.message);
        }
      );
    }
  }, [isOpen]);

  const findSurprise = async () => {
    setLoading(true);
    setPub(null);

    try {
      let query = supabase
        .from('pub_summaries')
        .select('*')
        .eq('is_active', true)
        .eq('is_permanently_closed', false);

      let data: Pub[] = [];

      switch (mode) {
        case 'cheapest':
          // Find a random pub from the cheapest 10
          const { data: cheapest } = await query
            .not('cheapest_guinness', 'is', null)
            .order('cheapest_guinness', { ascending: true })
            .limit(20);
          data = cheapest || [];
          break;

        case 'nearest':
          // Get all pubs with coordinates and sort client-side
          if (userLocation) {
            const { data: nearby } = await query
              .not('latitude', 'is', null)
              .not('longitude', 'is', null)
              .limit(100);

            if (nearby) {
              // Sort by distance and take top 10
              const sorted = nearby
                .filter((p: Pub) => p.latitude && p.longitude)
                .map((p: Pub) => ({
                  ...p,
                  distance: getDistanceKm(userLocation.lat, userLocation.lng, p.latitude!, p.longitude!),
                }))
                .sort((a: Pub & { distance: number }, b: Pub & { distance: number }) => a.distance - b.distance)
                .slice(0, 10);
              data = sorted;
            }
          }
          break;

        case 'hidden_gem':
          // Highly rated but few reviews
          const { data: gems } = await query
            .gte('avg_rating', 4)
            .lte('review_count', 5)
            .not('avg_rating', 'is', null)
            .limit(20);
          data = gems || [];
          break;

        case 'highly_rated':
          // Top rated pubs
          const { data: topRated } = await query
            .gte('avg_rating', 4.2)
            .gte('review_count', 3)
            .order('avg_rating', { ascending: false })
            .limit(20);
          data = topRated || [];
          break;

        default:
          // Pure random
          const { data: randomPubs } = await query.limit(50);
          data = randomPubs || [];
          break;
      }

      // Pick a random pub from the results
      if (data.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(data.length, 10));
        const selectedPub = data[randomIndex];
        setPub(selectedPub);

        // Calculate distance if we have location
        if (userLocation && selectedPub.latitude && selectedPub.longitude) {
          const dist = getDistanceKm(
            userLocation.lat,
            userLocation.lng,
            selectedPub.latitude,
            selectedPub.longitude
          );
          setDistance(dist);
        }
      }
    } catch (err) {
      console.error('Failed to find surprise pub:', err);
    } finally {
      setLoading(false);
    }
  };

  const getModeIcon = (m: SurpriseMode) => {
    switch (m) {
      case 'cheapest': return '💰';
      case 'nearest': return '📍';
      case 'hidden_gem': return '💎';
      case 'highly_rated': return '⭐';
      default: return '🎲';
    }
  };

  const getModeLabel = (m: SurpriseMode) => {
    switch (m) {
      case 'cheapest': return 'Budget-Friendly';
      case 'nearest': return 'Nearest to Me';
      case 'hidden_gem': return 'Hidden Gem';
      case 'highly_rated': return 'Top Rated';
      default: return 'Random';
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-colors ${className}`}
      >
        <span className="text-lg">🎲</span>
        <span>Surprise Me!</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-stout-800 rounded-lg border border-stout-700 w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">🎲</span>
                  Surprise Me!
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-white/80 text-sm mt-1">
                Let fate decide your next pint destination
              </p>
            </div>

            <div className="p-4 space-y-4">
              {/* Mode selection */}
              <div>
                <label className="block text-sm text-stout-300 mb-2">What are you feeling?</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['random', 'cheapest', 'nearest', 'hidden_gem', 'highly_rated'] as SurpriseMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      disabled={m === 'nearest' && !userLocation}
                      className={`flex items-center gap-2 p-3 rounded-lg text-sm transition-colors ${
                        mode === m
                          ? 'bg-purple-600 text-white'
                          : 'bg-stout-700 text-stout-300 hover:bg-stout-600 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      <span>{getModeIcon(m)}</span>
                      <span>{getModeLabel(m)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Find button */}
              <button
                onClick={findSurprise}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-stout-600 disabled:to-stout-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Finding your pub...
                  </>
                ) : (
                  <>
                    <span className="text-lg">🎰</span>
                    Roll the Dice!
                  </>
                )}
              </button>

              {/* Result */}
              {pub && (
                <div className="bg-stout-700/50 rounded-lg p-4 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-irish-green-500 to-irish-green-600 rounded-full flex items-center justify-center text-white text-xl">
                      🍺
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-cream-100">{pub.name}</h3>
                      <p className="text-sm text-stout-400">{pub.address}</p>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {pub.cheapest_guinness && (
                          <span className="inline-flex items-center gap-1 text-sm text-irish-green-500">
                            <span>🍺</span>
                            Guinness {formatPrice(pub.cheapest_guinness)}
                          </span>
                        )}
                        {pub.avg_rating && (
                          <span className="inline-flex items-center gap-1 text-sm text-amber-500">
                            <span>⭐</span>
                            {pub.avg_rating.toFixed(1)}
                          </span>
                        )}
                        {distance !== null && (
                          <span className="inline-flex items-center gap-1 text-sm text-stout-400">
                            <span>📍</span>
                            {formatDistance(distance)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Link
                      href={`/pubs/${pub.slug || pub.id}`}
                      className="flex-1 bg-irish-green-600 hover:bg-irish-green-700 text-white text-center py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                    >
                      View Pub
                    </Link>
                    <a
                      href={getMapUrl(pub)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-stout-700 hover:bg-stout-600 text-cream-100 py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      Get Directions
                    </a>
                  </div>
                </div>
              )}

              {/* Try again */}
              {pub && (
                <button
                  onClick={findSurprise}
                  className="w-full text-center text-sm text-stout-400 hover:text-cream-100 py-2"
                >
                  Not feeling it? Try again
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
