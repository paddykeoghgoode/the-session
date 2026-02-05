import {
  formatPrice,
  formatDate,
  formatRelativeTime,
  calculateAverageRating,
  slugify,
  formatTime,
  getDistanceKm,
  formatDistance,
  isOpenNow,
  cn,
} from '../utils';

describe('formatPrice', () => {
  it('should format price in EUR', () => {
    expect(formatPrice(5.5)).toBe('€5.50');
    expect(formatPrice(6)).toBe('€6.00');
    expect(formatPrice(10.99)).toBe('€10.99');
  });

  it('should handle zero', () => {
    expect(formatPrice(0)).toBe('€0.00');
  });

  it('should handle large numbers', () => {
    expect(formatPrice(1000)).toBe('€1,000.00');
  });
});

describe('formatDate', () => {
  it('should format date in Irish locale', () => {
    const date = '2024-01-15T10:00:00Z';
    const formatted = formatDate(date);
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('2024');
  });
});

describe('formatRelativeTime', () => {
  it('should return "just now" for recent times', () => {
    const now = new Date();
    const recent = new Date(now.getTime() - 30 * 1000); // 30 seconds ago
    expect(formatRelativeTime(recent.toISOString())).toBe('just now');
  });

  it('should return minutes ago', () => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinutesAgo.toISOString())).toBe('5m ago');
  });

  it('should return hours ago', () => {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoHoursAgo.toISOString())).toBe('2h ago');
  });

  it('should return days ago', () => {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeDaysAgo.toISOString())).toBe('3d ago');
  });

  it('should handle invalid dates', () => {
    expect(formatRelativeTime('invalid-date')).toBe('Unknown date');
  });
});

describe('calculateAverageRating', () => {
  it('should calculate average of all ratings', () => {
    const review = {
      pint_quality: 5,
      ambience: 4,
      food_quality: 3,
      staff_friendliness: 5,
      safety: 4,
      value_for_money: 4,
    };
    expect(calculateAverageRating(review)).toBeCloseTo(4.17, 2);
  });

  it('should exclude food rating when specified', () => {
    const review = {
      pint_quality: 5,
      ambience: 4,
      food_quality: 1, // Should be excluded
      staff_friendliness: 5,
      safety: 4,
      value_for_money: 4,
    };
    expect(calculateAverageRating(review, { excludeFood: true })).toBeCloseTo(4.4, 2);
  });

  it('should handle null ratings', () => {
    const review = {
      pint_quality: 5,
      ambience: null,
      food_quality: null,
      staff_friendliness: 4,
      safety: null,
      value_for_money: 5,
    };
    expect(calculateAverageRating(review)).toBeCloseTo(4.67, 2);
  });

  it('should return 0 for no ratings', () => {
    const review = {
      pint_quality: null,
      ambience: null,
      food_quality: null,
      staff_friendliness: null,
      safety: null,
      value_for_money: null,
    };
    expect(calculateAverageRating(review)).toBe(0);
  });
});

describe('slugify', () => {
  it('should convert text to slug', () => {
    expect(slugify('The Temple Bar')).toBe('the-temple-bar');
    expect(slugify("O'Donoghue's Pub")).toBe('odonoghues-pub');
    expect(slugify('Café en Seine')).toBe('caf-en-seine');
  });

  it('should handle multiple spaces', () => {
    expect(slugify('The  Long  Hall')).toBe('the-long-hall');
  });

  it('should handle special characters', () => {
    expect(slugify('The Brazen Head (Est. 1198)')).toBe('the-brazen-head-est-1198');
  });

  it('should return fallback for empty/special-only strings', () => {
    expect(slugify('   ')).toBe('untitled');
    expect(slugify('!!!')).toBe('untitled');
    expect(slugify('')).toBe('untitled');
  });
});

describe('formatTime', () => {
  it('should format 24h to 12h time', () => {
    expect(formatTime('10:30:00')).toBe('10:30 AM');
    expect(formatTime('14:45:00')).toBe('2:45 PM');
    expect(formatTime('00:00:00')).toBe('12:00 AM');
    expect(formatTime('12:00:00')).toBe('12:00 PM');
    expect(formatTime('23:59:00')).toBe('11:59 PM');
  });

  it('should handle null input', () => {
    expect(formatTime(null)).toBe('Closed');
  });

  it('should handle invalid time formats', () => {
    expect(formatTime('invalid')).toBe('Invalid');
    expect(formatTime('25:00:00')).toBe('Invalid');
    expect(formatTime('10:60:00')).toBe('Invalid');
  });
});

describe('getDistanceKm', () => {
  it('should calculate distance between Dublin city center and Temple Bar', () => {
    // Dublin city center: 53.3498, -6.2603
    // Temple Bar: 53.3456, -6.2672
    const distance = getDistanceKm(53.3498, -6.2603, 53.3456, -6.2672);
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(1); // Less than 1km
  });

  it('should return same location as 0 distance', () => {
    const distance = getDistanceKm(53.3498, -6.2603, 53.3498, -6.2603);
    expect(distance).toBe(0);
  });

  it('should handle invalid coordinates', () => {
    expect(getDistanceKm(NaN, -6.2603, 53.3456, -6.2672)).toBe(Infinity);
    expect(getDistanceKm(53.3498, Infinity, 53.3456, -6.2672)).toBe(Infinity);
  });

  it('should handle out-of-bound coordinates', () => {
    expect(getDistanceKm(91, -6.2603, 53.3456, -6.2672)).toBe(Infinity); // lat > 90
    expect(getDistanceKm(53.3498, 181, 53.3456, -6.2672)).toBe(Infinity); // lon > 180
  });
});

describe('formatDistance', () => {
  it('should format distances under 1km in meters', () => {
    expect(formatDistance(0.5)).toBe('500m');
    expect(formatDistance(0.123)).toBe('123m');
  });

  it('should format distances over 1km', () => {
    expect(formatDistance(1.5)).toBe('1.5km');
    expect(formatDistance(10)).toBe('10.0km');
    expect(formatDistance(2.34)).toBe('2.3km');
  });
});

describe('isOpenNow', () => {
  it('should return false for permanently closed pubs', () => {
    const pub = {
      is_permanently_closed: true,
      hours_monday_open: '10:00:00',
      hours_monday_close: '23:00:00',
      hours_tuesday_open: null,
      hours_tuesday_close: null,
      hours_wednesday_open: null,
      hours_wednesday_close: null,
      hours_thursday_open: null,
      hours_thursday_close: null,
      hours_friday_open: null,
      hours_friday_close: null,
      hours_saturday_open: null,
      hours_saturday_close: null,
      hours_sunday_open: null,
      hours_sunday_close: null,
    };
    expect(isOpenNow(pub)).toBe(false);
  });

  it('should return false when hours are not set', () => {
    const pub = {
      hours_monday_open: null,
      hours_monday_close: null,
      hours_tuesday_open: null,
      hours_tuesday_close: null,
      hours_wednesday_open: null,
      hours_wednesday_close: null,
      hours_thursday_open: null,
      hours_thursday_close: null,
      hours_friday_open: null,
      hours_friday_close: null,
      hours_saturday_open: null,
      hours_saturday_close: null,
      hours_sunday_open: null,
      hours_sunday_close: null,
    };
    expect(isOpenNow(pub)).toBe(false);
  });

  // Note: Testing current time-based logic is tricky without mocking Date
  // In a real scenario, we'd use jest.useFakeTimers() or a date mocking library
});

describe('cn (className merger)', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('should handle objects', () => {
    expect(cn('foo', { bar: true, baz: false })).toBe('foo bar');
  });
});
