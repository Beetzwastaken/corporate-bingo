// UI Store - Manages UI state like sidebar, panels, and loading states
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIStore {
  // State
  sidebarOpen: boolean;
  activePanel: 'rooms' | 'stats' | null;
  isLoading: boolean;
  loadingMessage: string;
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setActivePanel: (panel: 'rooms' | 'stats' | null) => void;
  togglePanel: (panel: 'rooms' | 'stats') => void;
  closeSidebar: () => void;
  setLoading: (loading: boolean, message?: string) => void;
}

export const useUIStore = create<UIStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      sidebarOpen: false,
      activePanel: null,
      isLoading: false,
      loadingMessage: '',
      
      // Actions
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      
      setActivePanel: (panel: 'rooms' | 'stats' | null) => set({ activePanel: panel }),
      
      togglePanel: (panel: 'rooms' | 'stats') => {
        const state = get();
        if (state.activePanel === panel) {
          set({ activePanel: null, sidebarOpen: false });
        } else {
          set({ activePanel: panel, sidebarOpen: true });
        }
      },
      
      closeSidebar: () => {
        set({ activePanel: null, sidebarOpen: false });
      },
      
      setLoading: (loading: boolean, message: string = '') => {
        set({ isLoading: loading, loadingMessage: message });
      }
    })
  )
);