import { Suspense } from 'react';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import PubCard from '@/components/PubCard';
import { FilterTooltip } from '@/components/OnboardingTooltip';
import SmartSearch from '@/components/SmartSearch';
import { PubCardListSkeleton } from '@/components/Skeleton';
import { isOpenNow } from '@/lib/utils';
import type { Pub } from '@/types';

export const revalidate = 60;
const PAGE_SIZE = 24;

interface SearchParams {
  search?: string;
  neighborhood?: string;
  intent?: 'watch-sports' | 'cheap-pints' | 'live-trad-music' | 'late-night';
  sort?: 'name' | 'rating' | 'price';
  page?: string;
  food?: string;
  music?: string;
  sports?: string;
  outdoor?: string;
  open?: string;
  latebar?: string;
  dogfriendly?: string;
  trad?: string;
  snug?: string;
  craftbeer?: string;
  cider?: string;
  alcoholfree?: string;
}

const filterParams = [
  'food', 'music', 'sports', 'outdoor', 'open', 'latebar', 'dogfriendly', 'trad', 'snug', 'craftbeer', 'cider', 'alcoholfree',
] as const;

type FilterParam = typeof filterParams[number];

function applyIntentDefaults(params: SearchParams): SearchParams {
  const next = { ...params };

  switch (params.intent) {
    case 'cheap-pints':
      next.sort = 'price';
      break;
    case 'watch-sports':
      next.sports = 'true';
      break;
    case 'live-trad-music':
      next.music = 'true';
      next.trad = 'true';
      break;
    case 'late-night':
      next.latebar = 'true';
      break;
    default:
      break;
  }

  return next;
}

function createPubsHref(params: SearchParams): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  const query = search.toString();
  return query ? `/pubs?${query}` : '/pubs';
}

