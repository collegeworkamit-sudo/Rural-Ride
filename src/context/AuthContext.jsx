import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('transit-token'));
  const [loading, setLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch (error) {
        // Token invalid/expired — clear everything
        localStorage.removeItem('transit-token');
        localStorage.removeItem('transit-user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const register = async (name, email, password, role) => {
    const res = await api.post('/auth/register', {
      name,
      email,
      password,
      role,
    });

    const { token: newToken, user: newUser } = res.data;

    localStorage.setItem('transit-token', newToken);
    localStorage.setItem('transit-user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);

    return res.data;
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });

    const { token: newToken, user: newUser } = res.data;

    localStorage.setItem('transit-token', newToken);
    localStorage.setItem('transit-user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);

    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('transit-token');
    localStorage.removeItem('transit-user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
