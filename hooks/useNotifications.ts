import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Notification, NotificationAction } from '../types';
import { MOCK_NOTIFICATIONS } from '../data';
import { createLogger } from '../lib/logger';

const logger = createLogger('useNotifications');

interface NotificationInput {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  action?: NotificationAction;
  metadata?: {
    appointmentId?: string;
    patientId?: string;
    patientName?: string;
    patientPhone?: string;
    patientEmail?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    serviceName?: string;
  };
}

interface UseNotifications {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: NotificationInput) => Promise<Notification | null>;
  markAsRead: (id: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (id: string) => Promise<boolean>;
  clearAll: () => Promise<boolean>;
}

export function useNotifications(): UseNotifications {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile, user } = useAuth();

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setNotifications(MOCK_NOTIFICATIONS);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      const transformedNotifications: Notification[] = (data || []).map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type || 'info',
        timestamp: n.created_at,
        read: n.read || false,
      }));

      setNotifications(transformedNotifications);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
      logger.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addNotification = useCallback(async (notification: NotificationInput): Promise<Notification | null> => {
    if (!isSupabaseConfigured()) {
      const newNotification: Notification = {
        id: `mock-${Date.now()}`,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        timestamp: new Date().toISOString(),
        read: false,
        action: notification.action,
        metadata: notification.metadata,
      };
      setNotifications(prev => [newNotification, ...prev]);
      return newNotification;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('notifications')
        .insert({
          clinic_id: profile?.clinic_id,
          user_id: user?.id,
          title: notification.title,
          message: notification.message,
          type: notification.type || 'info',
          read: false,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newNotification: Notification = {
        id: data.id,
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        timestamp: data.created_at,
        read: data.read || false,
      };

      setNotifications(prev => [newNotification, ...prev]);
      return newNotification;
    } catch (err: any) {
      logger.error('Error adding notification:', err);
      setError(err.message || 'Failed to add notification');
      return null;
    }
  }, [profile?.clinic_id, user?.id]);

  const markAsRead = useCallback(async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      setNotifications(prev => prev.map(n =>
        n.id === id ? { ...n, read: true } : n
      ));
      return true;
    }

    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (updateError) throw updateError;

      setNotifications(prev => prev.map(n =>
        n.id === id ? { ...n, read: true } : n
      ));
      return true;
    } catch (err: any) {
      logger.error('Error marking notification as read:', err);
      setError(err.message || 'Failed to update notification');
      return false;
    }
  }, []);

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      return true;
    }

    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      if (unreadIds.length === 0) return true;

      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds);

      if (updateError) throw updateError;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      return true;
    } catch (err: any) {
      logger.error('Error marking all notifications as read:', err);
      setError(err.message || 'Failed to update notifications');
      return false;
    }
  }, [notifications]);

  const deleteNotification = useCallback(async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      return true;
    }

    try {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setNotifications(prev => prev.filter(n => n.id !== id));
      return true;
    } catch (err: any) {
      logger.error('Error deleting notification:', err);
      setError(err.message || 'Failed to delete notification');
      return false;
    }
  }, []);

  const clearAll = useCallback(async (): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      setNotifications([]);
      return true;
    }

    try {
      const ids = notifications.map(n => n.id);
      if (ids.length === 0) return true;

      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .in('id', ids);

      if (deleteError) throw deleteError;

      setNotifications([]);
      return true;
    } catch (err: any) {
      logger.error('Error clearing notifications:', err);
      setError(err.message || 'Failed to clear notifications');
      return false;
    }
  }, [notifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!isSupabaseConfigured() || !user?.id) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification: Notification = {
            id: payload.new.id,
            title: payload.new.title,
            message: payload.new.message,
            type: payload.new.type || 'info',
            timestamp: payload.new.created_at,
            read: payload.new.read || false,
          };
          setNotifications(prev => [newNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
}
