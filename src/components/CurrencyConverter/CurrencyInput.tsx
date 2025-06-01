
import React, { useState, useRef, useEffect } from "react";

interface CurrencyInputProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
  currencyCode: string;
  disabled?: boolean;
}

const CurrencyInput = ({
  id,
  value,
  onChange,
  currencyCode,
  disabled = false,
}: CurrencyInputProps) => {
  // Local state for input display value
  const [inputValue, setInputValue] = useState(value.toString());
  // Reference to the input element to maintain focus
  const inputRef = useRef<HTMLInputElement>(null);
  // To track if the input is focused
  const [isFocused, setIsFocused] = useState(false);
  
  // Update local state when value prop changes
  useEffect(() => {
    // Only update if the input is not focused to prevent cursor jumping
    if (!isFocused) {
      setInputValue(value.toString());
    }
  }, [value, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Allow empty string for backspacing
    if (newValue === "") {
      setInputValue("");
      onChange(0);
      return;
    }
    
    // Only allow numbers and a single decimal point
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (regex.test(newValue)) {
      setInputValue(newValue);
      
      // Convert to number and call onChange if valid
      const numericValue = parseFloat(newValue);
      if (!isNaN(numericValue)) {
        onChange(numericValue);
      }
    }
  };

  // Handle focus events
  const handleFocus = () => {
    setIsFocused(true);
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    
    // Format the value on blur to ensure it displays properly
    if (inputValue === "") {
      setInputValue("0");
      onChange(0);
    } else {
      // Format the number to 4 decimal places for fiat currencies
      const formatted = parseFloat(inputValue).toFixed(4);
      const numericValue = parseFloat(formatted);
      
      // Ensure the displayed value matches the actual value
      setInputValue(numericValue.toString());
    }
  };

  // Focus the input element if there's a click on the container
  const handleContainerClick = () => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  };

  return (
    <div 
      className={`relative rounded-md shadow-sm transition-all duration-300 ${
        isFocused ? "ring-2 ring-blue-300" : ""
      }`}
      onClick={handleContainerClick}
    >
      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
        <span className="text-gray-500 sm:text-sm">{currencyCode}</span>
      </div>
      <input
        ref={inputRef}
        id={id}
        type="text"
        inputMode="decimal" // Use numeric keyboard on mobile
        pattern="[0-9]*\.?[0-9]*" // This helps with validating input format
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className={`
          block w-full pl-16 pr-3 py-3 rounded-md 
          border-gray-300 border focus:outline-none
          bg-white placeholder-gray-400 
          text-gray-900 font-medium text-lg
          transition-all duration-200
          currency-input
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-text hover:border-gray-400"}
          ${isFocused ? "border-blue-400 shadow-blue-100" : ""}
        `}
        placeholder="0"
        aria-describedby={`${id}-currency`}
      />
    </div>
  );
};

export default CurrencyInput;
