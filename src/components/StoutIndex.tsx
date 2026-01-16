'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

interface StoutIndexData {
  current_avg: number | null;
  last_week_avg: number | null;
  last_month_avg: number | null;
  sample_size: number;
}

export default function StoutIndex() {
  const [data, setData] = useState<StoutIndexData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function fetchStoutIndex() {
      try {
        // Use the pre-calculated current_stout_index view
        const { data: indexData, error: fetchError } = await supabase
          .from('current_stout_index')
          .select('*')
          .single();

        if (fetchError) {
          console.error('Error fetching stout index:', fetchError);
          setError('Failed to load');
          return;
        }

        setData(indexData);
      } catch (err) {
        console.error('Error fetching stout index:', err);
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    }

    fetchStoutIndex();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-stout-800 to-stout-900 rounded-xl border border-stout-700 p-6 animate-pulse">
        <div className="h-6 bg-stout-700 rounded w-32 mb-4"></div>
        <div className="h-10 bg-stout-700 rounded w-24 mb-2"></div>
        <div className="h-4 bg-stout-700 rounded w-40"></div>
      </div>
    );
  }

  if (error || !data || data.current_avg === null) {
    return (
      <div className="bg-gradient-to-br from-stout-800 to-stout-900 rounded-xl border border-stout-700 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🍺</span>
          <h3 className="text-lg font-bold text-cream-100">The Stout Index</h3>
        </div>
        <p className="text-sm text-stout-400">
          {error || 'No Guinness price data available yet. Be the first to submit a price!'}
        </p>
      </div>
    );
  }

  const changeFromLastWeek = data.last_week_avg
    ? data.current_avg - data.last_week_avg
    : null;
  const changeFromLastMonth = data.last_month_avg
    ? data.current_avg - data.last_month_avg
    : null;

  return (
    <div className="bg-gradient-to-br from-stout-800 via-stout-800 to-stout-900 rounded-xl border border-stout-700 p-6 relative overflow-hidden">
      {/* Decorative Guinness glass silhouette */}
      <div className="absolute -right-4 -bottom-4 opacity-5">
        <svg width="120" height="160" viewBox="0 0 120 160" fill="currentColor" className="text-cream-100">
          <path d="M30 20 L30 130 Q30 150 50 150 L70 150 Q90 150 90 130 L90 20 Q90 10 80 10 L40 10 Q30 10 30 20 Z" />
          <rect x="25" y="60" width="70" height="8" rx="2" />
        </svg>
      </div>

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🍺</span>
          <h3 className="text-lg font-bold text-cream-100">The Stout Index</h3>
        </div>

        <p className="text-sm text-stout-400 mb-2">Average Guinness price in Dublin</p>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-4xl font-bold text-irish-green-500">
            &euro;{data.current_avg.toFixed(2)}
          </span>
          {changeFromLastMonth !== null && (
            <span className={`text-sm font-medium flex items-center gap-1 ${
              changeFromLastMonth > 0 ? 'text-red-400' : changeFromLastMonth < 0 ? 'text-irish-green-400' : 'text-stout-400'
            }`}>
              {changeFromLastMonth > 0 ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : changeFromLastMonth < 0 ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : null}
              &euro;{Math.abs(changeFromLastMonth).toFixed(2)} vs last month
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-stout-400">
          {changeFromLastWeek !== null && (
            <span className={changeFromLastWeek > 0 ? 'text-red-400' : changeFromLastWeek < 0 ? 'text-irish-green-400' : ''}>
              {changeFromLastWeek > 0 ? '+' : ''}&euro;{changeFromLastWeek.toFixed(2)} since last week
            </span>
          )}
          <span>&middot;</span>
          <span>Based on {data.sample_size} prices</span>
        </div>
      </div>
    </div>
  );
}
