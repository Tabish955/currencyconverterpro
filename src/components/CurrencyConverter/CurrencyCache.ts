
/**
 * A simple in-memory cache with expiration
 */
export class CurrencyCache<T> {
  private cache: Map<string, { value: T; expires: number }>;
  private defaultTtl: number;

  /**
   * Create a new cache
   * @param defaultTtl Default time-to-live in milliseconds
   */
  constructor(defaultTtl: number) {
    this.cache = new Map();
    this.defaultTtl = defaultTtl;
  }

  /**
   * Set a value in the cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Optional TTL in ms, defaults to the cache's default TTL
   */
  set(key: string, value: T, ttl?: number): void {
    const expires = Date.now() + (ttl ?? this.defaultTtl);
    this.cache.set(key, { value, expires });
  }

  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns The cached value or undefined if not found or expired
   */
  get(key: string): T | undefined {
    const item = this.cache.get(key);
    
    // Return undefined if the item doesn't exist or has expired
    if (!item || Date.now() > item.expires) {
      if (item) {
        this.cache.delete(key); // Clean up expired item
      }
      return undefined;
    }
    
    return item.value;
  }

  /**
   * Remove a value from the cache
   * @param key Cache key
   */
  remove(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cached values
   */
  clear(): void {
    this.cache.clear();
  }
}
