
import { useState, useEffect, useCallback } from 'react';
import { saveOfflineTransaction, getAllOfflineTransactions, clearOfflineTransaction, countOfflineTransactions } from '@/lib/offlineDb';

interface UseOfflineStatusProps {
  onSync?: () => void;
}

export function useOfflineStatus({ onSync }: UseOfflineStatusProps = {}) {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingTransactions, setPendingTransactions] = useState<number>(0);
  
  // Update online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncTransactions();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check pending transactions count on mount
    countOfflineTransactions()
      .then(count => setPendingTransactions(count))
      .catch(err => console.error('Error counting transactions:', err));
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Function to register for background sync
  const registerSync = useCallback(async () => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-transactions');
        return true;
      } catch (error) {
        console.error('Background sync registration error:', error);
        return false;
      }
    }
    return false;
  }, []);
  
  // Function to save transaction offline
  const saveTransactionOffline = useCallback(async (data: any) => {
    try {
      const id = await saveOfflineTransaction(data);
      // Update pending count
      const count = await countOfflineTransactions();
      setPendingTransactions(count);
      
      // Try to register for background sync
      registerSync().catch(console.error);
      
      return id;
    } catch (error) {
      console.error('Error saving transaction offline:', error);
      throw error;
    }
  }, [registerSync]);
  
  // Function to manually trigger sync
  const syncTransactions = useCallback(async () => {
    if (!navigator.onLine) {
      return false;
    }
    
    try {
      const transactions = await getAllOfflineTransactions();
      
      if (transactions.length === 0) {
        return true;
      }
      
      let syncSuccess = true;
      
      for (const transaction of transactions) {
        try {
          // Try to send the transaction to the server
          // This is a simplified example - you would replace this with your actual API call
          const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(transaction.data),
          });
          
          if (response.ok) {
            // If successful, remove from IndexedDB
            await clearOfflineTransaction(transaction.id);
          } else {
            syncSuccess = false;
          }
        } catch (error) {
          console.error('Error syncing transaction:', error);
          syncSuccess = false;
        }
      }
      
      // Update pending count
      const count = await countOfflineTransactions();
      setPendingTransactions(count);
      
      // Call onSync callback if provided
      if (onSync) {
        onSync();
      }
      
      return syncSuccess;
    } catch (error) {
      console.error('Sync error:', error);
      return false;
    }
  }, [onSync]);
  
  return {
    isOnline,
    pendingTransactions,
    saveTransactionOffline,
    syncTransactions,
  };
}
