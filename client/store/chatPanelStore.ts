import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ChatPanelStore {
  isOpen: boolean;
  hasHydrated: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useChatPanelStore = create<ChatPanelStore>()(
  persist(
    (set) => ({
      isOpen: true,
      hasHydrated: false,
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: 'chat-panel-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