function getPageNumber(pageParam?: string): number {
  const parsed = Number.parseInt(pageParam || '1', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function getRelativeTimeLabel(updatedAt?: string): string | null {
  if (!updatedAt) return null;

  const diffMs = Date.now() - new Date(updatedAt).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return 'Verified <1h ago';
  if (diffHours < 24) return `Verified ${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays <= 7) return `Verified ${diffDays}d ago`;

  return null;
}

function getRankingReasons(pub: Pub, params: SearchParams): string[] {
  const reasons: string[] = [];

  if (params.sort === 'rating' && pub.avg_rating && pub.avg_rating >= 4) reasons.push('Top rated');
  if (params.sort === 'price' && pub.cheapest_guinness && pub.cheapest_guinness <= 6) reasons.push('Best value');
  if (params.intent === 'watch-sports' && pub.shows_sports) reasons.push('Great for sports');
  if (params.intent === 'late-night' && pub.is_late_bar) reasons.push('Open late');
  if (params.intent === 'live-trad-music' && (pub.has_live_music || pub.has_traditional_music)) reasons.push('Live/trad music');

  const freshness = getRelativeTimeLabel(pub.updated_at);
  if (freshness) reasons.push(freshness);

  return reasons;
}

async function getPubs(searchParams: SearchParams): Promise<{ pubs: Pub[]; totalCount: number }> {
  const supabase = await createServerSupabaseClient();
  const effectiveParams = applyIntentDefaults(searchParams);
  const page = getPageNumber(effectiveParams.page);

  let query = supabase.from('pub_summaries').select('*', { count: 'exact' });

  if (effectiveParams.food === 'true') query = query.eq('has_food', true);
  if (effectiveParams.music === 'true') query = query.eq('has_live_music', true);
  if (effectiveParams.sports === 'true') query = query.eq('shows_sports', true);
  if (effectiveParams.outdoor === 'true') query = query.eq('has_outdoor_seating', true);
  if (effectiveParams.latebar === 'true') query = query.eq('is_late_bar', true);
  if (effectiveParams.dogfriendly === 'true') query = query.eq('is_dog_friendly', true);
  if (effectiveParams.trad === 'true') query = query.eq('has_traditional_music', true);
  if (effectiveParams.snug === 'true') query = query.eq('has_snug', true);
  if (effectiveParams.craftbeer === 'true') query = query.eq('is_craft_beer_focused', true);
  if (effectiveParams.cider === 'true') query = query.not('cheapest_cider', 'is', null);
  if (effectiveParams.alcoholfree === 'true') query = query.not('cheapest_non_alcoholic', 'is', null);

  if (effectiveParams.search) {
    query = query.or(`name.ilike.%${effectiveParams.search}%,address.ilike.%${effectiveParams.search}%,neighborhood.ilike.%${effectiveParams.search}%`);
  }
  if (effectiveParams.neighborhood) {
    query = query.ilike('neighborhood', `%${effectiveParams.neighborhood}%`);
  }

  switch (effectiveParams.sort) {
    case 'rating':
      query = query.order('avg_rating', { ascending: false, nullsFirst: false });
      break;
    case 'price':
      query = query.order('cheapest_guinness', { ascending: true, nullsFirst: false });
      break;
    default:
      query = query.order('name', { ascending: true });
  }

  if (effectiveParams.open === 'true') {
    const { data, count } = await query;
    const openPubs = (data || []).filter((pub) => isOpenNow(pub));
    const start = (page - 1) * PAGE_SIZE;
    return { pubs: openPubs.slice(start, start + PAGE_SIZE), totalCount: openPubs.length || count || 0 };
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, count } = await query.range(from, to);

  return { pubs: data || [], totalCount: count || 0 };
}

function FilterButton({ label, param, value, params }: { label: string; param: FilterParam; value: string; params: SearchParams }) {
  const effectiveParams = applyIntentDefaults(params);
  const isActive = effectiveParams[param] === value;
  const nextParams = { ...effectiveParams, page: undefined };

  if (isActive) delete nextParams[param];
  else nextParams[param] = value;

  delete nextParams.intent;

  return (
    <a
      href={createPubsHref(nextParams)}
      className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
        isActive ? 'bg-irish-green-600 text-white' : 'bg-stout-700 text-stout-300 hover:bg-stout-600'
      }`}
    >
      {label}
    </a>
  );
}

