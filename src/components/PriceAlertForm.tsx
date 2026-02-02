'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { DRINKS } from '@/types';
import type { PriceAlert } from '@/types';
import { formatPrice } from '@/lib/utils';

interface PriceAlertFormProps {
  userId: string;
  pubId?: string;
  pubName?: string;
  initialDrinkId?: number;
}

export default function PriceAlertForm({ userId, pubId, pubName, initialDrinkId }: PriceAlertFormProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [selectedDrink, setSelectedDrink] = useState<number | ''>(initialDrinkId || '');
  const [maxPrice, setMaxPrice] = useState<string>('6.00');
  const [radiusKm, setRadiusKm] = useState<string>('2');
  const [useLocation, setUseLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const supabase = createClient();

  // Load existing alerts
  useEffect(() => {
    async function loadAlerts() {
      const { data, error } = await supabase
        .from('price_alerts')
        .select(`
          *,
          drink:drinks(*),
          pub:pubs(id, name, slug)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load alerts:', error);
      } else {
        setAlerts(data || []);
      }
      setLoading(false);
    }

    loadAlerts();
  }, [userId, supabase]);

  // Get user location if requested
  useEffect(() => {
    if (useLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Location error:', error);
          setError('Could not get your location. Please enable location services.');
          setUseLocation(false);
        }
      );
    }
  }, [useLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedDrink && !pubId) {
      setError('Please select a drink or a specific pub');
      return;
    }

    const price = parseFloat(maxPrice);
    if (isNaN(price) || price <= 0 || price > 20) {
      setError('Please enter a valid price between €0.01 and €20.00');
      return;
    }

    setIsCreating(true);

    try {
      const alertData = {
        user_id: userId,
        drink_id: selectedDrink || null,
        max_price: price,
        pub_id: pubId || null,
        latitude: useLocation && userLocation ? userLocation.lat : null,
        longitude: useLocation && userLocation ? userLocation.lng : null,
        radius_km: parseFloat(radiusKm) || 2,
        is_active: true,
      };

      const { data, error: insertError } = await supabase
        .from('price_alerts')
        .insert(alertData)
        .select(`
          *,
          drink:drinks(*),
          pub:pubs(id, name, slug)
        `)
        .single();

      if (insertError) throw insertError;

      setAlerts([data, ...alerts]);
      setSuccess('Price alert created! You\'ll be notified when prices drop.');
      setSelectedDrink('');
      setMaxPrice('6.00');
    } catch (err) {
      console.error('Failed to create alert:', err);
      setError('Failed to create alert. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('price_alerts')
      .update({ is_active: !isActive })
      .eq('id', alertId);

    if (error) {
      console.error('Failed to toggle alert:', error);
      return;
    }

    setAlerts(alerts.map(a =>
      a.id === alertId ? { ...a, is_active: !isActive } : a
    ));
  };

  const deleteAlert = async (alertId: string) => {
    const { error } = await supabase
      .from('price_alerts')
      .delete()
      .eq('id', alertId);

    if (error) {
      console.error('Failed to delete alert:', error);
      return;
    }

    setAlerts(alerts.filter(a => a.id !== alertId));
  };

  if (loading) {
    return (
      <div className="bg-stout-800 rounded-lg border border-stout-700 p-4 animate-pulse">
        <div className="h-6 bg-stout-700 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-stout-700 rounded mb-2"></div>
        <div className="h-10 bg-stout-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-stout-800 rounded-lg border border-stout-700 p-4">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <h3 className="text-lg font-semibold text-cream-100">Price Alerts</h3>
      </div>

      {/* Create new alert form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        {/* Drink selection */}
        {!pubId && (
          <div>
            <label className="block text-sm text-stout-300 mb-1">Drink</label>
            <select
              value={selectedDrink}
              onChange={(e) => setSelectedDrink(e.target.value ? parseInt(e.target.value) : '')}
              className="w-full bg-stout-700 border border-stout-600 rounded-lg px-3 py-2 text-cream-100 focus:border-irish-green-500 focus:outline-none"
            >
              <option value="">Any drink</option>
              {DRINKS.map((drink, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {drink.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {pubId && (
          <p className="text-sm text-stout-400">
            Alert for: <span className="text-cream-100">{pubName}</span>
          </p>
        )}

        {/* Max price */}
        <div>
          <label className="block text-sm text-stout-300 mb-1">Alert me when price drops below</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stout-400">€</span>
            <input
              type="number"
              step="0.10"
              min="0.01"
              max="20"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-stout-700 border border-stout-600 rounded-lg pl-7 pr-3 py-2 text-cream-100 focus:border-irish-green-500 focus:outline-none"
              placeholder="6.00"
            />
          </div>
        </div>

        {/* Location-based alerts */}
        {!pubId && (
          <>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useLocation"
                checked={useLocation}
                onChange={(e) => setUseLocation(e.target.checked)}
                className="rounded border-stout-600 bg-stout-700 text-irish-green-600 focus:ring-irish-green-500"
              />
              <label htmlFor="useLocation" className="text-sm text-stout-300">
                Only pubs near me
              </label>
            </div>

            {useLocation && (
              <div>
                <label className="block text-sm text-stout-300 mb-1">Radius</label>
                <select
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(e.target.value)}
                  className="w-full bg-stout-700 border border-stout-600 rounded-lg px-3 py-2 text-cream-100 focus:border-irish-green-500 focus:outline-none"
                >
                  <option value="0.5">500m</option>
                  <option value="1">1 km</option>
                  <option value="2">2 km</option>
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                </select>
              </div>
            )}
          </>
        )}

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-400">{success}</p>
        )}

        <button
          type="submit"
          disabled={isCreating}
          className="w-full bg-irish-green-600 hover:bg-irish-green-700 disabled:bg-stout-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isCreating ? 'Creating...' : 'Create Alert'}
        </button>
      </form>

      {/* Existing alerts */}
      {alerts.length > 0 && (
        <div className="border-t border-stout-700 pt-4">
          <h4 className="text-sm font-medium text-stout-300 mb-3">Your Alerts</h4>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  alert.is_active
                    ? 'bg-stout-700/50 border-stout-600'
                    : 'bg-stout-800/50 border-stout-700 opacity-60'
                }`}
              >
                <div className="flex-1">
                  <p className="text-sm text-cream-100">
                    {alert.drink?.name || 'Any drink'} under {formatPrice(alert.max_price || 0)}
                  </p>
                  <p className="text-xs text-stout-400">
                    {alert.pub ? alert.pub.name : alert.radius_km ? `Within ${alert.radius_km}km` : 'All pubs'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAlert(alert.id, alert.is_active)}
                    className={`p-1 rounded ${
                      alert.is_active ? 'text-irish-green-500' : 'text-stout-500'
                    }`}
                    title={alert.is_active ? 'Pause alert' : 'Resume alert'}
                  >
                    {alert.is_active ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="p-1 text-stout-400 hover:text-red-400 rounded"
                    title="Delete alert"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
