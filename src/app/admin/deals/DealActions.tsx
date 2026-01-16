'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

interface DealActionsProps {
  dealId: string;
  isExpired?: boolean;
}

export default function DealActions({ dealId, isExpired = false }: DealActionsProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleExpire = async () => {
    await supabase
      .from('prices')
      .update({ deal_end_date: new Date().toISOString() })
      .eq('id', dealId);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this deal?')) return;
    await supabase.from('prices').delete().eq('id', dealId);
    router.refresh();
  };

  return (
    <div className="flex gap-2">
      {!isExpired && (
        <button
          onClick={handleExpire}
          className="px-3 py-1.5 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors"
        >
          Expire
        </button>
      )}
      <button
        onClick={handleDelete}
        className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
      >
        Delete
      </button>
    </div>
  );
}
