"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { buttonClass, goldHoverClass } from "@/components/ui/button";
import { SelectDropdown } from "@/components/ui/select-dropdown";
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          className="flex w-full min-w-0 flex-1 items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            update({ q: String(data.get("q") || "").trim() });
          }}
        >
          <label className="sr-only" htmlFor="project-search">
            {t("search")}
          </label>
          <input
            id="project-search"
            name="q"
            key={query}
            defaultValue={query}
            placeholder={t("search")}
            className="h-10 min-w-0 flex-1 rounded-full border border-border bg-background px-4 text-sm sm:max-w-md"
          />
          <button type="submit" className={buttonClass("dark", cn(goldHoverClass, "h-10 shrink-0 px-4"))}>
            {t("searchAction")}
          </button>
        </form>
        <SelectDropdown
          label={t("status")}
          value={status}
          onChange={(next) => update({ status: next })}
          className="w-full shrink-0 sm:w-52"
          triggerClassName="h-10 rounded-full border border-border bg-background px-4 text-sm"
          menuClassName="overflow-hidden rounded-2xl border border-border bg-background shadow-[var(--shadow)]"
          options={[
            { value: "all", label: t("status") },
            { value: "planning", label: t("planning") },
            { value: "in_progress", label: t("in_progress") },
            { value: "completed", label: t("completed") },
          ]}
        />
      </div>
    </div>
  );
}
