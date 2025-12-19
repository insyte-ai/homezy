/**
 * Pro Search Store
 * Manages state for browsing and filtering professionals
 */

import { create } from 'zustand';
import { searchPros, SearchResultPro } from '../services/pro';

interface ProsSearchState {
  // Filters
  searchQuery: string;
  selectedCategory: string | null;
  selectedEmirate: string | null;
  minRating: number | null;

  // Results
  professionals: SearchResultPro[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };

  // Actions
  setSearchQuery: (query: string) => void;
  setCategory: (category: string | null) => void;
  setEmirate: (emirate: string | null) => void;
  setMinRating: (rating: number | null) => void;
  fetchProfessionals: () => Promise<void>;
  loadMore: () => Promise<void>;
  resetFilters: () => void;
  reset: () => void;
}

const initialState = {
  searchQuery: '',
  selectedCategory: null,
  selectedEmirate: null,
  minRating: null,
  professionals: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
};

export const useProsSearchStore = create<ProsSearchState>((set, get) => ({
  ...initialState,

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setCategory: (category: string | null) => {
    set({ selectedCategory: category });
  },

  setEmirate: (emirate: string | null) => {
    set({ selectedEmirate: emirate });
  },

  setMinRating: (rating: number | null) => {
    set({ minRating: rating });
  },

  fetchProfessionals: async () => {
    const { searchQuery, selectedCategory, selectedEmirate, minRating } = get();

    set({ isLoading: true, error: null });

    try {
      const result = await searchPros({
        q: searchQuery || undefined,
        category: selectedCategory || undefined,
        emirate: selectedEmirate || undefined,
        minRating: minRating || undefined,
        page: 1,
        limit: 20,
      });

      set({
        professionals: result.professionals,
        pagination: result.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Error fetching professionals:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to load professionals',
      });
    }
  },

  loadMore: async () => {
    const { pagination, professionals, searchQuery, selectedCategory, selectedEmirate, minRating, isLoadingMore } = get();

    // Don't load if already loading or no more pages
    if (isLoadingMore || pagination.page >= pagination.pages) {
      return;
    }

    set({ isLoadingMore: true });

    try {
      const result = await searchPros({
        q: searchQuery || undefined,
        category: selectedCategory || undefined,
        emirate: selectedEmirate || undefined,
        minRating: minRating || undefined,
        page: pagination.page + 1,
        limit: 20,
      });

      set({
        professionals: [...professionals, ...result.professionals],
        pagination: result.pagination,
        isLoadingMore: false,
      });
    } catch (error: any) {
      console.error('Error loading more professionals:', error);
      set({ isLoadingMore: false });
    }
  },

  resetFilters: () => {
    set({
      searchQuery: '',
      selectedCategory: null,
      selectedEmirate: null,
      minRating: null,
    });
  },

  reset: () => {
    set(initialState);
  },
}));

export default useProsSearchStore;
