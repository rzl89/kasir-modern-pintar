
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
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('key', 'tax_percentage')
          .single();
        
        if (error) {
          console.error('Error fetching tax rate:', error);
          return;
        }
        
        if (data && data.value) {
          try {
            // Handle parsing the value which could be a number or string
            const value = typeof data.value === 'string' 
              ? JSON.parse(data.value) 
              : data.value;
            
            setTaxRate(value.percentage || 0);
          } catch (e) {
            console.error('Error parsing tax rate:', e);
            setTaxRate(0);
          }
        }
      } catch (error) {
        console.error('Unexpected error fetching tax settings:', error);
        setTaxRate(0);
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
    // Validasi stok
    if (!product.stock_quantity || product.stock_quantity <= 0) {
      toast({
        variant: 'destructive',
        title: 'Stok kosong',
        description: `${product.name} tidak tersedia dalam stok`,
      });
      return;
    }

    setCart(prevCart => {
      const existingItemIndex = prevCart.items.findIndex(
        item => item.product_id === product.id
      );

      let updatedItems;

      if (existingItemIndex >= 0) {
        // Update existing item
        const currentItem = prevCart.items[existingItemIndex];
        const newQuantity = currentItem.quantity + quantity;
        
        // Validasi agar tidak melebihi stok yang tersedia
        if (newQuantity > (product.stock_quantity || 0)) {
          toast({
            variant: 'destructive',
            title: 'Stok tidak cukup',
            description: `Stok ${product.name} hanya tersisa ${product.stock_quantity}`,
          });
          return prevCart;
        }
        
        updatedItems = [...prevCart.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newQuantity,
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
        const currentItem = updatedItems[existingItemIndex];
        
        if (quantity <= 0) {
          // Remove item if quantity is zero or negative
          updatedItems.splice(existingItemIndex, 1);
        } else {
          // Validasi stok sebelum update
          if (quantity > (currentItem.product.stock_quantity || 0)) {
            toast({
              variant: 'destructive',
              title: 'Stok tidak cukup',
              description: `Stok ${currentItem.product.name} hanya tersisa ${currentItem.product.stock_quantity}`,
            });
            return prevCart;
          }
          
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
      console.log('Starting transaction processing...');

      // Insert transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          customer_name: cart.customer_name,
          subtotal: cart.subtotal,
          discount_amount: cart.discount_amount,
          tax_amount: cart.tax_amount,
          total_amount: cart.total_amount,
          payment_method: paymentMethod,
          payment_status: 'completed',
          notes: cart.notes,
        })
        .select();

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
        throw new Error(`Error creating transaction: ${transactionError.message}`);
      }

      if (!transactionData || transactionData.length === 0) {
        throw new Error('No transaction data returned after insert');
      }

      const transaction = transactionData[0] as Transaction;
      console.log('Transaction created:', transaction.id);

      // Insert transaction items
      const transactionItems = cart.items.map(item => ({
        transaction_id: transaction.id,
        product_id: item.product_id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.unit_price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(transactionItems);

      if (itemsError) {
        console.error('Error creating transaction items:', itemsError);
        throw new Error(`Error creating transaction items: ${itemsError.message}`);
      }

      console.log('Transaction items created, updating stock...');

      // Update product stock quantities
      for (const item of cart.items) {
        try {
          // Fetch current stock
          const { data: stockData, error: stockError } = await supabase
            .from('stock')
            .select('quantity, id')
            .eq('product_id', item.product_id)
            .single();

          if (stockError) {
            console.error(`Error fetching stock for product ${item.product_id}:`, stockError);
            continue;
          }

          if (!stockData) {
            // Create new stock record if it doesn't exist
            await supabase
              .from('stock')
              .insert({
                product_id: item.product_id,
                quantity: Math.max(0, (item.product.stock_quantity || 0) - item.quantity),
                low_stock_threshold: 10,
              });
            
            console.log(`Created new stock record for product ${item.product_id}`);
            continue;
          }

          const currentStock = stockData.quantity || 0;
          const newStock = Math.max(0, currentStock - item.quantity);
          
          console.log(`Updating stock for ${item.product.name}: ${currentStock} → ${newStock}`);

          // Update stock quantity
          const { error: updateError } = await supabase
            .from('stock')
            .update({ 
              quantity: newStock,
              updated_at: new Date().toISOString()
            })
            .eq('id', stockData.id);

          if (updateError) {
            console.error(`Error updating stock for ${item.product_id}:`, updateError);
          }

          // Add stock adjustment record for tracking
          const { error: adjustmentError } = await supabase
            .from('stock_adjustments')
            .insert({
              product_id: item.product_id,
              adjustment_type: 'sale',
              quantity: item.quantity,
              reason: 'Penjualan',
              notes: `Transaction ID: ${transaction.id}`,
            });

          if (adjustmentError) {
            console.error(`Error creating stock adjustment for ${item.product_id}:`, adjustmentError);
          }
        } catch (error) {
          console.error(`Error processing stock update for ${item.product_id}:`, error);
        }
      }

      console.log('Transaction completed successfully');
      
      // Fetch complete transaction data with items
      const { data: completeTransaction, error: fetchError } = await supabase
        .from('transactions')
        .select(`
          *,
          transaction_items(*)
        `)
        .eq('id', transaction.id)
        .single();

      if (fetchError) {
        console.error('Error fetching complete transaction:', fetchError);
      }

      toast({
        title: 'Transaksi berhasil',
        description: `ID Transaksi: ${transaction.id}`,
      });

      // Clear cart after successful transaction
      clearCart();

      return completeTransaction as Transaction;
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
