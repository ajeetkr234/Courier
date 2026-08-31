import { create } from 'zustand';
import { Seller, Warehouse, UserProfile } from '../types';
import { MOCK_USER, INITIAL_SELLERS, MOCK_WAREHOUSES, MOCK_WALLETS } from './mockData';

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
  currentUser: MOCK_USER,
  currentSeller: INITIAL_SELLERS[0],
  warehouses: MOCK_WAREHOUSES,
  activeWarehouseId: MOCK_WAREHOUSES[0].id,
  walletBalance: MOCK_WALLETS['seller-1'].balance,
  isSidebarOpen: true,

  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentSeller: (seller) => set({ currentSeller: seller }),
  setActiveWarehouseId: (id) => set({ activeWarehouseId: id }),
  updateWalletBalance: (newBalance) => set({ walletBalance: newBalance }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
