// Web Worker for offloading currency search to prevent main thread blocking
import Fuse from 'fuse.js';

interface CurrencySymbol {
  code: string;
  description: string;
  countryCode?: string;
  aliases?: string[];
}

interface EnrichedCurrencySymbol extends CurrencySymbol {
  countryCode: string;
  searchableText: string;
}

interface SearchMessage {
  type: 'INIT' | 'SEARCH';
  currencies?: EnrichedCurrencySymbol[];
  query?: string;
}

interface SearchResult {
  type: 'SEARCH_RESULT';
  results: string[]; // Array of currency codes
}

let fuse: Fuse<EnrichedCurrencySymbol> | null = null;
let allCurrencies: EnrichedCurrencySymbol[] = [];

// Enhanced currency aliases for better search
const CURRENCY_ALIASES: Record<string, string[]> = {
  USD: ["United States Dollar", "US Dollar", "American Dollar", "Dollar", "United States", "America", "USA"],
  EUR: ["Euro", "European Union", "Europe", "EU"],
  GBP: ["British Pound", "Pound Sterling", "UK Pound", "United Kingdom", "Britain", "England"],
  JPY: ["Japanese Yen", "Yen", "Japan"],
  CHF: ["Swiss Franc", "Switzerland", "Franc"],
  CAD: ["Canadian Dollar", "Canada", "Canadian"],
  AUD: ["Australian Dollar", "Australia", "Aussie Dollar"],
  CNY: ["Chinese Yuan", "Yuan", "China", "Chinese"],
  INR: ["Indian Rupee", "Rupee", "India"],
  KRW: ["South Korean Won", "Won", "Korea", "South Korea"],
  SGD: ["Singapore Dollar", "Singapore"],
  HKD: ["Hong Kong Dollar", "Hong Kong"],
  NOK: ["Norwegian Krone", "Norway", "Krone"],
  SEK: ["Swedish Krona", "Sweden", "Krona"],
  DKK: ["Danish Krone", "Denmark"],
  PLN: ["Polish Zloty", "Poland", "Zloty"],
  CZK: ["Czech Koruna", "Czech Republic", "Koruna"],
  HUF: ["Hungarian Forint", "Hungary", "Forint"],
  RUB: ["Russian Ruble", "Russia", "Ruble"],
  TRY: ["Turkish Lira", "Turkey", "Lira"],
  BRL: ["Brazilian Real", "Brazil", "Real"],
  MXN: ["Mexican Peso", "Mexico", "Peso"],
  ZAR: ["South African Rand", "South Africa", "Rand"],
  NZD: ["New Zealand Dollar", "New Zealand"],
  THB: ["Thai Baht", "Thailand", "Baht"],
  MYR: ["Malaysian Ringgit", "Malaysia", "Ringgit"],
  IDR: ["Indonesian Rupiah", "Indonesia", "Rupiah"],
  PHP: ["Philippine Peso", "Philippines"],
  VND: ["Vietnamese Dong", "Vietnam", "Dong"],
  AED: ["UAE Dirham", "United Arab Emirates", "Dirham"],
  SAR: ["Saudi Riyal", "Saudi Arabia", "Riyal"],
  QAR: ["Qatari Riyal", "Qatar"],
  KWD: ["Kuwaiti Dinar", "Kuwait", "Dinar"],
  BHD: ["Bahraini Dinar", "Bahrain"],
  OMR: ["Omani Rial", "Oman", "Rial"],
  JOD: ["Jordanian Dinar", "Jordan"],
  EGP: ["Egyptian Pound", "Egypt"],
  ILS: ["Israeli Shekel", "Israel", "Shekel"],
  LBP: ["Lebanese Pound", "Lebanon"],
  PKR: ["Pakistani Rupee", "Pakistan"],
  LKR: ["Sri Lankan Rupee", "Sri Lanka"],
};

self.onmessage = function(e: MessageEvent<SearchMessage>) {
  const { type, currencies, query } = e.data;

  switch (type) {
    case 'INIT':
      if (currencies) {
        // Initialize Fuse with enhanced searchable text
        const enrichedCurrencies = currencies.map((currency): EnrichedCurrencySymbol => {
          const aliases = CURRENCY_ALIASES[currency.code] || [];
          const searchableText = [
            currency.code,
            currency.description,
            ...aliases,
            ...(currency.aliases || [])
          ].join(" ").toLowerCase();
          
          return {
            ...currency,
            countryCode: currency.countryCode || "",
            searchableText
          };
        });

        // Store all currencies for empty query fallback
        allCurrencies = enrichedCurrencies;

        fuse = new Fuse(enrichedCurrencies, {
          keys: [
            { name: "code", weight: 0.3 },
            { name: "description", weight: 0.4 },
            { name: "searchableText", weight: 0.3 }
          ],
          threshold: 0.4,
          includeScore: true,
          minMatchCharLength: 1,
          ignoreLocation: true,
          findAllMatches: true
        });
      }
      break;

    case 'SEARCH':
      if (fuse && query) {
        const results = fuse.search(query.trim());
        const resultCodes = results.map(result => result.item.code);
        
        const response: SearchResult = {
          type: 'SEARCH_RESULT',
          results: resultCodes
        };
        
        self.postMessage(response);
      } else if (allCurrencies.length > 0 && !query?.trim()) {
        // Return all currencies when query is empty
        const allResults = allCurrencies.map(currency => currency.code);
        const response: SearchResult = {
          type: 'SEARCH_RESULT',
          results: allResults
        };
        self.postMessage(response);
      }
      break;
  }
};