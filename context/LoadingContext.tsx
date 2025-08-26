'use client';

import { createContext, useState, useContext, ReactNode, useRef, useCallback } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  showLoader: () => void;
  hideLoader: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const loadingStartTime = useRef<number | null>(null);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  const showLoader = useCallback(() => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
    if (!isLoading) {
      loadingStartTime.current = Date.now();
      setIsLoading(true);
    }
  }, [isLoading]);

  const hideLoader = useCallback(() => {
    if (loadingStartTime.current) {
      const elapsedTime = Date.now() - loadingStartTime.current;
      const remainingTime = 500 - elapsedTime;
      
      if (remainingTime > 0) {
        hideTimeout.current = setTimeout(() => {
          setIsLoading(false);
          loadingStartTime.current = null;
        }, remainingTime);
      } else {
        setIsLoading(false);
        loadingStartTime.current = null;
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const value = { isLoading, showLoader, hideLoader };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}