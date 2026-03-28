import { useState, useMemo, useCallback, useEffect } from "react";
import { ArrowLeftRight, RefreshCw, Copy, Star, ArrowUpDown, DollarSign, AlertTriangle, TrendingUp, Wifi, WifiOff } from "lucide-react";
import { useCurrencyConverter } from "../hooks/useCurrencyConverter";
import { useSettings } from "../hooks/useSettings";
import { CustomSelect, type SelectOption } from "./CustomSelect";
import { useToast } from "./Toast";
import { getFlagDisplay } from "../utils/countryCodeToFlag";
import { copyTextToClipboard, invokeApi as invoke } from "../api";

const FAVORITES_KEY = "hc-tapcalc-fav-currencies";

function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : ["USD", "VND", "EUR", "JPY"];
  } catch {
    return ["USD", "VND", "EUR", "JPY"];
  }
}

function saveFavorites(favs: string[]) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  } catch { /* ignore */ }
}

/** Popular cross-rate pairs to show below the main converter */
const POPULAR_PAIRS: [string, string][] = [
  ["USD", "EUR"],
  ["USD", "JPY"],
  ["EUR", "GBP"],
  ["USD", "VND"],
  ["EUR", "JPY"],
  ["GBP", "USD"],
];

interface PopularRate {
  from: string;
  to: string;
  rate: string;
}

