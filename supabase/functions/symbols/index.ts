import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory cache for currency symbols
let cachedSymbols: any = null;
let cacheTimestamp = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Enhanced currency mappings with country codes and aliases
const CURRENCY_DATA: Record<string, { countryCode: string; aliases: string[] }> = {
  USD: { countryCode: "us", aliases: ["United States Dollar", "US Dollar", "American Dollar", "Dollar", "United States", "America", "USA"] },
  EUR: { countryCode: "eu", aliases: ["Euro", "European Union", "Europe", "EU"] },
  GBP: { countryCode: "gb", aliases: ["British Pound", "Pound Sterling", "UK Pound", "United Kingdom", "Britain", "England"] },
  JPY: { countryCode: "jp", aliases: ["Japanese Yen", "Yen", "Japan"] },
  CHF: { countryCode: "ch", aliases: ["Swiss Franc", "Switzerland", "Franc"] },
  CAD: { countryCode: "ca", aliases: ["Canadian Dollar", "Canada", "Canadian"] },
  AUD: { countryCode: "au", aliases: ["Australian Dollar", "Australia", "Aussie Dollar"] },
  CNY: { countryCode: "cn", aliases: ["Chinese Yuan", "Yuan", "China", "Chinese", "Renminbi"] },
  INR: { countryCode: "in", aliases: ["Indian Rupee", "Rupee", "India"] },
  KRW: { countryCode: "kr", aliases: ["South Korean Won", "Won", "Korea", "South Korea"] },
  SGD: { countryCode: "sg", aliases: ["Singapore Dollar", "Singapore"] },
  HKD: { countryCode: "hk", aliases: ["Hong Kong Dollar", "Hong Kong"] },
  NOK: { countryCode: "no", aliases: ["Norwegian Krone", "Norway", "Krone"] },
  SEK: { countryCode: "se", aliases: ["Swedish Krona", "Sweden", "Krona"] },
  DKK: { countryCode: "dk", aliases: ["Danish Krone", "Denmark"] },
  PLN: { countryCode: "pl", aliases: ["Polish Zloty", "Poland", "Zloty"] },
  CZK: { countryCode: "cz", aliases: ["Czech Koruna", "Czech Republic", "Koruna"] },
  HUF: { countryCode: "hu", aliases: ["Hungarian Forint", "Hungary", "Forint"] },
  RUB: { countryCode: "ru", aliases: ["Russian Ruble", "Russia", "Ruble"] },
  TRY: { countryCode: "tr", aliases: ["Turkish Lira", "Turkey", "Lira"] },
  BRL: { countryCode: "br", aliases: ["Brazilian Real", "Brazil", "Real"] },
  MXN: { countryCode: "mx", aliases: ["Mexican Peso", "Mexico", "Peso"] },
  ZAR: { countryCode: "za", aliases: ["South African Rand", "South Africa", "Rand"] },
  NZD: { countryCode: "nz", aliases: ["New Zealand Dollar", "New Zealand"] },
  THB: { countryCode: "th", aliases: ["Thai Baht", "Thailand", "Baht"] },
  MYR: { countryCode: "my", aliases: ["Malaysian Ringgit", "Malaysia", "Ringgit"] },
  IDR: { countryCode: "id", aliases: ["Indonesian Rupiah", "Indonesia", "Rupiah"] },
  PHP: { countryCode: "ph", aliases: ["Philippine Peso", "Philippines"] },
  VND: { countryCode: "vn", aliases: ["Vietnamese Dong", "Vietnam", "Dong"] },
  AED: { countryCode: "ae", aliases: ["UAE Dirham", "United Arab Emirates", "Dirham"] },
  SAR: { countryCode: "sa", aliases: ["Saudi Riyal", "Saudi Arabia", "Riyal"] },
  QAR: { countryCode: "qa", aliases: ["Qatari Riyal", "Qatar"] },
  KWD: { countryCode: "kw", aliases: ["Kuwaiti Dinar", "Kuwait", "Dinar"] },
  BHD: { countryCode: "bh", aliases: ["Bahraini Dinar", "Bahrain"] },
  OMR: { countryCode: "om", aliases: ["Omani Rial", "Oman", "Rial"] },
  JOD: { countryCode: "jo", aliases: ["Jordanian Dinar", "Jordan"] },
  EGP: { countryCode: "eg", aliases: ["Egyptian Pound", "Egypt"] },
  ILS: { countryCode: "il", aliases: ["Israeli Shekel", "Israel", "Shekel"] },
  LBP: { countryCode: "lb", aliases: ["Lebanese Pound", "Lebanon"] },
  PKR: { countryCode: "pk", aliases: ["Pakistani Rupee", "Pakistan"] },
  LKR: { countryCode: "lk", aliases: ["Sri Lankan Rupee", "Sri Lanka"] },
  AFN: { countryCode: "af", aliases: ["Afghan Afghani", "Afghanistan"] },
  ALL: { countryCode: "al", aliases: ["Albanian Lek", "Albania"] },
  AMD: { countryCode: "am", aliases: ["Armenian Dram", "Armenia"] },
  ANG: { countryCode: "cw", aliases: ["Netherlands Antillean Guilder", "Curacao"] },
  AOA: { countryCode: "ao", aliases: ["Angolan Kwanza", "Angola"] },
  ARS: { countryCode: "ar", aliases: ["Argentine Peso", "Argentina"] },
  AWG: { countryCode: "aw", aliases: ["Aruban Florin", "Aruba"] },
  AZN: { countryCode: "az", aliases: ["Azerbaijani Manat", "Azerbaijan"] },
  BAM: { countryCode: "ba", aliases: ["Bosnia-Herzegovina Convertible Mark", "Bosnia"] },
  BBD: { countryCode: "bb", aliases: ["Barbadian Dollar", "Barbados"] },
  BDT: { countryCode: "bd", aliases: ["Bangladeshi Taka", "Bangladesh"] },
  BGN: { countryCode: "bg", aliases: ["Bulgarian Lev", "Bulgaria"] },
  BIF: { countryCode: "bi", aliases: ["Burundian Franc", "Burundi"] },
  BMD: { countryCode: "bm", aliases: ["Bermudian Dollar", "Bermuda"] },
  BND: { countryCode: "bn", aliases: ["Brunei Dollar", "Brunei"] },
  BOB: { countryCode: "bo", aliases: ["Bolivian Boliviano", "Bolivia"] },
  BSD: { countryCode: "bs", aliases: ["Bahamian Dollar", "Bahamas"] },
  BTN: { countryCode: "bt", aliases: ["Bhutanese Ngultrum", "Bhutan"] },
  BWP: { countryCode: "bw", aliases: ["Botswana Pula", "Botswana"] },
  BYN: { countryCode: "by", aliases: ["Belarusian Ruble", "Belarus"] },
  BZD: { countryCode: "bz", aliases: ["Belize Dollar", "Belize"] },
  CDF: { countryCode: "cd", aliases: ["Congolese Franc", "Congo"] },
  CLP: { countryCode: "cl", aliases: ["Chilean Peso", "Chile"] },
  COP: { countryCode: "co", aliases: ["Colombian Peso", "Colombia"] },
  CRC: { countryCode: "cr", aliases: ["Costa Rican Colon", "Costa Rica"] },
  CUP: { countryCode: "cu", aliases: ["Cuban Peso", "Cuba"] },
  CVE: { countryCode: "cv", aliases: ["Cape Verdean Escudo", "Cape Verde"] },
  DJF: { countryCode: "dj", aliases: ["Djiboutian Franc", "Djibouti"] },
  DOP: { countryCode: "do", aliases: ["Dominican Peso", "Dominican Republic"] },
  DZD: { countryCode: "dz", aliases: ["Algerian Dinar", "Algeria"] },
  ERN: { countryCode: "er", aliases: ["Eritrean Nakfa", "Eritrea"] },
  ETB: { countryCode: "et", aliases: ["Ethiopian Birr", "Ethiopia"] },
  FJD: { countryCode: "fj", aliases: ["Fijian Dollar", "Fiji"] },
  FKP: { countryCode: "fk", aliases: ["Falkland Islands Pound", "Falkland Islands"] },
  GEL: { countryCode: "ge", aliases: ["Georgian Lari", "Georgia"] },
  GHS: { countryCode: "gh", aliases: ["Ghanaian Cedi", "Ghana"] },
  GIP: { countryCode: "gi", aliases: ["Gibraltar Pound", "Gibraltar"] },
  GMD: { countryCode: "gm", aliases: ["Gambian Dalasi", "Gambia"] },
  GNF: { countryCode: "gn", aliases: ["Guinean Franc", "Guinea"] },
  GTQ: { countryCode: "gt", aliases: ["Guatemalan Quetzal", "Guatemala"] },
  GYD: { countryCode: "gy", aliases: ["Guyanese Dollar", "Guyana"] },
  HNL: { countryCode: "hn", aliases: ["Honduran Lempira", "Honduras"] },
  HRK: { countryCode: "hr", aliases: ["Croatian Kuna", "Croatia"] },
  HTG: { countryCode: "ht", aliases: ["Haitian Gourde", "Haiti"] },
  IQD: { countryCode: "iq", aliases: ["Iraqi Dinar", "Iraq"] },
  IRR: { countryCode: "ir", aliases: ["Iranian Rial", "Iran"] },
  ISK: { countryCode: "is", aliases: ["Icelandic Krona", "Iceland"] },
  JMD: { countryCode: "jm", aliases: ["Jamaican Dollar", "Jamaica"] },
  KES: { countryCode: "ke", aliases: ["Kenyan Shilling", "Kenya"] },
  KGS: { countryCode: "kg", aliases: ["Kyrgyzstani Som", "Kyrgyzstan"] },
  KHR: { countryCode: "kh", aliases: ["Cambodian Riel", "Cambodia"] },
  KMF: { countryCode: "km", aliases: ["Comorian Franc", "Comoros"] },
  KYD: { countryCode: "ky", aliases: ["Cayman Islands Dollar", "Cayman Islands"] },
  KZT: { countryCode: "kz", aliases: ["Kazakhstani Tenge", "Kazakhstan"] },
  LAK: { countryCode: "la", aliases: ["Lao Kip", "Laos"] },
  LRD: { countryCode: "lr", aliases: ["Liberian Dollar", "Liberia"] },
  LSL: { countryCode: "ls", aliases: ["Lesotho Loti", "Lesotho"] },
  LYD: { countryCode: "ly", aliases: ["Libyan Dinar", "Libya"] },
  MAD: { countryCode: "ma", aliases: ["Moroccan Dirham", "Morocco"] },
  MDL: { countryCode: "md", aliases: ["Moldovan Leu", "Moldova"] },
  MGA: { countryCode: "mg", aliases: ["Malagasy Ariary", "Madagascar"] },
  MKD: { countryCode: "mk", aliases: ["Macedonian Denar", "Macedonia"] },
  MMK: { countryCode: "mm", aliases: ["Myanmar Kyat", "Myanmar"] },
  MNT: { countryCode: "mn", aliases: ["Mongolian Tugrik", "Mongolia"] },
  MOP: { countryCode: "mo", aliases: ["Macanese Pataca", "Macau"] },
  MRU: { countryCode: "mr", aliases: ["Mauritanian Ouguiya", "Mauritania"] },
  MUR: { countryCode: "mu", aliases: ["Mauritian Rupee", "Mauritius"] },
  MVR: { countryCode: "mv", aliases: ["Maldivian Rufiyaa", "Maldives"] },
  MWK: { countryCode: "mw", aliases: ["Malawian Kwacha", "Malawi"] },
  MZN: { countryCode: "mz", aliases: ["Mozambican Metical", "Mozambique"] },
  NAD: { countryCode: "na", aliases: ["Namibian Dollar", "Namibia"] },
  NGN: { countryCode: "ng", aliases: ["Nigerian Naira", "Nigeria"] },
  NIO: { countryCode: "ni", aliases: ["Nicaraguan Cordoba", "Nicaragua"] },
  NPR: { countryCode: "np", aliases: ["Nepalese Rupee", "Nepal"] },
  PAB: { countryCode: "pa", aliases: ["Panamanian Balboa", "Panama"] },
  PEN: { countryCode: "pe", aliases: ["Peruvian Sol", "Peru"] },
  PGK: { countryCode: "pg", aliases: ["Papua New Guinean Kina", "Papua New Guinea"] },
  PYG: { countryCode: "py", aliases: ["Paraguayan Guarani", "Paraguay"] },
  RON: { countryCode: "ro", aliases: ["Romanian Leu", "Romania"] },
  RSD: { countryCode: "rs", aliases: ["Serbian Dinar", "Serbia"] },
  RWF: { countryCode: "rw", aliases: ["Rwandan Franc", "Rwanda"] },
  SBD: { countryCode: "sb", aliases: ["Solomon Islands Dollar", "Solomon Islands"] },
  SCR: { countryCode: "sc", aliases: ["Seychellois Rupee", "Seychelles"] },
  SDG: { countryCode: "sd", aliases: ["Sudanese Pound", "Sudan"] },
  SHP: { countryCode: "sh", aliases: ["Saint Helena Pound", "Saint Helena"] },
  SLE: { countryCode: "sl", aliases: ["Sierra Leonean Leone", "Sierra Leone"] },
  SOS: { countryCode: "so", aliases: ["Somali Shilling", "Somalia"] },
  SRD: { countryCode: "sr", aliases: ["Surinamese Dollar", "Suriname"] },
  SSP: { countryCode: "ss", aliases: ["South Sudanese Pound", "South Sudan"] },
  STN: { countryCode: "st", aliases: ["Sao Tome and Principe Dobra", "Sao Tome"] },
  SYP: { countryCode: "sy", aliases: ["Syrian Pound", "Syria"] },
  SZL: { countryCode: "sz", aliases: ["Swazi Lilangeni", "Eswatini"] },
  TJS: { countryCode: "tj", aliases: ["Tajikistani Somoni", "Tajikistan"] },
  TMT: { countryCode: "tm", aliases: ["Turkmenistani Manat", "Turkmenistan"] },
  TND: { countryCode: "tn", aliases: ["Tunisian Dinar", "Tunisia"] },
  TOP: { countryCode: "to", aliases: ["Tongan Pa'anga", "Tonga"] },
  TTD: { countryCode: "tt", aliases: ["Trinidad and Tobago Dollar", "Trinidad"] },
  TWD: { countryCode: "tw", aliases: ["New Taiwan Dollar", "Taiwan"] },
  TZS: { countryCode: "tz", aliases: ["Tanzanian Shilling", "Tanzania"] },
  UAH: { countryCode: "ua", aliases: ["Ukrainian Hryvnia", "Ukraine"] },
  UGX: { countryCode: "ug", aliases: ["Ugandan Shilling", "Uganda"] },
  UYU: { countryCode: "uy", aliases: ["Uruguayan Peso", "Uruguay"] },
  UZS: { countryCode: "uz", aliases: ["Uzbekistani Som", "Uzbekistan"] },
  VES: { countryCode: "ve", aliases: ["Venezuelan Bolivar", "Venezuela"] },
  VUV: { countryCode: "vu", aliases: ["Vanuatu Vatu", "Vanuatu"] },
  WST: { countryCode: "ws", aliases: ["Samoan Tala", "Samoa"] },
  XAF: { countryCode: "cm", aliases: ["Central African CFA Franc", "Central Africa"] },
  XCD: { countryCode: "ag", aliases: ["East Caribbean Dollar", "Eastern Caribbean"] },
  XOF: { countryCode: "sn", aliases: ["West African CFA Franc", "West Africa"] },
  XPF: { countryCode: "pf", aliases: ["CFP Franc", "French Polynesia"] },
  YER: { countryCode: "ye", aliases: ["Yemeni Rial", "Yemen"] },
  ZMW: { countryCode: "zm", aliases: ["Zambian Kwacha", "Zambia"] },
  ZWL: { countryCode: "zw", aliases: ["Zimbabwean Dollar", "Zimbabwe"] },
};

