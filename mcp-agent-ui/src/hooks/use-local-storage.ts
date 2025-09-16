import { useState, useEffect, useCallback, useRef } from 'react';
import { UseLocalStorageOptions, UseLocalStorageReturn } from '@/types/chat';

// Based on React DevTools pattern with cross-tab synchronization and error recovery
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> {
  const {
    serializer = {
      read: (value: string) => JSON.parse(value),
      write: (value: T) => JSON.stringify(value),
    },
    onError,
    syncAcrossTabs = true,
  } = options;

  // Keep track of the key to detect changes
  const keyRef = useRef(key);
  keyRef.current = key;

  // Initialize state with localStorage value or fallback to initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') return initialValue;
      
      const item = window.localStorage.getItem(key);
      if (item === null) return initialValue;
      
      return serializer.read(item);
    } catch (error) {
      console.error(`useLocalStorage read error for key "${key}":`, error);
      onError?.(error as Error);
      return initialValue;
    }
  });

  // Update localStorage and state
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        setStoredValue(valueToStore);
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(keyRef.current, serializer.write(valueToStore));
          
          // Dispatch custom event for cross-tab synchronization
          if (syncAcrossTabs) {
            window.dispatchEvent(new CustomEvent(`localStorage-${keyRef.current}`, {
              detail: valueToStore,
            }));
          }
        }
      } catch (error) {
        console.error(`useLocalStorage write error for key "${keyRef.current}":`, error);
        onError?.(error as Error);
      }
    },
    [storedValue, serializer, onError, syncAcrossTabs]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(keyRef.current);
        
        // Dispatch custom event for cross-tab synchronization
        if (syncAcrossTabs) {
          window.dispatchEvent(new CustomEvent(`localStorage-${keyRef.current}`, {
            detail: initialValue,
          }));
        }
      }
    } catch (error) {
      console.error(`useLocalStorage remove error for key "${keyRef.current}":`, error);
      onError?.(error as Error);
    }
  }, [initialValue, onError, syncAcrossTabs]);

  // Listen for changes in localStorage from other tabs/windows
  useEffect(() => {
    if (!syncAcrossTabs || typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== keyRef.current) return;
      
      try {
        if (e.newValue === null) {
          setStoredValue(initialValue);
        } else {
          setStoredValue(serializer.read(e.newValue));
        }
      } catch (error) {
        console.error(`useLocalStorage sync error for key "${keyRef.current}":`, error);
        onError?.(error as Error);
      }
    };

    const handleCustomStorageChange = (e: CustomEvent) => {
      try {
        setStoredValue(e.detail);
      } catch (error) {
        console.error(`useLocalStorage custom sync error for key "${keyRef.current}":`, error);
        onError?.(error as Error);
      }
    };

    // Listen for both native storage events and custom events
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(`localStorage-${keyRef.current}`, handleCustomStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(`localStorage-${keyRef.current}`, handleCustomStorageChange as EventListener);
    };
  }, [initialValue, serializer, onError, syncAcrossTabs]);

  return [storedValue, setValue, removeValue];
}
