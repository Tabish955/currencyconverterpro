import React from 'react';
import { Zap, ZapOff } from 'lucide-react';
import { usePerformanceDetection } from '@/hooks/usePerformanceDetection';

interface PerformanceToggleProps {
  onToggle?: (isLiteMode: boolean) => void;
}

export const PerformanceToggle: React.FC<PerformanceToggleProps> = ({ onToggle }) => {
  const [isLiteMode, setIsLiteMode] = React.useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('lite-mode-preference');
    return saved ? JSON.parse(saved) : false;
  });
  const performanceMetrics = usePerformanceDetection();

  React.useEffect(() => {
    // Auto-enable lite mode on low-end devices (only if no preference is saved)
    const saved = localStorage.getItem('lite-mode-preference');
    if (!saved && performanceMetrics.isLowEndDevice) {
      setIsLiteMode(true);
      onToggle?.(true);
      localStorage.setItem('lite-mode-preference', JSON.stringify(true));
    }
  }, [performanceMetrics.isLowEndDevice, onToggle]);

  const handleToggle = () => {
    const newMode = !isLiteMode;
    setIsLiteMode(newMode);
    onToggle?.(newMode);
    
    // Save preference to localStorage
    localStorage.setItem('lite-mode-preference', JSON.stringify(newMode));
  };

  return (
    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md border border-gray-200">
      <button
        onClick={handleToggle}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200 ${
          isLiteMode 
            ? 'bg-green-100 text-green-700 border border-green-300' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        title={isLiteMode ? 'Lite mode active - optimized performance' : 'Enable lite mode for better performance'}
      >
        {isLiteMode ? (
          <>
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">Lite Mode</span>
          </>
        ) : (
          <>
            <ZapOff className="h-4 w-4" />
            <span className="text-sm font-medium">Full Mode</span>
          </>
        )}
      </button>
      
      {performanceMetrics.isLowEndDevice && (
        <span className="text-xs text-gray-600">
          Auto-enabled for your device
        </span>
      )}
      
      {isLiteMode && (
        <div className="text-xs text-green-700 flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Optimized
        </div>
      )}
    </div>
  );
};
