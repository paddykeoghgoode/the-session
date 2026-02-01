'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console (in production, send to error tracking)
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-stout-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <svg
            className="w-20 h-20 mx-auto text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-cream-100 mb-2">
          Something went wrong
        </h1>
        <p className="text-stout-400 mb-6">
          We hit an unexpected error. Our team has been notified.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-irish-green-600 hover:bg-irish-green-700 text-white font-medium rounded-lg transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-stout-700 hover:bg-stout-600 text-cream-100 font-medium rounded-lg transition-colors"
          >
            Go home
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mt-8 p-4 bg-stout-800 rounded-lg border border-stout-700 text-left">
            <p className="text-xs text-stout-500 mb-1">Error details:</p>
            <pre className="text-xs text-red-400 overflow-auto">
              {error.message}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
