import { useState, useEffect } from "react";
import {
  ArrowLeftRight,
  Copy,
  Ruler,
  Scale,
  Thermometer,
  Droplet,
  Square,
  Gauge,
  Clock,
  HardDrive,
  ArrowUpDown,
  LayoutGrid,
} from "lucide-react";
import { useUnitsConverter } from "../hooks/useUnitsConverter";
import { CustomSelect, type SelectOption } from "./CustomSelect";
import { useToast } from "./Toast";
import { copyTextToClipboard, invokeApi as invoke } from "../api";

// Lucide icons for each category — consistent cross-platform rendering
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  length: <Ruler size={14} />,
  mass: <Scale size={14} />,
  temperature: <Thermometer size={14} />,
  volume: <Droplet size={14} />,
  area: <Square size={14} />,
  speed: <Gauge size={14} />,
  time: <Clock size={14} />,
  data: <HardDrive size={14} />,
};

/**
 * Build related conversion pairs dynamically from the loaded unit list.
 * Picks up to 3 pairs of units from the category, excluding the current from/to pair.
 */
function buildRelatedPairs(
  units: { name: string; display: string }[],
  fromUnit: string,
  toUnit: string
): string[][] {
  if (units.length < 2) return [];
  const pairs: string[][] = [];
  for (let i = 0; i < units.length && pairs.length < 6; i++) {
    for (let j = i + 1; j < units.length && pairs.length < 6; j++) {
      const a = units[i].name;
      const b = units[j].name;
      // Skip the current main conversion pair
      if ((a === fromUnit && b === toUnit) || (a === toUnit && b === fromUnit)) continue;
      pairs.push([a, b]);
    }
  }
  return pairs;
}

interface QuickConversion {
  from: string;
  to: string;
  result: string;
}

