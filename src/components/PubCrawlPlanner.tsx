'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { formatPrice, getDistanceKm, formatDistance } from '@/lib/utils';
import type { PubCrawl, PubCrawlStop } from '@/types';

// Simplified pub type for search results
interface PubSearchResult {
  id: string;
  name: string;
  slug: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  cheapest_guinness: number | null;
}

interface PubCrawlPlannerProps {
  userId?: string;
  initialPubs?: PubSearchResult[];
}

export default function PubCrawlPlanner({ userId, initialPubs = [] }: PubCrawlPlannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [crawls, setCrawls] = useState<PubCrawl[]>([]);
  const [activeCrawl, setActiveCrawl] = useState<PubCrawl | null>(null);
  const [stops, setStops] = useState<PubCrawlStop[]>([]);
  const [availablePubs, setAvailablePubs] = useState<PubSearchResult[]>(initialPubs);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New crawl form
  const [crawlName, setCrawlName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const supabase = createClient();

  // Load user's crawls
  useEffect(() => {
    if (!userId || !isOpen) return;

    async function loadCrawls() {
      const { data } = await supabase
        .from('pub_crawls')
        .select(`
          *,
          stops:pub_crawl_stops(
            *,
            pub:pubs(id, name, slug, address, latitude, longitude, cheapest_guinness)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (data) {
        setCrawls(data);
      }
    }

    loadCrawls();
  }, [userId, isOpen, supabase]);

  // Search for pubs
  const searchPubs = useCallback(async (query: string) => {
    if (query.length < 2) {
      setAvailablePubs(initialPubs);
      return;
    }

    const { data } = await supabase
      .from('pubs')
      .select('id, name, slug, address, latitude, longitude, cheapest_guinness')
      .or(`name.ilike.%${query}%,address.ilike.%${query}%`)
      .eq('is_active', true)
      .limit(20);

    if (data) {
      setAvailablePubs(data);
    }
  }, [supabase, initialPubs]);

  useEffect(() => {
    const timer = setTimeout(() => searchPubs(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchPubs]);

  const createCrawl = async () => {
    if (!userId || !crawlName.trim()) return;

    setIsCreating(true);

    try {
      const { data, error } = await supabase
        .from('pub_crawls')
        .insert({
          user_id: userId,
          name: crawlName.trim(),
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      setCrawls([{ ...data, stops: [] }, ...crawls]);
      setActiveCrawl(data);
      setStops([]);
      setCrawlName('');
    } catch (err) {
      console.error('Failed to create crawl:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const addStop = async (pub: PubSearchResult) => {
    if (!activeCrawl) return;

    // Check if pub already in crawl
    if (stops.some(s => s.pub_id === pub.id)) return;

    const newOrder = stops.length + 1;

    try {
      const { data, error } = await supabase
        .from('pub_crawl_stops')
        .insert({
          crawl_id: activeCrawl.id,
          pub_id: pub.id,
          stop_order: newOrder,
        })
        .select(`
          *,
          pub:pubs(id, name, slug, address, latitude, longitude, cheapest_guinness)
        `)
        .single();

      if (error) throw error;

      setStops([...stops, data]);
      updateCrawlStats([...stops, data]);
    } catch (err) {
      console.error('Failed to add stop:', err);
    }
  };

  const removeStop = async (stopId: string) => {
    try {
      await supabase.from('pub_crawl_stops').delete().eq('id', stopId);
      const newStops = stops.filter(s => s.id !== stopId);
      setStops(newStops);
      updateCrawlStats(newStops);
    } catch (err) {
      console.error('Failed to remove stop:', err);
    }
  };

  const reorderStop = async (stopId: string, direction: 'up' | 'down') => {
    const index = stops.findIndex(s => s.id === stopId);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === stops.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newStops = [...stops];
    [newStops[index], newStops[newIndex]] = [newStops[newIndex], newStops[index]];

    // Update order numbers
    const updates = newStops.map((stop, i) => ({
      id: stop.id,
      stop_order: i + 1,
    }));

    setStops(newStops.map((s, i) => ({ ...s, stop_order: i + 1 })));

    // Update in database
    for (const update of updates) {
      await supabase
        .from('pub_crawl_stops')
        .update({ stop_order: update.stop_order })
        .eq('id', update.id);
    }
  };

  const updateCrawlStats = async (currentStops: PubCrawlStop[]) => {
    if (!activeCrawl || currentStops.length < 2) return;

    // Calculate total distance
    let totalDistance = 0;
    for (let i = 0; i < currentStops.length - 1; i++) {
      const from = currentStops[i].pub;
      const to = currentStops[i + 1].pub;
      if (from?.latitude && from?.longitude && to?.latitude && to?.longitude) {
        totalDistance += getDistanceKm(
          from.latitude,
          from.longitude,
          to.latitude,
          to.longitude
        );
      }
    }

    // Estimate duration (15 min per pub + walking time at 5km/h)
    const walkingTime = (totalDistance / 5) * 60; // minutes
    const pubTime = currentStops.length * 30; // 30 min per pub
    const estimatedDuration = Math.round(walkingTime + pubTime);

    await supabase
      .from('pub_crawls')
      .update({
        total_distance_km: Math.round(totalDistance * 10) / 10,
        estimated_duration_mins: estimatedDuration,
      })
      .eq('id', activeCrawl.id);
  };

  const startCrawl = async () => {
    if (!activeCrawl) return;

    await supabase
      .from('pub_crawls')
      .update({ status: 'in_progress', started_at: new Date().toISOString() })
      .eq('id', activeCrawl.id);

    setActiveCrawl({ ...activeCrawl, status: 'in_progress' });
  };

  const markStopVisited = async (stopId: string) => {
    await supabase
      .from('pub_crawl_stops')
      .update({ visited: true, visited_at: new Date().toISOString() })
      .eq('id', stopId);

    setStops(stops.map(s =>
      s.id === stopId ? { ...s, visited: true, visited_at: new Date().toISOString() } : s
    ));
  };

  if (!userId) {
    return (
      <button
        disabled
        className="flex items-center gap-2 bg-stout-700 text-stout-400 px-4 py-2 rounded-lg cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        Sign in to plan crawl
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        Pub Crawl Planner
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-stout-800 rounded-lg border border-stout-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-stout-700">
              <h2 className="text-lg font-semibold text-cream-100">Pub Crawl Planner</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stout-400 hover:text-cream-100"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* If no active crawl, show list or create new */}
              {!activeCrawl ? (
                <div className="space-y-4">
                  {/* Create new crawl */}
                  <div className="bg-stout-700/50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-cream-100 mb-3">Start a New Crawl</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={crawlName}
                        onChange={(e) => setCrawlName(e.target.value)}
                        placeholder="e.g., Saturday Night Crawl"
                        className="flex-1 bg-stout-700 border border-stout-600 rounded-lg px-3 py-2 text-cream-100 placeholder-stout-500 focus:border-irish-green-500 focus:outline-none"
                      />
                      <button
                        onClick={createCrawl}
                        disabled={!crawlName.trim() || isCreating}
                        className="bg-irish-green-600 hover:bg-irish-green-700 disabled:bg-stout-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        {isCreating ? '...' : 'Create'}
                      </button>
                    </div>
                  </div>

                  {/* Existing crawls */}
                  {crawls.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-stout-300 mb-3">Your Crawls</h3>
                      <div className="space-y-2">
                        {crawls.map(crawl => (
                          <button
                            key={crawl.id}
                            onClick={() => {
                              setActiveCrawl(crawl);
                              setStops(crawl.stops || []);
                            }}
                            className="w-full text-left bg-stout-700/50 hover:bg-stout-700 rounded-lg p-3 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-cream-100 font-medium">{crawl.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                crawl.status === 'completed'
                                  ? 'bg-green-900/50 text-green-400'
                                  : crawl.status === 'in_progress'
                                    ? 'bg-amber-900/50 text-amber-400'
                                    : 'bg-stout-600 text-stout-300'
                              }`}>
                                {crawl.status}
                              </span>
                            </div>
                            <p className="text-sm text-stout-400">
                              {crawl.stops?.length || 0} stops
                              {crawl.total_distance_km && ` • ${formatDistance(crawl.total_distance_km)}`}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Back button */}
                  <button
                    onClick={() => {
                      setActiveCrawl(null);
                      setStops([]);
                    }}
                    className="text-sm text-stout-400 hover:text-cream-100 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to crawls
                  </button>

                  {/* Crawl header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-cream-100">{activeCrawl.name}</h3>
                      {stops.length >= 2 && activeCrawl.total_distance_km && (
                        <p className="text-sm text-stout-400">
                          {stops.length} stops • {formatDistance(activeCrawl.total_distance_km)} • ~{activeCrawl.estimated_duration_mins} mins
                        </p>
                      )}
                    </div>
                    {activeCrawl.status === 'draft' && stops.length >= 2 && (
                      <button
                        onClick={startCrawl}
                        className="bg-irish-green-600 hover:bg-irish-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        Start Crawl
                      </button>
                    )}
                  </div>

                  {/* Current stops */}
                  {stops.length > 0 && (
                    <div className="space-y-2">
                      {stops
                        .sort((a, b) => a.stop_order - b.stop_order)
                        .map((stop, index) => (
                          <div
                            key={stop.id}
                            className={`flex items-center gap-3 p-3 rounded-lg ${
                              stop.visited
                                ? 'bg-green-900/20 border border-green-700/50'
                                : 'bg-stout-700/50'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              stop.visited ? 'bg-green-600 text-white' : 'bg-stout-600 text-stout-300'
                            }`}>
                              {stop.visited ? '✓' : index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-cream-100 font-medium">{stop.pub?.name}</p>
                              <p className="text-sm text-stout-400">
                                {stop.pub?.address}
                                {stop.pub?.cheapest_guinness && (
                                  <span className="text-irish-green-500 ml-2">
                                    Guinness {formatPrice(stop.pub.cheapest_guinness)}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {activeCrawl.status === 'in_progress' && !stop.visited && (
                                <button
                                  onClick={() => markStopVisited(stop.id)}
                                  className="p-2 text-green-500 hover:bg-green-900/30 rounded"
                                  title="Mark as visited"
                                >
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                              )}
                              {activeCrawl.status === 'draft' && (
                                <>
                                  <button
                                    onClick={() => reorderStop(stop.id, 'up')}
                                    disabled={index === 0}
                                    className="p-1 text-stout-400 hover:text-cream-100 disabled:opacity-30"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => reorderStop(stop.id, 'down')}
                                    disabled={index === stops.length - 1}
                                    className="p-1 text-stout-400 hover:text-cream-100 disabled:opacity-30"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => removeStop(stop.id)}
                                    className="p-1 text-red-400 hover:text-red-300"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Add pubs */}
                  {activeCrawl.status === 'draft' && (
                    <div>
                      <h4 className="text-sm font-medium text-stout-300 mb-2">Add Pubs</h4>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search pubs..."
                        className="w-full bg-stout-700 border border-stout-600 rounded-lg px-3 py-2 text-cream-100 placeholder-stout-500 focus:border-irish-green-500 focus:outline-none mb-2"
                      />
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {availablePubs
                          .filter(pub => !stops.some(s => s.pub_id === pub.id))
                          .slice(0, 10)
                          .map(pub => (
                            <button
                              key={pub.id}
                              onClick={() => addStop(pub)}
                              className="w-full text-left p-2 rounded hover:bg-stout-700 transition-colors"
                            >
                              <p className="text-cream-100 text-sm">{pub.name}</p>
                              <p className="text-xs text-stout-400">{pub.address}</p>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
