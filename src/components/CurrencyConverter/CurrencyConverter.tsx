
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
  
  // API endpoints with API key - using a free API key for demo purposes
  const API_KEY = "4edc68699b3711b4cc7f38f21dbf"; // Free tier API key for demo only
  const SYMBOLS_API_URL = `https://api.exchangerate.host/symbols?access_key=${API_KEY}`;
  const RATES_API_URL = `https://api.exchangerate.host/latest?access_key=${API_KEY}`;

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

        // Try the primary API first
        const response = await fetch(SYMBOLS_API_URL);
        const data = await response.json();
        
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
          setIsLoadingSymbols(false);
          return;
        }
        
        // If primary API fails, use fallback
        throw new Error("Primary API returned unsuccessful response");
        
      } catch (error) {
        console.error("Error fetching currency symbols:", error);
        
        // Try fallback API
        try {
          const response = await fetch("https://open.er-api.com/v6/latest/USD");
          
          if (!response.ok) {
            throw new Error(`Failed to fetch symbols: ${response.status}`);
          }
          
          const data = await response.json();
          
          // Transform rates object into array of currency symbols with full names
          const symbolsArray = Object.keys(data.rates).map(code => ({
            code,
            description: currencyFullNames[code] || code // Use full name from our map or fallback to code
          }));
          
          // Sort alphabetically by code
          symbolsArray.sort((a, b) => a.code.localeCompare(b.code));
          
          // Update state and cache
          setSymbols(symbolsArray);
          symbolsCache.set("symbols", symbolsArray);
          setSymbolsError(null);
          
          toast.info("Using fallback currency API");
        } catch (fallbackError) {
          console.error("Fallback API also failed:", fallbackError);
          setSymbolsError(error instanceof Error ? error.message : "Failed to load currency symbols");
        } finally {
          setIsLoadingSymbols(false);
        }
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
      
      // Try primary API first
      // Note: This API requires base currency in the URL and "symbols" parameter for the target currency
      const url = `${RATES_API_URL}&base=${baseCurrency}&symbols=${targetCurrency}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.rates && data.rates[targetCurrency]) {
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
        setIsLoadingRate(false);
        return;
      }
      
      // If primary API fails, use fallback
      throw new Error("Primary API failed or returned incomplete data");
      
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      
      // Try fallback API
      try {
        const response = await fetch(
          `https://open.er-api.com/v6/latest/${baseCurrency}`
        );
        
        if (!response.ok) {
          throw new Error(`Fallback API failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.rates || !data.rates[targetCurrency]) {
          throw new Error(`Rate not found for ${targetCurrency}`);
        }
        
        const newRate = data.rates[targetCurrency];
        
        // Update state and cache
        setRate(newRate);
        ratesCache.set(`${baseCurrency}-${targetCurrency}`, newRate);
        
        // Update amounts based on which field was last changed
        if (lastChangedField === "base") {
          setTargetAmount(parseFloat((baseAmount * newRate).toFixed(4)));
        } else {
          setBaseAmount(parseFloat((targetAmount / newRate).toFixed(4)));
        }
        
        setLastUpdated(new Date());
        setRateError(null);
        toast.info("Using fallback exchange rate API");
      } catch (fallbackError) {
        console.error("Fallback API also failed:", fallbackError);
        setRateError("Failed to load exchange rates from all sources. Please try again later.");
      } finally {
        setIsLoadingRate(false);
      }
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
        <div>
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
            className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            aria-label="Swap currencies"
          >
            <ArrowDownUp className="h-5 w-5" />
          </button>
        </div>

        {/* Target Currency Column */}
        <div>
          <div className="mb-3 relative">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700">
                To
              </label>

              {/* Swap Button (visible only on desktop) */}
              <button
                onClick={handleSwapCurrencies}
                disabled={isLoadingRate}
                className="hidden md:flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-all duration-300"
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
      <div className="mt-6 border-t border-gray-200 pt-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg backdrop-blur-sm">
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
            <div className="flex items-center bg-white px-4 py-2 rounded-md shadow-sm">
              <span className="font-medium">
                1 {baseCurrency} = <span className="font-bold text-blue-700">{rate.toFixed(4)}</span> {targetCurrency}
              </span>
            </div>
            {lastUpdated && (
              <div className="flex items-center mt-2 sm:mt-0">
                <span className="text-gray-500 mr-2">Updated {formattedLastUpdated}</span>
                <button
                  onClick={handleRefreshRate}
                  className="text-blue-500 hover:text-blue-600 flex items-center bg-white px-3 py-1 rounded-md shadow-sm hover:shadow-md transition-all duration-300"
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

// Currency full names mapping for fallback
const currencyFullNames: Record<string, string> = {
  USD: "United States Dollar",
  EUR: "Euro",
  GBP: "British Pound Sterling",
  JPY: "Japanese Yen",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
  CHF: "Swiss Franc",
  CNY: "Chinese Yuan",
  INR: "Indian Rupee",
  PKR: "Pakistani Rupee",
  KWD: "Kuwaiti Dinar",
  AED: "United Arab Emirates Dirham",
  SAR: "Saudi Riyal",
  QAR: "Qatari Riyal",
  BHD: "Bahraini Dinar",
  OMR: "Omani Rial",
  EGP: "Egyptian Pound",
  TRY: "Turkish Lira",
  RUB: "Russian Ruble",
  NGN: "Nigerian Naira",
  ZAR: "South African Rand",
  BRL: "Brazilian Real",
  MXN: "Mexican Peso",
  SGD: "Singapore Dollar",
  NZD: "New Zealand Dollar",
  HKD: "Hong Kong Dollar",
  KRW: "South Korean Won",
  IDR: "Indonesian Rupiah",
  MYR: "Malaysian Ringgit",
  THB: "Thai Baht",
  VND: "Vietnamese Dong",
  PHP: "Philippine Peso",
  AFN: "Afghan Afghani",
  DZD: "Algerian Dinar",
  ARS: "Argentine Peso",
  AMD: "Armenian Dram",
  AWG: "Aruban Florin",
  AZN: "Azerbaijani Manat",
  BSD: "Bahamian Dollar",
  BBD: "Barbadian Dollar",
  BYN: "Belarusian Ruble",
  BZD: "Belize Dollar",
  BMD: "Bermudan Dollar",
  BOB: "Bolivian Boliviano",
  BAM: "Bosnia-Herzegovina Convertible Mark",
  BWP: "Botswanan Pula",
  BGN: "Bulgarian Lev",
  BIF: "Burundian Franc",
  KHR: "Cambodian Riel",
  CVE: "Cape Verdean Escudo",
  XAF: "Central African CFA Franc",
  CLP: "Chilean Peso",
  COP: "Colombian Peso",
  KMF: "Comorian Franc",
  CDF: "Congolese Franc",
  CRC: "Costa Rican Colón",
  HRK: "Croatian Kuna",
  CZK: "Czech Republic Koruna",
  DKK: "Danish Krone",
  DJF: "Djiboutian Franc",
  DOP: "Dominican Peso",
  XCD: "East Caribbean Dollar",
  ETB: "Ethiopian Birr",
  FJD: "Fijian Dollar",
  GMD: "Gambian Dalasi",
  GEL: "Georgian Lari",
  GHS: "Ghanaian Cedi",
  GTQ: "Guatemalan Quetzal",
  GNF: "Guinean Franc",
  GYD: "Guyanaese Dollar",
  HTG: "Haitian Gourde",
  HNL: "Honduran Lempira",
  HUF: "Hungarian Forint",
  ISK: "Icelandic Króna",
  IRR: "Iranian Rial",
  IQD: "Iraqi Dinar",
  ILS: "Israeli New Shekel",
  JMD: "Jamaican Dollar",
  JOD: "Jordanian Dinar",
  KZT: "Kazakhstani Tenge",
  KES: "Kenyan Shilling",
  LAK: "Laotian Kip",
  LBP: "Lebanese Pound",
  LSL: "Lesotho Loti",
  LRD: "Liberian Dollar",
  LYD: "Libyan Dinar",
  MKD: "Macedonian Denar",
  MGA: "Malagasy Ariary",
  MWK: "Malawian Kwacha",
  MVR: "Maldivian Rufiyaa",
  MRU: "Mauritanian Ouguiya",
  MUR: "Mauritian Rupee",
  MDL: "Moldovan Leu",
  MNT: "Mongolian Tugrik",
  MAD: "Moroccan Dirham",
  MMK: "Myanmar Kyat",
  NAD: "Namibian Dollar",
  NPR: "Nepalese Rupee",
  NIO: "Nicaraguan Córdoba",
  XOF: "West African CFA Franc",
  NOK: "Norwegian Krone",
  PAB: "Panamanian Balboa",
  PGK: "Papua New Guinean Kina",
  PYG: "Paraguayan Guarani",
  PEN: "Peruvian Nuevo Sol",
  PLN: "Polish Zloty",
  RON: "Romanian Leu",
  RWF: "Rwandan Franc",
  SVC: "Salvadoran Colón",
  WST: "Samoan Tala",
  STN: "São Tomé and Príncipe Dobra",
  RSD: "Serbian Dinar",
  SLL: "Sierra Leonean Leone",
  SEK: "Swedish Krona",
  SOS: "Somali Shilling",
  SSP: "South Sudanese Pound",
  LKR: "Sri Lankan Rupee",
  SDG: "Sudanese Pound",
  SRD: "Surinamese Dollar",
  SZL: "Swazi Lilangeni",
  SYP: "Syrian Pound",
  TWD: "New Taiwan Dollar",
  TZS: "Tanzanian Shilling",
  TOP: "Tongan Paʻanga",
  TTD: "Trinidad and Tobago Dollar",
  TND: "Tunisian Dinar",
  UGX: "Ugandan Shilling",
  UAH: "Ukrainian Hryvnia",
  UYU: "Uruguayan Peso",
  UZS: "Uzbekistan Som",
  VEF: "Venezuelan Bolívar Fuerte",
  VES: "Venezuelan Bolívar Soberano",
  YER: "Yemeni Rial",
  ZMW: "Zambian Kwacha",
  XPF: "CFP Franc",
  CUP: "Cuban Peso",
  FKP: "Falkland Islands Pound",
  GIP: "Gibraltar Pound",
  GGP: "Guernsey Pound",
  IMP: "Isle of Man Pound",
  JEP: "Jersey Pound",
  KPW: "North Korean Won",
  LVL: "Latvian Lats",
  LTL: "Lithuanian Litas",
  SHP: "Saint Helena Pound",
  SPL: "Seborgan Luigino",
  SCR: "Seychellois Rupee",
  SBD: "Solomon Islands Dollar",
  TVD: "Tuvaluan Dollar",
  ZWD: "Zimbabwean Dollar",
  TMT: "Turkmenistan Manat",
  TJS: "Tajikistani Somoni",
  XAU: "Gold Ounce",
  XAG: "Silver Ounce",
  XPT: "Platinum Ounce",
  XDR: "Special Drawing Rights",
  XTS: "Testing Currency Code",
  XXX: "Unknown Currency",
  // Adding missing currency full names
  ANG: "Netherlands Antillean Guilder",
  AOA: "Angolan Kwanza",
  BND: "Brunei Dollar",
  CUC: "Cuban Convertible Peso",
  ERN: "Eritrean Nakfa",
  FOK: "Faroese Króna",
  KID: "Kiribati Dollar",
  MOP: "Macanese Pataca",
  SLE: "Sierra Leonean Leone",
  XCG: "East Caribbean Guild",
};
