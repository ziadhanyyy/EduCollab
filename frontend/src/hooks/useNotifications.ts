import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Notification } from '@/types';
import { extractErrorMessage } from '@/utils/helpers';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Notification[]>('/notifications');
      setNotifications(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = useCallback(async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
    }
  }, []);

  const markOneRead = useCallback((id: string) => {
    // Optimistic update — fire-and-forget the API call
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    api.patch(`/notifications/${id}/read`).catch(() => {});
  }, []);

  const appendNotification = useCallback((n: Notification) => {
    setNotifications((prev) => {
      if (prev.some((x) => x.id === n.id)) return prev;
      return [n, ...prev];
    });
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, loading, error, unreadCount, markAllRead, markOneRead, appendNotification, refetch: fetchNotifications };
}
