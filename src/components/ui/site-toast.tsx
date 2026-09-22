"use client";

import { useEffect, useState } from "react";

type Tone = "success" | "error";

type Toast = {
  message: string;
  tone: Tone;
};

export function pushSiteToast(message: string, tone: Tone = "success") {
  window.dispatchEvent(new CustomEvent("sip:toast", { detail: { message, tone } }));
}

export function SiteToast() {
  const [toast, setToast] = useState<Toast | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onEvent(event: Event) {
      const detail = (event as CustomEvent<Toast>).detail;
      if (!detail?.message) return;
      setToast({ message: detail.message, tone: detail.tone || "success" });
    }
    window.addEventListener("sip:toast", onEvent);
    return () => window.removeEventListener("sip:toast", onEvent);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const show = requestAnimationFrame(() => setVisible(true));
    const hide = window.setTimeout(() => setVisible(false), 3800);
    const clear = window.setTimeout(() => setToast(null), 4300);
    return () => {
      cancelAnimationFrame(show);
      window.clearTimeout(hide);
      window.clearTimeout(clear);
    };
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-5 z-[80] flex justify-center px-4 md:justify-end md:pe-8">
      <div
        className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-[1.4rem] border bg-background shadow-[var(--shadow)] transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          toast.tone === "error"
            ? "border-red-700/20"
            : "border-[color-mix(in_srgb,var(--gold)_45%,transparent)]"
        } ${visible ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"}`}
        role="status"
      >
        <span className="block h-1 bg-gold" />
        <div className="flex items-start gap-3 px-4 py-4">
          <span
            className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-full ${
              toast.tone === "error" ? "bg-red-700 text-white" : "bg-gold text-espresso"
            }`}
          >
            {toast.tone === "error" ? (
              <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
                <path d="M12 8v5M12 16.5h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
                <path
                  d="m7 12.5 3.2 3.2L17 8.8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-gold">
              SAAD International
            </p>
            <p className="mt-1 text-sm font-medium tracking-tight text-foreground">{toast.message}</p>
          </div>
          <button
            type="button"
            className="ms-auto grid size-7 shrink-0 place-items-center rounded-full text-muted hover:bg-surface hover:text-foreground"
            onClick={() => {
              setVisible(false);
              window.setTimeout(() => setToast(null), 200);
            }}
            aria-label="Dismiss"
          >
            <svg viewBox="0 0 24 24" className="size-3.5" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
