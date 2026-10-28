import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [guestSession, setGuestSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication session or guest session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('resumate_auth_token');
        if (token) {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
            setIsGuest(false);
            setGuestSession(null);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          // Check if there is an active guest session in cookies/local token
          try {
            const guestRes = await authService.getGuestSessionStatus();
            if (guestRes && guestRes.isGuest) {
              setGuestSession(guestRes);
              setIsGuest(true);
              setUser({
                id: 'guest_' + (guestRes.guestToken ? guestRes.guestToken.substring(4, 12) : 'user'),
                name: 'Guest Candidate',
                email: 'guest@resumate.local',
                role: 'Guest Candidate',
                isGuest: true
              });
              setIsAuthenticated(false);
            } else {
              setUser(null);
              setIsAuthenticated(false);
              setIsGuest(false);
              setGuestSession(null);
            }
          } catch {
            setUser(null);
            setIsAuthenticated(false);
            setIsGuest(false);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(null);
        setIsAuthenticated(false);
        setIsGuest(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      setUser(res.user);
      setIsAuthenticated(true);
      setIsGuest(false);
      setGuestSession(null);
      localStorage.removeItem('resumate_guest_token');
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const res = await authService.register(userData);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (provider) => {
    setIsLoading(true);
    try {
      const res = await authService.socialLogin(provider);
      setUser(res.user);
      setIsAuthenticated(true);
      setIsGuest(false);
      setGuestSession(null);
      localStorage.removeItem('resumate_guest_token');
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setIsGuest(false);
    setGuestSession(null);
    localStorage.removeItem('resumate_guest_token');
  };

  const startGuestSession = async () => {
    setIsLoading(true);
    try {
      const res = await authService.startGuestSession();
      setGuestSession(res);
      setIsGuest(true);
      setUser({
        id: 'guest_' + (res.guestToken ? res.guestToken.substring(4, 12) : 'user'),
        name: 'Guest Candidate',
        email: 'guest@resumate.local',
        role: 'Guest Candidate',
        isGuest: true
      });
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const updateGuestSession = (updates) => {
    setGuestSession(prev => ({
      ...(prev || {}),
      ...updates
    }));
  };

  const verifyEmail = async (token, email) => {
    setIsLoading(true);
    try {
      const res = await authService.verifyEmail(token, email);
      if (res.user) {
        setUser(res.user);
        setIsAuthenticated(true);
        setIsGuest(false);
        setGuestSession(null);
        localStorage.removeItem('resumate_guest_token');
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async (email) => {
    return await authService.resendVerification(email);
  };

  const setAuthenticatedUser = (userData, token = null) => {
    if (token) {
      localStorage.setItem('resumate_auth_token', token);
    }
    if (userData) {
      localStorage.setItem('resumate_user_profile', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      setIsGuest(false);
      setGuestSession(null);
      localStorage.removeItem('resumate_guest_token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isGuest,
        guestSession,
        isLoading,
        login,
        register,
        verifyEmail,
        resendVerification,
        socialLogin,
        logout,
        startGuestSession,
        updateGuestSession,
        setUser,
        setAuthenticatedUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
