// Custom hook for managing search worker with performance optimizations
import { useEffect, useRef, useCallback, useState } from 'react';

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

interface SearchResult {
  type: 'SEARCH_RESULT';
  results: string[];
}

export const useSearchWorker = (currencies: CurrencySymbol[]) => {
  const workerRef = useRef<Worker | null>(null);
  const [isWorkerReady, setIsWorkerReady] = useState(false);

  // Initialize worker once
  useEffect(() => {
    if (!workerRef.current) {
      try {
        // Dynamically import worker to enable code splitting
        workerRef.current = new Worker(
          new URL('../workers/searchWorker.ts', import.meta.url),
          { type: 'module' }
        );

        workerRef.current.onmessage = (e: MessageEvent<SearchResult>) => {
          // Handle search results - will be processed by individual search calls
        };

        workerRef.current.onerror = (error) => {
          console.warn('Search worker error:', error);
          setIsWorkerReady(false);
        };

        // Initialize worker with currencies
        const enrichedCurrencies: EnrichedCurrencySymbol[] = currencies.map((currency) => ({
          ...currency,
          countryCode: currency.countryCode || "",
          searchableText: ""
        }));

        workerRef.current.postMessage({
          type: 'INIT',
          currencies: enrichedCurrencies
        });

        setIsWorkerReady(true);
      } catch (error) {
        console.warn('Failed to initialize search worker:', error);
        setIsWorkerReady(false);
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
        setIsWorkerReady(false);
      }
    };
  }, [currencies]);

  // Memoized search function
  const search = useCallback((query: string): Promise<string[]> => {
    return new Promise((resolve) => {
      if (!workerRef.current || !isWorkerReady) {
        // Fallback: simple local search if worker not available
        const results = currencies
          .filter(currency => 
            currency.code.toLowerCase().includes(query.toLowerCase()) ||
            currency.description.toLowerCase().includes(query.toLowerCase())
          )
          .map(currency => currency.code);
        resolve(results);
        return;
      }

      const handleMessage = (e: MessageEvent<SearchResult>) => {
        if (e.data.type === 'SEARCH_RESULT') {
          workerRef.current?.removeEventListener('message', handleMessage);
          resolve(e.data.results);
        }
      };

      workerRef.current.addEventListener('message', handleMessage);
      workerRef.current.postMessage({
        type: 'SEARCH',
        query
      });
    });
  }, [currencies, isWorkerReady]);

  return { search, isWorkerReady };
};