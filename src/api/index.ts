/**
 * Abstraction layer to route commands to Tauri IPC if running as a desktop app,
 * or WebAssembly backends if running as a PWA / web application.
 */

// Dynamically check if we're running under Tauri
const isTauri = '__TAURI_INTERNALS__' in window || '__TAURI__' in window;

// Singleton for holding our WASM abstract state
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- WASM AppState is dynamically loaded; exact shape depends on wasm-pack output
let wasmState: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any
let wasmInitPromise: Promise<void> | null = null;

export async function invokeApi<T>(cmd: string, args: Record<string, unknown> = {}): Promise<T> {
  if (isTauri) {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<T>(cmd, args);
  } else {
    if (cmd === "copy_to_clipboard") {
      const text = args?.text as string;
      if (text) {
        await navigator.clipboard.writeText(text);
      }
      return undefined as T;
    }

    // Load WASM dynamically
    const wasm = await import('../wasm/wasm_bindings.js');
    
    // Initialize WASM state singleton
    if (!wasmState) {
      if (!wasmInitPromise) {
        wasmInitPromise = wasm.default().then(() => {
          wasmState = new wasm.AppState();
        });
      }
      await wasmInitPromise;
    }

    try {
      switch (cmd) {
        // Calculator
        case 'get_state': return wasmState.get_state() as T;
        case 'button_press': return wasmState.button_press(args.key as string) as T;
        
        // Tape
        case 'undo': return wasmState.undo() as T;
        case 'redo': return wasmState.redo() as T;
        case 'clear_tape': return wasmState.clear_tape() as T;
        case 'delete_entry': return wasmState.delete_entry(args.lineNumber as number) as T;
        case 'cycle_theme': return wasmState.cycle_theme() as T;
        case 'export_tape': return wasmState.export_tape(args.format as string) as T;
        case 'tape_entry_click': return wasmState.tape_entry_click(args.lineNumber as number) as T;
        case 'new_tape': return wasmState.new_tape() as T;
        case 'switch_tape': return wasmState.switch_tape(args.index as number) as T;
        case 'set_note': return wasmState.set_note(args.lineNumber as number, args.note as string) as T;
        case 'rename_tape': return wasmState.rename_tape(args.index as number, args.name as string) as T;
        case 'delete_tape': return wasmState.delete_tape(args.index as number) as T;
        
        // Conversions
        case 'get_unit_categories': return wasmState.get_unit_categories() as T;
        case 'convert_units': return wasmState.convert_units(args.value as number, args.from as string, args.to as string) as T;
        case 'get_currencies': return wasmState.get_currencies() as T;
        case 'convert_currency': return wasmState.convert_currency(args.value as number, args.from as string, args.to as string) as T;
        case 'refresh_rates': return await wasmState.refresh_rates() as T;
        
        // Graphing
        case 'evaluate_graph_function': return wasmState.evaluate_graph_function(args.expression as string, args.x_min as number, args.x_max as number, args.num_points as number) as T;
        case 'graph_y_intercept': return wasmState.graph_y_intercept(args.expression as string) as T;
        case 'graph_x_intercepts': return wasmState.graph_x_intercepts(args.expression as string, args.x_min as number, args.x_max as number, args.resolution as number) as T;

        default:
          throw new Error(`Command '${cmd}' not mapped in WASM bindings`);
      }
    } catch (err) {
      console.error(`Error executing WASM command '${cmd}':`, err);
      throw err;
    }
  }
}
