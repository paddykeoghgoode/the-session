'use client';

import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-stout-800 border border-stout-700 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-cream-100 mb-2">
          Admin Panel Error
        </h2>
        <p className="text-stout-400 mb-6">
          {error.message || 'Something went wrong in the admin panel.'}
        </p>
        {error.digest && (
          <p className="text-xs text-stout-500 mb-4">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-irish-green-600 hover:bg-irish-green-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
          <a
            href="/admin"
            className="px-4 py-2 bg-stout-700 hover:bg-stout-600 text-cream-100 rounded-lg transition-colors"
          >
            Back to Admin
          </a>
        </div>
      </div>
    </div>
  );
}
