/**
 * GoOne Customer App — Notification Store
 * Caches the customer's notification feed and the derived unread count so
 * the AppHeader badge (and NotificationsScreen) can share one fetch instead
 * of every screen re-querying the backend independently.
 */
import { create } from 'zustand';
import { notificationsApi } from '../api/client';

export interface NotificationItem {
  id: string;
  title: string | null;
  body: string;
  createdAt: string;
  openedAt: string | null;
}

interface NotificationState {
  items: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetch: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = (await notificationsApi.list()) as NotificationItem[];
      set({
        items,
        unreadCount: items.filter((n) => !n.openedAt).length,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err?.message || 'Unable to load notifications.', isLoading: false });
    }
  },

  markRead: async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      // Optimistic local patch — avoid re-fetching the whole list for one row.
      const items = get().items.map((n) =>
        n.id === id ? { ...n, openedAt: n.openedAt ?? new Date().toISOString() } : n,
      );
      set({ items, unreadCount: items.filter((n) => !n.openedAt).length });
    } catch (err: any) {
      set({ error: err?.message || 'Unable to mark notification as read.' });
    }
  },
}));
