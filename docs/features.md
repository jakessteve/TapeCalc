# Features

## Calculator

The core tape calculator provides a traditional adding-machine experience with modern features.

### Button Grid
- Digits 0-9, decimal point
- Operators: `+`, `−`, `×`, `÷`, `%`, `^`
- Functions: `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `sqrt`, `cbrt`, `log`, `ln`, `exp`, `abs`, `ceil`, `floor`, `round`
- Constants: `π`, `e`, `τ`
- Parentheses for grouping
- Memory: `M+`, `M-`, `MR`, `MC`
- Angle modes: DEG, RAD, GRAD

### Keyboard Shortcuts
| Key | Action |
|---|---|
| `0-9`, `.` | Input digits |
| `+`, `-`, `*`, `/` | Operators |
| `Enter`, `=` | Evaluate |
| `Backspace` | Delete last |
| `Escape` | Clear |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Alt+1-5` | Switch tabs |

### IPC Commands
| Command | Parameters | Description |
|---|---|---|
| `get_state` | — | Get full calculator display state |
| `button_press` | `key: string` | Process a button press |

---

## Tape System

Each tape maintains an ordered list of calculations with a running grand total.

### Multi-Tape Management
- Create new tapes (default name: "Tape N")
- Switch between tapes
- Rename tapes (inline editing)
- Delete tapes (with confirmation)
- Persistent storage (auto-save to filesystem)

### Tape Entry Features
- Line numbering
- Notes per entry
- Undo/redo per tape (full history)
- Clear individual entries or entire tape

### Export Formats
| Format | Function | Description |
|---|---|---|
| JSON | `export_json()` | Full tape data with metadata |
| Text | `export_text()` | Human-readable with alignment |
| CSV | `export_csv()` | Spreadsheet-compatible |

### IPC Commands
| Command | Parameters | Description |
|---|---|---|
| `undo` | — | Undo last tape action |
| `redo` | — | Redo last undone action |
| `clear_tape` | — | Clear all entries |
| `delete_entry` | `index: number` | Delete specific entry |
| `new_tape` | `name: string` | Create new tape |
| `switch_tape` | `index: number` | Switch active tape |
| `rename_tape` | `index, name` | Rename a tape |
| `delete_tape` | `index: number` | Delete a tape |
| `set_note` | `index, note` | Set note on entry |
| `export_tape` | `format: string` | Export current tape |
| `copy_to_clipboard` | `text: string` | Copy text to clipboard |

---

## Unit Conversion

Converts values between units within the same category.

### Categories (8)
| Category | Example Units |
|---|---|
| Length | meter, kilometer, mile, foot, inch |
| Mass | kilogram, gram, pound, ounce |
| Temperature | celsius, fahrenheit, kelvin |
| Volume | liter, gallon (US), cup (US) |
| Area | square meter, hectare, acre |
| Speed | m/s, km/h, mph, knots |
| Time | second, minute, hour, day, year |
| Data | byte, kilobyte, megabyte, gigabyte |

### IPC Commands
| Command | Parameters | Description |
|---|---|---|
| `get_unit_categories` | — | List all unit categories |
| `convert_units` | `value, from, to` | Convert between units |

---

## Currency Conversion

Live exchange rate conversion with auto-refresh.

### Features
- Real-time rates from Open Exchange Rates API
- Configurable refresh interval (1 min, 1 hour, 24 hours)
- Auto-refresh when Currency tab is active
- Country flag emoji display
- Rate summary with last-updated timestamp

### IPC Commands
| Command | Parameters | Description |
|---|---|---|
| `get_currencies` | — | List supported currencies |
| `convert_currency` | `amount, from, to` | Convert between currencies |
| `refresh_rates` | — | Force refresh exchange rates |

---

## Expression Solver (Labs)

Evaluates algebraic expressions with variable support.

### Capabilities
- Standard arithmetic with operator precedence
- Scientific functions (trig, log, sqrt, etc.)
- Variable substitution (`x=5` in `x^2 + 2x + 1`)
- Implicit multiplication (`2π`, `3x`, `(2)(3)`)

---

## Graphing (Labs)

Plots mathematical functions with analysis.

### Features
- Real-time function plotting (Rust evaluator)
- Y-intercept calculation
- X-intercept finding (numerical methods)
- Adjustable x-range

### IPC Commands
| Command | Parameters | Description |
|---|---|---|
| `evaluate_graph_function` | `expr, x_min, x_max, points` | Evaluate function over range |
| `graph_y_intercept` | `expression` | Find y-intercept |
| `graph_x_intercepts` | `expr, x_min, x_max` | Find x-intercepts |

---

## Settings

| Setting | Options | Default |
|---|---|---|
| Theme | Dark, Light, High Contrast | Dark |
| Angle Unit | DEG, RAD, GRAD | DEG |
| Labs Features | On/Off | Off |
| Currency Refresh | 1 min, 1 hour, 24 hours | 1 hour |
