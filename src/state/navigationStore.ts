import { create } from 'zustand';

export type PageKey = 'dashboard' | 'agent' | 'companies' | 'lists' | 'credits' | 'settings';

type NavigationState = {
  page: PageKey;
  setPage: (page: PageKey) => void;
};

export const useNavigationStore = create<NavigationState>((set) => ({
  page: 'dashboard',
  setPage: (page) => set({ page }),
}));
