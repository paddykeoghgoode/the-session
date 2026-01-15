import Link from 'next/link';
import StarRating from './StarRating';
import { formatPrice, getGoogleMapsUrl } from '@/lib/utils';
import type { Pub } from '@/types';

interface PubCardProps {
  pub: Pub;
}

export default function PubCard({ pub }: PubCardProps) {
  const isClosed = pub.is_permanently_closed;

  return (
    <div className={`bg-stout-800 rounded-lg border border-stout-700 overflow-hidden hover:border-stout-500 transition-colors ${isClosed ? 'opacity-70' : ''}`}>
      <div className="p-4">
        {/* Permanently Closed Badge */}
        {isClosed && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 text-xs font-medium px-2 py-1 rounded mb-3 inline-block">
            Permanently Closed
          </div>
        )}

        <div className="flex justify-between items-start mb-2">
          <Link href={`/pubs/${pub.slug}`}>
            <h3 className={`text-lg font-semibold hover:text-irish-green-500 transition-colors ${isClosed ? 'text-stout-400' : 'text-cream-100'}`}>
              {pub.name}
            </h3>
          </Link>
          {pub.cheapest_guinness && !isClosed && (
            <span className="bg-irish-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
              Guinness {formatPrice(pub.cheapest_guinness)}
            </span>
          )}
        </div>

        <p className="text-sm text-stout-400 mb-3">{pub.address}</p>

        {/* Rating */}
        {pub.avg_rating && pub.avg_rating > 0 ? (
          <div className="flex items-center gap-2 mb-3">
            <StarRating rating={pub.avg_rating} size="sm" showValue />
            <span className="text-sm text-stout-400">
              ({pub.review_count} {pub.review_count === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        ) : (
          <p className="text-sm text-stout-500 mb-3">No ratings yet</p>
        )}

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-3">
          {pub.has_food && (
            <span className="text-xs bg-stout-700 text-stout-300 px-2 py-1 rounded">
              Food
            </span>
          )}
          {pub.has_outdoor_seating && (
            <span className="text-xs bg-stout-700 text-stout-300 px-2 py-1 rounded">
              Outdoor
            </span>
          )}
          {pub.shows_sports && (
            <span className="text-xs bg-stout-700 text-stout-300 px-2 py-1 rounded">
              Sports
            </span>
          )}
          {pub.has_live_music && (
            <span className="text-xs bg-stout-700 text-stout-300 px-2 py-1 rounded">
              Live Music
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/pubs/${pub.slug}`}
            className="flex-1 bg-stout-700 hover:bg-stout-600 text-cream-100 text-sm py-2 px-3 rounded text-center transition-colors"
          >
            View Prices
          </Link>
          <a
            href={getGoogleMapsUrl(pub)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-stout-700 hover:bg-stout-600 text-cream-100 text-sm py-2 px-3 rounded transition-colors"
            title="Open in Google Maps"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
