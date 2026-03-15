import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

function render() {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

// Enable browser-only mock when Tauri backend is unavailable (dev mode only).
// IMPORTANT: The mock MUST be initialized BEFORE React renders, otherwise
// useCalculator's invoke("get_state") fires before __TAURI_INTERNALS__ is
// patched, causing the app to be stuck on the loading screen.
if (import.meta.env.DEV && !(window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__) {
  import("./tauriMock").then(({ initTauriMock }) => {
    initTauriMock();
    render();
  });
} else {
  render();
}
