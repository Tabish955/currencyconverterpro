
import { useEffect, useState } from "react";
import { CurrencyCache } from "./CurrencyCache";
import CurrencyDropdown from "./CurrencyDropdown";
import CurrencyInput from "./CurrencyInput";
import ErrorDisplay from "./ErrorDisplay";
import LoadingState from "./LoadingState";
import { ArrowDownUp } from "lucide-react";

// Type definitions
export interface CurrencySymbol {
  code: string;
  description: string;
}

interface SymbolsResponse {
  rates: Record<string, number>;
  base_code: string;
  time_last_update_utc: string;
}

// Initialize cache
const symbolsCache = new CurrencyCache<CurrencySymbol[]>(24 * 60 * 60 * 1000); // 24 hours
const ratesCache = new CurrencyCache<number>(5 * 60 * 1000); // 5 minutes (reduced from 15 minutes)

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

        const response = await fetch("https://open.er-api.com/v6/latest/USD");
        
        if (!response.ok) {
          throw new Error(`Failed to fetch symbols: ${response.status}`);
        }
        
        const data: SymbolsResponse = await response.json();
        
        // Transform rates object into array of currency symbols
        const symbolsArray = Object.keys(data.rates).map(code => ({
          code,
          description: code // We don't get descriptions from this API, so we use the code
        }));
        
        // Sort alphabetically by code
        symbolsArray.sort((a, b) => a.code.localeCompare(b.code));
        
        // Update state and cache
        setSymbols(symbolsArray);
        symbolsCache.set("symbols", symbolsArray);
        setSymbolsError(null);
      } catch (error) {
        console.error("Error fetching currency symbols:", error);
        setSymbolsError(error instanceof Error ? error.message : "Failed to load currency symbols");
      } finally {
        setIsLoadingSymbols(false);
      }
    };

    fetchSymbols();
  }, []);

  // Fetch exchange rate when currencies change or when conversion is needed
  const fetchExchangeRate = async () => {
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
      if (cachedRate !== undefined) {
        setRate(cachedRate);
        
        // Update the correct amount based on which field was last changed
        if (lastChangedField === "base") {
          // Use precise math, only round for display
          setTargetAmount(parseFloat((baseAmount * cachedRate).toFixed(6)));
        } else {
          // Use precise math for reverse calculation
          setBaseAmount(parseFloat((targetAmount / cachedRate).toFixed(6)));
        }
        
        setLastUpdated(new Date());
        setIsLoadingRate(false);
        return;
      }
      
      // Fetch rate from API
      const response = await fetch(
        `https://open.er-api.com/v6/latest/${baseCurrency}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch rates: ${response.status}`);
      }
      
      const data: SymbolsResponse = await response.json();
      
      const newRate = data.rates[targetCurrency];
      
      if (!newRate) {
        throw new Error(`Rate not found for ${targetCurrency}`);
      }
      
      // Update state and cache
      setRate(newRate);
      ratesCache.set(cacheKey, newRate);
      
      // Update the correct amount based on which field was last changed
      if (lastChangedField === "base") {
        setTargetAmount(parseFloat((baseAmount * newRate).toFixed(6)));
      } else {
        setBaseAmount(parseFloat((targetAmount / newRate).toFixed(6)));
      }
      
      setLastUpdated(new Date(data.time_last_update_utc));
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      setRateError(error instanceof Error ? error.message : "Failed to load exchange rate");
    } finally {
      setIsLoadingRate(false);
    }
  };

  // Effect to trigger rate fetch when currencies change
  useEffect(() => {
    if (baseCurrency && targetCurrency) {
      fetchExchangeRate();
    }
  }, [baseCurrency, targetCurrency]);

  // Handle base amount change
  const handleBaseAmountChange = (value: number) => {
    setBaseAmount(value);
    setLastChangedField("base");
    
    // If rate is available, calculate target amount without waiting for API
    if (rate !== null) {
      // Use precise math, don't round until display
      setTargetAmount(parseFloat((value * rate).toFixed(6)));
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
      setBaseAmount(parseFloat((value / rate).toFixed(6)));
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
    
    // Don't change last changed field as the user initiated the swap
    // This ensures the proper calculation direction is maintained
  };

  // Manual rate refresh
  const handleRefreshRate = () => {
    // Force clear the cache for this currency pair
    const cacheKey = `${baseCurrency}-${targetCurrency}`;
    ratesCache.remove(cacheKey);
    
    // Fetch fresh rates
    fetchExchangeRate();
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
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Currency Converter</h2>
          
          {/* Base Currency Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="baseAmount" className="text-sm font-medium text-gray-600">
                From
              </label>
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
          
          {/* Currency Swap Button */}
          <div className="flex justify-center my-4">
            <button
              onClick={handleSwapCurrencies}
              disabled={isLoadingRate}
              className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors"
              aria-label="Swap currencies"
            >
              <ArrowDownUp className="h-5 w-5 text-blue-600" />
            </button>
          </div>
          
          {/* Target Currency Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="targetAmount" className="text-sm font-medium text-gray-600">
                To
              </label>
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
          
          {/* Exchange Rate and Last Updated */}
          <div className="mt-4 flex flex-col sm:flex-row sm:justify-between">
            {isLoadingRate ? (
              <p className="text-sm text-gray-500">Fetching latest rates...</p>
            ) : rateError ? (
              <div className="text-sm text-red-600">
                <span>{rateError}</span>
              </div>
            ) : rate ? (
              <div className="text-sm text-gray-500 flex flex-col sm:flex-row sm:justify-between w-full">
                <span>
                  1 {baseCurrency} = {rate.toFixed(4)} {targetCurrency}
                </span>
                {lastUpdated && (
                  <div className="flex items-center mt-1 sm:mt-0">
                    <span className="mr-2">Updated at {formattedLastUpdated}</span>
                    <button
                      onClick={handleRefreshRate}
                      className="text-blue-500 hover:text-blue-600 text-xs underline"
                      aria-label="Refresh rates"
                    >
                      Refresh
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
