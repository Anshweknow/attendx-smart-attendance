import { createContext, useContext, useEffect, useState } from 'react';
import { api, setUnauthorizedHandler } from '../services/api';
const AuthContext = createContext();
export const homeFor = (role) => `/${role.toLowerCase()}/dashboard`;
export function AuthProvider({ children }) {
 const [user, setUser] = useState(null); const [loading, setLoading] = useState(true); const [notice, setNotice] = useState('');
 const logout = (message = '') => { localStorage.removeItem('attendx_token'); localStorage.removeItem('attendx_user'); setUser(null); setNotice(message); };
 useEffect(() => { setUnauthorizedHandler(logout); const token = localStorage.getItem('attendx_token'); if (!token) return setLoading(false); api('/auth/me').then(setUser).catch(() => {}).finally(() => setLoading(false)); }, []);
 const login = async (email, password) => { const result = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); localStorage.setItem('attendx_token', result.token); localStorage.setItem('attendx_user', JSON.stringify(result.user)); setUser(result.user); setNotice(''); return result.user; };
 return <AuthContext.Provider value={{ user, loading, notice, setNotice, isAuthenticated: !!user, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
