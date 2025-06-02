import { Employee, Product, Coupon } from './types';

// Employee management functions
export const saveEmployeesToLocalStorage = (employees: Employee[]): void => {
  try {
    localStorage.setItem('farmEmployees', JSON.stringify(employees));
  } catch (error) {
    console.error('Error saving employees to localStorage:', error);
  }
};

export const getEmployeesFromLocalStorage = (): Employee[] => {
  try {
    const storedEmployees = localStorage.getItem('farmEmployees');
    if (storedEmployees) {
      return JSON.parse(storedEmployees);
    }
    return [];
  } catch (error) {
    console.error('Error loading employees from localStorage:', error);
    return [];
  }
};

// Product management functions
export const saveProductsToLocalStorage = (products: Product[]): void => {
  try {
    localStorage.setItem('farmProducts', JSON.stringify(products));
  } catch (error) {
    console.error('Error saving products to localStorage:', error);
  }
};

export const getProductsFromLocalStorage = (): Product[] => {
  try {
    const storedProducts = localStorage.getItem('farmProducts');
    if (storedProducts) {
      const parsedProducts = JSON.parse(storedProducts);
      // Convert date strings back to Date objects
      return parsedProducts.map((product: any) => ({
        ...product,
        date: new Date(product.date)
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading products from localStorage:', error);
    return [];
  }
};

// Coupon management functions
export const saveCouponsToLocalStorage = (coupons: Coupon[]): void => {
  try {
    localStorage.setItem('farmCoupons', JSON.stringify(coupons));
  } catch (error) {
    console.error('Error saving coupons to localStorage:', error);
  }
};

export const getCouponsFromLocalStorage = (): Coupon[] => {
  try {
    const storedCoupons = localStorage.getItem('farmCoupons');
    if (storedCoupons) {
      const parsedCoupons = JSON.parse(storedCoupons);
      // Convert date strings back to Date objects
      return parsedCoupons.map((coupon: any) => ({
        ...coupon,
        expiryDate: new Date(coupon.expiryDate)
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading coupons from localStorage:', error);
    return [];
  }
};

// Helper functions
export const clearLocalStorage = (): void => {
  try {
    localStorage.clear();
    console.log('Local storage cleared successfully.');
  } catch (error) {
    console.error('Error clearing local storage:', error);
  }
};
