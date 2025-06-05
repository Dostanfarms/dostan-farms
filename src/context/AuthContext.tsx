
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextProps {
  user: User | null;
  currentUser: User | null; // Add this for backward compatibility
  login: (username: string, password: string) => Promise<boolean>;
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

// Mock users for demo purposes
const mockUsers = [
  { id: '1', name: 'Admin User', email: 'admin@dostanfarms.com', role: 'admin' },
  { id: '2', name: 'Sales Executive', email: 'sales@dostanfarms.com', role: 'sales_executive' },
  { id: '3', name: 'Manager User', email: 'manager@dostanfarms.com', role: 'manager' }
];

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

  const login = async (username: string, password: string): Promise<boolean> => {
    console.log('Login attempt:', { username, password });
    
    // First check registered employees from localStorage
    const registeredEmployees = localStorage.getItem('registeredEmployees');
    let allUsers = [...mockUsers];
    
    if (registeredEmployees) {
      try {
        const employees = JSON.parse(registeredEmployees);
        console.log('Registered employees:', employees);
        // Ensure all registered employees have proper structure
        const formattedEmployees = employees.map((emp: any) => ({
          id: emp.id,
          name: emp.name,
          email: emp.email || `${emp.name.toLowerCase().replace(/\s+/g, '')}@dostanfarms.com`,
          role: emp.role || 'sales_executive'
        }));
        allUsers = [...allUsers, ...formattedEmployees];
      } catch (error) {
        console.error('Error parsing registered employees:', error);
      }
    }
    
    console.log('All users available for login:', allUsers);
    
    // Simple authentication - check both email and name
    const foundUser = allUsers.find(u => 
      u.email === username || 
      u.name.toLowerCase().replace(/\s+/g, '') === username.toLowerCase() ||
      u.name.toLowerCase() === username.toLowerCase()
    );
    
    console.log('Found user:', foundUser);
    
    if (foundUser && password === 'password') {
      console.log('Login successful for:', foundUser);
      setUser(foundUser);
      return true;
    }
    
    console.log('Login failed - no matching user or wrong password');
    return false;
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
    currentUser: user, // Provide currentUser as alias for backward compatibility
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
