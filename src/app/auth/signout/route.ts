import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Handle errors
          }
        },
      },
    }
  );

  await supabase.auth.signOut();

  // Clear all Supabase auth cookies explicitly
  const allCookies = cookieStore.getAll();
  for (const cookie of allCookies) {
    if (cookie.name.startsWith('sb-')) {
      try {
        cookieStore.set({
          name: cookie.name,
          value: '',
          maxAge: 0,
          path: '/',
        });
      } catch {
        // Ignore errors
      }
    }
  }

  const requestUrl = new URL(request.url);
  const response = NextResponse.redirect(new URL('/', requestUrl.origin), {
    status: 302,
  });

  // Set cache control headers to prevent caching
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  response.headers.set('Pragma', 'no-cache');

  return response;
}

export async function GET(request: Request) {
  return POST(request);
}
