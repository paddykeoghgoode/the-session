'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

export interface Notification {
  id: string;
  type: 'friend_request' | 'friend_accepted' | 'review_reply' | 'price_drop' | 'price_verified' | 'level_up' | 'achievement';
  title: string;
  message: string;
  icon: string;
  read: boolean;
  created_at: string;
  action_url?: string;
  action_label?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // For now, return mock data
      // In production, fetch from notifications table
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'friend_request',
          title: 'New Friend Request',
          message: '@john wants to connect with you',
          icon: '👋',
          read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
          action_url: '/friends',
          action_label: 'View',
        },
        {
          id: '2',
          type: 'price_verified',
          title: 'Price Verified',
          message: 'Your price at The Temple Bar was verified by 5 people (+15 points)',
          icon: '✓',
          read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        },
        {
          id: '3',
          type: 'price_drop',
          title: 'Price Drop Alert',
          message: 'Guinness at Temple Bar now €5.50 (was €6.00)',
          icon: '💰',
          read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          action_url: '/pubs/temple-bar',
          action_label: 'View Pub',
        },
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
      setIsLoading(false);
    };

    fetchNotifications();

    // Real-time subscription (for production)
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    // In production, update database
    // await supabase
    //   .from('notifications')
    //   .update({ read: true })
    //   .eq('id', notificationId);
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    // In production, update database
    // const { data: { user } } = await supabase.auth.getUser();
    // if (user) {
    //   await supabase
    //     .from('notifications')
    //     .update({ read: true })
    //     .eq('user_id', user.id)
    //     .eq('read', false);
    // }
  };

  const deleteNotification = async (notificationId: string) => {
    const notif = notifications.find(n => n.id === notificationId);
    if (notif && !notif.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prev => prev.filter(n => n.id !== notificationId));

    // In production, delete from database
    // await supabase
    //   .from('notifications')
    //   .delete()
    //   .eq('id', notificationId);
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
