// High-performance virtualized currency dropdown with optimized rendering
import React, { 
  useState, 
  useRef, 
  useEffect, 
  useMemo, 
  useCallback, 
  memo 
} from "react";
import { FixedSizeList as List } from 'react-window';
import { ChevronDown, Search, X } from "lucide-react";
import LazyFlag from './LazyFlag';
import { useSearchWorker } from '@/hooks/useSearchWorker';
import { usePerformanceDetection } from '@/hooks/usePerformanceDetection';

interface CurrencySymbol {
  code: string;
  description: string;
  countryCode?: string;
  aliases?: string[];
}

interface VirtualizedDropdownProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  currencies: CurrencySymbol[];
  recentlyUsed?: string[];
  placeholder?: string;
  className?: string;
}

// Optimized debounce hook
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

// Memoized currency item component for virtual list
const CurrencyItem = memo<{
  index: number;
  style: React.CSSProperties;
  data: {
    items: CurrencySymbol[];
    selectedValue: string;
    recentlyUsed: string[];
    onSelect: (currency: CurrencySymbol) => void;
    highlightedIndex: number;
    enableLightMode: boolean;
  };
}>(({ index, style, data }) => {
  const { items, selectedValue, recentlyUsed, onSelect, highlightedIndex, enableLightMode } = data;
  const currency = items[index];
  
  if (!currency) return null;

  const isSelected = selectedValue === currency.code;
  const isRecent = recentlyUsed.includes(currency.code);
  const isHighlighted = highlightedIndex === index;

  const handleClick = useCallback(() => {
    onSelect(currency);
  }, [currency, onSelect]);

  return (
    <div
      style={style}
      onClick={handleClick}
      className={`px-3 py-3 cursor-pointer flex items-center space-x-3 transition-colors ${
        isSelected
          ? "bg-blue-100 border-r-4 border-blue-500"
          : ""
      } ${
        isHighlighted ? "bg-blue-50" : ""
      } ${
        !isSelected && !isHighlighted ? "hover:bg-blue-50" : ""
      }`}
      role="option"
      aria-selected={isSelected}
    >
      {currency.countryCode && !enableLightMode && (
        <LazyFlag 
          countryCode={currency.countryCode} 
          currencyCode={currency.code}
          size="sm"
        />
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
    </div>
  );
});

CurrencyItem.displayName = 'CurrencyItem';

const VirtualizedDropdown = memo<VirtualizedDropdownProps>(({
  id,
  value,
  onChange,
  currencies,
  recentlyUsed = [],
  placeholder = "Select currency",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [filteredCodes, setFilteredCodes] = useState<string[]>([]);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<List>(null);
  
  // Performance detection
  const { enableLightMode } = usePerformanceDetection();
  
  // Search worker for offloading expensive operations
  const { search, isWorkerReady } = useSearchWorker(currencies);
  
  // Debounce search query for performance
  const debouncedSearchQuery = useDebounce(searchQuery, 200);

  // Memoized currency map for quick lookups
  const currencyMap = useMemo(() => {
    const map = new Map<string, CurrencySymbol>();
    currencies.forEach(currency => {
      map.set(currency.code, currency);
    });
    return map;
  }, [currencies]);

  // Perform search with worker
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchQuery.trim()) {
        // Show all currencies when no search query
        setFilteredCodes(currencies.map(c => c.code));
        return;
      }

      try {
        const results = await search(debouncedSearchQuery);
        setFilteredCodes(results);
      } catch (error) {
        console.warn('Search failed, using fallback:', error);
        // Fallback search
        const filtered = currencies
          .filter(currency => 
            currency.code.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            currency.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
          )
          .map(currency => currency.code);
        setFilteredCodes(filtered);
      }
    };

    performSearch();
  }, [debouncedSearchQuery, currencies, search]);

  // Memoized filtered and grouped currencies
  const { groupedCurrencies, selectedCurrency } = useMemo(() => {
    const filtered = filteredCodes
      .map(code => currencyMap.get(code))
      .filter(Boolean) as CurrencySymbol[];

    // Group: recently used first, then others
    const recentCurrencies = filtered.filter(currency =>
      recentlyUsed.includes(currency.code)
    );
    const otherCurrencies = filtered.filter(
      currency => !recentlyUsed.includes(currency.code)
    );

    const grouped = [
      ...(recentCurrencies.length > 0 ? recentCurrencies : []),
      ...otherCurrencies,
    ];

    const selected = currencyMap.get(value);

    return { 
      groupedCurrencies: grouped, 
      selectedCurrency: selected 
    };
  }, [filteredCodes, currencyMap, recentlyUsed, value]);

  // Optimized selection handler
  const handleSelect = useCallback((currency: CurrencySymbol) => {
    onChange(currency.code);
    setIsOpen(false);
    setSearchQuery("");
    setHighlightedIndex(-1);
  }, [onChange]);

  // Optimized keyboard navigation
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
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => {
          const newIndex = prev < groupedCurrencies.length - 1 ? prev + 1 : 0;
          // Scroll to item in virtual list
          if (listRef.current) {
            listRef.current.scrollToItem(newIndex, 'smart');
          }
          return newIndex;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : groupedCurrencies.length - 1;
          // Scroll to item in virtual list
          if (listRef.current) {
            listRef.current.scrollToItem(newIndex, 'smart');
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
        break;
    }
  }, [isOpen, groupedCurrencies.length, highlightedIndex, handleSelect, groupedCurrencies]);

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

    document.addEventListener("mousedown", handleClickOutside, { passive: true });
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Reset highlighted index when search changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [debouncedSearchQuery]);

  // Memoized list data for virtual scrolling
  const listData = useMemo(() => ({
    items: groupedCurrencies,
    selectedValue: value,
    recentlyUsed,
    onSelect: handleSelect,
    highlightedIndex,
    enableLightMode
  }), [groupedCurrencies, value, recentlyUsed, handleSelect, highlightedIndex, enableLightMode]);

  // Determine list height based on performance mode
  const maxHeight = enableLightMode ? 240 : 320; // Reduce height on low-end devices
  const itemHeight = 64;
  const maxItems = Math.floor(maxHeight / itemHeight);
  const listHeight = Math.min(groupedCurrencies.length * itemHeight, maxHeight);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between px-3 py-3 border border-gray-300 rounded-md bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 group ${
          enableLightMode ? 'shadow-sm' : 'shadow-md'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${id}-label`}
      >
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {selectedCurrency && selectedCurrency.countryCode && !enableLightMode && (
            <LazyFlag 
              countryCode={selectedCurrency.countryCode} 
              currencyCode={selectedCurrency.code}
            />
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

      {/* Virtualized Dropdown Menu */}
      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden ${
          enableLightMode ? 'shadow-lg' : 'shadow-2xl'
        }`}>
          {/* Search Box */}
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search currencies, countries, or codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

          {/* Virtual List */}
          {groupedCurrencies.length > 0 ? (
            <List
              ref={listRef}
              height={listHeight}
              itemCount={groupedCurrencies.length}
              itemSize={itemHeight}
              itemData={listData}
              overscanCount={enableLightMode ? 2 : 5} // Reduce overscan on low-end devices
            >
              {CurrencyItem}
            </List>
          ) : (
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
});

VirtualizedDropdown.displayName = 'VirtualizedDropdown';

export default VirtualizedDropdown;