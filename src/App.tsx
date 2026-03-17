import { useEffect, useState, useCallback, useRef, lazy, Suspense } from "react";
import { useCalculator } from "./hooks/useCalculator";
import { useSettings } from "./hooks/useSettings";
import type { RefreshInterval } from "./hooks/useSettings";
import { Header } from "./components/Header";
import { TapePanel } from "./components/TapePanel";
import { CalculatorPanel } from "./components/CalculatorPanel";
import { ToastProvider, useToast } from "./components/Toast";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Onboarding, shouldShowOnboarding } from "./components/Onboarding";

// P3-13: Lazy-load non-critical tabs
const SolverView = lazy(() => import("./components/SolverView").then(m => ({ default: m.SolverView })));
const GraphView = lazy(() => import("./components/GraphView").then(m => ({ default: m.GraphView })));
const SettingsView = lazy(() => import("./components/SettingsView").then(m => ({ default: m.SettingsView })));
const UnitsView = lazy(() => import("./components/UnitsView").then(m => ({ default: m.UnitsView })));
const CurrencyView = lazy(() => import("./components/CurrencyView").then(m => ({ default: m.CurrencyView })));

// P2-11: Key-to-action lookup map for O(1) keyboard dispatch
const KEY_MAP: Record<string, string> = {
  "0": "0", "1": "1", "2": "2", "3": "3", "4": "4",
  "5": "5", "6": "6", "7": "7", "8": "8", "9": "9",
  "+": "+", "-": "−", "*": "×",
  "Enter": "=", "=": "=",
  "Backspace": "⌫", "Escape": "C",
  "%": "%", "^": "^", "(": "(", ")": ")", ".": ".",
};

function LazyFallback() {
  return (
    <div className="flex flex-1 items-center justify-center" style={{ background: "var(--bg-base)" }} role="status">
      <div className="flex flex-col items-center gap-3" aria-label="Loading content">
        <div
          className="animate-pulse-slow"
          style={{
            width: 200,
            height: 16,
            borderRadius: 8,
            background: "var(--bg-btn)",
          }}
        />
        <div
          className="animate-pulse-slow"
          style={{
            width: 140,
            height: 12,
            borderRadius: 6,
            background: "var(--bg-btn)",
            opacity: 0.6,
          }}
        />
      </div>
    </div>
  );
}

