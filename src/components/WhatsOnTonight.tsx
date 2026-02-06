'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { SportEvent } from '@/lib/sports-events';
import { getSportIcon, getLeagueShortName, formatMatchTime } from '@/lib/sports-events';

interface PubEventItem {
  id: string;
  title: string;
  pub_name: string;
  pub_slug: string;
  event_type: string;
  start_time: string | null;
}

interface WhatsOnTonightProps {
  pubEvents?: PubEventItem[];
}

export default function WhatsOnTonight({ pubEvents = [] }: WhatsOnTonightProps) {
  const [sportsEvents, setSportsEvents] = useState<SportEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sports' | 'events'>('sports');

  useEffect(() => {
    async function fetchSports() {
      try {
        const res = await fetch('/api/events/sports');
        const data = await res.json();
        setSportsEvents(data.events || []);
      } catch {
        setSportsEvents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSports();
  }, []);

  const todayEvents = sportsEvents.filter(e => {
    const eventDate = new Date(e.dateTime);
    const now = new Date();
    const endOfTomorrow = new Date(now);
    endOfTomorrow.setDate(endOfTomorrow.getDate() + 2);
    endOfTomorrow.setHours(0, 0, 0, 0);
    return eventDate < endOfTomorrow;
  });

  const weekendEvents = sportsEvents.filter(e => {
    const eventDate = new Date(e.dateTime);
    const now = new Date();
    const endOfTomorrow = new Date(now);
    endOfTomorrow.setDate(endOfTomorrow.getDate() + 2);
    endOfTomorrow.setHours(0, 0, 0, 0);
    return eventDate >= endOfTomorrow;
  });

  const displayEvents = activeTab === 'sports'
    ? [...todayEvents, ...weekendEvents.slice(0, 10)]
    : [];

  return (
    <section className="py-6">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-cream-100">What&apos;s On</h2>
            <p className="text-sm text-stout-400">Sports, events & craic this week</p>
          </div>
          <Link
            href="/tonight"
            className="text-sm text-irish-green-500 hover:text-irish-green-400 font-medium"
          >
            See all
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('sports')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'sports'
                ? 'bg-irish-green-600 text-white'
                : 'bg-stout-800 text-stout-300 hover:text-cream-100'
            }`}
          >
            Sports
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'events'
                ? 'bg-irish-green-600 text-white'
                : 'bg-stout-800 text-stout-300 hover:text-cream-100'
            }`}
          >
            Pub Events
          </button>
        </div>

        {/* Content */}
        {activeTab === 'sports' && (
          <>
            {loading ? (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-[280px] sm:w-[320px] h-[140px] bg-stout-800 rounded-xl animate-pulse snap-start"
                  />
                ))}
              </div>
            ) : displayEvents.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
                {displayEvents.map(event => (
                  <Link
                    key={event.id}
                    href={`/pubs?intent=watch-sports`}
                    className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start"
                  >
                    <div className={`relative rounded-xl p-4 border transition-all active:scale-[0.98] ${
                      event.isIrelandGame
                        ? 'bg-gradient-to-br from-irish-green-700/30 to-stout-800 border-irish-green-600/50'
                        : event.isBigMatch
                          ? 'bg-gradient-to-br from-amber-900/30 to-stout-800 border-amber-700/50'
                          : 'bg-stout-800 border-stout-700'
                    }`}>
                      {/* League & Sport Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-stout-700 text-stout-300">
                          {getSportIcon(event.sport)} {getLeagueShortName(event.league)}
                        </span>
                        {event.isIrelandGame && (
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-irish-green-600 text-white">
                            IRELAND
                          </span>
                        )}
                        {!event.isIrelandGame && event.isBigMatch && (
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-600 text-white">
                            BIG MATCH
                          </span>
                        )}
                      </div>

                      {/* Teams */}
                      <div className="space-y-1 mb-3">
                        <p className="text-cream-100 font-semibold text-sm leading-tight">
                          {event.homeTeam}
                        </p>
                        <p className="text-stout-400 text-xs">vs</p>
                        <p className="text-cream-100 font-semibold text-sm leading-tight">
                          {event.awayTeam}
                        </p>
                      </div>

                      {/* Time & Venue */}
                      <div className="flex items-center justify-between">
                        <span className="text-irish-green-500 text-sm font-medium">
                          {formatMatchTime(event.dateTime)}
                        </span>
                        {event.venue && (
                          <span className="text-xs text-stout-400 truncate max-w-[120px]">
                            {event.venue}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}

                {/* View All Card */}
                <Link
                  href="/tonight"
                  className="flex-shrink-0 w-[140px] snap-start"
                >
                  <div className="h-full min-h-[140px] rounded-xl border border-stout-700 bg-stout-800/50 flex flex-col items-center justify-center gap-2 hover:border-irish-green-600 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-stout-700 flex items-center justify-center">
                      <svg className="w-5 h-5 text-irish-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-stout-300 font-medium">View All</span>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 bg-stout-800/50 rounded-xl border border-stout-700">
                <p className="text-stout-400 text-sm">No upcoming matches found</p>
                <p className="text-stout-500 text-xs mt-1">Check back later for fixtures</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'events' && (
          <>
            {pubEvents.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
                {pubEvents.map(event => (
                  <Link
                    key={event.id}
                    href={`/pubs/${event.pub_slug}`}
                    className="flex-shrink-0 w-[260px] snap-start"
                  >
                    <div className="rounded-xl p-4 border border-stout-700 bg-stout-800 hover:border-irish-green-600/50 transition-all active:scale-[0.98]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-stout-700 text-stout-300">
                          {event.event_type === 'trad_session' ? '\uD83C\uDFBB Trad' :
                           event.event_type === 'quiz' ? '\u2753 Quiz' :
                           event.event_type === 'live_music' ? '\uD83C\uDFB8 Music' :
                           event.event_type === 'match_day' ? '\uD83C\uDFC8 Match' : '\uD83C\uDF89 Event'}
                        </span>
                        {event.start_time && (
                          <span className="text-xs text-irish-green-500 font-medium">
                            {event.start_time}
                          </span>
                        )}
                      </div>
                      <p className="text-cream-100 font-semibold text-sm mb-1">{event.title}</p>
                      <p className="text-stout-400 text-xs">{event.pub_name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-stout-800/50 rounded-xl border border-stout-700">
                <p className="text-stout-400 text-sm">No pub events tonight</p>
                <Link href="/tonight" className="text-irish-green-500 text-xs mt-1 inline-block">
                  Check the full schedule
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
