import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  preferences?: string;
  isVerified?: boolean;
}

export interface UserSettings {
  id: string;
  userId: string;
  theme: string;
  currency: string;
  language: string;
  notificationsEnabled: number;
  monthlyBudget: number;
  dockShortcuts: string;
}

export interface UserSubscription {
  planId: 'free' | 'pro' | 'elite';
  status: string;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: number;
}

interface AuthResponse {
  token: string;
  user: User;
  requiresVerification?: boolean;
  message?: string;
}

interface MeResponse {
  user: User;
  settings: UserSettings | null;
  subscription: UserSubscription | null;
}

interface AuthContextType {
  user: User | null;
  settings: UserSettings | null;
  subscription: UserSubscription | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  loginWithCredentials: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<{ user: User; requiresVerification: boolean }>;
  verifyOtp: (email: string, otpCode: string, purpose?: 'verification' | 'reset_password' | 'detox') => Promise<boolean>;
  resendOtp: (email: string, purpose?: 'verification' | 'reset_password' | 'detox') => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, otpCode: string, newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { name?: string; avatarUrl?: string | null; preferences?: string }) => Promise<void>;
}

// ── Client-side JWT Token Parser & Validator ─────────────────────
function parseJwtPayload(token: string): { sub?: string; email?: string; name?: string; exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  const payload = parseJwtPayload(token);
  if (!payload || !payload.exp) return false;
  // Valid if expiration is in the future (with 10-second skew buffer)
  return payload.exp * 1000 > Date.now() + 10_000;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Hard Login Session Initialization:
  // Check stored token and restore immediate authenticated state if token is not expired
  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem('ls_token');
    if (stored && isTokenValid(stored)) {
      return stored;
    }
    if (stored && !isTokenValid(stored)) {
      // Clean up truly expired token
      localStorage.removeItem('ls_token');
      localStorage.removeItem('ls_user');
    }
    return null;
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ls_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall back to token payload
      }
    }
    const currentToken = localStorage.getItem('ls_token');
    if (currentToken && isTokenValid(currentToken)) {
      const payload = parseJwtPayload(currentToken);
      if (payload?.sub && payload?.email) {
        return {
          id: payload.sub,
          email: payload.email,
          name: payload.name || payload.email.split('@')[0],
          isVerified: true
        };
      }
    }
    return null;
  });

  const [settings, setSettings] = useState<UserSettings | null>(() => {
    const saved = localStorage.getItem('ls_settings');
    return saved ? JSON.parse(saved) : null;
  });

  const [subscription, setSubscription] = useState<UserSubscription | null>(() => {
    const saved = localStorage.getItem('ls_subscription');
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Explicit user-invoked logout
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setSettings(null);
    setSubscription(null);
    localStorage.removeItem('ls_token');
    localStorage.removeItem('ls_user');
    localStorage.removeItem('ls_settings');
    localStorage.removeItem('ls_subscription');
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('ls_token', newToken);
    localStorage.setItem('ls_user', JSON.stringify(newUser));
  }, []);

  // Safe Session Synchronization:
  // Preserves cached session on transient network error, cold start, or offline blips!
  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem('ls_token');
    if (!currentToken) return;

    // Check if token is still locally valid before pinging
    if (!isTokenValid(currentToken)) {
      logout();
      return;
    }

    try {
      const data = await api.get<MeResponse>('/api/auth/me');
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('ls_user', JSON.stringify(data.user));
        if (data.settings) {
          setSettings(data.settings);
          localStorage.setItem('ls_settings', JSON.stringify(data.settings));
        }
        if (data.subscription) {
          setSubscription(data.subscription);
          localStorage.setItem('ls_subscription', JSON.stringify(data.subscription));
        }
      }
    } catch (err: any) {
      // ONLY log out if the backend explicitly returned a 401 Unauthorized indicating token expiry
      if (err?.message?.includes('401') || err?.message?.toLowerCase().includes('expired token')) {
        console.warn('Session expired by remote server, logging out...');
        logout();
      } else {
        // Network error, backend reboot, or offline mode: Keep the hard session alive!
        console.info('Transient network or server issue; keeping hard session active.');
      }
    }
  }, [logout]);

  useEffect(() => {
    const handleUnauthorized = () => {
      const currentToken = localStorage.getItem('ls_token');
      if (!isTokenValid(currentToken)) {
        logout();
      }
    };
    window.addEventListener('lifesolver:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('lifesolver:unauthorized', handleUnauthorized);
  }, [logout]);

  // Synchronize profile in the background on mount
  useEffect(() => {
    if (token) {
      refreshUser().catch(() => {});
    }
  }, []);

  const loginWithCredentials = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.post<AuthResponse>('/api/auth/login', { email, password });
      login(res.token, res.user);
      // Fetch full profile / settings in background
      refreshUser().catch(() => {});
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ user: User; requiresVerification: boolean }> => {
    setIsLoading(true);
    try {
      const res = await api.post<AuthResponse>('/api/auth/register', { name, email, password });
      login(res.token, res.user);
      return {
        user: res.user,
        requiresVerification: Boolean(res.requiresVerification)
      };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (
    email: string,
    otpCode: string,
    purpose: 'verification' | 'reset_password' | 'detox' = 'verification'
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.post<{ verified: boolean }>('/api/auth/verify-otp', {
        email,
        otpCode,
        purpose
      });
      if (res.verified && user) {
        const updated = { ...user, isVerified: true };
        setUser(updated);
        localStorage.setItem('ls_user', JSON.stringify(updated));
      }
      return Boolean(res.verified);
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (
    email: string,
    purpose: 'verification' | 'reset_password' | 'detox' = 'verification'
  ): Promise<void> => {
    setIsLoading(true);
    try {
      await api.post('/api/auth/resend-otp', { email, purpose });
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string, otpCode: string, newPassword: string): Promise<void> => {
    setIsLoading(true);
    try {
      await api.post('/api/auth/reset-password', { email, otpCode, newPassword });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: { name?: string; avatarUrl?: string | null; preferences?: string }): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await api.put<{ user: User }>('/api/auth/profile', data);
      if (res?.user) {
        setUser(res.user);
        localStorage.setItem('ls_user', JSON.stringify(res.user));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        settings,
        subscription,
        token,
        isAuthenticated: !!token && isTokenValid(token),
        isLoading,
        login,
        logout,
        loginWithCredentials,
        register,
        verifyOtp,
        resendOtp,
        forgotPassword,
        resetPassword,
        refreshUser,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
