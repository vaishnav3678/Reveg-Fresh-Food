import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface AdminProfile {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
}

interface AdminAuthContextType {
  token: string | null;
  user: AdminProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const TOKEN_KEY = 'reveg_admin_token';
const PROFILE_KEY = 'reveg_admin_profile';

const DEFAULT_ADMIN_PROFILE: AdminProfile = {
  id: 'usr_admin',
  username: 'admin',
  email: 'revegfreshfoods@gmail.com',
  name: 'RevEg Admin',
  role: 'admin',
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AdminProfile | null>(() => {
    try {
      const stored = localStorage.getItem(PROFILE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const verifySession = useCallback(async (activeToken: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem(PROFILE_KEY, JSON.stringify(data.user));
        return;
      }
    } catch (err) {
      // If backend is not available (static setup), verify against stored token
    }

    // Static session verification fallback
    if (activeToken && activeToken.startsWith('reveg_admin_session_')) {
      const stored = localStorage.getItem(PROFILE_KEY);
      if (stored) {
        try {
          setUser(JSON.parse(stored));
          return;
        } catch {
          // ignore
        }
      }
      setUser(DEFAULT_ADMIN_PROFILE);
      return;
    }

    // Invalid or expired token
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
    setToken(null);
    setUser(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      verifySession(token).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token, verifySession]);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedUsername = username.trim();
    const cleanPassword = password.trim();

    // 1. Attempt API server authentication if server is running
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUsername, password: cleanPassword }),
      });

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data.token && data.user) {
          localStorage.setItem(TOKEN_KEY, data.token);
          localStorage.setItem(PROFILE_KEY, JSON.stringify(data.user));
          setToken(data.token);
          setUser(data.user);
          return { success: true };
        } else if (!res.ok) {
          // If server explicitly rejected with invalid credentials
          if (res.status === 401 || res.status === 400) {
            return { success: false, error: data.error || 'Invalid username or password' };
          }
        }
      }
    } catch {
      // Backend not running (static environment)
    }

    // 2. Default exact credentials validation (Requirement: Username: admin, Password: admin123)
    if (trimmedUsername.toLowerCase() === 'admin' && cleanPassword === 'admin123') {
      const sessionToken = 'reveg_admin_session_' + Date.now();
      localStorage.setItem(TOKEN_KEY, sessionToken);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(DEFAULT_ADMIN_PROFILE));
      setToken(sessionToken);
      setUser(DEFAULT_ADMIN_PROFILE);
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid credentials. Please enter the correct admin username and password.',
    };
  };

  const logout = async () => {
    if (token && !token.startsWith('reveg_admin_session_')) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.error('Logout error:', e);
      }
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
    setToken(null);
    setUser(null);
  };

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const headers = new Headers(options.headers || {});
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return fetch(url, { ...options, headers });
    },
    [token]
  );

  return (
    <AdminAuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        authFetch,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
