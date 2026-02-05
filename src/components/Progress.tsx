'use client';

import { ReactNode } from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'green' | 'amber' | 'blue';
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  size = 'md',
  color = 'green',
  showLabel = false,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorClasses = {
    green: 'bg-irish-green-600',
    amber: 'bg-amber-500',
    blue: 'bg-blue-600',
  };

  return (
    <div className={className}>
      <div className={`w-full bg-stout-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-stout-400 mt-1">
          {Math.round(percentage)}% complete
        </p>
      )}
    </div>
  );
}

interface ProgressCardProps {
  title: string;
  description?: string;
  value: number;
  max: number;
  children?: ReactNode;
  className?: string;
}

export function ProgressCard({
  title,
  description,
  value,
  max,
  children,
  className = '',
}: ProgressCardProps) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className={`bg-stout-800 border border-stout-700 rounded-lg p-4 animate-fade-in ${className}`}>
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-cream-100 mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-stout-400">
            {description}
          </p>
        )}
      </div>

      <ProgressBar value={value} max={max} />

      <p className="text-sm text-stout-400 mt-2">
        {percentage}% complete • {value} of {max} steps done
      </p>

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

interface ChecklistProps {
  children: ReactNode;
  className?: string;
}

export function Checklist({ children, className = '' }: ChecklistProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {children}
    </div>
  );
}

interface ChecklistItemProps {
  children: ReactNode;
  done?: boolean;
  onClick?: () => void;
  href?: string;
}

export function ChecklistItem({ children, done = false, onClick, href }: ChecklistItemProps) {
  const classes = `flex items-center gap-3 p-3 rounded-lg transition-colors ${
    done
      ? 'bg-irish-green-950/30 border border-irish-green-700/30'
      : 'bg-stout-700/50 border border-stout-600 hover:bg-stout-700 cursor-pointer'
  }`;

  const content = (
    <>
      {/* Checkbox */}
      <div
        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          done
            ? 'bg-irish-green-600 border-irish-green-600'
            : 'border-stout-500 bg-stout-800'
        }`}
      >
        {done && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Label */}
      <span className={`flex-1 text-sm ${done ? 'text-stout-400 line-through' : 'text-cream-100'}`}>
        {children}
      </span>

      {/* Arrow for clickable items */}
      {!done && (onClick || href) && (
        <svg className="w-4 h-4 text-stout-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </>
  );

  if (href && !done) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }

  if (onClick && !done) {
    return (
      <button onClick={onClick} className={classes}>
        {content}
      </button>
    );
  }

  return <div className={classes}>{content}</div>;
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: 'green' | 'amber' | 'blue';
  showLabel?: boolean;
  children?: ReactNode;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = 'green',
  showLabel = true,
  children,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    green: '#169b62',
    amber: '#f59e0b',
    blue: '#2563eb',
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#434343"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorMap[color]}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children ? (
          children
        ) : showLabel ? (
          <>
            <span className="text-2xl font-bold text-cream-100">{Math.round(percentage)}%</span>
            <span className="text-xs text-stout-400">complete</span>
          </>
        ) : null}
      </div>
    </div>
  );
}

// Preset progress cards
export function ProfileCompletionCard({
  profileComplete,
  tasksCompleted,
}: {
  profileComplete: number;
  tasksCompleted: { [key: string]: boolean };
}) {
  const tasks = [
    { key: 'photo', label: 'Add profile photo' },
    { key: 'location', label: 'Set home location' },
    { key: 'review', label: 'Write first review' },
    { key: 'prices', label: 'Submit 3 prices' },
    { key: 'friends', label: 'Add 5 friends' },
  ];

  const completedCount = Object.values(tasksCompleted).filter(Boolean).length;

  return (
    <ProgressCard
      title="Complete Your Profile"
      value={completedCount}
      max={tasks.length}
      className="mb-6"
    >
      <Checklist>
        {tasks.map((task) => (
          <ChecklistItem key={task.key} done={tasksCompleted[task.key]}>
            {task.label}
          </ChecklistItem>
        ))}
      </Checklist>
    </ProgressCard>
  );
}
