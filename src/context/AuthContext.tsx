import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextProps {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  checkPermission: (resource: string, action: string) => boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface RolePermissions {
  [resource: string]: string[];
}

interface RolesConfig {
  [role: string]: RolePermissions;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const defaultRoles = {
  admin: {
    dashboard: ['view'],
    products: ['view', 'create', 'edit', 'delete'],
    sales: ['view', 'create', 'edit', 'delete'],
    customers: ['view', 'create', 'edit', 'delete'],
    farmers: ['view', 'create', 'edit', 'delete'],
    employees: ['view', 'create', 'edit', 'delete'],
    transactions: ['view', 'create', 'edit', 'delete'],
    tickets: ['view', 'create', 'edit', 'delete'],
    coupons: ['view', 'create', 'edit', 'delete'],
    roles: ['view', 'create', 'edit', 'delete']
  },
  sales_executive: {
    dashboard: ['view'],
    products: ['view'],
    sales: ['view', 'create'],
    customers: ['view', 'create'],
    farmers: ['view'],
    tickets: ['view', 'create'],
    coupons: ['view']
  },
  manager: {
    dashboard: ['view'],
    products: ['view', 'create', 'edit'],
    sales: ['view', 'create', 'edit'],
    customers: ['view', 'create', 'edit'],
    farmers: ['view', 'create', 'edit'],
    employees: ['view'],
    transactions: ['view'],
    tickets: ['view', 'create', 'edit'],
    coupons: ['view', 'create', 'edit']
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [roles, setRoles] = useState<RolesConfig>(defaultRoles);

  useEffect(() => {
    const storedRoles = localStorage.getItem('roles');
    if (storedRoles) {
      setRoles(JSON.parse(storedRoles));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (user: User) => {
    setUser(user);
  };

  const logout = () => {
    setUser(null);
  };

  const checkPermission = (resource: string, action: string): boolean => {
    if (!user) return false;
    const userRole = user.role;
    const rolePermissions = roles[userRole];

    if (!rolePermissions || !rolePermissions[resource]) {
      return false;
    }

    return rolePermissions[resource].includes(action);
  };

  const value: AuthContextProps = {
    user,
    login,
    logout,
    checkPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
