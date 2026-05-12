import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api, { TOKEN_KEY } from '@/lib/api';
import type { LoginResponse, User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<UserRole>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isGroupCreator: boolean;
  isStudent: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function buildUser(res: LoginResponse): User {
  return {
    id: res.userId,
    userName: res.email,
    email: res.email,
    displayName: res.displayName,
    createdAt: new Date().toISOString(),
    role: res.role,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setLoading(false);
      return;
    }

    api
      .get<{ user: Omit<User, 'role'>; roles: UserRole[] }>('/auth/me')
      .then(({ data }) => {
        const role = data.roles[0] ?? 'Student';
        setUser({ ...data.user, role });
        setToken(storedToken);
      })
      .catch(() => {
        // Token invalid/expired — clear state
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<UserRole> => {
    const { data } = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(buildUser(data));
    return data.role;
  }, []);

  const logout = useCallback(() => {
    api.post('/auth/logout').catch(() => {
      console.log('Logout failed, but clearing local state anyway');
    });
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Admin',
    isGroupCreator: user?.role === 'GroupCreator',
    isStudent: user?.role === 'Student',
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
