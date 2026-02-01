import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getUser } from '@/lib/supabase-server';
import AdminReviewsClient from './AdminReviewsClient';

export const dynamic = 'force-dynamic';

interface PendingReview {
  id: string;
  pub_id: string;
  user_id: string;
  pint_quality: number | null;
  ambience: number | null;
  food_quality: number | null;
  staff_friendliness: number | null;
  safety: number | null;
  value_for_money: number | null;
  comment: string | null;
  created_at: string;
  is_approved: boolean;
  pub: { name: string; has_food: boolean } | null;
  profile: { id: string; username: string | null; display_name: string | null; is_trusted: boolean } | null;
}

async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Failed to check admin status:', error);
    return false;
  }
  return data?.is_admin === true;
}

async function getReviews(filter: string): Promise<PendingReview[]> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from('reviews')
    .select(`
      *,
      pub:pubs!inner(name, has_food),
      profile:profiles!inner(id, username, display_name, is_trusted)
    `)
    .order('created_at', { ascending: false });

  if (filter === 'pending') {
    query = query.eq('is_approved', false);
  }

  const { data, error } = await query.limit(50);

  if (error) {
    console.error('Failed to fetch reviews:', error);
    return [];
  }

  // Transform the data to flatten the joined objects
  return (data || []).map(review => ({
    ...review,
    pub: Array.isArray(review.pub) ? review.pub[0] : review.pub,
    profile: Array.isArray(review.profile) ? review.profile[0] : review.profile,
  })) as PendingReview[];
}

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function AdminReviewsPage({ searchParams }: PageProps) {
  const user = await getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const admin = await isAdmin(user.id);
  if (!admin) {
    redirect('/');
  }

  const params = await searchParams;
  const filter = params.filter || 'pending';
  const reviews = await getReviews(filter);

  return <AdminReviewsClient initialReviews={reviews} filter={filter} />;
}