async function fetchCurrencySymbols(): Promise<any> {
  console.log("Fetching fresh currency symbols...");
  
  try {
    // Try primary CDN source
    const cdnResponse = await fetch(
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json",
      { signal: AbortSignal.timeout(5000) }
    );
    
    if (cdnResponse.ok) {
      const data = await cdnResponse.json();
      console.log("Fetched from CDN successfully");
      return data;
    }
  } catch (error) {
    console.warn("CDN fetch failed:", error);
  }
  
  try {
    // Fallback to Pages
    const pagesResponse = await fetch(
      "https://latest.currency-api.pages.dev/v1/currencies.json",
      { signal: AbortSignal.timeout(5000) }
    );
    
    if (pagesResponse.ok) {
      const data = await pagesResponse.json();
      console.log("Fetched from Pages fallback successfully");
      return data;
    }
  } catch (error) {
    console.warn("Pages fetch failed:", error);
  }
  
  // Final fallback: use our predefined list
  console.log("Using predefined currency list as fallback");
  return Object.keys(CURRENCY_DATA).reduce((acc, code) => {
    acc[code.toLowerCase()] = code;
    return acc;
  }, {} as Record<string, string>);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = Date.now();
    const isCacheValid = cachedSymbols && (now - cacheTimestamp < CACHE_TTL);
    
    if (!isCacheValid) {
      console.log("Cache expired or empty, fetching fresh data...");
      const rawSymbols = await fetchCurrencySymbols();
      
      // Transform to our format with enhanced metadata
      const symbols = Object.entries(rawSymbols).map(([key, value]) => {
        const code = String(value).toUpperCase();
        const metadata = CURRENCY_DATA[code];
        
        return {
          code,
          name: key,
          countryCode: metadata?.countryCode || "",
          aliases: metadata?.aliases || [key, code],
        };
      });
      
      cachedSymbols = symbols;
      cacheTimestamp = now;
      console.log(`Cached ${symbols.length} currency symbols`);
    } else {
      console.log("Serving from cache");
    }
    
    return new Response(
      JSON.stringify({ 
        symbols: cachedSymbols,
        cached: isCacheValid,
        fetchedAt: new Date(cacheTimestamp).toISOString(),
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=86400', // 24 hours
        } 
      }
    );
  } catch (error) {
    console.error("Error in symbols function:", error);
    
    // If we have cached data, return it even if expired
    if (cachedSymbols) {
      console.log("Returning stale cache due to error");
      return new Response(
        JSON.stringify({ 
          symbols: cachedSymbols,
          cached: true,
          fallback: true,
          error: "Using cached data due to fetch failure",
          fetchedAt: new Date(cacheTimestamp).toISOString(),
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 503,
      }
    );
  }
});
