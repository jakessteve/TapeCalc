/** Settings tab — with Labs toggle, angle unit control, and cleaned up non-functional items */

import {
  Palette,
  Calculator,
  RefreshCw,
  Beaker,
  Keyboard,
  Info,
  ChevronRight,
  Cpu,
  ShieldCheck,
  Heart,
  DollarSign,
  Timer,
} from "lucide-react";
import { REFRESH_INTERVAL_OPTIONS, type RefreshInterval } from "../hooks/useSettings";

interface SettingsViewProps {
  themeName: string;
  angleUnit: string;
  showLabs: boolean;
  currencyRefreshInterval: RefreshInterval;
  onCycleTheme: () => void;
  onToggleAngle: () => void;
  onToggleLabs: (enabled: boolean) => void;
  onChangeCurrencyRefreshInterval: (value: RefreshInterval) => void;
}

function SettingRow({
  label,
  description,
  children,
  icon: Icon,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="setting-row">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-0.5 p-1.5 rounded-lg bg-bg-btn text-accent">
            <Icon size={16} />
          </div>
        )}
        <div>
          <div className="setting-row__label">{label}</div>
          {description && <div className="setting-row__desc">{description}</div>}
        </div>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function ToggleSwitch({ active, onClick, ariaLabel }: { active: boolean; onClick: () => void; ariaLabel: string }) {
  return (
    <button
      onClick={onClick}
      className={`toggle-switch focus-ring ${active ? "toggle-switch--active" : ""}`}
      role="switch"
      aria-checked={active}
      aria-label={ariaLabel}
    >
      <span className="toggle-switch__thumb" />
    </button>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="inline-flex items-center justify-center px-1.5 py-0.5 rounded border text-[10px] font-mono font-bold shadow-sm min-w-[20px]"
      style={{
        background: "var(--bg-btn)",
        borderColor: "var(--border-medium)",
        color: "var(--accent-primary)",
      }}
    >
      {children}
    </kbd>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <Icon size={14} className="text-dim" />
        <h3 className="section-title mb-0">{title}</h3>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

export function SettingsView({
  themeName,
  angleUnit,
  showLabs,
  currencyRefreshInterval,
  onCycleTheme,
  onToggleAngle,
  onToggleLabs,
  onChangeCurrencyRefreshInterval,
}: SettingsViewProps) {
  return (
    <div
      className="flex-1 overflow-y-auto p-6 animate-tab-enter"
      style={{ background: "var(--bg-editor)", display: "flex", justifyContent: "center" }}
    >
      <div className="flex flex-col gap-8" style={{ width: "100%", maxWidth: 520 }}>
        {/* Appearance */}
        <Section title="Appearance" icon={Palette}>
          <SettingRow
            label="Theme"
            description="Switch between dark, light, and high-contrast"
            icon={Palette}
          >
            <button
              onClick={onCycleTheme}
              className="action-btn action-btn--accent focus-ring"
              aria-label={`Current theme: ${themeName}. Click to switch.`}
            >
              <span className="capitalize">{themeName}</span>
              <ChevronRight size={14} className="opacity-50" />
            </button>
          </SettingRow>
        </Section>

        {/* Calculator */}
        <Section title="Calculator" icon={Calculator}>
          <SettingRow
            label="Angle Unit"
            description="Default measurement for trigonometric functions"
            icon={Cpu}
          >
            <button
              onClick={onToggleAngle}
              className="action-btn focus-ring"
              aria-label={`Current angle unit: ${angleUnit}. Click to toggle.`}
            >
              {angleUnit}
            </button>
          </SettingRow>
        </Section>

        {/* Currency */}
        <Section title="Currency" icon={DollarSign}>
          <SettingRow
            label="Refresh Interval"
            description="How often to fetch latest exchange rates"
            icon={Timer}
          >
            <select
              className="setting-select focus-ring"
              value={currencyRefreshInterval}
              onChange={(e) => onChangeCurrencyRefreshInterval(Number(e.target.value) as RefreshInterval)}
              aria-label="Currency refresh interval"
            >
              {REFRESH_INTERVAL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </SettingRow>
        </Section>

        {/* Data & Export */}
        <Section title="Data & Synchronization" icon={RefreshCw}>
          <SettingRow
            label="Auto-save"
            description="Entries are saved locally as you type"
            icon={ShieldCheck}
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success" style={{ background: "var(--accent-success)" }} />
              <span className="text-xs font-semibold text-success">Enabled</span>
            </div>
          </SettingRow>
        </Section>

        {/* Labs Features */}
        <Section title="Experimental Labs" icon={Beaker}>
          <SettingRow
            label="Enable Labs Features"
            description="Access Solver and Interactive Graphing tabs"
            icon={Beaker}
          >
            <ToggleSwitch active={showLabs} onClick={() => onToggleLabs(!showLabs)} ariaLabel="Toggle labs features" />
          </SettingRow>
          {showLabs && (
            <div
              className="surface-card animate-slide-up"
              style={{ padding: "var(--space-md)", borderStyle: "dashed", borderColor: "var(--border-accent)" }}
            >
              <div className="flex gap-3">
                <Info size={16} className="text-accent shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed text-secondary">
                  Labs features are experimental and may change or be removed. Currently includes the{" "}
                  <span className="text-accent font-semibold">Scientific Solver</span> and{" "}
                  <span className="text-accent font-semibold">Interactive Graphing</span>.
                </p>
              </div>
            </div>
          )}
        </Section>

        {/* Keyboard Shortcuts */}
        <Section title="Keyboard Shortcuts" icon={Keyboard}>
          <div className="surface-card overflow-hidden">
            <table className="w-full text-xs" role="table" aria-label="Keyboard shortcuts reference">
              <tbody>
                {[
                  { keys: ["Ctrl", "Z"], action: "Undo" },
                  { keys: ["Ctrl", "Y"], action: "Redo" },
                  { keys: ["Ctrl", "1–6"], action: "Switch tabs" },
                  { keys: ["0–9", "+", "−", "×", "÷"], action: "Calculator input" },
                  { keys: ["Enter"], action: "Calculate / New Line" },
                  { keys: ["Backspace"], action: "Delete last" },
                  { keys: ["Escape"], action: "Clear input" },
                ].map(({ keys, action }, idx) => (
                  <tr
                    key={idx}
                    style={{ borderBottom: idx === 6 ? "none" : "1px solid var(--border-light)" }}
                    className="hover:bg-bg-btn transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {keys.map((k, i) => (
                          <span key={i} className="flex items-center gap-1">
                            <Kbd>{k}</Kbd>
                            {i < keys.length - 1 && <span className="text-dim opacity-50">+</span>}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-secondary font-medium">{action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* About */}
        <Section title="About TapeCalc" icon={Info}>
          <div className="surface-card" style={{ padding: "var(--space-lg)" }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div
                  className="title-icon"
                  style={{ width: 44, height: 44, fontSize: 16, fontWeight: 800 }}
                  aria-hidden="true"
                >
                  T
                </div>
                <div>
                  <div className="text-sm font-bold text-primary">TapeCalc v2.0.0</div>
                  <div className="text-xs text-dim">Build: 2026.03.13</div>
                </div>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-secondary mb-0">
              Modern tape calculator with scientific computation, graphing, and symbolic algebra. Built with Rust +
              Tauri v2 + React for maximum performance and security.
            </p>
          </div>
        </Section>

        <div className="flex justify-center py-4">
          <div className="text-[10px] text-dim opacity-40 uppercase tracking-widest font-bold">
            Made with <Heart size={10} className="inline-block text-[var(--accent-clear)]" fill="currentColor" /> for Math
          </div>
        </div>
      </div>
    </div>
  );
}

