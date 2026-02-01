import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stout-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <span className="text-8xl font-bold text-stout-700">404</span>
        </div>

        <h1 className="text-2xl font-bold text-cream-100 mb-2">
          Page not found
        </h1>
        <p className="text-stout-400 mb-6">
          Looks like this page has gone for a pint. Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-irish-green-600 hover:bg-irish-green-700 text-white font-medium rounded-lg transition-colors"
          >
            Go home
          </Link>
          <Link
            href="/pubs"
            className="px-6 py-3 bg-stout-700 hover:bg-stout-600 text-cream-100 font-medium rounded-lg transition-colors"
          >
            Browse pubs
          </Link>
        </div>
      </div>
    </div>
  );
}
