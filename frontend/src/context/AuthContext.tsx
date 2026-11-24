import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  loading: boolean;
  login: (credentials: { username: string; password: string }, expectedRole?: UserRole) => Promise<void>;
  logout: () => void;
  sessionTimeoutWarning: boolean;
  resetSessionTimer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes inactivity timeout
const WARNING_BEFORE_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes warning

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('campus_auth_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionTimeoutWarning, setSessionTimeoutWarning] = useState<boolean>(false);

  // Check stored user on load
  useEffect(() => {
    async function initUser() {
      if (token) {
        try {
          const res = await api.getCurrentUser();
          setUser(res.user);
        } catch (err) {
          console.warn('Session expired or invalid, logging out');
          logout();
        }
      }
      setLoading(false);
    }
    initUser();
  }, [token]);

  // Inactivity detection
  useEffect(() => {
    if (!token) return;

    let warningTimer: NodeJS.Timeout;
    let logoutTimer: NodeJS.Timeout;

    const resetTimers = () => {
      setSessionTimeoutWarning(false);
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);

      warningTimer = setTimeout(() => {
        setSessionTimeoutWarning(true);
      }, INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_TIMEOUT_MS);

      logoutTimer = setTimeout(() => {
        alert('Your session has timed out due to inactivity for security. Please log in again.');
        logout();
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(evt => window.addEventListener(evt, resetTimers));
    resetTimers();

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      events.forEach(evt => window.removeEventListener(evt, resetTimers));
    };
  }, [token]);

  const login = async (credentials: { username: string; password: string }, expectedRole?: UserRole) => {
    setLoading(true);
    try {
      const res = await api.login(credentials);
      if (expectedRole && res.user?.role !== expectedRole) {
        throw new Error(`This account is registered as ${String(res.user?.role || 'an unknown role').replace('_', ' ')}, not ${expectedRole.replace('_', ' ')}. Please select the correct role.`);
      }
      localStorage.setItem('campus_auth_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };



  const logout = () => {
    localStorage.removeItem('campus_auth_token');
    setToken(null);
    setUser(null);
    setSessionTimeoutWarning(false);
  };

  const resetSessionTimer = () => {
    setSessionTimeoutWarning(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        loading,
        login,
        logout,
        sessionTimeoutWarning,
        resetSessionTimer
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
