'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import type { UserPreferences, Drink } from '@/types';
import { VIBE_CATEGORIES, VIBE_ICONS } from '@/types';

interface PreferencesFormProps {
  userId: string;
  initialPreferences: UserPreferences | null;
  drinks: Drink[];
}

export default function PreferencesForm({
  userId,
  initialPreferences,
  drinks,
}: PreferencesFormProps) {
  // Drink preferences
  const [favoriteDrinks, setFavoriteDrinks] = useState<number[]>(
    initialPreferences?.favorite_drinks || []
  );

  // Location preferences
  const [homeLatitude, setHomeLatitude] = useState<number | null>(
    initialPreferences?.home_latitude || null
  );
  const [homeLongitude, setHomeLongitude] = useState<number | null>(
    initialPreferences?.home_longitude || null
  );
  const [defaultRadius, setDefaultRadius] = useState<number>(
    initialPreferences?.default_radius_km || 2
  );

  // Notification preferences
  const [emailWeeklyDigest, setEmailWeeklyDigest] = useState(
    initialPreferences?.email_weekly_digest || false
  );
  const [emailPriceAlerts, setEmailPriceAlerts] = useState(
    initialPreferences?.email_price_alerts || false
  );
  const [emailDealAlerts, setEmailDealAlerts] = useState(
    initialPreferences?.email_deal_alerts || false
  );

  // Vibe preferences
  const [preferredVibes, setPreferredVibes] = useState<string[]>(
    initialPreferences?.preferred_vibes || []
  );

  // UI state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('');

  const supabase = createClient();

  const toggleDrink = (drinkId: number) => {
    if (favoriteDrinks.includes(drinkId)) {
      setFavoriteDrinks(favoriteDrinks.filter(id => id !== drinkId));
    } else {
      setFavoriteDrinks([...favoriteDrinks, drinkId]);
    }
  };

  const toggleVibe = (vibe: string) => {
    if (preferredVibes.includes(vibe)) {
      setPreferredVibes(preferredVibes.filter(v => v !== vibe));
    } else {
      setPreferredVibes([...preferredVibes, vibe]);
    }
  };

  const setCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation not supported');
      return;
    }

    setLocationStatus('Getting location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setHomeLatitude(position.coords.latitude);
        setHomeLongitude(position.coords.longitude);
        setLocationStatus('Location set!');
      },
      (error) => {
        setLocationStatus(`Error: ${error.message}`);
      }
    );
  };

  const clearLocation = () => {
    setHomeLatitude(null);
    setHomeLongitude(null);
    setLocationStatus('Location cleared');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const preferencesData = {
        user_id: userId,
        favorite_drinks: favoriteDrinks,
        home_latitude: homeLatitude,
        home_longitude: homeLongitude,
        default_radius_km: defaultRadius,
        email_weekly_digest: emailWeeklyDigest,
        email_price_alerts: emailPriceAlerts,
        email_deal_alerts: emailDealAlerts,
        preferred_vibes: preferredVibes,
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from('user_preferences')
        .upsert(preferencesData, { onConflict: 'user_id' });

      if (upsertError) throw upsertError;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Group drinks by category
  const drinksByCategory = drinks.reduce((acc, drink) => {
    const category = drink.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(drink);
    return acc;
  }, {} as Record<string, Drink[]>);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Favorite Drinks */}
      <section className="bg-stout-800 rounded-lg border border-stout-700 p-6">
        <h2 className="text-lg font-semibold text-cream-100 mb-4">Favorite Drinks</h2>
        <p className="text-sm text-stout-400 mb-4">
          Select the drinks you care about. We'll highlight these in your search results and alerts.
        </p>

        <div className="space-y-4">
          {Object.entries(drinksByCategory).map(([category, categoryDrinks]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-stout-300 mb-2 capitalize">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {categoryDrinks.map((drink) => {
                  const isSelected = favoriteDrinks.includes(drink.id);
                  return (
                    <button
                      key={drink.id}
                      type="button"
                      onClick={() => toggleDrink(drink.id)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        isSelected
                          ? 'bg-irish-green-600 text-white'
                          : 'bg-stout-700 text-stout-300 hover:bg-stout-600'
                      }`}
                    >
                      {drink.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Location Preferences */}
      <section className="bg-stout-800 rounded-lg border border-stout-700 p-6">
        <h2 className="text-lg font-semibold text-cream-100 mb-4">Location</h2>
        <p className="text-sm text-stout-400 mb-4">
          Set your home location for distance calculations and local alerts.
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={setCurrentLocation}
              className="bg-stout-700 hover:bg-stout-600 text-cream-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Use Current Location
            </button>
            {(homeLatitude || homeLongitude) && (
              <button
                type="button"
                onClick={clearLocation}
                className="text-sm text-stout-400 hover:text-red-400"
              >
                Clear
              </button>
            )}
          </div>

          {locationStatus && (
            <p className="text-sm text-stout-400">{locationStatus}</p>
          )}

          {homeLatitude && homeLongitude && (
            <p className="text-sm text-irish-green-500">
              Location set: {homeLatitude.toFixed(4)}, {homeLongitude.toFixed(4)}
            </p>
          )}

          <div>
            <label className="block text-sm text-stout-300 mb-2">Default Search Radius</label>
            <select
              value={defaultRadius}
              onChange={(e) => setDefaultRadius(parseFloat(e.target.value))}
              className="bg-stout-700 border border-stout-600 rounded-lg px-3 py-2 text-cream-100 focus:border-irish-green-500 focus:outline-none"
            >
              <option value="0.5">500m</option>
              <option value="1">1 km</option>
              <option value="2">2 km</option>
              <option value="5">5 km</option>
              <option value="10">10 km</option>
            </select>
          </div>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="bg-stout-800 rounded-lg border border-stout-700 p-6">
        <h2 className="text-lg font-semibold text-cream-100 mb-4">Email Notifications</h2>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={emailWeeklyDigest}
              onChange={(e) => setEmailWeeklyDigest(e.target.checked)}
              className="rounded border-stout-600 bg-stout-700 text-irish-green-600 focus:ring-irish-green-500"
            />
            <div>
              <span className="text-cream-100">Weekly Digest</span>
              <p className="text-sm text-stout-400">
                Get a weekly summary of new deals and price drops in your area
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={emailPriceAlerts}
              onChange={(e) => setEmailPriceAlerts(e.target.checked)}
              className="rounded border-stout-600 bg-stout-700 text-irish-green-600 focus:ring-irish-green-500"
            />
            <div>
              <span className="text-cream-100">Price Alerts</span>
              <p className="text-sm text-stout-400">
                Get notified when prices match your alert criteria
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={emailDealAlerts}
              onChange={(e) => setEmailDealAlerts(e.target.checked)}
              className="rounded border-stout-600 bg-stout-700 text-irish-green-600 focus:ring-irish-green-500"
            />
            <div>
              <span className="text-cream-100">New Deal Alerts</span>
              <p className="text-sm text-stout-400">
                Get notified when new deals are posted near you
              </p>
            </div>
          </label>
        </div>
      </section>

      {/* Preferred Vibes */}
      <section className="bg-stout-800 rounded-lg border border-stout-700 p-6">
        <h2 className="text-lg font-semibold text-cream-100 mb-4">Preferred Vibes</h2>
        <p className="text-sm text-stout-400 mb-4">
          What kind of pubs do you usually enjoy? We'll use this to improve recommendations.
        </p>

        <div className="space-y-4">
          {Object.entries(VIBE_CATEGORIES).map(([category, { label, vibes }]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-stout-300 mb-2">{label}</h3>
              <div className="flex flex-wrap gap-2">
                {vibes.map((vibe) => {
                  const isSelected = preferredVibes.includes(vibe);
                  return (
                    <button
                      key={vibe}
                      type="button"
                      onClick={() => toggleVibe(vibe)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                        isSelected
                          ? 'bg-irish-green-600 text-white'
                          : 'bg-stout-700 text-stout-300 hover:bg-stout-600'
                      }`}
                    >
                      <span>{VIBE_ICONS[vibe] || '✨'}</span>
                      <span className="capitalize">{vibe.replace('-', ' ')}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Error/Success messages */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {saved && (
        <div className="bg-green-900/50 border border-green-700 rounded-lg p-4">
          <p className="text-green-300">Preferences saved successfully!</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        className="w-full bg-irish-green-600 hover:bg-irish-green-700 disabled:bg-stout-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
      >
        {saving ? 'Saving...' : 'Save Preferences'}
      </button>
    </form>
  );
}
