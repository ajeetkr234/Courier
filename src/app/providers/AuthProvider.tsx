import React, { createContext, useContext, useEffect } from 'react';
import { UserProfile, UserRole } from '../../types';
import { useAppStore } from '../../lib/store';
import { usePlatformStore } from '../../services/store';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<void>;
  register: (email: string, password: string, companyName: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: 'SELLER' | 'ADMIN') => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

/**
 * Temporary no-auth application context.
 *
 * It keeps the existing consumer API intact while bypassing Supabase Auth. The
 * configured seller is still passed to the platform store so all application
 * data continues to come from Supabase.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentUser = useAppStore((state) => state.currentUser);
  const currentSeller = useAppStore((state) => state.currentSeller);

  useEffect(() => {
    const platformStore = usePlatformStore.getState();
    platformStore.setCurrentSeller(currentSeller);
  }, [currentSeller]);

  const authDisabled = async () => undefined;
  const switchDemoRole = (_role: 'SELLER' | 'ADMIN') => undefined;

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        isLoading: false,
        login: authDisabled,
        register: authDisabled,
        logout: authDisabled,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
