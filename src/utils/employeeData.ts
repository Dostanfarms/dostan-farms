
import { Employee, Role, RolePermission } from './types';

// Mock employees data
export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '9876543210',
    password: 'password123',
    role: 'admin',
    dateJoined: new Date('2023-01-01')
  },
  {
    id: '2',
    name: 'Manager User',
    email: 'manager@example.com',
    phone: '8765432109',
    password: 'password123',
    role: 'manager',
    dateJoined: new Date('2023-02-15')
  },
  {
    id: '3',
    name: 'Sales User',
    email: 'sales@example.com',
    phone: '7654321098',
    password: 'password123',
    role: 'sales',
    dateJoined: new Date('2023-03-10')
  },
  {
    id: '4',
    name: 'Accountant User',
    email: 'accountant@example.com',
    phone: '6543210987',
    password: 'password123',
    role: 'accountant',
    dateJoined: new Date('2023-04-05')
  }
];

// Role-based permissions
export const rolePermissions: RolePermission[] = [
  {
    role: 'admin',
    permissions: [
      { resource: 'dashboard', actions: ['view'] },
      { resource: 'farmers', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'products', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'sales', actions: ['view', 'create'] },
      { resource: 'transactions', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'settlements', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'employees', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'roles', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'coupons', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'tickets', actions: ['view', 'create', 'edit', 'delete'] }
    ]
  },
  {
    role: 'manager',
    permissions: [
      { resource: 'dashboard', actions: ['view'] },
      { resource: 'farmers', actions: ['view', 'create', 'edit'] },
      { resource: 'products', actions: ['view', 'create', 'edit'] },
      { resource: 'sales', actions: ['view', 'create'] },
      { resource: 'transactions', actions: ['view'] },
      { resource: 'settlements', actions: ['view', 'create'] },
      { resource: 'employees', actions: ['view'] },
      { resource: 'roles', actions: ['view'] },
      { resource: 'coupons', actions: ['view', 'create', 'edit'] },
      { resource: 'tickets', actions: ['view', 'create'] }
    ]
  },
  {
    role: 'sales',
    permissions: [
      { resource: 'dashboard', actions: ['view'] },
      { resource: 'farmers', actions: ['view'] },
      { resource: 'products', actions: ['view'] },
      { resource: 'sales', actions: ['view', 'create'] },
      { resource: 'transactions', actions: [] },
      { resource: 'settlements', actions: [] },
      { resource: 'employees', actions: [] },
      { resource: 'roles', actions: [] },
      { resource: 'coupons', actions: ['view', 'create'] },
      { resource: 'tickets', actions: ['view', 'create'] }
    ]
  },
  {
    role: 'accountant',
    permissions: [
      { resource: 'dashboard', actions: ['view'] },
      { resource: 'farmers', actions: ['view'] },
      { resource: 'products', actions: [] },
      { resource: 'sales', actions: ['view'] },
      { resource: 'transactions', actions: ['view', 'create', 'edit'] },
      { resource: 'settlements', actions: ['view', 'create', 'edit'] },
      { resource: 'employees', actions: [] },
      { resource: 'roles', actions: [] },
      { resource: 'coupons', actions: ['view'] },
      { resource: 'tickets', actions: ['view'] }
    ]
  }
];

// Helper functions for role-based access control
export const hasPermission = (role: Role, resource: string, action: 'view' | 'create' | 'edit' | 'delete'): boolean => {
  const rolePermission = rolePermissions.find(rp => rp.role === role);
  if (!rolePermission) return false;
  
  const resourcePermission = rolePermission.permissions.find(p => p.resource === resource);
  if (!resourcePermission) return false;
  
  return resourcePermission.actions.includes(action);
};

export const getAccessibleResources = (role: Role): string[] => {
  const rolePermission = rolePermissions.find(rp => rp.role === role);
  if (!rolePermission) return [];
  
  return rolePermission.permissions
    .filter(p => p.actions.length > 0)
    .map(p => p.resource);
};
