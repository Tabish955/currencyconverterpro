
import { useEffect, useState, useCallback, useRef } from "react";
import { CurrencyCache } from "./CurrencyCache";
import CurrencyDropdown, { CurrencySymbol } from "./CurrencyDropdown";
import { getCountryCode } from "./currencyFlags";
import CurrencyInput from "./CurrencyInput";
import ErrorDisplay from "./ErrorDisplay";
import LoadingState from "./LoadingState";
import ExchangeRateChart from "./ExchangeRateChart";
import { ArrowDownUp, RefreshCw, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { 
  retryWithBackoff,
  saveToCache,
  getFromCache,
  getLastUpdateTime,
  formatRelativeTime,
  CACHE_KEYS,
  API_ENDPOINTS
} from "./ApiUtils";

// Type definitions
interface SymbolsResponse {
  [key: string]: string;
}

interface RatesResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
  time_last_updated: number;
}

// Initialize cache
const symbolsCache = new CurrencyCache<CurrencySymbol[]>(24 * 60 * 60 * 1000); // 24 hours 
const ratesCache = new CurrencyCache<Record<string, number>>(5 * 60 * 1000); // 5 minutes

// Country code lookup is now in currencyFlags.ts

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
  const [baseCurrency, setBaseCurrency] = useState("KWD"); // Default to KWD
  const [targetCurrency, setTargetCurrency] = useState("PKR"); // Default to PKR
  
  // Track which field was last changed to prevent ping-pong effect
  const [lastChangedField, setLastChangedField] = useState<"base" | "target">("base");
  
  // State for exchange rates
  const [rates, setRates] = useState<Record<string, number> | null>(null);
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
  
  // Fetch currency symbols from the cached source (we'll continue using the existing symbols API)
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
      
      // Fetch with retry logic from new API
      const data = await retryWithBackoff<SymbolsResponse>(async () => {
        const response = await fetch(API_ENDPOINTS.CURRENCIES);
        if (!response.ok) {
          throw new Error(`Failed to fetch symbols: ${response.status}`);
        }
        return response.json();
      });
      
      // Helper to title-case a currency name
      const titleCase = (str: string) =>
        str.replace(/\b\w/g, (c) => c.toUpperCase());

      // Transform symbols into array of currency symbols (uppercase codes, title-case names)
      const symbolsArray: CurrencySymbol[] = Object.entries(data).map(([code, name]) => {
        const upperCode = code.toUpperCase();
        const countryCode = getCountryCode(code);
        
        return {
          code: upperCode,
          description: titleCase((name as string) || code),
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
  
  // Fetch exchange rates using the new ExchangeRate-API
  const fetchExchangeRates = useCallback(async (base: string, retry = false) => {
    // Don't fetch if we're just comparing a currency to itself
    if (baseCurrency === targetCurrency) {
      const singleRate: Record<string, number> = {};
      singleRate[targetCurrency.toLowerCase()] = 1;
      setRates(singleRate);
      
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
      
      // Generate cache key based on the base currency
      const cacheKey = `rates-${base}`;
      
      // Check in-memory cache first
      const cachedRates = ratesCache.get(cacheKey);
      if (cachedRates !== undefined && !retry) {
        setRates(cachedRates);
        updateAmounts(cachedRates);
        setLastUpdated(new Date());
        setIsLoadingRate(false);
        return;
      }
      
      // Check localStorage cache
      const localCacheKey = `${CACHE_KEYS.RATES_PREFIX}${base}`;
      const cachedRateData = !retry ? getFromCache<{rates: Record<string, number>, timestamp: string}>(localCacheKey) : null;
      
      if (cachedRateData && !retry) {
        setRates(cachedRateData.rates);
        updateAmounts(cachedRateData.rates);
        setLastUpdated(new Date(cachedRateData.timestamp));
        setIsLoadingRate(false);
        return;
      }
      
      // Fetch with retry logic from the new API
      const data = await retryWithBackoff<any>(async () => {
        const url = `${API_ENDPOINTS.RATES_BASE}/${base.toLowerCase()}.json`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch rates: ${response.status}`);
        }
        
        return response.json();
      }, retry ? 1 : 2); // Only retry once if this is already a retry attempt
      
      // The new API returns data in format: { date: "2024-03-06", [currencyCode]: { [targetCode]: rate } }
      if (data && data[base.toLowerCase()]) {
        const rates = data[base.toLowerCase()];
        // Update state and cache
        setRates(rates);
        ratesCache.set(cacheKey, rates);
        
        // Store in localStorage with timestamp
        const timestamp = new Date();
        saveToCache(localCacheKey, {
          rates: rates,
          timestamp: timestamp.toISOString()
        });
        
        // Update the correct amount based on which field was last changed
        updateAmounts(rates);
        
        // Set the current time as last updated time
        setLastUpdated(timestamp);
        setRateError(null);
        setIsOfflineMode(false);
      } else {
        throw new Error(`Rates not found in API response`);
      }
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      
      // Try to get from localStorage as last resort
      const localCacheKey = `${CACHE_KEYS.RATES_PREFIX}${base}`;
      const cachedRateData = getFromCache<{rates: Record<string, number>, timestamp: string}>(localCacheKey);
      
      if (cachedRateData) {
        // Use cached data but show a notification
        setRates(cachedRateData.rates);
        updateAmounts(cachedRateData.rates);
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
  
  // Helper function to update amounts based on the rates and which field was last changed
  const updateAmounts = (currentRates: Record<string, number>) => {
    const targetKey = targetCurrency.toLowerCase();
    if (!currentRates[targetKey]) {
      console.error(`Rate not found for ${targetCurrency}`);
      return;
    }
    
    const currentRate = currentRates[targetKey];
    
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
    if (baseCurrency) {
      fetchExchangeRates(baseCurrency);
    }
  }, [baseCurrency, fetchExchangeRates, forceRefreshCounter]);
  
  // Handle base amount change
  const handleBaseAmountChange = (value: number) => {
    setBaseAmount(value);
    setLastChangedField("base");
    
    // If rates are available, calculate target amount without waiting for API
    const targetKey = targetCurrency.toLowerCase();
    if (rates !== null && rates[targetKey]) {
      // Use precise math, then round for display only
      setTargetAmount(parseFloat((value * rates[targetKey]).toFixed(4)));
    } else {
      // Trigger rate fetch if needed
      fetchExchangeRates(baseCurrency);
    }
  };
  
  // Handle target amount change
  const handleTargetAmountChange = (value: number) => {
    setTargetAmount(value);
    setLastChangedField("target");
    
    // If rates are available, calculate base amount without waiting for API
    const targetKey = targetCurrency.toLowerCase();
    if (rates !== null && rates[targetKey] !== 0) {
      // Use precise math for inverse calculation
      setBaseAmount(parseFloat((value / rates[targetKey]).toFixed(4)));
    } else {
      // Trigger rate fetch if needed
      fetchExchangeRates(baseCurrency);
    }
  };
  
  // Handle currency changes
  const handleBaseCurrencyChange = (value: string) => {
    setBaseCurrency(value);
    setBaseAmount(1); // Reset to 1 when changing currency
    setLastChangedField("base");
    // Rate fetch will be triggered by useEffect
  };
  
  const handleTargetCurrencyChange = (value: string) => {
    setTargetCurrency(value);
    setBaseAmount(1); // Reset to 1 when changing currency
    setLastChangedField("base");
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
    const cacheKey = `rates-${baseCurrency}`;
    ratesCache.remove(cacheKey);
    
    // Fetch fresh rates
    fetchExchangeRates(baseCurrency, true);
    
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
  
  // Calculate current rate for display
  const currentRate = rates && rates[targetCurrency.toLowerCase()] ? rates[targetCurrency.toLowerCase()] : null;
  
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
                fetchExchangeRates(baseCurrency, true);
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
          onRetry={() => fetchExchangeRates(baseCurrency, true)} 
          inline 
        />
      )}
      
      {/* Currency Converter Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-[50]">
        {/* Base Currency Column - higher z-index so its dropdown appears above target */}
        <div className="transition-all duration-300 hover:transform hover:translate-y-[-5px] relative z-[40]">
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
        <div className="transition-all duration-300 hover:transform hover:translate-y-[-5px] relative z-[10]">
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
      <div className="mt-6 border-t border-gray-200 pt-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg backdrop-blur-sm animate-fade-in relative z-[1]">
        {isLoadingRate ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin mr-2">
              <RefreshCw className="h-4 w-4" />
            </div>
            <span>Fetching latest rates{rateRetryAttempt > 0 ? ` (attempt ${rateRetryAttempt} of 3)` : ''}...</span>
          </div>
        ) : currentRate ? (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex items-center bg-white px-4 py-2 rounded-md shadow-sm animate-pulse-gentle">
              <span className="font-medium">
                1 {baseCurrency} = <span className="font-bold text-blue-700">{currentRate.toFixed(4)}</span> {targetCurrency}
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
      
      {/* Exchange Rate Chart */}
      {currentRate && <ExchangeRateChart baseCurrency={baseCurrency} targetCurrency={targetCurrency} currentRate={currentRate} />}
    </div>
  );
};

export default CurrencyConverter;
