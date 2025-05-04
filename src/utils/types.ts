
export interface Farmer {
  id: string;
  name: string;
  phone: string;
  address: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  dateJoined: Date;
  products: Product[];
  transactions: Transaction[];
  email: string;
  password: string;
  profilePhoto?: string;
  state: string;
  district: string;
  village: string;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  category: string;
  date: Date;
  farmerId: string;
}

export interface Transaction {
  id: string;
  amount: number;
  date: Date;
  type: 'credit' | 'debit';
  description: string;
  farmerId: string;
  settled: boolean;
  paymentMode?: 'Cash' | 'Online';
}

export interface DailyEarning {
  date: string;
  amount: number;
}

export interface MonthlyEarning {
  month: string;
  amount: number;
}

export interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
  unit: string;
  category: string;
}

export interface Customer {
  name: string;
  mobile: string;
  email?: string;
}

// Coupon system types
export interface Coupon {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  maxDiscountLimit?: number;
  expiryDate: Date;
}

// Role-based access control types
export type Role = 'admin' | 'manager' | 'sales' | 'accountant';

export interface Permission {
  resource: string;
  actions: ('view' | 'create' | 'edit' | 'delete')[];
}

export interface RolePermission {
  role: Role;
  permissions: Permission[];
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  profilePhoto?: string;
  dateJoined: Date;
  state?: string;
  district?: string;
  village?: string;
  accountHolderName?: string;
  accountNumber?: string;
  bankName?: string;
  ifscCode?: string;
}
