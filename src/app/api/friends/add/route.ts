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
    const body = await request.json();
    const { friendId } = body;

    if (!friendId) {
      return NextResponse.json({ error: 'Friend ID required' }, { status: 400 });
    }

    // Check if friendship already exists
    const { data: existing } = await supabase
      .from('friend_relationships')
      .select('*')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Friend request already exists' }, { status: 400 });
    }

    // Create friend request
    const { data: friendship, error: createError } = await supabase
      .from('friend_relationships')
      .insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'pending',
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    // Award points for sending friend request (2 points)
    await supabase.from('user_points').insert({
      user_id: user.id,
      points: 2,
      action_type: 'friend_request_sent',
      description: 'Sent friend request',
    });

    return NextResponse.json({ success: true, friendship });
  } catch (error) {
    console.error('Add friend error:', error);
    return NextResponse.json(
      { error: 'Failed to send friend request' },
      { status: 500 }
    );
  }
}
