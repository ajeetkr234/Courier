import { create } from 'zustand';
import { Seller, Warehouse, UserProfile } from '../types';
import { DEFAULT_SEED_WAREHOUSES } from '../services/supabaseWarehouses';

interface AppState {
  currentUser: UserProfile | null;
  currentSeller: Seller | null;
  warehouses: Warehouse[];
  activeWarehouseId: string | null;
  walletBalance: number;
  isSidebarOpen: boolean;
  
  // Actions
  setCurrentUser: (user: UserProfile | null) => void;
  setCurrentSeller: (seller: Seller | null) => void;
  setActiveWarehouseId: (id: string) => void;
  updateWalletBalance: (newBalance: number) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  currentSeller: null,
  warehouses: DEFAULT_SEED_WAREHOUSES,
  activeWarehouseId: null,
  walletBalance: 0,
  isSidebarOpen: true,

  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentSeller: (seller) => set({ currentSeller: seller }),
  setActiveWarehouseId: (id) => set({ activeWarehouseId: id }),
  updateWalletBalance: (newBalance) => set({ walletBalance: newBalance }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
