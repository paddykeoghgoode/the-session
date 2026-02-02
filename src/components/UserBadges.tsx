'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/utils';
import { BADGE_ICONS } from '@/types';
import type { UserBadge, BadgeType } from '@/types';

interface UserBadgesProps {
  userId: string;
  showAll?: boolean;
  compact?: boolean;
}

export default function UserBadges({ userId, showAll = false, compact = false }: UserBadgesProps) {
  const [badges, setBadges] = useState<(UserBadge & { badge_info?: BadgeType })[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadBadges() {
      // Get user's badges with badge type info
      const { data } = await supabase
        .from('user_badges')
        .select(`
          *,
          pub:pubs(name, slug)
        `)
        .eq('user_id', userId)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('earned_at', { ascending: false });

      if (data) {
        // Get badge type info
        const { data: badgeTypes } = await supabase
          .from('badge_types')
          .select('*');

        const badgesWithInfo = data.map((badge: UserBadge) => ({
          ...badge,
          badge_info: badgeTypes?.find((bt: BadgeType) => bt.name === badge.badge_type),
        }));

        setBadges(badgesWithInfo);
      }
      setLoading(false);
    }

    loadBadges();
  }, [userId, supabase]);

  if (loading) {
    return (
      <div className="flex gap-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-8 h-8 bg-stout-700 rounded-full animate-pulse" />
        ))}
      </div>
    );
  }

  if (badges.length === 0) {
    return null;
  }

  const displayBadges = showAll ? badges : badges.slice(0, 5);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {displayBadges.map((badge) => (
          <span
            key={badge.id}
            className="inline-flex items-center justify-center w-6 h-6 bg-stout-700 rounded-full text-sm"
            title={badge.badge_info?.display_name || badge.badge_type}
          >
            {BADGE_ICONS[badge.badge_type] || '🏅'}
          </span>
        ))}
        {!showAll && badges.length > 5 && (
          <span className="text-xs text-stout-400 ml-1">+{badges.length - 5}</span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayBadges.map((badge) => (
        <div
          key={badge.id}
          className="flex items-center gap-3 bg-stout-700/50 rounded-lg p-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-xl">
            {BADGE_ICONS[badge.badge_type] || '🏅'}
          </div>
          <div className="flex-1">
            <p className="text-cream-100 font-medium">
              {badge.badge_info?.display_name || badge.badge_type}
            </p>
            <p className="text-sm text-stout-400">
              {badge.badge_info?.description}
              {badge.pub && (
                <span className="text-irish-green-500 ml-1">@ {badge.pub.name}</span>
              )}
            </p>
          </div>
          {badge.expires_at && (
            <span className="text-xs text-stout-500">
              Expires {formatRelativeTime(badge.expires_at)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// Badge card for profile pages
interface BadgeCardProps {
  badge: UserBadge & { badge_info?: BadgeType };
}

export function BadgeCard({ badge }: BadgeCardProps) {
  const isExpiring = badge.expires_at && new Date(badge.expires_at).getTime() - Date.now() < 24 * 60 * 60 * 1000;

  return (
    <div className={`relative bg-stout-700/50 rounded-lg p-4 text-center ${isExpiring ? 'ring-2 ring-amber-500' : ''}`}>
      {isExpiring && (
        <span className="absolute top-2 right-2 text-xs text-amber-500">Expiring soon!</span>
      )}
      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-3xl mb-2">
        {BADGE_ICONS[badge.badge_type] || '🏅'}
      </div>
      <h4 className="text-cream-100 font-medium">
        {badge.badge_info?.display_name || badge.badge_type}
      </h4>
      <p className="text-sm text-stout-400 mt-1">
        {badge.badge_info?.description}
      </p>
      {badge.badge_level > 1 && (
        <span className="inline-block mt-2 text-xs bg-irish-green-600 text-white px-2 py-0.5 rounded-full">
          Level {badge.badge_level}
        </span>
      )}
    </div>
  );
}

// Verified this week badge indicator
interface VerifiedBadgeProps {
  userId: string;
}

export function VerifiedThisWeekBadge({ userId }: VerifiedBadgeProps) {
  const [hasVerified, setHasVerified] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function checkBadge() {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const { data } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_type', 'verified_this_week')
        .gt('expires_at', new Date().toISOString())
        .single();

      setHasVerified(!!data);
    }

    checkBadge();
  }, [userId, supabase]);

  if (!hasVerified) return null;

  return (
    <span
      className="inline-flex items-center gap-1 text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded-full"
      title="Verified a price this week"
    >
      <span>{BADGE_ICONS.verified_this_week}</span>
      Verified
    </span>
  );
}

// Local Expert badge indicator
interface LocalExpertBadgeProps {
  userId: string;
  pubId: string;
}

export function LocalExpertBadge({ userId, pubId }: LocalExpertBadgeProps) {
  const [isExpert, setIsExpert] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function checkBadge() {
      const { data } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_type', 'local_expert')
        .eq('pub_id', pubId)
        .single();

      setIsExpert(!!data);
    }

    checkBadge();
  }, [userId, pubId, supabase]);

  if (!isExpert) return null;

  return (
    <span
      className="inline-flex items-center gap-1 text-xs bg-amber-900/50 text-amber-400 px-2 py-0.5 rounded-full"
      title="Local Expert - 10+ contributions at this pub"
    >
      <span>{BADGE_ICONS.local_expert}</span>
      Local Expert
    </span>
  );
}