export function UnitsView() {
  const {
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
  } = useUnitsConverter();
  const { showToast } = useToast();
  const [swapping, setSwapping] = useState(false);
  const [quickConversions, setQuickConversions] = useState<QuickConversion[]>([]);

  const unitOptions: SelectOption[] = currentUnits.map((u) => ({
    value: u.name,
    label: `${u.display} — ${u.name}`,
  }));

  const fromDisplay =
    currentUnits.find((u) => u.name === fromUnit)?.display ?? fromUnit;
  const toDisplay =
    currentUnits.find((u) => u.name === toUnit)?.display ?? toUnit;

  const handleSwap = () => {
    setSwapping(true);
    swap();
    setTimeout(() => setSwapping(false), 300);
  };

  const handleCopyResult = () => {
    if (result && !error) {
      copyTextToClipboard(result)
        .then(() => {
          showToast(`Copied: ${result} ${toDisplay}`, "success");
        })
        .catch(() => {
          showToast("Failed to copy", "error");
        });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (result && !error) {
        showToast(
          `${inputValue} ${fromDisplay} = ${result} ${toDisplay}`,
          "success"
        );
      }
    }
  };

  // Calculate quick conversions when category or input changes
  useEffect(() => {
    if (!inputValue || currentUnits.length < 2) {
      setQuickConversions([]);
      return;
    }
    const num = parseFloat(inputValue);
    if (isNaN(num)) {
      setQuickConversions([]);
      return;
    }

    const pairs = buildRelatedPairs(currentUnits, fromUnit, toUnit);

    Promise.all(
      pairs.map(async ([from, to]: string[]) => {
        try {
          const res = await invoke<number>("convert_units", {
            value: num,
            from,
            to,
          });
          const formatted =
            Math.abs(res) < 0.000001 && res !== 0
              ? res.toExponential(4)
              : Math.abs(res) >= 1e12
                ? res.toExponential(4)
                : res.toLocaleString("en-US", {
                  maximumFractionDigits: 6,
                  minimumFractionDigits: 0,
                });
          return { from, to, result: formatted };
        } catch {
          return null;
        }
      })
    ).then((results) => {
      setQuickConversions(
        results.filter((r): r is QuickConversion => r !== null).slice(0, 6)
      );
    });
  }, [currentUnits, inputValue, fromUnit, toUnit]);

  const handleQuickConvertClick = (from: string, to: string) => {
    setFromUnit(from);
    setToUnit(to);
  };

  return (
    <div
      className="flex flex-1 flex-col p-5 gap-5 overflow-auto animate-tab-enter"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Title */}
      <div
        className="flex items-center gap-2.5"
        style={{ maxWidth: 720, margin: "0 auto", width: "100%", paddingTop: 12 }}
      >
        <div
          className="title-icon"
          style={{ width: 32, height: 32, fontSize: 14 }}
        >
          <Ruler size={16} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-primary">Unit Converter</h2>
          <p className="text-[11px] text-dim">
            {categories.length} categories · {currentUnits.length} {categories[activeCategory]?.name?.toLowerCase() || ''} units
          </p>
        </div>
      </div>

      {/* Category chips — horizontal scrollable strip */}
      <div className="category-strip">
        {categories.map((cat, i) => (
          <button
            key={cat.id}
            onClick={() => changeCategory(i)}
            className={`chip focus-ring ${activeCategory === i ? "chip--active" : ""
              }`}
          >
            <span className="flex items-center" style={{ width: 16, height: 16 }}>
              {CATEGORY_ICONS[cat.id] ?? <Ruler size={14} />}
            </span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Conversion card — horizontal on wide, stacked on narrow */}
      <div className="conversion-card conversion-card--horizontal">
        {/* FROM */}
        <div className={`conversion-from flex flex-col gap-2 ${swapping ? "animate-swap-from" : ""}`}>
          <label className="conversion-label">From</label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="input-field focus-ring text-lg font-semibold tabular-nums"
            placeholder="Enter value"
            style={{ width: "100%" }}
          />
          <CustomSelect
            options={unitOptions}
            value={fromUnit}
            onChange={setFromUnit}
          />
        </div>

        {/* Swap button */}
        <div className="conversion-swap">
          <button
            onClick={handleSwap}
            className={`swap-btn focus-ring ${swapping ? "animate-swap" : ""}`}
            title="Swap units"
          >
            <ArrowLeftRight size={18} />
          </button>
        </div>

        {/* TO */}
        <div className={`conversion-to flex flex-col gap-2 ${swapping ? "animate-swap-to" : ""}`}>
          <label className="conversion-label">To</label>
          <div
            className={`conversion-result ${result ? "conversion-result--has-value" : ""
              } ${error ? "conversion-result--error" : ""}`}
            onClick={handleCopyResult}
            title={result && !error ? "Click to copy result" : undefined}
            role="button"
            tabIndex={0}
            style={{ position: "relative" }}
          >
            {error ? (
              <span className="text-error" style={{ fontSize: 13 }}>
                {error}
              </span>
            ) : (
              result || "—"
            )}
            {result && !error && (
              <span className="conversion-copy-hint">
                <Copy size={14} />
              </span>
            )}
          </div>
          <CustomSelect
            options={unitOptions}
            value={toUnit}
            onChange={setToUnit}
          />
        </div>

        {/* Summary line — interactive: click to swap */}
        {result && !error && (
          <div className="conversion-summary-row">
            <button
              className="conversion-summary animate-fade-in"
              onClick={handleSwap}
              title="Click to swap units"
            >
              <ArrowUpDown size={12} />
              <span>
                {inputValue} {fromDisplay} = {result} {toDisplay}
              </span>
            </button>
          </div>
        )}
      </div>

      {quickConversions.length > 0 && (
        <>
          <div className="section-title">Quick Conversions</div>
          <div className="quick-convert-grid animate-fade-in">
            {quickConversions.map((qc) => {
              const fromName =
                currentUnits.find((u) => u.name === qc.from)?.display ?? qc.from;
              const toName =
                currentUnits.find((u) => u.name === qc.to)?.display ?? qc.to;
              return (
                <div
                  key={`${qc.from}-${qc.to}`}
                  className="quick-convert-item"
                  onClick={() => handleQuickConvertClick(qc.from, qc.to)}
                  title={`Switch to ${qc.from} → ${qc.to}`}
                  role="button"
                  tabIndex={0}
                >
                  <span className="quick-convert-item__label">
                    {inputValue} {fromName} →
                  </span>
                  <span className="quick-convert-item__value">
                    {qc.result} {toName}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Unit reference grid — all units in this category */}
      {currentUnits.length > 0 && (
        <>
          <div className="section-title flex items-center gap-1.5">
            <LayoutGrid size={12} />
            All {categories[activeCategory]?.name || ''} Units
          </div>
          <div className="unit-ref-grid animate-fade-in">
            {currentUnits.map((u) => (
              <div
                key={u.name}
                className={`unit-ref-item ${
                  u.name === fromUnit || u.name === toUnit
                    ? "unit-ref-item--active"
                    : ""
                }`}
                onClick={() => {
                  if (u.name !== fromUnit) {
                    setToUnit(u.name);
                  }
                }}
                title={`${u.display} (${u.name}) — click to set as target`}
                role="button"
                tabIndex={0}
              >
                <span style={{ fontWeight: 700, fontSize: 11, opacity: 0.5 }}>{u.display}</span>
                {u.name}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
