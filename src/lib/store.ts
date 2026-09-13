import { create } from 'zustand';
import { Seller, Warehouse, UserProfile } from '../types';

const DEFAULT_PRIMARY_SELLER: Seller = {
  id: '32d724db-23c4-4cba-a76f-f78e4022194e',
  company_name: 'Seller Account',
  brand_name: 'Seller Account',
  gstin: '',
  pan: '',
  status: 'ACTIVE',
  created_at: '2026-09-08T07:55:49.261651+00:00',
  updated_at: '2026-09-08T07:55:49.261651+00:00',
};

const DEFAULT_PRIMARY_USER: UserProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Seller User',
  email: 'seller@shipfaster.local',
  role: 'OWNER',
  seller_id: '32d724db-23c4-4cba-a76f-f78e4022194e',
  is_active: true,
};

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
  currentUser: import.meta.env.VITE_ENABLE_DEMO_MODE === 'true' ? DEFAULT_PRIMARY_USER : null,
  currentSeller: import.meta.env.VITE_ENABLE_DEMO_MODE === 'true' ? DEFAULT_PRIMARY_SELLER : null,
  warehouses: [],
  activeWarehouseId: null,
  walletBalance: 0,
  isSidebarOpen: true,

  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentSeller: (seller) => set({ currentSeller: seller }),
  setActiveWarehouseId: (id) => set({ activeWarehouseId: id }),
  updateWalletBalance: (newBalance) => set({ walletBalance: newBalance }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
