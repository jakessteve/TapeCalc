/** Types matching the Rust backend DTOs */

export enum Theme {
  Dark = 0,
  Light = 1,
  HighContrast = 2,
}

export enum ExportFormat {
  Text = "text",
}

export enum AngleUnit {
  Degrees = "DEG",
  Radians = "RAD",
  Gradians = "GRAD",
}

export interface TapeEntryDto {
  line_number: number;
  input: string;
  result: string;
  is_error: boolean;
  note: string;
  is_subtotal?: boolean;
  operand_notes: Record<number, string>;
}

export interface TapeState {
  entries: TapeEntryDto[];
  grand_total: string;
}

export interface CalcDisplay {
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
  pending_result_note?: string;
  pending_operand_notes: Record<number, string>;
}
