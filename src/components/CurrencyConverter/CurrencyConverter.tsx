
import { useEffect, useState, useCallback, useRef } from "react";
import { CurrencyCache } from "./CurrencyCache";
import CurrencyDropdown, { CurrencySymbol } from "./CurrencyDropdown";
import CurrencyInput from "./CurrencyInput";
import ErrorDisplay from "./ErrorDisplay";
import LoadingState from "./LoadingState";
import { ArrowDownUp, RefreshCw, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { 
  retryWithBackoff,
  saveToCache,
  getFromCache,
  getLastUpdateTime,
  formatRelativeTime,
  CACHE_KEYS
} from "./ApiUtils";

// Updated API endpoints for free access without API key
const SYMBOLS_API_URL = "https://openexchangerates.org/api/currencies.json";
const RATES_BASE_URL = "https://open.er-api.com/v6/latest";

// Type definitions
interface SymbolsResponse {
  [key: string]: string;
}

interface RatesResponse {
  result: string;
  base_code: string;
  time_last_update_utc: string;
  rates: Record<string, number>;
}

// Initialize cache
const symbolsCache = new CurrencyCache<CurrencySymbol[]>(24 * 60 * 60 * 1000); // 24 hours 
const ratesCache = new CurrencyCache<number>(5 * 60 * 1000); // 5 minutes

// Map ISO currency codes to country codes for flags
const currencyToCountryMap: Record<string, string> = {
  EUR: "eu", // European Union
  USD: "us", // United States
  JPY: "jp", // Japan
  GBP: "gb", // United Kingdom
  AUD: "au", // Australia
  CAD: "ca", // Canada
  CHF: "ch", // Switzerland
  CNY: "cn", // China
  HKD: "hk", // Hong Kong
  NZD: "nz", // New Zealand
  SEK: "se", // Sweden
  KRW: "kr", // South Korea
  SGD: "sg", // Singapore
  NOK: "no", // Norway
  MXN: "mx", // Mexico
  INR: "in", // India
  RUB: "ru", // Russia
  ZAR: "za", // South Africa
  TRY: "tr", // Turkey
  BRL: "br", // Brazil
  TWD: "tw", // Taiwan
  DKK: "dk", // Denmark
  PLN: "pl", // Poland
  THB: "th", // Thailand
  IDR: "id", // Indonesia
  HUF: "hu", // Hungary
  CZK: "cz", // Czech Republic
  ILS: "il", // Israel
  CLP: "cl", // Chile
  PHP: "ph", // Philippines
  AED: "ae", // United Arab Emirates
  COP: "co", // Colombia
  SAR: "sa", // Saudi Arabia
  MYR: "my", // Malaysia
  RON: "ro", // Romania
  // Add more mappings as needed
};

const CurrencyConverter = () => {
  // State for currency symbols
  const [symbols, setSymbols] = useState<CurrencySymbol[]>([]);
  const [isLoadingSymbols, setIsLoadingSymbols] = useState(true);
  const [symbolsError, setSymbolsError] = useState<string | null>(null);
  const [symbolsRetryAttempt, setSymbolsRetryAttempt] = useState(0);
  
  // State for offline mode
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // State for selected currencies and amounts
  const [baseAmount, setBaseAmount] = useState(1);
  const [targetAmount, setTargetAmount] = useState(0);
  const [baseCurrency, setBaseCurrency] = useState("USD"); // Default to USD
  const [targetCurrency, setTargetCurrency] = useState("EUR"); // Default to EUR
  
  // Track which field was last changed to prevent ping-pong effect
  const [lastChangedField, setLastChangedField] = useState<"base" | "target">("base");
  
  // State for exchange rate
  const [rate, setRate] = useState<number | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);
  const [rateRetryAttempt, setRateRetryAttempt] = useState(0);
  
  // Force refresh timer - ensure rates are updated regularly
  const [forceRefreshCounter, setForceRefreshCounter] = useState(0);
  
  // Set up auto refresh every 5 minutes
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      setForceRefreshCounter(prev => prev + 1);
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  // Fetch currency symbols
  const fetchSymbols = useCallback(async (retry = false) => {
    try {
      setIsLoadingSymbols(true);
      if (retry) setSymbolsRetryAttempt(prev => prev + 1);
      setSymbolsError(null);
      
      // Check cache first
      const cachedSymbols = symbolsCache.get("symbols") || getFromCache<CurrencySymbol[]>(CACHE_KEYS.SYMBOLS);
      if (cachedSymbols && !retry) {
        setSymbols(cachedSymbols);
        setIsLoadingSymbols(false);
        return;
      }
      
      // Fetch with retry logic
      const data = await retryWithBackoff<SymbolsResponse>(async () => {
        const response = await fetch(SYMBOLS_API_URL);
        if (!response.ok) {
          throw new Error(`Failed to fetch symbols: ${response.status}`);
        }
        return response.json();
      });
      
      // Transform symbols into array of currency symbols
      const symbolsArray: CurrencySymbol[] = Object.entries(data).map(([code, name]) => {
        // Find country code for flag
        const countryCode = currencyToCountryMap[code] || code.substring(0, 2).toLowerCase();
        
        return {
          code,
          description: name as string,
          countryCode
        };
      });
      
      // Sort alphabetically by code
      symbolsArray.sort((a, b) => a.code.localeCompare(b.code));
      
      // Update state and cache
      setSymbols(symbolsArray);
      symbolsCache.set("symbols", symbolsArray);
      saveToCache(CACHE_KEYS.SYMBOLS, symbolsArray);
      setSymbolsError(null);
      setIsOfflineMode(false);
      
    } catch (error) {
      console.error("Error fetching currency symbols:", error);
      
      // Try to get from localStorage as last resort
      const cachedSymbols = getFromCache<CurrencySymbol[]>(CACHE_KEYS.SYMBOLS);
      if (cachedSymbols && cachedSymbols.length > 0) {
        setSymbols(cachedSymbols);
        setIsOfflineMode(true);
        
        const lastUpdateTime = getLastUpdateTime();
        if (lastUpdateTime) setLastUpdated(lastUpdateTime);
        
        toast.warning("Using cached currency data. Some information may be outdated.");
      } else {
        setSymbolsError("Failed to load currency data. Please check your connection and try again.");
        toast.error("Unable to load currency data");
      }
    } finally {
      setIsLoadingSymbols(false);
      setSymbolsRetryAttempt(0);
    }
  }, []);
  
  // Fetch exchange rate when currencies change or when conversion is needed
  const fetchExchangeRate = useCallback(async (retry = false) => {
    // Don't fetch if currencies are the same
    if (baseCurrency === targetCurrency) {
      setRate(1);
      
      // Update amounts based on which field was last changed
      if (lastChangedField === "base") {
        setTargetAmount(baseAmount);
      } else {
        setBaseAmount(targetAmount);
      }
      
      setLastUpdated(new Date());
      return;
    }
    
    try {
      setIsLoadingRate(true);
      if (retry) setRateRetryAttempt(prev => prev + 1);
      setRateError(null);
      
      // Generate cache key
      const cacheKey = `${baseCurrency}-${targetCurrency}`;
      
      // Check in-memory cache first
      const cachedRate = ratesCache.get(cacheKey);
      if (cachedRate !== null && !retry) {
        setRate(cachedRate);
        updateAmounts(cachedRate);
        setLastUpdated(new Date());
        setIsLoadingRate(false);
        return;
      }
      
      // Check localStorage cache
      const localCacheKey = `${CACHE_KEYS.RATES_PREFIX}${cacheKey}`;
      const cachedRateData = !retry ? getFromCache<{rate: number, timestamp: string}>(localCacheKey) : null;
      
      if (cachedRateData && !retry) {
        setRate(cachedRateData.rate);
        updateAmounts(cachedRateData.rate);
        setLastUpdated(new Date(cachedRateData.timestamp));
        setIsLoadingRate(false);
        return;
      }
      
      // Fetch with retry logic
      const data = await retryWithBackoff<RatesResponse>(async () => {
        // Using Open Exchange Rates API which allows direct base-to-target conversion
        const url = `${RATES_BASE_URL}/${baseCurrency}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch rates: ${response.status}`);
        }
        
        return response.json();
      });
      
      if (data.result === "success" && data.rates && data.rates[targetCurrency]) {
        const newRate = data.rates[targetCurrency];
        
        // Update state and cache
        setRate(newRate);
        ratesCache.set(cacheKey, newRate);
        
        // Store in localStorage with timestamp
        const timestamp = new Date();
        saveToCache(localCacheKey, {
          rate: newRate,
          timestamp: timestamp.toISOString()
        });
        
        // Update the correct amount based on which field was last changed
        updateAmounts(newRate);
        
        // Set the current time as last updated time
        setLastUpdated(timestamp);
        setRateError(null);
        setIsOfflineMode(false);
      } else {
        throw new Error(`Rate not found for ${targetCurrency}`);
      }
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      
      // Try to get from localStorage as last resort
      const localCacheKey = `${CACHE_KEYS.RATES_PREFIX}${baseCurrency}-${targetCurrency}`;
      const cachedRateData = getFromCache<{rate: number, timestamp: string}>(localCacheKey);
      
      if (cachedRateData) {
        // Use cached data but show a notification
        setRate(cachedRateData.rate);
        updateAmounts(cachedRateData.rate);
        setLastUpdated(new Date(cachedRateData.timestamp));
        setIsOfflineMode(true);
        
        toast.warning(
          `Using cached exchange rates from ${formatRelativeTime(new Date(cachedRateData.timestamp))}`,
          { icon: <WifiOff className="h-4 w-4" /> }
        );
      } else {
        setRateError("Failed to load exchange rates. Please try again later.");
        toast.error("Unable to get current rates");
      }
    } finally {
      setIsLoadingRate(false);
      setRateRetryAttempt(0);
    }
  }, [baseAmount, baseCurrency, lastChangedField, targetAmount, targetCurrency]);
  
  // Helper function to update amounts based on the rate and which field was last changed
  const updateAmounts = (currentRate: number) => {
    if (lastChangedField === "base") {
      setTargetAmount(parseFloat((baseAmount * currentRate).toFixed(4)));
    } else {
      setBaseAmount(parseFloat((targetAmount / currentRate).toFixed(4)));
    }
  };
  
  // Initial load of symbols
  useEffect(() => {
    fetchSymbols();
  }, [fetchSymbols]);
  
  // Effect to trigger rate fetch when currencies change or the forceRefreshCounter changes
  useEffect(() => {
    if (baseCurrency && targetCurrency) {
      fetchExchangeRate();
    }
  }, [baseCurrency, targetCurrency, fetchExchangeRate, forceRefreshCounter]);
  
  // Handle base amount change
  const handleBaseAmountChange = (value: number) => {
    setBaseAmount(value);
    setLastChangedField("base");
    
    // If rate is available, calculate target amount without waiting for API
    if (rate !== null) {
      // Use precise math, then round for display only
      setTargetAmount(parseFloat((value * rate).toFixed(4)));
    } else {
      // Trigger rate fetch if needed
      fetchExchangeRate();
    }
  };
  
  // Handle target amount change
  const handleTargetAmountChange = (value: number) => {
    setTargetAmount(value);
    setLastChangedField("target");
    
    // If rate is available, calculate base amount without waiting for API
    if (rate !== null && rate !== 0) {
      // Use precise math for inverse calculation
      setBaseAmount(parseFloat((value / rate).toFixed(4)));
    } else {
      // Trigger rate fetch if needed
      fetchExchangeRate();
    }
  };
  
  // Handle currency changes
  const handleBaseCurrencyChange = (value: string) => {
    setBaseCurrency(value);
    setLastChangedField("base");
    // Rate fetch will be triggered by useEffect
  };
  
  const handleTargetCurrencyChange = (value: string) => {
    setTargetCurrency(value);
    setLastChangedField("target");
    // Rate fetch will be triggered by useEffect
  };
  
  // Format the last updated date
  const formattedLastUpdated = lastUpdated 
    ? lastUpdated.toLocaleTimeString(undefined, { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    : '';
  
  // Handle currency swap
  const handleSwapCurrencies = () => {
    // Swap currencies
    const tempBaseCurrency = baseCurrency;
    const tempTargetCurrency = targetCurrency;
    const tempBaseAmount = baseAmount;
    const tempTargetAmount = targetAmount;
    
    setBaseCurrency(tempTargetCurrency);
    setTargetCurrency(tempBaseCurrency);
    setBaseAmount(tempTargetAmount);
    setTargetAmount(tempBaseAmount);
  };
  
  // Manual rate refresh
  const handleRefreshRate = () => {
    // Force clear the cache for this currency pair
    const cacheKey = `${baseCurrency}-${targetCurrency}`;
    ratesCache.remove(cacheKey);
    
    // Fetch fresh rates
    fetchExchangeRate(true);
    
    toast.success("Refreshing exchange rates");
  };
  
  // If we're still loading the initial symbols and there's no error, show loading state
  if (isLoadingSymbols && !symbolsError) {
    return <LoadingState message="Loading currencies..." attempt={symbolsRetryAttempt || undefined} />;
  }
  
  // If we have a fatal error and no cached data, show the full error screen
  if (symbolsError && symbols.length === 0) {
    return <ErrorDisplay message={symbolsError} onRetry={() => fetchSymbols(true)} />;
  }
  
  return (
    <div className="w-full">
      {/* Offline mode banner */}
      {isOfflineMode && lastUpdated && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg animate-fade-in">
          <div className="flex items-center">
            <WifiOff className="h-4 w-4 text-amber-500 mr-2" />
            <span className="text-sm text-amber-700">
              Offline mode: showing last known rates from {formatRelativeTime(lastUpdated)}
            </span>
            <button
              onClick={() => {
                fetchSymbols(true);
                fetchExchangeRate(true);
              }}
              className="ml-auto text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-2 py-1 rounded-md transition-colors flex items-center"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Go online
            </button>
          </div>
        </div>
      )}
      
      {/* Rate error display (non-blocking) */}
      {rateError && (
        <ErrorDisplay 
          message={rateError} 
          onRetry={() => fetchExchangeRate(true)} 
          inline 
        />
      )}
      
      {/* Currency Converter Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Base Currency Column */}
        <div className="transition-all duration-300 hover:transform hover:translate-y-[-5px]">
          <div className="mb-3">
            <label htmlFor="baseAmount" className="block text-sm font-medium text-gray-700 mb-1">
              From
            </label>
            <div className="mb-2">
              <CurrencyDropdown
                id="baseCurrency"
                value={baseCurrency}
                onChange={handleBaseCurrencyChange}
                currencies={symbols}
                disabled={isLoadingRate}
              />
            </div>
            <CurrencyInput
              id="baseAmount"
              value={baseAmount}
              onChange={handleBaseAmountChange}
              currencyCode={baseCurrency}
              disabled={isLoadingRate}
            />
          </div>
        </div>
        
        {/* Swap Button (visible only on mobile) */}
        <div className="md:hidden flex justify-center my-2">
          <button
            onClick={handleSwapCurrencies}
            disabled={isLoadingRate}
            className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-pulse-gentle"
            aria-label="Swap currencies"
          >
            <ArrowDownUp className="h-5 w-5" />
          </button>
        </div>
        
        {/* Target Currency Column */}
        <div className="transition-all duration-300 hover:transform hover:translate-y-[-5px]">
          <div className="mb-3 relative">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700">
                To
              </label>
              
              {/* Swap Button (visible only on desktop) */}
              <button
                onClick={handleSwapCurrencies}
                disabled={isLoadingRate}
                className="hidden md:flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-all duration-300 transform hover:scale-105"
                aria-label="Swap currencies"
              >
                <ArrowDownUp className="h-4 w-4" />
                <span>Swap</span>
              </button>
            </div>
            
            <div className="mb-2">
              <CurrencyDropdown
                id="targetCurrency"
                value={targetCurrency}
                onChange={handleTargetCurrencyChange}
                currencies={symbols}
                disabled={isLoadingRate}
              />
            </div>
            <CurrencyInput
              id="targetAmount"
              value={targetAmount}
              onChange={handleTargetAmountChange}
              currencyCode={targetCurrency}
              disabled={isLoadingRate}
            />
          </div>
        </div>
      </div>
      
      {/* Exchange Rate and Last Updated */}
      <div className="mt-6 border-t border-gray-200 pt-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg backdrop-blur-sm animate-fade-in">
        {isLoadingRate ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin mr-2">
              <RefreshCw className="h-4 w-4" />
            </div>
            <span>Fetching latest rates{rateRetryAttempt > 0 ? ` (attempt ${rateRetryAttempt} of 3)` : ''}...</span>
          </div>
        ) : rate ? (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex items-center bg-white px-4 py-2 rounded-md shadow-sm animate-pulse-gentle">
              <span className="font-medium">
                1 {baseCurrency} = <span className="font-bold text-blue-700">{rate.toFixed(4)}</span> {targetCurrency}
              </span>
            </div>
            {lastUpdated && (
              <div className="flex items-center mt-2 sm:mt-0">
                <span className="text-gray-500 mr-2">
                  {isOfflineMode ? 'Cached' : 'Updated'} {formattedLastUpdated}
                </span>
                <button
                  onClick={handleRefreshRate}
                  className="text-blue-500 hover:text-blue-600 flex items-center bg-white px-3 py-1 rounded-md shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105"
                  aria-label="Refresh rates"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  <span>Refresh</span>
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CurrencyConverter;
