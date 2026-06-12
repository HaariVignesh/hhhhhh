import { create } from "zustand";

interface UIState {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  searchQuery: string;
  activeFilters: Record<string, string | string[]>;

  // Methods
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  setSearchQuery: (q: string) => void;
  setFilter: (key: string, value: string | string[]) => void;
  removeFilter: (key: string) => void;
  clearFilters: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  searchQuery: "",
  activeFilters: {},

  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),

  setSearchQuery: (q) => set({ searchQuery: q }),

  setFilter: (key, value) =>
    set((state) => ({
      activeFilters: { ...state.activeFilters, [key]: value },
    })),

  removeFilter: (key) =>
    set((state) => {
      const next = { ...state.activeFilters };
      delete next[key];
      return { activeFilters: next };
    }),

  clearFilters: () => set({ activeFilters: {} }),
}));
