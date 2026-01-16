'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

interface StoutIndexData {
  currentAvg: number | null;
  lastWeekAvg: number | null;
  lastMonthAvg: number | null;
  sampleSize: number;
}

export default function StoutIndex() {
  const [data, setData] = useState<StoutIndexData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function fetchStoutIndex() {
      try {
        // Get current week average
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        // Current average (last 30 days for more data) - Guinness only (drink_id = 1)
        const { data: currentData, error: currentError } = await supabase
          .from('prices')
          .select('price')
          .eq('drink_id', 1) // Guinness
          .eq('is_deal', false)
          .gte('created_at', oneMonthAgo.toISOString());

        if (currentError) {
          console.error('Error fetching current prices:', currentError);
          setError('Failed to load prices');
          setLoading(false);
          return;
        }

        // If no recent data, try all-time Guinness prices
        let finalCurrentData = currentData;
        if (!currentData || currentData.length === 0) {
          const { data: allTimeData } = await supabase
            .from('prices')
            .select('price')
            .eq('drink_id', 1) // Guinness
            .eq('is_deal', false)
            .order('created_at', { ascending: false })
            .limit(100);
          finalCurrentData = allTimeData;
        }

        // Last week average (7-14 days ago) - Guinness only
        const { data: lastWeekData } = await supabase
          .from('prices')
          .select('price')
          .eq('drink_id', 1) // Guinness
          .eq('is_deal', false)
          .gte('created_at', twoWeeksAgo.toISOString())
          .lt('created_at', oneWeekAgo.toISOString());

        // Last month average (30-60 days ago) - Guinness only
        const { data: lastMonthData } = await supabase
          .from('prices')
          .select('price')
          .eq('drink_id', 1) // Guinness
          .eq('is_deal', false)
          .gte('created_at', twoMonthsAgo.toISOString())
          .lt('created_at', oneMonthAgo.toISOString());

        const calcAvg = (prices: { price: number }[] | null) => {
          if (!prices || prices.length === 0) return null;
          return prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
        };

        setData({
          currentAvg: calcAvg(finalCurrentData),
          lastWeekAvg: calcAvg(lastWeekData),
          lastMonthAvg: calcAvg(lastMonthData),
          sampleSize: finalCurrentData?.length || 0,
        });
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

  if (error || !data || data.currentAvg === null) {
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

  const changeFromLastWeek = data.lastWeekAvg
    ? data.currentAvg - data.lastWeekAvg
    : null;
  const changeFromLastMonth = data.lastMonthAvg
    ? data.currentAvg - data.lastMonthAvg
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
            &euro;{data.currentAvg.toFixed(2)}
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
          <span>Based on {data.sampleSize} prices</span>
        </div>
      </div>
    </div>
  );
}
