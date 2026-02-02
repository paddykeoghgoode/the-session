'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/utils';
import { POINTS_ACTIONS } from '@/types';
import type { UserPoints, Profile } from '@/types';

interface PointsDisplayProps {
  userId: string;
  showHistory?: boolean;
  compact?: boolean;
}

export default function PointsDisplay({ userId, showHistory = false, compact = false }: PointsDisplayProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentPoints, setRecentPoints] = useState<UserPoints[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      // Get profile with points
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Get recent points history
      if (showHistory) {
        const { data: pointsData } = await supabase
          .from('user_points')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (pointsData) {
          setRecentPoints(pointsData);
        }
      }

      setLoading(false);
    }

    loadData();
  }, [userId, showHistory, supabase]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-24 bg-stout-700 rounded"></div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white px-3 py-1 rounded-full">
        <span className="text-lg">⭐</span>
        <span className="font-bold">{profile?.total_points || 0}</span>
        <span className="text-xs opacity-80">pts</span>
      </div>
    );
  }

  return (
    <div className="bg-stout-800 rounded-lg border border-stout-700 p-4">
      {/* Points summary */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-cream-100">Your Points</h3>
          <p className="text-sm text-stout-400">This month: {profile?.points_this_month || 0} pts</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-amber-500">
            {profile?.total_points || 0}
          </div>
          <p className="text-xs text-stout-400">total points</p>
        </div>
      </div>

      {/* Rank */}
      {profile?.current_rank && (
        <div className="bg-stout-700/50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-stout-300">Current Rank</span>
            <span className="text-lg font-bold text-cream-100">#{profile.current_rank}</span>
          </div>
        </div>
      )}

      {/* Recent points history */}
      {showHistory && recentPoints.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-stout-300 mb-3">Recent Activity</h4>
          <div className="space-y-2">
            {recentPoints.map((point) => {
              const actionInfo = POINTS_ACTIONS[point.action_type as keyof typeof POINTS_ACTIONS];
              return (
                <div
                  key={point.id}
                  className="flex items-center justify-between py-2 border-b border-stout-700 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{actionInfo?.icon || '⭐'}</span>
                    <div>
                      <p className="text-sm text-cream-100">{actionInfo?.label || point.action_type}</p>
                      {point.description && (
                        <p className="text-xs text-stout-400 truncate max-w-[200px]">{point.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-amber-500">+{point.points}</span>
                    <p className="text-xs text-stout-500">{formatRelativeTime(point.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Points guide */}
      <details className="mt-4">
        <summary className="text-sm text-stout-400 cursor-pointer hover:text-cream-100">
          How to earn points
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          {Object.entries(POINTS_ACTIONS).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2 p-2 bg-stout-700/30 rounded">
              <span>{value.icon}</span>
              <span className="text-stout-300">{value.label}</span>
              <span className="ml-auto text-amber-500 font-medium">+{value.points}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

// Points toast notification for when user earns points
interface PointsToastProps {
  points: number;
  action: keyof typeof POINTS_ACTIONS;
  onClose: () => void;
}

export function PointsToast({ points, action, onClose }: PointsToastProps) {
  const actionInfo = POINTS_ACTIONS[action];

  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
        <span className="text-2xl">{actionInfo?.icon || '⭐'}</span>
        <div>
          <p className="font-bold">+{points} points!</p>
          <p className="text-sm opacity-90">{actionInfo?.label || action}</p>
        </div>
        <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Leaderboard component
interface LeaderboardProps {
  limit?: number;
  period?: 'all_time' | 'this_month';
}

export function Leaderboard({ limit = 10, period = 'this_month' }: LeaderboardProps) {
  const [leaders, setLeaders] = useState<(Profile & { rank: number })[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadLeaderboard() {
      const orderBy = period === 'this_month' ? 'points_this_month' : 'total_points';

      const { data } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, total_points, points_this_month')
        .order(orderBy, { ascending: false })
        .gt(orderBy, 0)
        .limit(limit);

      if (data) {
        setLeaders(data.map((p, i) => ({ ...p, rank: i + 1 })) as (Profile & { rank: number })[]);
      }
      setLoading(false);
    }

    loadLeaderboard();
  }, [limit, period, supabase]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-stout-700 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {leaders.map((leader) => {
        const points = period === 'this_month' ? leader.points_this_month : leader.total_points;
        return (
          <div
            key={leader.id}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              leader.rank <= 3 ? 'bg-gradient-to-r from-amber-900/30 to-transparent border border-amber-700/50' : 'bg-stout-700/50'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              leader.rank === 1 ? 'bg-amber-500 text-black' :
              leader.rank === 2 ? 'bg-gray-400 text-black' :
              leader.rank === 3 ? 'bg-amber-700 text-white' :
              'bg-stout-600 text-stout-300'
            }`}>
              {leader.rank}
            </div>
            <div className="flex-1">
              <p className="text-cream-100 font-medium">
                {leader.display_name || leader.username || 'Anonymous'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-amber-500 font-bold">{points || 0}</span>
              <span className="text-xs text-stout-400 ml-1">pts</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
