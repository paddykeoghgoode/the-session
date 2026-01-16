'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

interface PubLikeButtonProps {
  pubId: string;
  initialLikeCount?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function PubLikeButton({
  pubId,
  initialLikeCount = 0,
  showCount = true,
  size = 'md',
}: PubLikeButtonProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkIfLiked() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('pub_likes')
        .select('id')
        .eq('pub_id', pubId)
        .eq('user_id', user.id)
        .single();

      setIsLiked(!!data);
    }

    checkIfLiked();
  }, [pubId, supabase]);

  const handleToggleLike = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/auth/login');
      return;
    }

    setIsLoading(true);
    setIsAnimating(true);

    if (isLiked) {
      // Unlike
      const { error } = await supabase
        .from('pub_likes')
        .delete()
        .eq('pub_id', pubId)
        .eq('user_id', user.id);

      if (!error) {
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      }
    } else {
      // Like
      const { error } = await supabase
        .from('pub_likes')
        .insert({
          pub_id: pubId,
          user_id: user.id,
        });

      if (!error) {
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    }

    setIsLoading(false);
    setTimeout(() => setIsAnimating(false), 300);
    router.refresh();
  };

  const sizeClasses = {
    sm: 'p-1.5 text-sm gap-1',
    md: 'p-2 text-base gap-1.5',
    lg: 'p-3 text-lg gap-2',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={handleToggleLike}
      disabled={isLoading}
      className={`inline-flex items-center rounded-lg transition-all ${sizeClasses[size]} ${
        isLiked
          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
          : 'bg-stout-700 text-stout-400 hover:bg-stout-600 hover:text-cream-100'
      } ${isAnimating ? 'scale-110' : ''} disabled:opacity-50`}
      title={isLiked ? 'Unlike this pub' : 'Like this pub'}
    >
      <svg
        className={`${iconSizes[size]} transition-transform ${isAnimating ? 'scale-125' : ''}`}
        fill={isLiked ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={isLiked ? 0 : 2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {showCount && (
        <span className="font-medium">{likeCount}</span>
      )}
    </button>
  );
}
