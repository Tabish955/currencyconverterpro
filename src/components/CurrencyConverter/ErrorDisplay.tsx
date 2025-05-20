
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  inline?: boolean;
}

const ErrorDisplay = ({ message, onRetry, inline = false }: ErrorDisplayProps) => {
  // Inline banner version (non-blocking)
  if (inline) {
    return (
      <div className="w-full bg-red-50 border border-red-100 rounded-lg p-3 mb-4 animate-fade-in">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
          <p className="text-red-700 text-sm mr-4">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="ml-auto bg-white text-red-600 text-xs font-medium px-2 py-1 rounded border border-red-200 hover:bg-red-50 transition-colors flex items-center"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // Full error display (for fatal errors)
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden animate-fade-in">
      <div className="p-6">
        <div className="flex items-center justify-center p-6 bg-red-50 rounded-lg border border-red-100">
          <div className="relative mr-5">
            <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="absolute -inset-0.5 rounded-full bg-red-200 animate-pulse opacity-75"></div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-red-800 mb-1">Unable to Load Data</h3>
            <p className="text-red-600 mb-3">{message}</p>
            <p className="text-gray-500 text-sm">Please check your connection and try again.</p>
          </div>
        </div>
        <div className="mt-6 text-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-md hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-300 hover:scale-105 shadow-md flex items-center justify-center mx-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
