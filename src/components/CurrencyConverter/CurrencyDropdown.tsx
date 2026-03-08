
import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Fuse from 'fuse.js';
import 'flag-icons/css/flag-icons.min.css';
import { getCountryCode } from "./currencyFlags";

export interface CurrencySymbol {
  code: string;
  description: string;
  countryCode?: string;
  aliases?: string[];
}

interface CurrencyDropdownProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  currencies: CurrencySymbol[];
  disabled?: boolean;
}

// Currency aliases for improved fuzzy search
const currencyAliases: Record<string, string[]> = {
  USD: ["dollar", "us dollar", "american dollar", "america", "united states", "usa"],
  EUR: ["euro", "europe", "european", "eurozone"],
  GBP: ["pound", "british pound", "sterling", "uk", "united kingdom", "england"],
  JPY: ["yen", "japanese yen", "japan"],
  INR: ["indian rupee", "india", "rupee"],
  PKR: ["pakistani rupee", "pakistan"],
  KWD: ["kuwaiti dinar", "kuwait", "dinar"],
  AED: ["dirham", "emirati dirham", "uae", "dubai"],
  SAR: ["saudi riyal", "saudi arabia", "riyal"],
  CAD: ["canadian dollar", "canada"],
  AUD: ["australian dollar", "australia"],
  NZD: ["new zealand dollar", "new zealand"],
  CHF: ["swiss franc", "switzerland"],
  CNY: ["chinese yuan", "china", "renminbi"],
  HKD: ["hong kong dollar", "hong kong"],
  SGD: ["singapore dollar", "singapore"],
  MYR: ["malaysian ringgit", "malaysia"],
  THB: ["thai baht", "thailand"],
  IDR: ["indonesian rupiah", "indonesia"],
  PHP: ["philippine peso", "philippines"],
  MXN: ["mexican peso", "mexico"],
  BRL: ["brazilian real", "brazil"],
  ZAR: ["south african rand", "south africa"],
  RUB: ["russian ruble", "russia"],
  TRY: ["turkish lira", "turkey"],
  KRW: ["korean won", "south korea", "korea"],
  TWD: ["taiwan dollar", "taiwan"],
  NGN: ["naira", "nigeria"],
  EGP: ["egyptian pound", "egypt"],
  BDT: ["taka", "bangladesh"],
  VND: ["dong", "vietnam"],
  KES: ["shilling", "kenya"],
};

const CurrencyDropdown = ({
  id,
  value,
  onChange,
  currencies,
  disabled = false,
}: CurrencyDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Prepare currency data with country codes and aliases
  const enrichedCurrencies = currencies.map(currency => ({
    ...currency,
    countryCode: currencyToCountryCode[currency.code] || "un", // Fallback to UN flag
    aliases: currencyAliases[currency.code] || []
  }));

  // Setup Fuse.js for fuzzy search
  const fuseRef = useRef<Fuse<CurrencySymbol>>();
  
  useEffect(() => {
    fuseRef.current = new Fuse(enrichedCurrencies, {
      keys: ['code', 'description', 'aliases'],
      threshold: 0.3,
      includeScore: true
    });
  }, [currencies]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      setHighlightedIndex(0);
    }
  }, [isOpen]);

  // Get the selected currency details
  const selectedCurrency = enrichedCurrencies.find((c) => c.code === value);

  // Filter currencies based on search term using Fuse.js
  const filteredCurrencies = searchTerm.trim() === "" 
    ? enrichedCurrencies 
    : fuseRef.current 
      ? fuseRef.current.search(searchTerm).map(result => result.item)
      : enrichedCurrencies;

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
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
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prevIndex) =>
          Math.min(prevIndex + 1, filteredCurrencies.length - 1)
        );
        scrollToHighlighted();
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
        scrollToHighlighted();
        break;
      case "Enter":
        e.preventDefault();
        if (filteredCurrencies[highlightedIndex]) {
          onChange(filteredCurrencies[highlightedIndex].code);
          setIsOpen(false);
          setSearchTerm("");
        }
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  // Scroll to highlighted item
  const scrollToHighlighted = () => {
    if (listRef.current && listRef.current.children[highlightedIndex]) {
      listRef.current.children[highlightedIndex].scrollIntoView({
        block: "nearest",
      });
    }
  };

  return (
    <div className="relative inline-block w-full" ref={dropdownRef}>
      <button
        id={id}
        className={`w-full flex items-center justify-between py-3.5 px-4 border-2 border-gray-300 rounded-lg bg-white text-left shadow-md hover:shadow-xl transition-all duration-300 relative z-10 ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-blue-400 hover:-translate-y-0.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <span className="truncate font-medium flex items-center">
          {selectedCurrency ? (
            <span className="flex items-center">
              {selectedCurrency.countryCode && (
                <span 
                  className={`fi fi-${selectedCurrency.countryCode} mr-2`} 
                  style={{ width: '1.2em', height: '1em' }}
                  aria-hidden="true"
                ></span>
              )}
              <span className="font-bold">{selectedCurrency.code}</span>
              <span className="text-gray-500 ml-2">({selectedCurrency.description})</span>
            </span>
          ) : (
            "Select currency"
          )}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
        )}
      </button>

      {isOpen && (
        <div 
          className="absolute z-[9999] mt-2 w-full md:w-[450px] bg-white border-2 border-blue-200 rounded-xl shadow-2xl animate-fade-in"
          style={{ 
            animation: 'fade-in 0.2s ease-out',
            transformOrigin: 'top center'
          }}
        >
          <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border-b-2 border-blue-100 z-10 rounded-t-xl">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
              <input
                ref={searchInputRef}
                type="text"
                className="w-full pl-10 pr-4 py-2.5 border-2 border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm"
                placeholder="Search currencies, countries, or codes..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                aria-controls="currency-list"
              />
            </div>
          </div>

          <ScrollArea className="h-80">
            <ul 
              id="currency-list"
              ref={listRef}
              className="py-1" 
              role="listbox"
              tabIndex={-1}
            >
              {filteredCurrencies.length > 0 ? (
                filteredCurrencies.map((currency, index) => (
                  <li
                    key={currency.code}
                    className={`px-4 py-3 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0 ${
                      currency.code === value 
                        ? "bg-gradient-to-r from-blue-100 to-indigo-100 border-l-4 border-l-blue-500" 
                        : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
                    } ${index === highlightedIndex ? "bg-blue-50" : ""}`}
                    onClick={() => {
                      onChange(currency.code);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    role="option"
                    aria-selected={currency.code === value}
                  >
                    <div className="flex items-center space-x-3">
                      {currency.countryCode && (
                        <span 
                          className={`fi fi-${currency.countryCode} flex-shrink-0 rounded shadow-sm`}
                          style={{ width: '1.5em', height: '1.2em' }}
                          aria-hidden="true"
                        ></span>
                      )}
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-800 text-base">{currency.code}</span>
                          {currency.code === value && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Selected</span>
                          )}
                        </div>
                        <span className="text-gray-600 text-sm truncate">
                          {currency.description}
                        </span>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-8 text-gray-500 text-center">
                  <div className="text-gray-400 mb-2">🔍</div>
                  <div className="font-medium">No currencies found</div>
                  <div className="text-xs mt-1">Try a different search term</div>
                </li>
              )}
            </ul>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default CurrencyDropdown;
