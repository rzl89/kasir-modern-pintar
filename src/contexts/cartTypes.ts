
import { Product, Transaction } from '@/lib/types';

// Define types without circular references
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

export interface CartContextType {
  cart: ShoppingCart;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartItem: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  applyDiscount: (amount: number) => void;
  addCustomerDetails: (customerName?: string, notes?: string) => void;
  processTransaction: (paymentMethod: 'cash' | 'card' | 'other') => Promise<Transaction | null>;
  loading: boolean;
}
