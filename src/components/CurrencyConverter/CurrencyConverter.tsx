
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDownUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { isCryptoCurrency } from './CryptoApiUtils';
import VirtualizedDropdown from './VirtualizedDropdown';
import { currencyCache } from '@/utils/currencyCache';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  countryCode: string;
}

interface CurrencyConverterProps {
  mode?: "fiat" | "crypto";
}

const fetchExchangeRate = async (fromCurrency: string, toCurrency: string, amount: number) => {
  const cacheKey = `${fromCurrency}-${toCurrency}`;
  
  // Try cache first
  const cachedRate = await currencyCache.get(cacheKey);
  if (cachedRate) {
    return cachedRate * amount;
  }

  const apiKey = 'YOUR_API_KEY'; // Replace with your actual API key
  const apiUrl = `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`;

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();

  if (data.rates && data.rates[toCurrency]) {
    const rate = data.rates[toCurrency];
    // Cache the rate for future use
    await currencyCache.set(cacheKey, rate);
    return rate * amount;
  } else {
    throw new Error('Currency conversion failed');
  }
};

const CurrencyConverter = ({ mode = "fiat" }: CurrencyConverterProps) => {
  const [amount, setAmount] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState<string>("KWD");
  const [toCurrency, setToCurrency] = useState<string>("PKR");
  const [isSwapping, setIsSwapping] = useState(false);

  const currencies = [
    { code: "USD", description: "US Dollar", symbol: "$", countryCode: "us" },
    { code: "EUR", description: "Euro", symbol: "€", countryCode: "eu" },
    { code: "GBP", description: "British Pound", symbol: "£", countryCode: "gb" },
    { code: "JPY", description: "Japanese Yen", symbol: "¥", countryCode: "jp" },
    { code: "CAD", description: "Canadian Dollar", symbol: "$", countryCode: "ca" },
    { code: "AUD", description: "Australian Dollar", symbol: "$", countryCode: "au" },
    { code: "CHF", description: "Swiss Franc", symbol: "Fr", countryCode: "ch" },
    { code: "CNY", description: "Chinese Yuan", symbol: "¥", countryCode: "cn" },
    { code: "SEK", description: "Swedish Krona", symbol: "kr", countryCode: "se" },
    { code: "NZD", description: "New Zealand Dollar", symbol: "$", countryCode: "nz" },
    { code: "MXN", description: "Mexican Peso", symbol: "$", countryCode: "mx" },
    { code: "SGD", description: "Singapore Dollar", symbol: "$", countryCode: "sg" },
    { code: "HKD", description: "Hong Kong Dollar", symbol: "$", countryCode: "hk" },
    { code: "NOK", description: "Norwegian Krone", symbol: "kr", countryCode: "no" },
    { code: "KRW", description: "South Korean Won", symbol: "₩", countryCode: "kr" },
    { code: "TRY", description: "Turkish Lira", symbol: "₺", countryCode: "tr" },
    { code: "RUB", description: "Russian Ruble", symbol: "₽", countryCode: "ru" },
    { code: "INR", description: "Indian Rupee", symbol: "₹", countryCode: "in" },
    { code: "BRL", description: "Brazilian Real", symbol: "R$", countryCode: "br" },
    { code: "ZAR", description: "South African Rand", symbol: "R", countryCode: "za" },
    { code: "AED", description: "United Arab Emirates Dirham", symbol: "د.إ", countryCode: "ae" },
    { code: "SAR", description: "Saudi Riyal", symbol: "ر.س", countryCode: "sa" },
    { code: "PLN", description: "Polish Zloty", symbol: "zł", countryCode: "pl" },
    { code: "THB", description: "Thai Baht", symbol: "฿", countryCode: "th" },
    { code: "IDR", description: "Indonesian Rupiah", symbol: "Rp", countryCode: "id" },
    { code: "MYR", description: "Malaysian Ringgit", symbol: "RM", countryCode: "my" },
    { code: "PHP", description: "Philippine Peso", symbol: "₱", countryCode: "ph" },
    { code: "TWD", description: "New Taiwan Dollar", symbol: "NT$", countryCode: "tw"},
    { code: "KWD", description: "Kuwaiti Dinar", symbol: "KD", countryCode: "kw"},
    { code: "PKR", description: "Pakistani Rupee", symbol: "PKR", countryCode: "pk"},
  ];

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">From</label>
          <div className="space-y-2">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full"
              disabled={isLoading}
            />
            <VirtualizedDropdown
              id="from-currency"
              value={fromCurrency}
              onChange={setFromCurrency}
              currencies={currencies}
              placeholder="Select currency"
            />
          </div>
        </div>

        <div className="flex justify-center md:py-8">
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

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">To</label>
          <div className="space-y-2">
            <Input
              type="number"
              value={typeof convertedAmount === 'number' ? convertedAmount.toFixed(2) : '0.00'}
              readOnly
              className="w-full"
              disabled={isLoading}
            />
            <VirtualizedDropdown
              id="to-currency"
              value={toCurrency}
              onChange={setToCurrency}
              currencies={currencies}
              placeholder="Select currency"
            />
          </div>
        </div>
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
