
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee } from '../utils/employeeData';
import { mockEmployees, rolePermissions } from '../utils/employeeData';
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
        // First check registered employees (new functionality)
        const registeredEmployeesStr = localStorage.getItem('registeredEmployees');
        const registeredEmployees = registeredEmployeesStr ? JSON.parse(registeredEmployeesStr) : [];
        
        // Look for the user in registered employees first, then in mock employees
        let employee = registeredEmployees.find((e: Employee) => e.id === parsedUser.id);
        
        if (!employee) {
          employee = mockEmployees.find(e => e.id === parsedUser.id);
        }
        
        if (employee) {
          setCurrentUser(employee);
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentEmployee');
      }
    }
  }, []);

  const login = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // First check registered employees
    const registeredEmployeesStr = localStorage.getItem('registeredEmployees');
    const registeredEmployees = registeredEmployeesStr ? JSON.parse(registeredEmployeesStr) : [];
    
    // Look in registered employees first (check both email and username)
    let employee = registeredEmployees.find(
      (e: Employee) => (e.email === usernameOrEmail || e.name === usernameOrEmail) && e.password === password
    );
    
    // If not found, check mock employees (check both email and username)
    if (!employee) {
      employee = mockEmployees.find(e => 
        (e.email === usernameOrEmail || e.name === usernameOrEmail) && e.password === password
      );
    }
    
    if (employee) {
      setCurrentUser(employee);
      localStorage.setItem('currentEmployee', JSON.stringify({
        id: employee.id,
        name: employee.name,
        role: employee.role
      }));
      toast({
        title: "Login successful",
        description: `Welcome back, ${employee.name}!`
      });
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
