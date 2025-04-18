export type Role = 'admin' | 'cashier';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost_price?: number;
  barcode?: string;
  sku?: string;
  image_url?: string;
  category_id?: string;
  is_active?: boolean;
  stock_quantity?: number;
  created_at: string;
  updated_at?: string;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  subtotal: number;
  created_at: string;
  product?: Product;
}

export interface Transaction {
  id: string;
  user_id: string;
  customer_name?: string;
  customer_email?: string;
  subtotal: number;
  discount_amount?: number;
  tax_amount?: number;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'other';
  payment_status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at?: string;
  transaction_items?: TransactionItem[];
}

export interface StockAdjustment {
  id: string;
  product_id: string;
  adjustment_type: string;
  quantity: number;
  reason: string;
  notes?: string;
  created_at: string;
}

export interface Stock {
  id: string;
  product_id: string;
  quantity: number;
  low_stock_threshold?: number;
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  product: Product;
}

export interface ShoppingCart {
  items: CartItem[];
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  customer_name?: string;
  notes?: string;
}

export interface AppSettings {
  id: string;
  store_name?: string;
  store_address?: string;
  store_phone?: string;
  enable_tax?: boolean;
  tax_percentage?: number;
  created_at: string;
  updated_at?: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface SalesReport {
  date: string;
  sales: number;
  transactions: number;
  average: number;
}

export interface ProductSalesReport {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  total_sales: number;
}

export interface CategorySalesReport {
  category_id: string;
  category_name: string;
  quantity_sold: number;
  total_sales: number;
}
