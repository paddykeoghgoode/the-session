'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function FloatingActionButton() {
  const pathname = usePathname();

  // Don't show on certain pages
  const hiddenPaths = ['/prices/add', '/deals/add', '/auth/login', '/auth/register'];
  if (hiddenPaths.some(path => pathname?.startsWith(path))) {
    return null;
  }

  return (
    <Link
      href="/prices/add"
      className="fixed bottom-20 right-6 md:bottom-6 w-14 h-14 bg-irish-green-600 hover:bg-irish-green-700 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-all hover:scale-110 active:scale-95 group"
      aria-label="Submit a price"
      title="Submit a price"
    >
      {/* Plus icon */}
      <svg
        className="w-6 h-6 transition-transform group-hover:rotate-90"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>

      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-3 py-2 bg-stout-900 text-cream-100 text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Submit Price
      </span>

      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-irish-green-600 animate-ping opacity-20"></span>
    </Link>
  );
}
