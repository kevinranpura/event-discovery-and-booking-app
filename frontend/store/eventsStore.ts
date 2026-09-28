import { create } from 'zustand';
import { eventsService } from '../services/eventsService';
import { Event, EventFilters } from '../types';

interface EventsStore {
  events: Event[];
  selectedEvent: Event | null;
  isLoading: boolean;
  error: string | null;
  filters: EventFilters;
  fetchEvents: (filters?: EventFilters) => Promise<void>;
  fetchEvent: (id: number) => Promise<void>;
  createEvent: (data: any) => Promise<void>;
  updateEvent: (id: number, data: any) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
  setFilters: (filters: Partial<EventFilters>) => void;
  clearFilters: () => void;
}

const defaultFilters: EventFilters = {
  search: '',
  category: '',
  date: '',
  minPrice: '',
  maxPrice: '',
  location: '',
};

export const useEventsStore = create<EventsStore>((set, get) => ({
  events: [],
  selectedEvent: null,
  isLoading: false,
  error: null,
  filters: defaultFilters,

  fetchEvents: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const activeFilters = filters || get().filters;
      // Remove empty values
      const params = Object.fromEntries(
        Object.entries(activeFilters).filter(([, v]) => v !== '' && v != null)
      );
      const res = await eventsService.getEvents(params);
      const eventsList = res.data?.events || res.data?.data?.events || [];
      set({ events: eventsList, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchEvent: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await eventsService.getEvent(id);
      const eventItem = res.data?.event || res.data?.data?.event || null;
      set({ selectedEvent: eventItem, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createEvent: async (data) => {
    set({ isLoading: true });
    try {
      const res = await eventsService.createEvent(data);
      const newEvent = res.data?.data?.event || res.data?.event;
      if (newEvent) {
        set((state) => ({
          events: [newEvent, ...state.events.filter((e) => e.id !== newEvent.id)],
          isLoading: false,
        }));
      } else {
        await get().fetchEvents();
        set({ isLoading: false });
      }
      return newEvent;
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  updateEvent: async (id, data) => {
    set({ isLoading: true });
    try {
      const res = await eventsService.updateEvent(id, data);
      const updated = res.data?.data?.event || res.data?.event;
      if (updated) {
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...updated } : e)),
          selectedEvent: state.selectedEvent?.id === id ? { ...state.selectedEvent, ...updated } : state.selectedEvent,
          isLoading: false,
        }));
      } else {
        await get().fetchEvents();
        set({ isLoading: false });
      }
      return updated;
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  deleteEvent: async (id) => {
    set({ isLoading: true });
    try {
      await eventsService.deleteEvent(id);
      set((state) => ({
        events: state.events.filter((e) => e.id !== id),
        isLoading: false,
      }));
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  clearFilters: () => set({ filters: defaultFilters }),
}));
