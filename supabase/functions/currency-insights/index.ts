import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { baseCurrency, targetCurrency, currentRate, chartData } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Calculate trend data
    const firstRate = chartData[0]?.rate || currentRate;
    const lastRate = chartData[chartData.length - 1]?.rate || currentRate;
    const percentageChange = ((lastRate - firstRate) / firstRate) * 100;
    
    // Calculate volatility
    const rates = chartData.map((d: any) => d.rate);
    const avgRate = rates.reduce((a: number, b: number) => a + b, 0) / rates.length;
    const variance = rates.reduce((sum: number, rate: number) => sum + Math.pow(rate - avgRate, 2), 0) / rates.length;
    const volatility = Math.sqrt(variance);
    
    const systemPrompt = `You are a currency exchange expert providing brief, actionable insights about currency trends. 
Keep your response concise (2-3 sentences max) and focus on practical information for travelers or businesses.`;

    const userPrompt = `Analyze this 30-day currency exchange trend:
- Currency pair: ${baseCurrency}/${targetCurrency}
- Current rate: ${currentRate.toFixed(4)}
- 30-day change: ${percentageChange.toFixed(2)}%
- Volatility: ${volatility.toFixed(6)}

Provide a brief insight about the trend and what it might mean for someone exchanging these currencies.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const insight = data.choices?.[0]?.message?.content || "Unable to generate insight at this time.";

    return new Response(
      JSON.stringify({ insight }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in currency-insights:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
