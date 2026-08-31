import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '../../types';
import { useAppStore } from '../../lib/store';
import { MOCK_USER, MOCK_ADMIN_USER } from '../../lib/mockData';
import { supabase, isMockMode } from '../../lib/supabase';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: 'SELLER' | 'ADMIN') => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, setCurrentUser } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isMockMode) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          // Fetch user profile from DB
        }
      });
    }
  }, []);

  const login = async (email: string, role: UserRole = 'OWNER') => {
    setIsLoading(true);
    try {
      if (email.includes('admin')) {
        setCurrentUser(MOCK_ADMIN_USER);
        toast.success('Logged in as Platform Admin');
      } else {
        setCurrentUser({
          ...MOCK_USER,
          email,
          role
        });
        toast.success(`Welcome back, ${MOCK_USER.name}!`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (!isMockMode) {
        await supabase.auth.signOut();
      }
      setCurrentUser(null);
      toast.info('Logged out successfully');
    } finally {
      setIsLoading(false);
    }
  };

  const switchDemoRole = (role: 'SELLER' | 'ADMIN') => {
    if (role === 'ADMIN') {
      setCurrentUser(MOCK_ADMIN_USER);
      toast.success('Switched to Platform Admin context');
    } else {
      setCurrentUser(MOCK_USER);
      toast.success('Switched to Seller context');
    }
  };

  return (
    <AuthContext.Provider value={{ user: currentUser, isLoading, login, logout, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
