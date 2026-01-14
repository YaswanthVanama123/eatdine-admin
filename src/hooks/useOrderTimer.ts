import { useState, useEffect, useRef } from 'react';

interface UseOrderTimerOptions {
  createdAt: string;
  autoUpdate?: boolean;
  updateInterval?: number;
}

export const useOrderTimer = ({
  createdAt,
  autoUpdate = true,
  updateInterval = 1000,
}: UseOrderTimerOptions) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const calculateElapsed = () => {
    const now = Date.now();
    const created = new Date(createdAt).getTime();
    const diffMs = now - created;
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);

    setElapsedSeconds(seconds);
    setElapsedMinutes(minutes);

    return { seconds, minutes };
  };

  useEffect(() => {
    // Calculate initial values
    calculateElapsed();

    // Set up interval if auto-update is enabled
    if (autoUpdate) {
      intervalRef.current = setInterval(() => {
        calculateElapsed();
      }, updateInterval);
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [createdAt, autoUpdate, updateInterval]);

  const formatTime = () => {
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isUrgent = elapsedMinutes >= 15;
  const isCritical = elapsedMinutes >= 30;

  return {
    elapsedSeconds,
    elapsedMinutes,
    formatTime,
    isUrgent,
    isCritical,
  };
};
