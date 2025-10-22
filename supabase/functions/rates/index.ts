import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory cache for exchange rates
const ratesCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 60 seconds

async function fetchWithRetry(url: string, retries = 3): Promise<Response | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const delay = Math.pow(2, i) * 500; // Exponential backoff: 500ms, 1s, 2s
      if (i > 0) {
        console.log(`Retry ${i}/${retries} after ${delay}ms delay...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const response = await fetch(url, { 
        signal: AbortSignal.timeout(5000) 
      });
      
      if (response.ok) {
        return response;
      }
      
      console.warn(`Attempt ${i + 1} failed with status ${response.status}`);
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed:`, error);
    }
  }
  
  return null;
}

async function fetchRates(base: string, symbols: string): Promise<any> {
  console.log(`Fetching rates for ${base} -> ${symbols}`);
  
  // Try primary CDN
  try {
    console.log("Trying primary CDN (jsDelivr)...");
    const cdnUrl = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base.toLowerCase()}.json`;
    const cdnResponse = await fetchWithRetry(cdnUrl);
    
    if (cdnResponse) {
      const data = await cdnResponse.json();
      console.log("CDN fetch successful");
      
      // Transform data to our format
      const rates: Record<string, number> = {};
      const targetSymbols = symbols.split(',').map(s => s.toLowerCase());
      
      if (data[base.toLowerCase()]) {
        targetSymbols.forEach(symbol => {
          if (data[base.toLowerCase()][symbol]) {
            rates[symbol.toUpperCase()] = data[base.toLowerCase()][symbol];
          }
        });
      }
      
      return {
        base: base.toUpperCase(),
        rates,
        fetchedAt: new Date().toISOString(),
        provider: 'cdn',
        cached: false,
        fallback: false,
      };
    }
  } catch (error) {
    console.warn("CDN fetch failed:", error);
  }
  
  // Try Pages fallback
  try {
    console.log("Trying Pages fallback...");
    const pagesUrl = `https://latest.currency-api.pages.dev/v1/currencies/${base.toLowerCase()}.json`;
    const pagesResponse = await fetchWithRetry(pagesUrl);
    
    if (pagesResponse) {
      const data = await pagesResponse.json();
      console.log("Pages fetch successful");
      
      const rates: Record<string, number> = {};
      const targetSymbols = symbols.split(',').map(s => s.toLowerCase());
      
      if (data[base.toLowerCase()]) {
        targetSymbols.forEach(symbol => {
          if (data[base.toLowerCase()][symbol]) {
            rates[symbol.toUpperCase()] = data[base.toLowerCase()][symbol];
          }
        });
      }
      
      return {
        base: base.toUpperCase(),
        rates,
        fetchedAt: new Date().toISOString(),
        provider: 'pages',
        cached: false,
        fallback: false,
      };
    }
  } catch (error) {
    console.warn("Pages fetch failed:", error);
  }
  
  // Final fallback: ExchangeRate.host
  try {
    console.log("Trying ExchangeRate.host as final fallback...");
    const fallbackUrl = `https://api.exchangerate.host/latest?base=${base}&symbols=${symbols}`;
    const fallbackResponse = await fetchWithRetry(fallbackUrl);
    
    if (fallbackResponse) {
      const data = await fallbackResponse.json();
      console.log("ExchangeRate.host fetch successful");
      
      if (data.rates) {
        return {
          base: base.toUpperCase(),
          rates: data.rates,
          fetchedAt: new Date().toISOString(),
          provider: 'exchange-host',
          cached: false,
          fallback: true,
        };
      }
    }
  } catch (error) {
    console.warn("ExchangeRate.host fetch failed:", error);
  }
  
  throw new Error("All rate providers failed");
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const base = url.searchParams.get('base');
    const symbols = url.searchParams.get('symbols');
    
    // Validate inputs
    if (!base || !symbols) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: base and symbols' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }
    
    // Validate format (should be 3-letter uppercase)
    if (!/^[A-Z]{3}$/.test(base.toUpperCase())) {
      return new Response(
        JSON.stringify({ error: 'Invalid base currency format' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }
    
    const symbolsList = symbols.split(',').map(s => s.trim().toUpperCase());
    if (!symbolsList.every(s => /^[A-Z]{3}$/.test(s))) {
      return new Response(
        JSON.stringify({ error: 'Invalid symbols format' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }
    
    const cacheKey = `${base.toUpperCase()}-${symbols.toUpperCase()}`;
    const now = Date.now();
    
    // Check cache first
    const cached = ratesCache.get(cacheKey);
    if (cached && (now - cached.timestamp < CACHE_TTL)) {
      console.log("Serving from cache");
      return new Response(
        JSON.stringify({ ...cached.data, cached: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Fetch fresh rates
    try {
      const ratesData = await fetchRates(base.toUpperCase(), symbols.toUpperCase());
      
      // Cache the result
      ratesCache.set(cacheKey, { data: ratesData, timestamp: now });
      console.log(`Cached rates for ${cacheKey}`);
      
      return new Response(
        JSON.stringify(ratesData),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60',
          },
        }
      );
    } catch (error) {
      console.error("All providers failed, checking for stale cache...");
      
      // If all fails, return cached data even if stale
      if (cached) {
        console.log("Returning stale cache");
        return new Response(
          JSON.stringify({ 
            ...cached.data, 
            cached: true, 
            fallback: true,
            warning: "Using cached data - all providers unavailable",
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      // No cache available
      return new Response(
        JSON.stringify({ 
          error: 'Unable to fetch rates from any provider',
          base: base.toUpperCase(),
          symbols: symbols.toUpperCase(),
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 503,
        }
      );
    }
  } catch (error) {
    console.error("Error in rates function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
