'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function ProfileSetupPage() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check if user already has a username
    async function checkProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, display_name')
        .eq('id', user.id)
        .single();

      if (profile?.username) {
        // Already has username, redirect to profile
        router.push('/profile');
        return;
      }

      // Pre-fill display name from Google if available
      if (user.user_metadata?.full_name) {
        setDisplayName(user.user_metadata.full_name);
      }

      setIsLoading(false);
    }

    checkProfile();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUsername = username.trim().toLowerCase();

    // Validate username
    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (trimmedUsername.length > 20) {
      setError('Username must be 20 characters or less');
      return;
    }

    if (!/^[a-z0-9_]+$/.test(trimmedUsername)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not logged in');
        return;
      }

      // Check if username is taken
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', trimmedUsername)
        .neq('id', user.id)
        .single();

      if (existing) {
        setError('Username is already taken');
        setIsSubmitting(false);
        return;
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: trimmedUsername,
          display_name: displayName.trim() || null,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Redirect to home
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-stout-600 border-t-irish-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-stout-800 rounded-lg border border-stout-700 p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🍺</div>
          <h1 className="text-2xl font-bold text-cream-100 mb-2">Welcome to The Session!</h1>
          <p className="text-stout-400">
            Choose a username to complete your profile
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-cream-100 mb-2">
              Username <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stout-400">@</span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="yourname"
                maxLength={20}
                className="w-full pl-10 pr-4 py-3 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 placeholder-stout-500 focus:outline-none focus:border-irish-green-500"
                autoFocus
              />
            </div>
            <p className="mt-1 text-xs text-stout-500">
              3-20 characters, letters, numbers, and underscores only
            </p>
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-cream-100 mb-2">
              Display Name <span className="text-stout-500">(optional)</span>
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              maxLength={50}
              className="w-full px-4 py-3 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 placeholder-stout-500 focus:outline-none focus:border-irish-green-500"
            />
            <p className="mt-1 text-xs text-stout-500">
              This is how your name will appear on reviews
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || username.length < 3}
            className="w-full bg-irish-green-600 hover:bg-irish-green-700 disabled:bg-stout-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}
