// ./contexts/authContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { auth } from '../firebaseConfig';
import { User } from '@firebase/auth';
import { adminService } from '../services/auth/adminService';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  refreshAdminStatus: () => Promise<void>;
}

const defaultContext: AuthContextType = {
  user: null,
  isAdmin: false,
  isAuthenticated: false,
  loading: true,
  refreshAdminStatus: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAdminStatus = async (currentUser: User | null): Promise<void> => {
    if (!currentUser) {
      setIsAdmin(false);
      return;
    }
    
    const adminStatus = await adminService.isUserAdmin();
    setIsAdmin(adminStatus);
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser: User | null) => {
      setUser(currentUser);
      await checkAdminStatus(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshAdminStatus = async (): Promise<void> => {
    await adminService.refreshToken();
    await checkAdminStatus(user);
  };

  const value: AuthContextType = {
    user,
    isAdmin,
    isAuthenticated: !!user,
    loading,
    refreshAdminStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => useContext(AuthContext);