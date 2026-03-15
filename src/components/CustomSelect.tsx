import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Search } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  /** Optional leading text/emoji, e.g. flag */
  prefix?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  className?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchable = true,
  className = "",
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [focusIdx, setFocusIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = search
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(search.toLowerCase()) ||
          o.value.toLowerCase().includes(search.toLowerCase()) ||
          (o.prefix && o.prefix.toLowerCase().includes(search.toLowerCase())),
      )
    : options;

  const selectOption = useCallback(
    (val: string) => {
      onChange(val);
      setOpen(false);
      setSearch("");
      setFocusIdx(-1);
    },
    [onChange],
  );

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
        setFocusIdx(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus search on open
  useEffect(() => {
    if (open && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open, searchable]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusIdx >= 0 && listRef.current) {
      const el = listRef.current.children[
        searchable ? focusIdx + 1 : focusIdx
      ] as HTMLElement | undefined;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [focusIdx, searchable]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusIdx((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusIdx((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (focusIdx >= 0 && focusIdx < filtered.length) {
          selectOption(filtered[focusIdx].value);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        setSearch("");
        setFocusIdx(-1);
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`custom-select ${className}`}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        className={`custom-select__trigger focus-ring ${open ? "custom-select__trigger--open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={selected ? `Selected: ${selected.prefix ? selected.prefix + ' ' : ''}${selected.label}. Click to change.` : placeholder}
      >
        <span className="truncate">
          {selected ? (
            <>
              {selected.prefix && <span className="mr-1.5">{selected.prefix}</span>}
              {selected.label}
            </>
          ) : (
            <span className="text-dim">{placeholder}</span>
          )}
        </span>
        <ChevronDown size={14} className="custom-select__chevron" />
      </button>

      {open && (
        <div
          ref={listRef}
          className="custom-select__dropdown"
          role="listbox"
        >
          {searchable && (
            <div className="custom-select__search">
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--fg-dim)" }}
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setFocusIdx(0);
                  }}
                  className="custom-select__search-input"
                  style={{ paddingLeft: "28px" }}
                  placeholder="Search…"
                  aria-label="Search options"
                />
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="custom-select__option--no-results">No results found</div>
          ) : (
            filtered.map((opt, idx) => (
              <div
                key={opt.value}
                className={`custom-select__option ${
                  idx === focusIdx ? "custom-select__option--focused" : ""
                } ${opt.value === value ? "custom-select__option--selected" : ""}`}
                onClick={() => selectOption(opt.value)}
                role="option"
                aria-selected={opt.value === value}
              >
                {opt.prefix && <span>{opt.prefix}</span>}
                <span className="truncate">{opt.label}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
