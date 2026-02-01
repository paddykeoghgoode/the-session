/**
 * Input sanitization utilities
 * Cleans user input before storing in database
 */

/**
 * Sanitize a general text input
 * Removes potentially harmful characters while preserving normal text
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return '';

  return input
    // Trim whitespace
    .trim()
    // Remove null bytes
    .replace(/\0/g, '')
    // Normalize unicode
    .normalize('NFC')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ');
}

/**
 * Sanitize a comment/review
 * Allows more characters but removes potential script injection
 */
export function sanitizeComment(input: string | null | undefined): string {
  if (!input) return '';

  return input
    .trim()
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove potential script tags (basic protection, React escapes by default)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove on* event handlers
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Normalize unicode
    .normalize('NFC')
    // Limit consecutive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Collapse multiple spaces (but preserve newlines)
    .replace(/[^\S\n]+/g, ' ');
}

/**
 * Sanitize a username
 * Only allows alphanumeric characters and underscores
 */
export function sanitizeUsername(input: string | null | undefined): string {
  if (!input) return '';

  return input
    .trim()
    .toLowerCase()
    // Only allow letters, numbers, underscores
    .replace(/[^a-z0-9_]/g, '')
    // Limit length
    .slice(0, 30);
}

/**
 * Sanitize a display name
 * Allows more characters than username but still restricted
 */
export function sanitizeDisplayName(input: string | null | undefined): string {
  if (!input) return '';

  return input
    .trim()
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Normalize unicode
    .normalize('NFC')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    // Limit length
    .slice(0, 50);
}

/**
 * Sanitize a URL
 * Validates and cleans URL input
 */
export function sanitizeUrl(input: string | null | undefined): string | null {
  if (!input) return null;

  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    // Try to parse as URL
    const url = new URL(
      trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
    );

    // Only allow http and https
    if (!['http:', 'https:'].includes(url.protocol)) {
      return null;
    }

    // Prevent javascript: and data: URLs
    if (url.href.toLowerCase().includes('javascript:') ||
        url.href.toLowerCase().includes('data:')) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

/**
 * Sanitize a price value
 * Ensures it's a valid positive number
 */
export function sanitizePrice(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined || input === '') return null;

  const num = typeof input === 'string' ? parseFloat(input) : input;

  if (isNaN(num) || !isFinite(num) || num <= 0 || num > 100) {
    return null;
  }

  // Round to 2 decimal places
  return Math.round(num * 100) / 100;
}

/**
 * Sanitize a deal description
 */
export function sanitizeDealDescription(input: string | null | undefined): string {
  if (!input) return '';

  return sanitizeText(input)
    // Remove URLs (deals shouldn't have external links)
    .replace(/https?:\/\/[^\s]+/g, '')
    // Limit length
    .slice(0, 200);
}
