import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { UserProfile, UserRole } from '../../types';
import { useAppStore } from '../../lib/store';
import { usePlatformStore } from '../../services/store';
import { getActiveSession, signInUser, signOutUser, signUpUser } from '../../services/supabaseAuth';
import { supabase } from '../../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<void>;
  register: (email: string, password: string, companyName: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, setCurrentUser, setCurrentSeller } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  const apply = (data: Awaited<ReturnType<typeof getActiveSession>>) => {
    setCurrentUser(data?.user || null);
    setCurrentSeller(data?.seller || null);
    usePlatformStore.getState().setCurrentSeller(data?.seller || null);
  };

  useEffect(() => {
    let active = true;
    getActiveSession()
      .then((d) => {
        if (active) apply(d);
      })
      .catch(() => {
        if (active) apply(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT') apply(null);
      });
      return () => {
        active = false;
        subscription.unsubscribe();
      };
    } catch {
      return () => {
        active = false;
      };
    }
  }, []);

  const login = async (email: string, password = '') => {
    setIsLoading(true);
    try {
      const data = await signInUser(email, password);
      apply(data);
      const roleLabel = data.user.role.startsWith('PLATFORM_') ? 'Platform Admin' : 'Seller Panel';
      toast.success(`Signed in to ${roleLabel}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Sign in failed');
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, companyName: string, phone: string) => {
    setIsLoading(true);
    try {
      let data = await signUpUser(email, password, companyName, phone);
      try {
        await supabase.auth.refreshSession();
      } catch {}
      data = (await getActiveSession()) || data;
      apply(data);
      toast.success('Account created. You are now signed in.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await signOutUser();
    apply(null);
    toast.info('Signed out successfully');
  };

  return (
    <AuthContext.Provider value={{ user: currentUser, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
