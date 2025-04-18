
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CartItem, Product, ShoppingCart, Transaction } from '@/lib/types';

interface CartContextType {
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

const DEFAULT_CART: ShoppingCart = {
  items: [],
  subtotal: 0,
  discount_amount: 0,
  tax_amount: 0,
  total_amount: 0,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<ShoppingCart>(DEFAULT_CART);
  const [loading, setLoading] = useState(false);
  const [taxRate, setTaxRate] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load tax rate from settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('tax_rate')
        .single();
      
      if (error) {
        console.error('Error fetching tax rate:', error);
      } else if (data) {
        setTaxRate(data.tax_rate);
      }
    };

    fetchSettings();
  }, []);

  // Recalculate totals whenever items change
  useEffect(() => {
    recalculateCart();
  }, [cart.items, taxRate]);

  const recalculateCart = () => {
    const subtotal = cart.items.reduce(
      (total, item) => total + item.unit_price * item.quantity,
      0
    );
    
    const taxAmount = (subtotal - cart.discount_amount) * (taxRate / 100);
    const totalAmount = subtotal - cart.discount_amount + taxAmount;

    setCart(prevCart => ({
      ...prevCart,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
    }));
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.items.findIndex(
        item => item.product_id === product.id
      );

      let updatedItems;

      if (existingItemIndex >= 0) {
        // Update existing item
        updatedItems = [...prevCart.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
      } else {
        // Add new item
        const newItem: CartItem = {
          product_id: product.id,
          quantity,
          unit_price: product.price,
          product,
        };
        updatedItems = [...prevCart.items, newItem];
      }

      return {
        ...prevCart,
        items: updatedItems,
      };
    });

    toast({
      title: 'Produk ditambahkan',
      description: `${quantity} ${product.name} ditambahkan ke keranjang.`,
    });
  };

  const updateCartItem = (productId: string, quantity: number) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.items.findIndex(
        item => item.product_id === productId
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...prevCart.items];

        if (quantity <= 0) {
          // Remove item if quantity is zero or negative
          updatedItems.splice(existingItemIndex, 1);
        } else {
          // Update quantity
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity,
          };
        }

        return {
          ...prevCart,
          items: updatedItems,
        };
      }

      return prevCart;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.items.findIndex(
        item => item.product_id === productId
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...prevCart.items];
        updatedItems.splice(existingItemIndex, 1);

        return {
          ...prevCart,
          items: updatedItems,
        };
      }

      return prevCart;
    });
  };

  const clearCart = () => {
    setCart(DEFAULT_CART);
  };

  const applyDiscount = (amount: number) => {
    if (amount < 0) {
      toast({
        variant: 'destructive',
        title: 'Diskon tidak valid',
        description: 'Nilai diskon tidak boleh negatif.',
      });
      return;
    }

    if (amount > cart.subtotal) {
      toast({
        variant: 'destructive',
        title: 'Diskon terlalu besar',
        description: 'Nilai diskon tidak boleh melebihi subtotal.',
      });
      return;
    }

    setCart(prevCart => ({
      ...prevCart,
      discount_amount: amount,
    }));
  };

  const addCustomerDetails = (customerName?: string, notes?: string) => {
    setCart(prevCart => ({
      ...prevCart,
      customer_name: customerName,
      notes,
    }));
  };

  const processTransaction = async (paymentMethod: 'cash' | 'card' | 'other'): Promise<Transaction | null> => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Tidak dapat memproses transaksi',
        description: 'Anda perlu login terlebih dahulu.',
      });
      return null;
    }

    if (cart.items.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Keranjang kosong',
        description: 'Tidak dapat memproses transaksi dengan keranjang kosong.',
      });
      return null;
    }

    try {
      setLoading(true);

      // Insert transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          cashier_id: user.id,
          customer_name: cart.customer_name,
          subtotal: cart.subtotal,
          discount_amount: cart.discount_amount,
          tax_amount: cart.tax_amount,
          total_amount: cart.total_amount,
          payment_method: paymentMethod,
          payment_status: 'completed',
          notes: cart.notes,
        })
        .select()
        .single();

      if (transactionError) {
        throw new Error(`Error creating transaction: ${transactionError.message}`);
      }

      const transaction = transactionData as Transaction;

      // Insert transaction items
      const transactionItems = cart.items.map(item => ({
        transaction_id: transaction.id,
        product_id: item.product_id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount || 0,
        subtotal: item.unit_price * item.quantity - (item.discount_amount || 0),
      }));

      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(transactionItems);

      if (itemsError) {
        throw new Error(`Error creating transaction items: ${itemsError.message}`);
      }

      // Update product stock quantities
      for (const item of cart.items) {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.product_id)
          .single();

        if (productError) {
          console.error(`Error fetching product ${item.product_id}:`, productError);
          continue;
        }

        const currentStock = productData.stock_quantity;
        const newStock = Math.max(0, currentStock - item.quantity);

        // Update product stock
        const { error: updateError } = await supabase
          .from('products')
          .update({ stock_quantity: newStock })
          .eq('id', item.product_id);

        if (updateError) {
          console.error(`Error updating product stock for ${item.product_id}:`, updateError);
          continue;
        }

        // Record stock adjustment
        const { error: adjustmentError } = await supabase
          .from('stock_adjustments')
          .insert({
            product_id: item.product_id,
            previous_quantity: currentStock,
            adjusted_quantity: -item.quantity,
            new_quantity: newStock,
            adjustment_type: 'sale',
            reason: `Transaction #${transaction.id}`,
            adjusted_by: user.id,
          });

        if (adjustmentError) {
          console.error(`Error creating stock adjustment for ${item.product_id}:`, adjustmentError);
        }
      }

      toast({
        title: 'Transaksi berhasil',
        description: `ID Transaksi: ${transaction.id}`,
      });

      // Clear cart after successful transaction
      clearCart();

      return transaction;
    } catch (error) {
      console.error('Transaction error:', error);
      toast({
        variant: 'destructive',
        title: 'Transaksi gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses transaksi',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        applyDiscount,
        addCustomerDetails,
        processTransaction,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
