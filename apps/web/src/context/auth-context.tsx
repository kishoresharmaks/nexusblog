'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@nexus/types';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    name: string;
    username: string;
    email: string;
    password: string;
    bio?: string;
  }) => Promise<User>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message: string }>;
  resendVerification: (email: string) => Promise<{ message: string }>;
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
      const token = authClient.getAccessToken();
      if (token) {
        try {
          const me = await authClient.getMe();
          if (me) {
            setUser(me);
            setIsLoading(false);
            return;
          }
        } catch {
          // Token expired, attempt refresh
        }
      }

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

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const result = await authClient.login({ email, password });
      setUser(result.user);
      toast.success(`Welcome back, ${result.user.name}!`);
      return result.user;
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
  }): Promise<User> => {
    setIsLoading(true);
    try {
      const result = await authClient.register(data);
      setUser(result.user);
      toast.success(`Account created! Welcome to NexusBlog, ${result.user.name}`);
      return result.user;
    } catch (error) {
      toast.error((error as Error).message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const res = await authClient.verifyEmail(token);
      toast.success(res.message || 'Email verified successfully!');
      await refreshUser();
      return res;
    } catch (error) {
      toast.error((error as Error).message || 'Email verification failed');
      throw error;
    }
  };

  const resendVerification = async (email: string) => {
    try {
      const res = await authClient.resendVerification(email);
      toast.success(res.message || 'Verification link sent!');
      return res;
    } catch (error) {
      toast.error((error as Error).message || 'Failed to resend verification email');
      throw error;
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
        verifyEmail,
        resendVerification,
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
