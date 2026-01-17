import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  await supabase.auth.signOut({ scope: 'global' });

  // Clear all Supabase auth cookies explicitly
  const allCookies = cookieStore.getAll();
  for (const cookie of allCookies) {
    if (cookie.name.startsWith('sb-')) {
      cookieStore.set({
        name: cookie.name,
        value: '',
        maxAge: 0,
        path: '/',
      });
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
