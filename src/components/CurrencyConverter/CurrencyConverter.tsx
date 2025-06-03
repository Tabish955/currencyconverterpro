
import { useState, useEffect, useCallback } from "react";
import { ArrowUpDown, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import CurrencyInput from "./CurrencyInput";
import CurrencyDropdown from "./CurrencyDropdown";
import ErrorDisplay from "./ErrorDisplay";
import LoadingState from "./LoadingState";
import { retryWithBackoff, saveToCache, getFromCache, CACHE_KEYS, formatRelativeTime, getLastUpdateTime } from "./ApiUtils";

interface CurrencySymbol {
  code: string;
  description: string;
  countryCode?: string;
  aliases?: string[];
}

interface ExchangeRateData {
  provider: string;
  WARNING_UPGRADE_TO_V6: string;
  terms: string;
  base: string;
  rates: { [key: string]: number };
}

interface CurrencyConverterProps {
  mode?: "fiat" | "crypto";
}

const currencies: CurrencySymbol[] = [
  { code: "USD", description: "United States Dollar", countryCode: "us" },
  { code: "EUR", description: "Euro", countryCode: "eu" },
  { code: "JPY", description: "Japanese Yen", countryCode: "jp" },
  { code: "GBP", description: "British Pound", countryCode: "gb" },
  { code: "AUD", description: "Australian Dollar", countryCode: "au" },
  { code: "CAD", description: "Canadian Dollar", countryCode: "ca" },
  { code: "CHF", description: "Swiss Franc", countryCode: "ch" },
  { code: "CNY", description: "Chinese Yuan", countryCode: "cn" },
  { code: "HKD", description: "Hong Kong Dollar", countryCode: "hk" },
  { code: "NZD", description: "New Zealand Dollar", countryCode: "nz" },
  { code: "SEK", description: "Swedish Krona", countryCode: "se" },
  { code: "KRW", description: "South Korean Won", countryCode: "kr" },
  { code: "SGD", description: "Singapore Dollar", countryCode: "sg" },
  { code: "NOK", description: "Norwegian Krone", countryCode: "no" },
  { code: "MXN", description: "Mexican Peso", countryCode: "mx" },
  { code: "INR", description: "Indian Rupee", countryCode: "in" },
  { code: "RUB", description: "Russian Ruble", countryCode: "ru" },
  { code: "ZAR", description: "South African Rand", countryCode: "za" },
  { code: "TRY", description: "Turkish Lira", countryCode: "tr" },
  { code: "BRL", description: "Brazilian Real", countryCode: "br" },
  { code: "TWD", description: "Taiwan New Dollar", countryCode: "tw" },
  { code: "DKK", description: "Danish Krone", countryCode: "dk" },
  { code: "PLN", description: "Polish Zloty", countryCode: "pl" },
  { code: "THB", description: "Thai Baht", countryCode: "th" },
  { code: "IDR", description: "Indonesian Rupiah", countryCode: "id" },
  { code: "HUF", description: "Hungarian Forint", countryCode: "hu" },
  { code: "CZK", description: "Czech Koruna", countryCode: "cz" },
  { code: "ILS", description: "Israeli New Shekel", countryCode: "il" },
  { code: "CLP", description: "Chilean Peso", countryCode: "cl" },
  { code: "PHP", description: "Philippine Peso", countryCode: "ph" },
  { code: "AED", description: "United Arab Emirates Dirham", countryCode: "ae" },
  { code: "COP", description: "Colombian Peso", countryCode: "co" },
  { code: "SAR", description: "Saudi Riyal", countryCode: "sa" },
  { code: "MYR", description: "Malaysian Ringgit", countryCode: "my" },
  { code: "RON", description: "Romanian Leu", countryCode: "ro" },
  { code: "PKR", description: "Pakistani Rupee", countryCode: "pk" },
  { code: "BDT", description: "Bangladeshi Taka", countryCode: "bd" },
  { code: "VND", description: "Vietnamese Dong", countryCode: "vn" },
  { code: "UAH", description: "Ukrainian Hryvnia", countryCode: "ua" },
  { code: "NGN", description: "Nigerian Naira", countryCode: "ng" },
  { code: "EGP", description: "Egyptian Pound", countryCode: "eg" },
  { code: "KZT", description: "Kazakhstani Tenge", countryCode: "kz" },
  { code: "QAR", description: "Qatari Riyal", countryCode: "qa" },
  { code: "DZD", description: "Algerian Dinar", countryCode: "dz" },
  { code: "KWD", description: "Kuwaiti Dinar", countryCode: "kw" },
  { code: "OMR", description: "Omani Rial", countryCode: "om" },
  { code: "JOD", description: "Jordanian Dinar", countryCode: "jo" },
  { code: "MAD", description: "Moroccan Dirham", countryCode: "ma" },
  { code: "BHD", description: "Bahraini Dinar", countryCode: "bh" },
  { code: "XAF", description: "Central African CFA Franc", countryCode: "cm" },
  { code: "XOF", description: "West African CFA Franc", countryCode: "sn" },
  { code: "XPF", description: "CFP Franc", countryCode: "pf" },
  { code: "TND", description: "Tunisian Dinar", countryCode: "tn" },
  { code: "GHS", description: "Ghanaian Cedi", countryCode: "gh" },
  { code: "UGX", description: "Ugandan Shilling", countryCode: "ug" },
  { code: "TZS", description: "Tanzanian Shilling", countryCode: "tz" },
  { code: "KES", description: "Kenyan Shilling", countryCode: "ke" },
  { code: "XCD", description: "East Caribbean Dollar", countryCode: "ag" },
  { code: "BBD", description: "Barbadian Dollar", countryCode: "bb" },
  { code: "BSD", description: "Bahamian Dollar", countryCode: "bs" },
  { code: "BZD", description: "Belize Dollar", countryCode: "bz" },
  { code: "BMD", description: "Bermudian Dollar", countryCode: "bm" },
  { code: "BOB", description: "Bolivian Boliviano", countryCode: "bo" },
  { code: "PYG", description: "Paraguayan Guarani", countryCode: "py" },
  { code: "PEN", description: "Peruvian Sol", countryCode: "pe" },
  { code: "UYU", description: "Uruguayan Peso", countryCode: "uy" },
  { code: "GTQ", description: "Guatemalan Quetzal", countryCode: "gt" },
  { code: "HNL", description: "Honduran Lempira", countryCode: "hn" },
  { code: "NIO", description: "Nicaraguan Córdoba", countryCode: "ni" },
  { code: "CRC", description: "Costa Rican Colón", countryCode: "cr" },
  { code: "PAB", description: "Panamanian Balboa", countryCode: "pa" },
  { code: "JMD", description: "Jamaican Dollar", countryCode: "jm" },
  { code: "TTD", description: "Trinidad & Tobago Dollar", countryCode: "tt" },
  { code: "AWG", description: "Aruban Florin", countryCode: "aw" },
  { code: "ANG", description: "Netherlands Antillean Guilder", countryCode: "cw" },
  { code: "SRD", description: "Surinamese Dollar", countryCode: "sr" },
  { code: "GYD", description: "Guyanese Dollar", countryCode: "gy" },
  { code: "FJD", description: "Fijian Dollar", countryCode: "fj" },
  { code: "PGK", description: "Papua New Guinean Kina", countryCode: "pg" },
  { code: "TOP", description: "Tongan Paʻanga", countryCode: "to" },
  { code: "SBD", description: "Solomon Islands Dollar", countryCode: "sb" },
  { code: "VUV", description: "Vanuatu Vatu", countryCode: "vu" },
  { code: "WST", description: "Samoan Tala", countryCode: "ws" },
  { code: "KID", description: "Kiribati Dollar", countryCode: "ki" },
  { code: "BND", description: "Bruneian Dollar", countryCode: "bn" },
  { code: "FKP", description: "Falkland Islands Pound", countryCode: "fk" },
  { code: "GIP", description: "Gibraltar Pound", countryCode: "gi" },
  { code: "SHP", description: "Saint Helena Pound", countryCode: "sh" },
  { code: "SSP", description: "South Sudanese Pound", countryCode: "ss" },
  { code: "SDG", description: "Sudanese Pound", countryCode: "sd" },
  { code: "SYP", description: "Syrian Pound", countryCode: "sy" },
  { code: "LBP", description: "Lebanese Pound", countryCode: "lb" },
  { code: "IRR", description: "Iranian Rial", countryCode: "ir" },
  { code: "IQD", description: "Iraqi Dinar", countryCode: "iq" },
  { code: "LYD", description: "Libyan Dinar", countryCode: "ly" },
  { code: "YER", description: "Yemeni Rial", countryCode: "ye" },
  { code: "MRU", description: "Mauritanian Ouguiya", countryCode: "mr" },
  { code: "ETB", description: "Ethiopian Birr", countryCode: "et" },
  { code: "SOS", description: "Somali Shilling", countryCode: "so" },
  { code: "DJF", description: "Djiboutian Franc", countryCode: "dj" },
  { code: "ERN", description: "Eritrean Nakfa", countryCode: "er" },
  { code: "SZL", description: "Eswatini Lilangeni", countryCode: "sz" },
  { code: "LSL", description: "Lesotho Loti", countryCode: "ls" },
  { code: "NAD", description: "Namibian Dollar", countryCode: "na" },
  { code: "BWP", description: "Botswanan Pula", countryCode: "bw" },
  { code: "MWK", description: "Malawian Kwacha", countryCode: "mw" },
  { code: "ZMW", description: "Zambian Kwacha", countryCode: "zm" },
  { code: "MZN", description: "Mozambican Metical", countryCode: "mz" },
  { code: "MDL", description: "Moldovan Leu", countryCode: "md" },
  { code: "ALL", description: "Albanian Lek", countryCode: "al" },
  { code: "MKD", description: "Macedonian Denar", countryCode: "mk" },
  { code: "BAM", description: "Bosnia-Herzegovina Convertible Mark", countryCode: "ba" },
  { code: "RSD", description: "Serbian Dinar", countryCode: "rs" },
  { code: "BGN", description: "Bulgarian Lev", countryCode: "bg" },
  { code: "HRK", description: "Croatian Kuna", countryCode: "hr" },
  { code: "ISK", description: "Icelandic Króna", countryCode: "is" },
  { code: "GEL", description: "Georgian Lari", countryCode: "ge" },
  { code: "AZN", description: "Azerbaijani Manat", countryCode: "az" },
  { code: "AMD", description: "Armenian Dram", countryCode: "am" },
  { code: "BYN", description: "Belarusian Ruble", countryCode: "by" },
  { code: "UZS", description: "Uzbekistani Som", countryCode: "uz" },
  { code: "TMT", description: "Turkmenistani Manat", countryCode: "tm" },
  { code: "TJS", description: "Tajikistani Somoni", countryCode: "tj" },
  { code: "KGS", description: "Kyrgyzstani Som", countryCode: "kg" },
  { code: "MNT", description: "Mongolian Tögrög", countryCode: "mn" },
  { code: "MVR", description: "Maldivian Rufiyaa", countryCode: "mv" },
  { code: "NPR", description: "Nepalese Rupee", countryCode: "np" },
  { code: "BTN", description: "Bhutanese Ngultrum", countryCode: "bt" },
  { code: "BIF", description: "Burundian Franc", countryCode: "bi" },
  { code: "RWF", description: "Rwandan Franc", countryCode: "rw" },
  { code: "SLL", description: "Sierra Leonean Leone", countryCode: "sl" },
  { code: "GMD", description: "Gambian Dalasi", countryCode: "gm" },
  { code: "GNF", description: "Guinean Franc", countryCode: "gn" },
  { code: "AFN", description: "Afghan Afghani", countryCode: "af" },
  { code: "AOA", description: "Angolan Kwanza", countryCode: "ao" },
  { code: "ARS", description: "Argentine Peso", countryCode: "ar" },
  { code: "CVE", description: "Cape Verdean Escudo", countryCode: "cv" },
  { code: "CDF", description: "Congolese Franc", countryCode: "cd" },
  { code: "CUP", description: "Cuban Peso", countryCode: "cu" },
  { code: "DOP", description: "Dominican Peso", countryCode: "do" },
  { code: "SVC", description: "Salvadoran Colón", countryCode: "sv" },
  { code: "HTG", description: "Haitian Gourde", countryCode: "ht" },
  { code: "IMP", description: "Manx Pound", countryCode: "im" },
  { code: "JEP", description: "Jersey Pound", countryCode: "je" },
  { code: "KHR", description: "Cambodian Riel", countryCode: "kh" },
  { code: "LAK", description: "Lao Kip", countryCode: "la" },
  { code: "LRD", description: "Liberian Dollar", countryCode: "lr" },
  { code: "MOP", description: "Macanese Pataca", countryCode: "mo" },
  { code: "MGA", description: "Malagasy Ariary", countryCode: "mg" },
  { code: "MUR", description: "Mauritian Rupee", countryCode: "mu" },
  { code: "MMK", description: "Burmese Kyat", countryCode: "mm" },
  { code: "SCR", description: "Seychellois Rupee", countryCode: "sc" },
  { code: "STN", description: "São Tomé & Príncipe Dobra", countryCode: "st" },
  { code: "LKR", description: "Sri Lankan Rupee", countryCode: "lk" },
  { code: "VES", description: "Venezuelan Bolívar Soberano", countryCode: "ve" },
  { code: "ZWL", description: "Zimbabwean Dollar", countryCode: "zw" },
];

const CurrencyConverter = ({ mode = "fiat" }: CurrencyConverterProps) => {
  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState("KWD");
  const [toCurrency, setToCurrency] = useState("PKR");
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Load recently used currencies from localStorage on component mount
  useEffect(() => {
    const storedRecentlyUsed = localStorage.getItem('recentlyUsedCurrencies');
    if (storedRecentlyUsed) {
      setRecentlyUsed(JSON.parse(storedRecentlyUsed));
    }
  }, []);

  // Update localStorage whenever recentlyUsed changes
  useEffect(() => {
    localStorage.setItem('recentlyUsedCurrencies', JSON.stringify(recentlyUsed));
  }, [recentlyUsed]);

  // Function to update recently used currencies
  const updateRecentlyUsed = (currency: string) => {
    setRecentlyUsed((prev) => {
      const updatedList = [
        currency,
        ...prev.filter((c) => c !== currency),
      ].slice(0, 3);
      return updatedList;
    });
  };

  // Enhanced fetch rates function with better error handling for unsupported currencies
  const fetchRates = async (base: string): Promise<ExchangeRateData> => {
    // List of commonly unsupported currencies by most APIs
    const unsupportedCurrencies = ['XAG', 'XAU', 'XPD', 'XPT', 'BTC', 'ETH', 'LTC'];
    
    if (unsupportedCurrencies.includes(base)) {
      throw new Error(`Currency ${base} is not supported by the exchange rate API. Please select a different currency.`);
    }

    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        const errorData = await response.json();
        if (errorData.error_type === 'unsupported_code') {
          throw new Error(`Currency ${base} is not supported. Please select a different currency.`);
        }
      }
      throw new Error(`Failed to fetch rates: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.result === 'error') {
      throw new Error(`API Error: ${data.error_type || 'Unknown error'}`);
    }
    
    return data;
  };

  const {
    data: ratesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["exchangeRates", fromCurrency],
    queryFn: () => fetchRates(fromCurrency),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes (renamed from cacheTime in v5)
    retry: 3,
  });

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      toast.error(`Failed to fetch exchange rates: ${error.message}`);
    }
  }, [error]);

  const convertedAmount =
    ratesData && !isLoading && !error
      ? parseFloat(amount) * ratesData.rates[toCurrency]
      : 0;

  const rate = ratesData ? ratesData.rates[toCurrency] : 0;
  const lastUpdateTime = getLastUpdateTime();

  const handleSwap = useCallback(() => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmount("1"); // Reset to 1 when swapping
  }, [fromCurrency, toCurrency]);

  const handleFromCurrencyChange = (currency: string) => {
    setFromCurrency(currency);
    setAmount("1"); // Reset to 1 when changing currency
    updateRecentlyUsed(currency);
  };

  const handleToCurrencyChange = (currency: string) => {
    setToCurrency(currency);
    setAmount("1"); // Reset to 1 when changing currency
    updateRecentlyUsed(currency);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 relative" style={{ zIndex: 1 }}>
      {/* Enhanced header with professional styling */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
            Live Exchange Rates
          </span>
        </div>
      </div>

      {/* Currency Conversion Form */}
      <div className="space-y-6 bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100/50">
        {/* From Currency */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            From Currency
          </label>
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-2" style={{ zIndex: 10 }}>
              <CurrencyDropdown
                id="from-currency"
                value={fromCurrency}
                onChange={handleFromCurrencyChange}
                currencies={currencies}
                recentlyUsed={recentlyUsed}
              />
            </div>
            <div className="col-span-3">
              <CurrencyInput
                id="from-amount"
                value={amount}
                onChange={setAmount}
                placeholder="Enter amount"
                className="focus-ring"
              />
            </div>
          </div>
        </div>

        {/* Enhanced Swap Button */}
        <div className="flex justify-center relative" style={{ zIndex: 5 }}>
          <button
            onClick={handleSwap}
            disabled={isLoading}
            className="group relative bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:rotate-180 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Swap currencies"
          >
            <ArrowUpDown className="h-5 w-5 transition-transform duration-300" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <div className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-20"></div>
          </button>
        </div>

        {/* To Currency */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 flex items-center">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
            To Currency
          </label>
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-2" style={{ zIndex: 9 }}>
              <CurrencyDropdown
                id="to-currency"
                value={toCurrency}
                onChange={handleToCurrencyChange}
                currencies={currencies}
                recentlyUsed={recentlyUsed}
              />
            </div>
            <div className="col-span-3">
              <div className="relative">
                <input
                  type="text"
                  value={isLoading ? "Loading..." : `${convertedAmount.toFixed(4)}`}
                  readOnly
                  className="w-full py-3 px-3 border border-gray-300 rounded-md bg-gray-50 text-gray-700 font-medium text-right focus:outline-none"
                />
                {isLoading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-blue-500" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Conversion Rate Display */}
        {!isLoading && ratesData && (
          <div className="conversion-rate bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-4 space-y-2" style={{ zIndex: 1 }}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">Exchange Rate:</span>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-800">
                  1 {fromCurrency} = {rate.toFixed(6)} {toCurrency}
                </span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Last updated: {lastUpdateTime ? formatRelativeTime(lastUpdateTime) : 'Just now'}</span>
              <button
                onClick={() => queryClient.invalidateQueries({ queryKey: ['exchangeRates', fromCurrency] })}
                className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Refresh</span>
              </button>
            </div>
            
            {/* Professional conversion breakdown */}
            <div className="mt-3 p-3 bg-white/60 rounded-md border border-blue-100">
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>{amount} {fromCurrency}</span>
                  <span>×</span>
                  <span>{rate.toFixed(6)}</span>
                  <span>=</span>
                  <span className="font-bold text-blue-700">{convertedAmount.toFixed(4)} {toCurrency}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <ErrorDisplay 
            message={error.message} 
            onRetry={() => queryClient.invalidateQueries({ queryKey: ['exchangeRates', fromCurrency] })}
            inline={true}
          />
        )}
      </div>
    </div>
  );
};

export default CurrencyConverter;
