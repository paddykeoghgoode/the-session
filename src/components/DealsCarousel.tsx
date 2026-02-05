import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

interface Deal {
  id: string;
  price: number;
  deal_title: string | null;
  deal_description: string | null;
  deal_type: string;
  food_item: string | null;
  drink?: { name: string } | null;
  pub?: { name: string; slug: string } | null;
}

interface DealsCarouselProps {
  deals: Deal[];
}

export default function DealsCarousel({ deals }: DealsCarouselProps) {
  if (!deals || deals.length === 0) return null;

  return (
    <section className="py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-cream-100">Active Deals</h2>
            <p className="text-sm text-stout-400">Grab them before they&apos;re gone</p>
          </div>
          <Link
            href="/deals"
            className="text-sm text-irish-green-500 hover:text-irish-green-400 font-medium"
          >
            See all
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory px-4 sm:px-6 lg:px-8">
          {deals.map(deal => (
            <Link
              key={deal.id}
              href={`/pubs/${deal.pub?.slug}`}
              className="flex-shrink-0 w-[240px] sm:w-[280px] snap-start"
            >
              <div className="rounded-xl p-4 bg-gradient-to-br from-amber-900/30 to-stout-800 border border-amber-700/40 hover:border-amber-600 transition-all active:scale-[0.98] h-full">
                {/* Price Badge */}
                <div className="flex items-start justify-between mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-600/20 text-amber-400 text-xs font-medium">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    DEAL
                  </span>
                  <span className="text-xl font-bold text-irish-green-500">
                    {formatPrice(deal.price)}
                  </span>
                </div>

                {/* Deal Info */}
                <p className="text-cream-100 font-semibold text-sm mb-1 line-clamp-1">
                  {deal.deal_title || deal.drink?.name || deal.food_item || 'Special Deal'}
                </p>
                <p className="text-stout-400 text-xs mb-2">{deal.pub?.name}</p>

                {deal.deal_type === 'food_combo' && deal.food_item && deal.drink?.name && (
                  <p className="text-xs text-amber-300/80 line-clamp-1">
                    {deal.food_item} + {deal.drink.name}
                  </p>
                )}
                {deal.deal_description && (
                  <p className="text-xs text-stout-300 line-clamp-2 mt-1">
                    {deal.deal_description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
