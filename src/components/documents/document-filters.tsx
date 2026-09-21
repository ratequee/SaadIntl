"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { buttonClass, goldHoverClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

export function DocumentFilters({
  categories,
  locale,
}: {
  categories: Category[];
  locale: string;
}) {
  const t = useTranslations("documents");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("category") || "all";
  const query = params.get("q") || "";

  function update(next: Record<string, string>) {
    const search = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (!value || value === "all") search.delete(key);
      else search.set(key, value);
    });
    search.delete("page");
    const qs = search.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {[{ slug: "all", name: { en: t("all"), ar: t("all") } }, ...categories].map((item) => (
          <button
            key={item.slug}
            type="button"
            onClick={() => update({ category: item.slug })}
            className={cn(
              "rounded-full border border-border px-4 py-2 text-sm",
              current === item.slug ? "bg-ink text-cream dark:bg-cream dark:text-ink" : "hover:bg-surface",
            )}
          >
            {locale === "ar" ? item.name.ar : item.name.en}
          </button>
        ))}
      </div>
      <form
        className="flex min-w-0 flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          update({ q: String(data.get("q") || "").trim() });
        }}
      >
        <label className="sr-only" htmlFor="document-search">
          {t("search")}
        </label>
        <input
          id="document-search"
          name="q"
          key={query}
          defaultValue={query}
          placeholder={t("search")}
          className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm sm:max-w-md"
        />
        <button type="submit" className={buttonClass("dark", cn(goldHoverClass, "px-4 py-2"))}>
          {t("searchAction")}
        </button>
      </form>
    </div>
  );
}
