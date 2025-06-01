export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const roles = [
  'admin',
  'manager',
  'sales_executive',
  'support_agent',
  'viewer'
];

export const initialEmployees: Employee[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'manager'
  },
  {
    id: '3',
    name: 'Robert Jones',
    email: 'robert.jones@example.com',
    role: 'sales_executive'
  },
  {
    id: '4',
    name: 'Emily White',
    email: 'emily.white@example.com',
    role: 'support_agent'
  },
  {
    id: '5',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    role: 'viewer'
  }
];

export const getAccessibleResources = (role: string): string[] => {
  const rolePermissions = {
    'admin': ['dashboard', 'farmers', 'customers', 'products', 'sales', 'transactions', 'employees', 'roles', 'coupons', 'tickets'],
    'manager': ['dashboard', 'farmers', 'customers', 'products', 'sales', 'transactions', 'coupons', 'tickets'],
    'sales_executive': ['dashboard', 'farmers', 'customers', 'products', 'sales', 'coupons'],
    'support_agent': ['dashboard', 'customers', 'tickets', 'coupons'],
    'viewer': ['dashboard', 'farmers', 'customers', 'products', 'sales', 'transactions']
  };

  return rolePermissions[role] || [];
};

export const hasPermission = (resource: string, action: string, userRole: string): boolean => {
  const accessibleResources = getAccessibleResources(userRole);
  return accessibleResources.includes(resource);
};
