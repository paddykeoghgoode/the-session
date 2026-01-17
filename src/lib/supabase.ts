import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Singleton pattern to ensure we reuse the same client instance
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        storageKey: 'sb-auth-token',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );

  return supabaseInstance;
}
