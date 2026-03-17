/**
 * Tauri API mock — provides a browser-compatible fallback when the Rust backend
 * is not available. This allows the React frontend to render fully in a
 * standard browser for UI/UX design audits and development.
 *
 * Only active when `window.__TAURI_INTERNALS__` is absent (i.e. not in Tauri).
 */

import { type CalcDisplay, type TapeEntryDto, Theme, AngleUnit } from "./types";
import { evaluate } from "./utils/mathEngine";

// ── localStorage Persistence ──────────────────────────────────────────────

const STORAGE_KEY = "tapcalc-state";

interface PersistedState {
  mockState: CalcDisplay;
  entryIdCounter: number;
  lineNumberCounter: number;
}

function saveState(): void {
  try {
    const data: PersistedState = { mockState, entryIdCounter, lineNumberCounter };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — silently degrade
  }
}

function loadState(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw) as PersistedState;
    if (data.mockState && typeof data.entryIdCounter === "number") {
      mockState = data.mockState;
      entryIdCounter = data.entryIdCounter;
      lineNumberCounter = data.lineNumberCounter;
      return true;
    }
  } catch {
    // Corrupt data — start fresh
    localStorage.removeItem(STORAGE_KEY);
  }
  return false;
}

/** Persist current state to localStorage and return a shallow copy. */
function persistAndReturn(): CalcDisplay {
  saveState();
  return { ...mockState };
}

// ── Mock Calculator State ─────────────────────────────────────────────────

let entryIdCounter = 0;
let lineNumberCounter = 0;

const defaultEntries: TapeEntryDto[] = [
  { line_number: ++lineNumberCounter, input: "856−320", result: "536", is_error: false, note: "" },
  { line_number: ++lineNumberCounter, input: "536×9", result: "4,824", is_error: false, note: "" },
  { line_number: ++lineNumberCounter, input: "4,824÷12", result: "402", is_error: false, note: "" },
  { line_number: ++lineNumberCounter, input: "sin(45°)", result: "0.70710678", is_error: false, note: "" },
  { line_number: ++lineNumberCounter, input: "√(144)", result: "12", is_error: false, note: "" },
];
entryIdCounter = defaultEntries.length;

let mockState: CalcDisplay = {
  input: "402 + 98",
  result: "500",
  has_error: false,
  angle_unit: AngleUnit.Degrees,
  memory: "42",
  can_undo: true,
  can_redo: false,
  theme: Theme.Light,
  tape: {
    entries: defaultEntries,
    grand_total: "5,774",
  },
  tape_count: 2,
  active_tape_index: 0,
  tape_names: ["Session 1", "Scratch"],
};

// Try to restore from localStorage (overrides defaults if found)
loadState();

// ── Mock Unit Categories ──────────────────────────────────────────────────

const MOCK_UNIT_CATEGORIES = [
  { id: "length", name: "Length", units: [
    { name: "meter", display: "m" }, { name: "kilometer", display: "km" },
    { name: "centimeter", display: "cm" }, { name: "millimeter", display: "mm" },
    { name: "inch", display: "in" }, { name: "foot", display: "ft" },
    { name: "yard", display: "yd" }, { name: "mile", display: "mi" },
  ]},
  { id: "mass", name: "Mass", units: [
    { name: "kilogram", display: "kg" }, { name: "gram", display: "g" },
    { name: "pound", display: "lb" }, { name: "ounce", display: "oz" },
  ]},
  { id: "temperature", name: "Temperature", units: [
    { name: "celsius", display: "°C" }, { name: "fahrenheit", display: "°F" },
    { name: "kelvin", display: "K" },
  ]},
  { id: "volume", name: "Volume", units: [
    { name: "liter", display: "L" }, { name: "milliliter", display: "mL" },
    { name: "gallon", display: "gal" }, { name: "cup", display: "cup" },
  ]},
  { id: "area", name: "Area", units: [
    { name: "square_meter", display: "m²" }, { name: "hectare", display: "ha" },
    { name: "acre", display: "ac" }, { name: "square_foot", display: "ft²" },
  ]},
  { id: "speed", name: "Speed", units: [
    { name: "meters_per_second", display: "m/s" }, { name: "kilometers_per_hour", display: "km/h" },
    { name: "miles_per_hour", display: "mph" }, { name: "knot", display: "kn" },
  ]},
  { id: "time", name: "Time", units: [
    { name: "second", display: "s" }, { name: "minute", display: "min" },
    { name: "hour", display: "h" }, { name: "day", display: "d" },
  ]},
  { id: "data", name: "Data", units: [
    { name: "byte", display: "B" }, { name: "kilobyte", display: "KB" },
    { name: "megabyte", display: "MB" }, { name: "gigabyte", display: "GB" },
  ]},
];

// ── Mock Currencies ───────────────────────────────────────────────────────

const MOCK_CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫", flag: "🇻🇳" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "🇰🇷" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "THB", name: "Thai Baht", symbol: "฿", flag: "🇹🇭" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
];

