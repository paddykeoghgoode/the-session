
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';

async function getFormData() {
  const supabase = await createServerSupabaseClient();
  const { data: pubs } = await supabase.from('pubs').select('id, name').order('name');
  const { data: drinks } = await supabase.from('drinks').select('id, name').order('name');

  return { pubs: pubs || [], drinks: drinks || [] };
}

export default async function AddDealPage() {
  const { pubs, drinks } = await getFormData();

  const addDeal = async (formData: FormData) => {
    'use server';

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Handle case where user is not logged in
      // This should ideally be handled with page protection
      return;
    }

    const pubId = formData.get('pub_id');
    const drinkId = formData.get('drink_id');
    const price = formData.get('price');
    const dealDescription = formData.get('deal_description');

    // Basic validation
    if (!pubId || !drinkId || !price) {
      // Handle validation error
      return;
    }

    const { error } = await supabase.from('prices').insert({
      pub_id: pubId,
      drink_id: drinkId,
      price: price,
      deal_description: dealDescription,
      submitted_by: user.id,
      is_deal: true,
    });

    if (error) {
      // Handle insert error
      console.error(error);
      return;
    }

    // Redirect to deals page
    const { headers } = await import('next/headers');
    const { redirect } = await import('next/navigation');
    redirect('/deals');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-cream-100 mb-6">Add a New Deal</h1>
      <form action={addDeal} className="space-y-6 bg-stout-800 p-6 rounded-lg border border-stout-700">
        <div>
          <label htmlFor="pub_id" className="block text-sm font-medium text-stout-300">
            Pub
          </label>
          <select
            id="pub_id"
            name="pub_id"
            required
            className="mt-1 block w-full bg-stout-900 border border-stout-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-irish-green-500 focus:border-irish-green-500 sm:text-sm text-cream-100"
          >
            <option value="">Select a pub</option>
            {pubs.map((pub) => (
              <option key={pub.id} value={pub.id}>
                {pub.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="drink_id" className="block text-sm font-medium text-stout-300">
            Drink
          </label>
          <select
            id="drink_id"
            name="drink_id"
            required
            className="mt-1 block w-full bg-stout-900 border border-stout-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-irish-green-500 focus:border-irish-green-500 sm:text-sm text-cream-100"
          >
            <option value="">Select a drink</option>
            {drinks.map((drink) => (
              <option key={drink.id} value={drink.id}>
                {drink.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-stout-300">
            Price (€)
          </label>
          <input
            type="number"
            id="price"
            name="price"
            required
            step="0.01"
            className="mt-1 block w-full bg-stout-900 border border-stout-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-irish-green-500 focus:border-irish-green-500 sm:text-sm text-cream-100"
            placeholder="5.50"
          />
        </div>

        <div>
          <label htmlFor="deal_description" className="block text-sm font-medium text-stout-300">
            Deal Description (Optional)
          </label>
          <textarea
            id="deal_description"
            name="deal_description"
            rows={3}
            className="mt-1 block w-full bg-stout-900 border border-stout-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-irish-green-500 focus:border-irish-green-500 sm:text-sm text-cream-100"
            placeholder="e.g., 'Happy hour 5-7pm, Mon-Fri'"
          ></textarea>
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-irish-green-600 hover:bg-irish-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-irish-green-500"
          >
            Submit Deal
          </button>
        </div>
      </form>
    </div>
  );
}
