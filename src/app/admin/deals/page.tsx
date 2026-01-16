import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient, getUser } from '@/lib/supabase-server';
import { formatPrice, formatDate } from '@/lib/utils';
import DealActions from './DealActions';
import AdminDealCreator from './AdminDealCreator';

export const dynamic = 'force-dynamic';

async function isAdmin(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();
  return data?.is_admin === true;
}

async function getDeals() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('prices')
    .select(`
      *,
      drink:drinks(*),
      pub:pubs(id, name, slug)
    `)
    .eq('is_deal', true)
    .order('created_at', { ascending: false });
  return data || [];
}

async function getPubs() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('pubs')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name');
  return data || [];
}

async function getDrinks() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('drinks')
    .select('*')
    .order('name');
  return data || [];
}

export default async function AdminDealsPage() {
  const user = await getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const admin = await isAdmin(user.id);
  if (!admin) {
    redirect('/');
  }

  const [deals, pubs, drinks] = await Promise.all([
    getDeals(),
    getPubs(),
    getDrinks(),
  ]);

  const isExpired = (deal: { deal_end_date?: string | null }) => {
    if (!deal.deal_end_date) return false;
    return new Date(deal.deal_end_date) < new Date();
  };

  const activeDeals = deals.filter(d => !isExpired(d));
  const expiredDeals = deals.filter(d => isExpired(d));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-irish-green-500 hover:text-irish-green-400 text-sm mb-2 inline-block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-cream-100">Manage Deals</h1>
          <p className="text-stout-400">{activeDeals.length} active, {expiredDeals.length} expired</p>
        </div>
      </div>

      {/* Create New Deal */}
      <div className="mb-8">
        <AdminDealCreator pubs={pubs} drinks={drinks} />
      </div>

      {/* Active Deals */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-cream-100 mb-4">Active Deals</h2>
        {activeDeals.length > 0 ? (
          <div className="bg-stout-800 rounded-lg border border-stout-700 divide-y divide-stout-700">
            {activeDeals.map((deal) => (
              <div key={deal.id} className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/pubs/${deal.pub?.slug}`}
                      className="font-medium text-cream-100 hover:text-irish-green-500"
                    >
                      {deal.pub?.name}
                    </Link>
                    <span className="text-lg font-bold text-amber-500">{formatPrice(deal.price)}</span>
                  </div>
                  <p className="text-sm text-stout-400">
                    {deal.deal_title && <span className="text-cream-100">{deal.deal_title} - </span>}
                    {deal.deal_type === 'food_combo' && deal.food_item
                      ? `${deal.food_item} + ${deal.drink?.name}`
                      : deal.deal_type === 'food_only'
                      ? deal.food_item
                      : deal.drink?.name}
                  </p>
                  {deal.deal_schedule && (
                    <p className="text-xs text-amber-400 mt-1">{deal.deal_schedule}</p>
                  )}
                  <p className="text-xs text-stout-500 mt-1">Added {formatDate(deal.created_at)}</p>
                </div>
                <DealActions dealId={deal.id} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-stout-400 text-center py-8 bg-stout-800 rounded-lg border border-stout-700">
            No active deals
          </p>
        )}
      </div>

      {/* Expired Deals */}
      {expiredDeals.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-cream-100 mb-4">Expired Deals</h2>
          <div className="bg-stout-800 rounded-lg border border-stout-700 divide-y divide-stout-700 opacity-60">
            {expiredDeals.map((deal) => (
              <div key={deal.id} className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/pubs/${deal.pub?.slug}`}
                      className="font-medium text-cream-100 hover:text-irish-green-500"
                    >
                      {deal.pub?.name}
                    </Link>
                    <span className="text-lg font-bold text-stout-400">{formatPrice(deal.price)}</span>
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">Expired</span>
                  </div>
                  <p className="text-sm text-stout-400">
                    {deal.deal_title && <span>{deal.deal_title} - </span>}
                    {deal.drink?.name || deal.food_item}
                  </p>
                </div>
                <DealActions dealId={deal.id} isExpired />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
