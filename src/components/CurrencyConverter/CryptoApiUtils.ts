
import { toast } from "sonner";
import { retryWithBackoff, saveToCache, getFromCache } from "./ApiUtils";

// Cache keys for crypto data
export const CRYPTO_CACHE_KEYS = {
  COINS_LIST: 'currency-converter-crypto-list',
  PRICES_PREFIX: 'currency-converter-crypto-prices-',
  LAST_UPDATED: 'currency-converter-crypto-last-updated'
};

// CoinGecko API endpoints
export const CRYPTO_API_ENDPOINTS = {
  COINS_LIST: "https://api.coingecko.com/api/v3/coins/list",
  SIMPLE_PRICE: "https://api.coingecko.com/api/v3/simple/price"
};

// Type definitions for crypto data
export interface CryptoCoin {
  id: string;
  symbol: string;
  name: string;
  image?: string;
}

export interface CryptoPrice {
  [cryptoId: string]: {
    [currency: string]: number;
  };
}

// Top cryptocurrencies to include by default
export const TOP_CRYPTOS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "tether", symbol: "USDT", name: "Tether" },
  { id: "binancecoin", symbol: "BNB", name: "Binance Coin" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
  { id: "shiba-inu", symbol: "SHIB", name: "Shiba Inu" },
  { id: "litecoin", symbol: "LTC", name: "Litecoin" },
  { id: "polygon", symbol: "MATIC", name: "Polygon" },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink" },
  { id: "uniswap", symbol: "UNI", name: "Uniswap" }
];

// Map crypto symbols to their CoinGecko IDs
export const cryptoSymbolToId: Record<string, string> = TOP_CRYPTOS.reduce(
  (acc, crypto) => ({ ...acc, [crypto.symbol]: crypto.id }),
  {}
);

// Fetch list of available cryptocurrencies
export async function fetchCryptoList(): Promise<CryptoCoin[]> {
  try {
    // Check cache first
    const cachedCoins = getFromCache<CryptoCoin[]>(CRYPTO_CACHE_KEYS.COINS_LIST);
    if (cachedCoins && cachedCoins.length > 0) {
      return cachedCoins;
    }

    // Fetch with retry logic
    const coins = await retryWithBackoff<CryptoCoin[]>(async () => {
      const response = await fetch(CRYPTO_API_ENDPOINTS.COINS_LIST);
      if (!response.ok) {
        throw new Error(`Failed to fetch crypto list: ${response.status}`);
      }
      return response.json();
    });

    // Cache the result
    saveToCache(CRYPTO_CACHE_KEYS.COINS_LIST, coins);
    return coins;
  } catch (error) {
    console.error("Error fetching crypto list:", error);
    
    // If we can't fetch the full list, return the top cryptos
    return TOP_CRYPTOS;
  }
}

// Fetch cryptocurrency prices
export async function fetchCryptoPrices(
  cryptoIds: string[],
  currencies: string[]
): Promise<CryptoPrice> {
  if (cryptoIds.length === 0 || currencies.length === 0) {
    return {};
  }
  
  const cacheKey = `${CRYPTO_CACHE_KEYS.PRICES_PREFIX}${cryptoIds.join(',')}-${currencies.join(',')}`;
  
  try {
    // Check cache first (valid for 2 minutes)
    const cachedPrices = getFromCache<{data: CryptoPrice, timestamp: number}>(cacheKey);
    if (cachedPrices) {
      const now = Date.now();
      // Use cache if it's less than 2 minutes old
      if (now - cachedPrices.timestamp < 2 * 60 * 1000) {
        return cachedPrices.data;
      }
    }

    // Build URL with parameters
    const url = `${CRYPTO_API_ENDPOINTS.SIMPLE_PRICE}?ids=${cryptoIds.join(',')}&vs_currencies=${currencies.join(',')}`;
    
    // Fetch with retry logic
    const prices = await retryWithBackoff<CryptoPrice>(async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch crypto prices: ${response.status}`);
      }
      return response.json();
    });

    // Cache the result with timestamp
    saveToCache(cacheKey, { data: prices, timestamp: Date.now() });
    return prices;
  } catch (error) {
    console.error("Error fetching crypto prices:", error);
    
    // If we have cached data (even if expired), use it
    const cachedPrices = getFromCache<{data: CryptoPrice, timestamp: number}>(cacheKey);
    if (cachedPrices) {
      toast.warning("Using cached cryptocurrency prices");
      return cachedPrices.data;
    }
    
    throw error;
  }
}

// Convert cryptocurrency amount
export function convertCrypto(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  prices: CryptoPrice
): number {
  // If converting between the same currency
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Get IDs for crypto currencies
  const fromId = cryptoSymbolToId[fromCurrency];
  const toId = cryptoSymbolToId[toCurrency];

  // Case 1: Crypto to crypto
  if (fromId && toId) {
    // Need to convert via USD or another common base
    const fromInUsd = prices[fromId]?.usd;
    const toInUsd = prices[toId]?.usd;
    
    if (fromInUsd && toInUsd) {
      return amount * (fromInUsd / toInUsd);
    }
  }
  
  // Case 2: Crypto to fiat
  else if (fromId && !toId) {
    const rate = prices[fromId]?.[toCurrency.toLowerCase()];
    if (rate) {
      return amount * rate;
    }
  }
  
  // Case 3: Fiat to crypto
  else if (!fromId && toId) {
    const rate = prices[toId]?.[fromCurrency.toLowerCase()];
    if (rate) {
      return amount / rate;
    }
  }

  console.error("Could not convert between", fromCurrency, "and", toCurrency);
  return 0;
}

// Generate icon URL for a cryptocurrency
export function getCryptoIconUrl(cryptoId: string): string {
  return `https://assets.coingecko.com/coins/images/small/${cryptoId}.png`;
}

// Check if a currency is a cryptocurrency
export function isCryptoCurrency(code: string): boolean {
  return !!cryptoSymbolToId[code];
}
