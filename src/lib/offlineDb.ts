
// IndexedDB database configuration
const DB_NAME = 'KasirPintarOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'offlineTransactions';

// Open the database connection
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject('Error opening IndexedDB');
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create the object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Save transaction to offline storage
export async function saveOfflineTransaction(data: any): Promise<number> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      // Add timestamp to the data
      const offlineData = {
        data,
        timestamp: new Date().toISOString()
      };
      
      const request = store.add(offlineData);
      
      request.onsuccess = () => {
        resolve(request.result as number);
        db.close();
      };
      
      request.onerror = () => {
        reject('Error saving offline transaction');
        db.close();
      };
    });
  } catch (error) {
    console.error('Save offline transaction error:', error);
    throw error;
  }
}

// Get all offline transactions
export async function getAllOfflineTransactions(): Promise<any[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
        db.close();
      };
      
      request.onerror = () => {
        reject('Error getting offline transactions');
        db.close();
      };
    });
  } catch (error) {
    console.error('Get offline transactions error:', error);
    return [];
  }
}

// Clear a specific offline transaction by ID
export async function clearOfflineTransaction(id: number): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve();
        db.close();
      };
      
      request.onerror = () => {
        reject('Error deleting offline transaction');
        db.close();
      };
    });
  } catch (error) {
    console.error('Clear offline transaction error:', error);
    throw error;
  }
}

// Count all pending offline transactions
export async function countOfflineTransactions(): Promise<number> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count();
      
      request.onsuccess = () => {
        resolve(request.result);
        db.close();
      };
      
      request.onerror = () => {
        reject('Error counting offline transactions');
        db.close();
      };
    });
  } catch (error) {
    console.error('Count offline transactions error:', error);
    return 0;
  }
}
