import { useEffect, useState, useCallback } from "react";
import { CurrencyCache } from "./CurrencyCache";
import CurrencyDropdown, { CurrencySymbol } from "./CurrencyDropdown";
import { CURRENCY_DATABASE, getCurrencyName, getCurrencyCategory } from "./currencyFlags";
import CurrencyInput from "./CurrencyInput";
import ErrorDisplay from "./ErrorDisplay";
import LoadingState from "./LoadingState";
import ExchangeRateChart from "./ExchangeRateChart";
import { ArrowDownUp, RefreshCw, WifiOff, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import {
  retryWithBackoff,
  saveToCache,
  getFromCache,
  getLastUpdateTime,
  formatRelativeTime,
  CACHE_KEYS,
  API_ENDPOINTS
} from "./ApiUtils";

interface SymbolsResponse {
  [key: string]: string;
}

const symbolsCache = new CurrencyCache<CurrencySymbol[]>(24 * 60 * 60 * 1000);
const ratesCache = new CurrencyCache<Record<string, number>>(5 * 60 * 1000);

// Popular currency pairs for quick access
const POPULAR_PAIRS = [
  { base: "KWD", target: "PKR", label: "KWD → PKR" },
  { base: "USD", target: "EUR", label: "USD → EUR" },
  { base: "USD", target: "PKR", label: "USD → PKR" },
  { base: "GBP", target: "USD", label: "GBP → USD" },
  { base: "EUR", target: "GBP", label: "EUR → GBP" },
  { base: "BTC", target: "USD", label: "BTC → USD" },
];

const CurrencyConverter = () => {
  const [symbols, setSymbols] = useState<CurrencySymbol[]>([]);
  const [isLoadingSymbols, setIsLoadingSymbols] = useState(true);
  const [symbolsError, setSymbolsError] = useState<string | null>(null);
  const [symbolsRetryAttempt, setSymbolsRetryAttempt] = useState(0);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [baseAmount, setBaseAmount] = useState(1);
  const [targetAmount, setTargetAmount] = useState(0);
  const [baseCurrency, setBaseCurrency] = useState("KWD");
  const [targetCurrency, setTargetCurrency] = useState("PKR");
  const [lastChangedField, setLastChangedField] = useState<"base" | "target">("base");
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);
  const [rateRetryAttempt, setRateRetryAttempt] = useState(0);
  const [forceRefreshCounter, setForceRefreshCounter] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const refreshInterval = setInterval(() => {
      setForceRefreshCounter(prev => prev + 1);
    }, 5 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchSymbols = useCallback(async (retry = false) => {
    try {
      setIsLoadingSymbols(true);
      if (retry) setSymbolsRetryAttempt(prev => prev + 1);
      setSymbolsError(null);

      const cachedSymbols = symbolsCache.get("symbols") || getFromCache<CurrencySymbol[]>(CACHE_KEYS.SYMBOLS);
      if (cachedSymbols && !retry) {
        setSymbols(cachedSymbols);
        setIsLoadingSymbols(false);
        return;
      }

      const data = await retryWithBackoff<SymbolsResponse>(async () => {
        const response = await fetch(API_ENDPOINTS.CURRENCIES);
        if (!response.ok) throw new Error(`Failed to fetch symbols: ${response.status}`);
        return response.json();
      });

      // Use ALL currencies from the API, with names from our database
      const symbolsArray: CurrencySymbol[] = Object.entries(data)
        .filter(([, name]) => typeof name === 'string')
        .map(([code]) => {
          const upperCode = code.toUpperCase();
          const properName = getCurrencyName(code);
          const category = getCurrencyCategory(code);
          return {
            code: upperCode,
            description: properName,
            category,
          };
        });

      symbolsArray.sort((a, b) => a.code.localeCompare(b.code));
      setSymbols(symbolsArray);
      symbolsCache.set("symbols", symbolsArray);
      saveToCache(CACHE_KEYS.SYMBOLS, symbolsArray);
      setSymbolsError(null);
      setIsOfflineMode(false);
    } catch (error) {
      console.error("Error fetching currency symbols:", error);
      const cachedSymbols = getFromCache<CurrencySymbol[]>(CACHE_KEYS.SYMBOLS);
      if (cachedSymbols && cachedSymbols.length > 0) {
        setSymbols(cachedSymbols);
        setIsOfflineMode(true);
        const lastUpdateTime = getLastUpdateTime();
        if (lastUpdateTime) setLastUpdated(lastUpdateTime);
        toast.warning("Using cached currency data.");
      } else {
        setSymbolsError("Failed to load currency data. Please check your connection.");
        toast.error("Unable to load currency data");
      }
    } finally {
      setIsLoadingSymbols(false);
      setSymbolsRetryAttempt(0);
    }
  }, []);

  const updateAmounts = (currentRates: Record<string, number>) => {
    const targetKey = targetCurrency.toLowerCase();
    if (!currentRates[targetKey]) return;
    const currentRate = currentRates[targetKey];
    if (lastChangedField === "base") {
      setTargetAmount(parseFloat((baseAmount * currentRate).toFixed(4)));
    } else {
      setBaseAmount(parseFloat((targetAmount / currentRate).toFixed(4)));
    }
  };

  const fetchExchangeRates = useCallback(async (base: string, retry = false) => {
    if (baseCurrency === targetCurrency) {
      const singleRate: Record<string, number> = {};
      singleRate[targetCurrency.toLowerCase()] = 1;
      setRates(singleRate);
      if (lastChangedField === "base") setTargetAmount(baseAmount);
      else setBaseAmount(targetAmount);
      setLastUpdated(new Date());
      return;
    }

    try {
      setIsLoadingRate(true);
      if (retry) setRateRetryAttempt(prev => prev + 1);
      setRateError(null);

      const cacheKey = `rates-${base}`;
      const cachedRates = ratesCache.get(cacheKey);
      if (cachedRates !== undefined && !retry) {
        setRates(cachedRates);
        updateAmounts(cachedRates);
        setLastUpdated(new Date());
        setIsLoadingRate(false);
        return;
      }

      const localCacheKey = `${CACHE_KEYS.RATES_PREFIX}${base}`;
      const cachedRateData = !retry ? getFromCache<{rates: Record<string, number>, timestamp: string}>(localCacheKey) : null;
      if (cachedRateData && !retry) {
        setRates(cachedRateData.rates);
        updateAmounts(cachedRateData.rates);
        setLastUpdated(new Date(cachedRateData.timestamp));
        setIsLoadingRate(false);
        return;
      }

      const data = await retryWithBackoff<any>(async () => {
        const url = `${API_ENDPOINTS.RATES_BASE}/${base.toLowerCase()}.json`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch rates: ${response.status}`);
        return response.json();
      }, retry ? 1 : 2);

      if (data && data[base.toLowerCase()]) {
        const fetchedRates = data[base.toLowerCase()];
        setRates(fetchedRates);
        ratesCache.set(cacheKey, fetchedRates);
        const timestamp = new Date();
        saveToCache(localCacheKey, { rates: fetchedRates, timestamp: timestamp.toISOString() });
        updateAmounts(fetchedRates);
        setLastUpdated(timestamp);
        setRateError(null);
        setIsOfflineMode(false);
      } else {
        throw new Error(`Rates not found in API response`);
      }
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      const localCacheKey = `${CACHE_KEYS.RATES_PREFIX}${base}`;
      const cachedRateData = getFromCache<{rates: Record<string, number>, timestamp: string}>(localCacheKey);
      if (cachedRateData) {
        setRates(cachedRateData.rates);
        updateAmounts(cachedRateData.rates);
        setLastUpdated(new Date(cachedRateData.timestamp));
        setIsOfflineMode(true);
        toast.warning(`Using cached rates from ${formatRelativeTime(new Date(cachedRateData.timestamp))}`, {
          icon: <WifiOff className="h-4 w-4" />
        });
      } else {
        setRateError("Failed to load exchange rates. Please try again.");
        toast.error("Unable to get current rates");
      }
    } finally {
      setIsLoadingRate(false);
      setRateRetryAttempt(0);
    }
  }, [baseAmount, baseCurrency, lastChangedField, targetAmount, targetCurrency]);

  useEffect(() => { fetchSymbols(); }, [fetchSymbols]);

  useEffect(() => {
    if (baseCurrency) fetchExchangeRates(baseCurrency);
  }, [baseCurrency, fetchExchangeRates, forceRefreshCounter]);

  const handleBaseAmountChange = (value: number) => {
    setBaseAmount(value);
    setLastChangedField("base");
    const targetKey = targetCurrency.toLowerCase();
    if (rates !== null && rates[targetKey]) {
      setTargetAmount(parseFloat((value * rates[targetKey]).toFixed(4)));
    } else {
      fetchExchangeRates(baseCurrency);
    }
  };

  const handleTargetAmountChange = (value: number) => {
    setTargetAmount(value);
    setLastChangedField("target");
    const targetKey = targetCurrency.toLowerCase();
    if (rates !== null && rates[targetKey] !== 0) {
      setBaseAmount(parseFloat((value / rates[targetKey]).toFixed(4)));
    } else {
      fetchExchangeRates(baseCurrency);
    }
  };

  const handleBaseCurrencyChange = (value: string) => {
    setBaseCurrency(value);
    setBaseAmount(1);
    setLastChangedField("base");
  };

  const handleTargetCurrencyChange = (value: string) => {
    setTargetCurrency(value);
    setBaseAmount(1);
    setLastChangedField("base");
  };

  const handleSwapCurrencies = () => {
    const tempBase = baseCurrency;
    const tempTarget = targetCurrency;
    const tempBaseAmt = baseAmount;
    const tempTargetAmt = targetAmount;
    setBaseCurrency(tempTarget);
    setTargetCurrency(tempBase);
    setBaseAmount(tempTargetAmt);
    setTargetAmount(tempBaseAmt);
  };

  const handleQuickPair = (base: string, target: string) => {
    setBaseCurrency(base);
    setTargetCurrency(target);
    setBaseAmount(1);
    setLastChangedField("base");
  };

  const handleCopyResult = () => {
    const text = `${baseAmount} ${baseCurrency} = ${targetAmount} ${targetCurrency}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRefreshRate = () => {
    const cacheKey = `rates-${baseCurrency}`;
    ratesCache.remove(cacheKey);
    // Only show one toast - removed the duplicate toast.success here
    fetchExchangeRates(baseCurrency, true);
  };

  const formattedLastUpdated = lastUpdated
    ? lastUpdated.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })
    : '';

  if (isLoadingSymbols && !symbolsError) {
    return <LoadingState message="Loading currencies..." attempt={symbolsRetryAttempt || undefined} />;
  }

  if (symbolsError && symbols.length === 0) {
    return <ErrorDisplay message={symbolsError} onRetry={() => fetchSymbols(true)} />;
  }

  const currentRate = rates && rates[targetCurrency.toLowerCase()] ? rates[targetCurrency.toLowerCase()] : null;

  return (
    <div className="w-full">
      {/* Offline banner */}
      {isOfflineMode && lastUpdated && (
        <div className="mb-4 p-3 rounded-xl border flex items-center gap-3 animate-fade-in"
          style={{
            background: 'hsl(40 100% 50% / 0.08)',
            borderColor: 'hsl(40 100% 50% / 0.2)',
          }}
        >
          <WifiOff className="h-4 w-4 flex-shrink-0" style={{ color: 'hsl(40 100% 60%)' }} />
          <span className="text-xs flex-1" style={{ color: 'hsl(40 100% 70%)' }}>
            Offline: rates from {formatRelativeTime(lastUpdated)}
          </span>
          <button onClick={() => { fetchSymbols(true); fetchExchangeRates(baseCurrency, true); }}
            className="text-xs px-3 py-1 rounded-lg flex items-center gap-1 transition-all hover:scale-105"
            style={{
              background: 'hsl(40 100% 50% / 0.15)',
              color: 'hsl(40 100% 70%)',
            }}
          >
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        </div>
      )}

      {rateError && <ErrorDisplay message={rateError} onRetry={() => fetchExchangeRates(baseCurrency, true)} inline />}

      {/* Popular pairs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-xs font-medium self-center mr-1" style={{ color: 'hsl(var(--converter-text-muted))' }}>Popular:</span>
        {POPULAR_PAIRS.map((pair) => (
          <button key={pair.label} onClick={() => handleQuickPair(pair.base, pair.target)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
              baseCurrency === pair.base && targetCurrency === pair.target
                ? ''
                : 'hover:scale-105'
            }`}
            style={{
              background: baseCurrency === pair.base && targetCurrency === pair.target
                ? 'hsl(var(--converter-accent) / 0.2)'
                : 'hsl(var(--converter-card) / 0.5)',
              borderColor: baseCurrency === pair.base && targetCurrency === pair.target
                ? 'hsl(var(--converter-accent) / 0.5)'
                : 'hsl(var(--converter-border) / 0.5)',
              color: baseCurrency === pair.base && targetCurrency === pair.target
                ? 'hsl(var(--converter-accent))'
                : 'hsl(var(--converter-text-muted))',
            }}
          >
            {pair.label}
          </button>
        ))}
      </div>

      {/* Converter form */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end relative">
        {/* Base Currency */}
        <div className="relative z-[40]">
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: 'hsl(var(--converter-text-muted))' }}>
            From
          </label>
          <div className="space-y-3">
            <CurrencyDropdown id="baseCurrency" value={baseCurrency} onChange={handleBaseCurrencyChange} currencies={symbols} disabled={isLoadingRate} />
            <CurrencyInput id="baseAmount" value={baseAmount} onChange={handleBaseAmountChange} currencyCode={baseCurrency} disabled={isLoadingRate} />
          </div>
        </div>

        {/* Swap button */}
        <div className="flex justify-center md:pb-3">
          <button onClick={handleSwapCurrencies} disabled={isLoadingRate}
            className="p-3 rounded-xl transition-all duration-300 transform hover:scale-110 hover:rotate-180 border group"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--converter-accent) / 0.15), hsl(var(--converter-accent-glow) / 0.15))',
              borderColor: 'hsl(var(--converter-accent) / 0.3)',
            }}
            aria-label="Swap currencies"
          >
            <ArrowDownUp className="h-5 w-5 md:rotate-90" style={{ color: 'hsl(var(--converter-accent))' }} />
          </button>
        </div>

        {/* Target Currency */}
        <div className="relative z-[10]">
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: 'hsl(var(--converter-text-muted))' }}>
            To
          </label>
          <div className="space-y-3">
            <CurrencyDropdown id="targetCurrency" value={targetCurrency} onChange={handleTargetCurrencyChange} currencies={symbols} disabled={isLoadingRate} />
            <CurrencyInput id="targetAmount" value={targetAmount} onChange={handleTargetAmountChange} currencyCode={targetCurrency} disabled={isLoadingRate} />
          </div>
        </div>
      </div>

      {/* Rate display */}
      <div className="mt-6 rounded-xl border p-4 animate-fade-in"
        style={{
          background: 'hsl(var(--converter-card) / 0.5)',
          borderColor: 'hsl(var(--converter-border) / 0.5)',
        }}
      >
        {isLoadingRate ? (
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" style={{ color: 'hsl(var(--converter-accent))' }} />
            <span className="text-sm" style={{ color: 'hsl(var(--converter-text-muted))' }}>
              Fetching latest rates{rateRetryAttempt > 0 ? ` (attempt ${rateRetryAttempt}/3)` : ''}...
            </span>
          </div>
        ) : currentRate ? (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-lg border" style={{
                background: 'hsl(var(--converter-input-bg))',
                borderColor: 'hsl(var(--converter-border) / 0.5)',
              }}>
                <span className="text-sm" style={{ color: 'hsl(var(--converter-text-muted))' }}>1 {baseCurrency} = </span>
                <span className="text-lg font-bold" style={{ color: 'hsl(var(--converter-accent))' }}>{currentRate.toFixed(4)}</span>
                <span className="text-sm ml-1" style={{ color: 'hsl(var(--converter-text-muted))' }}>{targetCurrency}</span>
              </div>
              <button onClick={handleCopyResult}
                className="p-2 rounded-lg border transition-all hover:scale-105"
                style={{
                  background: 'hsl(var(--converter-input-bg))',
                  borderColor: 'hsl(var(--converter-border) / 0.5)',
                  color: copied ? 'hsl(var(--converter-success))' : 'hsl(var(--converter-text-muted))',
                }}
                aria-label="Copy result"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: 'hsl(var(--converter-text-muted))' }}>
                  {isOfflineMode ? 'Cached' : 'Updated'} {formattedLastUpdated}
                </span>
                <button onClick={handleRefreshRate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all hover:scale-105"
                  style={{
                    background: 'hsl(var(--converter-accent) / 0.1)',
                    borderColor: 'hsl(var(--converter-accent) / 0.3)',
                    color: 'hsl(var(--converter-accent))',
                  }}
                >
                  <RefreshCw className="h-3 w-3" /> Refresh
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Chart */}
      {currentRate && <ExchangeRateChart baseCurrency={baseCurrency} targetCurrency={targetCurrency} currentRate={currentRate} />}
    </div>
  );
};

export default CurrencyConverter;
