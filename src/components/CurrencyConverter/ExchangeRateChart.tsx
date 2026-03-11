import { useEffect, useState } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { toast } from "sonner";

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
      const dates: string[] = [];
      for (let i = 30; i >= 0; i--) dates.push(getDateString(i));

      const results = await Promise.all(
        dates.map(async (date) => {
          const rate = await fetchRateForDate(date);
          return { date, rate };
        })
      );

      const data: ChartDataPoint[] = results
        .filter((r) => r.rate !== null)
        .map((r) => ({
          date: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          rate: parseFloat((r.rate as number).toFixed(6)),
        }));

      setChartData(data);

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
        body: JSON.stringify({ baseCurrency, targetCurrency, currentRate, chartData, periodChanges }),
      });
      if (!response.ok) throw new Error("Failed to get insights");
      const data = await response.json();
      if (data?.insight) setAiInsight(data.insight);
    } catch (error) {
      console.error("Error getting AI insight:", error);
      toast.error("Unable to generate insights.");
    } finally {
      setIsLoadingInsight(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-6 p-6 rounded-xl border" style={{
        background: 'hsl(var(--converter-card) / 0.5)',
        borderColor: 'hsl(var(--converter-border) / 0.5)',
      }}>
        <div className="animate-pulse">
          <div className="h-4 rounded w-1/4 mb-4" style={{ background: 'hsl(var(--converter-border))' }} />
          <div className="h-48 rounded" style={{ background: 'hsl(var(--converter-input-bg))' }} />
        </div>
      </div>
    );
  }

  const renderChangeChip = (pc: PeriodChange) => {
    if (pc.change === null) return null;
    const isPos = pc.change > 0;
    const isNeutral = Math.abs(pc.change) < 0.01;
    return (
      <div key={pc.label}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border"
        style={{
          background: isNeutral
            ? 'hsl(var(--converter-card-hover))'
            : isPos
            ? 'hsl(142 76% 36% / 0.1)'
            : 'hsl(0 84% 60% / 0.1)',
          borderColor: isNeutral
            ? 'hsl(var(--converter-border))'
            : isPos
            ? 'hsl(142 76% 36% / 0.25)'
            : 'hsl(0 84% 60% / 0.25)',
          color: isNeutral
            ? 'hsl(var(--converter-text-muted))'
            : isPos
            ? 'hsl(142 76% 50%)'
            : 'hsl(0 84% 65%)',
        }}
      >
        {isNeutral ? <Minus className="h-3 w-3" /> : isPos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span>{pc.label}</span>
        <span>{isPos ? "+" : ""}{pc.change.toFixed(2)}%</span>
      </div>
    );
  };

  return (
    <div className="mt-6 rounded-xl border p-6"
      style={{
        background: 'hsl(var(--converter-card) / 0.5)',
        borderColor: 'hsl(var(--converter-border) / 0.5)',
      }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <div>
          <h3 className="text-base font-bold" style={{ color: 'hsl(var(--converter-text))' }}>
            {baseCurrency}/{targetCurrency} Trend
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--converter-text-muted))' }}>30-day historical data</p>
        </div>
        <button onClick={getAiInsight} disabled={isLoadingInsight}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:opacity-50 border"
          style={{
            background: 'linear-gradient(135deg, hsl(262 83% 58% / 0.15), hsl(234 89% 64% / 0.15))',
            borderColor: 'hsl(262 83% 58% / 0.3)',
            color: 'hsl(262 83% 72%)',
          }}
        >
          <Sparkles className={`h-4 w-4 ${isLoadingInsight ? "animate-spin" : ""}`} />
          {isLoadingInsight ? "Analyzing..." : "AI Insights"}
        </button>
      </div>

      {/* Change chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {periodChanges.map(renderChangeChip)}
      </div>

      {aiInsight && (
        <div className="mb-4 p-4 rounded-xl border animate-fade-in"
          style={{
            background: 'hsl(262 83% 58% / 0.06)',
            borderColor: 'hsl(262 83% 58% / 0.2)',
          }}
        >
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'hsl(262 83% 68%)' }} />
            <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--converter-text))' }}>{aiInsight}</p>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(234, 89%, 64%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(234, 89%, 64%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 15%, 20%)" />
          <XAxis dataKey="date" stroke="hsl(220, 12%, 45%)" style={{ fontSize: "11px" }} interval="preserveStartEnd" />
          <YAxis stroke="hsl(220, 12%, 45%)" style={{ fontSize: "11px" }} domain={["auto", "auto"]} tickFormatter={(v) => v.toFixed(4)} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(230, 20%, 14%)",
              border: "1px solid hsl(230, 15%, 25%)",
              borderRadius: "8px",
              color: "hsl(220, 20%, 95%)",
              boxShadow: "0 10px 30px -5px rgba(0,0,0,0.5)",
            }}
            formatter={(value: number) => [value.toFixed(6), "Rate"]}
          />
          <Area type="monotone" dataKey="rate" stroke="hsl(234, 89%, 64%)" strokeWidth={2} fill="url(#colorRate)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExchangeRateChart;
