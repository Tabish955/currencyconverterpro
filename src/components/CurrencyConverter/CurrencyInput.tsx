import React, { useState, useRef, useEffect } from "react";
import 'flag-icons/css/flag-icons.min.css';
import { getCountryCode } from "./currencyFlags";

interface CurrencyInputProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
  currencyCode: string;
  disabled?: boolean;
}

const CurrencyInput = ({ id, value, onChange, currencyCode, disabled = false }: CurrencyInputProps) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) setInputValue(value.toString());
  }, [value, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue === "") { setInputValue(""); onChange(0); return; }
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (regex.test(newValue)) {
      setInputValue(newValue);
      const numericValue = parseFloat(newValue);
      if (!isNaN(numericValue)) onChange(numericValue);
    }
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => {
    setIsFocused(false);
    if (inputValue === "") { setInputValue("0"); onChange(0); }
    else setInputValue(parseFloat(inputValue).toString());
  };

  const countryCode = getCountryCode(currencyCode);

  return (
    <div
      className="relative rounded-xl transition-all duration-300"
      style={{
        boxShadow: isFocused ? '0 0 0 3px hsl(var(--converter-accent) / 0.15)' : 'none',
      }}
      onClick={() => inputRef.current && !disabled && inputRef.current.focus()}
    >
      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 gap-2 pointer-events-none">
        <span
          className={`fi fi-${countryCode} rounded-sm`}
          style={{ width: '1.2em', height: '0.9em', display: 'inline-block' }}
          aria-hidden="true"
        />
        <span className="text-xs font-bold" style={{ color: 'hsl(var(--converter-text-muted))' }}>
          {currencyCode}
        </span>
      </div>
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className={`block w-full pl-20 pr-4 py-3.5 rounded-xl border text-right font-semibold text-lg outline-none transition-all duration-200 ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-text"
        }`}
        style={{
          background: 'hsl(var(--converter-input-bg))',
          borderColor: isFocused ? 'hsl(var(--converter-accent) / 0.5)' : 'hsl(var(--converter-border))',
          color: 'hsl(var(--converter-text))',
        }}
        placeholder="0"
      />
    </div>
  );
};

export default CurrencyInput;
