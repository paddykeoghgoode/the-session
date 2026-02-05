'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { getUserFriendlyError, isValidEmail } from '@/lib/auth-utils';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validate email
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setSuccessMessage(
        'Password reset link sent! Check your email for instructions.'
      );
      setEmail(''); // Clear form
    } catch (err: any) {
      setError(getUserFriendlyError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold text-cream-100">Forgot Password?</h1>
          <p className="mt-2 text-stout-400">
            No worries! Enter your email and we'll send you a reset link.
          </p>
        </div>

        <div className="bg-stout-800 rounded-lg border border-stout-700 p-8">
          {successMessage ? (
            <div className="text-center">
              <div className="mb-4 bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="text-left">
                    <p className="font-medium">Check your email!</p>
                    <p className="text-sm mt-1">{successMessage}</p>
                  </div>
                </div>
              </div>

              <div className="bg-stout-900 border border-stout-700 rounded-lg p-4 mb-6">
                <p className="text-sm text-stout-300">
                  <strong className="text-cream-100">Didn't receive the email?</strong>
                  <br />
                  Check your spam folder or try again in a few minutes.
                </p>
              </div>

              <button
                onClick={() => {
                  setSuccessMessage(null);
                  setError(null);
                }}
                className="text-irish-green-500 hover:text-irish-green-400 font-medium transition-colors"
              >
                Try another email
              </button>

              <p className="mt-6 text-center text-sm text-stout-400">
                Remember your password?{' '}
                <Link href="/auth/login" className="text-irish-green-500 hover:text-irish-green-400 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-cream-100 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    inputMode="email"
                    disabled={isLoading}
                    autoFocus
                    className="w-full px-4 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 placeholder-stout-400 focus:outline-none focus:border-irish-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-irish-green-600 hover:bg-irish-green-700 disabled:bg-stout-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending reset link...</span>
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-stout-400">
                Remember your password?{' '}
                <Link href="/auth/login" className="text-irish-green-500 hover:text-irish-green-400 font-medium">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-stout-400 hover:text-cream-100 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
