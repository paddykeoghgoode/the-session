'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { formatRelativeTime } from '@/lib/utils';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'friends' | 'prices' | 'system'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'all') return true;
    if (activeTab === 'friends')
      return ['friend_request', 'friend_accepted'].includes(notif.type);
    if (activeTab === 'prices')
      return ['price_drop', 'price_verified'].includes(notif.type);
    if (activeTab === 'system') return ['level_up', 'achievement'].includes(notif.type);
    return true;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-cream-100 hover:text-white transition-colors"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse-ring">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-stout-800 border border-stout-700 rounded-lg shadow-xl z-50 animate-slide-up">
          {/* Header */}
          <div className="p-4 border-b border-stout-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-cream-100">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-irish-green-500 hover:text-irish-green-400 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'All', icon: '📬' },
                { id: 'friends', label: 'Friends', icon: '👥' },
                { id: 'prices', label: 'Prices', icon: '💰' },
                { id: 'system', label: 'System', icon: '🔔' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-irish-green-600 text-white'
                      : 'bg-stout-700 text-stout-300 hover:bg-stout-600'
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications list */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-stout-400">
                <div className="w-6 h-6 border-2 border-irish-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-stout-400">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              filteredNotifications.map(notif => (
                <NotificationItem
                  key={notif.id}
                  notification={notif}
                  onRead={() => markAsRead(notif.id)}
                  onDelete={() => deleteNotification(notif.id)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-stout-700 text-center">
              <Link
                href="/notifications"
                className="text-xs text-irish-green-500 hover:text-irish-green-400 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onRead: () => void;
  onDelete: () => void;
}

function NotificationItem({ notification, onRead, onDelete }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read) {
      onRead();
    }
  };

  return (
    <div
      className={`p-4 border-b border-stout-700 hover:bg-stout-700/50 transition-colors ${
        !notification.read ? 'bg-stout-750' : ''
      }`}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 text-2xl">{notification.icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-medium text-cream-100 text-sm">{notification.title}</h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-stout-400 hover:text-cream-100 transition-colors"
              aria-label="Delete notification"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <p className="text-sm text-stout-300 mb-2">{notification.message}</p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-stout-500">
              {formatRelativeTime(notification.created_at)}
            </span>

            {notification.action_url && (
              <Link
                href={notification.action_url}
                onClick={handleClick}
                className="text-xs text-irish-green-500 hover:text-irish-green-400 font-medium"
              >
                {notification.action_label || 'View'} →
              </Link>
            )}
          </div>

          {/* Unread indicator */}
          {!notification.read && (
            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-irish-green-600 rounded-full" />
          )}
        </div>
      </div>
    </div>
  );
}
