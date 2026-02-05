'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function DealsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Deals error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-stout-800 border border-stout-700 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🏷️</div>
        <h2 className="text-2xl font-bold text-cream-100 mb-2">
          Couldn't Load Deals
        </h2>
        <p className="text-stout-400 mb-6">
          {error.message || 'There was a problem loading the deals.'}
        </p>
        {error.digest && (
          <p className="text-xs text-stout-500 mb-4">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full px-4 py-2 bg-irish-green-600 hover:bg-irish-green-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/pubs"
            className="w-full px-4 py-2 bg-stout-700 hover:bg-stout-600 text-cream-100 rounded-lg transition-colors"
          >
            Browse Pubs Instead
          </Link>
        </div>
      </div>
    </div>
  );
}
