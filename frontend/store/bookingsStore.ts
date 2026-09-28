import { create } from 'zustand';
import { bookingsService, favoritesService, notificationsService } from '../services/bookingsService';
import { Booking, Favorite, Notification } from '../types';

// ─── Bookings Store ────────────────────────────────────────────────────────────

interface BookingsStore {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  fetchBookings: () => Promise<void>;
  createBooking: (data: { event_id: number; ticket_type: string; quantity: number }) => Promise<any>;
  cancelBooking: (id: number) => Promise<void>;
}

export const useBookingsStore = create<BookingsStore>((set) => ({
  bookings: [],
  isLoading: false,
  error: null,

  fetchBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await bookingsService.getBookings();
      const list = res.data?.bookings || res.data?.data?.bookings || [];
      set({ bookings: list, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createBooking: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await bookingsService.createBooking(data);
      const booking = res.data?.booking || res.data?.data?.booking;
      set((state) => ({
        bookings: [booking, ...state.bookings],
        isLoading: false,
      }));
      return booking;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  cancelBooking: async (id) => {
    set({ isLoading: true });
    try {
      await bookingsService.cancelBooking(id);
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === id ? { ...b, status: 'cancelled' as const } : b
        ),
        isLoading: false,
      }));
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },
}));

// ─── Favorites Store ───────────────────────────────────────────────────────────

interface FavoritesStore {
  favorites: Favorite[];
  isLoading: boolean;
  fetchFavorites: () => Promise<void>;
  addFavorite: (eventId: number) => Promise<void>;
  removeFavorite: (eventId: number) => Promise<void>;
  isFavorite: (eventId: number) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favorites: [],
  isLoading: false,

  fetchFavorites: async () => {
    set({ isLoading: true });
    try {
      const res = await favoritesService.getFavorites();
      const list = res.data?.favorites || res.data?.data?.favorites || [];
      set({ favorites: list, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addFavorite: async (eventId) => {
    try {
      await favoritesService.addFavorite(eventId);
      await get().fetchFavorites();
    } catch (err: any) {
      throw err;
    }
  },

  removeFavorite: async (eventId) => {
    try {
      await favoritesService.removeFavorite(eventId);
      set((state) => ({
        favorites: state.favorites.filter((f) => (f.event_id || f.id) !== eventId),
      }));
    } catch (err: any) {
      throw err;
    }
  },

  isFavorite: (eventId) => {
    return get().favorites.some((f) => (f.event_id || f.id) === eventId);
  },
}));

// ─── Notifications Store ───────────────────────────────────────────────────────

interface NotificationsStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await notificationsService.getNotifications();
      const notifications: Notification[] = res.data?.notifications || res.data?.data?.notifications || [];
      const unreadCount = notifications.filter((n) => !n.is_read).length;
      set({ notifications, unreadCount, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  markRead: async (id) => {
    try {
      await notificationsService.markRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch { }
  },

  markAllRead: async () => {
    try {
      await notificationsService.markAllRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch { }
  },
}));
