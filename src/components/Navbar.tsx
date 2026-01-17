'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import SearchBar from './SearchBar';
import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Get singleton supabase client
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    const fetchAdminStatus = async (userId: string) => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('[Navbar] Profile fetch error:', error.message);
          return false;
        }
        return profile?.is_admin === true;
      } catch (err) {
        console.error('[Navbar] Profile fetch exception:', err);
        return false;
      }
    };

    const initializeAuth = async () => {
      try {
        // Get current session from localStorage
        const { data: { session }, error } = await supabase.auth.getSession();

        console.log('[Navbar] Initial session check:', {
          hasSession: !!session,
          userId: session?.user?.id,
          error: error?.message
        });

        if (!isMounted) return;

        if (session?.user) {
          setUser(session.user);
          const adminStatus = await fetchAdminStatus(session.user.id);
          if (isMounted) {
            setIsAdmin(adminStatus);
            console.log('[Navbar] Auth initialized, isAdmin:', adminStatus);
          }
        }
      } catch (err) {
        console.error('[Navbar] Auth init error:', err);
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };

    // Initialize auth state
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Navbar] Auth state change:', event);

        if (!isMounted) return;

        if (session?.user) {
          setUser(session.user);
          const adminStatus = await fetchAdminStatus(session.user.id);
          if (isMounted) {
            setIsAdmin(adminStatus);
          }
        } else {
          setUser(null);
          setIsAdmin(false);
        }
        setAuthLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    // Clear client state immediately for responsive UI
    setUser(null);
    setIsAdmin(false);

    // Clear any Supabase localStorage items
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
    }

    try {
      // Sign out on client - this clears tokens
      await supabase.auth.signOut({ scope: 'local' });
    } catch (e) {
      // Continue even if client signout fails
      console.error('Client signout error:', e);
    }

    // Navigate to server-side signout to clear cookies and redirect home
    // Use replace to prevent back button returning to authenticated state
    window.location.replace('/auth/signout');
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/nearby', label: 'Near Me' },
    { href: '/pubs', label: 'Pubs' },
    { href: '/deals', label: 'Deals' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/map', label: 'Map' },
  ];

  return (
    <div className="relative">
      {/* Main navbar - Guinness head (cream colored) */}
      <nav className="bg-cream-100 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and desktop nav */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/pint.svg"
                  alt="The Session"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-stout-900 text-xl font-title">The Session</span>
              </Link>

              {/* Desktop navigation */}
              <div className="hidden lg:ml-8 lg:flex lg:space-x-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname === link.href
                        ? 'text-stout-900 bg-cream-200'
                        : 'text-stout-700 hover:text-stout-900 hover:bg-cream-200'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Search and user section */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {/* Search bar */}
              <div className="w-48 lg:w-64">
                <SearchBar />
              </div>

              {authLoading ? (
                <div className="w-20 h-8 bg-cream-200 rounded animate-pulse"></div>
              ) : user ? (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 text-sm font-medium rounded-md transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="text-stout-700 hover:text-stout-900 px-3 py-2 text-sm font-medium"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-stout-700 hover:text-stout-900 px-3 py-2 text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-stout-700 hover:text-stout-900 px-3 py-2 text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-stout-900 hover:bg-stout-800 text-cream-100 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              {/* Mobile search trigger */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-stout-700 hover:text-stout-900 p-2"
                aria-label="Toggle menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-cream-100 border-t border-cream-200">
            {/* Mobile search */}
            <div className="px-4 py-3">
              <SearchBar />
            </div>
            <div className="px-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === link.href
                      ? 'text-stout-900 bg-cream-200'
                      : 'text-stout-700 hover:text-stout-900 hover:bg-cream-200'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-cream-300 my-2" />
              {authLoading ? (
                <div className="px-3 py-2">
                  <div className="w-24 h-6 bg-cream-200 rounded animate-pulse"></div>
                </div>
              ) : user ? (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium bg-amber-600 text-white hover:bg-amber-700"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-stout-700 hover:text-stout-900 hover:bg-cream-200"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-stout-700 hover:text-stout-900 hover:bg-cream-200"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-stout-700 hover:text-stout-900 hover:bg-cream-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium bg-stout-900 text-cream-100 hover:bg-stout-800"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Foam effect - wavy separator between head and stout */}
      <div className="relative h-6 bg-cream-100 overflow-hidden">
        {/* Multiple wave layers for foam effect */}
        <svg
          className="absolute bottom-0 w-full h-8"
          viewBox="0 0 1200 32"
          preserveAspectRatio="none"
          fill="none"
        >
          {/* Back wave - slightly darker cream */}
          <path
            d="M0,16 C150,32 350,0 600,16 C850,32 1050,0 1200,16 L1200,32 L0,32 Z"
            fill="#d4c4a8"
          />
          {/* Middle wave */}
          <path
            d="M0,20 C200,8 400,28 600,20 C800,12 1000,28 1200,20 L1200,32 L0,32 Z"
            fill="#8b7355"
          />
          {/* Front wave - stout color */}
          <path
            d="M0,24 C100,20 300,28 450,24 C600,20 750,28 900,24 C1050,20 1150,26 1200,24 L1200,32 L0,32 Z"
            fill="#1a1612"
          />
        </svg>
        {/* Bubble effects */}
        <div className="absolute bottom-2 left-[10%] w-1.5 h-1.5 bg-cream-200 rounded-full opacity-60"></div>
        <div className="absolute bottom-3 left-[25%] w-1 h-1 bg-cream-200 rounded-full opacity-40"></div>
        <div className="absolute bottom-1 left-[40%] w-2 h-2 bg-cream-200 rounded-full opacity-50"></div>
        <div className="absolute bottom-2 left-[55%] w-1 h-1 bg-cream-200 rounded-full opacity-60"></div>
        <div className="absolute bottom-3 left-[70%] w-1.5 h-1.5 bg-cream-200 rounded-full opacity-40"></div>
        <div className="absolute bottom-1 left-[85%] w-1 h-1 bg-cream-200 rounded-full opacity-50"></div>
        <div className="absolute bottom-2 left-[95%] w-1.5 h-1.5 bg-cream-200 rounded-full opacity-60"></div>
      </div>
    </div>
  );
}