function AppContent() {
  const calc = useCalculator();
  const { settings, setSetting } = useSettings();
  const [activeTab, setActiveTab] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(shouldShowOnboarding);
  const { showToast } = useToast();

  // P0-2: Labs features gating — persisted in localStorage
  const [showLabs, setShowLabs] = useState(() => {
    try { return localStorage.getItem("hc-tapcalc-labs") === "true"; }
    catch { return false; }
  });

  const toggleLabs = useCallback((enabled: boolean) => {
    setShowLabs(enabled);
    try { localStorage.setItem("hc-tapcalc-labs", String(enabled)); }
    catch { /* ignore */ }
    // If user disables labs while on a labs tab, switch back to calculator
    if (!enabled && (activeTab === 3 || activeTab === 4)) {
      setActiveTab(0);
    }
  }, [activeTab]);

  // P2-11: Use ref for activeTab so keyboard effect doesn't re-attach on tab switch
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  const handleClearTape = useCallback(() => {
    setConfirmClear(true);
  }, []);

  const confirmClearTape = useCallback(() => {
    calc.handleClearTape();
    setConfirmClear(false);
    showToast("Tape cleared", "info");
  }, [calc, showToast]);

  // P2-11: Optimized keyboard handler — stable effect, O(1) lookup
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Tab navigation: Ctrl+1 through Ctrl+6
      if (e.ctrlKey && e.key >= "1" && e.key <= "6") {
        e.preventDefault();
        setActiveTab(parseInt(e.key) - 1);
        return;
      }

      // Ctrl+Z / Ctrl+Y work on all tabs
      if (e.ctrlKey && e.key === "z") { e.preventDefault(); calc.handleUndo(); showToast("Undo", "info"); return; }
      if (e.ctrlKey && e.key === "y") { e.preventDefault(); calc.handleRedo(); showToast("Redo", "info"); return; }

      // Only handle calculator keys when on Calculator tab
      if (activeTabRef.current !== 0) return;

      // Handle / separately to prevent browser search
      if (e.key === "/") { e.preventDefault(); calc.press("÷"); return; }

      const mapped = KEY_MAP[e.key];
      if (mapped) {
        calc.press(mapped);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [calc, showToast]);

  if (!calc.state) {
    return (
      <div className="flex h-full items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="title-icon animate-pulse-slow"
            style={{ width: 48, height: 48, fontSize: 18, fontWeight: 800 }}
          >
            T
          </div>
          <div className="text-sm font-medium text-dim">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* First-time user walkthrough */}
      {showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      )}
      {/* #4: Skip-to-main-content for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[var(--accent-primary)] focus:text-white focus:font-semibold focus:text-sm"
      >
        Skip to main content
      </a>
      {/* #3: Visually-hidden h1 for heading hierarchy */}
      <h1 className="sr-only">TapeCalc — Tape Calculator</h1>
      <Header
        theme={calc.state.theme}
        themeName={calc.themeName}
        activeTab={activeTab}
        showLabs={showLabs}
        onCycleTheme={calc.handleCycleTheme}
        onTabChange={setActiveTab}
      />

      {/* Tab content — Calculator with ~60/40 tape:calc ratio */}
      <main id="main-content" className="flex flex-col flex-1 min-h-0">
      {activeTab === 0 && (
        <div className="flex flex-1 min-h-0 animate-tab-enter gap-3 app-main-split">
          <TapePanel
            entries={calc.state.tape.entries}
            grandTotal={calc.state.tape.grand_total}
            tapeNames={calc.state.tape_names}
            activeTapeIndex={calc.state.active_tape_index}
            onEntryClick={calc.handleTapeClick}
            onCopyResult={calc.handleCopyResult}
            onDeleteEntry={calc.handleDeleteEntry}
            onSetNote={calc.handleSetNote}
            onClearTape={handleClearTape}
            onNewTape={calc.handleNewTape}
            onSwitchTape={calc.handleSwitchTape}
            onRenameTape={calc.handleRenameTape}
            onDeleteTape={calc.handleDeleteTape}
            canUndo={calc.state.can_undo}
            canRedo={calc.state.can_redo}
            onUndo={calc.handleUndo}
            onRedo={calc.handleRedo}
            onExport={calc.handleExport}
          />
          <div className="calc-panel-responsive flex flex-col min-h-0" style={{ flex: 8, maxWidth: "380px" }}>
            <CalculatorPanel
              input={calc.state.input}
              result={calc.state.result}
              hasError={calc.state.has_error}
              angleUnit={calc.state.angle_unit}
              memory={calc.state.memory}
              onPress={calc.press}
            />
          </div>
        </div>
      )}

      <Suspense fallback={<LazyFallback />}>
        {activeTab === 1 && <UnitsView />}
        {activeTab === 2 && <CurrencyView />}
        {showLabs && activeTab === 3 && <SolverView />}
        {showLabs && activeTab === 4 && <GraphView />}
        {/* Labs-disabled fallback — shows helpful prompt instead of nothing */}
        {!showLabs && (activeTab === 3 || activeTab === 4) && (
          <div className="flex flex-1 items-center justify-center" style={{ background: "var(--bg-editor)" }}>
            <div className="text-center" style={{ maxWidth: 300 }}>
              <p className="text-sm font-semibold text-primary mb-2">Labs Feature</p>
              <p className="text-xs text-dim mb-4">
                This feature is experimental. Enable it in Settings → Labs to access.
              </p>
              <button
                onClick={() => setActiveTab(5)}
                className="action-btn action-btn--primary focus-ring"
              >
                Open Settings
              </button>
            </div>
          </div>
        )}
        {activeTab === 5 && (
          <SettingsView
            themeName={calc.themeName}
            angleUnit={calc.state.angle_unit}
            showLabs={showLabs}
            currencyRefreshInterval={settings.currencyRefreshInterval}
            onCycleTheme={calc.handleCycleTheme}
            onToggleAngle={() => calc.press("ANGLE")}
            onToggleLabs={toggleLabs}
            onChangeCurrencyRefreshInterval={(v: RefreshInterval) => setSetting("currencyRefreshInterval", v)}
          />
        )}
      </Suspense>
      </main>

      {/* Confirm dialog for destructive clear */}
      <ConfirmDialog
        open={confirmClear}
        title="Clear Tape?"
        message="This will permanently delete all entries in this tape. This action cannot be undone."
        confirmLabel="Clear All"
        danger
        onConfirm={confirmClearTape}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ErrorBoundary>
  );
}
