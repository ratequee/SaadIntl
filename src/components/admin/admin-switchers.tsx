"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export function AdminSwitchers({
  tone = "surface",
}: {
  tone?: "surface" | "ink";
}) {
  const locale = useLocale();
  const router = useRouter();
  const onInk = tone === "ink";

  function choose(next: "en" | "ar") {
    if (next === locale) return;
    document.cookie = `SIP_LOCALE=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1">
      <div
        className={cn(
          "flex items-center rounded-full p-0.5",
          onInk ? "bg-white/10" : "bg-surface",
        )}
        role="group"
        aria-label="Language"
      >
        <button
          type="button"
          onClick={() => choose("en")}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors",
            locale === "en"
              ? "bg-gold text-espresso"
              : onInk
                ? "text-cream/70 hover:text-cream"
                : "text-muted hover:text-foreground",
          )}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => choose("ar")}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors",
            locale === "ar"
              ? "bg-gold text-espresso"
              : onInk
                ? "text-cream/70 hover:text-cream"
                : "text-muted hover:text-foreground",
          )}
        >
          AR
        </button>
      </div>
      <ThemeToggle
        className={
          onInk
            ? "text-cream hover:bg-white/10"
            : undefined
        }
      />
    </div>
  );
}
