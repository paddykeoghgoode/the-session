/**
 * Authentication utilities for better error handling and UX
 */

export interface AuthError {
  message: string;
  status?: number;
}

/**
 * Convert Supabase auth errors to user-friendly messages
 */
export function getUserFriendlyError(error: AuthError): string {
  const message = error.message.toLowerCase();

  if (message.includes('invalid login credentials') || message.includes('invalid password')) {
    return 'Email or password incorrect. Try again or reset your password below.';
  }

  if (message.includes('email not confirmed')) {
    return 'Please verify your email. Check your inbox for the confirmation link.';
  }

  if (message.includes('user not found') || message.includes('user does not exist')) {
    return 'No account found with this email. Want to sign up instead?';
  }

  if (message.includes('email already registered') || message.includes('user already registered')) {
    return 'An account with this email already exists. Try logging in instead.';
  }

  if (message.includes('password') && message.includes('weak')) {
    return 'Password is too weak. Use at least 8 characters with letters and numbers.';
  }

  if (message.includes('rate limit')) {
    return 'Too many attempts. Please wait a few minutes and try again.';
  }

  if (message.includes('network') || message.includes('fetch')) {
    return 'Connection error. Please check your internet and try again.';
  }

  // Default fallback
  return 'Unable to sign in. Please try again or contact support if the problem persists.';
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  error?: string;
} {
  if (password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters',
    };
  }

  if (!/[a-zA-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one letter',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one number',
    };
  }

  return { isValid: true };
}

/**
 * Get password strength score (0-4)
 */
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = [
    'text-red-500',
    'text-orange-500',
    'text-yellow-500',
    'text-blue-500',
    'text-green-500',
  ];

  return {
    score: Math.min(score, 4),
    label: labels[Math.min(score, 4)],
    color: colors[Math.min(score, 4)],
  };
}

/**
 * Store intended destination before login
 */
export function setLoginRedirect(url: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('loginRedirect', url);
  }
}

/**
 * Get and clear intended destination after login
 */
export function getLoginRedirect(): string {
  if (typeof window !== 'undefined') {
    const redirect = sessionStorage.getItem('loginRedirect') || '/';
    sessionStorage.removeItem('loginRedirect');
    return redirect;
  }
  return '/';
}
