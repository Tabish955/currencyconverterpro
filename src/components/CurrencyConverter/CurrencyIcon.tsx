import { useState } from 'react';
import 'flag-icons/css/flag-icons.min.css';
import { getCurrencyCategory, getCountryCode, getCryptoIconUrl, getCryptoFallbackUrl, getMetalEmoji } from './currencyFlags';

interface CurrencyIconProps {
  code: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { flag: { width: '1.2em', height: '0.9em' }, icon: 14, text: 'text-xs' },
  md: { flag: { width: '1.4em', height: '1.1em' }, icon: 18, text: 'text-sm' },
  lg: { flag: { width: '1.6em', height: '1.2em' }, icon: 22, text: 'text-base' },
};

const CurrencyIcon = ({ code, size = 'md', className = '' }: CurrencyIconProps) => {
  const [imgError, setImgError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);
  const category = getCurrencyCategory(code);
  const s = sizeMap[size];

  if (category === 'fiat') {
    const countryCode = getCountryCode(code);
    if (countryCode) {
      return (
        <span
          className={`fi fi-${countryCode} rounded-sm shadow-sm ${className}`}
          style={{ width: s.flag.width, height: s.flag.height, display: 'inline-block' }}
          aria-hidden="true"
        />
      );
    }
    // Fiat without country code - show code badge
    return (
      <span
        className={`inline-flex items-center justify-center rounded-sm font-bold ${s.text} ${className}`}
        style={{
          width: s.flag.width,
          height: s.flag.height,
          background: 'hsl(var(--converter-accent) / 0.15)',
          color: 'hsl(var(--converter-accent))',
          fontSize: '0.55em',
        }}
      >
        {code.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  if (category === 'metal') {
    const emoji = getMetalEmoji(code);
    return (
      <span className={`inline-flex items-center justify-center ${className}`} style={{ fontSize: s.icon * 0.8 }} aria-hidden="true">
        {emoji}
      </span>
    );
  }

  if (category === 'crypto') {
    if (fallbackError) {
      // Both primary and fallback failed - show text badge
      return (
        <span
          className={`inline-flex items-center justify-center rounded-full font-bold ${className}`}
          style={{
            width: s.icon + 4,
            height: s.icon + 4,
            background: 'hsl(var(--converter-accent) / 0.15)',
            color: 'hsl(var(--converter-accent))',
            fontSize: '0.5em',
          }}
        >
          {code.slice(0, 3).toUpperCase()}
        </span>
      );
    }

    return (
      <img
        src={imgError ? getCryptoFallbackUrl() : getCryptoIconUrl(code)}
        alt={code}
        width={s.icon + 2}
        height={s.icon + 2}
        className={`rounded-full ${className}`}
        onError={() => {
          if (imgError) setFallbackError(true);
          else setImgError(true);
        }}
        loading="lazy"
      />
    );
  }

  // Regional or unknown
  return (
    <span
      className={`inline-flex items-center justify-center rounded-sm font-bold ${className}`}
      style={{
        width: s.flag.width,
        height: s.flag.height,
        background: 'hsl(var(--converter-accent) / 0.15)',
        color: 'hsl(var(--converter-accent))',
        fontSize: '0.55em',
      }}
    >
      {code.slice(0, 3).toUpperCase()}
    </span>
  );
};

export default CurrencyIcon;
