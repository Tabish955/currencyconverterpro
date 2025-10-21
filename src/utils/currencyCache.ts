// Enhanced currency caching with IndexedDB fallback and performance optimizations
const CACHE_VERSION = '1.0';
const CACHE_EXPIRY = 3 * 60 * 1000; // 3 minutes for fresh rates
const FALLBACK_EXPIRY = 30 * 60 * 1000; // 30 minutes for fallback cache

interface CacheEntry {
  data: any;
  timestamp: number;
  version: string;
}

class CurrencyCache {
  private memoryCache = new Map<string, CacheEntry>();
  private dbName = 'CurrencyConverterCache';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.initDB();
  }

  private async initDB(): Promise<void> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return; // Skip IndexedDB in SSR or unsupported browsers
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.warn('IndexedDB failed to open, using memory cache only');
        resolve();
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('rates')) {
          db.createObjectStore('rates', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('currencies')) {
          db.createObjectStore('currencies', { keyPath: 'key' });
        }
      };
    });
  }

  private isExpired(entry: CacheEntry, maxAge: number = CACHE_EXPIRY): boolean {
    return Date.now() - entry.timestamp > maxAge;
  }

  private async getFromIndexedDB(storeName: string, key: string): Promise<CacheEntry | null> {
    if (!this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  }

  private async setToIndexedDB(storeName: string, key: string, entry: CacheEntry): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put({ key, ...entry });

      request.onsuccess = () => resolve();
      request.onerror = () => resolve(); // Fail silently
    });
  }

  async get(key: string, storeName: string = 'rates'): Promise<any | null> {
    // Wait for DB initialization
    if (this.initPromise) {
      await this.initPromise;
    }

    // Check memory cache first (fastest)
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      return memoryEntry.data;
    }

    // Check IndexedDB (persistent storage)
    const dbEntry = await this.getFromIndexedDB(storeName, key);
    if (dbEntry && !this.isExpired(dbEntry, FALLBACK_EXPIRY)) {
      // Update memory cache
      this.memoryCache.set(key, dbEntry);
      return dbEntry.data;
    }

    return null;
  }

  async set(key: string, data: any, storeName: string = 'rates'): Promise<void> {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION
    };

    // Set in memory cache (immediate)
    this.memoryCache.set(key, entry);

    // Wait for DB initialization
    if (this.initPromise) {
      await this.initPromise;
    }

    // Set in IndexedDB (persistent)
    await this.setToIndexedDB(storeName, key, entry);
  }

  async clear(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();

    // Clear IndexedDB
    if (this.db) {
      return new Promise((resolve) => {
        const transaction = this.db!.transaction(['rates', 'currencies'], 'readwrite');
        const ratesStore = transaction.objectStore('rates');
        const currenciesStore = transaction.objectStore('currencies');
        
        ratesStore.clear();
        currenciesStore.clear();
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => resolve(); // Fail silently
      });
    }
  }

  // Get cache size for monitoring
  getMemoryCacheSize(): number {
    return this.memoryCache.size;
  }

  // Cleanup expired entries from memory cache
  cleanup(): void {
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
      }
    }
  }
}

// Singleton instance
export const currencyCache = new CurrencyCache();

// Cleanup expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    currencyCache.cleanup();
  }, 5 * 60 * 1000);
}