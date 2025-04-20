const CACHE_NAME = 'kasir-pintar-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/index.css',
  '/assets/index.js',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/maskable-icon.png'
];

// Install event - pre-cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Skip waiting on install');
        return self.skipWaiting();
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.filter((cacheName) => {
            return cacheName !== CACHE_NAME;
          }).map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // Handle API requests (stale-while-revalidate)
  if (requestUrl.pathname.startsWith('/api') || requestUrl.hostname.includes('supabase')) {
    event.respondWith(handleApiRequest(event.request));
  } 
  // Handle static assets (cache-first)
  else {
    event.respondWith(handleStaticAsset(event.request));
  }
});

// Cache-first strategy for static assets
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);
    // You could return a fallback response here
    return new Response('Network error happened', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Stale-while-revalidate strategy for API requests
async function handleApiRequest(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok && request.method === 'GET') {
        const cache = caches.open(CACHE_NAME);
        cache.then(cache => cache.put(request, networkResponse.clone()));
      }
      return networkResponse.clone();
    })
    .catch((error) => {
      console.error('[Service Worker] API fetch failed:', error);
      // Return null to indicate fetch failed
      return null;
    });
  
  // Return cached response immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

async function syncTransactions() {
  try {
    const db = await openDB();
    const transactions = await getAllOfflineTransactions(db);
    
    if (transactions.length === 0) {
      return;
    }
    
    for (const transaction of transactions) {
      try {
        // Try to send the transaction to the server
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(transaction.data)
        });
        
        if (response.ok) {
          // If successful, remove from IndexedDB
          await clearOfflineTransaction(db, transaction.id);
        }
      } catch (error) {
        console.error('[Service Worker] Sync transaction failed:', error);
        // Keep in IndexedDB for next sync attempt
      }
    }
    
    db.close();
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}

// Helper function to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('KasirPintarOfflineDB', 1);
    
    request.onerror = (event) => {
      reject('Error opening IndexedDB');
    };
    
    request.onsuccess = (event) => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offlineTransactions')) {
        db.createObjectStore('offlineTransactions', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Get all offline transactions
function getAllOfflineTransactions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineTransactions'], 'readonly');
    const store = transaction.objectStore('offlineTransactions');
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      reject('Error getting offline transactions');
    };
  });
}

// Clear an offline transaction by ID
function clearOfflineTransaction(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineTransactions'], 'readwrite');
    const store = transaction.objectStore('offlineTransactions');
    const request = store.delete(id);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      reject('Error deleting offline transaction');
    };
  });
}