// ── Mock Invoke Handler ───────────────────────────────────────────────────

async function mockInvoke(cmd: string, args?: Record<string, unknown>): Promise<unknown> {
  // Simulate realistic IPC latency
  await new Promise((r) => setTimeout(r, 15));

  switch (cmd) {
    case "get_state":
      return { ...mockState }; // Already loaded from localStorage in init

    case "button_press": {
      const key = args?.key as string;
      if (key === "C") {
        mockState = { ...mockState, input: "", result: "0" };
      } else if (key === "=") {
        // Add the current expression as a tape entry
        if (mockState.input) {
          entryIdCounter++;
          lineNumberCounter++;
          const newEntry: TapeEntryDto = {
            line_number: lineNumberCounter,
            input: mockState.input,
            result: mockState.result,
            is_error: false,
            note: "",
          };
          const allEntries = [...mockState.tape.entries, newEntry];
          const sum = allEntries.reduce((acc, e) => {
            const num = parseFloat(e.result.replace(/,/g, ""));
            return acc + (isNaN(num) ? 0 : num);
          }, 0);
          mockState = {
            ...mockState,
            input: "",
            tape: {
              entries: allEntries,
              grand_total: sum.toLocaleString("en-US"),
            },
          };
        }
      } else if (key === "⌫") {
        mockState = { ...mockState, input: mockState.input.slice(0, -1) };
      } else if (key === "ANGLE") {
        const next = mockState.angle_unit === AngleUnit.Degrees ? AngleUnit.Radians : AngleUnit.Degrees;
        mockState = { ...mockState, angle_unit: next };
      } else if (key === "RPN") {
        // RPN mode removed — no-op
      } else {
        const newInput = mockState.input + key;
        try {
          const val = evaluate(newInput);
          mockState = { ...mockState, input: newInput, result: String(val) };
        } catch {
          mockState = { ...mockState, input: newInput };
        }
      }
      return persistAndReturn();
    }

    case "undo":
    case "redo":
    case "tape_entry_click":
      return { ...mockState };

    case "clear_tape":
      lineNumberCounter = 0;
      mockState = {
        ...mockState,
        tape: { entries: [], grand_total: "0" },
      };
      return persistAndReturn();

    case "delete_entry": {
      const ln = args?.lineNumber as number;
      mockState = {
        ...mockState,
        tape: {
          ...mockState.tape,
          entries: mockState.tape.entries.filter((e) => e.line_number !== ln),
        },
      };
      return persistAndReturn();
    }

    case "set_note": {
      const lineNum = args?.lineNumber as number;
      const noteText = (args?.note as string) ?? "";
      mockState = {
        ...mockState,
        tape: {
          ...mockState.tape,
          entries: mockState.tape.entries.map((e) =>
            e.line_number === lineNum ? { ...e, note: noteText } : e
          ),
        },
      };
      return persistAndReturn();
    }

    case "new_tape":
      mockState = {
        ...mockState,
        tape_names: [...mockState.tape_names, `Tape ${mockState.tape_names.length + 1}`],
        tape_count: mockState.tape_count + 1,
      };
      return persistAndReturn();

    case "switch_tape":
      mockState = { ...mockState, active_tape_index: (args?.index as number) ?? 0 };
      return persistAndReturn();

    case "rename_tape": {
      const idx = args?.index as number;
      const newName = (args?.name as string) ?? "";
      const names = [...mockState.tape_names];
      if (idx >= 0 && idx < names.length) names[idx] = newName;
      mockState = { ...mockState, tape_names: names };
      return persistAndReturn();
    }

    case "delete_tape": {
      const delIdx = args?.index as number;
      if (mockState.tape_names.length <= 1) return { ...mockState }; // Can't delete last tape
      const newNames = mockState.tape_names.filter((_: string, i: number) => i !== delIdx);
      const newActiveIdx = mockState.active_tape_index >= newNames.length
        ? newNames.length - 1
        : mockState.active_tape_index;
      mockState = {
        ...mockState,
        tape_names: newNames,
        tape_count: newNames.length,
        active_tape_index: newActiveIdx,
      };
      return persistAndReturn();
    }

    case "cycle_theme":
      mockState = { ...mockState, theme: ((mockState.theme + 1) % 3) as Theme };
      return persistAndReturn();

    case "export_tape":
      return mockState.tape.entries.map((e) => `${e.input} = ${e.result}`).join("\n");

    case "copy_to_clipboard":
      if (navigator.clipboard && args?.text) {
        navigator.clipboard.writeText(args.text as string).catch(() => {});
      }
      return null;

    // ── Units ──
    case "get_unit_categories":
      return MOCK_UNIT_CATEGORIES;

    case "convert_units": {
      const v = (args?.value as number) ?? 0;
      const from = args?.from as string;
      const to = args?.to as string;
      if (from === to) return v;

      // Conversion factors: multiply by factor to get base unit
      // Base units: meter, kilogram, celsius, liter, square_meter, meters_per_second, second, byte
      const toBase: Record<string, number> = {
        // Length → meter
        meter: 1, kilometer: 1000, centimeter: 0.01, millimeter: 0.001,
        inch: 0.0254, foot: 0.3048, yard: 0.9144, mile: 1609.344,
        // Mass → kilogram
        kilogram: 1, gram: 0.001, pound: 0.453592, ounce: 0.0283495,
        // Volume → liter
        liter: 1, milliliter: 0.001, gallon: 3.78541, cup: 0.236588,
        // Area → square_meter
        square_meter: 1, hectare: 10000, acre: 4046.86, square_foot: 0.092903,
        // Speed → meters_per_second
        meters_per_second: 1, kilometers_per_hour: 1 / 3.6,
        miles_per_hour: 0.44704, knot: 0.514444,
        // Time → second
        second: 1, minute: 60, hour: 3600, day: 86400,
        // Data → byte
        byte: 1, kilobyte: 1024, megabyte: 1048576, gigabyte: 1073741824,
      };

      // Temperature requires formula-based conversion
      const tempUnits = ["celsius", "fahrenheit", "kelvin"];
      if (tempUnits.includes(from) && tempUnits.includes(to)) {
        // Convert to Celsius first, then to target
        let celsius = v;
        if (from === "fahrenheit") celsius = (v - 32) * 5 / 9;
        else if (from === "kelvin") celsius = v - 273.15;

        if (to === "celsius") return celsius;
        if (to === "fahrenheit") return celsius * 9 / 5 + 32;
        if (to === "kelvin") return celsius + 273.15;
      }

      // Standard factor-based conversion: value_in_base = value * fromFactor
      // result = value_in_base / toFactor
      const fromFactor = toBase[from];
      const toFactor = toBase[to];
      if (fromFactor != null && toFactor != null) {
        return (v * fromFactor) / toFactor;
      }
      return v; // fallback
    }

    // ── Currency ──
    case "get_currencies":
      return MOCK_CURRENCIES;

    case "convert_currency": {
      const v = (args?.value as number) ?? 0;
      const mockRate = 25445.5;
      return { result: v * mockRate, rate: mockRate, last_updated: "Mock — 2026-03-12" };
    }

    case "refresh_rates":
      return "Mock — 2026-03-12 (refreshed)";

    // ── Graphing ──
    case "evaluate_graph_function": {
      const expr = args?.expression as string;
      const xMin = args?.xMin as number;
      const xMax = args?.xMax as number;
      const numPoints = (args?.numPoints as number) ?? 200;
      const step = (xMax - xMin) / (numPoints - 1);
      const points: { x: number; y: number }[] = [];
      for (let i = 0; i < numPoints; i++) {
        const x = xMin + step * i;
        try {
          const y = evaluate(String(expr), { vars: { x } });
          if (isFinite(y)) points.push({ x, y });
        } catch { /* skip */ }
      }
      return points;
    }

    case "graph_y_intercept": {
      const expr = args?.expression as string;
      return evaluate(String(expr), { vars: { x: 0 } });
    }

    case "graph_x_intercepts": {
      const expr = args?.expression as string;
      const xMin = args?.xMin as number;
      const xMax = args?.xMax as number;
      const res = (args?.resolution as number) ?? 1000;
      const step = (xMax - xMin) / res;
      const zeros: number[] = [];
      let prevY: number | null = null;
      let prevX = xMin;
      for (let i = 0; i <= res; i++) {
        const x = xMin + step * i;
        try {
          const y = evaluate(String(expr), { vars: { x } });
          if (prevY !== null && isFinite(y) && isFinite(prevY) && Math.sign(y) !== Math.sign(prevY)) {
            const t = Math.abs(prevY) / (Math.abs(prevY) + Math.abs(y));
            zeros.push(prevX + t * (x - prevX));
          }
          prevY = y;
          prevX = x;
        } catch { prevY = null; }
      }
      return zeros;
    }

    default:
      console.warn(`[tauriMock] Unknown command: ${cmd}`);
      return null;
  }
}

// ── Initialization ────────────────────────────────────────────────────────

interface TauriInternals {
  invoke: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
  transformCallback: () => number;
  convertFileSrc: (s: string) => string;
}

/** Call this early (before React renders) to patch the Tauri API if needed. */
export function initTauriMock(): boolean {
  if ((window as Window & { __TAURI_INTERNALS__?: TauriInternals }).__TAURI_INTERNALS__) {
    return false; // Real Tauri runtime available
  }

  // eslint-disable-next-line no-console -- intentional: notify developer that mock backend is active
  console.info(
    "%c[tauriMock] Tauri not detected — running with mock backend for UI preview",
    "color: #a855f7; font-weight: bold"
  );

  // Patch the global so @tauri-apps/api/core.invoke uses our mock
  (window as Window & { __TAURI_INTERNALS__?: TauriInternals }).__TAURI_INTERNALS__ = {
    invoke: mockInvoke,
    transformCallback: () => 0,
    convertFileSrc: (s: string) => s,
  };

  return true;
}
