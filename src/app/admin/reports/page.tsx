import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient, getUser } from '@/lib/supabase-server';
import { formatDate } from '@/lib/utils';
import ReportActions from './ReportActions';

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

async function getReports() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });
  return data || [];
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  price_wrong: 'Price Wrong',
  deal_expired: 'Deal Expired',
  pub_closed: 'Pub Closed',
  inappropriate: 'Inappropriate',
  other: 'Other',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400',
  reviewed: 'bg-blue-500/20 text-blue-400',
  resolved: 'bg-irish-green-500/20 text-irish-green-400',
  dismissed: 'bg-stout-600 text-stout-400',
};

export default async function AdminReportsPage() {
  const user = await getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const admin = await isAdmin(user.id);
  if (!admin) {
    redirect('/');
  }

  const reports = await getReports();
  const pendingReports = reports.filter(r => r.status === 'pending');
  const otherReports = reports.filter(r => r.status !== 'pending');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/admin" className="text-irish-green-500 hover:text-irish-green-400 text-sm mb-2 inline-block">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-cream-100">Flagged Content</h1>
        <p className="text-stout-400">{pendingReports.length} pending reports</p>
      </div>

      {/* Pending Reports */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-cream-100 mb-4">Pending Review</h2>
        {pendingReports.length > 0 ? (
          <div className="bg-stout-800 rounded-lg border border-stout-700 divide-y divide-stout-700">
            {pendingReports.map((report) => (
              <div key={report.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[report.status]}`}>
                        {report.status}
                      </span>
                      <span className="text-xs bg-stout-700 text-stout-300 px-2 py-0.5 rounded">
                        {report.entity_type}
                      </span>
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                        {REPORT_TYPE_LABELS[report.report_type] || report.report_type}
                      </span>
                    </div>
                    <p className="text-sm text-stout-400 mb-1">
                      Entity ID: <code className="text-xs bg-stout-700 px-1 rounded">{report.entity_id}</code>
                    </p>
                    <p className="text-xs text-stout-500">
                      Reported {formatDate(report.created_at)}
                    </p>
                  </div>
                  <ReportActions reportId={report.id} currentStatus={report.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-stout-800 rounded-lg border border-stout-700 p-8 text-center">
            <div className="text-4xl mb-2">✓</div>
            <p className="text-cream-100 font-medium">All caught up!</p>
            <p className="text-stout-400 text-sm">No pending reports to review</p>
          </div>
        )}
      </div>

      {/* Resolved Reports */}
      {otherReports.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-cream-100 mb-4">History</h2>
          <div className="bg-stout-800 rounded-lg border border-stout-700 divide-y divide-stout-700">
            {otherReports.slice(0, 20).map((report) => (
              <div key={report.id} className="p-4 opacity-60">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[report.status]}`}>
                    {report.status}
                  </span>
                  <span className="text-xs bg-stout-700 text-stout-300 px-2 py-0.5 rounded">
                    {report.entity_type}
                  </span>
                  <span className="text-xs text-stout-400">
                    {REPORT_TYPE_LABELS[report.report_type] || report.report_type}
                  </span>
                  <span className="text-xs text-stout-500 ml-auto">
                    {formatDate(report.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
