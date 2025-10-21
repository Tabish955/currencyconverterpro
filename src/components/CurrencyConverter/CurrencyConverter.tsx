
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDownUp, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { isCryptoCurrency } from './CryptoApiUtils';
import VirtualizedDropdown from './VirtualizedDropdown';
import { currencyCache } from '@/utils/currencyCache';
import { currencies } from '@/data/currencies';

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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { data: convertedAmount, isLoading, isError, refetch } = useQuery({
    queryKey: ['exchangeRate', fromCurrency, toCurrency, amount],
    queryFn: async () => {
      const result = await fetchExchangeRate(fromCurrency, toCurrency, amount);
      setLastUpdated(new Date());
      return result;
    },
    enabled: !isSwapping,
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
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

  const handleRefresh = () => {
    toast.info("Refreshing rates...");
    refetch();
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return "Just now";
    const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex items-center justify-between text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg">
        <span className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
          {currencies.length} currencies • Updated {formatLastUpdated()}
        </span>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

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
