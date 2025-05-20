
import { useEffect, useState, useCallback, useRef } from "react";
import { CurrencyCache } from "./CurrencyCache";
import CurrencyDropdown, { CurrencySymbol } from "./CurrencyDropdown";
import CurrencyInput from "./CurrencyInput";
import ErrorDisplay from "./ErrorDisplay";
import LoadingState from "./LoadingState";
import { ArrowDownUp, RefreshCw } from "lucide-react";
import { toast } from "sonner";

// Type definitions
interface SymbolsResponse {
  success: boolean;
  symbols: Record<string, string>;
}

interface RatesResponse {
  success: boolean;
  rates: Record<string, number>;
  base: string;
  date: string;
}

// Initialize cache
const symbolsCache = new CurrencyCache<CurrencySymbol[]>(24 * 60 * 60 * 1000); // 24 hours 
const ratesCache = new CurrencyCache<number>(5 * 60 * 1000); // 5 minutes

const CurrencyConverter = () => {
  // State for currency symbols
  const [symbols, setSymbols] = useState<CurrencySymbol[]>([]);
  const [isLoadingSymbols, setIsLoadingSymbols] = useState(true);
  const [symbolsError, setSymbolsError] = useState<string | null>(null);

  // State for selected currencies and amounts
  const [baseAmount, setBaseAmount] = useState(1);
  const [targetAmount, setTargetAmount] = useState(0);
  const [baseCurrency, setBaseCurrency] = useState("KWD"); // Set default to KWD (Kuwaiti Dinar)
  const [targetCurrency, setTargetCurrency] = useState("PKR"); // Set default to PKR (Pakistani Rupee)
  
  // Track which field was last changed to prevent ping-pong effect
  const [lastChangedField, setLastChangedField] = useState<"base" | "target">("base");

  // State for exchange rate
  const [rate, setRate] = useState<number | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Force refresh timer - ensure rates are updated regularly
  const [forceRefreshCounter, setForceRefreshCounter] = useState(0);
  
  // API endpoints for ExchangeRate.host API
  const SYMBOLS_API_URL = "https://api.exchangerate.host/symbols";
  const RATES_BASE_URL = "https://api.exchangerate.host/latest";

  // Set up auto refresh every 5 minutes
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      setForceRefreshCounter(prev => prev + 1);
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Fetch currency symbols
  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        // Check cache first
        const cachedSymbols = symbolsCache.get("symbols");
        if (cachedSymbols) {
          setSymbols(cachedSymbols);
          setIsLoadingSymbols(false);
          return;
        }

        const response = await fetch(SYMBOLS_API_URL);
        if (!response.ok) {
          throw new Error(`Failed to fetch symbols: ${response.status}`);
        }
        
        const data: SymbolsResponse = await response.json();
        
        if (data.success) {
          // Transform symbols into array of currency symbols
          const symbolsArray: CurrencySymbol[] = Object.entries(data.symbols).map(([code, name]) => ({
            code,
            description: name as string
          }));
          
          // Sort alphabetically by code
          symbolsArray.sort((a, b) => a.code.localeCompare(b.code));
          
          // Update state and cache
          setSymbols(symbolsArray);
          symbolsCache.set("symbols", symbolsArray);
          setSymbolsError(null);
        } else {
          throw new Error("API returned unsuccessful response");
        }
      } catch (error) {
        console.error("Error fetching currency symbols:", error);
        setSymbolsError(error instanceof Error ? error.message : "Failed to load currency symbols");
        toast.error("Failed to load currencies. Please try again.");
      } finally {
        setIsLoadingSymbols(false);
      }
    };

    fetchSymbols();
  }, []);

  // Fetch exchange rate when currencies change or when conversion is needed
  const fetchExchangeRate = useCallback(async () => {
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
      setRateError(null);
      
      // Generate cache key
      const cacheKey = `${baseCurrency}-${targetCurrency}`;
      
      // Check cache first
      const cachedRate = ratesCache.get(cacheKey);
      if (cachedRate !== null) {
        setRate(cachedRate);
        
        // Update amounts based on which field was last changed
        if (lastChangedField === "base") {
          setTargetAmount(parseFloat((baseAmount * cachedRate).toFixed(4)));
        } else {
          setBaseAmount(parseFloat((targetAmount / cachedRate).toFixed(4)));
        }
        
        setLastUpdated(new Date());
        setIsLoadingRate(false);
        return;
      }
      
      // Direct API call to ExchangeRate.host
      const url = `${RATES_BASE_URL}?base=${baseCurrency}&symbols=${targetCurrency}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch rates: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success !== false && data.rates && data.rates[targetCurrency]) {
        const newRate = data.rates[targetCurrency];
        
        // Update state and cache
        setRate(newRate);
        ratesCache.set(cacheKey, newRate);
        
        // Update the correct amount based on which field was last changed
        if (lastChangedField === "base") {
          setTargetAmount(parseFloat((baseAmount * newRate).toFixed(4)));
        } else {
          setBaseAmount(parseFloat((targetAmount / newRate).toFixed(4)));
        }
        
        // Set the current time as last updated time
        setLastUpdated(new Date());
        setRateError(null);
      } else {
        throw new Error(`Rate not found for ${targetCurrency}`);
      }
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      setRateError("Failed to load exchange rates. Please try again later.");
      toast.error("Failed to get current rates. Please try again.");
    } finally {
      setIsLoadingRate(false);
    }
  }, [baseAmount, baseCurrency, lastChangedField, targetAmount, targetCurrency]);

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
    fetchExchangeRate();
    
    toast.success("Refreshing exchange rates");
  };

  // Show loading state if we're still loading the initial symbols
  if (isLoadingSymbols) {
    return <LoadingState message="Loading currencies..." />;
  }

  // Show error if we failed to load symbols
  if (symbolsError) {
    return <ErrorDisplay message={symbolsError} />;
  }

  return (
    <div className="w-full">
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
            <span>Fetching latest rates...</span>
          </div>
        ) : rateError ? (
          <div className="text-red-600 flex items-center justify-center">
            <span>{rateError}</span>
            <button
              onClick={handleRefreshRate}
              className="ml-2 text-blue-500 hover:text-blue-600 underline"
              aria-label="Try again"
            >
              Try again
            </button>
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
                <span className="text-gray-500 mr-2">Updated {formattedLastUpdated}</span>
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
