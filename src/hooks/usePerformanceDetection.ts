// Performance detection hook for optimizing behavior on low-end devices
import { useState, useEffect } from 'react';

interface PerformanceMetrics {
  isLowEndDevice: boolean;
  cpuCores: number;
  memoryGb: number;
  enableLightMode: boolean;
}

export const usePerformanceDetection = (): PerformanceMetrics => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    isLowEndDevice: false,
    cpuCores: 4,
    memoryGb: 4,
    enableLightMode: false
  });

  useEffect(() => {
    const detectPerformance = () => {
      let cpuCores = 4;
      let memoryGb = 4;
      let isLowEndDevice = false;

      // Detect CPU cores
      if ('hardwareConcurrency' in navigator) {
        cpuCores = navigator.hardwareConcurrency || 4;
      }

      // Detect memory (Chrome/Edge only)
      if ('deviceMemory' in navigator) {
        memoryGb = (navigator as any).deviceMemory || 4;
      }

      // Performance benchmarking
      const startTime = performance.now();
      
      // Simple CPU benchmark: array operations
      const testArray = new Array(10000).fill(0).map((_, i) => i);
      const result = testArray
        .map(x => x * 2)
        .filter(x => x % 3 === 0)
        .reduce((a, b) => a + b, 0);
      
      const endTime = performance.now();
      const benchmarkTime = endTime - startTime;

      // Determine if device is low-end based on multiple factors
      const lowMemory = memoryGb <= 2;
      const lowCpuCores = cpuCores <= 2;
      const slowBenchmark = benchmarkTime > 10; // milliseconds
      
      isLowEndDevice = lowMemory || (lowCpuCores && slowBenchmark);

      // Enable light mode for low-end devices or when memory is constrained
      const enableLightMode = isLowEndDevice || memoryGb <= 3;

      setMetrics({
        isLowEndDevice,
        cpuCores,
        memoryGb,
        enableLightMode
      });

      // Log performance metrics for debugging
      console.info('Performance Detection:', {
        cpuCores,
        memoryGb,
        benchmarkTime: `${benchmarkTime.toFixed(2)}ms`,
        isLowEndDevice,
        enableLightMode,
        userAgent: navigator.userAgent.substr(0, 50) + '...'
      });
    };

    // Run detection after a short delay to not block initial render
    const timeoutId = setTimeout(detectPerformance, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  return metrics;
};