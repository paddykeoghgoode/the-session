'use client';

import { ReactNode } from 'react';
import usePullToRefresh from '@/hooks/usePullToRefresh';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  enabled?: boolean;
}

export default function PullToRefresh({ onRefresh, children, enabled = true }: PullToRefreshProps) {
  const { isRefreshing, pullDistance, isPulling } = usePullToRefresh({
    onRefresh,
    enabled,
  });

  const rotation = Math.min((pullDistance / 80) * 360, 360);
  const scale = Math.min(pullDistance / 80, 1);

  return (
    <div className="relative">
      {/* Pull indicator */}
      <div
        className="fixed top-16 left-1/2 -translate-x-1/2 z-50 transition-all duration-200"
        style={{
          transform: `translate(-50%, ${Math.min(pullDistance, 80)}px) scale(${scale})`,
          opacity: pullDistance > 0 ? 1 : 0,
        }}
      >
        <div className="bg-stout-800 px-4 py-3 rounded-full shadow-lg border border-stout-700 flex items-center gap-3">
          {isRefreshing ? (
            <>
              <div className="w-5 h-5 border-2 border-irish-green-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-cream-100">Refreshing...</span>
            </>
          ) : (
            <>
              <div
                className="w-5 h-5 text-irish-green-600 transition-transform"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-cream-100">
                {pullDistance >= 80 ? 'Release to refresh' : 'Pull to refresh'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
