import { useEffect, useState } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "./ApiUtils";

interface ExchangeRateChartProps {
  baseCurrency: string;
  targetCurrency: string;
  currentRate: number;
}

interface ChartDataPoint {
  date: string;
  rate: number;
}

interface PeriodChange {
  label: string;
  change: number | null;
}

const ExchangeRateChart = ({ baseCurrency, targetCurrency, currentRate }: ExchangeRateChartProps) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [periodChanges, setPeriodChanges] = useState<PeriodChange[]>([]);

  useEffect(() => {
    fetchHistoricalData();
  }, [baseCurrency, targetCurrency, currentRate]);

  const getDateString = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split("T")[0];
  };

  const fetchRateForDate = async (date: string): Promise<number | null> => {
    try {
      const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/v1/currencies/${baseCurrency.toLowerCase()}.json`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const rates = data[baseCurrency.toLowerCase()];
      return rates?.[targetCurrency.toLowerCase()] ?? null;
    } catch {
      return null;
    }
  };

  const fetchHistoricalData = async () => {
    setIsLoading(true);
    try {
      // Fetch rates for 30 days at key intervals
      const dates: string[] = [];
      for (let i = 30; i >= 0; i--) {
        dates.push(getDateString(i));
      }

      // Fetch all dates in parallel (batched)
      const ratePromises = dates.map(async (date) => {
        const rate = await fetchRateForDate(date);
        return { date, rate };
      });

      const results = await Promise.all(ratePromises);

      const data: ChartDataPoint[] = results
        .filter((r) => r.rate !== null)
        .map((r) => ({
          date: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          rate: parseFloat((r.rate as number).toFixed(6)),
        }));

      setChartData(data);

      // Calculate percentage changes for 24h, 7d, 30d
      const changes: PeriodChange[] = [];
      const periods = [
        { label: "24h", days: 1 },
        { label: "7d", days: 7 },
        { label: "30d", days: 30 },
      ];

      for (const period of periods) {
        const pastRate = await fetchRateForDate(getDateString(period.days));
        if (pastRate && pastRate > 0) {
          const change = ((currentRate - pastRate) / pastRate) * 100;
          changes.push({ label: period.label, change });
        } else {
          changes.push({ label: period.label, change: null });
        }
      }

      setPeriodChanges(changes);
    } catch (error) {
      console.error("Error fetching historical data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAiInsight = async () => {
    setIsLoadingInsight(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/currency-insights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          baseCurrency,
          targetCurrency,
          currentRate,
          chartData,
          periodChanges,
        }),
      });

      if (!response.ok) throw new Error("Failed to get insights");

      const data = await response.json();
      if (data?.insight) setAiInsight(data.insight);
    } catch (error) {
      console.error("Error getting AI insight:", error);
      toast.error("Unable to generate insights. Please try again.");
    } finally {
      setIsLoadingInsight(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-48 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  const renderChangeChip = (pc: PeriodChange) => {
    if (pc.change === null) return null;
    const isPos = pc.change > 0;
    const isNeutral = Math.abs(pc.change) < 0.01;
    return (
      <div
        key={pc.label}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
          isNeutral
            ? "bg-gray-100 text-gray-600"
            : isPos
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }`}
      >
        {isNeutral ? (
          <Minus className="h-3 w-3" />
        ) : isPos ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        <span>{pc.label}</span>
        <span>{isPos ? "+" : ""}{pc.change.toFixed(2)}%</span>
      </div>
    );
  };

  return (
    <div className="mt-6 p-6 bg-gradient-to-br from-white to-blue-50/30 rounded-xl shadow-md border border-blue-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {baseCurrency}/{targetCurrency} Exchange Rate
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Last 30 days historical data</p>
        </div>

        <button
          onClick={getAiInsight}
          disabled={isLoadingInsight}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className={`h-4 w-4 ${isLoadingInsight ? "animate-spin" : ""}`} />
          <span className="text-sm font-medium">{isLoadingInsight ? "Analyzing..." : "AI Insights"}</span>
        </button>
      </div>

      {/* Percentage change chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {periodChanges.map(renderChangeChip)}
      </div>

      {aiInsight && (
        <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg animate-fade-in">
          <div className="flex items-start">
            <Sparkles className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 leading-relaxed">{aiInsight}</p>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: "11px" }} interval="preserveStartEnd" />
          <YAxis stroke="#6b7280" style={{ fontSize: "11px" }} domain={["auto", "auto"]} tickFormatter={(v) => v.toFixed(4)} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255,255,255,0.95)",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            }}
            formatter={(value: number) => [value.toFixed(6), "Rate"]}
          />
          <Area type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRate)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExchangeRateChart;
