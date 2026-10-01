'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@nexus/types';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    username: string;
    email: string;
    password: string;
    bio?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const refreshed = await authClient.refreshToken();
      if (refreshed) {
        const me = await authClient.getMe();
        setUser(me);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authClient.login({ email, password });
      setUser(result.user);
      toast.success(`Welcome back, ${result.user.name}!`);
    } catch (error) {
      toast.error((error as Error).message || 'Failed to log in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    username: string;
    email: string;
    password: string;
    bio?: string;
  }) => {
    setIsLoading(true);
    try {
      const result = await authClient.register(data);
      setUser(result.user);
      toast.success(`Account created! Welcome to NexusBlog, ${result.user.name}`);
    } catch (error) {
      toast.error((error as Error).message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authClient.logout();
      setUser(null);
      toast.success('You have been logged out.');
    } catch (error) {
      toast.error((error as Error).message || 'Error during logout');
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updated = await authClient.updateProfile(data);
      setUser(updated);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error((error as Error).message || 'Failed to update profile');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
