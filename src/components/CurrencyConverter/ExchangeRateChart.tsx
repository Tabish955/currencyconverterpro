import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
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

const ExchangeRateChart = ({ baseCurrency, targetCurrency, currentRate }: ExchangeRateChartProps) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  useEffect(() => {
    fetchHistoricalData();
  }, [baseCurrency, targetCurrency]);

  const fetchHistoricalData = async () => {
    setIsLoading(true);
    try {
      // Generate 30 days of mock historical data based on current rate
      // In production, you would fetch real historical data from an API
      const data: ChartDataPoint[] = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Generate realistic fluctuation around current rate
        const fluctuation = (Math.random() - 0.5) * 0.1 * currentRate; // ±5% variation
        const rate = currentRate + fluctuation;
        
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          rate: parseFloat(rate.toFixed(4))
        });
      }
      
      setChartData(data);
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          baseCurrency,
          targetCurrency,
          currentRate,
          chartData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get insights');
      }
      
      const data = await response.json();
      if (data?.insight) {
        setAiInsight(data.insight);
      }
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

  const firstRate = chartData[0]?.rate || currentRate;
  const lastRate = chartData[chartData.length - 1]?.rate || currentRate;
  const percentageChange = ((lastRate - firstRate) / firstRate) * 100;
  const isPositive = percentageChange > 0;
  const isNeutral = Math.abs(percentageChange) < 0.5;

  return (
    <div className="mt-6 p-6 bg-gradient-to-br from-white to-blue-50/30 rounded-xl shadow-md border border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            30-Day Trend
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({baseCurrency}/{targetCurrency})
            </span>
          </h3>
          <div className="flex items-center mt-1">
            {isNeutral ? (
              <Minus className="h-4 w-4 text-gray-500 mr-1" />
            ) : isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              isNeutral ? 'text-gray-600' : isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? '+' : ''}{percentageChange.toFixed(2)}%
            </span>
            <span className="text-xs text-gray-500 ml-2">vs 30 days ago</span>
          </div>
        </div>
        
        <button
          onClick={getAiInsight}
          disabled={isLoadingInsight}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className={`h-4 w-4 ${isLoadingInsight ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">
            {isLoadingInsight ? 'Analyzing...' : 'AI Insights'}
          </span>
        </button>
      </div>

      {aiInsight && (
        <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg animate-fade-in">
          <div className="flex items-start">
            <Sparkles className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 leading-relaxed">{aiInsight}</p>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            domain={['auto', 'auto']}
            tickFormatter={(value) => value.toFixed(4)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: number) => [value.toFixed(4), 'Rate']}
          />
          <Area 
            type="monotone" 
            dataKey="rate" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fill="url(#colorRate)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExchangeRateChart;
