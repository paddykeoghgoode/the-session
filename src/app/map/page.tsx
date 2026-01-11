import { createServerSupabaseClient } from '@/lib/supabase-server';
import Map from '@/components/Map';

export const revalidate = 60;

async function getPubsWithLocation() {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('pub_summaries')
    .select('*')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  return data || [];
}

export default async function MapPage() {
  const pubs = await getPubsWithLocation();

  return (
    <div className="h-[calc(100vh-4rem)]">
      <Map pubs={pubs} />
    </div>
  );
}
