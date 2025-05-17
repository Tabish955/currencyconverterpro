
import React from "react";

interface LoadingStateProps {
  message: string;
}

const LoadingState = ({ message }: LoadingStateProps) => {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col items-center justify-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-3"></div>
          <p className="text-gray-600 text-lg">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
