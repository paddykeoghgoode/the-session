import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(dateString);
}

export function getGoogleMapsUrl(pub: { latitude?: number | null; longitude?: number | null; address: string }): string {
  if (pub.latitude && pub.longitude) {
    return `https://www.google.com/maps/search/?api=1&query=${pub.latitude},${pub.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pub.address + ', Dublin, Ireland')}`;
}

export function getGoogleMapsDirectionsUrl(pub: { latitude?: number | null; longitude?: number | null; address: string }): string {
  if (pub.latitude && pub.longitude) {
    return `https://www.google.com/maps/dir/?api=1&destination=${pub.latitude},${pub.longitude}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pub.address + ', Dublin, Ireland')}`;
}

export function calculateAverageRating(review: {
  pint_quality?: number | null;
  ambience?: number | null;
  food_quality?: number | null;
  staff_friendliness?: number | null;
  safety?: number | null;
  value_for_money?: number | null;
}): number {
  const ratings = [
    review.pint_quality,
    review.ambience,
    review.food_quality,
    review.staff_friendliness,
    review.safety,
    review.value_for_money,
  ].filter((r): r is number => r !== null && r !== undefined);

  if (ratings.length === 0) return 0;
  return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

// Format time from HH:MM:SS to 12-hour format (e.g., "10:30 AM")
export function formatTime(time: string | null): string {
  if (!time) return 'Closed';
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Get opening hours for a specific day
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface PubHours {
  hours_monday_open: string | null;
  hours_monday_close: string | null;
  hours_tuesday_open: string | null;
  hours_tuesday_close: string | null;
  hours_wednesday_open: string | null;
  hours_wednesday_close: string | null;
  hours_thursday_open: string | null;
  hours_thursday_close: string | null;
  hours_friday_open: string | null;
  hours_friday_close: string | null;
  hours_saturday_open: string | null;
  hours_saturday_close: string | null;
  hours_sunday_open: string | null;
  hours_sunday_close: string | null;
}

export function getDayHours(pub: PubHours, day: DayOfWeek): { open: string | null; close: string | null } {
  return {
    open: pub[`hours_${day}_open` as keyof PubHours],
    close: pub[`hours_${day}_close` as keyof PubHours],
  };
}

export function formatDayHours(pub: PubHours, day: DayOfWeek): string {
  const hours = getDayHours(pub, day);
  if (!hours.open || !hours.close) return 'Closed';
  return `${formatTime(hours.open)} - ${formatTime(hours.close)}`;
}

// Check if any hours are set for the pub
export function hasOpeningHours(pub: PubHours): boolean {
  const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  return days.some(day => {
    const hours = getDayHours(pub, day);
    return hours.open !== null && hours.close !== null;
  });
}

// Format eircode for display (already formatted typically, but ensure uppercase)
export function formatEircode(eircode: string | null): string | null {
  if (!eircode) return null;
  return eircode.toUpperCase().trim();
}

// Get Google Maps URL for eircode
export function getEircodeMapUrl(eircode: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eircode + ', Ireland')}`;
}

// Check if a pub is currently open (based on Dublin time)
export function isOpenNow(pub: PubHours & { is_permanently_closed?: boolean }): boolean {
  if (pub.is_permanently_closed) return false;

  // Get current time in Dublin
  const now = new Date();
  const dublinTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Dublin' }));
  const currentDay = dublinTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentHour = dublinTime.getHours();
  const currentMinute = dublinTime.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  // Map JS day (0=Sun) to our day names
  const dayMap: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = dayMap[currentDay];

  const hours = getDayHours(pub, today);
  if (!hours.open || !hours.close) return false;

  // Parse opening and closing times
  const [openHour, openMin] = hours.open.split(':').map(Number);
  const [closeHour, closeMin] = hours.close.split(':').map(Number);
  const openTimeMinutes = openHour * 60 + openMin;
  let closeTimeMinutes = closeHour * 60 + closeMin;

  // Handle pubs that close after midnight (e.g., closes at 01:30)
  if (closeTimeMinutes < openTimeMinutes) {
    // If current time is after midnight but before close, it's open
    if (currentTimeMinutes < closeTimeMinutes) {
      return true;
    }
    // Otherwise treat close as next day
    closeTimeMinutes += 24 * 60;
  }

  return currentTimeMinutes >= openTimeMinutes && currentTimeMinutes < closeTimeMinutes;
}
