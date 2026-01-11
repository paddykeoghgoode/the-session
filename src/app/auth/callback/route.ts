import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code);

    // Check if user has a username set
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single();

      // If no username, redirect to profile setup
      if (!profile?.username) {
        return NextResponse.redirect(new URL('/profile/setup', requestUrl.origin));
      }
    }
  }

  // Redirect to home page after successful auth
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
