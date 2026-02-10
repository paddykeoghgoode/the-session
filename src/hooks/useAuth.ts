'use client';

import { useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    const fetchAdminStatus = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();

      if (error) return false;
      return data?.is_admin === true;
    };

    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          const admin = await fetchAdminStatus(session.user.id);
          if (mounted) setIsAdmin(admin);
        }
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        const admin = await fetchAdminStatus(session.user.id);
        if (mounted) setIsAdmin(admin);
      } else {
        setUser(null);
        setIsAdmin(false);
      }

      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return {
    user,
    isAdmin,
    authLoading,
    isAuthenticated: !!user,
    supabase,
    setUser,
    setIsAdmin,
  };
}
