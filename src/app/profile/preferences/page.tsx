import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getUser } from '@/lib/supabase-server';
import PreferencesForm from './PreferencesForm';
import type { UserPreferences, Drink } from '@/types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Preferences - The Session',
  description: 'Manage your drink preferences, notifications, and location settings',
};

async function getPreferences(userId: string): Promise<UserPreferences | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Failed to fetch preferences:', error);
  }
  return data;
}

async function getDrinks(): Promise<Drink[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('drinks')
    .select('*')
    .order('name');

  if (error) {
    console.error('Failed to fetch drinks:', error);
    return [];
  }
  return data || [];
}

export default async function PreferencesPage() {
  const user = await getUser();

  if (!user) {
    redirect('/auth/login?redirect=/profile/preferences');
  }

  const [preferences, drinks] = await Promise.all([
    getPreferences(user.id),
    getDrinks(),
  ]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-cream-100 mb-6">Preferences</h1>

      <PreferencesForm
        userId={user.id}
        initialPreferences={preferences}
        drinks={drinks}
      />
    </div>
  );
}
