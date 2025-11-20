import { useState, useCallback, useEffect } from 'react';
import { getResponse, getIdleResponse, getWarningResponse, type PetResponse, type ResponseContext } from '@/lib/realtime/responseSystem';

export interface UseRealtimeResponseOptions {
  autoIdleInterval?: number; // milliseconds between idle responses
  enableWarnings?: boolean;
}

export function useRealtimeResponse(context: ResponseContext, options: UseRealtimeResponseOptions = {}) {
  const { autoIdleInterval = 8000, enableWarnings = true } = options;

  const [currentResponse, setCurrentResponse] = useState<PetResponse | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [responseHistory, setResponseHistory] = useState<PetResponse[]>([]);

  // Trigger a response for a specific action
  const triggerResponse = useCallback(
    (action: string) => {
      const response = getResponse(action, context);
      setCurrentResponse(response);
      setIsVisible(true);
      setResponseHistory(prev => [response, ...prev.slice(0, 9)]);

      // Auto-hide after duration
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, response.duration);

      return () => clearTimeout(timer);
    },
    [context],
  );

  // Trigger idle response
  const triggerIdleResponse = useCallback(() => {
    const response = getIdleResponse(context);
    setCurrentResponse(response);
    setIsVisible(true);
    setResponseHistory(prev => [response, ...prev.slice(0, 9)]);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, response.duration);

    return () => clearTimeout(timer);
  }, [context]);

  // Check for warnings
  useEffect(() => {
    if (!enableWarnings) return;

    const warning = getWarningResponse(context);
    if (warning && (!currentResponse || currentResponse.type !== 'warning')) {
      setCurrentResponse(warning);
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
      }, warning.duration);

      return () => clearTimeout(timer);
    }
  }, [context, enableWarnings, currentResponse]);

  // Auto-trigger idle responses
  useEffect(() => {
    const interval = setInterval(() => {
      // Only show idle response if no current response is visible
      if (!isVisible) {
        triggerIdleResponse();
      }
    }, autoIdleInterval);

    return () => clearInterval(interval);
  }, [autoIdleInterval, isVisible, triggerIdleResponse]);

  return {
    currentResponse,
    isVisible,
    triggerResponse,
    triggerIdleResponse,
    responseHistory,
  };
}
