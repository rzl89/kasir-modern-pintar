// src/contexts/useCartState.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Product, Transaction } from '@/lib/types';
import type { CartItem, ShoppingCart } from './cartTypes';

const DEFAULT_CART: ShoppingCart = {
  items: [],
  subtotal: 0,
  discount_amount: 0,
  tax_amount: 0,
  total_amount: 0,
  customer_name: '',
  notes: '',
};

export function useCartState() {
  const [cart, setCart] = useState<ShoppingCart>(DEFAULT_CART);
  const [loading, setLoading] = useState(false);
  const [taxRate, setTaxRate] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  // load tax once
  useEffect(() => {
    supabase
      .from('settings')
      .select('tax_percentage')
      .eq('key', 'tax_percentage')
      .single()
      .then(res => {
        if (!res.error && typeof res.data?.tax_percentage === 'number') {
          setTaxRate(res.data.tax_percentage);
        }
      })
      .catch(() => setTaxRate(0));
  }, []);

  // recalc totals
  useEffect(() => {
    const subtotal = cart.items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
    const taxAmount = (subtotal - cart.discount_amount) * (taxRate / 100);
    setCart(prev => ({
      ...prev,
      subtotal,
      tax_amount: taxAmount,
      total_amount: subtotal - prev.discount_amount + taxAmount,
    }));
  }, [cart.items, cart.discount_amount, taxRate]);

  // action handlers (add, update, remove, clear, discount, customer, processTransaction)…
  // (copas implementasi lama, tanpa mengubah signature)

  return {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyDiscount,
    addCustomerDetails,
    processTransaction,
  };
}