function FilterSortBar({ params, hasActiveFilters, clearFiltersHref }: { params: SearchParams; hasActiveFilters: boolean; clearFiltersHref: string }) {
  const activeCount = filterParams.filter((param) => params[param] === 'true').length;

  return (
    <div className="sticky top-16 z-10 bg-stout-950/95 backdrop-blur-sm rounded-lg p-2">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-sm text-stout-400">Sort & filter</span>
        <span className="text-xs text-stout-500">{activeCount > 0 ? `${activeCount} active` : 'No active filters'}</span>
      </div>
      <div className="overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max pb-1">
          <a
            href={createPubsHref({ ...params, sort: 'name', intent: undefined, page: undefined })}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              !params.sort || params.sort === 'name' ? 'bg-irish-green-600 text-white' : 'bg-stout-700 text-stout-300 hover:bg-stout-600'
            }`}
          >
            Name
          </a>
          <a
            href={createPubsHref({ ...params, sort: 'rating', intent: undefined, page: undefined })}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              params.sort === 'rating' ? 'bg-irish-green-600 text-white' : 'bg-stout-700 text-stout-300 hover:bg-stout-600'
            }`}
          >
            Rating
          </a>
          <a
            href={createPubsHref({ ...params, sort: 'price', intent: undefined, page: undefined })}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              params.sort === 'price' ? 'bg-irish-green-600 text-white' : 'bg-stout-700 text-stout-300 hover:bg-stout-600'
            }`}
          >
            Cheapest Guinness
          </a>

          <FilterTooltip>
            <>
              <FilterButton label="Open Now" param="open" value="true" params={params} />
              <FilterButton label="Late Bar" param="latebar" value="true" params={params} />
              <FilterButton label="Food" param="food" value="true" params={params} />
              <FilterButton label="Live Music" param="music" value="true" params={params} />
              <FilterButton label="Trad Music" param="trad" value="true" params={params} />
              <FilterButton label="Sports" param="sports" value="true" params={params} />
              <FilterButton label="Outdoor" param="outdoor" value="true" params={params} />
              <FilterButton label="Dog Friendly" param="dogfriendly" value="true" params={params} />
              <FilterButton label="Snug" param="snug" value="true" params={params} />
              <FilterButton label="Craft Beer" param="craftbeer" value="true" params={params} />
              <FilterButton label="Cider" param="cider" value="true" params={params} />
              <FilterButton label="Alcohol-Free" param="alcoholfree" value="true" params={params} />
              {hasActiveFilters && (
                <a
                  href={clearFiltersHref}
                  className="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap bg-red-900/40 text-red-200 hover:bg-red-900/60 transition-colors"
                >
                  Clear all
                </a>
              )}
            </>
          </FilterTooltip>
        </div>
      </div>
    </div>
  );
}

async function PubsResults({ params }: { params: SearchParams }) {
  const { pubs, totalCount } = await getPubs(params);
  const currentPage = getPageNumber(params.page);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <>
      <div className="mb-4 text-sm text-stout-400">
        {totalCount} pub{totalCount !== 1 ? 's' : ''} found
      </div>

      {pubs.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pubs.map((pub) => (
              <PubCard key={pub.id} pub={pub} rankingReasons={getRankingReasons(pub, params)} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              {currentPage > 1 && (
                <a
                  href={createPubsHref({ ...params, page: String(currentPage - 1) })}
                  className="px-4 py-2 bg-stout-800 hover:bg-stout-700 border border-stout-700 rounded-lg text-sm text-cream-100"
                >
                  Previous
                </a>
              )}
              <span className="text-sm text-stout-400">Page {currentPage} of {totalPages}</span>
              {currentPage < totalPages && (
                <a
                  href={createPubsHref({ ...params, page: String(currentPage + 1) })}
                  className="px-4 py-2 bg-irish-green-600 hover:bg-irish-green-700 rounded-lg text-sm text-white"
                >
                  Next
                </a>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-stout-400 text-lg">No pubs found matching your criteria.</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm">
            <a href="/pubs" className="text-irish-green-500 hover:text-irish-green-400 inline-block">Clear filters</a>
            <span className="text-stout-600">•</span>
            <a href="/pubs?sort=rating" className="text-irish-green-500 hover:text-irish-green-400 inline-block">Show top rated</a>
            <span className="text-stout-600">•</span>
            <a href="/pubs?sort=price" className="text-irish-green-500 hover:text-irish-green-400 inline-block">Show best value</a>
          </div>
        </div>
      )}
    </>
  );
}

export default async function PubsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const effectiveParams = applyIntentDefaults(params);
  const hasActiveFilters = filterParams.some((param) => effectiveParams[param] === 'true');
  const clearFiltersHref = createPubsHref({
    search: effectiveParams.search,
    sort: effectiveParams.sort,
    neighborhood: effectiveParams.neighborhood,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cream-100 mb-2">Dublin Pubs</h1>
        <p className="text-stout-400">Browse pubs and find the best prices</p>
      </div>

      <div className="mb-8 space-y-4">
        <SmartSearch placeholder="Search pubs by name, neighborhood, or drink..." />
        <FilterSortBar
          params={effectiveParams}
          hasActiveFilters={hasActiveFilters}
          clearFiltersHref={clearFiltersHref}
        />
      </div>

      <Suspense key={JSON.stringify(effectiveParams)} fallback={<PubCardListSkeleton count={9} />}>
        <PubsResults params={effectiveParams} />
      </Suspense>
    </div>
  );
}
