import { useEffect, useRef } from "react";
import { ToastType } from "../components/Toast";

const KEY_MAP: Record<string, string> = {
  "0": "0", "1": "1", "2": "2", "3": "3", "4": "4",
  "5": "5", "6": "6", "7": "7", "8": "8", "9": "9",
  "+": "+", "-": "−", "*": "×",
  "Enter": "=", "=": "=",
  "Backspace": "⌫", "Escape": "C",
  "%": "%", "^": "^", "(": "(", ")": ")", ".": ".",
};

interface UseKeyboardShortcutsProps {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  calc: {
    press: (btn: string) => void;
    handleUndo: () => void;
    handleRedo: () => void;
  };
  showToast: (msg: string, variant?: ToastType) => void;
}

export function useKeyboardShortcuts({
  activeTab,
  setActiveTab,
  calc,
  showToast,
}: UseKeyboardShortcutsProps) {
  // Safe concurrency-friendly ref updating
  const activeTabRef = useRef(activeTab);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Tab navigation: Ctrl+1 through Ctrl+6
      if (e.ctrlKey && e.key >= "1" && e.key <= "6") {
        e.preventDefault();
        setActiveTab(parseInt(e.key, 10) - 1);
        return;
      }

      // Ctrl+Z / Ctrl+Y work on all tabs
      if (e.ctrlKey && e.key === "z") { 
        e.preventDefault(); 
        calc.handleUndo(); 
        showToast("Undo", "info"); 
        return; 
      }
      if (e.ctrlKey && e.key === "y") { 
        e.preventDefault(); 
        calc.handleRedo(); 
        showToast("Redo", "info"); 
        return; 
      }

      // Only handle calculator keys when on Calculator tab
      if (activeTabRef.current !== 0) return;

      // Handle / separately to prevent browser search
      if (e.key === "/") { 
        e.preventDefault(); 
        calc.press("÷"); 
        return; 
      }

      const mapped = KEY_MAP[e.key];
      if (mapped) {
        calc.press(mapped);
      }
    };
    
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [calc, setActiveTab, showToast]);
}
