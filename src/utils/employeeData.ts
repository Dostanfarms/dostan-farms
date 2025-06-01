
export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  password?: string;
  state?: string;
  district?: string;
  village?: string;
  profilePhoto?: string;
  accountHolderName?: string;
  accountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  dateJoined?: Date;
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
    name: 'Admin User',
    email: 'admin',
    role: 'admin',
    password: 'admin@123'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'manager',
    password: 'manager123'
  },
  {
    id: '3',
    name: 'Employee One',
    email: 'employee1',
    role: 'sales_executive',
    password: 'emp@123'
  },
  {
    id: '4',
    name: 'Emily White',
    email: 'emily.white@example.com',
    role: 'support_agent',
    password: 'support123'
  },
  {
    id: '5',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    role: 'viewer',
    password: 'viewer123'
  }
];

// Export mockEmployees as alias for initialEmployees
export const mockEmployees = initialEmployees;

export interface RolePermission {
  role: string;
  permissions: {
    resource: string;
    actions: ('view' | 'create' | 'edit' | 'delete')[];
  }[];
}

export const rolePermissions: RolePermission[] = [
  {
    role: 'admin',
    permissions: [
      { resource: 'dashboard', actions: ['view'] },
      { resource: 'farmers', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'customers', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'products', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'sales', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'transactions', actions: ['view', 'create', 'edit', 'delete'] },
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
      { resource: 'customers', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'products', actions: ['view', 'create', 'edit'] },
      { resource: 'sales', actions: ['view', 'create', 'edit'] },
      { resource: 'transactions', actions: ['view'] },
      { resource: 'coupons', actions: ['view', 'create', 'edit'] },
      { resource: 'tickets', actions: ['view', 'create', 'edit'] }
    ]
  },
  {
    role: 'sales_executive',
    permissions: [
      { resource: 'dashboard', actions: ['view'] },
      { resource: 'farmers', actions: ['view', 'create'] },
      { resource: 'customers', actions: ['view', 'create', 'edit', 'delete'] },
      { resource: 'products', actions: ['view'] },
      { resource: 'sales', actions: ['view', 'create'] },
      { resource: 'coupons', actions: ['view'] }
    ]
  },
  {
    role: 'support_agent',
    permissions: [
      { resource: 'dashboard', actions: ['view'] },
      { resource: 'customers', actions: ['view', 'edit'] },
      { resource: 'tickets', actions: ['view', 'create', 'edit'] },
      { resource: 'coupons', actions: ['view'] }
    ]
  },
  {
    role: 'viewer',
    permissions: [
      { resource: 'dashboard', actions: ['view'] },
      { resource: 'farmers', actions: ['view'] },
      { resource: 'customers', actions: ['view'] },
      { resource: 'products', actions: ['view'] },
      { resource: 'sales', actions: ['view'] },
      { resource: 'transactions', actions: ['view'] }
    ]
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
