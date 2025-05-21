
import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Fuse from 'fuse.js';
import 'flag-icons/css/flag-icons.min.css';
import { isCryptoCurrency, cryptoSymbolToId } from "./CryptoApiUtils";

export interface CurrencySymbol {
  code: string;
  description: string;
  countryCode?: string;
  isCrypto?: boolean;
  cryptoId?: string;
  image?: string;
  aliases?: string[];
  group?: 'fiat' | 'crypto'; // For grouping in the dropdown
}

interface CurrencyDropdownProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  currencies: CurrencySymbol[];
  disabled?: boolean;
  includeCrypto?: boolean;
  recentlyUsed?: string[]; // Added recently used currencies
}

// Map ISO currency codes to country codes for flags
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
  // Additional mappings for previously missing flags
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
  LKR: "lk", // Sri Lanka
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
  // Ensure all currencies have a flag - fallback to UN flag
  // for any currency not explicitly mapped
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
  SAR: ["saudi riyal", "saudi arabia", "riyal"],
  CAD: ["canadian dollar", "canada"],
  AUD: ["australian dollar", "australia"],
  NZD: ["new zealand dollar", "new zealand", "kiwi"],
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
  // Crypto aliases
  BTC: ["bitcoin", "btc", "xbt", "crypto"],
  ETH: ["ethereum", "ether"],
  USDT: ["tether", "stablecoin"],
  BNB: ["binance coin", "binance"],
  SOL: ["solana"],
  XRP: ["ripple", "xrp"],
  ADA: ["cardano", "ada"],
  DOT: ["polkadot", "dot"],
  DOGE: ["dogecoin", "doge", "meme coin"],
  SHIB: ["shiba inu", "shib", "meme coin"],
  LTC: ["litecoin", "ltc"],
  MATIC: ["polygon", "matic"],
  AVAX: ["avalanche", "avax"],
  LINK: ["chainlink", "link"],
  UNI: ["uniswap", "uni"]
};

