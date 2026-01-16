import { createServerSupabaseClient, getUser } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import DealForm from '@/components/DealForm';

async function getFormData() {
  const supabase = await createServerSupabaseClient();

  const [pubsRes, drinksRes, foodRes] = await Promise.all([
    supabase.from('pubs').select('id, name').order('name'),
    supabase.from('drinks').select('id, name, category').order('name'),
    supabase.from('food_items').select('id, name').order('name'),
  ]);

  return {
    pubs: pubsRes.data || [],
    drinks: drinksRes.data || [],
    foodItems: foodRes.data || [],
  };
}

export default async function AddDealPage() {
  const user = await getUser();

  if (!user) {
    redirect('/auth/login?redirect=/deals/add');
  }

  const { pubs, drinks, foodItems } = await getFormData();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cream-100 mb-2">Add a New Deal</h1>
        <p className="text-stout-400">
          Share deals you&apos;ve found - help others find great value!
        </p>
      </div>

      <div className="bg-stout-800 p-6 rounded-lg border border-stout-700">
        <DealForm pubs={pubs} drinks={drinks} foodItems={foodItems} />
      </div>
    </div>
  );
}
