
import { useEffect, useState } from "react";
import { CurrencyCache } from "./CurrencyCache";
import CurrencyDropdown from "./CurrencyDropdown";
import CurrencyInput from "./CurrencyInput";
import ErrorDisplay from "./ErrorDisplay";
import LoadingState from "./LoadingState";
import { ArrowDownUp, RefreshCw } from "lucide-react";

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

// Currency full names mapping
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
  ZMW: "Zambian Kwacha"
};

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
            className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors"
            aria-label="Swap currencies"
          >
            <ArrowDownUp className="h-5 w-5 text-blue-600" />
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
                className="hidden md:flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
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
      <div className="mt-6 border-t pt-4 text-sm text-gray-600">
        {isLoadingRate ? (
          <div className="flex items-center">
            <div className="animate-spin mr-2">
              <RefreshCw className="h-4 w-4" />
            </div>
            <span>Fetching latest rates...</span>
          </div>
        ) : rateError ? (
          <div className="text-red-600">
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
            <div className="flex items-center">
              <span>
                1 {baseCurrency} = <span className="font-semibold">{rate.toFixed(4)}</span> {targetCurrency}
              </span>
            </div>
            {lastUpdated && (
              <div className="flex items-center mt-2 sm:mt-0">
                <span className="text-gray-500 mr-2">Updated {formattedLastUpdated}</span>
                <button
                  onClick={handleRefreshRate}
                  className="text-blue-500 hover:text-blue-600 flex items-center"
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
