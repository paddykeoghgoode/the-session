'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  variant?: 'pub' | 'deal' | 'event' | 'review' | 'profile';
  elevation?: 'none' | 'sm' | 'md' | 'hover';
  clickable?: boolean;
  href?: string;
  className?: string;
  onClick?: () => void;
}

export default function Card({
  children,
  variant = 'pub',
  elevation = 'sm',
  clickable = false,
  href,
  className = '',
  onClick,
}: CardProps) {
  const baseClasses = 'bg-stout-800 rounded-lg overflow-hidden transition-all duration-200';

  const variantClasses = {
    pub: 'border border-stout-700',
    deal: 'border-2 border-amber-500/30 bg-gradient-to-br from-stout-800 to-amber-950/20',
    event: 'border border-irish-green-700/30 bg-gradient-to-br from-stout-800 to-irish-green-950/10',
    review: 'border border-stout-700',
    profile: 'border border-stout-700',
  };

  const elevationClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    hover: 'shadow-sm hover:shadow-xl hover:scale-[1.02]',
  };

  const clickableClasses = clickable || href || onClick
    ? 'cursor-pointer active:scale-[0.98]'
    : '';

  const classes = `${baseClasses} ${variantClasses[variant]} ${elevationClasses[elevation]} ${clickableClasses} ${className}`;

  const content = <div className={classes}>{children}</div>;

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  if (onClick) {
    return <div onClick={onClick}>{content}</div>;
  }

  return content;
}

// Card subcomponents
interface CardImageProps {
  src: string;
  alt: string;
  fallback?: string;
  aspectRatio?: 'video' | 'square' | 'portrait';
  priority?: boolean;
}

export function CardImage({ src, alt, fallback = '/pub-placeholder.jpg', aspectRatio = 'video', priority = false }: CardImageProps) {
  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
  };

  return (
    <div className={`relative ${aspectClasses[aspectRatio]} w-full bg-stout-900`}>
      <Image
        src={src || fallback}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={priority}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = fallback;
        }}
      />
    </div>
  );
}

interface CardBadgeProps {
  children: ReactNode;
  variant?: 'verified' | 'new' | 'hot' | 'featured' | 'default';
  className?: string;
}

export function CardBadge({ children, variant = 'default', className = '' }: CardBadgeProps) {
  const variantClasses = {
    verified: 'bg-irish-green-600 text-white',
    new: 'bg-blue-600 text-white',
    hot: 'bg-red-600 text-white',
    featured: 'bg-amber-500 text-stout-900',
    default: 'bg-stout-700 text-cream-100',
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-lg font-semibold text-cream-100 mb-1 ${className}`}>
      {children}
    </h3>
  );
}

interface CardSubtitleProps {
  children: ReactNode;
  className?: string;
}

export function CardSubtitle({ children, className = '' }: CardSubtitleProps) {
  return (
    <p className={`text-sm text-stout-400 ${className}`}>
      {children}
    </p>
  );
}

interface CardStatsProps {
  children: ReactNode;
  className?: string;
}

export function CardStats({ children, className = '' }: CardStatsProps) {
  return (
    <div className={`flex items-center gap-4 px-4 py-2 border-t border-stout-700 ${className}`}>
      {children}
    </div>
  );
}

interface StatProps {
  icon: string;
  value: string | number;
  label?: string;
  className?: string;
}

export function Stat({ icon, value, label, className = '' }: StatProps) {
  return (
    <div className={`flex items-center gap-1.5 text-sm ${className}`}>
      <span className="text-base">{icon}</span>
      <span className="font-medium text-cream-100">{value}</span>
      {label && <span className="text-stout-400">{label}</span>}
    </div>
  );
}

interface CardActionsProps {
  children: ReactNode;
  className?: string;
}

export function CardActions({ children, className = '' }: CardActionsProps) {
  return (
    <div className={`flex items-center gap-2 px-4 py-3 border-t border-stout-700 ${className}`}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`px-4 py-3 ${className}`}>
      {children}
    </div>
  );
}

// Export all subcomponents
export const CardComponents = {
  Image: CardImage,
  Badge: CardBadge,
  Header: CardHeader,
  Title: CardTitle,
  Subtitle: CardSubtitle,
  Stats: CardStats,
  Stat,
  Actions: CardActions,
  Content: CardContent,
};
