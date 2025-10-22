import { useQuery } from '@tanstack/react-query';

// Match the interface from VirtualizedDropdown
interface CurrencySymbol {
  code: string;
  description: string;
  countryCode?: string;
  aliases?: string[];
}

export const useCurrencySymbols = () => {
  return useQuery({
    queryKey: ['currencySymbols'],
    queryFn: async () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const apiUrl = `${supabaseUrl}/functions/v1/symbols`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch currency symbols');
      }
      
      const data = await response.json();
      // Map name to description for compatibility with VirtualizedDropdown
      return (data.symbols as any[]).map(symbol => ({
        code: symbol.code,
        description: symbol.name,
        countryCode: symbol.countryCode,
        aliases: symbol.aliases,
      })) as CurrencySymbol[];
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
