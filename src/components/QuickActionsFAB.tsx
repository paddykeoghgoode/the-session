'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface QuickAction {
  icon: string;
  label: string;
  href?: string;
  onClick?: () => void;
  color: 'green' | 'blue' | 'purple' | 'amber';
}

export default function QuickActionsFAB() {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Don't show on certain pages
  const hiddenPaths = ['/prices/add', '/deals/add', '/reviews/add', '/photos/add', '/auth/login', '/auth/register'];
  if (hiddenPaths.some(path => pathname?.startsWith(path))) {
    return null;
  }

  const colorClasses = {
    green: 'bg-irish-green-600 hover:bg-irish-green-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    amber: 'bg-amber-600 hover:bg-amber-700',
  };

  const actions: QuickAction[] = [
    {
      icon: '💰',
      label: 'Submit Price',
      href: '/prices/add',
      color: 'green'
    },
    {
      icon: '✍️',
      label: 'Write Review',
      href: '/pubs', // Will redirect to pub selection
      color: 'blue'
    },
    {
      icon: '📸',
      label: 'Upload Photo',
      href: '/pubs', // Will redirect to pub selection
      color: 'purple'
    },
    {
      icon: '🏷️',
      label: 'Add Deal',
      href: '/deals/add',
      color: 'amber'
    },
  ];

  const handleActionClick = (action: QuickAction) => {
    setExpanded(false);
    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      router.push(action.href);
    }
  };

  return (
    <>
      {/* Overlay */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/30 z-40 animate-fade-in"
          onClick={() => setExpanded(false)}
        />
      )}

      <div className="fixed bottom-20 right-6 md:bottom-6 z-50">
        {/* Expanded actions */}
        {expanded && (
          <div className="flex flex-col gap-3 mb-3">
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={() => handleActionClick(action)}
                className={`flex items-center gap-3 ${colorClasses[action.color]} text-white px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 animate-slide-up`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className="text-xl">{action.icon}</span>
                <span className="font-medium whitespace-nowrap text-sm">{action.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`w-14 h-14 bg-irish-green-600 hover:bg-irish-green-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all ${
            expanded ? 'rotate-45 scale-110' : 'hover:scale-110'
          } active:scale-95 group`}
          aria-label={expanded ? 'Close quick actions' : 'Open quick actions'}
          aria-expanded={expanded}
        >
          {/* Plus icon */}
          <svg
            className="w-7 h-7 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>

          {/* Pulse ring (only when closed) */}
          {!expanded && (
            <span className="absolute inset-0 rounded-full bg-irish-green-600 animate-pulse-ring" />
          )}
        </button>
      </div>
    </>
  );
}
