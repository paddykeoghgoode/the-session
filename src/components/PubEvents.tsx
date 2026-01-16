'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

interface PubEvent {
  id: string;
  title: string;
  event_type: 'trad_session' | 'quiz' | 'live_music' | 'match_day' | 'other';
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  day_of_week: string[];
  specific_date: string | null;
  is_recurring: boolean;
}

interface PubEventsProps {
  pubId: string;
}

const EVENT_ICONS: Record<string, string> = {
  trad_session: '🎻',
  quiz: '❓',
  live_music: '🎵',
  match_day: '⚽',
  other: '📅',
};

const EVENT_LABELS: Record<string, string> = {
  trad_session: 'Trad Session',
  quiz: 'Quiz Night',
  live_music: 'Live Music',
  match_day: 'Match Day',
  other: 'Event',
};

const DAY_ABBR: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

export default function PubEvents({ pubId }: PubEventsProps) {
  const [events, setEvents] = useState<PubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('pub_id', pubId)
        .eq('is_active', true)
        .order('event_type');

      setEvents(data || []);
      setLoading(false);
    }

    fetchEvents();
  }, [pubId, supabase]);

  if (loading) {
    return (
      <div className="bg-stout-800 rounded-lg border border-stout-700 p-4 animate-pulse">
        <div className="h-4 bg-stout-700 rounded w-24 mb-3"></div>
        <div className="h-12 bg-stout-700 rounded"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return null;
  }

  const formatTime = (time: string | null) => {
    if (!time) return '';
    // Time comes as "HH:MM:SS", convert to "HH:MM"
    return time.slice(0, 5);
  };

  const formatDays = (days: string[]) => {
    if (!days || days.length === 0) return '';
    if (days.length === 7) return 'Daily';
    return days.map(d => DAY_ABBR[d] || d).join(', ');
  };

  const isHappeningToday = (event: PubEvent) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return event.day_of_week?.includes(today);
  };

  return (
    <div className="bg-stout-800 rounded-lg border border-stout-700 p-4">
      <h4 className="text-sm font-medium text-cream-100 mb-3 flex items-center gap-2">
        <span>📅</span>
        Events & Sessions
      </h4>

      <div className="space-y-3">
        {events.map((event) => {
          const happeningToday = isHappeningToday(event);

          return (
            <div
              key={event.id}
              className={`p-3 rounded-lg border transition-colors ${
                happeningToday
                  ? 'bg-irish-green-500/10 border-irish-green-500/30'
                  : 'bg-stout-700/50 border-stout-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{EVENT_ICONS[event.event_type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h5 className="font-medium text-cream-100">{event.title}</h5>
                    {happeningToday && (
                      <span className="px-2 py-0.5 bg-irish-green-500 text-white text-xs font-medium rounded-full">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-stout-400 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-stout-600 rounded">
                      {EVENT_LABELS[event.event_type]}
                    </span>
                    {event.is_recurring && event.day_of_week?.length > 0 && (
                      <span>{formatDays(event.day_of_week)}</span>
                    )}
                    {event.specific_date && (
                      <span>
                        {new Date(event.specific_date).toLocaleDateString('en-IE', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>

                  {(event.start_time || event.end_time) && (
                    <p className="text-sm text-stout-300 mt-1">
                      {formatTime(event.start_time)}
                      {event.end_time && ` - ${formatTime(event.end_time)}`}
                    </p>
                  )}

                  {event.description && (
                    <p className="text-sm text-stout-400 mt-2">{event.description}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
