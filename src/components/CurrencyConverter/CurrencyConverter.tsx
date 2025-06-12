
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDownUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { isCryptoCurrency } from './CryptoApiUtils';
import CurrencyDropdown from './CurrencyDropdown';

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

const CurrencyConverter = ({ mode = "fiat" }: CurrencyConverterProps) => {
  const [amount, setAmount] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState<string>("KWD");
  const [toCurrency, setToCurrency] = useState<string>("PKR");
  const [isSwapping, setIsSwapping] = useState(false);

  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$", countryCode: "us" },
    { code: "EUR", name: "Euro", symbol: "€", countryCode: "eu" },
    { code: "GBP", name: "British Pound", symbol: "£", countryCode: "gb" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥", countryCode: "jp" },
    { code: "CAD", name: "Canadian Dollar", symbol: "$", countryCode: "ca" },
    { code: "AUD", name: "Australian Dollar", symbol: "$", countryCode: "au" },
    { code: "CHF", name: "Swiss Franc", symbol: "Fr", countryCode: "ch" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥", countryCode: "cn" },
    { code: "SEK", name: "Swedish Krona", symbol: "kr", countryCode: "se" },
    { code: "NZD", name: "New Zealand Dollar", symbol: "$", countryCode: "nz" },
    { code: "MXN", name: "Mexican Peso", symbol: "$", countryCode: "mx" },
    { code: "SGD", name: "Singapore Dollar", symbol: "$", countryCode: "sg" },
    { code: "HKD", name: "Hong Kong Dollar", symbol: "$", countryCode: "hk" },
    { code: "NOK", name: "Norwegian Krone", symbol: "kr", countryCode: "no" },
    { code: "KRW", name: "South Korean Won", symbol: "₩", countryCode: "kr" },
    { code: "TRY", name: "Turkish Lira", symbol: "₺", countryCode: "tr" },
    { code: "RUB", name: "Russian Ruble", symbol: "₽", countryCode: "ru" },
    { code: "INR", name: "Indian Rupee", symbol: "₹", countryCode: "in" },
    { code: "BRL", name: "Brazilian Real", symbol: "R$", countryCode: "br" },
    { code: "ZAR", name: "South African Rand", symbol: "R", countryCode: "za" },
    { code: "AED", name: "United Arab Emirates Dirham", symbol: "د.إ", countryCode: "ae" },
    { code: "SAR", name: "Saudi Riyal", symbol: "ر.س", countryCode: "sa" },
    { code: "PLN", name: "Polish Zloty", symbol: "zł", countryCode: "pl" },
    { code: "THB", name: "Thai Baht", symbol: "฿", countryCode: "th" },
    { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", countryCode: "id" },
    { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", countryCode: "my" },
    { code: "PHP", name: "Philippine Peso", symbol: "₱", countryCode: "ph" },
    { code: "TWD", name: "New Taiwan Dollar", symbol: "NT$", countryCode: "tw"},
    { code: "KWD", name: "Kuwaiti Dinar", symbol: "KD", countryCode: "kw"},
    { code: "PKR", name: "Pakistani Rupee", symbol: "PKR", countryCode: "pk"},
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
            <CurrencyDropdown
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
              value={typeof convertedAmount === 'number' ? convertedAmount : 0}
              readOnly
              className="w-full"
              disabled={isLoading}
            />
            <CurrencyDropdown
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
