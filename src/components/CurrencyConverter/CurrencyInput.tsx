
import React from "react";

interface CurrencyInputProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
  currencyCode: string;
  disabled?: boolean;
  label?: string;
}

const CurrencyInput = ({
  id,
  value,
  onChange,
  currencyCode,
  disabled = false,
  label,
}: CurrencyInputProps) => {
  // Track if the user is currently editing to prevent auto-formatting
  const [isEditing, setIsEditing] = React.useState(false);
  // Track the raw input value during editing
  const [rawInputValue, setRawInputValue] = React.useState("");

  // Format the value for display only when not editing
  const displayValue = isEditing 
    ? rawInputValue 
    : (value === 0 && document.activeElement?.id === id)
      ? ""
      : value.toLocaleString(undefined, {
          maximumFractionDigits: 6,
          minimumFractionDigits: value % 1 === 0 ? 0 : 2, // Only show decimals if needed
        });

  // Handler for input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Store the raw input value
    setRawInputValue(inputValue);
    
    // Remove non-numeric characters except decimal point
    const sanitizedValue = inputValue.replace(/[^0-9.]/g, "");
    
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
    } else if (inputValue === "" || inputValue === ".") {
      onChange(0);
    }
  };

  // Handle focus to clear the input when it's zero and track editing state
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsEditing(true);
    setRawInputValue(value === 0 ? "" : value.toString());
    
    if (value === 0) {
      e.target.value = "";
    }
  };

  // Handle blur to format the value when not focused
  const handleBlur = () => {
    setIsEditing(false);
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-600 mb-1">
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 sm:text-sm">{currencyCode}</span>
        </div>
        <input
          id={id}
          inputMode="decimal" 
          type="text"
          pattern="[0-9]*(\.[0-9]+)?"
          className={`block w-full pl-16 pr-3 py-3 text-lg border-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
            disabled ? "bg-gray-100 opacity-50 cursor-not-allowed" : "bg-white"
          } shadow-inner`}
          placeholder="0.00"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          aria-label={`Amount in ${currencyCode}`}
        />
      </div>
    </div>
  );
};

export default CurrencyInput;
