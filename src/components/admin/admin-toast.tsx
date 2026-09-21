"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { isAdminNotice, type AdminNotice } from "@/lib/admin-notice";

type Tone = "success" | "error";

type Toast = {
  message: string;
  tone: Tone;
};

export function isNextRedirect(err: unknown) {
  if (!err || typeof err !== "object") return false;
  const digest = "digest" in err ? String((err as { digest?: string }).digest || "") : "";
  const message = err instanceof Error ? err.message : "";
  return digest.includes("NEXT_REDIRECT") || message.includes("NEXT_REDIRECT");
}

export function pushAdminToast(message: string, tone: Tone = "success") {
  window.dispatchEvent(new CustomEvent("sip:toast", { detail: { message, tone } }));
}

export function reportAdminForm(
  form: HTMLFormElement,
  messages?: {
    fieldRequired: (name: string) => string;
    requiredFields: string;
  },
) {
  if (form.checkValidity()) return true;
  form.reportValidity();
  const field = form.querySelector(":invalid");
  const labeled = field?.closest("label, div")?.querySelector("span.font-medium, p.text-sm.font-medium");
  const name = labeled?.textContent?.replace(/\*/g, "").trim();
  pushAdminToast(
    name
      ? messages?.fieldRequired(name) || `${name} is required.`
      : messages?.requiredFields || "Please fill in the required fields.",
    "error",
  );
  return false;
}

export function AdminToast() {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [toast, setToast] = useState<Toast | null>(null);
  const [visible, setVisible] = useState(false);
  const shownNotice = useRef("");

  useEffect(() => {
    const key = searchParams.get("notice");
    if (!isAdminNotice(key)) {
      shownNotice.current = "";
      return;
    }
    if (shownNotice.current === `${pathname}:${key}`) return;
    shownNotice.current = `${pathname}:${key}`;
    setToast({ message: t(`notice.${key as AdminNotice}`), tone: "success" });
    const params = new URLSearchParams(searchParams.toString());
    params.delete("notice");
    const query = params.toString();
    window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
  }, [pathname, searchParams, t]);

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
          toast.tone === "error" ? "border-red-700/20" : "border-[color-mix(in_srgb,var(--gold)_45%,transparent)]"
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
                <path d="m7 12.5 3.2 3.2L17 8.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
            aria-label={t("dismiss")}
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
