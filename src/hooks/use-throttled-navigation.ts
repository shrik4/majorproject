import { useCallback, useRef } from 'react';
import { NavigateFunction } from 'react-router-dom';

export function useThrottledNavigation(navigate: NavigateFunction, delay = 1000) {
  const throttleTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastNavigationTime = useRef<number>(0);

  const throttledNavigate = useCallback((to: string) => {
    const now = Date.now();
    
    // Clear any existing timeout
    if (throttleTimeout.current) {
      clearTimeout(throttleTimeout.current);
    }

    // If enough time has passed since last navigation, navigate immediately
    if (now - lastNavigationTime.current >= delay) {
      lastNavigationTime.current = now;
      navigate(to);
    } else {
      // Otherwise, set a timeout for the remaining delay
      throttleTimeout.current = setTimeout(() => {
        lastNavigationTime.current = Date.now();
        navigate(to);
      }, delay - (now - lastNavigationTime.current));
    }
  }, [navigate, delay]);

  return throttledNavigate;
}
