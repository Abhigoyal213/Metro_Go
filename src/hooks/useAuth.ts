import { useState, useEffect } from 'react';

interface User {
  name: string;
  phone: string;
  loginTime: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('metroUser');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('metroUser');
      }
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('metroUser');
    setUser(null);
  };

  const isAuthenticated = !!user;

  return { user, loading, isAuthenticated, logout };
}
