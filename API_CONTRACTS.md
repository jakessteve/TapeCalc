# API Contracts

## Tauri IPC Commands

TapeCalc uses **Tauri 2 IPC** (invoke/command pattern) as its API layer. There is no REST API — all communication between frontend and backend happens through typed Tauri commands.

### Command Modules

| Module | Commands |
|---|---|
| `calc` | `get_state`, `button_press` |
| `tape` | `undo`, `redo`, `clear_tape`, `delete_entry`, `new_tape`, `switch_tape`, `rename_tape`, `delete_tape`, `set_note`, `export_tape`, `copy_to_clipboard` |
| `conversion` | `get_unit_categories`, `get_units_for_category`, `convert_units`, `get_currencies`, `convert_currency`, `refresh_rates` |
| `graphing` | `evaluate_graph_function`, `graph_y_intercept`, `graph_x_intercepts` |

### DTO Types (TypeScript — `src/types.ts`)

```typescript
interface CalcDisplay {
  input: string;
  result: string;
  has_error: boolean;
  angle_unit: AngleUnit;
  memory: string;
  can_undo: boolean;
  can_redo: boolean;
  theme: Theme;
  tape: TapeState;
  tape_count: number;
  active_tape_index: number;
  tape_names: string[];
}
```

See [docs/features.md](docs/features.md) for complete IPC command documentation with parameters.
