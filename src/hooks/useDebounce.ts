import { useState, useEffect } from "react";

/**
 * Debounce a value by the given delay (ms).
 * Returns the debounced value which only updates after the delay has passed
 * since the last change to the input value.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
