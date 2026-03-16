import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';
import { logEvent, setUserId, setUserProperties } from '../utils/analytics';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        const res = await api.get('/auth/me');
        setUser(res.data);
      }
    } catch (e) {
      await AsyncStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem('access_token', res.data.access_token);
    const meRes = await api.get('/auth/me');
    setUser(meRes.data);

    // Google Analytics (Firebase) 로깅
    await setUserId(String(meRes.data.id));
    await setUserProperties({ role: meRes.data.role });
    await logEvent('login_success', { email, role: meRes.data.role });

    return meRes.data;
  };

  const register = async (payload) => {
    await api.post('/auth/register', payload);
    
    // Google Analytics (Firebase) 로깅
    await logEvent('register_success', { role: payload.role });

    return login(payload.email, payload.password);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
