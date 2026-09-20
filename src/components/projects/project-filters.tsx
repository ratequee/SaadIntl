"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

export function ProjectFilters({
  categories,
  locale,
}: {
  categories: Category[];
  locale: string;
}) {
  const t = useTranslations("projects");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("category") || "all";
  const status = params.get("status") || "all";
  const query = params.get("q") || "";

  function update(next: Record<string, string>) {
    const search = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (!value || value === "all") search.delete(key);
      else search.set(key, value);
    });
    const qs = search.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
      <div className="flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="project-search">
          {t("search")}
        </label>
        <input
          id="project-search"
          defaultValue={query}
          onChange={(event) => update({ q: event.target.value })}
          placeholder={t("search")}
          className="rounded-full border border-border bg-background px-4 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(event) => update({ status: event.target.value })}
          className="rounded-full border border-border bg-background px-4 py-2 text-sm"
          aria-label={t("status")}
        >
          <option value="all">{t("status")}</option>
          <option value="planning">{t("planning")}</option>
          <option value="in_progress">{t("in_progress")}</option>
          <option value="completed">{t("completed")}</option>
        </select>
      </div>
    </div>
  );
}
