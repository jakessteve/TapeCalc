//! Undo/Redo system using the Command pattern.

use crate::tape::Tape;

/// A reversible action on the tape.
#[derive(Debug, Clone)]
pub enum TapeCommand {
    /// Add an entry with the given input string and notes.
    AddEntry { 
        input: String,
        note: Option<String>,
        operand_notes: std::collections::HashMap<usize, String>,
    },
    /// Edit an existing entry (stores old and new input).
    EditEntry {
        index: usize,
        old_input: String,
        new_input: String,
    },
    /// Delete an entry (stores index and the removed entry's input).
    DeleteEntry { index: usize, input: String },
}

/// Manages undo/redo history for tape operations.
#[derive(Debug)]
pub struct UndoStack {
    /// Past commands (for undo).
    undo_stack: Vec<TapeCommand>,
    /// Future commands (for redo, cleared on new action).
    redo_stack: Vec<TapeCommand>,
}

impl UndoStack {
    /// Create a new empty undo stack.
    pub fn new() -> Self {
        Self {
            undo_stack: Vec::new(),
            redo_stack: Vec::new(),
        }
    }

    /// Execute a command, push it to the undo stack, and clear redo.
    pub fn execute(&mut self, command: TapeCommand, tape: &mut Tape) {
        self.apply(&command, tape);
        self.undo_stack.push(command);
        self.redo_stack.clear();
    }

    /// Undo the last command.
    pub fn undo(&mut self, tape: &mut Tape) -> bool {
        if let Some(command) = self.undo_stack.pop() {
            self.reverse(&command, tape);
            self.redo_stack.push(command);
            true
        } else {
            false
        }
    }

    /// Redo the last undone command.
    pub fn redo(&mut self, tape: &mut Tape) -> bool {
        if let Some(command) = self.redo_stack.pop() {
            self.apply(&command, tape);
            self.undo_stack.push(command);
            true
        } else {
            false
        }
    }

    /// Whether undo is available.
    pub fn can_undo(&self) -> bool {
        !self.undo_stack.is_empty()
    }

    /// Whether redo is available.
    pub fn can_redo(&self) -> bool {
        !self.redo_stack.is_empty()
    }

    /// Apply a command forward.
    fn apply(&self, command: &TapeCommand, tape: &mut Tape) {
        match command {
            TapeCommand::AddEntry { input, note, operand_notes } => {
                tape.push_entry(input.clone());
                if let Some(entry) = tape.entries.last_mut() {
                    entry.note = note.clone();
                    entry.operand_notes = operand_notes.clone();
                }
            }
            TapeCommand::EditEntry {
                index, new_input, ..
            } => {
                if let Some(entry) = tape.entries.get_mut(*index) {
                    entry.input = new_input.clone();
                }
                tape.recalculate();
            }
            TapeCommand::DeleteEntry { index, .. } => {
                if *index < tape.entries.len() {
                    tape.entries.remove(*index);
                }
                tape.recalculate();
            }
        }
    }

    /// Reverse a command (undo).
    fn reverse(&self, command: &TapeCommand, tape: &mut Tape) {
        match command {
            TapeCommand::AddEntry { .. } => {
                tape.entries.pop();
            }
            TapeCommand::EditEntry {
                index, old_input, ..
            } => {
                if let Some(entry) = tape.entries.get_mut(*index) {
                    entry.input = old_input.clone();
                }
                tape.recalculate();
            }
            TapeCommand::DeleteEntry { index, input } => {
                tape.push_entry(input.clone());
                // Move the re-added entry to the correct position
                let last = tape.entries.len() - 1;
                if *index < last {
                    tape.entries.swap(*index, last);
                    // Reorder properly
                    tape.entries[*index..].rotate_right(1);
                }
                tape.recalculate();
            }
        }
    }
}

impl Default for UndoStack {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_undo_redo_add() {
        let mut tape = Tape::new("Test");
        let mut stack = UndoStack::new();

        stack.execute(
            TapeCommand::AddEntry {
                input: "1 + 2".into(),
                note: None,
                operand_notes: std::collections::HashMap::new(),
            },
            &mut tape,
        );
        assert_eq!(tape.len(), 1);

        stack.undo(&mut tape);
        assert_eq!(tape.len(), 0);

        stack.redo(&mut tape);
        assert_eq!(tape.len(), 1);
    }
}
