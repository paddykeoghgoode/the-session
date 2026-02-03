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
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
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

    // Accept the friend request
    const { error: updateError } = await supabase
      .from('friend_relationships')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) {
      throw updateError;
    }

    // Award points to both users (10 points each for making a friend!)
    await Promise.all([
      supabase.from('user_points').insert({
        user_id: user.id,
        points: 10,
        action_type: 'friend_accepted',
        description: 'Accepted friend request',
      }),
      supabase.from('user_points').insert({
        user_id: friendRequest.user_id,
        points: 10,
        action_type: 'friend_accepted',
        description: 'Friend request was accepted',
      }),
    ]);

    // Update profiles total_contributions
    await Promise.all([
      supabase.rpc('increment_user_points', { user_id: user.id, points: 10 }),
      supabase.rpc('increment_user_points', { user_id: friendRequest.user_id, points: 10 }),
    ]);

    return NextResponse.redirect(new URL('/friends', request.url), 303);
  } catch (error) {
    console.error('Accept friend error:', error);
    return NextResponse.json(
      { error: 'Failed to accept friend request' },
      { status: 500 }
    );
  }
}
