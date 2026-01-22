import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

type ResponseCookieOptions = Parameters<
  ReturnType<typeof NextResponse.json>['cookies']['set']
>[2];

type LoginPayload = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const payload = (await request.json().catch(() => ({}))) as LoginPayload;
  const { email, password } = payload;
  const responseCookies: Array<{ name: string; value: string; options: ResponseCookieOptions }> = [];

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required.' },
      { status: 400 }
    );
  }

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
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
              responseCookies.push({ name, value, options });
            });
          } catch {
            // Ignore cookie set errors in non-mutable contexts.
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  const response = NextResponse.json({ user: data.user });
  responseCookies.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options)
  );
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
