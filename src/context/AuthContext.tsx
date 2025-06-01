
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee } from '../utils/employeeData';
import { initialEmployees, rolePermissions } from '../utils/employeeData';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

type AuthContextType = {
  currentUser: Employee | null;
  login: (usernameOrEmail: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkPermission: (resource: string, action: 'view' | 'create' | 'edit' | 'delete') => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check for logged in user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentEmployee');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('Checking saved user:', parsedUser);
        
        // First check registered employees (new functionality)
        const registeredEmployeesStr = localStorage.getItem('registeredEmployees');
        const registeredEmployees = registeredEmployeesStr ? JSON.parse(registeredEmployeesStr) : [];
        
        // Look for the user in registered employees first, then in initial employees
        let employee = registeredEmployees.find((e: Employee) => e.id === parsedUser.id);
        
        if (!employee) {
          employee = initialEmployees.find(e => e.id === parsedUser.id);
        }
        
        if (employee) {
          console.log('Found employee:', employee);
          setCurrentUser(employee);
        } else {
          console.log('Employee not found, clearing saved user');
          localStorage.removeItem('currentEmployee');
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentEmployee');
      }
    }
  }, []);

  const login = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    console.log('Attempting login for:', usernameOrEmail);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // First check registered employees
    const registeredEmployeesStr = localStorage.getItem('registeredEmployees');
    const registeredEmployees = registeredEmployeesStr ? JSON.parse(registeredEmployeesStr) : [];
    
    // Look in registered employees first (check both email and username)
    let employee = registeredEmployees.find(
      (e: Employee) => (e.email === usernameOrEmail || e.name === usernameOrEmail) && e.password === password
    );
    
    // If not found, check initial employees (check both email and username)
    if (!employee) {
      employee = initialEmployees.find(e => 
        (e.email === usernameOrEmail || e.name === usernameOrEmail) && e.password === password
      );
    }
    
    console.log('Login result for', usernameOrEmail, ':', employee ? 'success' : 'failed');
    
    if (employee) {
      setCurrentUser(employee);
      localStorage.setItem('currentEmployee', JSON.stringify({
        id: employee.id,
        name: employee.name,
        role: employee.role
      }));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentEmployee');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out"
    });
    navigate('/employee-login');
  };

  const checkPermission = (resource: string, action: 'view' | 'create' | 'edit' | 'delete'): boolean => {
    if (!currentUser) return false;
    
    // Check if there are custom permissions stored in localStorage
    const storedPermissions = localStorage.getItem('rolePermissions');
    const permissionsToUse = storedPermissions ? JSON.parse(storedPermissions) : rolePermissions;
    
    const rolePermission = permissionsToUse.find((rp: any) => rp.role === currentUser.role);
    if (!rolePermission) return false;
    
    const resourcePermission = rolePermission.permissions.find((p: any) => p.resource === resource);
    if (!resourcePermission) return false;
    
    return resourcePermission.actions.includes(action);
  };

  const value = {
    currentUser,
    login,
    logout,
    checkPermission
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
