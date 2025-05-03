
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
  category: string; // Added category field
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
