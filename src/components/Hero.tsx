'use client';

import { useEffect, useState } from 'react';
import SmartSearch from './SmartSearch';

interface HeroProps {
  stats?: {
    users: number;
    pubs: number;
    reviews: number;
  };
}

export default function Hero({ stats }: HeroProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const defaultStats = {
    users: 5247,
    pubs: 328,
    reviews: 12439,
  };

  const displayStats = stats || defaultStats;

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-stout-900 via-stout-800 to-irish-green-950/50">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(22, 163, 74, 0.15) 0%, transparent 50%)',
            animation: 'pulse 4s ease-in-out infinite',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main heading with animated pint */}
        <div className="text-center mb-8">
          <div className={`text-7xl md:text-8xl mb-6 ${mounted ? 'animate-bounce-slow' : ''}`}>
            🍺
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-title mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cream-100 via-cream-50 to-irish-green-300">
            Find Your Perfect Pint
          </h1>

          <p className="text-lg md:text-xl text-stout-300 max-w-2xl mx-auto mb-2">
            Discover the best pubs, compare prices, and share your experiences
          </p>
          <p className="text-sm text-stout-400">
            Powered by the Dublin pub community
          </p>
        </div>

        {/* Dynamic stats */}
        <div className={`flex flex-wrap justify-center gap-6 md:gap-12 mb-10 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
          <StatBadge icon="🍻" value={displayStats.users.toLocaleString()} label="Active Users" />
          <StatBadge icon="📍" value={displayStats.pubs.toLocaleString()} label="Pubs Listed" />
          <StatBadge icon="⭐" value={displayStats.reviews.toLocaleString()} label="Reviews" />
        </div>

        {/* Search-first CTA */}
        <div className={`max-w-2xl mx-auto ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-2 shadow-2xl border border-stout-700/50">
            <SmartSearch
              placeholder="Search pubs, neighborhoods, or drinks..."
              className="w-full"
            />
          </div>
          <p className="text-center text-stout-400 mt-3 text-sm">
            Try:{' '}
            <button className="text-irish-green-400 hover:text-irish-green-300 transition-colors">
              "Temple Bar"
            </button>
            ,{' '}
            <button className="text-irish-green-400 hover:text-irish-green-300 transition-colors">
              "cheap Guinness"
            </button>
            ,{' '}
            <button className="text-irish-green-400 hover:text-irish-green-300 transition-colors">
              "sports bars"
            </button>
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-4xl opacity-10 animate-bounce-slow">🍀</div>
      <div
        className="absolute bottom-10 right-10 text-4xl opacity-10"
        style={{ animationDelay: '1s' }}
      >
        🎵
      </div>
    </section>
  );
}

interface StatBadgeProps {
  icon: string;
  value: string;
  label: string;
}

function StatBadge({ icon, value, label }: StatBadgeProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-stout-800/50 rounded-lg border border-stout-700/50 backdrop-blur-sm">
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="text-xl md:text-2xl font-bold text-cream-100">{value}</div>
        <div className="text-xs text-stout-400">{label}</div>
      </div>
    </div>
  );
}

// Simplified Hero for pages that don't need full search
interface SimpleHeroProps {
  title: string;
  description?: string;
  icon?: string;
  backgroundGradient?: string;
}

export function SimpleHero({
  title,
  description,
  icon = '🍺',
  backgroundGradient = 'from-stout-900 to-stout-800',
}: SimpleHeroProps) {
  return (
    <section className={`relative overflow-hidden py-12 bg-gradient-to-br ${backgroundGradient}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce-slow">{icon}</div>
          <h1 className="text-3xl md:text-4xl font-title text-cream-100 mb-3">{title}</h1>
          {description && <p className="text-stout-300 max-w-2xl mx-auto">{description}</p>}
        </div>
      </div>
    </section>
  );
}
