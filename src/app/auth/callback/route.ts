import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const errorParam = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle OAuth errors from provider
  if (errorParam) {
    console.error('OAuth provider error:', errorParam, errorDescription);
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(errorDescription || errorParam)}`, requestUrl.origin)
    );
  }

  if (!code) {
    // No code, redirect to home
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  }

  let response = NextResponse.redirect(new URL('/', requestUrl.origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.redirect(new URL('/', requestUrl.origin));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('OAuth callback error:', error.message);
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
    );
  }

  if (!session) {
    console.error('OAuth callback: No session returned');
    return NextResponse.redirect(new URL('/auth/login?error=no_session', requestUrl.origin));
  }

  // Determine redirect destination
  let redirectPath = '/';

  // Check if profile exists and has username
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', session.user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    // PGRST116 = no rows returned, which is fine (new user)
    console.error('Profile fetch error:', profileError.message);
  }

  // If no profile or no username, redirect to profile setup
  if (!profile || !profile.username) {
    redirectPath = '/profile/setup';
  }

  // Update response with correct redirect path
  if (redirectPath !== '/') {
    response = NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
    // Re-apply cookies to new response
    request.cookies.getAll().forEach(cookie => {
      if (cookie.name.startsWith('sb-')) {
        response.cookies.set(cookie.name, cookie.value);
      }
    });
  }

  return response;
}
