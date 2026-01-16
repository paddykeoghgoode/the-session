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
  const supabase = createClient();

  useEffect(() => {
    async function fetchStoutIndex() {
      // Get current week average
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Current average (last 7 days)
      const { data: currentData } = await supabase
        .from('prices')
        .select('price, drink:drinks!inner(name)')
        .eq('is_deal', false)
        .eq('drinks.name', 'Guinness')
        .gte('created_at', oneWeekAgo.toISOString());

      // Last week average (7-14 days ago)
      const { data: lastWeekData } = await supabase
        .from('prices')
        .select('price, drink:drinks!inner(name)')
        .eq('is_deal', false)
        .eq('drinks.name', 'Guinness')
        .gte('created_at', twoWeeksAgo.toISOString())
        .lt('created_at', oneWeekAgo.toISOString());

      // Last month average (30-60 days ago)
      const { data: lastMonthData } = await supabase
        .from('prices')
        .select('price, drink:drinks!inner(name)')
        .eq('is_deal', false)
        .eq('drinks.name', 'Guinness')
        .gte('created_at', twoMonthsAgo.toISOString())
        .lt('created_at', oneMonthAgo.toISOString());

      const calcAvg = (prices: { price: number }[] | null) => {
        if (!prices || prices.length === 0) return null;
        return prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
      };

      setData({
        currentAvg: calcAvg(currentData),
        lastWeekAvg: calcAvg(lastWeekData),
        lastMonthAvg: calcAvg(lastMonthData),
        sampleSize: currentData?.length || 0,
      });
      setLoading(false);
    }

    fetchStoutIndex();
  }, [supabase]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-stout-800 to-stout-900 rounded-xl border border-stout-700 p-6 animate-pulse">
        <div className="h-6 bg-stout-700 rounded w-32 mb-4"></div>
        <div className="h-10 bg-stout-700 rounded w-24 mb-2"></div>
        <div className="h-4 bg-stout-700 rounded w-40"></div>
      </div>
    );
  }

  if (!data || data.currentAvg === null) {
    return null;
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
