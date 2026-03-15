import { useState, useEffect, useCallback } from "react";
import { invokeApi as invoke } from "../api";
import { useDebounce } from "./useDebounce";

interface UnitInfo {
  name: string;
  display: string;
}

interface UnitCategoryInfo {
  id: string;
  name: string;
  units: UnitInfo[];
}

export function useUnitsConverter() {
  const [categories, setCategories] = useState<UnitCategoryInfo[]>([]);
  const [activeCategory, setActiveCategory] = useState(0);
  const [fromUnit, setFromUnit] = useState("");
  const [toUnit, setToUnit] = useState("");
  const [inputValue, setInputValue] = useState("1");
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState("");

  // P2-9: Debounce the input value to avoid IPC on every keystroke
  const debouncedInput = useDebounce(inputValue, 200);

  // Fetch categories on mount
  useEffect(() => {
    invoke<UnitCategoryInfo[]>("get_unit_categories").then((cats) => {
      setCategories(cats);
      if (cats.length > 0 && cats[0].units.length >= 2) {
        setFromUnit(cats[0].units[0].name);
        setToUnit(cats[0].units[1].name);
      }
    });
  }, []);

  // Change category → reset units
  const changeCategory = useCallback(
    (index: number) => {
      setActiveCategory(index);
      const cat = categories[index];
      if (cat && cat.units.length >= 2) {
        setFromUnit(cat.units[0].name);
        setToUnit(cat.units[1].name);
      }
      setResult("");
      setError("");
    },
    [categories]
  );

  // Auto-convert when debounced inputs change
  useEffect(() => {
    if (!fromUnit || !toUnit || !debouncedInput) {
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
    invoke<number>("convert_units", { value: num, from: fromUnit, to: toUnit })
      .then((res) => {
        // Smart formatting
        if (Math.abs(res) < 0.000001 && res !== 0) {
          setResult(res.toExponential(6));
        } else if (Math.abs(res) >= 1e12) {
          setResult(res.toExponential(6));
        } else {
          setResult(
            res.toLocaleString("en-US", {
              maximumFractionDigits: 8,
              minimumFractionDigits: 0,
            })
          );
        }
      })
      .catch((e) => {
        setError(String(e));
        setResult("");
      });
  }, [debouncedInput, fromUnit, toUnit]);

  const swap = useCallback(() => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  }, [fromUnit, toUnit]);

  const currentUnits = categories[activeCategory]?.units ?? [];

  return {
    categories,
    activeCategory,
    changeCategory,
    currentUnits,
    fromUnit,
    toUnit,
    setFromUnit,
    setToUnit,
    inputValue,
    setInputValue,
    result,
    error,
    swap,
  };
}
