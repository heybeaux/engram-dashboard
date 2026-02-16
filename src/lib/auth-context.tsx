'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { resetPostHog } from '@/lib/posthog';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.openengram.ai';
const USER_ID = process.env.NEXT_PUBLIC_ENGRAM_USER_ID || 'default';
const EDITION = process.env.NEXT_PUBLIC_EDITION || 'cloud';

interface User {
  id: string;
  email: string;
  name: string;
  [key: string]: unknown;
}

interface AuthResponse {
  token: string;
  apiKey: string;
  account: User;
  agent: unknown;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string, plan?: string, accessCode?: string) => Promise<{ success: boolean; apiKey?: string; needsPayment?: boolean; selectedPlan?: string; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'engram_token';
const USER_KEY = 'engram_user';

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value};path=/;max-age=${60 * 60 * 24 * 30};SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;path=/;max-age=0`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load stored auth on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Verify token is still valid
      fetch(`${API_BASE}/v1/account`, {
        headers: { Authorization: `Bearer ${storedToken}`, 'X-AM-User-ID': USER_ID },
      })
        .then((res) => {
          if (!res.ok) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setToken(null);
            setUser(null);
          }
        })
        .catch(() => {
          // Network error — keep cached auth
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  // Auto-redirect unauthenticated users away from /dashboard (cloud only)
  useEffect(() => {
    if (EDITION === 'local') return; // Local edition uses LAN bypass, no JWT needed
    if (!isLoading && !token && pathname?.startsWith('/dashboard')) {
      router.replace('/login');
    }
  }, [isLoading, token, pathname, router]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-AM-User-ID': USER_ID },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { success: false, error: data.message || 'Invalid credentials' };
      }
      const data: AuthResponse = await res.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.account));
      setCookie(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.account);
      // Track login count for NPS survey eligibility
      try {
        const { incrementLoginCount } = await import('@/components/nps-survey');
        incrementLoginCount();
      } catch {}
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string, plan?: string, accessCode?: string) => {
    try {
      const res = await fetch(`${API_BASE}/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-AM-User-ID': USER_ID },
        body: JSON.stringify({ email, password, name, plan, accessCode }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { success: false, error: data.message || 'Registration failed' };
      }
      const data = await res.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.account));
      setCookie(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.account);
      return { success: true, apiKey: data.apiKey, needsPayment: data.needsPayment, selectedPlan: data.selectedPlan };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    deleteCookie(TOKEN_KEY);
    setToken(null);
    setUser(null);
    resetPostHog();
    router.replace('/login');
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
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
