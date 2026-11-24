import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/client';
import { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('careerpilot_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const resp = await api.get<User>('/users/me');
      setUser(resp.data);
      localStorage.setItem('careerpilot_user', JSON.stringify(resp.data));
    } catch (err) {
      console.error('Failed to fetch user session', err);
      setUser(null);
      setToken(null);
      localStorage.removeItem('careerpilot_token');
      localStorage.removeItem('careerpilot_user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const resp = await api.post<AuthResponse>('/auth/login', { email, password });
    const data = resp.data;
    localStorage.setItem('careerpilot_token', data.access_token);
    setToken(data.access_token);
    await fetchCurrentUser();
  };

  const register = async (fullName: string, email: string, password: string) => {
    const resp = await api.post<AuthResponse>('/auth/register', {
      full_name: fullName,
      email,
      password,
    });
    const data = resp.data;
    localStorage.setItem('careerpilot_token', data.access_token);
    setToken(data.access_token);
    await fetchCurrentUser();
  };

  const logout = () => {
    localStorage.removeItem('careerpilot_token');
    localStorage.removeItem('careerpilot_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    if (token) {
      await fetchCurrentUser();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