const CurrencyDropdown = ({
  id,
  value,
  onChange,
  currencies,
  disabled = false,
  includeCrypto = false,
  recentlyUsed = [],
}: CurrencyDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');

  // Prepare currency data with country codes and aliases
  const enrichedCurrencies = currencies.map(currency => ({
    ...currency,
    countryCode: currency.isCrypto ? undefined : currencyToCountryMap[currency.code] || "un", // Fallback to UN flag
    aliases: currency.isCrypto ? 
      currencyAliases[currency.code] || [] : 
      currencyAliases[currency.code] || []
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

  // Handle dropdown positioning to prevent overflow
  useEffect(() => {
    const updateDropdownPosition = () => {
      if (dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const availableBottom = window.innerHeight - rect.bottom;
        // If less than 300px available at bottom, position dropdown above
        setDropdownPosition(availableBottom < 300 ? 'top' : 'bottom');
      }
    };

    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener('scroll', updateDropdownPosition);
      window.addEventListener('resize', updateDropdownPosition);
    }

    return () => {
      window.removeEventListener('scroll', updateDropdownPosition);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [isOpen]);

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

  // Determine which currencies to actually show based on includeCrypto prop
  const displayedCurrencies = includeCrypto 
    ? filteredCurrencies 
    : filteredCurrencies.filter(currency => !currency.isCrypto);

  // Get recently used currencies
  const recentCurrencies = recentlyUsed
    .map(code => enrichedCurrencies.find(c => c.code === code))
    .filter((c): c is CurrencySymbol => c !== undefined);

  // Group currencies by type (fiat and crypto)
  const groupedCurrencies = displayedCurrencies.reduce<{
    fiat: CurrencySymbol[];
    crypto: CurrencySymbol[];
  }>((acc, currency) => {
    if (currency.isCrypto) {
      acc.crypto.push(currency);
    } else {
      acc.fiat.push(currency);
    }
    return acc;
  }, { fiat: [], crypto: [] });

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
          Math.min(prevIndex + 1, displayedCurrencies.length - 1)
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
        if (displayedCurrencies[highlightedIndex]) {
          onChange(displayedCurrencies[highlightedIndex].code);
          setIsOpen(false);
          setSearchTerm("");
        }
        break;
      case "Tab":
        setIsOpen(false);
        break;
      case "/":
        if (!isOpen) {
          e.preventDefault();
          setIsOpen(true);
        }
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

  // Render a currency list item
  const renderCurrencyItem = (currency: CurrencySymbol, index: number) => (
    <li
      key={currency.code}
      className={`px-3 py-2 cursor-pointer transition-all duration-150 ${
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
        {currency.isCrypto ? (
          currency.image ? (
            <img
              src={currency.image}
              alt={currency.code}
              className="w-5 h-5 mr-2 rounded-full flex-shrink-0"
              onError={(e) => {
                // Fallback icon if image fails to load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="w-5 h-5 mr-2 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {currency.code.substring(0, 1)}
            </span>
          )
        ) : (
          currency.countryCode && (
            <span 
              className={`fi fi-${currency.countryCode} mr-2 flex-shrink-0`}
              style={{ width: '1.2em', height: '1em' }}
              aria-hidden="true"
            ></span>
          )
        )}
        <div className="flex flex-col">
          <div className="flex items-center">
            <span className="font-bold">{currency.code}</span>
            {currency.isCrypto && (
              <span className="ml-2 text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded">Crypto</span>
            )}
          </div>
          <span className="text-gray-500 text-sm truncate">
            {currency.description}
          </span>
        </div>
      </div>
    </li>
  );

  return (
    <div className="relative inline-block w-full" ref={dropdownRef}>
      <button
        id={id}
        className={`w-full flex items-center justify-between py-3 px-3 border border-gray-300 rounded-md bg-white text-left shadow-sm hover:shadow-md transition-all duration-300 ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
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
              {selectedCurrency.isCrypto ? (
                selectedCurrency.image ? (
                  <img 
                    src={selectedCurrency.image} 
                    alt={selectedCurrency.code}
                    className="w-5 h-5 mr-2 rounded-full"
                    onError={(e) => {
                      // Fallback icon if image fails to load
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="w-5 h-5 mr-2 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-bold">
                    {selectedCurrency.code.substring(0, 1)}
                  </span>
                )
              ) : (
                selectedCurrency.countryCode && (
                  <span 
                    className={`fi fi-${selectedCurrency.countryCode} mr-2`} 
                    style={{ width: '1.2em', height: '1em' }}
                    aria-hidden="true"
                  ></span>
                )
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
          className={`absolute ${dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 z-50 w-72 md:w-96 bg-white border border-gray-200 rounded-md shadow-lg animate-fade-in fixed-dropdown`}
          style={{ 
            animation: 'fade-in 0.2s ease-out',
            transformOrigin: dropdownPosition === 'top' ? 'bottom center' : 'top center',
            maxHeight: '80vh'
          }}
        >
          <div className="sticky top-0 bg-white p-2 border-b border-gray-200 z-10">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Search currencies, countries, or codes..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(0); // Reset highlight when search changes
                }}
                onKeyDown={handleKeyDown}
                aria-controls="currency-list"
              />
              <kbd className="absolute right-3 top-2.5 hidden md:flex items-center justify-center rounded border border-gray-200 bg-gray-100 px-1.5 text-xs text-gray-500">
                /
              </kbd>
            </div>
          </div>

          <ScrollArea className="h-[calc(80vh-50px)]">
            <ul 
              id="currency-list"
              ref={listRef}
              className="py-1" 
              role="listbox"
              tabIndex={-1}
            >
              {/* Recently Used Section */}
              {recentCurrencies.length > 0 && searchTerm === '' && (
                <>
                  <li className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                    Recently Used
                  </li>
                  {recentCurrencies.map((currency, index) => 
                    renderCurrencyItem(currency, index)
                  )}
                  <li className="border-b border-gray-200 my-1"></li>
                </>
              )}

              {/* Crypto Currency Section */}
              {includeCrypto && groupedCurrencies.crypto.length > 0 && (
                <>
                  <li className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                    Cryptocurrencies
                  </li>
                  {groupedCurrencies.crypto.map((currency, index) => 
                    renderCurrencyItem(currency, recentCurrencies.length + index)
                  )}
                  <li className="border-b border-gray-200 my-1"></li>
                </>
              )}

              {/* Fiat Currency Section */}
              {groupedCurrencies.fiat.length > 0 && (
                <>
                  <li className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                    Fiat Currencies
                  </li>
                  {groupedCurrencies.fiat.map((currency, index) => 
                    renderCurrencyItem(currency, recentCurrencies.length + (includeCrypto ? groupedCurrencies.crypto.length : 0) + index)
                  )}
                </>
              )}

              {/* No results */}
              {displayedCurrencies.length === 0 && (
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
