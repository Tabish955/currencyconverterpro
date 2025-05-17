
import React from "react";

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
  // Format the input value for display
  const formattedValue = value === 0 && document.activeElement?.id === id 
    ? "" 
    : value.toLocaleString(undefined, {
        maximumFractionDigits: 6,
        minimumFractionDigits: 2,
      });

  // Handler for input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters except decimal points
    const sanitizedValue = e.target.value.replace(/[^0-9.]/g, "");
    
    // Handle multiple decimal points
    const decimalPoints = sanitizedValue.match(/\./g) || [];
    if (decimalPoints.length > 1) {
      return;
    }
    
    // Convert to number
    const numericValue = parseFloat(sanitizedValue);
    
    // Update if it's a valid number or empty string
    if (!isNaN(numericValue)) {
      onChange(numericValue);
    } else if (e.target.value === "" || e.target.value === ".") {
      onChange(0);
    }
  };

  // Handle focus to clear the input when it's zero
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (value === 0) {
      e.target.value = "";
    }
  };

  return (
    <div className="relative rounded-md shadow-sm">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-gray-500 sm:text-sm">{currencyCode}</span>
      </div>
      <input
        id={id}
        type="text"
        className={`block w-full pl-16 pr-3 py-3 text-lg border-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          disabled ? "bg-gray-100 opacity-50 cursor-not-allowed" : "bg-white"
        }`}
        placeholder="0.00"
        value={formattedValue}
        onChange={handleChange}
        onFocus={handleFocus}
        disabled={disabled}
        aria-label={`Amount in ${currencyCode}`}
      />
    </div>
  );
};

export default CurrencyInput;
