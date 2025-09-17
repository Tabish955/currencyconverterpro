// Optimized lazy-loading flag component with caching and performance improvements
import React, { useState, memo, useCallback, useMemo } from 'react';
import { Flag } from 'lucide-react';

interface LazyFlagProps {
  countryCode: string;
  currencyCode: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// In-memory cache for loaded flags to prevent re-fetching
const flagCache = new Map<string, string>();
const errorCache = new Set<string>();

// Preload critical flags for common currencies
const COMMON_FLAGS = ['us', 'eu', 'gb', 'jp', 'ca', 'au', 'ch', 'cn', 'kw', 'pk'];

// Lazy flag component with aggressive memoization
const LazyFlag = memo<LazyFlagProps>(({ 
  countryCode, 
  currencyCode, 
  size = 'md',
  className = ''
}) => {
  const [hasError, setHasError] = useState(() => 
    errorCache.has(countryCode.toLowerCase())
  );
  const [isLoaded, setIsLoaded] = useState(() => 
    flagCache.has(countryCode.toLowerCase())
  );

  const normalizedCountryCode = countryCode.toLowerCase();

  // Memoized size classes
  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'sm': return 'w-4 h-3';
      case 'lg': return 'w-8 h-6';
      default: return 'w-6 h-4';
    }
  }, [size]);

  // Memoized flag URL
  const flagUrl = useMemo(() => 
    `https://flagcdn.com/w20/${normalizedCountryCode}.png`,
    [normalizedCountryCode]
  );

  // Optimized error handler
  const handleError = useCallback(() => {
    errorCache.add(normalizedCountryCode);
    setHasError(true);
  }, [normalizedCountryCode]);

  // Optimized load handler
  const handleLoad = useCallback(() => {
    flagCache.set(normalizedCountryCode, flagUrl);
    setIsLoaded(true);
  }, [normalizedCountryCode, flagUrl]);

  // Don't render anything if country code is missing
  if (!countryCode || hasError) {
    return (
      <div className={`${sizeClasses} bg-gradient-to-br from-gray-200 to-gray-300 rounded-sm flex items-center justify-center ${className}`}>
        <Flag className="w-3 h-3 text-gray-500" />
      </div>
    );
  }

  return (
    <img
      src={flagUrl}
      alt={`${currencyCode} flag`}
      className={`${sizeClasses} object-cover rounded-sm border border-gray-200 shadow-sm ${className}`}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
      decoding="async"
      // Optimize for performance
      style={{
        willChange: isLoaded ? 'auto' : 'opacity',
        opacity: isLoaded ? 1 : 0.8
      }}
    />
  );
});

LazyFlag.displayName = 'LazyFlag';

// Preload common flags on module load (only in production)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // Use requestIdleCallback if available, otherwise setTimeout
  const preloadFlags = () => {
    COMMON_FLAGS.forEach(code => {
      const img = new Image();
      img.src = `https://flagcdn.com/w20/${code}.png`;
      img.onload = () => flagCache.set(code, img.src);
      img.onerror = () => errorCache.add(code);
    });
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(preloadFlags, { timeout: 1000 });
  } else {
    setTimeout(preloadFlags, 1000);
  }
}

export default LazyFlag;