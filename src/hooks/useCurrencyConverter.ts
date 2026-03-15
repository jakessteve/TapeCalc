import { useState, useEffect, useCallback } from "react";
import { invokeApi as invoke } from "../api";
import { useDebounce } from "./useDebounce";

interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

interface CurrencyConvertResult {
  result: number;
  rate: number;
  last_updated: string;
}

export function useCurrencyConverter(refreshIntervalMinutes: number = 60) {
  const [currencies, setCurrencies] = useState<CurrencyInfo[]>([]);
  const [fromCode, setFromCode] = useState("USD");
  const [toCode, setToCode] = useState("VND");
  const [inputValue, setInputValue] = useState("1");
  const [result, setResult] = useState<string>("");
  const [rate, setRate] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // P2-8: Debounce the input value to avoid IPC on every keystroke
  const debouncedInput = useDebounce(inputValue, 200);

  // Fetch currencies on mount
  useEffect(() => {
    invoke<CurrencyInfo[]>("get_currencies").then(setCurrencies);
  }, []);

  // Auto-convert when debounced inputs change
  useEffect(() => {
    if (!fromCode || !toCode || !debouncedInput) {
      setResult("");
      return;
    }
    const num = parseFloat(debouncedInput);
    if (isNaN(num)) {
      setResult("");
      setError("Invalid number");
      return;
    }
    setError("");
    invoke<CurrencyConvertResult>("convert_currency", {
      value: num,
      from: fromCode,
      to: toCode,
    })
      .then((res) => {
        setResult(
          res.result.toLocaleString("en-US", {
            maximumFractionDigits: 4,
            minimumFractionDigits: 2,
          })
        );
        setRate(
          res.rate.toLocaleString("en-US", {
            maximumFractionDigits: 4,
            minimumFractionDigits: 2,
          })
        );
        setLastUpdated(res.last_updated);
      })
      .catch((e) => {
        setError(String(e));
        setResult("");
      });
  }, [debouncedInput, fromCode, toCode]);

  const swap = useCallback(() => {
    setFromCode(toCode);
    setToCode(fromCode);
  }, [fromCode, toCode]);

  const refreshRates = useCallback(async () => {
    setRefreshing(true);
    setError("");
    try {
      const updated = await invoke<string>("refresh_rates");
      setLastUpdated(updated);
      // Re-fetch currency list (live API has 160+ currencies)
      const freshCurrencies = await invoke<CurrencyInfo[]>("get_currencies");
      setCurrencies(freshCurrencies);
      // Re-trigger conversion
      if (inputValue && fromCode && toCode) {
        const num = parseFloat(inputValue);
        if (!isNaN(num)) {
          const res = await invoke<CurrencyConvertResult>("convert_currency", {
            value: num,
            from: fromCode,
            to: toCode,
          });
          setResult(
            res.result.toLocaleString("en-US", {
              maximumFractionDigits: 4,
              minimumFractionDigits: 2,
            })
          );
          setRate(
            res.rate.toLocaleString("en-US", {
              maximumFractionDigits: 4,
              minimumFractionDigits: 2,
            })
          );
        }
      }
    } catch (e) {
      setError(`Refresh failed: ${e}`);
    } finally {
      setRefreshing(false);
    }
  }, [inputValue, fromCode, toCode]);

  // Auto-refresh on mount (tab switch) + on interval
  useEffect(() => {
    // Refresh immediately when component mounts (i.e., tab becomes active)
    refreshRates();

    // Set up recurring refresh
    const intervalMs = refreshIntervalMinutes * 60 * 1000;
    const id = setInterval(() => {
      refreshRates();
    }, intervalMs);

    return () => clearInterval(id);
    // Only re-create interval when the interval setting changes
    // refreshRates is intentionally excluded to avoid re-triggering on every input change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshIntervalMinutes]);

  return {
    currencies,
    fromCode,
    toCode,
    setFromCode,
    setToCode,
    inputValue,
    setInputValue,
    result,
    rate,
    lastUpdated,
    error,
    swap,
    refreshRates,
    refreshing,
  };
}
