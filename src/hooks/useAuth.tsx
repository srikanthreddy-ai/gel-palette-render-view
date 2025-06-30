
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  username: string;
  role: string;
  privileges?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  hasAccess: (module: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default role permissions - fallback when no privileges from API
const defaultRolePermissions = {
  admin: ['dashboard', 'incentives', 'staff', 'reports', 'master_data', 'settings', 'users'],
  manager: ['dashboard', 'incentives', 'staff', 'reports', 'users'],
  user: ['dashboard', 'incentives'],
  hr: ['dashboard', 'staff', 'master_data', 'users']
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in via session storage
    const authToken = sessionStorage.getItem('authToken');
    const userName = sessionStorage.getItem('userName');
    const storedPrivileges = sessionStorage.getItem('userPrivileges');
    const storedUser = localStorage.getItem('user');
    
    if (authToken && userName) {
      // If we have session data, use it
      let userData: User;
      if (storedUser) {
        userData = JSON.parse(storedUser);
        // Update with privileges from session storage if available
        if (storedPrivileges) {
          userData.privileges = JSON.parse(storedPrivileges);
        }
      } else {
        userData = { 
          username: userName, 
          role: 'user',
          privileges: storedPrivileges ? JSON.parse(storedPrivileges) : []
        };
      }
      setUser(userData);
    } else if (storedUser) {
      // Fallback to localStorage for backward compatibility
      setUser(JSON.parse(storedUser));
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
    sessionStorage.removeItem('userPrivileges');
  };

  const hasAccess = (module: string): boolean => {
    if (!user) return false;
    
    // First check if user has privileges from API response
    if (user.privileges && user.privileges.length > 0) {
      console.log('Checking access for module:', module, 'User privileges:', user.privileges);
      return user.privileges.includes(module);
    }
    
    // Fallback to default role permissions
    const userPermissions = defaultRolePermissions[user.role as keyof typeof defaultRolePermissions] || [];
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
