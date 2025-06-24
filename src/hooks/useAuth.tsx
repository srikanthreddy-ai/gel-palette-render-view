
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  hasAccess: (module: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default role permissions
const defaultRolePermissions = {
  admin: ['dashboard', 'incentives', 'staff', 'reports', 'master_data', 'settings'],
  manager: ['dashboard', 'incentives', 'staff', 'reports'],
  user: ['dashboard', 'incentives'],
  hr: ['dashboard', 'staff', 'master_data']
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [rolePermissions, setRolePermissions] = useState(defaultRolePermissions);

  useEffect(() => {
    // Check if user is logged in via session storage
    const authToken = sessionStorage.getItem('authToken');
    const userName = sessionStorage.getItem('userName');
    const storedUser = localStorage.getItem('user');
    
    if (authToken && userName) {
      // If we have session data, use it
      const userData = storedUser ? JSON.parse(storedUser) : { username: userName, role: 'user' };
      setUser(userData);
    } else if (storedUser) {
      // Fallback to localStorage for backward compatibility
      setUser(JSON.parse(storedUser));
    }

    // Load custom role permissions if available
    const storedPermissions = localStorage.getItem('rolePermissions');
    if (storedPermissions) {
      setRolePermissions(JSON.parse(storedPermissions));
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userName');
  };

  const hasAccess = (module: string): boolean => {
    if (!user) return false;
    const userPermissions = rolePermissions[user.role as keyof typeof rolePermissions] || [];
    return userPermissions.includes(module);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasAccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
