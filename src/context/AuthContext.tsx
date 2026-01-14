import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/auth';
import { storage } from '../api/storage';  // Use API storage instead
import { Admin } from '../types';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (subdomain: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and validate on mount
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);

      // Check if we have a token
      const token = await storage.getToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      // Check if we have stored admin data
      const storedAdminData = await storage.getAdminData();

      if (storedAdminData) {
        // Convert Admin to User format
        setUser({
          id: storedAdminData._id,
          email: storedAdminData.email,
          name: storedAdminData.username,
          role: storedAdminData.role,
        });
      }

      // Optionally verify token with backend
      try {
        const { valid, admin } = await authApi.verifyToken();

        if (valid && admin) {
          setUser({
            id: admin._id,
            email: admin.email,
            name: admin.username,
            role: admin.role,
          });

          // Update stored admin data
          await storage.setAdminData(admin);
        } else {
          // Token is invalid, clear auth
          await clearAuthData();
        }
      } catch (verifyError) {
        // If verification fails but we have stored data, keep user logged in
        // This handles cases where backend is temporarily down
        console.log('Token verification failed, using stored data:', verifyError);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Auth check failed:', error);
      await clearAuthData();
      setIsLoading(false);
    }
  };

  const clearAuthData = async () => {
    setUser(null);
    await storage.clearAuth();  // Uses the unified storage system
  };

  const login = async (subdomain: string, username: string, password: string) => {
    try {
      // Call the auth API with subdomain
      const { token, admin } = await authApi.login({ subdomain, username, password });

      // Store the token
      await storage.setToken(token);

      // Store subdomain
      await storage.setSubdomain(subdomain);

      // Store restaurant ID from admin object
      if (admin.restaurantId) {
        const restaurantId = typeof admin.restaurantId === 'string' ? admin.restaurantId : admin.restaurantId._id;
        await storage.setRestaurantId(restaurantId);
      }

      // Store admin data
      await storage.setAdminData(admin);

      // Update user state
      setUser({
        id: admin._id,
        email: admin.email,
        name: admin.username,
        role: admin.role,
      });

      console.log('Login successful:', admin.username);
    } catch (error: any) {
      console.error('Login failed:', error);
      await clearAuthData();
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout API (optional, may fail if network is down)
      try {
        await authApi.logout();
      } catch (apiError) {
        console.log('Logout API call failed, clearing local data anyway:', apiError);
      }

      // Clear local auth data regardless of API call result
      await clearAuthData();

      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local data even if there's an error
      await clearAuthData();
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
