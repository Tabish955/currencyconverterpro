
import { AlertTriangle } from "lucide-react";

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay = ({ message }: ErrorDisplayProps) => {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-center p-4 bg-red-50 rounded-lg">
          <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-red-800">Error</h3>
            <p className="text-red-600">{message}</p>
          </div>
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
