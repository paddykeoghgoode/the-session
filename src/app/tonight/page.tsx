import { createServerSupabaseClient, getUser } from '@/lib/supabase-server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { PubEvent, Price, Pub, CheckIn } from '@/types';
import { formatPrice } from '@/lib/utils';

export const revalidate = 0; // Always fresh for "Tonight" feed

interface TonightEvent {
  event: PubEvent;
  pub: Pub;
}

interface TonightDeal {
  price: Price;
  pub: Pub;
}

async function getTonightEvents() {
  const supabase = await createServerSupabaseClient();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  const { data } = await supabase
    .from('pub_events')
    .select(`
      *,
      pub:pubs(*)
    `)
    .eq('is_active', true)
    .or(`specific_date.eq.${new Date().toISOString().split('T')[0]},day_of_week.cs.{${today}}`)
    .order('start_time', { ascending: true })
    .limit(20);

  return (data || []) as TonightEvent[];
}

async function getActiveDeals() {
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();

  const { data } = await supabase
    .from('prices')
    .select(`
      *,
      pub:pubs(*),
      drink:drinks(*)
    `)
    .eq('is_deal', true)
    .or(`deal_end_date.is.null,deal_end_date.gte.${now}`)
    .order('created_at', { ascending: false })
    .limit(10);

  return (data || []) as TonightDeal[];
}

async function getRecentCheckIns() {
  const supabase = await createServerSupabaseClient();
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('check_ins')
    .select(`
      *,
      pub:pubs(*),
      profile:profiles(username, display_name)
    `)
    .gte('created_at', twoHoursAgo)
    .order('created_at', { ascending: false })
    .limit(30);

  return data || [];
}

