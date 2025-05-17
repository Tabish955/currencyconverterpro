
import { useState, useRef, useEffect } from "react";
import { CurrencySymbol } from "./CurrencyConverter";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

interface CurrencyDropdownProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  currencies: CurrencySymbol[];
  disabled?: boolean;
}

const CurrencyDropdown = ({
  id,
  value,
  onChange,
  currencies,
  disabled = false,
}: CurrencyDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    }
  }, [isOpen]);

  // Get the selected currency details
  const selectedCurrency = currencies.find((c) => c.code === value);

  // Filter currencies based on search term
  const filteredCurrencies = currencies.filter(
    (currency) =>
      currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currency.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative inline-block w-44" ref={dropdownRef}>
      <button
        id={id}
        className={`w-full flex items-center justify-between py-2 px-3 border border-gray-300 rounded-md bg-white text-left ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <span className="truncate font-medium">
          {selectedCurrency ? selectedCurrency.code : "Select currency"}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="sticky top-0 bg-white p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search currencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <ul className="py-1" role="listbox">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((currency) => (
                <li
                  key={currency.code}
                  className={`px-3 py-2 cursor-pointer hover:bg-blue-50 flex justify-between ${
                    currency.code === value ? "bg-blue-100" : ""
                  }`}
                  onClick={() => {
                    onChange(currency.code);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  role="option"
                  aria-selected={currency.code === value}
                >
                  <span className="font-medium">{currency.code}</span>
                  <span className="text-gray-500 text-sm truncate ml-2">
                    {currency.description}
                  </span>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-gray-500 text-center">
                No currencies found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CurrencyDropdown;
