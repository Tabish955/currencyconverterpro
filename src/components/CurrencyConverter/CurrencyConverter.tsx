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

interface CurrencyConverterProps {
  mode?: "fiat"; // Only fiat mode is supported now
}

// Initialize cache
const symbolsCache = new CurrencyCache<CurrencySymbol[]>(24 * 60 * 60 * 1000); // 24 hours 
const ratesCache = new CurrencyCache<Record<string, number>>(5 * 60 * 1000); // 5 minutes

// Map ISO currency codes to country codes for flags - ensure complete coverage
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
  PKR: "pk", // Pakistan
  BDT: "bd", // Bangladesh
  VND: "vn", // Vietnam
  UAH: "ua", // Ukraine
  NGN: "ng", // Nigeria
  EGP: "eg", // Egypt
  KZT: "kz", // Kazakhstan
  QAR: "qa", // Qatar
  DZD: "dz", // Algeria
  KWD: "kw", // Kuwait
  LKR: "lk", // Sri Lanka
  OMR: "om", // Oman
  JOD: "jo", // Jordan
  MAD: "ma", // Morocco
  BHD: "bh", // Bahrain
  XAF: "cf", // Central African Republic (CFA Franc)
  XOF: "sn", // Senegal (West African CFA Franc)
  XPF: "pf", // French Polynesia (CFP Franc)
  TND: "tn", // Tunisia
  GHS: "gh", // Ghana
  UGX: "ug", // Uganda
  TZS: "tz", // Tanzania
  KES: "ke", // Kenya
  XCD: "ag", // Antigua and Barbuda (East Caribbean Dollar)
  BBD: "bb", // Barbados
  BSD: "bs", // Bahamas
  BZD: "bz", // Belize
  BMD: "bm", // Bermuda
  BOB: "bo", // Bolivia
  PYG: "py", // Paraguay
  PEN: "pe", // Peru
  UYU: "uy", // Uruguay
  DOP: "do", // Dominican Republic
  GTQ: "gt", // Guatemala
  HNL: "hn", // Honduras
  NIO: "ni", // Nicaragua
  CRC: "cr", // Costa Rica
  PAB: "pa", // Panama
  JMD: "jm", // Jamaica
  TTD: "tt", // Trinidad and Tobago
  AWG: "aw", // Aruba
  ANG: "cw", // Curaçao
  SRD: "sr", // Suriname
  GYD: "gy", // Guyana
  FJD: "fj", // Fiji
  PGK: "pg", // Papua New Guinea
  TOP: "to", // Tonga
  SBD: "sb", // Solomon Islands
  VUV: "vu", // Vanuatu
  WST: "ws", // Samoa
  KID: "ki", // Kiribati
  BND: "bn", // Brunei
  FKP: "fk", // Falkland Islands
  GIP: "gi", // Gibraltar
  SHP: "sh", // Saint Helena
  SSP: "ss", // South Sudan
  SDG: "sd", // Sudan
  SYP: "sy", // Syria
  LBP: "lb", // Lebanon
  IRR: "ir", // Iran
  IQD: "iq", // Iraq
  LYD: "ly", // Libya
  YER: "ye", // Yemen
  MRU: "mr", // Mauritania
  ETB: "et", // Ethiopia
  SOS: "so", // Somalia
  DJF: "dj", // Djibouti
  ERN: "er", // Eritrea
  SZL: "sz", // Eswatini
  LSL: "ls", // Lesotho
  NAD: "na", // Namibia
  BWP: "bw", // Botswana
  MWK: "mw", // Malawi
  ZMW: "zm", // Zambia
  MZN: "mz", // Mozambique
  MDL: "md", // Moldova
  ALL: "al", // Albania
  MKD: "mk", // North Macedonia
  BAM: "ba", // Bosnia and Herzegovina
  RSD: "rs", // Serbia
  BGN: "bg", // Bulgaria
  HRK: "hr", // Croatia
  ISK: "is", // Iceland
  GEL: "ge", // Georgia
  AZN: "az", // Azerbaijan
  ARM: "am", // Armenia
  BYN: "by", // Belarus
  UZS: "uz", // Uzbekistan
  TMT: "tm", // Turkmenistan
  TJS: "tj", // Tajikistan
  KGS: "kg", // Kyrgyzstan
  MNT: "mn", // Mongolia
  MVR: "mv", // Maldives
  NPR: "np", // Nepal
  BTN: "bt", // Bhutan
  BIF: "bi", // Burundi
  RWF: "rw", // Rwanda
  SLL: "sl", // Sierra Leone
  GMD: "gm", // Gambia
  GNF: "gn", // Guinea
  XAU: "un", // Gold - UN flag
  XAG: "un", // Silver - UN flag
  XDR: "un", // SDR - UN flag
  // Additional mappings for comprehensive coverage
  AFN: "af", // Afghanistan
  AOA: "ao", // Angola
  ARS: "ar", // Argentina
  CVE: "cv", // Cape Verde
  CDF: "cd", // Democratic Republic of the Congo
  KHR: "kh", // Cambodia
  KYD: "ky", // Cayman Islands
  CLF: "cl", // Chilean UF
  CUP: "cu", // Cuba
  CUC: "cu", // Cuban Convertible Peso
  MGA: "mg", // Madagascar
  LAK: "la", // Laos
  MMK: "mm", // Myanmar
  STN: "st", // São Tomé and Príncipe
  SCR: "sc", // Seychelles
  VES: "ve", // Venezuela
  ZWL: "zw" // Zimbabwe
};

