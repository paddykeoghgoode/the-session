import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    // No code, redirect to home
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  }

  // Track cookies to set on response
  const cookiesToSet: { name: string; value: string; options: CookieOptions }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookiesToSet.push({ name, value, options });
        },
        remove(name: string, options: CookieOptions) {
          cookiesToSet.push({ name, value: '', options });
        },
      },
    }
  );

  const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/auth/login?error=oauth_failed', requestUrl.origin));
  }

  // Determine redirect destination
  let redirectPath = '/';

  if (session?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', session.user.id)
      .single();

    // If no username, redirect to profile setup
    if (!profile?.username) {
      redirectPath = '/profile/setup';
    }
  }

  // Create response with correct redirect
  const response = NextResponse.redirect(new URL(redirectPath, requestUrl.origin));

  // Apply all cookies to the response
  for (const { name, value, options } of cookiesToSet) {
    response.cookies.set({
      name,
      value,
      ...options,
    });
  }

  return response;
}
