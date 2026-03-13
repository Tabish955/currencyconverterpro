import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Fuse from 'fuse.js';
import CurrencyIcon from "./CurrencyIcon";
import { getCurrencyCategory, type CurrencyCategory } from "./currencyFlags";

export interface CurrencySymbol {
  code: string;
  description: string;
  countryCode?: string;
  aliases?: string[];
  category?: CurrencyCategory;
}

interface CurrencyDropdownProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  currencies: CurrencySymbol[];
  disabled?: boolean;
}

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
  BTC: ["bitcoin", "btc", "crypto"],
  ETH: ["ethereum", "ether"],
  BNB: ["binance", "binance coin"],
  SOL: ["solana"],
  XRP: ["ripple"],
  DOGE: ["dogecoin", "doge"],
  XAU: ["gold", "gold ounce"],
  XAG: ["silver", "silver ounce"],
};

const CATEGORY_LABELS: Record<CurrencyCategory, string> = {
  fiat: '🏦 Fiat',
  crypto: '₿ Crypto',
  metal: '🥇 Metal',
  regional: '🌐 Regional',
};

const CurrencyDropdown = ({ id, value, onChange, currencies, disabled = false }: CurrencyDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<CurrencyCategory | 'all'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const enrichedCurrencies = currencies.map(currency => ({
    ...currency,
    category: currency.category || getCurrencyCategory(currency.code),
    aliases: currencyAliases[currency.code] || []
  }));

  const fuseRef = useRef<Fuse<CurrencySymbol>>();

  useEffect(() => {
    fuseRef.current = new Fuse(enrichedCurrencies, {
      keys: ['code', 'description', 'aliases'],
      threshold: 0.3,
      includeScore: true
    });
  }, [currencies]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      setHighlightedIndex(0);
    }
  }, [isOpen]);

  const selectedCurrency = enrichedCurrencies.find((c) => c.code === value);

  let filteredCurrencies = searchTerm.trim() === ""
    ? enrichedCurrencies
    : fuseRef.current
      ? fuseRef.current.search(searchTerm).map(result => result.item)
      : enrichedCurrencies;

  // Apply category filter
  if (activeFilter !== 'all') {
    filteredCurrencies = filteredCurrencies.filter(c => 
      (c.category || getCurrencyCategory(c.code)) === activeFilter
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }
    switch (e.key) {
      case "Escape": setIsOpen(false); break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => Math.min(prev + 1, filteredCurrencies.length - 1));
        scrollToHighlighted();
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => Math.max(prev - 1, 0));
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
      case "Tab": setIsOpen(false); break;
    }
  };

  const scrollToHighlighted = () => {
    if (listRef.current && listRef.current.children[highlightedIndex]) {
      listRef.current.children[highlightedIndex].scrollIntoView({ block: "nearest" });
    }
  };

  return (
    <div className="relative inline-block w-full" ref={dropdownRef}>
      <button
        id={id}
        className={`w-full flex items-center justify-between py-3 px-4 rounded-xl border text-left transition-all duration-300 relative z-10 ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-[1.01]"
        }`}
        style={{
          background: 'hsl(var(--converter-input-bg))',
          borderColor: isOpen ? 'hsl(var(--converter-accent) / 0.5)' : 'hsl(var(--converter-border))',
          color: 'hsl(var(--converter-text))',
          boxShadow: isOpen ? '0 0 0 3px hsl(var(--converter-accent) / 0.1)' : 'none',
        }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <span className="truncate font-medium flex items-center">
          {selectedCurrency ? (
            <span className="flex items-center gap-2.5">
              <CurrencyIcon code={selectedCurrency.code} size="md" />
              <span className="font-bold">{selectedCurrency.code}</span>
              <span style={{ color: 'hsl(var(--converter-text-muted))' }} className="text-sm hidden sm:inline">
                {selectedCurrency.description}
              </span>
            </span>
          ) : (
            "Select currency"
          )}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 flex-shrink-0" style={{ color: 'hsl(var(--converter-text-muted))' }} />
        ) : (
          <ChevronDown className="h-4 w-4 flex-shrink-0" style={{ color: 'hsl(var(--converter-text-muted))' }} />
        )}
      </button>

      {isOpen && (
        <div
          className="absolute z-[9999] mt-2 w-full md:w-[420px] rounded-xl border overflow-hidden animate-fade-in"
          style={{
            background: 'hsl(var(--converter-card))',
            borderColor: 'hsl(var(--converter-accent) / 0.2)',
            boxShadow: '0 20px 50px -10px hsl(234 89% 20% / 0.5), 0 0 0 1px hsl(var(--converter-border) / 0.3)',
          }}
        >
          {/* Search */}
          <div className="p-3 border-b" style={{ borderColor: 'hsl(var(--converter-border) / 0.5)' }}>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4" style={{ color: 'hsl(var(--converter-accent))' }} />
              <input
                ref={searchInputRef}
                type="text"
                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none transition-all border"
                style={{
                  background: 'hsl(var(--converter-input-bg))',
                  borderColor: 'hsl(var(--converter-border))',
                  color: 'hsl(var(--converter-text))',
                }}
                placeholder="Search currency, country, or code..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setHighlightedIndex(0); }}
                onKeyDown={handleKeyDown}
              />
            </div>
            {/* Category filter tabs */}
            <div className="flex gap-1.5 mt-2">
              {(['all', 'fiat', 'crypto', 'metal', 'regional'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveFilter(cat); setHighlightedIndex(0); }}
                  className="px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all"
                  style={{
                    background: activeFilter === cat
                      ? 'hsl(var(--converter-accent) / 0.2)'
                      : 'hsl(var(--converter-input-bg))',
                    color: activeFilter === cat
                      ? 'hsl(var(--converter-accent))'
                      : 'hsl(var(--converter-text-muted))',
                    border: `1px solid ${activeFilter === cat
                      ? 'hsl(var(--converter-accent) / 0.4)'
                      : 'hsl(var(--converter-border) / 0.5)'}`,
                  }}
                >
                  {cat === 'all' ? '🌍 All' : CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <ScrollArea className="h-72 converter-scrollbar">
            <ul ref={listRef} className="py-1" role="listbox" tabIndex={-1}>
              {filteredCurrencies.length > 0 ? (
                filteredCurrencies.map((currency, index) => {
                  const isSelected = currency.code === value;
                  const isHighlighted = index === highlightedIndex;
                  const cat = currency.category || getCurrencyCategory(currency.code);
                  return (
                    <li
                      key={currency.code}
                      className="px-3 py-2.5 cursor-pointer transition-all duration-150"
                      style={{
                        background: isSelected
                          ? 'hsl(var(--converter-accent) / 0.12)'
                          : isHighlighted
                          ? 'hsl(var(--converter-card-hover))'
                          : 'transparent',
                        borderLeft: isSelected ? '3px solid hsl(var(--converter-accent))' : '3px solid transparent',
                      }}
                      onClick={() => { onChange(currency.code); setIsOpen(false); setSearchTerm(""); }}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="flex items-center gap-3">
                        <CurrencyIcon code={currency.code} size="lg" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm" style={{ color: 'hsl(var(--converter-text))' }}>{currency.code}</span>
                            {cat !== 'fiat' && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wide"
                                style={{
                                  background: cat === 'crypto' 
                                    ? 'hsl(45 100% 50% / 0.12)' 
                                    : cat === 'metal' 
                                    ? 'hsl(38 80% 50% / 0.12)' 
                                    : 'hsl(200 80% 50% / 0.12)',
                                  color: cat === 'crypto' 
                                    ? 'hsl(45 100% 65%)' 
                                    : cat === 'metal' 
                                    ? 'hsl(38 80% 65%)' 
                                    : 'hsl(200 80% 65%)',
                                }}
                              >
                                {cat}
                              </span>
                            )}
                            {isSelected && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                                style={{
                                  background: 'hsl(var(--converter-accent) / 0.2)',
                                  color: 'hsl(var(--converter-accent))',
                                }}
                              >
                                Selected
                              </span>
                            )}
                          </div>
                          <span className="text-xs truncate block" style={{ color: 'hsl(var(--converter-text-muted))' }}>
                            {currency.description}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })
              ) : (
                <li className="px-4 py-8 text-center">
                  <div className="text-2xl mb-2">🔍</div>
                  <div className="font-medium text-sm" style={{ color: 'hsl(var(--converter-text-muted))' }}>No currencies found</div>
                  <div className="text-xs mt-1" style={{ color: 'hsl(var(--converter-text-muted))' }}>Try a different search term</div>
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
