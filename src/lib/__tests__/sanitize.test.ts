import {
  sanitizeText,
  sanitizeComment,
  sanitizeUsername,
  sanitizeDisplayName,
  sanitizeUrl,
  sanitizePrice,
  sanitizeDealDescription,
} from '../sanitize';

describe('sanitizeText', () => {
  it('should trim whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
  });

  it('should remove null bytes', () => {
    expect(sanitizeText('hello\0world')).toBe('hello world');
  });

  it('should collapse multiple spaces', () => {
    expect(sanitizeText('hello    world')).toBe('hello world');
  });

  it('should handle null and undefined', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
  });

  it('should normalize unicode', () => {
    const input = 'café'; // é can be represented as single char or e + combining accent
    const result = sanitizeText(input);
    expect(result).toBe('café');
  });
});

describe('sanitizeComment', () => {
  it('should remove script tags', () => {
    const malicious = 'Great pub <script>alert("xss")</script> highly recommend';
    expect(sanitizeComment(malicious)).toBe('Great pub  highly recommend');
  });

  it('should remove event handlers', () => {
    const malicious = 'Great pub <div onclick="alert()">click me</div>';
    expect(sanitizeComment(malicious)).not.toContain('onclick');
  });

  it('should limit consecutive newlines', () => {
    const text = 'Line 1\n\n\n\n\nLine 2';
    expect(sanitizeComment(text)).toBe('Line 1\n\nLine 2');
  });

  it('should preserve single newlines', () => {
    const text = 'Line 1\nLine 2\nLine 3';
    expect(sanitizeComment(text)).toBe('Line 1\nLine 2\nLine 3');
  });

  it('should collapse spaces but preserve newlines', () => {
    const text = 'Hello    world\nNext    line';
    expect(sanitizeComment(text)).toBe('Hello world\nNext line');
  });
});

describe('sanitizeUsername', () => {
  it('should convert to lowercase', () => {
    expect(sanitizeUsername('JohnDoe')).toBe('johndoe');
  });

  it('should remove special characters', () => {
    expect(sanitizeUsername('john.doe@email')).toBe('johndoeemail');
  });

  it('should allow underscores', () => {
    expect(sanitizeUsername('john_doe')).toBe('john_doe');
  });

  it('should limit length to 30 chars', () => {
    const longUsername = 'a'.repeat(50);
    expect(sanitizeUsername(longUsername)).toHaveLength(30);
  });

  it('should handle null and undefined', () => {
    expect(sanitizeUsername(null)).toBe('');
    expect(sanitizeUsername(undefined)).toBe('');
  });
});

describe('sanitizeDisplayName', () => {
  it('should preserve spaces', () => {
    expect(sanitizeDisplayName('John Doe')).toBe('John Doe');
  });

  it('should remove control characters', () => {
    expect(sanitizeDisplayName('John\x00Doe')).toBe('JohnDoe');
  });

  it('should collapse multiple spaces', () => {
    expect(sanitizeDisplayName('John    Doe')).toBe('John Doe');
  });

  it('should limit length to 50 chars', () => {
    const longName = 'a'.repeat(100);
    expect(sanitizeDisplayName(longName)).toHaveLength(50);
  });

  it('should preserve unicode characters', () => {
    expect(sanitizeDisplayName('José García')).toBe('José García');
    expect(sanitizeDisplayName('Siobhán O\'Brien')).toBe('Siobhán O\'Brien');
  });
});

describe('sanitizeUrl', () => {
  it('should accept valid HTTP URLs', () => {
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com/');
  });

  it('should accept valid HTTPS URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
  });

  it('should prepend https to URLs without protocol', () => {
    expect(sanitizeUrl('example.com')).toBe('https://example.com/');
  });

  it('should reject javascript: URLs', () => {
    expect(sanitizeUrl('javascript:alert("xss")')).toBeNull();
  });

  it('should reject data: URLs', () => {
    expect(sanitizeUrl('data:text/html,<script>alert("xss")</script>')).toBeNull();
  });

  it('should handle null and undefined', () => {
    expect(sanitizeUrl(null)).toBeNull();
    expect(sanitizeUrl(undefined)).toBeNull();
    expect(sanitizeUrl('')).toBeNull();
  });

  it('should handle invalid URLs', () => {
    expect(sanitizeUrl('not a url')).toBeNull();
  });

  it('should accept social media URLs', () => {
    expect(sanitizeUrl('https://facebook.com/thesession')).toContain('facebook.com');
    expect(sanitizeUrl('https://instagram.com/thesession')).toContain('instagram.com');
  });
});

describe('sanitizePrice', () => {
  it('should accept valid prices', () => {
    expect(sanitizePrice(5.5)).toBe(5.5);
    expect(sanitizePrice('6.75')).toBe(6.75);
    expect(sanitizePrice(10)).toBe(10);
  });

  it('should round to 2 decimal places', () => {
    expect(sanitizePrice(5.999)).toBe(6.0);
    expect(sanitizePrice(5.123)).toBe(5.12);
  });

  it('should reject negative prices', () => {
    expect(sanitizePrice(-5)).toBeNull();
  });

  it('should reject zero', () => {
    expect(sanitizePrice(0)).toBeNull();
  });

  it('should reject prices over 100', () => {
    expect(sanitizePrice(101)).toBeNull();
  });

  it('should reject NaN', () => {
    expect(sanitizePrice(NaN)).toBeNull();
  });

  it('should reject Infinity', () => {
    expect(sanitizePrice(Infinity)).toBeNull();
  });

  it('should handle null and undefined', () => {
    expect(sanitizePrice(null)).toBeNull();
    expect(sanitizePrice(undefined)).toBeNull();
    expect(sanitizePrice('')).toBeNull();
  });

  it('should parse string prices', () => {
    expect(sanitizePrice('5.50')).toBe(5.5);
    expect(sanitizePrice('10')).toBe(10);
  });

  it('should reject non-numeric strings', () => {
    expect(sanitizePrice('abc')).toBeNull();
    expect(sanitizePrice('5.50€')).toBeNull();
  });
});

describe('sanitizeDealDescription', () => {
  it('should remove URLs', () => {
    const text = 'Great deal! Visit http://example.com for more';
    expect(sanitizeDealDescription(text)).not.toContain('http://');
  });

  it('should limit length to 200 chars', () => {
    const longText = 'a'.repeat(300);
    expect(sanitizeDealDescription(longText)).toHaveLength(200);
  });

  it('should trim and clean text', () => {
    expect(sanitizeDealDescription('  Great deal!  ')).toBe('Great deal!');
  });

  it('should handle null and undefined', () => {
    expect(sanitizeDealDescription(null)).toBe('');
    expect(sanitizeDealDescription(undefined)).toBe('');
  });
});
