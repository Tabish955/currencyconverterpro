import { useState, useRef, useEffect } from "react";
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Enhanced search with fuzzy matching
  const fuse = new Fuse(currencies, {
    keys: [
      { name: "code", weight: 0.4 },
      { name: "description", weight: 0.6 },
    ],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 1,
  });

  const filteredCurrencies = searchQuery
    ? fuse.search(searchQuery).map((result) => result.item)
    : currencies;

  // Group currencies: recently used first, then alphabetically
  const recentCurrencies = filteredCurrencies.filter((currency) =>
    recentlyUsed.includes(currency.code)
  );
  const otherCurrencies = filteredCurrencies.filter(
    (currency) => !recentlyUsed.includes(currency.code)
  );

  const groupedCurrencies = [
    ...(recentCurrencies.length > 0 ? recentCurrencies : []),
    ...otherCurrencies,
  ];

  const selectedCurrency = currencies.find((c) => c.code === value);

  const handleSelect = (currency: CurrencySymbol) => {
    onChange(currency.code);
    setIsOpen(false);
    setSearchQuery("");
    setHighlightedIndex(-1);
  };

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
        setSearchQuery("");
        setHighlightedIndex(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < groupedCurrencies.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : groupedCurrencies.length - 1
        );
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
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[
        highlightedIndex + (recentCurrencies.length > 0 ? 1 : 0)
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightedIndex, recentCurrencies.length]);

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
                placeholder="Search currencies..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setHighlightedIndex(-1);
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Currency List */}
          <ul
            ref={listRef}
            className="max-h-64 overflow-y-auto py-1"
            role="listbox"
            aria-labelledby={`${id}-label`}
          >
            {/* Recently Used Section */}
            {recentCurrencies.length > 0 && !searchQuery && (
              <>
                <li className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-100">
                  Recently Used
                </li>
                {recentCurrencies.map((currency, index) => (
                  <li
                    key={`recent-${currency.code}`}
                    onClick={() => handleSelect(currency)}
                    className={`px-3 py-3 cursor-pointer flex items-center space-x-3 hover:bg-blue-50 transition-colors ${
                      value === currency.code
                        ? "bg-blue-100 border-r-4 border-blue-500"
                        : ""
                    } ${
                      highlightedIndex === index ? "bg-blue-50" : ""
                    }`}
                    role="option"
                    aria-selected={value === currency.code}
                  >
                    {currency.countryCode && (
                      <FlagIcon currency={currency as EnrichedCurrencySymbol} />
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900 text-sm">
                          {currency.code}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          Recent
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 truncate">
                        {currency.description}
                      </span>
                    </div>
                  </li>
                ))}
              </>
            )}

            {/* All Currencies Section */}
            {otherCurrencies.length > 0 && (
              <>
                {recentCurrencies.length > 0 && !searchQuery && (
                  <li className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-100">
                    All Currencies
                  </li>
                )}
                {otherCurrencies.map((currency, index) => {
                  const actualIndex = recentCurrencies.length + index;
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
                      role="option"
                      aria-selected={value === currency.code}
                    >
                      {currency.countryCode && (
                        <FlagIcon currency={currency as EnrichedCurrencySymbol} />
                      )}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-semibold text-gray-900 text-sm">
                          {currency.code}
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                          {currency.description}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </>
            )}

            {/* No Results */}
            {filteredCurrencies.length === 0 && (
              <li className="px-3 py-6 text-center text-gray-500 text-sm">
                <div className="flex flex-col items-center space-y-2">
                  <Search className="h-8 w-8 text-gray-300" />
                  <span>No currencies found</span>
                  <span className="text-xs">Try adjusting your search</span>
                </div>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CurrencyDropdown;