// Keep recent currencies for quick access
interface RecentlyUsedState {
  items: string[];
  lastUpdated: number;
}

const MAX_RECENT_ITEMS = 5;
const RECENT_CACHE_KEY = "recently-used-currencies";

const CurrencyConverter = ({ mode = "fiat" }: CurrencyConverterProps) => {
  // State for currency symbols
  const [symbols, setSymbols] = useState<CurrencySymbol[]>([]);
  const [isLoadingSymbols, setIsLoadingSymbols] = useState(true);
  const [symbolsError, setSymbolsError] = useState<string | null>(null);
  const [symbolsRetryAttempt, setSymbolsRetryAttempt] = useState(0);
  
  // State for offline mode
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // State for selected currencies and amounts
  const [baseAmount, setBaseAmount] = useState(1); // Always default to 1
  const [targetAmount, setTargetAmount] = useState(0);
  const [baseCurrency, setBaseCurrency] = useState("USD"); // Default to USD
  const [targetCurrency, setTargetCurrency] = useState("EUR"); // Default to EUR
  
  // Track which field was last changed to prevent ping-pong effect
  const [lastChangedField, setLastChangedField] = useState<"base" | "target">("base");
  
  // State for recently used currencies
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  
  // State for exchange rates
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);
  const [rateRetryAttempt, setRateRetryAttempt] = useState(0);
  
  // Force refresh timer - ensure rates are updated regularly
  const [forceRefreshCounter, setForceRefreshCounter] = useState(0);
  
  // Load recently used currencies from localStorage on initial load
  useEffect(() => {
    try {
      const savedRecent = localStorage.getItem(RECENT_CACHE_KEY);
      if (savedRecent) {
        const parsed: RecentlyUsedState = JSON.parse(savedRecent);
        // Check if data is too old (older than 30 days)
        const isExpired = Date.now() - parsed.lastUpdated > 30 * 24 * 60 * 60 * 1000;
        if (!isExpired && Array.isArray(parsed.items)) {
          setRecentlyUsed(parsed.items.slice(0, MAX_RECENT_ITEMS));
        }
      }
    } catch (e) {
      console.error("Error loading recently used currencies:", e);
    }
  }, []);
  
  // Save recently used currencies to localStorage when they change
  useEffect(() => {
    if (recentlyUsed.length > 0) {
      try {
        localStorage.setItem(RECENT_CACHE_KEY, JSON.stringify({
          items: recentlyUsed.slice(0, MAX_RECENT_ITEMS),
          lastUpdated: Date.now()
        }));
      } catch (e) {
        console.error("Error saving recently used currencies:", e);
      }
    }
  }, [recentlyUsed]);
  
  // Helper to update recently used currencies
  const updateRecentlyUsed = useCallback((currencyCode: string) => {
    setRecentlyUsed(prev => {
      // Remove if already exists, then add to front
      const filtered = prev.filter(code => code !== currencyCode);
      return [currencyCode, ...filtered].slice(0, MAX_RECENT_ITEMS);
    });
  }, []);
  
  // Set up auto refresh every 5 minutes for fiat rates
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      setForceRefreshCounter(prev => prev + 1);
    }, 5 * 60 * 1000); 
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Reset base amount to 1 when changing currencies
  useEffect(() => {
    setBaseAmount(1);
    setLastChangedField("base");
  }, [baseCurrency]);

  // Fetch currency symbols from the cached source
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
        const response = await fetch("https://openexchangerates.org/api/currencies.json");
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

  // Fetch exchange rates using ExchangeRate-API
  const fetchExchangeRates = useCallback(async (base: string, retry = false) => {
    // Skip comparing same currency
    if (base === targetCurrency) {
      const singleRate: Record<string, number> = {};
      singleRate[targetCurrency] = 1;
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
      
      // Fetch with retry logic from the API
      const data = await retryWithBackoff<RatesResponse>(async () => {
        const url = `${API_ENDPOINTS.RATES_BASE}/${base}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch rates: ${response.status}`);
        }
        
        return response.json();
      }, retry ? 1 : 2); // Only retry once if this is already a retry attempt
      
      if (data.rates) {
        // Update state and cache
        setRates(data.rates);
        ratesCache.set(cacheKey, data.rates);
        
        // Store in localStorage with timestamp
        const timestamp = new Date();
        saveToCache(localCacheKey, {
          rates: data.rates,
          timestamp: timestamp.toISOString()
        });
        
        // Update the correct amount based on which field was last changed
        updateAmounts(data.rates);
        
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
    if (!currentRates[targetCurrency]) {
      console.error(`Rate not found for ${targetCurrency}`);
      return;
    }
    
    const currentRate = currentRates[targetCurrency];
    
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
  }, [baseCurrency, targetCurrency, fetchExchangeRates, forceRefreshCounter]);
  
  // Handle base amount change
  const handleBaseAmountChange = (value: number) => {
    setBaseAmount(value);
    setLastChangedField("base");
    
    // If rates are available, calculate target amount without waiting for API
    if (rates !== null && rates[targetCurrency]) {
      // Use precise math, then round for display only
      setTargetAmount(parseFloat((value * rates[targetCurrency]).toFixed(4)));
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
    if (rates !== null && rates[targetCurrency] !== 0) {
      // Use precise math for inverse calculation
      setBaseAmount(parseFloat((value / rates[targetCurrency]).toFixed(4)));
    } else {
      // Trigger rate fetch if needed
      fetchExchangeRates(baseCurrency);
    }
  };
  
  // Handle currency changes
  const handleBaseCurrencyChange = (value: string) => {
    if (baseCurrency !== value) {
      setBaseCurrency(value);
      setLastChangedField("base");
      // Add to recently used currencies
      updateRecentlyUsed(value);
      // Rate fetch will be triggered by useEffect
    }
  };
  
  const handleTargetCurrencyChange = (value: string) => {
    if (targetCurrency !== value) {
      setTargetCurrency(value);
      setLastChangedField("target");
      // Add to recently used currencies
      updateRecentlyUsed(value);
      // Rate fetch will be triggered by useEffect
    }
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
    
    setBaseCurrency(tempTargetCurrency);
    setTargetCurrency(tempBaseCurrency);
    
    // Maintain the proper direction (base to target)
    setBaseAmount(1); // Reset to 1 for clarity
    setLastChangedField("base"); // Reset to base as last changed
  };
  
  // Manual rate refresh
  const handleRefreshRate = () => {
    // Force clear the cache
    const cacheKey = `rates-${baseCurrency}`;
    ratesCache.remove(cacheKey);
    fetchExchangeRates(baseCurrency, true);
    toast.success("Refreshing rates");
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
  const currentRate = rates && rates[targetCurrency] ? rates[targetCurrency] : null;

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
          message={rateError || "Error loading rates"} 
          onRetry={() => fetchExchangeRates(baseCurrency, true)} 
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
                recentlyUsed={recentlyUsed}
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
            <ArrowDownUp className="h-5 w-5 transform transition-transform duration-300 hover:rotate-180" />
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
                <ArrowDownUp className="h-4 w-4 transform transition-transform duration-300 hover:rotate-180" />
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
                recentlyUsed={recentlyUsed}
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
        ) : (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex items-center bg-white px-4 py-2 rounded-md shadow-sm animate-pulse-gentle">
              <span className="font-medium">
                1 {baseCurrency} = <span className="font-bold text-blue-700">{(rates?.[targetCurrency] || 0).toFixed(4)}</span> {targetCurrency}
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
        )}
      </div>
    </div>
  );
};

export default CurrencyConverter;
