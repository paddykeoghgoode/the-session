'use client';

interface PriceFreshnessProps {
  lastUpdated: string | Date;
  showLabel?: boolean;
}

export default function PriceFreshness({ lastUpdated, showLabel = true }: PriceFreshnessProps) {
  const date = new Date(lastUpdated);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let text = '';
  let color = '';
  let bgColor = '';

  if (diffMins < 60) {
    text = `${diffMins}m ago`;
    color = 'text-irish-green-400';
    bgColor = 'bg-irish-green-500/10';
  } else if (diffHours < 24) {
    text = `${diffHours}h ago`;
    color = 'text-irish-green-400';
    bgColor = 'bg-irish-green-500/10';
  } else if (diffDays === 1) {
    text = 'Yesterday';
    color = 'text-irish-green-400';
    bgColor = 'bg-irish-green-500/10';
  } else if (diffDays <= 7) {
    text = `${diffDays}d ago`;
    color = 'text-irish-green-400';
    bgColor = 'bg-irish-green-500/10';
  } else if (diffDays <= 30) {
    text = `${diffDays}d ago`;
    color = 'text-amber-400';
    bgColor = 'bg-amber-500/10';
  } else if (diffDays <= 90) {
    text = `${Math.floor(diffDays / 30)}mo ago`;
    color = 'text-amber-400';
    bgColor = 'bg-amber-500/10';
  } else {
    text = `${Math.floor(diffDays / 30)}mo ago`;
    color = 'text-red-400';
    bgColor = 'bg-red-500/10';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${color} ${bgColor}`}>
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {showLabel && <span>Updated</span>}
      <span className="font-medium">{text}</span>
    </span>
  );
}
