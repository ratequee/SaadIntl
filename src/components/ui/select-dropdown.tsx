"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type SelectOption = { value: string; label: string };

export function SelectDropdown({
  name,
  label,
  options,
  defaultValue = "",
  value: controlled,
  onChange,
  required,
  placeholder,
  className,
  triggerClassName,
  menuClassName,
  optionClassName,
  selectedClassName,
}: {
  name?: string;
  label: string;
  options: SelectOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  optionClassName?: string;
  selectedClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedValue = controlled ?? uncontrolled;
  const selected = options.find((option) => option.value === selectedValue);

  function choose(next: string) {
    if (controlled === undefined) setUncontrolled(next);
    onChange?.(next);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form) return;
    function onReset() {
      setUncontrolled(defaultValue);
      setOpen(false);
    }
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, [defaultValue]);

  return (
    <div ref={rootRef} className={cn("relative", open && "z-40", className)}>
      {name ? <input type="hidden" name={name} value={selectedValue} required={required} /> : null}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "inline-flex w-full items-center justify-between gap-3 text-start",
          triggerClassName,
        )}
      >
        <span className={cn("min-w-0 truncate", !selected && "text-muted")}>
          {selected?.label || placeholder || label}
        </span>
        <svg
          viewBox="0 0 16 16"
          className={cn("size-3.5 shrink-0 opacity-60 transition-transform", open && "rotate-180")}
          aria-hidden
        >
          <path fill="currentColor" d="M3.2 5.6 8 10.4l4.8-4.8 1.2 1.2L8 12.8 2 6.8z" />
        </svg>
      </button>
      {open ? (
        <ul
          role="listbox"
          className={cn(
            "absolute inset-inline-start-0 top-[calc(100%+0.4rem)] z-50 max-h-64 min-w-full overflow-auto py-1",
            menuClassName,
          )}
        >
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === selectedValue}
                className={cn(
                  "flex w-full px-4 py-2.5 text-start text-sm",
                  optionClassName || "hover:bg-surface",
                  option.value === selectedValue && (selectedClassName || "bg-surface font-medium"),
                )}
                onClick={() => choose(option.value)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
