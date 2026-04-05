import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { userApi } from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ id: decoded.sub, token });
      } catch (err) {
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = async (email, password) => {
    // Generate URL encoded form data format typical for OAuth2
    const params = new URLSearchParams();
    params.append('username', email); // FastAPI OAuth2PasswordRequestForm uses 'username'
    params.append('password', password);
    
    const res = await userApi.post('/login', params);
    const token = res.data.access_token;
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);
    setUser({ id: decoded.sub, token });
  };

  const register = async (email, password, fullName) => {
    await userApi.post('/register', { email, password, full_name: fullName });
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
