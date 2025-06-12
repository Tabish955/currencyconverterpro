
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { isCryptoCurrency } from './CryptoApiUtils';

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface CurrencyConverterProps {
  mode?: "fiat" | "crypto";
}

const fetchExchangeRate = async (fromCurrency: string, toCurrency: string, amount: number) => {
  const apiKey = 'YOUR_API_KEY'; // Replace with your actual API key
  const apiUrl = `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`;

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();

  if (data.rates && data.rates[toCurrency]) {
    return data.rates[toCurrency] * amount;
  } else {
    throw new Error('Currency conversion failed');
  }
};

const CurrencyInput = ({ value, onChange, currency, onCurrencyChange, currencies, disabled, readOnly, className }: {
  value: number;
  onChange: (value: number) => void;
  currency: string;
  onCurrencyChange: (currency: string) => void;
  currencies: Currency[];
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
}) => {
  return (
    <div>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={className}
        disabled={disabled}
        readOnly={readOnly}
      />
      <Select onValueChange={onCurrencyChange} defaultValue={currency}>
        <SelectTrigger className="w-full mt-2">
          <SelectValue placeholder="Select a currency" />
        </SelectTrigger>
        <SelectContent>
          {currencies.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              {currency.name} ({currency.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const CurrencyConverter = ({ mode = "fiat" }: CurrencyConverterProps) => {
  const [amount, setAmount] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState<string>("KWD");
  const [toCurrency, setToCurrency] = useState<string>("PKR");
  const [isSwapping, setIsSwapping] = useState(false);

  const currencies: Currency[] = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
    { code: "CAD", name: "Canadian Dollar", symbol: "$" },
    { code: "AUD", name: "Australian Dollar", symbol: "$" },
    { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
    { code: "SEK", name: "Swedish Krona", symbol: "kr" },
    { code: "NZD", name: "New Zealand Dollar", symbol: "$" },
    { code: "MXN", name: "Mexican Peso", symbol: "$" },
    { code: "SGD", name: "Singapore Dollar", symbol: "$" },
    { code: "HKD", name: "Hong Kong Dollar", symbol: "$" },
    { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
    { code: "KRW", name: "South Korean Won", symbol: "₩" },
    { code: "TRY", name: "Turkish Lira", symbol: "₺" },
    { code: "RUB", name: "Russian Ruble", symbol: "₽" },
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "BRL", name: "Brazilian Real", symbol: "R$" },
    { code: "ZAR", name: "South African Rand", symbol: "R" },
    { code: "AED", name: "United Arab Emirates Dirham", symbol: "د.إ" },
    { code: "SAR", name: "Saudi Riyal", symbol: "ر.س" },
    { code: "PLN", name: "Polish Zloty", symbol: "zł" },
    { code: "THB", name: "Thai Baht", symbol: "฿" },
    { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
    { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
    { code: "PHP", name: "Philippine Peso", symbol: "₱" },
    { code: "TWD", name: "New Taiwan Dollar", symbol: "NT$"},
    { code: "KWD", name: "Kuwaiti Dinar", symbol: "KD"},
    { code: "PKR", name: "Pakistani Rupee", symbol: "PKR"},
  ];

  const enrichedCurrencies = currencies.map(c => ({
    ...c,
  }));

  const { data: convertedAmount, isLoading, isError, refetch } = useQuery({
    queryKey: ['exchangeRate', fromCurrency, toCurrency, amount],
    queryFn: () => fetchExchangeRate(fromCurrency, toCurrency, amount),
    enabled: !isSwapping,
    meta: {
      onError: (error: any) => {
        toast.error("Conversion Error", {
          description: error.message || "Failed to convert currency.",
          duration: 5000,
        });
      },
    },
  });

  useEffect(() => {
    refetch();
  }, [fromCurrency, toCurrency, amount, refetch]);

  const handleSwap = () => {
    setIsSwapping(true);
    setTimeout(() => {
      const temp = fromCurrency;
      setFromCurrency(toCurrency);
      setToCurrency(temp);
      setAmount(1); // Reset amount to 1 when swapping
      setIsSwapping(false);
    }, 300);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">From</label>
          <CurrencyInput 
            value={amount}
            onChange={setAmount}
            currency={fromCurrency}
            onCurrencyChange={setFromCurrency}
            currencies={enrichedCurrencies}
            disabled={isLoading}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">To</label>
          <CurrencyInput 
            value={typeof convertedAmount === 'number' ? convertedAmount : 0}
            onChange={() => {}} // Read-only for result
            currency={toCurrency}
            onCurrencyChange={setToCurrency}
            currencies={enrichedCurrencies}
            disabled={isLoading}
            readOnly={true}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleSwap}
          disabled={isLoading || isSwapping}
          className={`p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transform transition-all duration-300 ${
            isSwapping ? 'rotate-180 scale-110' : 'hover:scale-105'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-600 hover:to-purple-700'}`}
        >
          <ArrowDownUp className={`h-5 w-5 transition-transform duration-300 ${isSwapping ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isError && (
        <div className="text-red-500 text-center">
          Failed to load exchange rates. Please check your API key and network connection.
        </div>
      )}

      {isLoading && (
        <div className="text-center">
          Loading...
        </div>
      )}
    </div>
  );
};

export default CurrencyConverter;
