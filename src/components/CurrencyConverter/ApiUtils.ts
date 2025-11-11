
import { toast } from "sonner";

/**
 * Retry a function with exponential backoff
 * @param fn The function to retry
 * @param retriesLeft Number of retries remaining
 * @param delay Initial delay in ms
 * @returns Promise resolving to the function result
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>, 
  retriesLeft = 3,
  delay = 500
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retriesLeft <= 0) {
      throw error;
    }
    
    // Wait with exponential backoff
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Retry with one less retry and doubled delay
    return retryWithBackoff(fn, retriesLeft - 1, delay * 2);
  }
}

/**
 * Cache namespace for currency data
 */
export const CACHE_KEYS = {
  SYMBOLS: 'currency-converter-symbols',
  RATES_PREFIX: 'currency-converter-rates-',
  LAST_UPDATED: 'currency-converter-last-updated'
};

/**
 * Save data to localStorage with timestamp
 */
export function saveToCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(CACHE_KEYS.LAST_UPDATED, new Date().toISOString());
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
}

/**
 * Get data from localStorage
 * @returns The cached data or null if not found
 */
export function getFromCache<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error retrieving from cache:', error);
    return null;
  }
}

/**
 * Get the last update timestamp for cached data
 */
export function getLastUpdateTime(): Date | null {
  try {
    const timestamp = localStorage.getItem(CACHE_KEYS.LAST_UPDATED);
    return timestamp ? new Date(timestamp) : null;
  } catch {
    return null;
  }
}

/**
 * Format a relative time (e.g., "5 minutes ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}

// New Exchange API endpoints (fawazahmed0)
export const API_ENDPOINTS = {
  CURRENCIES: "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json",
  RATES_BASE: "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies"
};
