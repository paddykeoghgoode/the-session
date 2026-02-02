'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { formatRelativeTime, getDistanceKm } from '@/lib/utils';
import type { CheckIn as CheckInType, PubStreak, Price } from '@/types';

interface CheckInProps {
  pubId: string;
  pubName: string;
  pubLatitude?: number | null;
  pubLongitude?: number | null;
  userId?: string;
  prices?: Price[];
}

export default function CheckIn({
  pubId,
  pubName,
  pubLatitude,
  pubLongitude,
  userId,
  prices = [],
}: CheckInProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInType[]>([]);
  const [userStreak, setUserStreak] = useState<PubStreak | null>(null);
  const [checkInCount, setCheckInCount] = useState(0);

  // Form state
  const [selectedPriceId, setSelectedPriceId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationVerified, setLocationVerified] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Load check-in data
  useEffect(() => {
    async function loadData() {
      // Get total check-in count for this pub
      const { count } = await supabase
        .from('check_ins')
        .select('*', { count: 'exact', head: true })
        .eq('pub_id', pubId);

      setCheckInCount(count || 0);

      // Get recent check-ins
      const { data: checkIns } = await supabase
        .from('check_ins')
        .select(`
          *,
          profile:profiles(username, display_name)
        `)
        .eq('pub_id', pubId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (checkIns) {
        setRecentCheckIns(checkIns);
      }

      // Get user's streak for this pub
      if (userId) {
        const { data: streak } = await supabase
          .from('pub_streaks')
          .select('*')
          .eq('user_id', userId)
          .eq('pub_id', pubId)
          .single();

        if (streak) {
          setUserStreak(streak);
        }
      }
    }

    loadData();
  }, [pubId, userId, supabase]);

  // Get user location when opening modal
  useEffect(() => {
    if (isOpen && navigator.geolocation && pubLatitude && pubLongitude) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(loc);

          // Verify user is within 200m of the pub
          const distance = getDistanceKm(loc.lat, loc.lng, pubLatitude, pubLongitude);
          setLocationVerified(distance <= 0.2); // 200 meters
        },
        (error) => {
          console.log('Location not available:', error.message);
        }
      );
    }
  }, [isOpen, pubLatitude, pubLongitude]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError('Please sign in to check in');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let photoPath: string | null = null;

      // Upload photo if provided
      if (photo) {
        const fileExt = photo.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${userId}/${pubId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('check-in-photos')
          .upload(fileName, photo, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Photo upload error:', uploadError);
          // Continue without photo
        } else {
          photoPath = fileName;
        }
      }

      // Create check-in
      const checkInData = {
        user_id: userId,
        pub_id: pubId,
        verified_price_id: selectedPriceId || null,
        photo_path: photoPath,
        notes: notes.trim() || null,
        check_in_latitude: userLocation?.lat || null,
        check_in_longitude: userLocation?.lng || null,
        location_verified: locationVerified,
        is_verified: locationVerified || !!photoPath,
      };

      const { data: newCheckIn, error: insertError } = await supabase
        .from('check_ins')
        .insert(checkInData)
        .select(`
          *,
          profile:profiles(username, display_name)
        `)
        .single();

      if (insertError) throw insertError;

      // Update UI
      setRecentCheckIns([newCheckIn, ...recentCheckIns.slice(0, 4)]);
      setCheckInCount(prev => prev + 1);
      setSuccess(`Checked in at ${pubName}!${locationVerified ? ' Location verified!' : ''}`);

      // Refresh streak
      const { data: updatedStreak } = await supabase
        .from('pub_streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('pub_id', pubId)
        .single();

      if (updatedStreak) {
        setUserStreak(updatedStreak);
      }

      // Reset form
      setPhoto(null);
      setPhotoPreview(null);
      setSelectedPriceId('');
      setNotes('');

      // Close modal after delay
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(null);
      }, 2000);
    } catch (err) {
      console.error('Check-in failed:', err);
      setError('Failed to check in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Check-in Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-irish-green-600 hover:bg-irish-green-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Check In
        {checkInCount > 0 && (
          <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
            {checkInCount}
          </span>
        )}
      </button>

      {/* User streak badge */}
      {userStreak && userStreak.current_streak > 1 && (
        <div className="flex items-center gap-1 text-sm text-amber-500">
          <span className="text-lg">🔥</span>
          <span>{userStreak.current_streak} day streak!</span>
        </div>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-stout-800 rounded-lg border border-stout-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-stout-700">
              <h2 className="text-lg font-semibold text-cream-100">Check In</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stout-400 hover:text-cream-100"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <p className="text-sm text-stout-400">
                Checking in at <span className="text-cream-100">{pubName}</span>
              </p>

              {/* Location status */}
              {pubLatitude && pubLongitude && (
                <div className={`flex items-center gap-2 text-sm p-2 rounded ${
                  locationVerified
                    ? 'bg-green-900/30 text-green-400'
                    : 'bg-stout-700 text-stout-400'
                }`}>
                  {locationVerified ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Location verified - you're at the pub!
                    </>
                  ) : userLocation ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      Location found but not at pub location
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Checking location...
                    </>
                  )}
                </div>
              )}

              {/* Verify a price */}
              {prices.length > 0 && (
                <div>
                  <label className="block text-sm text-stout-300 mb-1">
                    Verify a price (optional)
                  </label>
                  <select
                    value={selectedPriceId}
                    onChange={(e) => setSelectedPriceId(e.target.value)}
                    className="w-full bg-stout-700 border border-stout-600 rounded-lg px-3 py-2 text-cream-100 focus:border-irish-green-500 focus:outline-none"
                  >
                    <option value="">Select a price to verify</option>
                    {prices.slice(0, 10).map((price) => (
                      <option key={price.id} value={price.id}>
                        {price.drink?.name} - €{price.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Photo proof */}
              <div>
                <label className="block text-sm text-stout-300 mb-1">
                  Photo proof (optional)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Check-in photo"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto(null);
                        setPhotoPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-stout-600 rounded-lg flex flex-col items-center justify-center gap-2 text-stout-400 hover:border-stout-500 hover:text-stout-300 transition-colors"
                  >
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">Take a photo</span>
                  </button>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm text-stout-300 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How's the pint today?"
                  rows={2}
                  maxLength={280}
                  className="w-full bg-stout-700 border border-stout-600 rounded-lg px-3 py-2 text-cream-100 placeholder-stout-500 focus:border-irish-green-500 focus:outline-none resize-none"
                />
              </div>

              {/* Error/Success messages */}
              {error && <p className="text-sm text-red-400">{error}</p>}
              {success && <p className="text-sm text-green-400">{success}</p>}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !userId}
                className="w-full bg-irish-green-600 hover:bg-irish-green-700 disabled:bg-stout-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Checking in...' : userId ? 'Check In' : 'Sign in to check in'}
              </button>

              {/* Streak info */}
              {userStreak && (
                <div className="text-center pt-2 border-t border-stout-700">
                  <p className="text-sm text-stout-400">
                    Your streak: <span className="text-amber-500 font-medium">{userStreak.current_streak} days</span>
                    {userStreak.longest_streak > userStreak.current_streak && (
                      <span className="text-stout-500 ml-2">(Best: {userStreak.longest_streak})</span>
                    )}
                  </p>
                </div>
              )}
            </form>

            {/* Recent check-ins */}
            {recentCheckIns.length > 0 && (
              <div className="border-t border-stout-700 p-4">
                <h4 className="text-sm font-medium text-stout-300 mb-3">Recent Check-ins</h4>
                <div className="space-y-2">
                  {recentCheckIns.map((checkIn) => (
                    <div key={checkIn.id} className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 bg-stout-700 rounded-full flex items-center justify-center">
                        {checkIn.is_verified ? (
                          <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 text-stout-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-cream-100">
                        {checkIn.profile?.display_name || checkIn.profile?.username || 'Someone'}
                      </span>
                      <span className="text-stout-500">
                        {formatRelativeTime(checkIn.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
