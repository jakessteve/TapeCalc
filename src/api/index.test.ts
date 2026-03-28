import { afterEach, describe, expect, it, vi } from "vitest";

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
    __TAURI__?: unknown;
  }
}

async function loadApiModule() {
  vi.resetModules();
  return import("./index");
}

afterEach(() => {
  delete window.__TAURI_INTERNALS__;
  delete window.__TAURI__;
  vi.restoreAllMocks();
});

describe("copyTextToClipboard", () => {
  it("uses the browser clipboard when Tauri is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    const { copyTextToClipboard } = await loadApiModule();
    await copyTextToClipboard("123");

    expect(writeText).toHaveBeenCalledWith("123");
  });

  it("falls back to execCommand when navigator.clipboard is unavailable", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn(() => true),
    });

    const { copyTextToClipboard } = await loadApiModule();
    await copyTextToClipboard("fallback");

    expect(document.execCommand).toHaveBeenCalledWith("copy");
  });

  it("uses Tauri IPC when running inside the desktop app", async () => {
    window.__TAURI_INTERNALS__ = {};
    const invoke = vi.fn().mockResolvedValue(undefined);
    vi.doMock("@tauri-apps/api/core", () => ({ invoke }));

    const { copyTextToClipboard } = await loadApiModule();
    await copyTextToClipboard("desktop");

    expect(invoke).toHaveBeenCalledWith("copy_to_clipboard", { text: "desktop" });
  });
});
