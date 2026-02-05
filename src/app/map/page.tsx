import { createServerSupabaseClient } from '@/lib/supabase-server';
import Map from '@/components/Map';

export const revalidate = 60;

async function getPubsWithLocation() {
  const supabase = await createServerSupabaseClient();

  // Ireland bounds (approximate):
  // Latitude: 51.4 to 55.4
  // Longitude: -10.5 to -6.0
  const { data } = await supabase
    .from('pub_summaries')
    .select('*')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .gte('latitude', 51.4)
    .lte('latitude', 55.4)
    .gte('longitude', -10.5)
    .lte('longitude', -6.0);

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