async function getBuzzingPubs() {
  const supabase = await createServerSupabaseClient();
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  // Get pubs with most check-ins in last 2 hours
  const { data } = await supabase
    .from('check_ins')
    .select(`
      pub_id,
      pub:pubs(*)
    `)
    .gte('created_at', twoHoursAgo);

  if (!data) return [];

  // Count check-ins per pub
  const pubCheckIns = data.reduce((acc: Record<string, { pub: Pub; count: number }>, item) => {
    const pubId = item.pub_id;
    if (!acc[pubId] && item.pub) {
      acc[pubId] = { pub: item.pub as Pub, count: 0 };
    }
    if (acc[pubId]) {
      acc[pubId].count++;
    }
    return acc;
  }, {});

  return Object.values(pubCheckIns)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export default async function TonightPage() {
  const user = await getUser();

  const [events, deals, checkIns, buzzingPubs] = await Promise.all([
    getTonightEvents(),
    getActiveDeals(),
    getRecentCheckIns(),
    getBuzzingPubs(),
  ]);

  const now = new Date();
  const currentHour = now.getHours();

  // Filter events happening soon (within next 4 hours)
  const upcomingEvents = events.filter(({ event }) => {
    if (!event.start_time) return true;
    const eventHour = parseInt(event.start_time.split(':')[0]);
    return eventHour >= currentHour && eventHour <= currentHour + 4;
  });

  // Filter deals ending soon (within next 24 hours)
  const endingSoonDeals = deals.filter(({ price }) => {
    if (!price.deal_end_date) return false;
    const endTime = new Date(price.deal_end_date).getTime();
    const hoursUntilEnd = (endTime - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilEnd <= 24 && hoursUntilEnd > 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cream-100 mb-2">
          🌙 Tonight in Dublin
        </h1>
        <p className="text-stout-400">
          {now.toLocaleDateString('en-IE', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-stout-800 rounded-lg border border-stout-700 p-6">
          <h2 className="text-xl font-bold text-cream-100 mb-4 flex items-center gap-2">
            🎵 Events Starting Soon
            {upcomingEvents.length > 0 && (
              <span className="text-sm bg-irish-green-600 px-2 py-1 rounded-full">
                {upcomingEvents.length}
              </span>
            )}
          </h2>

          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.map(({ event, pub }) => (
                <Link
                  key={event.id}
                  href={`/pubs/${pub.id}`}
                  className="block bg-stout-700 rounded-lg p-4 hover:bg-stout-600 transition-colors border border-stout-600"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-cream-100">{event.title}</p>
                      <p className="text-sm text-stout-400">{pub.name}</p>
                      {event.description && (
                        <p className="text-sm text-stout-300 mt-1">{event.description}</p>
                      )}
                    </div>
                    {event.start_time && (
                      <span className="text-irish-green-500 font-medium text-sm whitespace-nowrap ml-2">
                        {event.start_time}
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    {event.event_type === 'trad_session' && <span className="text-xs bg-irish-green-600 px-2 py-1 rounded">🎻 Trad Session</span>}
                    {event.event_type === 'quiz' && <span className="text-xs bg-amber-600 px-2 py-1 rounded">❓ Quiz Night</span>}
                    {event.event_type === 'live_music' && <span className="text-xs bg-purple-600 px-2 py-1 rounded">🎸 Live Music</span>}
                    {event.event_type === 'match_day' && <span className="text-xs bg-blue-600 px-2 py-1 rounded">🏈 Match Day</span>}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-stout-400">
              <p>No events scheduled for tonight</p>
              <Link href="/pubs" className="text-irish-green-500 hover:text-irish-green-400 text-sm mt-2 inline-block">
                Browse pubs →
              </Link>
            </div>
          )}
        </div>

        {/* Deals Ending Soon */}
        <div className="bg-stout-800 rounded-lg border border-stout-700 p-6">
          <h2 className="text-xl font-bold text-cream-100 mb-4 flex items-center gap-2">
            ⚡ Deals Ending Soon
            {endingSoonDeals.length > 0 && (
              <span className="text-sm bg-amber-600 px-2 py-1 rounded-full">
                {endingSoonDeals.length}
              </span>
            )}
          </h2>

          {endingSoonDeals.length > 0 ? (
            <div className="space-y-3">
              {endingSoonDeals.map(({ price, pub }) => {
                const hoursLeft = price.deal_end_date
                  ? Math.round((new Date(price.deal_end_date).getTime() - now.getTime()) / (1000 * 60 * 60))
                  : null;

                return (
                  <Link
                    key={price.id}
                    href={`/pubs/${pub.id}`}
                    className="block bg-stout-700 rounded-lg p-4 hover:bg-stout-600 transition-colors border border-stout-600"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-cream-100">{price.deal_title || 'Deal'}</p>
                        <p className="text-sm text-stout-400">{pub.name}</p>
                        {price.deal_description && (
                          <p className="text-sm text-stout-300 mt-1">{price.deal_description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-amber-500">{formatPrice(price.price)}</p>
                        {hoursLeft !== null && (
                          <p className="text-xs text-amber-400">
                            {hoursLeft}h left
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-stout-400">
              <p>No deals expiring soon</p>
              <Link href="/deals" className="text-irish-green-500 hover:text-irish-green-400 text-sm mt-2 inline-block">
                See all deals →
              </Link>
            </div>
          )}
        </div>

        {/* Buzzing Right Now */}
        <div className="bg-stout-800 rounded-lg border border-stout-700 p-6">
          <h2 className="text-xl font-bold text-cream-100 mb-4 flex items-center gap-2">
            🔥 Buzzing Right Now
          </h2>

          {buzzingPubs.length > 0 ? (
            <div className="space-y-3">
              {buzzingPubs.map(({ pub, count }) => (
                <Link
                  key={pub.id}
                  href={`/pubs/${pub.id}`}
                  className="block bg-stout-700 rounded-lg p-4 hover:bg-stout-600 transition-colors border border-stout-600"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-cream-100">{pub.name}</p>
                      <p className="text-sm text-stout-400">{pub.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl">🔥</p>
                      <p className="text-xs text-irish-green-500">
                        {count} {count === 1 ? 'person' : 'people'} here
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-stout-400">
              <p>No recent check-ins</p>
              {user && (
                <p className="text-sm mt-2">Be the first to check in tonight!</p>
              )}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-stout-800 rounded-lg border border-stout-700 p-6">
          <h2 className="text-xl font-bold text-cream-100 mb-4">
            📍 Recent Check-ins
          </h2>

          {checkIns.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {checkIns.slice(0, 10).map((checkIn) => {
                const minutesAgo = Math.round((now.getTime() - new Date(checkIn.created_at).getTime()) / (1000 * 60));
                return (
                  <div key={checkIn.id} className="flex items-center gap-3 py-2 border-b border-stout-700 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-irish-green-600 flex items-center justify-center text-white font-medium">
                      {checkIn.profile?.display_name?.[0] || checkIn.profile?.username?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-cream-100">
                        <span className="font-medium">{checkIn.profile?.display_name || checkIn.profile?.username || 'Someone'}</span>
                        {' @ '}
                        <Link href={`/pubs/${checkIn.pub_id}`} className="text-irish-green-500 hover:text-irish-green-400">
                          {checkIn.pub?.name}
                        </Link>
                      </p>
                      <p className="text-xs text-stout-400">
                        {minutesAgo < 1 ? 'Just now' : `${minutesAgo}m ago`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-stout-400">
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* All Events Today */}
      {events.length > upcomingEvents.length && (
        <div className="mt-8 bg-stout-800 rounded-lg border border-stout-700 p-6">
          <h2 className="text-xl font-bold text-cream-100 mb-4">
            All Events Today
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map(({ event, pub }) => (
              <Link
                key={event.id}
                href={`/pubs/${pub.id}`}
                className="block bg-stout-700 rounded-lg p-4 hover:bg-stout-600 transition-colors border border-stout-600"
              >
                <p className="font-medium text-cream-100">{event.title}</p>
                <p className="text-sm text-stout-400">{pub.name}</p>
                {event.start_time && (
                  <p className="text-sm text-irish-green-500 mt-1">{event.start_time}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
