'use client';

import { useState, useEffect } from 'react';
import type { Pub } from '@/types';

interface OpenStatusProps {
  pub: Pub;
  showHours?: boolean;
}

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

const DAYS: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [h, m] = timeStr.split(':').map(Number);
  return { hours: h, minutes: m };
}

function getMinutesSinceMidnight(hours: number, minutes: number): number {
  return hours * 60 + minutes;
}

function formatTimeDisplay(timeStr: string): string {
  const { hours, minutes } = parseTime(timeStr);
  const ampm = hours >= 12 ? 'pm' : 'am';
  const displayHours = hours % 12 || 12;
  return minutes === 0 ? `${displayHours}${ampm}` : `${displayHours}:${minutes.toString().padStart(2, '0')}${ampm}`;
}

export default function OpenStatus({ pub, showHours = true }: OpenStatusProps) {
  const [status, setStatus] = useState<'open' | 'closing_soon' | 'closed' | 'unknown'>('unknown');
  const [statusText, setStatusText] = useState('');
  const [todayHours, setTodayHours] = useState('');

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const dayIndex = now.getDay();
      const today = DAYS[dayIndex];
      const currentMinutes = getMinutesSinceMidnight(now.getHours(), now.getMinutes());

      const openKey = `hours_${today}_open` as keyof Pub;
      const closeKey = `hours_${today}_close` as keyof Pub;
      const openTime = pub[openKey] as string | null;
      const closeTime = pub[closeKey] as string | null;

      if (!openTime || !closeTime) {
        setStatus('unknown');
        setStatusText('Hours unknown');
        setTodayHours('');
        return;
      }

      const open = parseTime(openTime);
      const close = parseTime(closeTime);
      const openMinutes = getMinutesSinceMidnight(open.hours, open.minutes);
      let closeMinutes = getMinutesSinceMidnight(close.hours, close.minutes);

      // Handle closing after midnight
      if (closeMinutes < openMinutes) {
        closeMinutes += 24 * 60;
      }

      // Adjust current time if past midnight but within opening hours
      let adjustedCurrentMinutes = currentMinutes;
      if (currentMinutes < openMinutes && closeMinutes > 24 * 60) {
        adjustedCurrentMinutes = currentMinutes + 24 * 60;
      }

      setTodayHours(`${formatTimeDisplay(openTime)} - ${formatTimeDisplay(closeTime)}`);

      if (adjustedCurrentMinutes < openMinutes) {
        // Before opening
        const opensIn = openMinutes - currentMinutes;
        if (opensIn <= 60) {
          setStatus('closed');
          setStatusText(`Opens in ${opensIn}min`);
        } else {
          setStatus('closed');
          setStatusText(`Opens at ${formatTimeDisplay(openTime)}`);
        }
      } else if (adjustedCurrentMinutes >= openMinutes && adjustedCurrentMinutes < closeMinutes) {
        // Currently open
        const closesIn = closeMinutes - adjustedCurrentMinutes;
        if (closesIn <= 60) {
          setStatus('closing_soon');
          setStatusText(`Closes in ${closesIn}min`);
        } else {
          setStatus('open');
          setStatusText(`Open until ${formatTimeDisplay(closeTime)}`);
        }
      } else {
        // After closing
        setStatus('closed');
        setStatusText('Closed');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [pub]);

  const getStatusColor = () => {
    switch (status) {
      case 'open':
        return 'bg-irish-green-500';
      case 'closing_soon':
        return 'bg-amber-500';
      case 'closed':
        return 'bg-red-500';
      default:
        return 'bg-stout-500';
    }
  };

  const getTextColor = () => {
    switch (status) {
      case 'open':
        return 'text-irish-green-400';
      case 'closing_soon':
        return 'text-amber-400';
      case 'closed':
        return 'text-red-400';
      default:
        return 'text-stout-400';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`} />
      <span className={`text-sm font-medium ${getTextColor()}`}>
        {status === 'open' ? 'Open' : status === 'closing_soon' ? 'Closing Soon' : status === 'closed' ? 'Closed' : 'Unknown'}
      </span>
      {showHours && statusText && status !== 'unknown' && (
        <span className="text-sm text-stout-400">
          &middot; {statusText}
        </span>
      )}
    </div>
  );
}
