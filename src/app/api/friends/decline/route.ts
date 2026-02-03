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
            // Handle error
          }
        },
      },
    }
  );

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const requestId = formData.get('requestId') as string;

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID required' }, { status: 400 });
    }

    // Verify this request is for the current user
    const { data: friendRequest, error: fetchError } = await supabase
      .from('friend_relationships')
      .select('*')
      .eq('id', requestId)
      .eq('friend_id', user.id)
      .eq('status', 'pending')
      .single();

    if (fetchError || !friendRequest) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    }

    // Delete the friend request (decline = remove it)
    const { error: deleteError } = await supabase
      .from('friend_relationships')
      .delete()
      .eq('id', requestId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.redirect(new URL('/friends', request.url), 303);
  } catch (error) {
    console.error('Decline friend error:', error);
    return NextResponse.json(
      { error: 'Failed to decline friend request' },
      { status: 500 }
    );
  }
}
