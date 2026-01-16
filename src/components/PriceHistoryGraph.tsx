'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

interface PricePoint {
  date: string;
  price: number;
  count: number;
}

interface PriceHistoryGraphProps {
  pubId: string;
  drinkId?: number;
  drinkName?: string;
}

export default function PriceHistoryGraph({ pubId, drinkId = 1, drinkName = 'Guinness' }: PriceHistoryGraphProps) {
  const [data, setData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y'>('90d');
  const supabase = createClient();

  useEffect(() => {
    async function fetchPriceHistory() {
      setLoading(true);

      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
      }

      const { data: prices } = await supabase
        .from('prices')
        .select('price, created_at')
        .eq('pub_id', pubId)
        .eq('drink_id', drinkId)
        .eq('is_deal', false)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (!prices || prices.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      // Group by week for cleaner visualization
      const weeklyData: { [key: string]: { total: number; count: number } } = {};

      prices.forEach(p => {
        const date = new Date(p.created_at);
        // Get week start (Monday)
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay() + 1);
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { total: 0, count: 0 };
        }
        weeklyData[weekKey].total += p.price;
        weeklyData[weekKey].count += 1;
      });

      const chartData: PricePoint[] = Object.entries(weeklyData)
        .map(([date, { total, count }]) => ({
          date,
          price: total / count,
          count,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setData(chartData);
      setLoading(false);
    }

    fetchPriceHistory();
  }, [pubId, drinkId, timeRange, supabase]);

  if (loading) {
    return (
      <div className="bg-stout-800 rounded-lg border border-stout-700 p-4 animate-pulse">
        <div className="h-4 bg-stout-700 rounded w-32 mb-4"></div>
        <div className="h-32 bg-stout-700 rounded"></div>
      </div>
    );
  }

  if (data.length < 2) {
    return (
      <div className="bg-stout-800 rounded-lg border border-stout-700 p-4">
        <h4 className="text-sm font-medium text-cream-100 mb-2">{drinkName} Price History</h4>
        <p className="text-sm text-stout-400">Not enough data to show price history.</p>
      </div>
    );
  }

  const minPrice = Math.min(...data.map(d => d.price));
  const maxPrice = Math.max(...data.map(d => d.price));
  const priceRange = maxPrice - minPrice || 1;
  const graphHeight = 120;
  const graphWidth = 100; // percentage

  // Calculate trend
  const firstPrice = data[0].price;
  const lastPrice = data[data.length - 1].price;
  const trend = lastPrice - firstPrice;
  const trendPercent = ((lastPrice - firstPrice) / firstPrice) * 100;

  // Generate SVG path
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = graphHeight - ((d.price - minPrice) / priceRange) * graphHeight;
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(' L ')}`;

  return (
    <div className="bg-stout-800 rounded-lg border border-stout-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-cream-100">{drinkName} Price History</h4>
        <div className="flex gap-1">
          {(['30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                timeRange === range
                  ? 'bg-irish-green-600 text-white'
                  : 'bg-stout-700 text-stout-400 hover:bg-stout-600'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Price Summary */}
      <div className="flex items-baseline gap-4 mb-4">
        <div>
          <span className="text-2xl font-bold text-cream-100">&euro;{lastPrice.toFixed(2)}</span>
          <span className="text-xs text-stout-400 ml-1">current</span>
        </div>
        <div className={`flex items-center gap-1 text-sm ${
          trend > 0 ? 'text-red-400' : trend < 0 ? 'text-irish-green-400' : 'text-stout-400'
        }`}>
          {trend > 0 ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : trend < 0 ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : null}
          <span>
            {trend > 0 ? '+' : ''}&euro;{Math.abs(trend).toFixed(2)} ({trendPercent > 0 ? '+' : ''}{trendPercent.toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Graph */}
      <div className="relative h-32">
        <svg
          viewBox={`0 0 100 ${graphHeight}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Grid lines */}
          <line x1="0" y1={graphHeight * 0.25} x2="100" y2={graphHeight * 0.25} stroke="#374151" strokeWidth="0.5" />
          <line x1="0" y1={graphHeight * 0.5} x2="100" y2={graphHeight * 0.5} stroke="#374151" strokeWidth="0.5" />
          <line x1="0" y1={graphHeight * 0.75} x2="100" y2={graphHeight * 0.75} stroke="#374151" strokeWidth="0.5" />

          {/* Area fill */}
          <path
            d={`${pathD} L 100,${graphHeight} L 0,${graphHeight} Z`}
            fill="url(#priceGradient)"
            opacity="0.3"
          />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke={trend > 0 ? '#f87171' : '#4ade80'}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={trend > 0 ? '#f87171' : '#4ade80'} />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-stout-500 pointer-events-none">
          <span>&euro;{maxPrice.toFixed(2)}</span>
          <span>&euro;{((maxPrice + minPrice) / 2).toFixed(2)}</span>
          <span>&euro;{minPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-stout-500">
        <span>{new Date(data[0].date).toLocaleDateString('en-IE', { month: 'short', day: 'numeric' })}</span>
        <span>{new Date(data[data.length - 1].date).toLocaleDateString('en-IE', { month: 'short', day: 'numeric' })}</span>
      </div>

      <p className="text-xs text-stout-500 mt-2">
        Based on {data.reduce((sum, d) => sum + d.count, 0)} price submissions
      </p>
    </div>
  );
}
