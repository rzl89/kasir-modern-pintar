
import { createContext, useContext, ReactNode } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@/lib/types';

interface OfflineCartContextType {
  processOfflineTransaction: (paymentMethod: 'cash' | 'card' | 'other') => Promise<Transaction | null>;
  isOnline: boolean;
  pendingTransactions: number;
  syncOfflineTransactions: () => Promise<boolean>;
}

const OfflineCartContext = createContext<OfflineCartContextType | undefined>(undefined);

export const OfflineCartProvider = ({ children }: { children: ReactNode }) => {
  const cart = useCart();
  const { toast } = useToast();
  const { 
    isOnline, 
    pendingTransactions, 
    saveTransactionOffline, 
    syncTransactions 
  } = useOfflineStatus({
    onSync: () => {
      toast({
        title: 'Transaksi tersinkronisasi',
        description: 'Transaksi offline berhasil dikirim ke server.',
      });
    }
  });

  // Process transaction with offline capability
  const processOfflineTransaction = async (paymentMethod: 'cash' | 'card' | 'other'): Promise<Transaction | null> => {
    // Try online processing first if online
    if (isOnline) {
      try {
        return await cart.processTransaction(paymentMethod);
      } catch (error) {
        console.error('Online transaction failed, falling back to offline:', error);
        // Fall back to offline if online processing fails
        return handleOfflineTransaction(paymentMethod);
      }
    } else {
      // Directly use offline processing if offline
      return handleOfflineTransaction(paymentMethod);
    }
  };

  // Handle offline transaction
  const handleOfflineTransaction = async (paymentMethod: 'cash' | 'card' | 'other'): Promise<Transaction | null> => {
    try {
      // Create a transaction object similar to what would be created online
      const offlineTransaction: Partial<Transaction> = {
        customer_name: cart.cart.customer_name,
        subtotal: cart.cart.subtotal,
        discount_amount: cart.cart.discount_amount,
        tax_amount: cart.cart.tax_amount,
        total_amount: cart.cart.total_amount,
        payment_method: paymentMethod,
        payment_status: 'completed',
        notes: cart.cart.notes,
        is_offline: true,
        created_at: new Date().toISOString(),
        // Generate temporary ID for offline use
        id: `offline_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        // Store all cart items
        transaction_items: cart.cart.items.map(item => ({
          product_id: item.product_id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.unit_price * item.quantity
        }))
      };

      // Save to IndexedDB
      await saveTransactionOffline(offlineTransaction);

      toast({
        title: 'Transaksi offline berhasil',
        description: 'Transaksi disimpan lokal dan akan disinkronkan ketika online.',
      });

      // Clear cart after offline transaction
      cart.clearCart();

      // Return the transaction object as if it came from the server
      return offlineTransaction as Transaction;
    } catch (error) {
      console.error('Offline transaction error:', error);
      toast({
        variant: 'destructive',
        title: 'Transaksi offline gagal',
        description: 'Terjadi kesalahan saat menyimpan transaksi offline.',
      });
      return null;
    }
  };

  return (
    <OfflineCartContext.Provider
      value={{
        processOfflineTransaction,
        isOnline,
        pendingTransactions,
        syncOfflineTransactions: syncTransactions
      }}
    >
      {children}
    </OfflineCartContext.Provider>
  );
};

export const useOfflineCart = () => {
  const context = useContext(OfflineCartContext);
  if (context === undefined) {
    throw new Error('useOfflineCart must be used within an OfflineCartProvider');
  }
  return context;
};