export function CurrencyView() {
  const { settings } = useSettings();
  const {
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
  } = useCurrencyConverter(settings.currencyRefreshInterval);
  const { showToast } = useToast();
  const [swapping, setSwapping] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);
  const [popularRates, setPopularRates] = useState<PopularRate[]>([]);

  const toggleFavorite = useCallback((code: string) => {
    setFavorites((prev) => {
      const next = prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code];
      saveFavorites(next);
      return next;
    });
  }, []);

  // Sort: favorites first, then alphabetical
  const sortedCurrencies = useMemo(() => {
    const favSet = new Set(favorites);
    return [...currencies].sort((a, b) => {
      const aFav = favSet.has(a.code) ? 0 : 1;
      const bFav = favSet.has(b.code) ? 0 : 1;
      if (aFav !== bFav) return aFav - bFav;
      return a.code.localeCompare(b.code);
    });
  }, [currencies, favorites]);

  const currencyOptions: SelectOption[] = useMemo(
    () =>
      sortedCurrencies.map((c) => {
        const flag = getFlagDisplay(c.flag || c.code.slice(0, 2).toLowerCase(), c.code);
        return {
          value: c.code,
          label: c.code,
          prefix: flag || c.symbol,
        };
      }),
    [sortedCurrencies]
  );

  const fromCurrency = useMemo(
    () => currencies.find((c) => c.code === fromCode),
    [currencies, fromCode]
  );
  const toCurrency = useMemo(
    () => currencies.find((c) => c.code === toCode),
    [currencies, toCode]
  );

  // Compute popular cross-rates
  useEffect(() => {
    if (currencies.length === 0) return;
    const currCodes = new Set(currencies.map((c) => c.code));
    const validPairs = POPULAR_PAIRS.filter(
      ([f, t]) => currCodes.has(f) && currCodes.has(t)
    );

    Promise.all(
      validPairs.map(async ([from, to]) => {
        try {
          const res = await invoke<{ result: number; rate: number; last_updated: string }>(
            "convert_currency",
            { value: 1, from, to }
          );
          return {
            from,
            to,
            rate: res.rate.toLocaleString("en-US", {
              maximumFractionDigits: 4,
              minimumFractionDigits: 2,
            }),
          };
        } catch {
          return null;
        }
      })
    ).then((results) => {
      setPopularRates(
        results.filter((r): r is PopularRate => r !== null).slice(0, 6)
      );
    });
  }, [currencies, lastUpdated]);

  const handleSwap = () => {
    setSwapping(true);
    swap();
    setTimeout(() => setSwapping(false), 300);
  };

  const handleRefresh = async () => {
    refreshRates();
  };

  const handleCopyResult = () => {
    if (result && !error) {
      copyTextToClipboard(result).then(() => {
        showToast(`Copied: ${result} ${toCode}`, "success");
      }).catch(() => {
        showToast("Failed to copy", "error");
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && result && !error) {
      e.preventDefault();
      handleCopyResult();
    }
  };

  const handlePopularRateClick = (from: string, to: string) => {
    setFromCode(from);
    setToCode(to);
  };

  const isOffline = !lastUpdated ||
    lastUpdated.toLowerCase().includes("offline") ||
    lastUpdated.toLowerCase().includes("mock");
  const fromFlag = fromCurrency
    ? getFlagDisplay(fromCurrency.flag || fromCurrency.code.slice(0, 2).toLowerCase(), fromCurrency.code)
    : "";
  const toFlag = toCurrency
    ? getFlagDisplay(toCurrency.flag || toCurrency.code.slice(0, 2).toLowerCase(), toCurrency.code)
    : "";

  return (
    <div
      className="flex flex-1 flex-col p-5 gap-4 overflow-auto animate-tab-enter"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Title + Status + Refresh */}
      <div className="flex items-center justify-between" style={{ maxWidth: 720, margin: "0 auto", width: "100%", paddingTop: 12 }}>
        <div className="flex items-center gap-2.5">
          <div
            className="title-icon title-icon--green"
            style={{ width: 32, height: 32, fontSize: 14 }}
          >
            <DollarSign size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-primary">Currency Exchange</h2>
            <span className="text-[11px] text-dim">
              {currencies.length} currencies
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOffline ? (
            <button
              className="offline-pill"
              onClick={handleRefresh}
              title="Click to fetch live rates"
            >
              <WifiOff size={10} /> Offline
            </button>
          ) : (
            <span className="online-pill">
              <Wifi size={10} /> Online
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="action-btn action-btn--accent focus-ring"
            style={{ opacity: refreshing ? 0.6 : 1 }}
            title="Fetch live exchange rates"
          >
            <RefreshCw
              size={14}
              className={refreshing ? "animate-spin" : ""}
              style={{ animationDuration: "1s" }}
            />
            {refreshing ? "Updating..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="error-banner animate-fade-in" style={{ maxWidth: 720, margin: "0 auto", width: "100%", marginBottom: "0.5rem" }}>
          {error}
        </div>
      )}

      {/* Favorite currency quick-swap chips */}
      {favorites.length > 0 && (
        <div className="category-strip">
          {favorites
            .filter((code) => currencies.some((c) => c.code === code))
            .map((code) => {
              const c = currencies.find((cur) => cur.code === code);
              const flag = c ? getFlagDisplay(c.flag || c.code.slice(0, 2).toLowerCase(), c.code) : "";
              const isActive = code === fromCode || code === toCode;
              return (
                <button
                  key={code}
                  className={`chip focus-ring ${isActive ? "chip--active" : ""}`}
                  onClick={() => {
                    if (code !== fromCode) {
                      setToCode(code);
                    }
                  }}
                  title={`Quick switch to ${code}`}
                >
                  {flag && <span style={{ fontSize: 13 }}>{flag}</span>}
                  {code}
                </button>
              );
            })}
        </div>
      )}

      {/* Conversion card — horizontal on wide, stacked on narrow */}
      <div className="conversion-card conversion-card--horizontal">
        {/* FROM */}
        <div className={`conversion-from flex flex-col gap-2 ${swapping ? "animate-swap-from" : ""}`}>
          <div className="flex items-center justify-between">
            <label className="conversion-label">From</label>
            {fromCurrency && (
              <button
                className={`favorite-star ${favorites.includes(fromCode) ? "favorite-star--active" : ""}`}
                onClick={() => toggleFavorite(fromCode)}
                title={favorites.includes(fromCode) ? "Remove from favorites" : "Add to favorites"}
              >
                <Star size={14} fill={favorites.includes(fromCode) ? "currentColor" : "none"} />
              </button>
            )}
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="input-field focus-ring text-lg font-semibold tabular-nums"
            placeholder="Enter amount"
            style={{ width: "100%" }}
          />
          <CustomSelect
            options={currencyOptions}
            value={fromCode}
            onChange={setFromCode}
            className="w-full"
          />
          {fromCurrency && (
            <div className="text-xs font-medium text-dim">
              {fromFlag} {fromCurrency.symbol} {fromCurrency.name}
            </div>
          )}
        </div>

        {/* Swap button — centered with divider lines on mobile */}
        <div className="conversion-swap">
          <div className="conversion-swap__line" />
          <button
            onClick={handleSwap}
            className={`swap-btn focus-ring ${swapping ? "animate-swap" : ""}`}
            title="Swap currencies (click rate summary below)"
          >
            <ArrowLeftRight size={18} />
          </button>
          <div className="conversion-swap__line" />
        </div>

        {/* TO */}
        <div className={`conversion-to flex flex-col gap-2 ${swapping ? "animate-swap-to" : ""}`}>
          <div className="flex items-center justify-between">
            <label className="conversion-label">To</label>
            {toCurrency && (
              <button
                className={`favorite-star ${favorites.includes(toCode) ? "favorite-star--active" : ""}`}
                onClick={() => toggleFavorite(toCode)}
                title={favorites.includes(toCode) ? "Remove from favorites" : "Add to favorites"}
              >
                <Star size={14} fill={favorites.includes(toCode) ? "currentColor" : "none"} />
              </button>
            )}
          </div>
          <div
            className={`conversion-result ${result ? "conversion-result--has-value" : ""}`}
            onClick={handleCopyResult}
            title={result ? "Click to copy result" : undefined}
            role="button"
            tabIndex={0}
            style={{ position: "relative" }}
          >
            {result || "—"}
            {result && (
              <span className="conversion-copy-hint">
                <Copy size={14} />
              </span>
            )}
          </div>
          <CustomSelect
            options={currencyOptions}
            value={toCode}
            onChange={setToCode}
            className="w-full"
          />
          {toCurrency && (
            <div className="text-xs font-medium text-dim">
              {toFlag} {toCurrency.symbol} {toCurrency.name}
            </div>
          )}
        </div>

        {/* Rate summary — interactive: click to swap */}
        {rate && !error && (
          <div className="conversion-summary-row">
            <button
              className="conversion-summary animate-fade-in"
              onClick={handleSwap}
              title="Click to swap currencies"
            >
              <ArrowUpDown size={12} />
              <span>
                1 {fromCode} = {rate} {toCode}
              </span>
              {lastUpdated && !isOffline && (
                <span className="text-[10px] text-dim">· {lastUpdated}</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Popular Rates grid */}
      {popularRates.length > 0 && (() => {
        // #1: Detect mock/fallback data — all rates identical means offline fallback
        const allSameRate = popularRates.length > 1 &&
          popularRates.every((pr) => pr.rate === popularRates[0].rate);
        return (
          <>
            <div className="section-title flex items-center gap-1.5">
              <TrendingUp size={12} />
              Popular Rates
              {allSameRate && (
                <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-warning)" }}>
                  · Offline
                </span>
              )}
            </div>
            {allSameRate ? (
              <div className="surface-card text-center py-6">
                <AlertTriangle size={20} className="mx-auto mb-2" style={{ color: "var(--color-warning)", opacity: 0.6 }} />
                <div className="text-xs font-semibold text-dim">Live rates unavailable</div>
                <div className="text-[10px] text-dim opacity-60 mt-1">Connect to the internet for real-time exchange rates</div>
              </div>
            ) : (
              <div className="popular-rates-grid animate-fade-in">
                {popularRates.map((pr) => {
                  const fromC = currencies.find((c) => c.code === pr.from);
                  const toC = currencies.find((c) => c.code === pr.to);
                  const fromFl = fromC
                    ? getFlagDisplay(fromC.flag || fromC.code.slice(0, 2).toLowerCase(), fromC.code)
                    : "";
                  const toFl = toC
                    ? getFlagDisplay(toC.flag || toC.code.slice(0, 2).toLowerCase(), toC.code)
                    : "";
                  return (
                    <div
                      key={`${pr.from}-${pr.to}`}
                      className="popular-rate-card"
                      onClick={() => handlePopularRateClick(pr.from, pr.to)}
                      role="button"
                      tabIndex={0}
                      title={`Switch to ${pr.from} → ${pr.to}`}
                    >
                      <div className="popular-rate-card__pair">
                        <span>{fromFl}</span>
                        {pr.from} → {toFl} {pr.to}
                      </div>
                      <div className="popular-rate-card__rate">{pr.rate}</div>
                      <div className="popular-rate-card__label">1 {pr.from} = {pr.rate} {pr.to}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}
