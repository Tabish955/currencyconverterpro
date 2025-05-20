
import React from "react";

interface LoadingStateProps {
  message: string;
  attempt?: number;
}

const LoadingState = ({ message, attempt }: LoadingStateProps) => {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden backdrop-blur-sm animate-fade-in">
      <div className="p-8">
        <div className="flex flex-col items-center justify-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-t-4 border-blue-400 border-dotted rounded-full animate-spin-slow"></div>
            </div>
          </div>
          <p className="text-gray-600 text-xl font-medium">{message}</p>
          <p className="text-gray-400 text-sm mt-2">
            {attempt ? `Attempt ${attempt} of 3...` : 'Fetching exchange rates...'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
