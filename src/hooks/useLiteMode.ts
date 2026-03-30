import { useState, useEffect } from 'react';

interface DeviceCapabilities {
  isLowEnd: boolean;
  cores: number;
  memory: number | null;
  isSlow: boolean;
}

function detectDeviceCapabilities(): DeviceCapabilities {
  const nav = navigator as any;
  const cores = nav.hardwareConcurrency || 2;
  const memory = nav.deviceMemory || null; // GB, only in Chrome

  // Detect slow connection
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  const isSlow = conn
    ? conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g' || conn.saveData === true
    : false;

  // Low-end: <=2 cores, <=2GB RAM, or slow connection
  const isLowEnd = cores <= 2 || (memory !== null && memory <= 2) || isSlow;

  return { isLowEnd, cores, memory, isSlow };
}

export function useLiteMode() {
  const [liteMode, setLiteMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('lite-mode');
    if (saved !== null) return saved === 'true';
    // Auto-detect on first visit
    return detectDeviceCapabilities().isLowEnd;
  });

  const [deviceInfo] = useState<DeviceCapabilities>(() => detectDeviceCapabilities());

  useEffect(() => {
    localStorage.setItem('lite-mode', String(liteMode));
  }, [liteMode]);

  const toggleLiteMode = () => setLiteMode(prev => !prev);

  return { liteMode, toggleLiteMode, deviceInfo };
}
