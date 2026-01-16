'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

interface ReportActionsProps {
  reportId: string;
  currentStatus: string;
}

export default function ReportActions({ reportId, currentStatus }: ReportActionsProps) {
  const router = useRouter();
  const supabase = createClient();

  const updateStatus = async (status: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase
      .from('reports')
      .update({
        status,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', reportId);

    router.refresh();
  };

  if (currentStatus !== 'pending') {
    return null;
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => updateStatus('resolved')}
        className="px-3 py-1.5 text-sm bg-irish-green-600 hover:bg-irish-green-700 text-white rounded transition-colors"
      >
        Resolve
      </button>
      <button
        onClick={() => updateStatus('dismissed')}
        className="px-3 py-1.5 text-sm bg-stout-600 hover:bg-stout-500 text-cream-100 rounded transition-colors"
      >
        Dismiss
      </button>
    </div>
  );
}
