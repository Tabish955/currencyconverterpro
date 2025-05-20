import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Fuse from 'fuse.js';
import 'flag-icons/css/flag-icons.min.css';

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

// Currency to country code mapping (ISO 4217 to ISO 3166-1)
const currencyToCountryCode: Record<string, string> = {
  USD: "us",
  EUR: "eu",
  GBP: "gb",
  JPY: "jp",
  AUD: "au",
  CAD: "ca",
  CHF: "ch",
  CNY: "cn",
  INR: "in",
  PKR: "pk",
  KWD: "kw",
  AED: "ae",
  SAR: "sa",
  QAR: "qa",
  BHD: "bh",
  OMR: "om",
  EGP: "eg",
  TRY: "tr",
  RUB: "ru",
  NGN: "ng",
  ZAR: "za",
  BRL: "br",
  MXN: "mx",
  SGD: "sg",
  NZD: "nz",
  HKD: "hk",
  KRW: "kr",
  IDR: "id",
  MYR: "my",
  THB: "th",
  VND: "vn",
  PHP: "ph",
  AFN: "af",
  DZD: "dz",
  ARS: "ar",
  AMD: "am",
  AWG: "aw",
  AZN: "az",
  BSD: "bs",
  BBD: "bb",
  BYN: "by",
  BZD: "bz",
  BMD: "bm",
  BOB: "bo",
  BAM: "ba",
  BWP: "bw",
  BGN: "bg",
  BIF: "bi",
  KHR: "kh",
  CVE: "cv",
  XAF: "cm", // Central African CFA franc - using Cameroon
  CLP: "cl",
  COP: "co",
  KMF: "km",
  CDF: "cd",
  CRC: "cr",
  HRK: "hr",
  CZK: "cz",
  DKK: "dk",
  DJF: "dj",
  DOP: "do",
  XCD: "ag", // East Caribbean dollar - using Antigua and Barbuda
  ETB: "et",
  FJD: "fj",
  GMD: "gm",
  GEL: "ge",
  GHS: "gh",
  GTQ: "gt",
  GNF: "gn",
  GYD: "gy",
  HTG: "ht",
  HNL: "hn",
  HUF: "hu",
  ISK: "is",
  IRR: "ir",
  IQD: "iq",
  ILS: "il",
  JMD: "jm",
  JOD: "jo",
  KZT: "kz",
  KES: "ke",
  LAK: "la",
  LBP: "lb",
  LSL: "ls",
  LRD: "lr",
  LYD: "ly",
  MKD: "mk",
  MGA: "mg",
  MWK: "mw",
  MVR: "mv",
  MRU: "mr",
  MUR: "mu",
  MDL: "md",
  MNT: "mn",
  MAD: "ma",
  MMK: "mm",
  NAD: "na",
  NPR: "np",
  NIO: "ni",
  XOF: "sn", // West African CFA franc - using Senegal
  NOK: "no",
  PAB: "pa",
  PGK: "pg",
  PYG: "py",
  PEN: "pe",
  PLN: "pl",
  RON: "ro",
  RWF: "rw",
  SVC: "sv",
  WST: "ws",
  STN: "st",
  RSD: "rs",
  SLL: "sl",
  SEK: "se",
  SOS: "so",
  SSP: "ss",
  LKR: "lk",
  SDG: "sd",
  SRD: "sr",
  SZL: "sz",
  SYP: "sy",
  TWD: "tw",
  TZS: "tz",
  TOP: "to",
  TTD: "tt",
  TND: "tn",
  UGX: "ug",
  UAH: "ua",
  UYU: "uy",
  UZS: "uz",
  VES: "ve",
  YER: "ye",
  ZMW: "zm"
};

// Currency aliases for improved search
const currencyAliases: Record<string, string[]> = {
  USD: ["dollar", "us dollar", "american dollar", "america", "united states", "usa", "us", "united states dollar"],
  EUR: ["euro", "europe", "european", "eurozone", "european union", "eu"],
  GBP: ["pound", "british pound", "sterling", "uk", "united kingdom", "britain", "great britain", "england"],
  JPY: ["yen", "japanese yen", "japan"],
  INR: ["indian rupee", "india", "rupee"],
  PKR: ["pakistani rupee", "pakistan"],
  KWD: ["kuwaiti dinar", "kuwait", "dinar"],
  AED: ["dirham", "emirati dirham", "uae", "united arab emirates", "dubai", "abu dhabi"],
  SAR: ["saudi riyal", "saudi arabia", "riyal"]
  // Add more aliases as needed
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
        className={`w-full flex items-center justify-between py-3 px-3 border border-gray-300 rounded-md bg-white text-left shadow-sm hover:shadow-md transition-all duration-300 ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
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
        <div className="absolute z-50 mt-1 w-72 md:w-96 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="sticky top-0 bg-white p-2 border-b border-gray-200 z-10">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search currencies, countries, or codes..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(0); // Reset highlight when search changes
                }}
                onKeyDown={handleKeyDown}
                aria-controls="currency-list"
              />
            </div>
          </div>

          <ScrollArea className="h-72">
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
                    className={`px-3 py-2 cursor-pointer transition-colors ${
                      currency.code === value ? "bg-blue-100" : "hover:bg-blue-50"
                    } ${index === highlightedIndex ? "bg-blue-50" : ""}`}
                    onClick={() => {
                      onChange(currency.code);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    role="option"
                    aria-selected={currency.code === value}
                  >
                    <div className="flex items-center">
                      {currency.countryCode && (
                        <span 
                          className={`fi fi-${currency.countryCode} mr-2 flex-shrink-0`}
                          style={{ width: '1.2em', height: '1em' }}
                          aria-hidden="true"
                        ></span>
                      )}
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <span className="font-bold">{currency.code}</span>
                        </div>
                        <span className="text-gray-500 text-sm truncate">
                          {currency.description}
                        </span>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-3 py-4 text-gray-500 text-center">
                  No currencies found
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
