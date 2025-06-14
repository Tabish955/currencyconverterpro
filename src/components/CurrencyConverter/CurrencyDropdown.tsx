import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { ChevronDown, Search, Flag, X } from "lucide-react";
import Fuse from "fuse.js";

interface CurrencySymbol {
  code: string;
  description: string;
  countryCode?: string;
  aliases?: string[];
}

interface EnrichedCurrencySymbol extends CurrencySymbol {
  countryCode: string;
  searchableText: string;
}

interface CurrencyDropdownProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  currencies: CurrencySymbol[];
  recentlyUsed?: string[];
  placeholder?: string;
  className?: string;
}

// Enhanced currency aliases map
const CURRENCY_ALIASES: Record<string, string[]> = {
  USD: ["United States Dollar", "US Dollar", "American Dollar", "Dollar", "United States", "America", "USA"],
  EUR: ["Euro", "European Union", "Europe", "EU"],
  GBP: ["British Pound", "Pound Sterling", "UK Pound", "United Kingdom", "Britain", "England"],
  JPY: ["Japanese Yen", "Yen", "Japan"],
  CHF: ["Swiss Franc", "Switzerland", "Franc"],
  CAD: ["Canadian Dollar", "Canada", "Canadian"],
  AUD: ["Australian Dollar", "Australia", "Aussie Dollar"],
  CNY: ["Chinese Yuan", "Yuan", "China", "Chinese"],
  INR: ["Indian Rupee", "Rupee", "India"],
  KRW: ["South Korean Won", "Won", "Korea", "South Korea"],
  SGD: ["Singapore Dollar", "Singapore"],
  HKD: ["Hong Kong Dollar", "Hong Kong"],
  NOK: ["Norwegian Krone", "Norway", "Krone"],
  SEK: ["Swedish Krona", "Sweden", "Krona"],
  DKK: ["Danish Krone", "Denmark"],
  PLN: ["Polish Zloty", "Poland", "Zloty"],
  CZK: ["Czech Koruna", "Czech Republic", "Koruna"],
  HUF: ["Hungarian Forint", "Hungary", "Forint"],
  RUB: ["Russian Ruble", "Russia", "Ruble"],
  TRY: ["Turkish Lira", "Turkey", "Lira"],
  BRL: ["Brazilian Real", "Brazil", "Real"],
  MXN: ["Mexican Peso", "Mexico", "Peso"],
  ZAR: ["South African Rand", "South Africa", "Rand"],
  NZD: ["New Zealand Dollar", "New Zealand"],
  THB: ["Thai Baht", "Thailand", "Baht"],
  MYR: ["Malaysian Ringgit", "Malaysia", "Ringgit"],
  IDR: ["Indonesian Rupiah", "Indonesia", "Rupiah"],
  PHP: ["Philippine Peso", "Philippines"],
  VND: ["Vietnamese Dong", "Vietnam", "Dong"],
  AED: ["UAE Dirham", "United Arab Emirates", "Dirham"],
  SAR: ["Saudi Riyal", "Saudi Arabia", "Riyal"],
  QAR: ["Qatari Riyal", "Qatar"],
  KWD: ["Kuwaiti Dinar", "Kuwait", "Dinar"],
  BHD: ["Bahraini Dinar", "Bahrain"],
  OMR: ["Omani Rial", "Oman", "Rial"],
  JOD: ["Jordanian Dinar", "Jordan"],
  EGP: ["Egyptian Pound", "Egypt"],
  ILS: ["Israeli Shekel", "Israel", "Shekel"],
  LBP: ["Lebanese Pound", "Lebanon"],
  PKR: ["Pakistani Rupee", "Pakistan"],
  LKR: ["Sri Lankan Rupee", "Sri Lanka"],
  BGN: ["Bulgarian Lev", "Bulgaria", "Lev"],
  RON: ["Romanian Leu", "Romania", "Leu"],
  HRK: ["Croatian Kuna", "Croatia", "Kuna"],
  RSD: ["Serbian Dinar", "Serbia"],
  ISK: ["Icelandic Krona", "Iceland"],
  CLP: ["Chilean Peso", "Chile"],
  COP: ["Colombian Peso", "Colombia"],
  PEN: ["Peruvian Sol", "Peru", "Sol"],
  UYU: ["Uruguayan Peso", "Uruguay"],
  ARS: ["Argentine Peso", "Argentina"],
  BOB: ["Bolivian Boliviano", "Bolivia", "Boliviano"],
  PYG: ["Paraguayan Guarani", "Paraguay", "Guarani"],
  VES: ["Venezuelan Bolívar", "Venezuela", "Bolívar"],
  GHS: ["Ghanaian Cedi", "Ghana", "Cedi"],
  NGN: ["Nigerian Naira", "Nigeria", "Naira"],
  KES: ["Kenyan Shilling", "Kenya", "Shilling"],
  UGX: ["Ugandan Shilling", "Uganda"],
  TZS: ["Tanzanian Shilling", "Tanzania"],
  ETB: ["Ethiopian Birr", "Ethiopia", "Birr"],
  MAD: ["Moroccan Dirham", "Morocco"],
  TND: ["Tunisian Dinar", "Tunisia"],
  DZD: ["Algerian Dinar", "Algeria"],
  XOF: ["West African CFA Franc", "West Africa", "CFA"],
  XAF: ["Central African CFA Franc", "Central Africa"],
  MWK: ["Malawian Kwacha", "Malawi", "Kwacha"],
  ZMW: ["Zambian Kwacha", "Zambia"],
  BWP: ["Botswanan Pula", "Botswana", "Pula"],
  NAD: ["Namibian Dollar", "Namibia"],
  SZL: ["Swazi Lilangeni", "Swaziland", "Lilangeni"],
  LSL: ["Lesotho Loti", "Lesotho", "Loti"],
  MUR: ["Mauritian Rupee", "Mauritius"],
  SCR: ["Seychellois Rupee", "Seychelles"],
  MVR: ["Maldivian Rufiyaa", "Maldives", "Rufiyaa"],
  NPR: ["Nepalese Rupee", "Nepal"],
  BTN: ["Bhutanese Ngultrum", "Bhutan", "Ngultrum"],
  BDT: ["Bangladeshi Taka", "Bangladesh", "Taka"],
  AFN: ["Afghan Afghani", "Afghanistan", "Afghani"],
  IRR: ["Iranian Rial", "Iran"],
  IQD: ["Iraqi Dinar", "Iraq"],
  SYP: ["Syrian Pound", "Syria"],
  YER: ["Yemeni Rial", "Yemen"],
  AMD: ["Armenian Dram", "Armenia", "Dram"],
  AZN: ["Azerbaijani Manat", "Azerbaijan", "Manat"],
  GEL: ["Georgian Lari", "Georgia", "Lari"],
  KZT: ["Kazakhstani Tenge", "Kazakhstan", "Tenge"],
  KGS: ["Kyrgystani Som", "Kyrgyzstan", "Som"],
  TJS: ["Tajikistani Somoni", "Tajikistan", "Somoni"],
  TMT: ["Turkmenistani Manat", "Turkmenistan"],
  UZS: ["Uzbekistani Som", "Uzbekistan"],
  MNT: ["Mongolian Tugrik", "Mongolia", "Tugrik"],
  LAK: ["Laotian Kip", "Laos", "Kip"],
  KHR: ["Cambodian Riel", "Cambodia", "Riel"],
  MMK: ["Myanmar Kyat", "Myanmar", "Kyat"],
  BND: ["Brunei Dollar", "Brunei"],
  FJD: ["Fijian Dollar", "Fiji"],
  PGK: ["Papua New Guinean Kina", "Papua New Guinea", "Kina"],
  SBD: ["Solomon Islands Dollar", "Solomon Islands"],
  TOP: ["Tongan Paʻanga", "Tonga", "Paʻanga"],
  VUV: ["Vanuatu Vatu", "Vanuatu", "Vatu"],
  WST: ["Samoan Tala", "Samoa", "Tala"],
  XPF: ["CFP Franc", "French Polynesia", "Pacific Franc"],
  NCL: ["New Caledonian Franc", "New Caledonia"],
  ALL: ["Albanian Lek", "Albania", "Lek"],
  MKD: ["Macedonian Denar", "Macedonia", "Denar"],
  BAM: ["Bosnia-Herzegovina Convertible Mark", "Bosnia", "Herzegovina"],
  MDL: ["Moldovan Leu", "Moldova"],
  UAH: ["Ukrainian Hryvnia", "Ukraine", "Hryvnia"],
  BYN: ["Belarusian Ruble", "Belarus"],
  LTL: ["Lithuanian Litas", "Lithuania", "Litas"],
  LVL: ["Latvian Lats", "Latvia", "Lats"],
  EEK: ["Estonian Kroon", "Estonia", "Kroon"],
};

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const CurrencyDropdown = ({
  id,
  value,
  onChange,
  currencies,
  recentlyUsed = [],
  placeholder = "Select currency",
  className = "",
}: CurrencyDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [visibleStart, setVisibleStart] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  
  // Debounce search query for performance
  const debouncedSearchQuery = useDebounce(searchQuery, 200);

  // Memoize enriched currencies with search text
  const enrichedCurrencies = useMemo(() => {
    return currencies.map((currency): EnrichedCurrencySymbol => {
      const aliases = CURRENCY_ALIASES[currency.code] || [];
      const searchableText = [
        currency.code,
        currency.description,
        ...aliases,
        ...(currency.aliases || [])
      ].join(" ").toLowerCase();
      
      return {
        ...currency,
        countryCode: currency.countryCode || "",
        searchableText
      };
    });
  }, [currencies]);

  // Enhanced search with fuzzy matching and aliases
  const fuse = useMemo(() => {
    return new Fuse(enrichedCurrencies, {
      keys: [
        { name: "code", weight: 0.3 },
        { name: "description", weight: 0.4 },
        { name: "searchableText", weight: 0.3 }
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 1,
      ignoreLocation: true,
      findAllMatches: true
    });
  }, [enrichedCurrencies]);

  // Memoized filtered currencies
  const filteredCurrencies = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return enrichedCurrencies;
    }

    const fuseResults = fuse.search(debouncedSearchQuery);
    return fuseResults.map(result => result.item);
  }, [debouncedSearchQuery, enrichedCurrencies, fuse]);

  // Group currencies: recently used first, then others
  const groupedCurrencies = useMemo(() => {
    const recentCurrencies = filteredCurrencies.filter((currency) =>
      recentlyUsed.includes(currency.code)
    );
    const otherCurrencies = filteredCurrencies.filter(
      (currency) => !recentlyUsed.includes(currency.code)
    );

    return [
      ...(recentCurrencies.length > 0 ? recentCurrencies : []),
      ...otherCurrencies,
    ];
  }, [filteredCurrencies, recentlyUsed]);

  // Virtual scrolling configuration
  const ITEM_HEIGHT = 64; // Height of each currency item
  const VISIBLE_ITEMS = 6; // Number of items to show at once
  const maxVisibleItems = Math.min(VISIBLE_ITEMS, groupedCurrencies.length);
  const visibleEnd = Math.min(visibleStart + maxVisibleItems, groupedCurrencies.length);
  const visibleCurrencies = groupedCurrencies.slice(visibleStart, visibleEnd);

  const selectedCurrency = currencies.find((c) => c.code === value);

  const handleSelect = useCallback((currency: CurrencySymbol) => {
    onChange(currency.code);
    setIsOpen(false);
    setSearchQuery("");
    setHighlightedIndex(-1);
    setVisibleStart(0);
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        setIsOpen(false);
        setSearchQuery("");
        setHighlightedIndex(-1);
        setVisibleStart(0);
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const newIndex = prev < groupedCurrencies.length - 1 ? prev + 1 : 0;
          // Update visible window if needed
          if (newIndex >= visibleEnd) {
            setVisibleStart(Math.min(newIndex - maxVisibleItems + 1, groupedCurrencies.length - maxVisibleItems));
          } else if (newIndex < visibleStart) {
            setVisibleStart(newIndex);
          }
          return newIndex;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : groupedCurrencies.length - 1;
          // Update visible window if needed
          if (newIndex < visibleStart) {
            setVisibleStart(Math.max(0, newIndex));
          } else if (newIndex >= visibleEnd) {
            setVisibleStart(Math.max(0, newIndex - maxVisibleItems + 1));
          }
          return newIndex;
        });
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < groupedCurrencies.length) {
          handleSelect(groupedCurrencies[highlightedIndex]);
        }
        break;
      case "Tab":
        setIsOpen(false);
        setSearchQuery("");
        setHighlightedIndex(-1);
        setVisibleStart(0);
        break;
    }
  }, [isOpen, groupedCurrencies.length, visibleEnd, visibleStart, maxVisibleItems, highlightedIndex, handleSelect, groupedCurrencies]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
        setHighlightedIndex(-1);
        setVisibleStart(0);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Reset visible window when search changes
  useEffect(() => {
    setVisibleStart(0);
    setHighlightedIndex(-1);
  }, [debouncedSearchQuery]);

  // Enhanced flag component with better error handling
  const FlagIcon = ({ currency }: { currency: EnrichedCurrencySymbol }) => {
    const [hasError, setHasError] = useState(false);

    if (!currency.countryCode || hasError) {
      return (
        <div className="w-6 h-4 bg-gradient-to-br from-gray-200 to-gray-300 rounded-sm flex items-center justify-center">
          <Flag className="w-3 h-3 text-gray-500" />
        </div>
      );
    }

    return (
      <img
        src={`https://flagcdn.com/w20/${currency.countryCode.toLowerCase()}.png`}
        alt={`${currency.code} flag`}
        className="w-6 h-4 object-cover rounded-sm border border-gray-200 shadow-sm"
        onError={() => setHasError(true)}
        loading="lazy"
      />
    );
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="w-full flex items-center justify-between px-3 py-3 border border-gray-300 rounded-md bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 group"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${id}-label`}
      >
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {selectedCurrency && selectedCurrency.countryCode && (
            <FlagIcon currency={selectedCurrency as EnrichedCurrencySymbol} />
          )}
          <div className="flex flex-col items-start min-w-0 flex-1">
            <span className="font-semibold text-gray-900 text-sm">
              {selectedCurrency?.code || placeholder}
            </span>
            {selectedCurrency && (
              <span className="text-xs text-gray-500 truncate w-full text-left">
                {selectedCurrency.description}
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } group-hover:text-blue-500`}
        />
      </button>

      {/* Enhanced Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-hidden">
          {/* Enhanced Search Box */}
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search currencies, countries, or codes..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Virtualized Currency List */}
          <div className="relative">
            {/* Virtual spacer for items above visible range */}
            {visibleStart > 0 && (
              <div style={{ height: visibleStart * ITEM_HEIGHT }} />
            )}
            
            <ul
              ref={listRef}
              className="py-1"
              role="listbox"
              aria-labelledby={`${id}-label`}
              style={{ minHeight: `${maxVisibleItems * ITEM_HEIGHT}px` }}
            >
              {visibleCurrencies.map((currency, index) => {
                const actualIndex = visibleStart + index;
                const isRecent = recentlyUsed.includes(currency.code);
                
                return (
                  <li
                    key={currency.code}
                    onClick={() => handleSelect(currency)}
                    className={`px-3 py-3 cursor-pointer flex items-center space-x-3 hover:bg-blue-50 transition-colors ${
                      value === currency.code
                        ? "bg-blue-100 border-r-4 border-blue-500"
                        : ""
                    } ${
                      highlightedIndex === actualIndex ? "bg-blue-50" : ""
                    }`}
                    style={{ height: ITEM_HEIGHT }}
                    role="option"
                    aria-selected={value === currency.code}
                  >
                    {currency.countryCode && (
                      <FlagIcon currency={currency} />
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900 text-sm">
                          {currency.code}
                        </span>
                        {isRecent && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            Recent
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 truncate">
                        {currency.description}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Virtual spacer for items below visible range */}
            {visibleEnd < groupedCurrencies.length && (
              <div style={{ height: (groupedCurrencies.length - visibleEnd) * ITEM_HEIGHT }} />
            )}

            {/* Scroll indicators */}
            {groupedCurrencies.length > maxVisibleItems && (
              <>
                {visibleStart > 0 && (
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-gray-100 to-transparent pointer-events-none" />
                )}
                {visibleEnd < groupedCurrencies.length && (
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-gray-100 to-transparent pointer-events-none" />
                )}
              </>
            )}
          </div>

          {/* No Results */}
          {filteredCurrencies.length === 0 && (
            <div className="px-3 py-6 text-center text-gray-500 text-sm">
              <div className="flex flex-col items-center space-y-2">
                <Search className="h-8 w-8 text-gray-300" />
                <span>No currencies found</span>
                <span className="text-xs">Try searching for a country, currency name, or code</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrencyDropdown;
