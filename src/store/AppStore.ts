import { create } from 'zustand';
import IPTVService, { Channel, Category } from '../services/iptvService';
import { getServerConfig, isAuthenticated as checkAuthenticated } from '../services/storage';

interface AppStore {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  categories: Category[];
  channels: Channel[];
  favorites: string[];
  searchQuery: string;
  selectedCategory: string | null;
  currentStreamType: 'live' | 'vod' | 'series';

  setAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
  setCategories: (categories: Category[]) => void;
  setChannels: (channels: Channel[]) => void;
  setFavorites: (favorites: string[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setStreamType: (type: 'live' | 'vod' | 'series') => void;

  initialize: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadChannels: (categoryId?: string) => Promise<void>;
  searchChannels: (query: string) => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  isAuthenticated: false,
  isLoading: false,
  error: null,
  categories: [],
  channels: [],
  favorites: [],
  searchQuery: '',
  selectedCategory: null,
  currentStreamType: 'live',

  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setLoading: (value) => set({ isLoading: value }),
  setError: (error) => set({ error }),
  setCategories: (categories) => set({ categories }),
  setChannels: (channels) => set({ channels }),
  setFavorites: (favorites) => set({ favorites }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
  setStreamType: (type) => set({ currentStreamType: type }),

  initialize: async () => {
    set({ isLoading: true });
    try {
      if (!checkAuthenticated()) {
        set({ isAuthenticated: false, isLoading: false });
        return;
      }

      const config = getServerConfig();
      IPTVService.setCredentials(config.url, config.username, config.password);

      const isConnected = await IPTVService.testConnection();
      if (!isConnected) {
        set({ isAuthenticated: false, error: 'Failed to connect to server', isLoading: false });
        return;
      }

      set({ isAuthenticated: true });
      await get().loadCategories();
    } catch (error) {
      set({ error: 'Initialization failed', isLoading: false });
    }
  },

  loadCategories: async () => {
    set({ isLoading: true });
    try {
      const categories = await IPTVService.getCategories(get().currentStreamType);
      set({ categories, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load categories', isLoading: false });
    }
  },

  loadChannels: async (categoryId?: string) => {
    set({ isLoading: true });
    try {
      const channels = await IPTVService.getChannels(categoryId, get().currentStreamType);
      set({ channels, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load channels', isLoading: false });
    }
  },

  searchChannels: async (query: string) => {
    set({ isLoading: true, searchQuery: query });
    try {
      const channels = await IPTVService.searchChannels(query, get().currentStreamType);
      set({ channels, isLoading: false });
    } catch (error) {
      set({ error: 'Search failed', isLoading: false });
    }
  },
}));
