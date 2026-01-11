import { Suspense } from 'react';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import PubCard from '@/components/PubCard';
import { isOpenNow } from '@/lib/utils';
import type { Pub } from '@/types';

export const revalidate = 60;

interface SearchParams {
  search?: string;
  sort?: 'name' | 'rating' | 'price';
  food?: string;
  music?: string;
  sports?: string;
  outdoor?: string;
  open?: string;
}

async function getPubs(searchParams: SearchParams): Promise<Pub[]> {
  const supabase = await createServerSupabaseClient();

  let query = supabase.from('pub_summaries').select('*');

  // Apply filters
  if (searchParams.food === 'true') {
    query = query.eq('has_food', true);
  }
  if (searchParams.music === 'true') {
    query = query.eq('has_live_music', true);
  }
  if (searchParams.sports === 'true') {
    query = query.eq('shows_sports', true);
  }
  if (searchParams.outdoor === 'true') {
    query = query.eq('has_outdoor_seating', true);
  }

  // Apply search
  if (searchParams.search) {
    query = query.or(`name.ilike.%${searchParams.search}%,address.ilike.%${searchParams.search}%`);
  }

  // Apply sorting
  switch (searchParams.sort) {
    case 'rating':
      query = query.order('avg_rating', { ascending: false, nullsFirst: false });
      break;
    case 'price':
      query = query.order('cheapest_guinness', { ascending: true, nullsFirst: false });
      break;
    default:
      query = query.order('name', { ascending: true });
  }

  const { data } = await query;
  let pubs = data || [];

  // Filter for open pubs (client-side since it depends on current time)
  if (searchParams.open === 'true') {
    pubs = pubs.filter(pub => isOpenNow(pub));
  }

  return pubs;
}

function FilterButton({
  label,
  param,
  value,
  currentValue,
}: {
  label: string;
  param: string;
  value: string;
  currentValue?: string;
}) {
  const isActive = currentValue === value;
  const href = isActive ? `/pubs` : `/pubs?${param}=${value}`;

  return (
    <a
      href={href}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        isActive
          ? 'bg-irish-green-600 text-white'
          : 'bg-stout-700 text-stout-300 hover:bg-stout-600'
      }`}
    >
      {label}
    </a>
  );
}

export default async function PubsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const pubs = await getPubs(params);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cream-100 mb-2">Dublin Pubs</h1>
        <p className="text-stout-400">Browse pubs and find the best prices</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <form action="/pubs" method="GET" className="flex gap-2">
          <input
            type="text"
            name="search"
            defaultValue={params.search}
            placeholder="Search pubs by name or area..."
            className="flex-1 px-4 py-2 bg-stout-800 border border-stout-700 rounded-lg text-cream-100 placeholder-stout-400 focus:outline-none focus:border-irish-green-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-irish-green-600 hover:bg-irish-green-700 text-white font-medium rounded-lg transition-colors"
          >
            Search
          </button>
        </form>

        {/* Sort and Filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-stout-400">Sort by:</span>
          <a
            href="/pubs?sort=name"
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !params.sort || params.sort === 'name'
                ? 'bg-irish-green-600 text-white'
                : 'bg-stout-700 text-stout-300 hover:bg-stout-600'
            }`}
          >
            Name
          </a>
          <a
            href="/pubs?sort=rating"
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              params.sort === 'rating'
                ? 'bg-irish-green-600 text-white'
                : 'bg-stout-700 text-stout-300 hover:bg-stout-600'
            }`}
          >
            Rating
          </a>
          <a
            href="/pubs?sort=price"
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              params.sort === 'price'
                ? 'bg-irish-green-600 text-white'
                : 'bg-stout-700 text-stout-300 hover:bg-stout-600'
            }`}
          >
            Cheapest Guinness
          </a>

          <span className="text-stout-600 mx-2">|</span>

          <span className="text-sm text-stout-400">Filter:</span>
          <FilterButton label="Open Now" param="open" value="true" currentValue={params.open} />
          <FilterButton label="Food" param="food" value="true" currentValue={params.food} />
          <FilterButton label="Live Music" param="music" value="true" currentValue={params.music} />
          <FilterButton label="Sports" param="sports" value="true" currentValue={params.sports} />
          <FilterButton label="Outdoor" param="outdoor" value="true" currentValue={params.outdoor} />
        </div>
      </div>

      {/* Results */}
      <div className="mb-4 text-sm text-stout-400">
        {pubs.length} pub{pubs.length !== 1 ? 's' : ''} found
      </div>

      {pubs.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pubs.map((pub) => (
            <PubCard key={pub.id} pub={pub} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-stout-400 text-lg">No pubs found matching your criteria.</p>
          <a href="/pubs" className="text-irish-green-500 hover:text-irish-green-400 mt-2 inline-block">
            Clear filters
          </a>
        </div>
      )}
    </div>
  );
}
