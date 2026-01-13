'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  is_trusted: boolean;
  is_admin: boolean;
  is_verified_local: boolean;
  total_contributions: number;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAdminAndFetch() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin) {
        router.push('/');
        return;
      }

      setIsAdmin(true);

      // Fetch users
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      setUsers(data || []);
      setLoading(false);
    }

    checkAdminAndFetch();
  }, [supabase, router]);

  const toggleTrusted = async (userId: string, currentStatus: boolean) => {
    setActionLoading(userId);

    const { error } = await supabase
      .from('profiles')
      .update({ is_trusted: !currentStatus })
      .eq('id', userId);

    if (!error) {
      setUsers(users.map(u =>
        u.id === userId ? { ...u, is_trusted: !currentStatus } : u
      ));
    }
    setActionLoading(null);
  };

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    setActionLoading(userId);

    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: !currentStatus })
      .eq('id', userId);

    if (!error) {
      setUsers(users.map(u =>
        u.id === userId ? { ...u, is_admin: !currentStatus } : u
      ));
    }
    setActionLoading(null);
  };

  const filteredUsers = users.filter(user => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      user.username?.toLowerCase().includes(searchLower) ||
      user.display_name?.toLowerCase().includes(searchLower)
    );
  });

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-stout-400">Checking permissions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/admin" className="text-irish-green-500 hover:text-irish-green-400 text-sm mb-2 inline-block">
          &larr; Back to Admin
        </Link>
        <h1 className="text-3xl font-bold text-cream-100">User Management</h1>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full max-w-md px-4 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 placeholder-stout-400 focus:outline-none focus:border-irish-green-500"
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-irish-green-600 rounded-full"></span>
          <span className="text-stout-400">Trusted (auto-approve)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-600 rounded-full"></span>
          <span className="text-stout-400">Admin</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-stout-600 border-t-irish-green-500"></div>
        </div>
      ) : (
        <div className="bg-stout-800 rounded-lg border border-stout-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-stout-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-cream-100">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-cream-100 hidden sm:table-cell">Contributions</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-cream-100 hidden md:table-cell">Joined</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-cream-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stout-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-stout-700/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-cream-100 font-medium">
                        {user.display_name || user.username || 'Anonymous'}
                      </span>
                      {user.is_admin && (
                        <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">Admin</span>
                      )}
                      {user.is_trusted && !user.is_admin && (
                        <span className="text-xs bg-irish-green-600 text-white px-2 py-0.5 rounded-full">Trusted</span>
                      )}
                    </div>
                    {user.username && (
                      <p className="text-sm text-stout-400">@{user.username}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stout-300 hidden sm:table-cell">
                    {user.total_contributions}
                  </td>
                  <td className="px-4 py-3 text-stout-400 text-sm hidden md:table-cell">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => toggleTrusted(user.id, user.is_trusted)}
                        disabled={actionLoading === user.id}
                        className={`text-xs font-medium py-1 px-3 rounded transition-colors ${
                          user.is_trusted
                            ? 'bg-stout-600 text-stout-300 hover:bg-stout-500'
                            : 'bg-irish-green-600 text-white hover:bg-irish-green-700'
                        }`}
                      >
                        {user.is_trusted ? 'Remove Trust' : 'Trust'}
                      </button>
                      <button
                        onClick={() => toggleAdmin(user.id, user.is_admin)}
                        disabled={actionLoading === user.id}
                        className={`text-xs font-medium py-1 px-3 rounded transition-colors ${
                          user.is_admin
                            ? 'bg-stout-600 text-stout-300 hover:bg-stout-500'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
