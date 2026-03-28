import { memo, useState } from "react";
import {
  Calculator,
  Settings,
  Moon,
  Sun,
  Contrast,
  Ruler,
  DollarSign,
  FunctionSquare,
  LineChart,
  Pin,
  Printer,
} from "lucide-react";
import tapcalcLogo from "../assets/tapcalc-logo.png";
import { Theme } from "../types";

interface HeaderProps {
  theme: Theme;
  themeName: string;
  activeTab: number;
  showLabs?: boolean;
  onCycleTheme: () => void;
  onTabChange: (tab: number) => void;
  onToggleAlwaysOnTop?: (enable: boolean) => void;
}

const MAIN_TABS = [
  { label: "Calculator", Icon: Calculator },
  { label: "Units", Icon: Ruler },
  { label: "Currency", Icon: DollarSign },
] as const;

const LABS_TABS = [
  { label: "Solver", Icon: FunctionSquare, tabIndex: 3 },
  { label: "Graph", Icon: LineChart, tabIndex: 4 },
] as const;

export const Header = memo(function Header({
  themeName,
  activeTab,
  showLabs,
  onCycleTheme,
  onTabChange,
  onToggleAlwaysOnTop,
}: HeaderProps) {
  const [isPinned, setIsPinned] = useState(false);

  const handlePinToggle = () => {
    const next = !isPinned;
    setIsPinned(next);
    onToggleAlwaysOnTop?.(next);
  };

  const themeIcon =
    themeName === "Professional Dark" ? (
      <Moon size={14} />
    ) : themeName === "Light" ? (
      <Sun size={14} />
    ) : (
      <Contrast size={14} />
    );

  return (
    <header className="flex flex-col" style={{ background: "var(--bg-base)" }}>
      {/* Top bar — P1-4: elevated with subtle shadow */}
      <div
        className="flex h-11 items-center gap-3 px-4 header-bar"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        {/* Logo — click to go to Calculator */}
        <button
          onClick={() => onTabChange(0)}
          className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0 cursor-pointer overflow-hidden"
          title="TapeCalc — Go to Calculator"
          aria-label="Go to Calculator"
        >
          <img src={tapcalcLogo} alt="TapeCalc" className="w-7 h-7 rounded-lg" />
        </button>

        <span className="text-sm font-bold tracking-tight text-header">
          TapeCalc
        </span>

        <div className="flex-1" />

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePinToggle}
            className={`action-btn focus-ring ${isPinned ? "text-primary" : "text-dim"}`}
            title="Toggle Always On Top"
            aria-label="Pin window on top"
          >
            <Pin size={14} className={isPinned ? "fill-current" : ""} />
          </button>

          <button
            onClick={() => {
              window.print();
            }}
            className="action-btn focus-ring text-dim"
            title="Print Tape"
            aria-label="Print tape or save as PDF"
          >
            <Printer size={14} />
          </button>
        </div>

        {/* Theme toggle — P1-1: aria-label */}
        <button
          id="btn-theme-toggle"
          onClick={onCycleTheme}
          className="action-btn focus-ring"
          aria-label={`Current theme: ${themeName}. Click to switch theme.`}
        >
          {themeIcon}
          {themeName}
        </button>
      </div>

      {/* Tab bar — P1-2: proper tablist/tab roles, P1-5: background fill active state */}
      <div
        className="flex h-10 items-end px-4 header-bar"
        role="tablist"
        aria-label="Main navigation"
      >
        {/* Main tabs (left-aligned) */}
        <div className="flex items-end gap-1">
          {MAIN_TABS.map((tab, i) => (
            <button
              id={`tab-${tab.label.toLowerCase()}`}
              key={tab.label}
              onClick={() => onTabChange(i)}
              role="tab"
              aria-selected={activeTab === i}
              aria-label={tab.label}
              className={`header-tab ${activeTab === i ? "header-tab--active" : ""}`}
            >
              <tab.Icon size={14} />
              <span className="header-tab-label">{tab.label}</span>
            </button>
          ))}

          {/* Labs tabs — only visible when Labs is enabled */}
          {showLabs && LABS_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => onTabChange(tab.tabIndex)}
              role="tab"
              aria-selected={activeTab === tab.tabIndex}
              aria-label={tab.label}
              className={`header-tab ${activeTab === tab.tabIndex ? "header-tab--active" : ""}`}
            >
              <tab.Icon size={14} />
              <span className="header-tab-label">{tab.label}</span>
              <span className="labs-badge">Labs</span>
            </button>
          ))}
        </div>

        {/* Spacer pushes Settings to the right */}
        <div className="flex-1" />

        {/* Settings tab (right-aligned) */}
        <button
          id="tab-settings"
          onClick={() => onTabChange(5)}
          role="tab"
          aria-selected={activeTab === 5}
          aria-label="Settings"
          className={`header-tab ${activeTab === 5 ? "header-tab--active" : ""}`}
        >
          <Settings size={14} />
          <span className="header-tab-label">Settings</span>
        </button>
      </div>
    </header>
  );
});
